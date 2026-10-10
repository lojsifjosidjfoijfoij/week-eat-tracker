import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { PremiumProvider, usePremium } from "@/contexts/PremiumContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Paywall from "@/components/Paywall";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NewPassword from "@/pages/NewPassword";
import Onboarding from "@/pages/Onboarding";
import { safeLocal } from "@/lib/storage";

const ONBOARDING_KEY = "onboarding_done";

const Splash = () => {
  const { t } = useLanguage();
  return (
    <div className="splash">
      <p className="splash__brand">dinrr</p>
      <p className="splash__sub">{t.loading}</p>
    </div>
  );
};

const SignedIn = () => {
  const { showPaywall, closePaywall } = usePremium();
  const [onboarded, setOnboarded] = useState(() => safeLocal.get(ONBOARDING_KEY) === "true");

  if (!onboarded) {
    return (
      <Onboarding
        onDone={() => {
          safeLocal.set(ONBOARDING_KEY, "true");
          setOnboarded(true);
        }}
      />
    );
  }

  return (
    <>
      <Index />
      {showPaywall && <Paywall onClose={closePaywall} />}
    </>
  );
};

const Root = () => {
  const { user, loading, recovering } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Login />;
  if (recovering) return <NewPassword />;
  return (
    // key: remount everything when the account changes so no state leaks between users
    <FamilyProvider key={user.id}>
      <PremiumProvider>
        <SignedIn />
      </PremiumProvider>
    </FamilyProvider>
  );
};

const App = () => (
  <AuthProvider>
    <Root />
  </AuthProvider>
);

export default App;
