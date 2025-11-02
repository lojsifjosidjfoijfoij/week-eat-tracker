import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import IngredientItem from "./IngredientItem";

interface Ingredient {
  id: string;
  name: string;
  checked: boolean;
}

interface DayCardProps {
  day: string;
  meal: string;
  ingredients: Ingredient[];
  onMealChange: (meal: string) => void;
  onAddIngredient: (name: string) => void;
  onToggleIngredient: (id: string) => void;
  onDeleteIngredient: (id: string) => void;
}

const DayCard = ({
  day,
  meal,
  ingredients,
  onMealChange,
  onAddIngredient,
  onToggleIngredient,
  onDeleteIngredient,
}: DayCardProps) => {
  const [newIngredient, setNewIngredient] = useState("");
  const [isAddingMeal, setIsAddingMeal] = useState(!meal);
  const [suggestedIngredients, setSuggestedIngredients] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const completedCount = ingredients.filter((i) => i.checked).length;
  const totalCount = ingredients.length;
  const isComplete = totalCount > 0 && completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      onAddIngredient(newIngredient.trim());
      setNewIngredient("");
    }
  };

  const handleMealBlur = async () => {
    if (meal && meal !== "") {
      setIsAddingMeal(false);
      // Only fetch suggestions if there are no ingredients yet
      if (ingredients.length === 0) {
        await fetchSuggestions(meal);
      }
    }
  };

  const fetchSuggestions = async (mealName: string) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-ingredients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ mealName, language: t.languageCode }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get suggestions");
      }

      const data = await response.json();
      setSuggestedIngredients(data.ingredients || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        title: t.couldntGetSuggestions,
        description: error instanceof Error ? error.message : t.pleaseTryAgain,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddSuggestedIngredient = (ingredient: string) => {
    onAddIngredient(ingredient);
    setSuggestedIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const handleDismissSuggestions = () => {
    setSuggestedIngredients([]);
  };

  return (
    <Card className="day-card relative overflow-hidden">
      {isComplete && (
        <div className="absolute top-3 right-3 text-secondary animate-scale-in">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center justify-between">
          <span className="text-primary">{day}</span>
          {totalCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          )}
        </CardTitle>
        
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meal Name */}
        {isAddingMeal ? (
          <div className="flex gap-2">
            <Input
              placeholder={t.enterMealName}
              value={meal}
              onChange={(e) => onMealChange(e.target.value)}
              onBlur={handleMealBlur}
              onKeyPress={(e) => e.key === "Enter" && handleMealBlur()}
              autoFocus
              className="border-primary/50 focus:border-primary"
            />
          </div>
        ) : (
          <div
            onClick={() => setIsAddingMeal(true)}
            className="cursor-pointer group"
          >
            {meal ? (
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {meal}
              </h3>
            ) : (
              <p className="text-muted-foreground group-hover:text-primary transition-colors">
                + {t.addMeal}
              </p>
            )}
          </div>
        )}

        {/* AI Suggestions */}
        {isLoadingSuggestions && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>{t.gettingSuggestions}</span>
          </div>
        )}

        {suggestedIngredients.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" />
                {t.suggestedIngredients}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissSuggestions}
                className="h-auto py-1 px-2 text-xs"
              >
                {t.dismiss}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedIngredients.map((ingredient, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSuggestedIngredient(ingredient)}
                  className="text-xs hover:bg-secondary hover:text-secondary-foreground hover:border-secondary"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {ingredient}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients List */}
        {ingredients.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            {ingredients.map((ingredient) => (
              <IngredientItem
                key={ingredient.id}
                ingredient={ingredient}
                onToggle={() => onToggleIngredient(ingredient.id)}
                onDelete={() => onDeleteIngredient(ingredient.id)}
              />
            ))}
          </div>
        )}

        {/* Add Ingredient */}
        <div className="flex gap-2">
          <Input
            placeholder={t.addIngredient}
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddIngredient()}
            className="border-dashed"
          />
          <Button
            onClick={handleAddIngredient}
            size="icon"
            variant="outline"
            className="shrink-0 hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DayCard;
