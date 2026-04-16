import { useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

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
  day, meal, ingredients,
  onMealChange, onAddIngredient, onToggleIngredient, onDeleteIngredient,
}: DayCardProps) => {
  const [newIngredient, setNewIngredient] = useState("");
  const [isEditingMeal, setIsEditingMeal] = useState(!meal);
  const [suggestedIngredients, setSuggestedIngredients] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const completedCount = ingredients.filter((i) => i.checked).length;
  const totalCount = ingredients.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      onAddIngredient(newIngredient.trim());
      setNewIngredient("");
    }
  };

  const handleMealBlur = async () => {
    if (meal && meal !== "") {
      setIsEditingMeal(false);
      if (ingredients.length === 0) await fetchSuggestions(meal);
    }
  };

  const fetchSuggestions = async (mealName: string) => {
    setIsLoadingSuggestions(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-ingredients`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ mealName, language: t.languageCode }),
        }
      );
      if (!response.ok) throw new Error((await response.json()).error || "Failed");
      const data = await response.json();
      setSuggestedIngredients(data.ingredients || []);
    } catch (error) {
      toast({
        title: t.couldntGetSuggestions,
        description: error instanceof Error ? error.message : t.pleaseTryAgain,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border animate-fade-in overflow-hidden">

      {/* ── Card header: day label + progress ── */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          {day}
        </span>
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{completedCount}/{totalCount}</span>
            <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="px-3 pt-3 pb-3">

        {/* Meal name — Playfair for visual weight */}
        {isEditingMeal ? (
          <input
            type="text"
            placeholder={t.enterMealName}
            value={meal}
            onChange={(e) => onMealChange(e.target.value)}
            onBlur={handleMealBlur}
            onKeyPress={(e) => e.key === "Enter" && handleMealBlur()}
            autoFocus
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="w-full bg-transparent text-base font-normal text-foreground outline-none placeholder:text-muted-foreground/40 mb-3"
          />
        ) : (
          <button onClick={() => setIsEditingMeal(true)} className="text-left w-full mb-3 group">
            {meal ? (
              <span
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-base text-foreground group-hover:opacity-60 transition-opacity"
              >
                {meal}
              </span>
            ) : (
              <span className="text-sm font-light text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                {t.addMeal}
              </span>
            )}
          </button>
        )}

        {/* AI loading */}
        {isLoadingSuggestions && (
          <div className="flex items-center gap-1.5 mb-3 animate-fade-in">
            <Sparkles className="h-3 w-3 text-muted-foreground animate-pulse" />
            <span className="text-xs text-muted-foreground">{t.gettingSuggestions}</span>
          </div>
        )}

        {/* AI suggestions */}
        {suggestedIngredients.length > 0 && (
          <div className="mb-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {t.suggestedIngredients}
              </span>
              <button
                onClick={() => setSuggestedIngredients([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.dismiss}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedIngredients.map((ingredient, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onAddIngredient(ingredient);
                    setSuggestedIngredients((prev) => prev.filter((i) => i !== ingredient));
                  }}
                  className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-150"
                >
                  + {ingredient}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients list */}
        {ingredients.length > 0 && (
          <div className="mb-2.5 border-t border-border/50 pt-2.5">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center gap-2 py-1.5 group border-b border-border/30 last:border-b-0"
              >
                <button
                  onClick={() => onToggleIngredient(ingredient.id)}
                  className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    ingredient.checked
                      ? "bg-foreground border-foreground"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  {ingredient.checked && (
                    <div className="w-1.5 h-1.5 rounded-full bg-background" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm font-light transition-all ${
                    ingredient.checked
                      ? "line-through text-muted-foreground/40"
                      : "text-foreground"
                  }`}
                >
                  {ingredient.name}
                </span>
                <button
                  onClick={() => onDeleteIngredient(ingredient.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add ingredient row */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/40">
          <input
            type="text"
            placeholder={t.addIngredient}
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddIngredient()}
            className="flex-1 bg-transparent text-sm font-light outline-none placeholder:text-muted-foreground/35"
          />
          <button
            onClick={handleAddIngredient}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayCard;