import { useState, useEffect } from "react";
import { RotateCcw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DayCard from "./DayCard";
import ShoppingList from "./ShoppingList";

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
  [key: string]: DayData;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WeeklyPlanner = () => {
  const { toast } = useToast();
  const [weekData, setWeekData] = useState<WeekData>(() => {
    const saved = localStorage.getItem("mealWeekPlanner");
    if (saved) {
      return JSON.parse(saved);
    }
    return DAYS.reduce((acc, day) => {
      acc[day] = { meal: "", ingredients: [] };
      return acc;
    }, {} as WeekData);
  });

  const [showShoppingList, setShowShoppingList] = useState(false);

  useEffect(() => {
    localStorage.setItem("mealWeekPlanner", JSON.stringify(weekData));
  }, [weekData]);

  const handleMealChange = (day: string, meal: string) => {
    setWeekData((prev) => ({
      ...prev,
      [day]: { ...prev[day], meal },
    }));
  };

  const handleAddIngredient = (day: string, name: string) => {
    const newIngredient: Ingredient = {
      id: `${day}-${Date.now()}`,
      name,
      checked: false,
    };
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ingredients: [...prev[day].ingredients, newIngredient],
      },
    }));
  };

  const handleToggleIngredient = (day: string, id: string) => {
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ingredients: prev[day].ingredients.map((ing) =>
          ing.id === id ? { ...ing, checked: !ing.checked } : ing
        ),
      },
    }));
  };

  const handleDeleteIngredient = (day: string, id: string) => {
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ingredients: prev[day].ingredients.filter((ing) => ing.id !== id),
      },
    }));
  };

  const handleResetWeek = () => {
    setWeekData(
      DAYS.reduce((acc, day) => {
        acc[day] = { meal: "", ingredients: [] };
        return acc;
      }, {} as WeekData)
    );
    toast({
      title: "Week reset",
      description: "Your meal plan has been cleared.",
    });
  };

  const getAllIngredients = () => {
    const allIngredients: { name: string; checked: boolean; day: string }[] = [];
    DAYS.forEach((day) => {
      weekData[day].ingredients.forEach((ing) => {
        allIngredients.push({ ...ing, day });
      });
    });
    return allIngredients;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MealWeek Planner
          </h1>
          <p className="text-muted-foreground text-lg">
            Plan your meals and track your ingredients for the week
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8 animate-fade-in">
          <Button
            onClick={() => setShowShoppingList(!showShoppingList)}
            className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-md"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Shopping List
          </Button>
          <Button
            onClick={handleResetWeek}
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Week
          </Button>
        </div>

        {/* Shopping List Modal */}
        {showShoppingList && (
          <ShoppingList
            ingredients={getAllIngredients()}
            onClose={() => setShowShoppingList(false)}
          />
        )}

        {/* Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <DayCard
                day={day}
                meal={weekData[day].meal}
                ingredients={weekData[day].ingredients}
                onMealChange={(meal) => handleMealChange(day, meal)}
                onAddIngredient={(name) => handleAddIngredient(day, name)}
                onToggleIngredient={(id) => handleToggleIngredient(day, id)}
                onDeleteIngredient={(id) => handleDeleteIngredient(day, id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;
