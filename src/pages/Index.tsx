import { useState } from "react";
import { Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import SettingsPage from "@/pages/Settings";

const getWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
};

const Index = () => {
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const week = getWeekNumber();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <header className="mb-8 animate-fade-in">
          {/* Top row: brand name + settings */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="brand-name text-3xl text-foreground">
              dinrr
            </h1>
            <button
              onClick={() => setShowSettings(true)}
              className="icon-btn"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Week badge */}
          <div className="week-badge">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Week
            </span>
            <span className="text-xs font-medium text-foreground">
              {week} · {year}
            </span>
          </div>
        </header>

        <WeeklyPlanner />
        {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
};

export default Index;