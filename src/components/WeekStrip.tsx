import { memo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  dates: Date[];
  today: number;
  meals: string[];
  onOpen: (day: number) => void;
};

/** Seven-day date strip: today filled, a dot under days with a dinner planned. */
const WeekStrip = ({ dates, today, meals, onOpen }: Props) => {
  const { t, days, f } = useLanguage();
  const short = t.daysShort.split(",");

  return (
    <div className="week-strip">
      {dates.map((date, i) => {
        const state = i === today ? " is-today" : i < today ? " is-past" : "";
        const meal = meals[i]?.trim();
        return (
          <button
            key={i}
            className={`week-strip__day${state}`}
            onClick={() => onOpen(i)}
            aria-label={`${f(t.openDay, { day: days[i] })}${meal ? `: ${meal}` : ""}`}
            aria-current={i === today ? "date" : undefined}
          >
            <span className="week-strip__short">{short[i]}</span>
            <span className="week-strip__date">{date.getDate()}</span>
            <span className={`week-strip__dot${meal ? " has-meal" : ""}`} aria-hidden />
          </button>
        );
      })}
    </div>
  );
};

export default memo(WeekStrip);
