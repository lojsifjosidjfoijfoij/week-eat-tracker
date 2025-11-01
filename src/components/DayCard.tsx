import { useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              placeholder="Enter meal name..."
              value={meal}
              onChange={(e) => onMealChange(e.target.value)}
              onBlur={() => meal && setIsAddingMeal(false)}
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
                + Add meal
              </p>
            )}
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
            placeholder="Add ingredient..."
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
