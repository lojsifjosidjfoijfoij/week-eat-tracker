import { useState, useEffect, useRef } from "react";
import { RotateCcw, ShoppingCart, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFamily } from "@/contexts/FamilyContext";
import { supabase } from "@/lib/supabase";
import DayCard from "./DayCard";
import ShoppingList from "./ShoppingList";
import { saveMealToWidget } from "@/lib/sharedStorage";

interface Ingredient {
  id: string;
  name: string;
  checked: boolean;
}

interface DayData {
  meal: string;
  ingredients: Ingredient[];
}

type WeekData = { [key: number]: DayData };

const EMPTY_WEEK = (days: string[]): WeekData =>
  days.reduce((acc, _, index) => {
    acc[index] = { meal: "", ingredients: [] };
    return acc;
  }, {} as WeekData);

const loadExtras = (): Ingredient[] => {
  try {
    const stored = localStorage.getItem("dinrr_extras");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveExtras = (extras: Ingredient[]) => {
  localStorage.setItem("dinrr_extras", JSON.stringify(extras));
};

const SWIPE_THRESHOLD = 64;

const WeeklyPlanner = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { familyId } = useFamily();

  const DAYS = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday];

  const [weekData, setWeekData] = useState<WeekData>(EMPTY_WEEK(DAYS));
  const [extras, setExtras] = useState<Ingredient[]>(loadExtras);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Pull-to-refresh state
  const swipeStartY = useRef<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (familyId) {
      loadFromSupabase();
    } else {
      const saved = localStorage.getItem("mealWeekPlanner");
      if (saved) { try { setWeekData(JSON.parse(saved)); } catch {} }
    }
  }, [familyId]);

  useEffect(() => {
    if (!familyId) localStorage.setItem("mealWeekPlanner", JSON.stringify(weekData));
    saveMealToWidget(weekData);
  }, [weekData, familyId]);

  useEffect(() => {
    saveExtras(extras);
  }, [extras]);

  const loadFromSupabase = async () => {
    if (!familyId) return;
    setLoading(true);
    const [mealsRes, ingredientsRes] = await Promise.all([
      supabase.from("meal_plans").select("*").eq("family_id", familyId),
      supabase.from("ingredients").select("*").eq("family_id", familyId),
    ]);
    const newData = EMPTY_WEEK(DAYS);
    mealsRes.data?.forEach((m) => {
      if (newData[m.day_index] !== undefined) newData[m.day_index].meal = m.meal || "";
    });
    ingredientsRes.data?.forEach((ing) => {
      if (newData[ing.day_index] !== undefined)
        newData[ing.day_index].ingredients.push({ id: ing.id, name: ing.name, checked: ing.checked });
    });
    setWeekData(newData);
    setLoading(false);
  };

  // ── Pull-down-from-top to refresh (Instagram-style) ─────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (familyId && scrollTop <= 0) {
      swipeStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStartY.current === null) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 0) {
      swipeStartY.current = null;
      setSwipeDistance(0);
      return;
    }
    // Positive distance = pulling downward (Y increasing)
    const delta = e.touches[0].clientY - swipeStartY.current;
    if (delta > 0) {
      setSwipeDistance(Math.min(delta, SWIPE_THRESHOLD * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (swipeDistance >= SWIPE_THRESHOLD) {
      // Detach indicator from finger — switch to spinning wheel
      setSwipeDistance(0);
      swipeStartY.current = null;
      setRefreshing(true);
      await loadFromSupabase();
      setRefreshing(false);
    } else {
      swipeStartY.current = null;
      setSwipeDistance(0);
    }
  };

  const handleMealChange = async (dayIndex: number, meal: string) => {
    setWeekData((prev) => ({ ...prev, [dayIndex]: { ...prev[dayIndex], meal } }));
    if (familyId) {
      const existing = await supabase.from("meal_plans").select("id").eq("family_id", familyId).eq("day_index", dayIndex).single();
      if (existing.data) {
        await supabase.from("meal_plans").update({ meal }).eq("id", existing.data.id);
      } else {
        await supabase.from("meal_plans").insert({ family_id: familyId, day_index: dayIndex, meal });
      }
    }
  };

  const handleAddIngredient = async (dayIndex: number, name: string) => {
    const id = `${dayIndex}-${Date.now()}`;
    const newIngredient: Ingredient = { id, name, checked: false };
    setWeekData((prev) => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], ingredients: [...prev[dayIndex].ingredients, newIngredient] },
    }));
    if (familyId) {
      await supabase.from("ingredients").insert({ id, family_id: familyId, day_index: dayIndex, name, checked: false });
    }
  };

  const handleToggleIngredient = async (dayIndex: number, id: string) => {
    const ingredient = weekData[dayIndex].ingredients.find((i) => i.id === id);
    if (!ingredient) return;
    setWeekData((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        ingredients: prev[dayIndex].ingredients.map((ing) =>
          ing.id === id ? { ...ing, checked: !ing.checked } : ing
        ),
      },
    }));
    if (familyId) {
      await supabase.from("ingredients").update({ checked: !ingredient.checked }).eq("id", id);
    }
  };

  const handleDeleteIngredient = async (dayIndex: number, id: string) => {
    setWeekData((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        ingredients: prev[dayIndex].ingredients.filter((ing) => ing.id !== id),
      },
    }));
    if (familyId) {
      await supabase.from("ingredients").delete().eq("id", id);
    }
  };

  // ── Extras handlers ──────────────────────────────────
  const handleAddExtra = (name: string) => {
    const id = `extra-${Date.now()}`;
    setExtras((prev) => [...prev, { id, name, checked: false }]);
  };

  const handleToggleExtra = (id: string) => {
    setExtras((prev) =>
      prev.map((e) => (e.id === id ? { ...e, checked: !e.checked } : e))
    );
  };

  const handleDeleteExtra = (id: string) => {
    setExtras((prev) => prev.filter((e) => e.id !== id));
  };

  const handleResetWeek = async () => {
    setShowResetConfirm(false);
    setResetKey((prev) => prev + 1);
    setWeekData(EMPTY_WEEK(DAYS));
    if (familyId) {
      await supabase.from("meal_plans").delete().eq("family_id", familyId);
      await supabase.from("ingredients").delete().eq("family_id", familyId);
    } else {
      localStorage.removeItem("mealWeekPlanner");
    }
    // Extras are intentionally NOT cleared on week reset —
    // staples like toilet paper carry over week to week.
  };

  const getAllIngredients = () => {
    const all: { id: string; name: string; checked: boolean; day: string; dayIndex: number }[] = [];
    DAYS.forEach((day, index) => {
      weekData[index].ingredients.forEach((ing) => { all.push({ ...ing, day, dayIndex: index }); });
    });
    return all;
  };

  const allIngredients = getAllIngredients();
  const uncheckedCount =
    allIngredients.filter((i) => !i.checked).length +
    extras.filter((e) => !e.checked).length;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator — tracks finger while pulling, then spins freely */}
      {(swipeDistance > 0 || refreshing) && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: refreshing ? "40px" : `${Math.min(swipeDistance * 0.5, 40)}px`,
          opacity: refreshing ? 1 : Math.min(swipeDistance / SWIPE_THRESHOLD, 1),
          overflow: "hidden",
        }}>
          <RefreshCw
            size={18}
            style={{
              color: "var(--ink-3)",
              animation: refreshing ? "spin 0.7s linear infinite" : undefined,
              transform: refreshing ? undefined : `rotate(${swipeDistance * 3}deg)`,
            }}
          />
        </div>
      )}

      <div className="action-bar">
        <button className="btn-shopping" onClick={() => setShowShoppingList(true)}>
          <ShoppingCart size={16} strokeWidth={2} />
          {t.shoppingList}
          {uncheckedCount > 0 && (
            <span className="item-count">{uncheckedCount}</span>
          )}
        </button>
        <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
          <RotateCcw size={14} strokeWidth={2} />
          {t.resetWeek}
        </button>
      </div>

      {loading && <p className="sync-note">{t.syncingWithFamily}</p>}

      <div className="week-grid">
        {DAYS.map((day, index) => (
          <div
            key={`${index}-${resetKey}`}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.04}s` }}
          >
            <DayCard
              day={day}
              meal={weekData[index].meal}
              ingredients={weekData[index].ingredients}
              onMealChange={(meal) => handleMealChange(index, meal)}
              onAddIngredient={(name) => handleAddIngredient(index, name)}
              onToggleIngredient={(id) => handleToggleIngredient(index, id)}
              onDeleteIngredient={(id) => handleDeleteIngredient(index, id)}
            />
          </div>
        ))}
      </div>

      {showShoppingList && (
        <ShoppingList
          ingredients={allIngredients}
          extras={extras}
          onClose={() => setShowShoppingList(false)}
          onToggle={handleToggleIngredient}
          onAddExtra={handleAddExtra}
          onToggleExtra={handleToggleExtra}
          onDeleteExtra={handleDeleteExtra}
        />
      )}

      {showResetConfirm && (
        <div className="alert-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="alert-box" onClick={(e) => e.stopPropagation()}>
            <h3>{t.resetWeek}</h3>
            <p>{t.confirmReset}</p>
            <div className="alert-actions">
              <button className="btn-cancel" onClick={() => setShowResetConfirm(false)}>{t.cancel}</button>
              <button className="btn-destructive" onClick={handleResetWeek}>{t.resetWeek}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanner;
