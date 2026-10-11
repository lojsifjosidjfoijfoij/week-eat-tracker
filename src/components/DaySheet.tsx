import { useEffect, useRef, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { ArrowLeftRight, Lock, Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { detectAisle } from "@/lib/aisles";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/lib/supabase";
import type { Day } from "@/lib/useWeekPlan";
import { dayMonth } from "@/lib/week";
import { SparkleIcon } from "./icons";
import type { SheetIntent } from "./TonightCard";

type Props = {
  dayIndex: number;
  date: Date;
  day: Day;
  readOnly: boolean;
  intent?: SheetIntent;
  onClose: () => void;
  onMealChange: (day: number, meal: string) => void;
  onMealCommit: (day: number) => void;
  onAddIngredients: (day: number, names: string[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSwap: (from: number, to: number) => Promise<boolean>;
};

async function functionError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      return typeof body?.error === "string" ? body.error : "unknown";
    } catch {
      return "unknown";
    }
  }
  return "network";
}

/** Bottom sheet for one day: dinner, AI suggestions and ingredients. */
const DaySheet = ({
  dayIndex, date, day, readOnly, intent, onClose,
  onMealChange, onMealCommit, onAddIngredients, onToggle, onDelete, onSwap,
}: Props) => {
  const { t, f, days, language } = useLanguage();
  const { isPremium, openPaywall } = usePremium();

  const [newIngredient, setNewIngredient] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [swapping, setSwapping] = useState(intent === "swap");
  const mealAtFocus = useRef(day.meal);
  const mealInput = useRef<HTMLInputElement>(null);
  const addInput = useRef<HTMLInputElement>(null);

  const meal = day.meal;
  const ingredients = day.ingredients;
  const done = ingredients.filter((i) => i.checked).length;
  const short = t.daysShort.split(",");

  const latest = useRef({ meal, ingredients });
  useEffect(() => { latest.current = { meal, ingredients }; });

  const fetchSuggestions = async (mealName: string) => {
    if (!mealName.trim()) return;
    setLoadingAI(true);
    setAiError("");
    setSuggestions([]);
    const { data, error } = await supabase.functions.invoke("suggest-ingredients", {
      body: { mealName: mealName.trim(), language },
    });
    setLoadingAI(false);
    if (error) {
      const code = await functionError(error);
      if (code === "premium_required") openPaywall();
      else setAiError(code === "daily_limit" ? t.aiDailyLimit : t.aiUnavailable);
      return;
    }
    const list: string[] = Array.isArray(data?.ingredients) ? data.ingredients : [];
    const existing = new Set(latest.current.ingredients.map((i) => i.name.toLowerCase()));
    const fresh = list.filter((n) => !existing.has(n.toLowerCase()));
    if (fresh.length) setSuggestions(fresh);
    else setAiError(t.aiUnavailable);
  };

  // Opened from "Suggest ingredients" on the tonight card / a fresh empty day
  useEffect(() => {
    if (intent === "suggest" && isPremium) fetchSuggestions(latest.current.meal);
    else if (!readOnly && !latest.current.meal.trim() && intent !== "swap") mealInput.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the sheet opens
  }, []);

  // A different day (after a swap) starts with a clean AI state
  const [shownDay, setShownDay] = useState(dayIndex);
  if (shownDay !== dayIndex) {
    setShownDay(dayIndex);
    setSuggestions([]);
    setAiError("");
  }

  const close = () => {
    onMealCommit(dayIndex);
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const commitMeal = () => {
    onMealCommit(dayIndex);
    const changed = meal.trim() && meal.trim() !== mealAtFocus.current.trim();
    if (changed && ingredients.length === 0 && isPremium) fetchSuggestions(meal);
  };

  const addIngredient = () => {
    const name = newIngredient.trim();
    if (!name) return;
    onAddIngredients(dayIndex, [name]);
    setNewIngredient("");
    addInput.current?.focus();
  };

  const addSuggestion = (name: string) => {
    haptic.tap();
    onAddIngredients(dayIndex, [name]);
    setSuggestions((s) => s.filter((x) => x !== name));
  };

  const addAllSuggestions = () => {
    haptic.success();
    onAddIngredients(dayIndex, suggestions);
    setSuggestions([]);
  };

  const swapWith = async (target: number) => {
    setSwapping(false);
    haptic.tap();
    await onSwap(dayIndex, target);
  };

  const showAiBox = !readOnly && meal.trim() && (loadingAI || suggestions.length > 0 || ingredients.length === 0);

  return (
    <div className="sheet-overlay" onClick={close} role="presentation">
      <div className="day-sheet" role="dialog" aria-modal="true" aria-label={days[dayIndex]} onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />

        <div className="day-sheet__hd">
          <div className="day-sheet__titles">
            <div className="day-sheet__date">{days[dayIndex]} · {dayMonth(date, language)}</div>
            {readOnly ? (
              <div className={`day-sheet__meal${meal.trim() ? "" : " is-empty"}`}>{meal || "–"}</div>
            ) : (
              <label className="day-sheet__meal-label">
                <span className="sr-only">{t.enterMealName}</span>
                <input
                  ref={mealInput}
                  className="day-sheet__meal"
                  type="text"
                  placeholder={t.enterMealName}
                  value={meal}
                  maxLength={200}
                  enterKeyHint="done"
                  autoComplete="off"
                  autoCapitalize="sentences"
                  onFocus={() => { mealAtFocus.current = meal; }}
                  onChange={(e) => onMealChange(dayIndex, e.target.value)}
                  onBlur={commitMeal}
                  onKeyDown={(e) => { if (e.key === "Enter") mealInput.current?.blur(); }}
                />
              </label>
            )}
          </div>
          <button className="round-btn" onClick={close} aria-label={t.close}>
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {!readOnly && (
          <div className="day-sheet__chips">
            <button className={`chip${swapping ? " is-active" : ""}`} onClick={() => setSwapping((s) => !s)} aria-expanded={swapping}>
              <ArrowLeftRight size={13} strokeWidth={2} />
              {t.swapDay}
            </button>
          </div>
        )}

        {swapping && !readOnly && (
          <div className="swap-picker" role="group" aria-label={t.swapWith}>
            <span className="swap-picker__label">{t.swapWith}</span>
            <div className="swap-picker__days">
              {short.map((s, i) =>
                i === dayIndex ? null : (
                  <button key={i} className="swap-picker__day" onClick={() => swapWith(i)} aria-label={`${t.swapDay}: ${days[i]}`}>
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        <div className="day-sheet__body">
          {showAiBox && (
            isPremium ? (
              <div className="ai-box">
                {loadingAI ? (
                  <div className="ai-box__hd">
                    <span className="ai-box__label is-loading" role="status"><SparkleIcon size={12} />{t.gettingSuggestions}</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div className="ai-box__hd">
                      <span className="ai-box__label"><SparkleIcon size={12} />{t.suggested}</span>
                      <button className="ai-box__all" onClick={addAllSuggestions}>{f(t.addAllCount, { n: suggestions.length })}</button>
                    </div>
                    <div className="ai-box__chips">
                      {suggestions.map((s) => (
                        <button key={s} className="ai-chip" onClick={() => addSuggestion(s)}>+ {s}</button>
                      ))}
                    </div>
                  </>
                ) : (
                  <button className="ai-box__suggest" onClick={() => fetchSuggestions(meal)}>
                    <SparkleIcon size={14} />
                    {t.suggest}
                  </button>
                )}
              </div>
            ) : (
              ingredients.length === 0 && (
                <button className="ai-box ai-box--gate" onClick={openPaywall}>
                  <SparkleIcon size={16} />
                  <span className="ai-box__gate-text">
                    <span className="ai-box__gate-title">{t.aiUpsellTitle}</span>
                    <span className="ai-box__gate-sub">{t.aiUpsellSub}</span>
                  </span>
                  <Lock size={14} />
                </button>
              )
            )
          )}
          {aiError && <p className="ai-error">{aiError}</p>}

          {ingredients.length > 0 && (
            <>
              <div className="day-sheet__list-hd">
                <span className="day-sheet__list-label">{t.ingredients}</span>
                <span className="day-sheet__list-count">{f(t.inBasketCount, { done, total: ingredients.length })}</span>
              </div>
              <ul className="item-list">
                {ingredients.map((ing) => (
                  <li key={ing.id} className="item-row">
                    <button
                      className="item-row__main"
                      onClick={() => { haptic.tap(); onToggle(ing.id); }}
                      aria-pressed={ing.checked}
                      disabled={readOnly}
                    >
                      <span className={`check${ing.checked ? " is-checked" : ""}`} aria-hidden />
                      <span className={`item-row__name${ing.checked ? " is-checked" : ""}`}>{ing.name}</span>
                      <span className="item-row__aisle">{t[detectAisle(ing.name)]}</span>
                    </button>
                    {!readOnly && (
                      <button className="item-row__delete" onClick={() => onDelete(ing.id)} aria-label={f(t.deleteIngredient, { name: ing.name })}>
                        <X size={13} strokeWidth={2} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {!readOnly && (
          <div className="add-bar">
            <label className="add-bar__field">
              <span className="sr-only">{t.addIngredient}</span>
              <input
                ref={addInput}
                type="text"
                placeholder={t.addIngredient}
                value={newIngredient}
                maxLength={120}
                enterKeyHint="enter"
                autoComplete="off"
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addIngredient(); }}
              />
            </label>
            <button className="add-bar__btn" onClick={addIngredient} aria-label={t.addIngredient} disabled={!newIngredient.trim()}>
              <Plus size={18} strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DaySheet;
