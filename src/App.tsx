import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FamilyProvider, useFamily } from "@/contexts/FamilyContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PremiumProvider, usePremium } from "@/contexts/PremiumContext";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Paywall from "@/components/Paywall";

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const { showPaywall, closePaywall } = usePremium();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem("onboarding_done");
      if (!seen) setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingDone = () => {
    localStorage.setItem("onboarding_done", "true");
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontStyle: "italic", color: "var(--ink)" }}>dinrr</p>
          <p style={{ fontSize: "0.875rem", color: "var(--ink-3)", marginTop: "8px" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;
  if (showOnboarding) return <Onboarding onDone={handleOnboardingDone} />;

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      {showPaywall && <Paywall onClose={closePaywall} />}
    </>
  );
};

// Reads familyId from FamilyContext (already mounted) and forwards it to PremiumProvider
// so that family membership is treated as a premium entitlement.
const PremiumWithFamily = ({ userEmail, children }: { userEmail?: string; children: React.ReactNode }) => {
  const { familyId } = useFamily();
  return (
    <PremiumProvider userEmail={userEmail} familyId={familyId ?? undefined}>
      {children}
    </PremiumProvider>
  );
};

// FamilyProvider sits above PremiumProvider so familyId can feed into premium state
const AuthenticatedApp = () => {
  const { user } = useAuth();
  return (
    <FamilyProvider>
      <PremiumWithFamily userEmail={user?.email}>
        <AppRoutes />
      </PremiumWithFamily>
    </FamilyProvider>
  );
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  </TooltipProvider>
);

export default App;
