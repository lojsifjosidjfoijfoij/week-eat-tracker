import { useState } from "react";
import { ChevronRight, ShoppingCart, Sparkles, Users, UtensilsCrossed } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Onboarding = ({ onDone }: { onDone: () => void }) => {
  const { t } = useLanguage();
  const steps = [
    { icon: UtensilsCrossed, title: t.onb1Title, body: t.onb1Body },
    { icon: ShoppingCart, title: t.onb2Title, body: t.onb2Body },
    { icon: Users, title: t.onb3Title, body: t.onb3Body },
    { icon: Sparkles, title: t.onb4Title, body: t.onb4Body },
  ];
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const { icon: Icon, title, body } = steps[step];

  return (
    <div className="onboarding">
      <div className="onboarding__content" key={step}>
        <div className="onboarding__icon">
          <Icon size={36} color="var(--green)" strokeWidth={1.5} />
        </div>
        <div className="onboarding__text">
          <h1>{title}</h1>
          <p>{body}</p>
        </div>
        <div className="onboarding__dots" aria-label={`${step + 1}/${steps.length}`}>
          {steps.map((_, i) => <span key={i} className={i === step ? "is-active" : ""} />)}
        </div>
      </div>

      <div className="onboarding__actions">
        <button className="btn-primary" onClick={() => (isLast ? onDone() : setStep(step + 1))}>
          {isLast ? t.getStarted : t.next}
          <ChevronRight size={18} strokeWidth={2} />
        </button>
        {!isLast && <button className="btn-text" onClick={onDone}>{t.skip}</button>}
      </div>
    </div>
  );
};

export default Onboarding;
