import { memo, useRef, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Lock, Plus, Sparkles, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { supabase } from "@/lib/supabase";
import { haptic } from "@/lib/haptics";
import type { Item } from "@/lib/useWeekPlan";

type Props = {
  dayIndex: number;
  dayLabel: string;
  isToday: boolean;
  meal: string;
  ingredients: Item[];
  readOnly: boolean;
  onMealChange: (day: number, meal: string) => void;
  onMealCommit: (day: number) => void;
  onAddIngredients: (day: number, names: string[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
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

const DayCard = ({
  dayIndex, dayLabel, isToday, meal, ingredients, readOnly,
  onMealChange, onMealCommit, onAddIngredients, onToggle, onDelete,
}: Props) => {
  const { t, language } = useLanguage();
  const { isPremium, openPaywall } = usePremium();

  const [editing, setEditing] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const mealAtFocus = useRef(meal);
  const mealInput = useRef<HTMLInputElement>(null);

  const done = ingredients.filter((i) => i.checked).length;
  const total = ingredients.length;
  const showMealInput = !readOnly && (editing || !meal);

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
    const existing = new Set(ingredients.map((i) => i.name.toLowerCase()));
    const fresh = list.filter((n) => !existing.has(n.toLowerCase()));
    if (fresh.length) setSuggestions(fresh);
    else setAiError(t.aiUnavailable);
  };

  const commitMeal = () => {
    setEditing(false);
    onMealCommit(dayIndex);
    const changed = meal.trim() && meal.trim() !== mealAtFocus.current.trim();
    if (changed && ingredients.length === 0 && isPremium) fetchSuggestions(meal);
  };

  const addIngredient = () => {
    const name = newIngredient.trim();
    if (!name) return;
    onAddIngredients(dayIndex, [name]);
    setNewIngredient("");
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

  return (
    <section className={`day-card${isToday ? " day-card--today" : ""}`} aria-label={dayLabel}>
      <div className="day-card__hd">
        <span className="day-card__label">
          {dayLabel}
          {isToday && <span className="day-card__today">{t.today}</span>}
        </span>
        {total > 0 && (
          <div className="day-card__progress" aria-label={`${done}/${total}`}>
            <span className="day-card__progress-count">{done}/{total}</span>
            <div className="day-card__bar">
              <div className="day-card__fill" style={{ width: `${(done / total) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="day-card__body">
        {showMealInput ? (
          <input
            ref={mealInput}
            type="text"
            className="meal-input"
            placeholder={t.enterMealName}
            value={meal}
            maxLength={200}
            enterKeyHint="done"
            autoComplete="off"
            autoCapitalize="sentences"
            autoFocus={editing}
            onFocus={() => { mealAtFocus.current = meal; setEditing(true); }}
            onChange={(e) => onMealChange(dayIndex, e.target.value)}
            onBlur={commitMeal}
            onKeyDown={(e) => { if (e.key === "Enter") mealInput.current?.blur(); }}
          />
        ) : (
          <button
            className={`meal-display${!meal ? " meal-display--empty" : ""}`}
            onClick={() => { if (!readOnly) { mealAtFocus.current = meal; setEditing(true); } }}
            disabled={readOnly && !meal}
          >
            {meal || t.addMeal}
          </button>
        )}

        {loadingAI && (
          <div className="ai-loading" role="status">
            <Sparkles size={12} className="ai-loading__icon" />
            <span>{t.gettingSuggestions}</span>
          </div>
        )}

        {aiError && <p className="ai-error">{aiError}</p>}

        {suggestions.length > 0 && (
          <div>
            <div className="ai-bar">
              <span className="ai-label"><Sparkles size={10} />{t.suggestedIngredients}</span>
              <span className="ai-actions">
                <button className="ai-add-all" onClick={addAllSuggestions}>{t.addAll}</button>
                <button className="ai-dismiss" onClick={() => setSuggestions([])}>{t.dismiss}</button>
              </span>
            </div>
            <div className="suggestion-chips">
              {suggestions.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => addSuggestion(s)}>+ {s}</button>
              ))}
            </div>
          </div>
        )}

        {!readOnly && meal.trim() && !editing && !loadingAI && suggestions.length === 0 && (
          isPremium ? (
            ingredients.length === 0 && (
              <button className="ai-suggest-btn" onClick={() => fetchSuggestions(meal)}>
                <Sparkles size={12} /> {t.suggest}
              </button>
            )
          ) : (
            ingredients.length === 0 && (
              <button className="premium-gate" onClick={openPaywall}>
                <span className="premium-gate__icon" aria-hidden>✨</span>
                <span className="premium-gate__text">
                  <span className="premium-gate__label">{t.aiUpsellTitle}</span>
                  <span className="premium-gate__sub">{t.aiUpsellSub}</span>
                </span>
                <Lock size={14} className="premium-gate__arrow" />
              </button>
            )
          )
        )}

        {ingredients.length > 0 && (
          <ul className="ingredient-list">
            {ingredients.map((ing) => (
              <li key={ing.id} className="ingredient-row">
                <button
                  className={`ingredient-toggle${ing.checked ? " is-checked" : ""}`}
                  onClick={() => { haptic.tap(); onToggle(ing.id); }}
                  aria-pressed={ing.checked}
                  disabled={readOnly}
                >
                  <span className={`ingredient-check${ing.checked ? " is-checked" : ""}`} aria-hidden />
                  <span className={`ingredient-name${ing.checked ? " is-checked" : ""}`}>{ing.name}</span>
                </button>
                {!readOnly && (
                  <button
                    className="ingredient-delete"
                    onClick={() => onDelete(ing.id)}
                    aria-label={t.deleteIngredient.replace("{name}", ing.name)}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {!readOnly && (
          <div className="add-row">
            <input
              type="text"
              placeholder={t.addIngredient}
              value={newIngredient}
              maxLength={120}
              enterKeyHint="enter"
              autoComplete="off"
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addIngredient(); }}
            />
            <button onClick={addIngredient} aria-label={t.addIngredient} disabled={!newIngredient.trim()}>
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(DayCard);
