import { useState, useEffect } from "react";
import { RotateCcw, ShoppingCart, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFamily } from "@/contexts/FamilyContext";
import { supabase } from "@/lib/supabase";
import DayCard from "./DayCard";
import ShoppingList from "./ShoppingList";
import Settings from "@/pages/Settings";
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

type WeekData = {
  [key: number]: DayData;
};

const EMPTY_WEEK = (days: string[]): WeekData =>
  days.reduce((acc, _, index) => {
    acc[index] = { meal: "", ingredients: [] };
    return acc;
  }, {} as WeekData);

const WeeklyPlanner = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { familyId, createFamily, joinFamily, leaveFamily } = useFamily();

  const DAYS = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday];

  const [weekData, setWeekData] = useState<WeekData>(EMPTY_WEEK(DAYS));
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (familyId) {
      loadFromSupabase();
    } else {
      const saved = localStorage.getItem("mealWeekPlanner");
      if (saved) {
        try { setWeekData(JSON.parse(saved)); } catch {}
      }
    }
  }, [familyId]);

 useEffect(() => {
  if (!familyId) {
    localStorage.setItem("mealWeekPlanner", JSON.stringify(weekData));
  }
  saveMealToWidget(weekData);
}, [weekData, familyId]);

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
      if (newData[ing.day_index] !== undefined) {
        newData[ing.day_index].ingredients.push({ id: ing.id, name: ing.name, checked: ing.checked });
      }
    });
    setWeekData(newData);
    setLoading(false);
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
    setWeekData((prev) => ({ ...prev, [dayIndex]: { ...prev[dayIndex], ingredients: [...prev[dayIndex].ingredients, newIngredient] } }));
    if (familyId) {
      await supabase.from("ingredients").insert({ id, family_id: familyId, day_index: dayIndex, name, checked: false });
    }
  };

  const handleToggleIngredient = async (dayIndex: number, id: string) => {
    const ingredient = weekData[dayIndex].ingredients.find((i) => i.id === id);
    if (!ingredient) return;
    setWeekData((prev) => ({ ...prev, [dayIndex]: { ...prev[dayIndex], ingredients: prev[dayIndex].ingredients.map((ing) => ing.id === id ? { ...ing, checked: !ing.checked } : ing) } }));
    if (familyId) {
      await supabase.from("ingredients").update({ checked: !ingredient.checked }).eq("id", id);
    }
  };

  const handleDeleteIngredient = async (dayIndex: number, id: string) => {
    setWeekData((prev) => ({ ...prev, [dayIndex]: { ...prev[dayIndex], ingredients: prev[dayIndex].ingredients.filter((ing) => ing.id !== id) } }));
    if (familyId) {
      await supabase.from("ingredients").delete().eq("id", id);
    }
  };

  const handleResetWeek = async () => {
    setResetKey(prev => prev + 1);
    setWeekData(EMPTY_WEEK(DAYS));
    if (familyId) {
      await supabase.from("meal_plans").delete().eq("family_id", familyId);
      await supabase.from("ingredients").delete().eq("family_id", familyId);
    } else {
      localStorage.removeItem("mealWeekPlanner");
    }
  };

  const getAllIngredients = () => {
    const all: { id: string; name: string; checked: boolean; day: string; dayIndex: number }[] = [];
    DAYS.forEach((day, index) => {
      weekData[index].ingredients.forEach((ing) => { all.push({ ...ing, day, dayIndex: index }); });
    });
    return all;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button onClick={() => setShowShoppingList(!showShoppingList)} className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-md">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t.shoppingList}
          </Button>
          <Button onClick={() => setShowSettings(true)} variant="outline">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t.resetWeek}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset the week?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all meals and ingredients. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetWeek} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {showShoppingList && (
          <ShoppingList
            ingredients={getAllIngredients()}
            onClose={() => setShowShoppingList(false)}
            onToggle={handleToggleIngredient}
          />
        )}

        {loading && <div className="text-center py-4 text-muted-foreground animate-pulse">Syncing with family...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DAYS.map((day, index) => (
            <div key={`${index}-${resetKey}`} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
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

        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
};

export default WeeklyPlanner;
