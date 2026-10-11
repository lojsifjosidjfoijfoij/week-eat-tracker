import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useToast } from "@/contexts/ToastContext";
import { syncWidget } from "@/lib/sharedStorage";
import { EXTRAS_DAY, useWeekPlan } from "@/lib/useWeekPlan";
import { todayIndex, weekDates } from "@/lib/week";
import { haptic } from "@/lib/haptics";
import BottomBar from "./BottomBar";
import ConfirmDialog from "./ConfirmDialog";
import DaySheet from "./DaySheet";
import ShoppingList from "./ShoppingList";
import TonightCard, { type SheetIntent } from "./TonightCard";
import WeekList from "./WeekList";
import WeekStrip from "./WeekStrip";

const PULL_THRESHOLD = 64;

const WeeklyPlanner = () => {
  const { user } = useAuth();
  const { family, familyId, members, refresh: refreshFamily } = useFamily();
  const { t, f, days, language } = useLanguage();
  const { isPremium, familyPremium, isLoading: premiumLoading, openPaywall } = usePremium();
  const toast = useToast();

  // Family sharing is a dinrr+ feature: without it the family plan is read-only
  const sharingPaused = !!familyId && !premiumLoading && !familyPremium && !isPremium;

  const onError = useCallback((kind: "save" | "load") => {
    if (kind === "save") {
      toast({ title: t.saveFailed, variant: "error" });
      refreshFamily(); // maybe we were removed from the family
    }
  }, [toast, t.saveFailed, refreshFamily]);

  const api = useWeekPlan({ userId: user!.id, familyId, readOnly: sharingPaused, onError });
  const { plan } = api;

  // Stable callbacks so the sheet and rows don't re-render on every keystroke
  const apiRef = useRef(api);
  useEffect(() => { apiRef.current = api; });
  const onMealChange = useCallback((d: number, m: string) => apiRef.current.setMeal(d, m), []);
  const onMealCommit = useCallback((d: number) => apiRef.current.flushMeal(d), []);
  const onAddIngredients = useCallback((d: number, names: string[]) => { apiRef.current.addItems(d, names); }, []);
  const onToggle = useCallback((id: string) => apiRef.current.toggleItem(id), []);
  const onDelete = useCallback((id: string) => { apiRef.current.removeItem(id); }, []);

  const [sheet, setSheet] = useState<{ day: number; intent: SheetIntent; key: number } | null>(null);
  const openDay = useCallback((day: number, intent?: SheetIntent) => {
    haptic.tap();
    setSheet({ day, intent, key: Date.now() });
  }, []);
  const onSwap = useCallback(async (from: number, to: number) => {
    const ok = await apiRef.current.swapDays(from, to);
    if (ok) {
      haptic.success();
      toast({ title: f(t.swappedWith, { day: days[to] }) });
      setSheet((s) => (s ? { ...s, day: to, intent: undefined } : s)); // follow the dinner
    }
    return ok;
  }, [toast, f, t.swappedWith, days]);

  const [showShopping, setShowShopping] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Today / this week's dates, refreshed when the app comes back after midnight
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow((prev) => (new Date().toDateString() === prev.toDateString() ? prev : new Date()));
    const id = window.setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, []);
  const today = todayIndex(now);
  const dates = useMemo(() => weekDates(now), [now]);

  // Home-screen widget shows tonight's meal
  const meals = plan.days.map((d) => d.meal);
  const mealsKey = meals.join("\u0000");
  useEffect(() => { syncWidget(mealsKey.split("\u0000"), language); }, [mealsKey, language]);

  // ── Pull to refresh (family only) ──────────────────────────
  const pullStart = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollTop = () => document.getElementById("root")?.scrollTop ?? 0;

  const onTouchStart = (e: React.TouchEvent) => {
    pullStart.current = familyId && !sheet && !showShopping && scrollTop() <= 0 ? e.touches[0].clientY : null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (pullStart.current === null) return;
    if (scrollTop() > 0) { pullStart.current = null; setPull(0); return; }
    const delta = e.touches[0].clientY - pullStart.current;
    setPull(delta > 0 ? Math.min(delta, PULL_THRESHOLD * 1.5) : 0);
  };
  const onTouchEnd = async () => {
    const shouldRefresh = pull >= PULL_THRESHOLD;
    pullStart.current = null;
    setPull(0);
    if (!shouldRefresh) return;
    haptic.tap();
    setRefreshing(true);
    await Promise.all([api.refetch(), refreshFamily()]);
    setRefreshing(false);
  };

  const handleReset = async () => {
    setResetting(true);
    const ok = await api.resetWeek();
    setResetting(false);
    setConfirmReset(false);
    if (ok) haptic.success();
  };

  const openCount =
    plan.days.reduce((n, d) => n + d.ingredients.filter((i) => !i.checked).length, 0) +
    plan.extras.filter((e) => !e.checked).length;
  const hasPlan = plan.days.some((d) => d.meal.trim() || d.ingredients.length);
  const live = !!family && !sharingPaused;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {(pull > 0 || refreshing) && (
        <div
          className="pull-indicator"
          style={{
            height: refreshing ? 40 : Math.min(pull * 0.5, 40),
            opacity: refreshing ? 1 : Math.min(pull / PULL_THRESHOLD, 1),
          }}
        >
          <RefreshCw
            size={18}
            style={{
              animation: refreshing ? "spin 0.7s linear infinite" : undefined,
              transform: refreshing ? undefined : `rotate(${pull * 3}deg)`,
            }}
          />
        </div>
      )}

      {sharingPaused && (
        <button className="paused-banner" onClick={openPaywall}>
          <span>{t.familyPremiumPaused}</span>
          <span className="paused-banner__cta">{t.upgrade}</span>
        </button>
      )}

      <WeekStrip dates={dates} today={today} meals={meals} onOpen={openDay} />

      {api.loadingFamily && <p className="sync-note">{t.syncingWithFamily}</p>}

      <TonightCard today={today} day={plan.days[today]} readOnly={sharingPaused} canSuggest={isPremium} onOpen={openDay} />

      <WeekList
        plan={plan.days}
        today={today}
        readOnly={sharingPaused}
        onOpen={openDay}
        onReset={!sharingPaused && hasPlan ? () => setConfirmReset(true) : undefined}
      />

      <BottomBar
        members={members}
        myId={user!.id}
        familyName={family?.name ?? null}
        live={live}
        openCount={openCount}
        onShop={() => { haptic.tap(); setShowShopping(true); }}
      />

      {sheet && (
        <DaySheet
          key={sheet.key}
          dayIndex={sheet.day}
          date={dates[sheet.day]}
          day={plan.days[sheet.day]}
          readOnly={sharingPaused}
          intent={sheet.intent}
          onClose={() => setSheet(null)}
          onMealChange={onMealChange}
          onMealCommit={onMealCommit}
          onAddIngredients={onAddIngredients}
          onToggle={onToggle}
          onDelete={onDelete}
          onSwap={onSwap}
        />
      )}

      {showShopping && (
        <ShoppingList
          plan={plan}
          readOnly={sharingPaused}
          liveWith={live ? family!.name : null}
          onClose={() => setShowShopping(false)}
          onSetChecked={api.setChecked}
          onAddExtra={(name) => api.addItems(EXTRAS_DAY, [name])}
          onDeleteExtra={api.removeItem}
        />
      )}

      {confirmReset && (
        <ConfirmDialog
          title={t.resetWeek}
          body={<p>{family ? f(t.confirmResetFamily, { family: family.name }) : t.confirmReset}</p>}
          confirmLabel={t.resetWeek}
          cancelLabel={t.cancel}
          busy={resetting}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
};

export default WeeklyPlanner;
