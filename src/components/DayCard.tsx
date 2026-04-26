import { useState } from "react";
import { Plus, Trash2, Sparkles, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
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
  const { isPremium, openPaywall } = usePremium();

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
      if (ingredients.length === 0 && isPremium) {
        await fetchSuggestions(meal);
      }
    }
  };

  const fetchSuggestions = async (mealName: string) => {
    setIsLoadingSuggestions(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { return; }
      const token = session.access_token;
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
    <div className="day-card animate-fade-in">

      <div className="day-card__hd">
        <span className="day-card__label">{day}</span>
        {totalCount > 0 && (
          <div className="day-card__progress">
            <span className="day-card__progress-count">{completedCount}/{totalCount}</span>
            <div className="day-card__bar">
              <div className="day-card__fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="day-card__body">

        {isEditingMeal ? (
          <input
            type="text"
            placeholder={t.enterMealName}
            value={meal}
            onChange={(e) => onMealChange(e.target.value)}
            onBlur={handleMealBlur}
            onKeyPress={(e) => e.key === "Enter" && handleMealBlur()}
            autoFocus
            className="meal-input"
          />
        ) : (
          <button
            onClick={() => setIsEditingMeal(true)}
            className={`meal-display${!meal ? " meal-display--empty" : ""}`}
          >
            {meal || t.addMeal}
          </button>
        )}

        {/* AI loading */}
        {isLoadingSuggestions && (
          <div className="ai-loading">
            <Sparkles size={12} />
            <span>{t.gettingSuggestions}</span>
          </div>
        )}

        {/* AI suggestions — premium only */}
        {isPremium && suggestedIngredients.length > 0 && (
          <div>
            <div className="ai-bar">
              <span className="ai-label">
                <Sparkles size={10} />
                {t.suggestedIngredients}
              </span>
              <button className="ai-dismiss" onClick={() => setSuggestedIngredients([])}>
                {t.dismiss}
              </button>
            </div>
            <div className="suggestion-chips">
              {suggestedIngredients.map((ingredient, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => {
                    onAddIngredient(ingredient);
                    setSuggestedIngredients((prev) => prev.filter((i) => i !== ingredient));
                  }}
                >
                  + {ingredient}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Premium upsell for AI — free users only, only when meal is set */}
        {!isPremium && meal && ingredients.length === 0 && (
          <button className="premium-gate" onClick={openPaywall}>
            <span className="premium-gate__icon">✨</span>
            <div className="premium-gate__text">
              <p className="premium-gate__label">AI ingredient suggestions</p>
              <p className="premium-gate__sub">Upgrade to Premium</p>
            </div>
            <Lock size={14} className="premium-gate__arrow" />
          </button>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div className="ingredient-list">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="ingredient-row">
                <button
                  className={`ingredient-check${ingredient.checked ? " is-checked" : ""}`}
                  onClick={() => onToggleIngredient(ingredient.id)}
                />
                <span className={`ingredient-name${ingredient.checked ? " is-checked" : ""}`}>
                  {ingredient.name}
                </span>
                <button
                  className="ingredient-delete"
                  onClick={() => onDeleteIngredient(ingredient.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="add-row">
          <input
            type="text"
            placeholder={t.addIngredient}
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddIngredient()}
          />
          <button onClick={handleAddIngredient}>
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default DayCard;
