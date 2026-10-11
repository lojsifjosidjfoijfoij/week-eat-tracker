import { memo } from "react";
import { ArrowLeftRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Day } from "@/lib/useWeekPlan";
import { SparkleIcon } from "./icons";

export type SheetIntent = "suggest" | "swap" | undefined;

type Props = {
  today: number;
  day: Day;
  readOnly: boolean;
  canSuggest: boolean;
  onOpen: (day: number, intent?: SheetIntent) => void;
};

/** The hero card: what's for dinner tonight, how much of it is in the basket. */
const TonightCard = ({ today, day, readOnly, canSuggest, onOpen }: Props) => {
  const { t, f, days } = useLanguage();
  const meal = day.meal.trim();
  const total = day.ingredients.length;
  const done = day.ingredients.filter((i) => i.checked).length;
  const countLabel = total === 1 ? t.ingredientsCountOne : f(t.ingredientsCountMany, { n: total });

  return (
    <section className="tonight" aria-label={`${t.tonight} · ${days[today]}`}>
      <div className="tonight__label">
        <span className="tonight__dot" aria-hidden />
        {t.tonight} · {days[today]}
      </div>

      <button className={`tonight__meal${meal ? "" : " is-empty"}`} onClick={() => onOpen(today)} disabled={readOnly && !meal}>
        {meal || t.whatsForDinnerTonight}
      </button>

      {total > 0 && (
        <div className="tonight__progress">
          <div className="progress" aria-hidden>
            <div className="progress__fill" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <span>{f(t.inBasketCount, { done, total })}</span>
        </div>
      )}

      <div className="tonight__actions">
        {!meal ? (
          !readOnly && (
            <button className="pill-btn pill-btn--tint" onClick={() => onOpen(today)}>{t.planTonight}</button>
          )
        ) : (
          <>
            <button className="pill-btn" onClick={() => onOpen(today)}>{countLabel}</button>
            {!readOnly &&
              (total === 0 && canSuggest ? (
                <button className="pill-btn pill-btn--tint" onClick={() => onOpen(today, "suggest")}>
                  <SparkleIcon size={14} />
                  {t.suggest}
                </button>
              ) : (
                <button className="pill-btn pill-btn--tint" onClick={() => onOpen(today, "swap")}>
                  <ArrowLeftRight size={14} strokeWidth={2} />
                  {t.swapDay}
                </button>
              ))}
          </>
        )}
      </div>
    </section>
  );
};

export default memo(TonightCard);
