import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AISLE_ORDER, detectAisle, type AisleKey } from "@/lib/aisles";
import { haptic } from "@/lib/haptics";
import { safeLocal } from "@/lib/storage";
import type { Item, Plan } from "@/lib/useWeekPlan";

type Props = {
  plan: Plan;
  readOnly: boolean;
  onClose: () => void;
  onSetChecked: (ids: string[], checked: boolean) => void;
  onAddExtra: (name: string) => void;
  onDeleteExtra: (id: string) => void;
};

type Group = { key: string; name: string; dayIndexes: number[]; ids: string[]; checked: boolean; extraId?: string };
type SortMode = "aisle" | "day";
const SORT_KEY = "dinrr:shoppingSort";

const ShoppingList = ({ plan, readOnly, onClose, onSetChecked, onAddExtra, onDeleteExtra }: Props) => {
  const { t, days } = useLanguage();
  const [sortMode, setSortMode] = useState<SortMode>(() => (safeLocal.get(SORT_KEY) === "day" ? "day" : "aisle"));
  const [newExtra, setNewExtra] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { safeLocal.set(SORT_KEY, sortMode); }, [sortMode]);

  // Close on Escape (hardware keyboards / simulator)
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

  const byAisle = useMemo(() => {
    const map = new Map<AisleKey, Group[]>();
    open.forEach((g) => {
      const k = detectAisle(g.name);
      map.set(k, [...(map.get(k) ?? []), g]);
    });
    return AISLE_ORDER.filter((k) => map.has(k)).map((k) => [k, map.get(k)!] as const);
  }, [open]);

  const byDay = useMemo(() => {
    const sections: { label: string; groups: Group[] }[] = [];
    const extrasOpen = open.filter((g) => g.extraId);
    if (extrasOpen.length) sections.push({ label: t.extras, groups: extrasOpen });
    days.forEach((label, dayIndex) => {
      const groups = mealGroups.filter((g) => !g.checked && g.dayIndexes.includes(dayIndex));
      if (groups.length) sections.push({ label, groups });
    });
    return sections;
  }, [open, mealGroups, days, t.extras]);

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

  const Row = ({ g, hideDays = false }: { g: Group; hideDays?: boolean }) => (
    <div className={`shopping-row${g.checked ? " is-checked" : ""}`}>
      <button className="shopping-row__main" onClick={() => toggle(g)} aria-pressed={g.checked} disabled={readOnly}>
        <span className={`shopping-circle${g.checked ? " is-checked" : ""}`} aria-hidden />
        <span className="shopping-row__info">
          <span className="shopping-row__name">{g.name}</span>
          {!g.checked && !hideDays && g.dayIndexes.length > 0 && (
            <span className="shopping-row__tags">
              {g.dayIndexes.map((d) => <span key={d} className="shopping-row__tag">{days[d]}</span>)}
            </span>
          )}
        </span>
        {!g.checked && g.ids.length > 1 && <span className="shopping-row__qty">×{g.ids.length}</span>}
      </button>
      {g.extraId && !readOnly && (
        <button className="ingredient-delete" onClick={() => onDeleteExtra(g.extraId!)} aria-label={`${t.remove} ${g.name}`}>
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );

  return (
    <div className="sheet-overlay" onClick={onClose} role="presentation">
      <div className="sheet" role="dialog" aria-modal="true" aria-label={t.shoppingList} onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />

        <div className="sheet__hd">
          <div>
            <h2 className="sheet__title">{t.shoppingList}</h2>
            <p className="sheet__sub">{inBasket.length}/{all.length} {t.inBasket}</p>
          </div>
          <button className="sheet__close" onClick={onClose} aria-label={t.close}>
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {all.length > 0 && (
          <div className="sort-toggle-bar">
            <div className="sort-toggle" role="tablist">
              <button role="tab" aria-selected={sortMode === "aisle"} className={`sort-toggle__btn${sortMode === "aisle" ? " is-active" : ""}`} onClick={() => setSortMode("aisle")}>
                {t.sortByAisle}
              </button>
              <button role="tab" aria-selected={sortMode === "day"} className={`sort-toggle__btn${sortMode === "day" ? " is-active" : ""}`} onClick={() => setSortMode("day")}>
                {t.sortByDay}
              </button>
            </div>
          </div>
        )}

        <div className="sheet__body">
          {all.length === 0 ? (
            <div className="shopping-empty">
              <p>{t.noIngredientsYet}</p>
              <p>{t.addMealsFirst}</p>
            </div>
          ) : (
            <>
              {sortMode === "aisle"
                ? byAisle.map(([key, groups]) => (
                    <div key={key}>
                      <div className="shopping-divider"><span>{t[key]}</span></div>
                      {groups.map((g) => <Row key={g.key} g={g} />)}
                    </div>
                  ))
                : byDay.map((s) => (
                    <div key={s.label}>
                      <div className="shopping-divider"><span>{s.label}</span></div>
                      {s.groups.map((g) => <Row key={`${s.label}-${g.key}`} g={g} hideDays />)}
                    </div>
                  ))}

              {inBasket.length > 0 && open.length > 0 && (
                <div className="shopping-divider"><span>{t.inBasket}</span></div>
              )}
              {inBasket.map((g) => <Row key={`done-${g.key}`} g={g} />)}

              {allDone && (
                <div className="shopping-complete">
                  <p>{t.allDone}</p>
                  <p>{t.allSetForWeek}</p>
                </div>
              )}
            </>
          )}
        </div>

        {!readOnly && (
          <div className="sheet__add-bar">
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
            <button onClick={addExtra} aria-label={t.addToList} disabled={!newExtra.trim()}>
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
