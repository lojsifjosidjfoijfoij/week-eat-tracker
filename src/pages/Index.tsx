import { useState, useRef } from "react";
import { Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useAuth } from "@/contexts/AuthContext";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import SettingsPage from "@/pages/Settings";
import { useToast } from "@/hooks/use-toast";

const getWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
};

const Index = () => {
  const { t } = useLanguage();
  const { isPremium, isTestMode, activateTestMode } = usePremium();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const week = getWeekNumber();
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleLogoTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2000);

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      if (!isTestMode) {
        activateTestMode();
        toast({ title: "🧪 Test mode on", description: "All premium features unlocked for testing." });
      } else {
        toast({ title: "Already in test mode", description: "Premium features are unlocked." });
      }
    }
  };

  return (
    <>
      <div style={{ display: showSettings ? "none" : "block" }}>
        <div className="app-shell">
          <header className="app-header">
            <h1
              className="brand-name"
              onClick={handleLogoTap}
              style={{ cursor: "default", userSelect: "none", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {t.appName ?? "dinrr"}
              {isTestMode && (
                <span style={{
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-body)",
                  fontStyle: "normal",
                  fontWeight: 700,
                  color: "var(--green)",
                  lineHeight: 1,
                  marginTop: "2px", // slight optical alignment with serif baseline
                }}>
                  +
                </span>
              )}
            </h1>
            <div className="header-right">
              <div className="week-badge">
                <span className="wk-label">Wk</span>
                <span className="wk-num">{week}</span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowSettings(true)}
                aria-label="Settings"
              >
                <Settings size={16} strokeWidth={1.75} />
              </button>
            </div>
          </header>
          <WeeklyPlanner />
        </div>
      </div>

      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default Index;