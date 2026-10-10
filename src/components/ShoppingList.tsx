import { useState, useRef } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Ingredient {
  id: string;
  name: string;
  checked: boolean;
}

interface ShoppingListProps {
  ingredients: { id: string; name: string; checked: boolean; day: string; dayIndex: number }[];
  extras: Ingredient[];
  onClose: () => void;
  onToggle: (dayIndex: number, id: string) => void;
  onAddExtra: (name: string) => void;
  onToggleExtra: (id: string) => void;
  onDeleteExtra: (id: string) => void;
}

type AisleKey =
  | "aisleFreshLabel"
  | "aisleMeatFishLabel"
  | "aisleDairyLabel"
  | "aislePantryLabel"
  | "aisleDrinksSnacksLabel"
  | "aisleHouseholdLabel"
  | "aisleOtherLabel";

const AISLE_ORDER: AisleKey[] = [
  "aisleFreshLabel",
  "aisleMeatFishLabel",
  "aisleDairyLabel",
  "aislePantryLabel",
  "aisleDrinksSnacksLabel",
  "aisleHouseholdLabel",
  "aisleOtherLabel",
];

const AISLES: { key: AisleKey; keywords: string[] }[] = [
  {
    key: "aisleFreshLabel",
    keywords: [
      "apple","banana","orange","lemon","lime","grape","strawberr","blueberr","mango",
      "peach","pear","plum","cherry","watermelon","pineapple","kiwi","avocado","tomato",
      "lettuce","spinach","kale","cabbage","broccoli","cauliflower","carrot","celery",
      "cucumber","courgette","zucchini","pepper","onion","garlic","leek","potato",
      "sweet potato","mushroom","corn","asparagus","ginger","chilli","chili","herb",
      "basil","parsley","coriander","cilantro","thyme","rosemary","mint","dill","salad",
      "vegetable","fruit","pea","green bean","aubergine","eggplant","bread","loaf",
      "baguette","roll","bun","sourdough","bagel","croissant","pita","naan","flatbread",
      "ciabatta","focaccia","brioche",
      "æble","banan","appelsin","citron","drue","jordbær","blåbær","mango","fersken",
      "pære","blomme","kirsebær","ananas","kiwi","avocado","tomat","salat","spinat",
      "grønkål","kål","broccoli","blomkål","gulerod","selleri","agurk","courgette",
      "peberfrugt","løg","hvidløg","porre","kartoffel","søde kartofler","svamp",
      "champignon","majs","asparges","ingefær","chili","krydderurter","basilikum",
      "persille","koriander","timian","rosmarin","mynte","dild","ærter","grønne bønner",
      "aubergine","brød","rugbrød","bolle","surdejsbrød","pitabrød","ciabatta","flute",
    ],
  },
  {
    key: "aisleMeatFishLabel",
    keywords: [
      "chicken","beef","pork","lamb","turkey","duck","mince","steak","sausage","bacon",
      "ham","salami","chorizo","prosciutto","pepperoni","fillet","breast","thigh","wing",
      "salmon","tuna","cod","haddock","trout","sea bass","mackerel","sardine","shrimp",
      "prawn","crab","lobster","mussel","clam","oyster","squid","fish","seafood","meat",
      "kylling","oksekød","svinekød","lam","kalkun","and","hakket","bøf","pølse","bacon",
      "skinke","salami","chorizo","filet","bryst","lår","laks","tun","torsk","rødspætte",
      "ørred","havbars","makrel","sild","rejer","krabbe","hummer","musling","fisk","kød",
    ],
  },
  {
    key: "aisleDairyLabel",
    keywords: [
      "milk","oat milk","almond milk","soy milk","butter","cream","sour cream","yogurt",
      "yoghurt","egg","eggs","cheese","cheddar","mozzarella","parmesan","feta","brie",
      "gouda","ricotta","halloumi","cream cheese","cottage cheese","quark","creme fraiche",
      "mælk","havremælk","mandelmælk","sojamælk","smør","fløde","cremefraiche",
      "yoghurt","æg","ost","cheddar","mozzarella","parmesan","feta","brie","gouda",
      "ricotta","halloumi","flødeost","hytteost","kvark",
    ],
  },
  {
    key: "aislePantryLabel",
    keywords: [
      "tortilla","wrap","flour tortilla","corn tortilla",
      "pasta","spaghetti","penne","rice","noodle","couscous","quinoa","flour","oat",
      "tin","canned","jar","beans","chickpea","lentil","tomato sauce","passata","stock",
      "broth","coconut milk","olive","pesto","soy sauce","vinegar","olive oil","sugar",
      "honey","jam","ketchup","mustard","mayo","spice","cumin","paprika","turmeric",
      "cinnamon","baking powder","breadcrumb","cereal","granola","tahini","peanut butter",
      "chocolate","cocoa","cornflour","cornstarch","kidney bean","black bean","lasagne",
      "fusilli","rigatoni","tagliatelle","linguine","macaroni","gnocchi","basmati",
      "jasmine","arborio","risotto","bulgur","polenta","sriracha","fish sauce","hoisin",
      "teriyaki","bbq sauce","balsamic","sesame oil","sunflower oil","coconut oil",
      "ris","nudler","kikærter","linser","tomatsauce","bouillon","kokosmælk","oliven",
      "sojasauce","eddike","olivenolie","sukker","honning","syltetøj","sennest","mayo",
      "krydderier","spidskommen","gurkemeje","kanel","bagepulver","rasp","müsli",
      "jordnøddesmør","chokolade","kakao","majsstivelse","havregryn","mel",
    ],
  },
  {
    key: "aisleDrinksSnacksLabel",
    keywords: [
      "juice","water","soda","cola","coffee","tea","wine","beer","cider","gin","vodka",
      "whisky","crisp","chip","popcorn","cracker","biscuit","cookie","chocolate bar",
      "sweet","candy","nut","almond","cashew","walnut","peanut","pistachio","dried fruit",
      "raisin","energy drink","smoothie","kombucha","protein shake","sparkling","lemonade",
      "vand","sodavand","kaffe","te","vin","øl","chips","kiks","småkager","slik",
      "nødder","mandler","valnød","jordnød","rosiner","energidrik",
    ],
  },
  {
    key: "aisleHouseholdLabel",
    keywords: [
      "washing","detergent","soap","shampoo","toothpaste","toilet paper","tissue",
      "kitchen roll","bin bag","cling film","foil","baking paper","cleaning","bleach",
      "sponge","dishwasher tablet",
      "vaskemiddel","sæbe","shampoo","tandpasta","toiletpapir","køkkenrulle",
      "affaldspose","husholdningsfilm","staniol","bagepapir","rengøring","svamp",
    ],
  },
];

function detectAisleKey(name: string): AisleKey {
  const lower = name.toLowerCase();
  for (const aisle of AISLES) {
    if (aisle.keywords.some((kw) => lower.includes(kw))) return aisle.key;
  }
  return "aisleOtherLabel";
}

type SortMode = "aisle" | "day";

const ShoppingList = ({
  ingredients,
  extras,
  onClose,
  onToggle,
  onAddExtra,
  onToggleExtra,
  onDeleteExtra,
}: ShoppingListProps) => {
  const { t } = useLanguage();
  const [sortMode, setSortMode] = useState<SortMode>("aisle");
  const [newExtra, setNewExtra] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddExtra = () => {
    const trimmed = newExtra.trim();
    if (!trimmed) return;
    onAddExtra(trimmed);
    setNewExtra("");
    inputRef.current?.focus();
  };

  // ── Group meal ingredients ──────────────────────────
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

  const uncheckedMeal = groupedIngredients.filter((g) => g.items.some((i) => !i.checked));
  const checkedMeal   = groupedIngredients.filter((g) => g.items.every((i) => i.checked));

  const uncheckedExtras = extras.filter((e) => !e.checked);
  const checkedExtras   = extras.filter((e) => e.checked);

  const totalItems   = groupedIngredients.length + extras.length;
  const checkedCount = checkedMeal.length + checkedExtras.length;
  const allDone      = totalItems > 0 && checkedCount === totalItems;

  // ── Aisle grouping (meal items + extras mixed) ──────
  const byAisle = (() => {
    const map = new Map<AisleKey, { name: string; days: string[]; items: typeof ingredients; extraId?: string }[]>();
    uncheckedMeal.forEach((g) => {
      const key = detectAisleKey(g.name);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    });
    uncheckedExtras.forEach((e) => {
      const key = detectAisleKey(e.name);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ name: e.name, days: [], items: [], extraId: e.id });
    });
    return [...map.entries()].sort(
      (a, b) => AISLE_ORDER.indexOf(a[0]) - AISLE_ORDER.indexOf(b[0])
    );
  })();

  // ── Day grouping (meal items only; extras at top) ───
  const byDay = (() => {
    const map = new Map<string, { dayIndex: number; items: typeof groupedIngredients }>();
    uncheckedMeal.forEach((g) => {
      g.items.forEach((item) => {
        if (!item.checked) {
          if (!map.has(item.day)) map.set(item.day, { dayIndex: item.dayIndex, items: [] });
          const existing = map.get(item.day)!;
          if (!existing.items.find((x) => x.name.toLowerCase() === g.name.toLowerCase())) {
            existing.items.push(g);
          }
        }
      });
    });
    return [...map.entries()].sort((a, b) => a[1].dayIndex - b[1].dayIndex);
  })();

  // ── Row components ───────────────────────────────────
  const MealRow = ({
    group,
    isCheckedStyle = false,
    hideDay = false,
  }: {
    group: typeof groupedIngredients[0];
    isCheckedStyle?: boolean;
    hideDay?: boolean;
  }) => (
    <div
      className={`shopping-row${isCheckedStyle ? " is-checked" : ""}`}
      onClick={() => {
        const allChecked = group.items.every((i) => i.checked);
        group.items.forEach((i) => {
          if (allChecked || !i.checked) onToggle(i.dayIndex, i.id);
        });
      }}
      role="button"
      tabIndex={0}
    >
      <div className={`shopping-circle${isCheckedStyle ? " is-checked" : ""}`} />
      <div className="shopping-row__info">
        <p className="shopping-row__name">{group.name}</p>
        {!isCheckedStyle && !hideDay && group.days.length > 0 && (
          <div className="shopping-row__tags">
            {group.days.map((day, i) => (
              <span key={i} className="shopping-row__tag">{day}</span>
            ))}
          </div>
        )}
      </div>
      {group.days.length > 1 && !isCheckedStyle && (
        <span className="shopping-row__qty">×{group.days.length}</span>
      )}
    </div>
  );

  const ExtraRow = ({ extra, isCheckedStyle = false }: { extra: Ingredient; isCheckedStyle?: boolean }) => (
    <div
      className={`shopping-row${isCheckedStyle ? " is-checked" : ""}`}
      onClick={() => onToggleExtra(extra.id)}
      role="button"
      tabIndex={0}
    >
      <div className={`shopping-circle${isCheckedStyle ? " is-checked" : ""}`} />
      <div className="shopping-row__info">
        <p className="shopping-row__name">{extra.name}</p>
      </div>
      {!isCheckedStyle && (
        <button
          className="ingredient-delete"
          onClick={(e) => { e.stopPropagation(); onDeleteExtra(extra.id); }}
          aria-label="Remove"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />

        <div className="sheet__hd">
          <div>
            <h2 className="sheet__title">{t.shoppingList}</h2>
            <p className="sheet__sub">{checkedCount}/{totalItems} {t.inBasket}</p>
          </div>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {totalItems > 0 && (
          <div className="sort-toggle-bar">
            <div className="sort-toggle">
              <button
                className={`sort-toggle__btn${sortMode === "aisle" ? " is-active" : ""}`}
                onClick={() => setSortMode("aisle")}
              >
                {t.sortByAisle}
              </button>
              <button
                className={`sort-toggle__btn${sortMode === "day" ? " is-active" : ""}`}
                onClick={() => setSortMode("day")}
              >
                {t.sortByDay}
              </button>
            </div>
          </div>
        )}

        <div className="sheet__body">
          {totalItems === 0 ? (
            <div className="shopping-empty">
              <p>{t.noIngredientsYet}</p>
              <p>{t.addMealsFirst}</p>
            </div>
          ) : (
            <>
              {/* ── Aisle view ── */}
              {sortMode === "aisle" && byAisle.map(([key, items]) => (
                <div key={key}>
                  <div className="shopping-divider">
                    <span>{(t as any)[key]}</span>
                  </div>
                  {items.map((item) =>
                    item.extraId ? (
                      <ExtraRow
                        key={item.extraId}
                        extra={extras.find((e) => e.id === item.extraId)!}
                      />
                    ) : (
                      <MealRow key={item.name} group={item as typeof groupedIngredients[0]} />
                    )
                  )}
                </div>
              ))}

              {/* ── Day view ── */}
              {sortMode === "day" && (
                <>
                  {uncheckedExtras.length > 0 && (
                    <div>
                      <div className="shopping-divider"><span>Extra</span></div>
                      {uncheckedExtras.map((extra) => (
                        <ExtraRow key={extra.id} extra={extra} />
                      ))}
                    </div>
                  )}
                  {byDay.map(([dayLabel, { items }]) => (
                    <div key={dayLabel}>
                      <div className="shopping-divider"><span>{dayLabel}</span></div>
                      {items.map((group) => (
                        <MealRow key={group.name + dayLabel} group={group} hideDay />
                      ))}
                    </div>
                  ))}
                </>
              )}

              {/* ── Checked / in basket ── */}
              {(checkedMeal.length > 0 || checkedExtras.length > 0) &&
                (uncheckedMeal.length > 0 || uncheckedExtras.length > 0) && (
                <div className="shopping-divider"><span>{t.inBasket}</span></div>
              )}
              {checkedMeal.map((group) => (
                <MealRow key={group.name + "-checked"} group={group} isCheckedStyle />
              ))}
              {checkedExtras.map((extra) => (
                <ExtraRow key={extra.id + "-checked"} extra={extra} isCheckedStyle />
              ))}

              {allDone && (
                <div className="shopping-complete">
                  <p>{t.allDone}</p>
                  <p>{t.allSetForWeek}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Sticky add bar ── */}
        <div className="sheet__add-bar">
          <input
            ref={inputRef}
            type="text"
            placeholder="Add to list..."
            value={newExtra}
            onChange={(e) => setNewExtra(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddExtra()}
          />
          <button onClick={handleAddExtra} aria-label="Add">
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;