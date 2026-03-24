import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShoppingListProps {
  ingredients: { name: string; checked: boolean; day: string }[];
  onClose: () => void;
}

const ShoppingList = ({ ingredients, onClose }: ShoppingListProps) => {
  const { t } = useLanguage();

  // Group ingredients by name and aggregate days
  const groupedIngredients = ingredients.reduce((acc, ing) => {
    const existing = acc.find(
      (item) => item.name.toLowerCase() === ing.name.toLowerCase()
    );
    if (existing) {
      existing.days.push(ing.day);
    } else {
      acc.push({
        name: ing.name,
        days: [ing.day],
      });
    }
    return acc;
  }, [] as { name: string; days: string[] }[]);

  // Local checked state for the shopping list
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (name: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [name.toLowerCase()]: !prev[name.toLowerCase()],
    }));
  };

  const unchecked = groupedIngredients.filter(
    (ing) => !checkedItems[ing.name.toLowerCase()]
  );
  const checked = groupedIngredients.filter(
    (ing) => checkedItems[ing.name.toLowerCase()]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[85vh] overflow-hidden animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-2xl">{t.shoppingList}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {checked.length}/{groupedIngredients.length} items checked
            </p>
          </div>
          <Button onClick={onClose} size="icon" variant="ghost">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[70vh] p-6">
          {groupedIngredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg">No ingredients added yet!</p>
              <p className="text-sm mt-2">Add meals and ingredients to your week first.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Unchecked items */}
              {unchecked.map((ingredient, index) => (
                <div
                  key={ingredient.name}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  onClick={() => toggleItem(ingredient.name)}
                >
                  <Checkbox
  checked={false}
  onCheckedChange={() => toggleItem(ingredient.name)}
  className="shrink-0 pointer-events-none"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{ingredient.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ingredient.days.map((day, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs bg-primary/10 text-primary border-primary/20"
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {ingredient.days.length > 1 && (
                    <Badge variant="outline" className="ml-2 shrink-0">
                      ×{ingredient.days.length}
                    </Badge>
                  )}
                </div>
              ))}

              {/* Divider between checked and unchecked */}
              {checked.length > 0 && unchecked.length > 0 && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">In basket</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {/* Checked items */}
              {checked.map((ingredient) => (
                <div
                  key={ingredient.name}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 transition-colors cursor-pointer opacity-60"
                  onClick={() => toggleItem(ingredient.name)}
                >
                  <Checkbox
  checked={true}
  onCheckedChange={() => toggleItem(ingredient.name)}
  className="shrink-0 pointer-events-none"
                  />
                  <div className="flex-1">
                    <p className="font-medium line-through text-muted-foreground">
                      {ingredient.name}
                    </p>
                  </div>
                </div>
              ))}

              {/* All done message */}
              {checked.length === groupedIngredients.length && groupedIngredients.length > 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-lg">🎉 All done!</p>
                  <p className="text-sm mt-1">You're all set for the week.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingList;