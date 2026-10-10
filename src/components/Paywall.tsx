import { useState, useEffect } from "react";
import { X, Check, Sparkles, Users, ShoppingCart, Zap } from "lucide-react";
import { Purchases } from "@revenuecat/purchases-capacitor";
import { usePremium } from "@/contexts/PremiumContext";
import { useToast } from "@/hooks/use-toast";
import { safeGetOfferings } from "@/lib/revenuecat";

const FEATURES_FREE = [
  { icon: <ShoppingCart size={16} />, text: "Weekly meal planning" },
  { icon: <Check size={16} />, text: "Shopping list" },
  { icon: <Check size={16} />, text: "Manual ingredients" },
];

const FEATURES_PREMIUM = [
  { icon: <Users size={16} />, text: "Family sharing" },
  { icon: <Sparkles size={16} />, text: "AI ingredient suggestions" },
  { icon: <Zap size={16} />, text: "Everything in free" },
];

type Plan = "monthly" | "yearly";

const Paywall = ({ onClose }: { onClose: () => void }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<{ annual: any; monthly: any } | null>(null);
  const { restorePurchases } = usePremium();
  const { toast } = useToast();

  useEffect(() => {
    safeGetOfferings()
      .then((offerings) => {
        const current = offerings.current;
        if (current) setPackages({ annual: current.annual, monthly: current.monthly });
      })
      .catch((e) => console.log("Failed to fetch offerings:", e));
  }, []);

  const yearlyPkg = packages?.annual;
  const monthlyPkg = packages?.monthly;
  const yearlyPrice = yearlyPkg?.product?.priceString ?? "€29.99";
  const monthlyPrice = monthlyPkg?.product?.priceString ?? "€3.99";
  const yearlyPerMonth = yearlyPkg?.product?.price
    ? (() => {
        try {
          return (
            new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: yearlyPkg.product.currencyCode,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(yearlyPkg.product.price / 12) + " / month"
          );
        } catch {
          return `${(yearlyPkg.product.price / 12).toFixed(2)} / month`;
        }
      })()
    : "€2.50 / month";

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const offerings = await safeGetOfferings();
      const current = offerings.current;

      if (!current) {
        toast({ title: "No offerings", description: "Current offering is null", variant: "destructive" });
        return;
      }

      const pkg = selectedPlan === "yearly" ? current.annual : current.monthly;

      if (!pkg) {
        toast({ title: "No package", description: `${selectedPlan} package not found`, variant: "destructive" });
        return;
      }

      await Purchases.purchasePackage({ aPackage: pkg });
      await restorePurchases(); // refresh isPremium state immediately
      toast({ title: "Welcome to dinrr+!", description: "Your subscription is now active." });
      onClose();
    } catch (e: any) {
      console.log("Purchase error:", JSON.stringify(e));
      if (e?.userCancelled) return;
      toast({ title: "Purchase failed", description: e?.message || JSON.stringify(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    await restorePurchases();
    toast({ title: "Purchases restored" });
  };

  return (
    <div className="paywall">

      {/* Close */}
      <button className="paywall__close" onClick={onClose} aria-label="Close">
        <X size={16} strokeWidth={2} />
      </button>

      {/* Hero */}
      <div className="paywall__hero">
        <div className="paywall__icon">🍽️</div>
        <h2 className="paywall__title">dinrr+</h2>
        <p className="paywall__subtitle">Plan meals together as a family</p>
      </div>

      {/* Features comparison */}
      <div className="paywall__features">
        <div className="paywall__col">
          <p className="paywall__col-label">Free</p>
          {FEATURES_FREE.map((f, i) => (
            <div key={i} className="paywall__feature paywall__feature--free">
              <span className="paywall__feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
        <div className="paywall__col paywall__col--premium">
          <p className="paywall__col-label">Premium</p>
          {FEATURES_PREMIUM.map((f, i) => (
            <div key={i} className="paywall__feature">
              <span className="paywall__feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan selector */}
      <div className="paywall__plans">
        <button
          className={`paywall__plan${selectedPlan === "yearly" ? " is-selected" : ""}`}
          onClick={() => setSelectedPlan("yearly")}
        >
          <div className="paywall__plan-badge">Best value</div>
          <p className="paywall__plan-name">Yearly</p>
          <p className="paywall__plan-price">{yearlyPrice}<span>/yr</span></p>
          <p className="paywall__plan-sub">{yearlyPerMonth}</p>
        </button>
        <button
          className={`paywall__plan${selectedPlan === "monthly" ? " is-selected" : ""}`}
          onClick={() => setSelectedPlan("monthly")}
        >
          <p className="paywall__plan-name">Monthly</p>
          <p className="paywall__plan-price">{monthlyPrice}<span>/mo</span></p>
          <p className="paywall__plan-sub">Cancel anytime</p>
        </button>
      </div>

      {/* CTA */}
      <div className="paywall__footer">
        <button
          className="paywall__cta"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? "Loading..." : `Get ${selectedPlan === "yearly" ? "Yearly" : "Monthly"}`}
        </button>
        <button className="paywall__restore" onClick={handleRestore}>
          Restore purchases
        </button>
        <p className="paywall__legal">
          Subscription renews automatically. Cancel anytime in Settings.
        </p>
        <p className="paywall__legal" style={{ marginTop: "6px" }}>
          <a
            href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--ink-3)", textDecoration: "underline" }}
          >
            Terms of Use
          </a>
          {" · "}
          <a
            href="https://lojsifjosidjfoijfoij.github.io/dinrr-site/privacy.html"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--ink-3)", textDecoration: "underline" }}
          >
            Privacy Policy
          </a>
        </p>
      </div>

    </div>
  );
};

export default Paywall;
