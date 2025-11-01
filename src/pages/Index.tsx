import { UtensilsCrossed } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import LanguageSelector from "@/components/LanguageSelector";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UtensilsCrossed className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {t.appTitle}
            </h1>
            <div className="ml-4">
              <LanguageSelector />
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.appSubtitle}
          </p>
        </header>
        <WeeklyPlanner />
      </div>
    </div>
  );
};

export default Index;
