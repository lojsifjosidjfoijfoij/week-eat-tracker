import { memo } from "react";
import { RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Day } from "@/lib/useWeekPlan";

type Props = {
  plan: Day[];
  today: number;
  readOnly: boolean;
  onOpen: (day: number) => void;
  onReset?: () => void;
};

/** "Whole week": one row per day with the dinner and its ingredient count. */
const WeekList = ({ plan, today, readOnly, onOpen, onReset }: Props) => {
  const { t, f, days } = useLanguage();
  const short = t.daysShort.split(",");

  return (
    <section aria-label={t.wholeWeek}>
      <div className="section-label">
        <span>{t.wholeWeek}</span>
        {onReset && (
          <button className="section-label__action" onClick={onReset}>
            <RotateCcw size={12} strokeWidth={2} />
            {t.resetWeek}
          </button>
        )}
      </div>
      <div className="week-list">
        {plan.map((d, i) => {
          const meal = d.meal.trim();
          const state = i === today ? " is-today" : i < today ? " is-past" : "";
          return (
            <button
              key={i}
              className={`week-row${state}`}
              onClick={() => onOpen(i)}
              disabled={readOnly && !meal}
              aria-label={`${f(t.openDay, { day: days[i] })}${meal ? `: ${meal}` : ""}`}
            >
              <span className="week-row__day">{short[i]}</span>
              <span className={`week-row__meal${meal ? "" : " is-empty"}`}>{meal || (readOnly ? "–" : t.addDinner)}</span>
              {meal ? (
                d.ingredients.length > 0 && <span className="week-row__count">{d.ingredients.length}</span>
              ) : (
                !readOnly && <span className="week-row__add" aria-hidden>+</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default memo(WeekList);
