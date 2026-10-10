import { useEffect, useState } from "react";
import { Check, ShoppingCart, Sparkles, Users, X, Zap } from "lucide-react";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { usePremium } from "@/contexts/PremiumContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { LINKS } from "@/config";
import { haptic } from "@/lib/haptics";
import {
  classifyStoreError,
  hasEntitlement,
  loadPlans,
  purchase,
  restore,
  storeAvailable,
  type Plans,
  type StoreErrorKind,
} from "@/lib/revenuecat";

type PlanKey = "yearly" | "monthly";

function perMonth(pkg: PurchasesPackage | null, locale: string): string | null {
  const p = pkg?.product;
  if (!p?.price || !p.currencyCode) return null;
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency: p.currencyCode }).format(p.price / 12);
  } catch {
    return null;
  }
}

const Paywall = ({ onClose }: { onClose: () => void }) => {
  const { t, f, language } = useLanguage();
  const { applyCustomerInfo, ownsSubscription } = usePremium();
  const toast = useToast();

  const [selected, setSelected] = useState<PlanKey>("yearly");
  const [plans, setPlans] = useState<Plans | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(storeAvailable());
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [error, setError] = useState<{ kind: StoreErrorKind; detail: string } | null>(null);

  const messageFor = (kind: StoreErrorKind): string => ({
    cancelled: "",
    notReady: t.storeNotReady,
    notAllowed: t.purchaseNotAllowed,
    pending: t.paymentPending,
    network: t.networkError,
    store: t.storeProblem,
    alreadyOwned: t.alreadyPremium,
    unknown: t.purchaseFailed,
  })[kind];

  const loadInto = () =>
    loadPlans()
      .then((p) => {
        setPlans(p);
        if (!p.yearly && !p.monthly) setError({ kind: "notReady", detail: "No packages in the current offering" });
        else if (!p.yearly) setSelected("monthly");
      })
      .catch((e) => setError(classifyStoreError(e)))
      .finally(() => setLoadingPlans(false));

  const fetchPlans = () => {
    if (!storeAvailable()) return;
    setLoadingPlans(true);
    setError(null);
    loadInto();
  };

  useEffect(() => {
    if (storeAvailable()) loadInto();
  }, []); // load once when the paywall opens

  // Close with Escape (simulator / keyboard)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pkg = plans?.[selected] ?? null;
  const yearlyPrice = plans?.yearly?.product.priceString;
  const monthlyPrice = plans?.monthly?.product.priceString;
  const yearlyMonthly = perMonth(plans?.yearly ?? null, language);

  const handleBuy = async () => {
    if (!pkg) {
      fetchPlans();
      return;
    }
    setBusy("buy");
    setError(null);
    try {
      const info = await purchase(pkg);
      applyCustomerInfo(info);
      if (hasEntitlement(info)) {
        haptic.success();
        toast({ title: t.welcomePremium, description: t.premiumActive, variant: "success" });
        onClose();
      }
    } catch (e) {
      const err = classifyStoreError(e);
      console.warn("Purchase failed", err.detail);
      if (err.kind === "alreadyOwned") {
        await handleRestore();
        return;
      }
      if (err.kind !== "cancelled") setError(err);
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    if (!storeAvailable()) {
      setError({ kind: "notReady", detail: "" });
      return;
    }
    setBusy("restore");
    setError(null);
    try {
      const info = await restore();
      applyCustomerInfo(info);
      if (hasEntitlement(info)) {
        haptic.success();
        toast({ title: t.restored, variant: "success" });
        onClose();
      } else {
        toast({ title: t.nothingToRestore });
      }
    } catch (e) {
      const err = classifyStoreError(e);
      if (err.kind !== "cancelled") setError(err);
    } finally {
      setBusy(null);
    }
  };

  const features = {
    free: [
      { icon: <ShoppingCart size={16} />, text: t.featWeekly },
      { icon: <Check size={16} />, text: t.featShopping },
      { icon: <Check size={16} />, text: t.featManual },
    ],
    premium: [
      { icon: <Users size={16} />, text: t.featFamily },
      { icon: <Sparkles size={16} />, text: t.featAI },
      { icon: <Zap size={16} />, text: t.featEverything },
    ],
  };

  const planLabel = selected === "yearly" ? t.yearly : t.monthly;
  const ctaDisabled = !!busy || loadingPlans || ownsSubscription || (!!plans && !pkg);

  return (
    <div className="paywall" role="dialog" aria-modal="true" aria-label="dinrr+">
      <button className="paywall__close" onClick={onClose} aria-label={t.close}>
        <X size={16} strokeWidth={2} />
      </button>

      <div className="paywall__hero">
        <div className="paywall__icon" aria-hidden>🍽️</div>
        <h2 className="paywall__title">dinrr+</h2>
        <p className="paywall__subtitle">{t.paywallSubtitle}</p>
      </div>

      <div className="paywall__features">
        <div className="paywall__col">
          <p className="paywall__col-label">{t.planFree}</p>
          {features.free.map((x) => (
            <div key={x.text} className="paywall__feature paywall__feature--free">
              <span className="paywall__feature-icon">{x.icon}</span>
              <span>{x.text}</span>
            </div>
          ))}
        </div>
        <div className="paywall__col paywall__col--premium">
          <p className="paywall__col-label">{t.planPremium}</p>
          {features.premium.map((x) => (
            <div key={x.text} className="paywall__feature">
              <span className="paywall__feature-icon">{x.icon}</span>
              <span>{x.text}</span>
            </div>
          ))}
        </div>
      </div>

      {storeAvailable() ? (
        <div className="paywall__plans">
          <button
            className={`paywall__plan${selected === "yearly" ? " is-selected" : ""}`}
            onClick={() => setSelected("yearly")}
            disabled={!!plans && !plans.yearly}
            aria-pressed={selected === "yearly"}
          >
            <span className="paywall__plan-badge">{t.bestValue}</span>
            <span className="paywall__plan-name">{t.yearly}</span>
            <span className="paywall__plan-price">
              {yearlyPrice ?? (loadingPlans ? "…" : "—")}<span>{t.perYear}</span>
            </span>
            <span className="paywall__plan-sub">{yearlyMonthly ? f(t.perMonthLong, { price: yearlyMonthly }) : " "}</span>
          </button>
          <button
            className={`paywall__plan${selected === "monthly" ? " is-selected" : ""}`}
            onClick={() => setSelected("monthly")}
            disabled={!!plans && !plans.monthly}
            aria-pressed={selected === "monthly"}
          >
            <span className="paywall__plan-name">{t.monthly}</span>
            <span className="paywall__plan-price">
              {monthlyPrice ?? (loadingPlans ? "…" : "—")}<span>{t.perMonth}</span>
            </span>
            <span className="paywall__plan-sub">{t.cancelAnytime}</span>
          </button>
        </div>
      ) : (
        <p className="paywall__notice">{t.storeOnlyOnPhone}</p>
      )}

      <div className="paywall__footer">
        {error && error.kind !== "cancelled" && (
          <div className="paywall__error" role="alert">
            <p>{messageFor(error.kind)}</p>
            {error.detail && <p className="paywall__error-detail">{error.detail}</p>}
          </div>
        )}

        {storeAvailable() && (
          <button className="paywall__cta" onClick={handleBuy} disabled={ctaDisabled}>
            {ownsSubscription
              ? t.alreadyPremium
              : busy === "buy"
                ? t.loading
                : loadingPlans
                  ? t.loadingPrices
                  : f(t.getPlan, { plan: planLabel })}
          </button>
        )}
        <button className="paywall__restore" onClick={handleRestore} disabled={!!busy}>
          {busy === "restore" ? t.loading : t.restorePurchases}
        </button>
        <p className="paywall__legal">{t.legalAutoRenew}</p>
        <p className="paywall__legal paywall__links">
          <a href={LINKS.terms} target="_blank" rel="noreferrer">{t.termsOfUse}</a>
          {" · "}
          <a href={LINKS.privacy} target="_blank" rel="noreferrer">{t.privacyPolicy}</a>
        </p>
      </div>
    </div>
  );
};

export default Paywall;
