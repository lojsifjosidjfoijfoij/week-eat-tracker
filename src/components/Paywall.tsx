import { useState } from "react";
import { X, Check, Sparkles, Users, ShoppingCart, Zap } from "lucide-react";
import { usePremium, PRODUCT_IDS } from "@/contexts/PremiumContext";
import { useToast } from "@/hooks/use-toast";

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
  const { restorePurchases } = usePremium();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // TODO: When Apple Developer account is ready, replace with:
      // const { Purchases } = await import("@revenuecat/purchases-capacitor");
      // const offerings = await Purchases.getOfferings();
      // const pkg = selectedPlan === "yearly"
      //   ? offerings.current?.annual
      //   : offerings.current?.monthly;
      // if (pkg) await Purchases.purchasePackage({ aPackage: pkg });

      toast({
        title: "Coming soon",
        description: "Subscriptions will be available when the app launches on the App Store.",
      });
    } catch (e) {
      toast({ title: "Purchase failed", variant: "destructive" });
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
          <p className="paywall__plan-price">€29.99<span>/yr</span></p>
          <p className="paywall__plan-sub">€2.50 / month</p>
        </button>
        <button
          className={`paywall__plan${selectedPlan === "monthly" ? " is-selected" : ""}`}
          onClick={() => setSelectedPlan("monthly")}
        >
          <p className="paywall__plan-name">Monthly</p>
          <p className="paywall__plan-price">€3.99<span>/mo</span></p>
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
      </div>

    </div>
  );
};

export default Paywall;
