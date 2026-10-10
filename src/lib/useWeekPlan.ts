import { useCallback, useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { newId, rpc, supabase } from "@/lib/supabase";
import { safeLocal } from "@/lib/storage";

export type Item = { id: string; name: string; checked: boolean };
export type Day = { meal: string; ingredients: Item[] };
export type Plan = { days: Day[]; extras: Item[] };

/** day_index used for shopping-list extras (toilet paper etc.) */
export const EXTRAS_DAY = 7;
const MEAL_SAVE_DELAY = 600;

export const emptyPlan = (): Plan => ({
  days: Array.from({ length: 7 }, () => ({ meal: "", ingredients: [] })),
  extras: [],
});

const hasContent = (p: Plan) => p.extras.length > 0 || p.days.some((d) => d.meal.trim() || d.ingredients.length);

function normalisePlan(raw: unknown): Plan {
  const p = emptyPlan();
  const r = raw as Partial<Plan> | null;
  if (!r || !Array.isArray(r.days)) return p;
  r.days.slice(0, 7).forEach((d, i) => {
    p.days[i] = {
      meal: typeof d?.meal === "string" ? d.meal : "",
      ingredients: Array.isArray(d?.ingredients) ? d.ingredients.filter((x) => x && typeof x.name === "string") : [],
    };
  });
  p.extras = Array.isArray(r.extras) ? r.extras.filter((x) => x && typeof x.name === "string") : [];
  return p;
}

/** Local (no family) plan for this user. Imports the pre-1.1 format once. */
function loadLocalPlan(userId: string): Plan {
  const key = `dinrr:plan:${userId}`;
  const stored = safeLocal.get(key);
  if (stored) return normalisePlan(safeLocal.getJSON(key, null));

  const legacy = safeLocal.getJSON<Record<string, { meal?: string; ingredients?: Item[] }> | null>("mealWeekPlanner", null);
  const legacyExtras = safeLocal.getJSON<Item[]>("dinrr_extras", []);
  const plan = emptyPlan();
  if (legacy) {
    for (let i = 0; i < 7; i++) {
      const d = legacy[i] ?? legacy[String(i)];
      if (d) plan.days[i] = { meal: d.meal ?? "", ingredients: Array.isArray(d.ingredients) ? d.ingredients : [] };
    }
  }
  plan.extras = Array.isArray(legacyExtras) ? legacyExtras : [];
  safeLocal.remove("mealWeekPlanner");
  safeLocal.remove("dinrr_extras");
  safeLocal.setJSON(key, plan);
  return plan;
}

type Row = { id: string; day_index: number; name?: string; checked?: boolean; meal?: string; created_at?: string };

type Options = {
  userId: string;
  familyId: string | null;
  readOnly: boolean;
  onError: (kind: "save" | "load") => void;
};

export function useWeekPlan({ userId, familyId, readOnly, onError }: Options) {
  const familyCacheKey = `dinrr:familyPlan:${userId}`;

  const initial = (): Plan => {
    if (!familyId) return loadLocalPlan(userId);
    const cached = safeLocal.getJSON<{ familyId: string; plan: Plan } | null>(familyCacheKey, null);
    return cached?.familyId === familyId ? normalisePlan(cached.plan) : emptyPlan();
  };

  const [plan, setPlan] = useState<Plan>(initial);
  const [loadedFamilyId, setLoadedFamilyId] = useState<string | null>(null);
  const [mode, setMode] = useState<string>(familyId ?? "local");

  // Track writes in flight so realtime refreshes don't undo what the user just did
  const pendingOps = useRef(new Map<string, "insert" | "update" | "delete">());
  const mealTimers = useRef(new Map<number, number>());
  const mealVersions = useRef<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const knownMealRowIds = useRef(new Set<string>());
  const knownItemIds = useRef(new Set<string>());
  const refetchTimer = useRef<number | undefined>(undefined);
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  // Switching between local ↔ family (or between families): reload
  if (mode !== (familyId ?? "local")) {
    setMode(familyId ?? "local");
    setPlan(initial());
  }

  // ── Fetch + merge ──────────────────────────────────────────
  const fetchFamilyPlan = useCallback(async (fid: string): Promise<Plan | null> => {
    const [meals, items] = await Promise.all([
      supabase.from("meal_plans").select("*").eq("family_id", fid),
      supabase.from("ingredients").select("*").eq("family_id", fid),
    ]);
    if (meals.error || items.error) {
      console.warn("Loading family plan failed", meals.error ?? items.error);
      return null;
    }
    const p = emptyPlan();
    knownMealRowIds.current = new Set();
    knownItemIds.current = new Set();
    (meals.data as Row[]).forEach((m) => {
      knownMealRowIds.current.add(m.id);
      if (m.day_index >= 0 && m.day_index < 7) p.days[m.day_index].meal = m.meal ?? "";
    });
    (items.data as Row[])
      .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""))
      .forEach((r) => {
        knownItemIds.current.add(r.id);
        const item = { id: r.id, name: r.name ?? "", checked: !!r.checked };
        if (r.day_index === EXTRAS_DAY) p.extras.push(item);
        else if (r.day_index >= 0 && r.day_index < 7) p.days[r.day_index].ingredients.push(item);
      });
    return p;
  }, []);

  const merge = useCallback((server: Plan, local: Plan): Plan => {
    const pending = pendingOps.current;
    const mergeList = (s: Item[], l: Item[]) => {
      const out = s
        .filter((it) => pending.get(it.id) !== "delete")
        .map((it) => (pending.get(it.id) === "update" ? l.find((x) => x.id === it.id) ?? it : it));
      l.forEach((it) => {
        if (pending.get(it.id) === "insert" && !out.some((x) => x.id === it.id)) out.push(it);
      });
      return out;
    };
    return {
      days: server.days.map((d, i) => ({
        meal: mealTimers.current.has(i) ? local.days[i].meal : d.meal,
        ingredients: mergeList(d.ingredients, local.days[i].ingredients),
      })),
      extras: mergeList(server.extras, local.extras),
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!familyId) return;
    const server = await fetchFamilyPlan(familyId);
    if (!server) {
      onErrorRef.current("load");
      return;
    }
    setPlan((local) => merge(server, local));
  }, [familyId, fetchFamilyPlan, merge]);

  const scheduleRefetch = useCallback(() => {
    window.clearTimeout(refetchTimer.current);
    refetchTimer.current = window.setTimeout(() => { refetch(); }, 250);
  }, [refetch]);

  // First load of a family
  useEffect(() => {
    if (!familyId) return;
    let cancelled = false;
    (async () => {
      const server = await fetchFamilyPlan(familyId);
      if (cancelled) return;
      setLoadedFamilyId(familyId);
      if (!server) {
        onErrorRef.current("load");
        return;
      }
      setPlan((current) => merge(server, current));
    })();
    return () => { cancelled = true; };
  }, [familyId, fetchFamilyPlan, merge]);

  // Live sync
  useEffect(() => {
    if (!familyId) return;
    const filter = `family_id=eq.${familyId}`;
    const channel = supabase
      .channel(`plan:${familyId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "meal_plans", filter }, scheduleRefetch)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "meal_plans", filter }, scheduleRefetch)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ingredients", filter }, scheduleRefetch)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "ingredients", filter }, scheduleRefetch)
      // DELETE events can't be filtered by family — only react to rows we know about
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "ingredients" }, (p) => {
        const id = (p.old as { id?: string })?.id;
        if (id && knownItemIds.current.has(id) && !pendingOps.current.has(id)) scheduleRefetch();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "meal_plans" }, (p) => {
        const id = (p.old as { id?: string })?.id;
        if (id && knownMealRowIds.current.has(id)) scheduleRefetch();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") scheduleRefetch(); // catch up after (re)connecting
      });

    const onOnline = () => scheduleRefetch();
    window.addEventListener("online", onOnline);
    const resume = Capacitor.isNativePlatform() ? App.addListener("resume", () => scheduleRefetch()) : null;

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("online", onOnline);
      resume?.then((h) => h.remove());
      window.clearTimeout(refetchTimer.current);
    };
  }, [familyId, scheduleRefetch]);

  // Persist
  useEffect(() => {
    if (familyId) safeLocal.setJSON(familyCacheKey, { familyId, plan });
    else safeLocal.setJSON(`dinrr:plan:${userId}`, plan);
  }, [plan, familyId, userId, familyCacheKey]);

  // Save typed-but-unsaved meals right away when the app goes to the background
  // (iOS pauses timers in the background, so the debounce might never fire).
  const latestPlan = useRef(plan);
  useEffect(() => { latestPlan.current = plan; }, [plan]);
  const flushAllRef = useRef<() => void>(() => {});
  useEffect(() => {
    const flush = () => flushAllRef.current();
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onVisibility);
    const pause = Capacitor.isNativePlatform() ? App.addListener("pause", flush) : null;
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      pause?.then((h) => h.remove());
    };
  }, []);

  // ── Helpers ────────────────────────────────────────────────
  const updateItem = (p: Plan, id: string, fn: (it: Item) => Item | null): Plan => {
    const apply = (list: Item[]) =>
      list.flatMap((it) => {
        if (it.id !== id) return [it];
        const r = fn(it);
        return r ? [r] : [];
      });
    return { days: p.days.map((d) => ({ ...d, ingredients: apply(d.ingredients) })), extras: apply(p.extras) };
  };

  const findItem = (p: Plan, id: string): { item: Item; day: number; index: number } | null => {
    for (let d = 0; d < 7; d++) {
      const index = p.days[d].ingredients.findIndex((x) => x.id === id);
      if (index >= 0) return { item: p.days[d].ingredients[index], day: d, index };
    }
    const index = p.extras.findIndex((x) => x.id === id);
    return index >= 0 ? { item: p.extras[index], day: EXTRAS_DAY, index } : null;
  };

  const track = async (ids: string[], kind: "insert" | "update" | "delete", op: () => PromiseLike<{ error: unknown }>) => {
    ids.forEach((id) => pendingOps.current.set(id, kind));
    try {
      const { error } = await op();
      if (error) throw error;
      if (kind === "insert") ids.forEach((id) => knownItemIds.current.add(id));
      return true;
    } catch (e) {
      console.warn(`ingredient ${kind} failed`, e);
      onErrorRef.current("save");
      return false;
    } finally {
      ids.forEach((id) => pendingOps.current.delete(id));
    }
  };

  const saveMeal = async (day: number, meal: string) => {
    if (!familyId) return;
    const version = mealVersions.current[day];
    const { error } = await supabase
      .from("meal_plans")
      .upsert({ family_id: familyId, day_index: day, meal: meal.slice(0, 200) }, { onConflict: "family_id,day_index" });
    if (mealVersions.current[day] === version) mealTimers.current.delete(day);
    if (error) {
      console.warn("meal save failed", error);
      onErrorRef.current("save");
    }
  };

  // ── Public actions ─────────────────────────────────────────
  const setMeal = (day: number, meal: string) => {
    if (readOnly) return;
    setPlan((p) => ({ ...p, days: p.days.map((d, i) => (i === day ? { ...d, meal } : d)) }));
    if (!familyId) return;
    mealVersions.current[day]++;
    window.clearTimeout(mealTimers.current.get(day));
    mealTimers.current.set(day, window.setTimeout(() => saveMeal(day, meal), MEAL_SAVE_DELAY));
  };

  const flushMeal = (day: number) => {
    if (!familyId || !mealTimers.current.has(day)) return;
    window.clearTimeout(mealTimers.current.get(day));
    saveMeal(day, latestPlan.current.days[day].meal);
  };
  useEffect(() => {
    flushAllRef.current = () => { [...mealTimers.current.keys()].forEach(flushMeal); };
  });

  /** day 0–6, or EXTRAS_DAY for the shopping list */
  const addItems = async (day: number, names: string[]) => {
    if (readOnly) return;
    const items = names
      .map((n) => n.trim().slice(0, 120))
      .filter(Boolean)
      .map((name) => ({ id: newId(), name, checked: false }));
    if (!items.length) return;
    setPlan((p) =>
      day === EXTRAS_DAY
        ? { ...p, extras: [...p.extras, ...items] }
        : { ...p, days: p.days.map((d, i) => (i === day ? { ...d, ingredients: [...d.ingredients, ...items] } : d)) },
    );
    if (!familyId) return;
    const ok = await track(items.map((i) => i.id), "insert", () =>
      supabase.from("ingredients").insert(items.map((it) => ({ ...it, family_id: familyId, day_index: day }))),
    );
    if (!ok) {
      const ids = new Set(items.map((i) => i.id));
      setPlan((p) => ({
        days: p.days.map((d) => ({ ...d, ingredients: d.ingredients.filter((x) => !ids.has(x.id)) })),
        extras: p.extras.filter((x) => !ids.has(x.id)),
      }));
    }
  };

  /** Sets items to checked/unchecked (several at once for grouped shopping-list rows). */
  const setChecked = async (ids: string[], checked: boolean) => {
    if (readOnly || !ids.length) return;
    const before = new Map<string, boolean>();
    ids.forEach((id) => { const f = findItem(plan, id); if (f) before.set(id, f.item.checked); });
    setPlan((p) => ids.reduce((acc, id) => updateItem(acc, id, (it) => ({ ...it, checked })), p));
    if (!familyId) return;
    const ok = await track(ids, "update", () => supabase.from("ingredients").update({ checked }).in("id", ids));
    if (!ok) setPlan((p) => ids.reduce((acc, id) => updateItem(acc, id, (it) => ({ ...it, checked: before.get(id) ?? it.checked })), p));
  };

  const toggleItem = (id: string) => {
    const f = findItem(plan, id);
    if (f) setChecked([id], !f.item.checked);
  };

  const removeItem = async (id: string) => {
    if (readOnly) return;
    const f = findItem(plan, id);
    if (!f) return;
    setPlan((p) => updateItem(p, id, () => null));
    if (!familyId) return;
    const ok = await track([id], "delete", () => supabase.from("ingredients").delete().eq("id", id));
    if (!ok) {
      setPlan((p) => {
        if (f.day === EXTRAS_DAY) {
          const extras = [...p.extras];
          extras.splice(f.index, 0, f.item);
          return { ...p, extras };
        }
        return {
          ...p,
          days: p.days.map((d, i) => {
            if (i !== f.day) return d;
            const ingredients = [...d.ingredients];
            ingredients.splice(f.index, 0, f.item);
            return { ...d, ingredients };
          }),
        };
      });
    }
  };

  const resetWeek = async (): Promise<boolean> => {
    if (readOnly) return false;
    if (familyId) {
      const res = await rpc("reset_family_week");
      if (!res.ok) {
        onErrorRef.current("save");
        return false;
      }
    }
    mealTimers.current.forEach((t) => window.clearTimeout(t));
    mealTimers.current.clear();
    setPlan((p) => ({ ...emptyPlan(), extras: p.extras }));
    return true;
  };

  return {
    plan,
    /** first load of a family with nothing cached to show yet */
    loadingFamily: !!familyId && loadedFamilyId !== familyId && !hasContent(plan),
    refetch,
    setMeal,
    flushMeal,
    addItems,
    toggleItem,
    setChecked,
    removeItem,
    resetWeek,
  };
}

/**
 * Moves the user's solo plan into a family they just created, so nothing they
 * planned is lost. Only called right after create_family (the family is empty).
 */
export async function moveLocalPlanIntoFamily(userId: string, familyId: string): Promise<void> {
  const local = loadLocalPlan(userId);
  if (!hasContent(local)) return;
  if (await uploadPlan(familyId, local)) safeLocal.setJSON(`dinrr:plan:${userId}`, emptyPlan());
}

async function uploadPlan(familyId: string, plan: Plan): Promise<boolean> {
  const meals = plan.days
    .map((d, i) => ({ family_id: familyId, day_index: i, meal: d.meal.trim().slice(0, 200) }))
    .filter((m) => m.meal);
  const items = [
    ...plan.days.flatMap((d, i) =>
      d.ingredients.map((it) => ({ id: newId(), family_id: familyId, day_index: i, name: it.name.slice(0, 120), checked: it.checked })),
    ),
    ...plan.extras.map((it) => ({ id: newId(), family_id: familyId, day_index: EXTRAS_DAY, name: it.name.slice(0, 120), checked: it.checked })),
  ];
  if (meals.length) {
    const { error } = await supabase.from("meal_plans").upsert(meals, { onConflict: "family_id,day_index" });
    if (error) return false;
  }
  if (items.length) {
    const { error } = await supabase.from("ingredients").insert(items);
    if (error) return false;
  }
  return true;
}
