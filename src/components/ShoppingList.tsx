import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShoppingListProps {
  ingredients: { id: string; name: string; checked: boolean; day: string; dayIndex: number }[];
  onClose: () => void;
  onToggle: (dayIndex: number, id: string) => void;
}

const ShoppingList = ({ ingredients, onClose, onToggle }: ShoppingListProps) => {
  const { t } = useLanguage();

  const groupedIngredients = ingredients.reduce((acc, ing) => {
    const key = ing.name.toLowerCase();
    const existing = acc.find((item) => item.name.toLowerCase() === key);
    if (existing) {
      existing.days.push(ing.day);
      existing.items.push(ing);
    } else {
      acc.push({ name: ing.name, days: [ing.day], items: [ing] });
    }
    return acc;
  }, [] as { name: string; days: string[]; items: typeof ingredients }[]);

  const unchecked = groupedIngredients.filter((g) => g.items.some((i) => !i.checked));
  const checked = groupedIngredients.filter((g) => g.items.every((i) => i.checked));

  const handleToggle = (group: typeof groupedIngredients[0]) => {
    const allChecked = group.items.every((i) => i.checked);
    group.items.forEach((i) => {
      if (allChecked || !i.checked) {
        onToggle(i.dayIndex, i.id);
      }
    });
  };

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
              {unchecked.map((group, index) => (
                <div
                  key={group.name}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  onClick={() => handleToggle(group)}
                >
                  <Checkbox checked={false} onCheckedChange={() => handleToggle(group)} className="shrink-0 pointer-events-none" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{group.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {group.days.map((day, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{day}</Badge>
                      ))}
                    </div>
                  </div>
                  {group.days.length > 1 && (
                    <Badge variant="outline" className="ml-2 shrink-0">×{group.days.length}</Badge>
                  )}
                </div>
              ))}

              {checked.length > 0 && unchecked.length > 0 && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">In basket</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {checked.map((group) => (
                <div
                  key={group.name}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 transition-colors cursor-pointer opacity-60"
                  onClick={() => handleToggle(group)}
                >
                  <Checkbox checked={true} onCheckedChange={() => handleToggle(group)} className="shrink-0 pointer-events-none" />
                  <div className="flex-1">
                    <p className="font-medium line-through text-muted-foreground">{group.name}</p>
                  </div>
                </div>
              ))}

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
