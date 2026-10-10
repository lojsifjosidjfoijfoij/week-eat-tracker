import { useRef, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useToast } from "@/contexts/ToastContext";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import SettingsPage from "@/pages/Settings";
import { isoWeek } from "@/lib/week";

const Index = () => {
  const { t } = useLanguage();
  const { isPremium, isTestMode, toggleTestMode } = usePremium();
  const toast = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const taps = useRef(0);
  const tapTimer = useRef<number | undefined>(undefined);

  // Development only: tap the logo 5× to fake dinrr+ (stripped from release builds)
  const onLogoTap = () => {
    if (!import.meta.env.DEV) return;
    taps.current += 1;
    window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => { taps.current = 0; }, 2000);
    if (taps.current >= 5) {
      taps.current = 0;
      toggleTestMode();
      toast({ title: isTestMode ? "Test mode off" : "🧪 Test mode on (dev only)" });
    }
  };

  return (
    <>
      <div className="app-shell" aria-hidden={showSettings}>
        <header className="app-header">
          <h1 className="brand-name" onClick={onLogoTap}>
            dinrr{isPremium && <span className="brand-plus">+</span>}
          </h1>
          <div className="header-right">
            <div className="week-badge" aria-label={`${t.weekShort} ${isoWeek()}`}>
              <span className="wk-label">{t.weekShort}</span>
              <span className="wk-num">{isoWeek()}</span>
            </div>
            <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label={t.settings}>
              <SettingsIcon size={16} strokeWidth={1.75} />
            </button>
          </div>
        </header>
        <WeeklyPlanner />
      </div>

      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default Index;
