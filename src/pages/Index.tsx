import { useLanguage } from "@/contexts/LanguageContext";
import WeeklyPlanner from "@/components/WeeklyPlanner";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t.appTitle}
          </h1>
          <p className="text-muted-foreground">
            {t.appSubtitle}
          </p>
        </header>
        <WeeklyPlanner />
      </div>
    </div>
  );
};

export default Index;
