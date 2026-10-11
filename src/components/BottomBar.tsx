import { memo } from "react";
import { ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FamilyMember } from "@/contexts/FamilyContext";

type Props = {
  members: FamilyMember[];
  myId: string;
  familyName: string | null;
  live: boolean;
  openCount: number;
  onShop: () => void;
};

const initial = (m: FamilyMember) => (m.name?.trim() || m.email?.trim() || "?").charAt(0).toUpperCase();

/** Floating bar: who's planning with you, and the shopping list. */
const BottomBar = ({ members, myId, familyName, live, openCount, onShop }: Props) => {
  const { t, f } = useLanguage();
  // You first, then the rest
  const sorted = [...members].sort((a, b) => (a.user_id === myId ? -1 : b.user_id === myId ? 1 : 0));
  const shown = sorted.slice(0, 3);
  const extra = sorted.length - shown.length;

  return (
    <div className="bottom-bar">
      {familyName && members.length > 0 && (
        <div className="bottom-bar__family" aria-label={live ? f(t.liveWith, { family: familyName }) : familyName}>
          <div className="avatars" aria-hidden>
            {shown.map((m, i) => (
              <span key={m.user_id} className={`avatar avatar--${i}`}>{initial(m)}</span>
            ))}
            {extra > 0 && <span className="avatar avatar--more">+{extra}</span>}
          </div>
          {live && (
            <span className="live-tag" aria-hidden>
              <span className="live-dot" />
              {t.live}
            </span>
          )}
        </div>
      )}
      <button className="shop-btn" onClick={onShop}>
        <ShoppingCart size={17} strokeWidth={2} />
        {t.shoppingList}
        {openCount > 0 && <span className="shop-btn__count">{openCount}</span>}
      </button>
    </div>
  );
};

export default memo(BottomBar);
