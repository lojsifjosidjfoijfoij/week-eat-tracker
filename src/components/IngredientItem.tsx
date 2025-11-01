import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Ingredient {
  id: string;
  name: string;
  checked: boolean;
}

interface IngredientItemProps {
  ingredient: Ingredient;
  onToggle: () => void;
  onDelete: () => void;
}

const IngredientItem = ({ ingredient, onToggle, onDelete }: IngredientItemProps) => {
  return (
    <div className="flex items-center gap-3 group animate-slide-up">
      <Checkbox
        id={ingredient.id}
        checked={ingredient.checked}
        onCheckedChange={onToggle}
        className="ingredient-checkbox"
      />
      <label
        htmlFor={ingredient.id}
        className={`flex-1 cursor-pointer transition-all duration-200 ${
          ingredient.checked
            ? "line-through text-muted-foreground"
            : "text-foreground"
        }`}
      >
        {ingredient.name}
      </label>
      <Button
        onClick={onDelete}
        size="icon"
        variant="ghost"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default IngredientItem;
