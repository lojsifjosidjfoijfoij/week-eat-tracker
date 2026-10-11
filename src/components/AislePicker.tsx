import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AISLE_ORDER, detectAisle, guessAisle, hasAisleOverride, setAisleOverride, type AisleKey } from "@/lib/aisles";
import { haptic } from "@/lib/haptics";

type Props = { itemName: string; onClose: () => void };

/** Lets the user correct which aisle an item belongs to. Remembered for that item name. */
const AislePicker = ({ itemName, onClose }: Props) => {
  const { t, language } = useLanguage();
  const current = detectAisle(itemName, language);
  const overridden = hasAisleOverride(itemName);

  const pick = (aisle: AisleKey | null) => {
    haptic.tap();
    // Picking the automatic guess is the same as no correction
    setAisleOverride(itemName, aisle && aisle !== guessAisle(itemName, language) ? aisle : null);
    onClose();
  };

  return (
    <div className="sheet-overlay sheet-overlay--top" onClick={onClose} role="presentation">
      <div className="aisle-picker" role="dialog" aria-modal="true" aria-label={t.moveToAisle} onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="aisle-picker__hd">
          <span className="aisle-picker__label">{t.moveToAisle}</span>
          <span className="aisle-picker__item">{itemName}</span>
        </div>
        <ul className="aisle-picker__list">
          {AISLE_ORDER.map((a) => (
            <li key={a}>
              <button className={`aisle-picker__opt${a === current ? " is-current" : ""}`} onClick={() => pick(a)} aria-pressed={a === current}>
                <span>{t[a]}</span>
                {a === current && <Check size={16} strokeWidth={2.4} />}
              </button>
            </li>
          ))}
        </ul>
        {overridden && (
          <button className="aisle-picker__reset" onClick={() => pick(null)}>{t.sortAutomatically}</button>
        )}
      </div>
    </div>
  );
};

export default AislePicker;
