import { useState } from "react";
import { UtensilsCrossed, ShoppingCart, Users, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-8 pb-16">
      <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-center space-y-8">

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
          <Icon className="h-10 w-10 text-foreground" />
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">{current.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{current.description}</p>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Button */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          className="w-full"
          onClick={() => isLast ? onDone() : setStep(step + 1)}
        >
          {isLast ? "Get started" : "Next"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        {!isLast && (
          <button
            onClick={onDone}
            className="w-full text-sm text-muted-foreground text-center py-2"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
