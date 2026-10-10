import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { CustomerInfo } from "@revenuecat/purchases-capacitor";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { supabase } from "@/lib/supabase";
import { hasEntitlement, identify, onCustomerInfo } from "@/lib/revenuecat";
import { safeLocal } from "@/lib/storage";

type ServerStatus = { self: boolean; family: boolean };

type PremiumContextType = {
  /** dinrr+ features are unlocked (own subscription, family, or manual grant) */
  isPremium: boolean;
  /** the user's own App Store subscription is active */
  ownsSubscription: boolean;
  /** dinrr+ comes from someone else in the family */
  viaFamily: boolean;
  /** someone in the user's family has dinrr+ (family sharing is "on") */
  familyPremium: boolean;
  isLoading: boolean;
  showPaywall: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  /** Call after a purchase/restore with the CustomerInfo RevenueCat returned */
  applyCustomerInfo: (info: CustomerInfo) => void;
  refresh: () => Promise<void>;
  /** DEV builds only (npm run dev in a browser) */
  isTestMode: boolean;
  toggleTestMode: () => void;
};

const PremiumContext = createContext<PremiumContextType | null>(null);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { familyId } = useFamily();
  const userId = user?.id ?? null;
  const cacheKey = userId ? `dinrr:premium:${userId}` : null;

  const [rcPremium, setRcPremium] = useState(false);
  const [server, setServer] = useState<ServerStatus>(() =>
    cacheKey ? safeLocal.getJSON<ServerStatus>(cacheKey, { self: false, family: false }) : { self: false, family: false },
  );
  const [rcReady, setRcReady] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isTestMode, setTestMode] = useState(false);
  const lastServerSync = useRef(0);

  const refreshServer = useCallback(async (force = false) => {
    if (!userId) return;
    if (!force && Date.now() - lastServerSync.current < 30_000) return;
    lastServerSync.current = Date.now();
    let status: ServerStatus | null = null;
    const { data, error } = await supabase.functions.invoke("sync-premium", { method: "POST" });
    if (!error && data && typeof data.self === "boolean") {
      status = { self: data.self, family: !!data.family };
    } else {
      // Edge function not deployed yet / offline → read what the database knows
      const rpcRes = await supabase.rpc("get_premium_status");
      if (!rpcRes.error && rpcRes.data) status = { self: !!rpcRes.data.self, family: !!rpcRes.data.family };
    }
    if (status) {
      setServer(status);
      if (cacheKey) safeLocal.setJSON(cacheKey, status);
    }
    setServerReady(true);
  }, [userId, cacheKey]);

  // RevenueCat: identify with the Supabase user id and keep listening for changes
  // (The provider is remounted for every account — see App.tsx — so no reset is needed here.)
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const info = await identify(userId);
        if (!cancelled) setRcPremium(hasEntitlement(info));
        unsubscribe = await onCustomerInfo((ci) => {
          setRcPremium(hasEntitlement(ci));
          refreshServer(true);
        });
      } catch (e) {
        console.warn("RevenueCat init failed", e);
      } finally {
        if (!cancelled) setRcReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async: state is only set after the network call
    refreshServer(true);
    // Never block the UI on slow stores
    const timer = window.setTimeout(() => { setRcReady(true); setServerReady(true); }, 4000);
    return () => {
      cancelled = true;
      unsubscribe?.();
      window.clearTimeout(timer);
    };
  }, [userId, cacheKey, refreshServer]);

  // Family changed (joined / left) → premium may have changed
  const prevFamilyId = useRef(familyId);
  useEffect(() => {
    if (prevFamilyId.current === familyId) return;
    prevFamilyId.current = familyId;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async: state is only set after the network call
    if (userId) refreshServer(true);
  }, [familyId, userId, refreshServer]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !userId) return;
    const l = App.addListener("resume", () => refreshServer());
    return () => { l.then((h) => h.remove()); };
  }, [userId, refreshServer]);

  const value = useMemo<PremiumContextType>(() => {
    const ownsSubscription = rcPremium || server.self;
    const isPremium = (import.meta.env.DEV && isTestMode) || ownsSubscription || server.family;
    return {
      isPremium,
      ownsSubscription,
      viaFamily: !ownsSubscription && server.family,
      familyPremium: server.family || (ownsSubscription && !!familyId),
      isLoading: !(rcReady && serverReady),
      showPaywall,
      openPaywall: () => setShowPaywall(true),
      closePaywall: () => setShowPaywall(false),
      applyCustomerInfo: (info) => {
        setRcPremium(hasEntitlement(info));
        refreshServer(true);
      },
      refresh: () => refreshServer(true),
      isTestMode: import.meta.env.DEV && isTestMode,
      toggleTestMode: () => { if (import.meta.env.DEV) setTestMode((v) => !v); },
    };
  }, [rcPremium, server, isTestMode, rcReady, serverReady, showPaywall, familyId, refreshServer]);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used inside PremiumProvider");
  return ctx;
};
