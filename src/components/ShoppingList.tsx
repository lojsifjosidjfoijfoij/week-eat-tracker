import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShoppingListProps {
  ingredients: { name: string; checked: boolean; day: string }[];
  onClose: () => void;
}

const ShoppingList = ({ ingredients, onClose }: ShoppingListProps) => {
  // Group ingredients by name and aggregate days
  const groupedIngredients = ingredients.reduce((acc, ing) => {
    const existing = acc.find((item) => item.name.toLowerCase() === ing.name.toLowerCase());
    if (existing) {
      existing.days.push(ing.day);
      if (ing.checked) existing.checkedCount++;
    } else {
      acc.push({
        name: ing.name,
        days: [ing.day],
        checkedCount: ing.checked ? 1 : 0,
      });
    }
    return acc;
  }, [] as { name: string; days: string[]; checkedCount: number }[]);

  const uncheckedIngredients = groupedIngredients.filter(
    (ing) => ing.checkedCount < ing.days.length
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-2xl">Shopping List</CardTitle>
          <Button onClick={onClose} size="icon" variant="ghost">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh] p-6">
          {uncheckedIngredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg">🎉 All ingredients are checked off!</p>
              <p className="text-sm mt-2">You're all set for the week.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uncheckedIngredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{ingredient.name}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingList;
