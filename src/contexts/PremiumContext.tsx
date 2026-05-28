import { useState, useEffect, createContext, useContext } from "react";

export const PRODUCT_IDS = {
  monthly: "dinrr_premium_monthly",
  yearly:  "dinrr_premium_yearly",
};

// ─── Add tester emails here ───────────────────────────
const TESTER_EMAILS = [
  "louis@youremail.com",   // replace with your real email
  // "friend@example.com", // add friends/family here
];

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  showPaywall: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  restorePurchases: () => Promise<void>;
  activateTestMode: () => void;
  isTestMode: boolean;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  isLoading: false,
  showPaywall: false,
  openPaywall: () => {},
  closePaywall: () => {},
  restorePurchases: async () => {},
  activateTestMode: () => {},
  isTestMode: false,
});

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider = ({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
  }, [userEmail]);

  const checkPremiumStatus = async () => {
    try {
      // Check if tester email
      if (userEmail && TESTER_EMAILS.includes(userEmail.toLowerCase())) {
        setIsPremium(true);
        setIsTestMode(true);
        setIsLoading(false);
        return;
      }

      // Check if test mode was manually activated
      const testMode = localStorage.getItem("dinrr_test_mode");
      if (testMode === "true") {
        setIsPremium(true);
        setIsTestMode(true);
        setIsLoading(false);
        return;
      }

      // TODO: real RevenueCat check goes here when Apple Dev account arrives
      const stored = localStorage.getItem("dinrr_premium");
      setIsPremium(stored === "true");
    } catch (e) {
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  const activateTestMode = () => {
    localStorage.setItem("dinrr_test_mode", "true");
    setIsPremium(true);
    setIsTestMode(true);
  };

  const deactivateTestMode = () => {
    localStorage.removeItem("dinrr_test_mode");
    setIsPremium(false);
    setIsTestMode(false);
  };

  const restorePurchases = async () => {
    console.log("Restore purchases — will work once RevenueCat is configured");
  };

  return (
    <PremiumContext.Provider value={{
      isPremium,
      isLoading,
      showPaywall,
      openPaywall: () => setShowPaywall(true),
      closePaywall: () => setShowPaywall(false),
      restorePurchases,
      activateTestMode,
      isTestMode,
    }}>
      {children}
    </PremiumContext.Provider>
  );
};
