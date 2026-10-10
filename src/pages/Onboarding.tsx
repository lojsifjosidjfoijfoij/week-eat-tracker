import { useState } from "react";
import { UtensilsCrossed, ShoppingCart, Users, Sparkles, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: UtensilsCrossed,
    title: "Plan your week",
    description: "Add meals for each day of the week. Keep it simple or plan ahead — it's up to you.",
  },
  {
    icon: ShoppingCart,
    title: "Smart shopping list",
    description: "All your ingredients in one place. Tick them off as you shop and never forget anything.",
  },
  {
    icon: Users,
    title: "Share with family",
    description: "Create a family and everyone stays in sync. Change a meal and your family sees it instantly.",
  },
  {
    icon: Sparkles,
    title: "AI suggestions",
    description: "Type a meal name and get instant ingredient suggestions powered by AI. Cooking made easy.",
  },
];

const Onboarding = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const current = steps[step];
  const Icon = current.icon;

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "24px",
      paddingTop: "calc(env(safe-area-inset-top, 50px) + 24px)",
      paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
    }}>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px", width: "100%", maxWidth: "360px" }}>

        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "24px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 12px rgba(26,23,20,0.08)",
        }}>
          <Icon size={36} color="var(--green)" strokeWidth={1.5} />
        </div>

        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "1.75rem",
            color: "var(--ink)",
            marginBottom: "12px",
            lineHeight: 1.2,
          }}>{current.title}</h1>
          <p style={{
            fontSize: "0.9375rem",
            color: "var(--ink-2)",
            lineHeight: 1.6,
            fontWeight: 300,
          }}>{current.description}</p>
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: "6px",
              borderRadius: "3px",
              background: i === step ? "var(--green)" : "var(--border-strong)",
              width: i === step ? "24px" : "6px",
              transition: "all 0.3s var(--ease)",
            }} />
          ))}
        </div>

      </div>

      <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          className="btn-shopping"
          style={{ width: "100%", justifyContent: "center", borderRadius: "var(--r-pill)", padding: "16px", fontSize: "1rem" }}
          onClick={() => isLast ? onDone() : setStep(step + 1)}
        >
          {isLast ? "Get started" : "Next"}
          <ChevronRight size={18} strokeWidth={2} />
        </button>
        {!isLast && (
          <button
            onClick={onDone}
            style={{
              background: "none",
              border: "none",
              fontSize: "0.875rem",
              color: "var(--ink-3)",
              cursor: "pointer",
              padding: "8px",
              textAlign: "center",
            }}
          >
            Skip
          </button>
        )}
      </div>

    </div>
  );
};

export default Onboarding;