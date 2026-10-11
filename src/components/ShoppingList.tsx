import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AISLE_ORDER, detectAisle, type AisleKey } from "@/lib/aisles";
import { haptic } from "@/lib/haptics";
import { safeLocal } from "@/lib/storage";
import type { Item, Plan } from "@/lib/useWeekPlan";

type Props = {
  plan: Plan;
  readOnly: boolean;
  liveWith: string | null;
  onClose: () => void;
  onSetChecked: (ids: string[], checked: boolean) => void;
  onAddExtra: (name: string) => void;
  onDeleteExtra: (id: string) => void;
};

type Group = { key: string; name: string; dayIndexes: number[]; ids: string[]; checked: boolean; extraId?: string };
type SortMode = "aisle" | "day";
const SORT_KEY = "dinrr:shoppingSort";

/** Full-screen shopping mode: big rows, sorted by aisle, tick off as you go. */
const ShoppingList = ({ plan, readOnly, liveWith, onClose, onSetChecked, onAddExtra, onDeleteExtra }: Props) => {
  const { t, f, days } = useLanguage();
  const [sortMode, setSortMode] = useState<SortMode>(() => (safeLocal.get(SORT_KEY) === "day" ? "day" : "aisle"));
  const [showBasket, setShowBasket] = useState(false);
  const [newExtra, setNewExtra] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => { safeLocal.set(SORT_KEY, sortMode); }, [sortMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Same ingredient on several days = one row with "×2"
  const mealGroups = useMemo(() => {
    const map = new Map<string, Group & { items: Item[] }>();
    plan.days.forEach((d, dayIndex) => {
      d.ingredients.forEach((it) => {
        const key = it.name.trim().toLowerCase();
        const g = map.get(key) ?? { key, name: it.name.trim(), dayIndexes: [], ids: [], checked: true, items: [] };
        if (!g.dayIndexes.includes(dayIndex)) g.dayIndexes.push(dayIndex);
        g.ids.push(it.id);
        g.items.push(it);
        g.checked = g.checked && it.checked;
        map.set(key, g);
      });
    });
    return [...map.values()];
  }, [plan.days]);

  const extraGroups: Group[] = useMemo(
    () => plan.extras.map((e) => ({ key: `x-${e.id}`, name: e.name, dayIndexes: [], ids: [e.id], checked: e.checked, extraId: e.id })),
    [plan.extras],
  );

  const all = [...mealGroups, ...extraGroups];
  const open = all.filter((g) => !g.checked);
  const inBasket = all.filter((g) => g.checked);
  const allDone = all.length > 0 && open.length === 0;

  const sections = (() => {
    if (sortMode === "aisle") {
      const map = new Map<AisleKey, Group[]>();
      open.forEach((g) => {
        const k = detectAisle(g.name);
        map.set(k, [...(map.get(k) ?? []), g]);
      });
      return AISLE_ORDER.filter((k) => map.has(k)).map((k) => ({ key: k as string, label: t[k], groups: map.get(k)!, hideDays: false }));
    }
    const out: { key: string; label: string; groups: Group[]; hideDays: boolean }[] = [];
    days.forEach((label, dayIndex) => {
      const groups = mealGroups.filter((g) => !g.checked && g.dayIndexes.includes(dayIndex));
      if (groups.length) out.push({ key: `d${dayIndex}`, label, groups, hideDays: true });
    });
    const extrasOpen = open.filter((g) => g.extraId);
    if (extrasOpen.length) out.push({ key: "extras", label: t.extras, groups: extrasOpen, hideDays: true });
    return out;
  })();

  const toggle = (g: Group) => {
    if (readOnly) return;
    haptic.tap();
    onSetChecked(g.ids, !g.checked);
  };

  const addExtra = () => {
    const name = newExtra.trim();
    if (!name) return;
    onAddExtra(name);
    setNewExtra("");
    inputRef.current?.focus();
  };

  const toggleBasket = () => {
    const next = !showBasket;
    setShowBasket(next);
    if (next) requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" }));
  };

  const count = (n: number) => (n === 1 ? t.itemsOne : f(t.itemsMany, { n }));

  const row = (g: Group, key: string, hideDays = false) => (
    <div key={key} className={`shop-row${g.checked ? " is-checked" : ""}`}>
      <button className="shop-row__main" onClick={() => toggle(g)} aria-pressed={g.checked} disabled={readOnly}>
        <span className={`check check--lg${g.checked ? " is-checked" : ""}`} aria-hidden />
        <span className="shop-row__info">
          <span className="shop-row__name">{g.name}</span>
          {!g.checked && !hideDays && (
            <span className="shop-row__days">{g.extraId ? t.extras : g.dayIndexes.map((d) => days[d]).join(" · ")}</span>
          )}
        </span>
        {!g.checked && g.ids.length > 1 && <span className="qty-pill">×{g.ids.length}</span>}
      </button>
      {g.extraId && !readOnly && (
        <button className="item-row__delete" onClick={() => onDeleteExtra(g.extraId!)} aria-label={`${t.remove} ${g.name}`}>
          <X size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );

  return (
    <div className="shop-mode" role="dialog" aria-modal="true" aria-label={t.shoppingList}>
      <div className="shop-mode__hd">
        <div className="shop-mode__top">
          <button className="back-btn" onClick={onClose}>
            <ChevronLeft size={14} strokeWidth={2} />
            {t.backToWeek}
          </button>
          {liveWith && (
            <span className="live-chip">
              <span className="live-dot" aria-hidden />
              {f(t.liveWith, { family: liveWith })}
            </span>
          )}
        </div>
        <h2 className="shop-mode__title">{t.shoppingList}</h2>
        {all.length > 0 && (
          <>
            <div className="shop-mode__progress">
              <div className="progress progress--lg" aria-hidden>
                <div className="progress__fill" style={{ width: `${(inBasket.length / all.length) * 100}%` }} />
              </div>
              <span>{f(t.doneCount, { done: inBasket.length, total: all.length })}</span>
            </div>
            <div className="segmented" role="tablist">
              <button role="tab" aria-selected={sortMode === "aisle"} className={`segmented__btn${sortMode === "aisle" ? " is-active" : ""}`} onClick={() => setSortMode("aisle")}>
                {t.sortByAisle}
              </button>
              <button role="tab" aria-selected={sortMode === "day"} className={`segmented__btn${sortMode === "day" ? " is-active" : ""}`} onClick={() => setSortMode("day")}>
                {t.sortByDay}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="shop-mode__body" ref={bodyRef}>
        {all.length === 0 ? (
          <div className="shop-empty">
            <p className="shop-empty__title">{t.noIngredientsYet}</p>
            <p>{t.addMealsFirst}</p>
          </div>
        ) : (
          <>
            {sections.map((s) => (
              <section key={s.key} aria-label={s.label}>
                <div className="shop-section">
                  <span className="shop-section__title">{s.label}</span>
                  <span className="shop-section__count">{count(s.groups.length)}</span>
                </div>
                {s.groups.map((g) => row(g, `${s.key}-${g.key}`, s.hideDays))}
              </section>
            ))}

            {allDone && (
              <div className="shop-empty">
                <p className="shop-empty__title">{t.allDone}</p>
                <p>{t.allSetForWeek}</p>
              </div>
            )}

            {showBasket && inBasket.length > 0 && (
              <section aria-label={t.inBasket}>
                <div className="shop-section">
                  <span className="shop-section__title">{f(t.inBasketSection, { n: inBasket.length })}</span>
                </div>
                {inBasket.map((g) => row(g, `done-${g.key}`))}
              </section>
            )}
          </>
        )}
      </div>

      <div className="shop-mode__ft">
        {inBasket.length > 0 && (
          <button className="basket-btn" onClick={toggleBasket} aria-expanded={showBasket}>
            <span>{f(t.inBasketSection, { n: inBasket.length })}</span>
            <ChevronDown size={16} strokeWidth={2} className={showBasket ? "is-flipped" : undefined} />
          </button>
        )}
        {!readOnly && (
          <div className="add-bar add-bar--flush">
            <label className="add-bar__field">
              <span className="sr-only">{t.addToList}</span>
              <input
                ref={inputRef}
                type="text"
                placeholder={t.addToList}
                value={newExtra}
                maxLength={120}
                enterKeyHint="enter"
                autoComplete="off"
                onChange={(e) => setNewExtra(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addExtra(); }}
              />
            </label>
            <button className="add-bar__btn" onClick={addExtra} aria-label={t.addToList} disabled={!newExtra.trim()}>
              <Plus size={18} strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
