import {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";

import { safeGetCustomerInfo, safeLogin, safeRestorePurchases } from "@/lib/revenuecat";

export const PRODUCT_IDS = {
  monthly: "com.louis.weekmealplanner.monthly",
  yearly: "com.louis.weekmealplanner.yearly",
};

type PremiumContextType = {
  isPremium: boolean;
  isLoading: boolean;
  showPaywall: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  restorePurchases: () => Promise<void>;
  activateTestMode: () => void;
  isTestMode: boolean;
};

const PremiumContext = createContext<PremiumContextType | null>(null);

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used inside PremiumProvider");
  return ctx;
};

export const PremiumProvider = ({
  children,
  userEmail,
  familyId,
}: {
  children: React.ReactNode;
  userEmail?: string;
  familyId?: string;
}) => {
  const [rcPremium, setRcPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  const initializedForEmail = useRef<string | null>(null);

  // Family members are always premium
  const isPremium = isTestMode || rcPremium || !!familyId;

  useEffect(() => {
    if (!userEmail || initializedForEmail.current === userEmail) return;
    initializedForEmail.current = userEmail;

    const timer = setTimeout(() => {
      initPremium(userEmail);
    }, 1500); // gives Capacitor time to fully boot

    return () => clearTimeout(timer);
  }, [userEmail]);

  // Resolve loading immediately if familyId is already known
  useEffect(() => {
    if (familyId) setIsLoading(false);
  }, [familyId]);

  const initPremium = async (email: string) => {
    try {
      try {
        await safeLogin(email);
      } catch (e) {
        console.log("RevenueCat login failed:", e);
      }

      const { customerInfo } = await safeGetCustomerInfo();
      const hasPremium = !!customerInfo.entitlements.active["dinerr +"];
      setRcPremium(hasPremium);
    } catch (e) {
      console.log("RevenueCat error:", e);
      setRcPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      const { customerInfo } = await safeRestorePurchases();
      const hasPremium = !!customerInfo.entitlements.active["dinerr +"];
      setRcPremium(hasPremium);
    } catch (e) {
      console.log("Restore error:", e);
    }
  };

  const activateTestMode = () => {
    setIsTestMode(true);
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        showPaywall,
        openPaywall: () => setShowPaywall(true),
        closePaywall: () => setShowPaywall(false),
        restorePurchases,
        activateTestMode,
        isTestMode,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};
