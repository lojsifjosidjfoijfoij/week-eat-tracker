import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShoppingListProps {
  ingredients: { id: string; name: string; checked: boolean; day: string; dayIndex: number }[];
  onClose: () => void;
  onToggle: (dayIndex: number, id: string) => void;
}

// ─── Aisle key → English fallback label ───────────────────────────────────
// The t object is checked first; if the key doesn't exist yet it falls back.
const AISLE_KEYS = [
  "aisleProduceLabel",
  "aisleBakeryLabel",
  "aisleMeatFishLabel",
  "aisleDeliCheeseLabel",
  "aisleDairyEggsLabel",
  "aisleFrozenLabel",
  "aislePastaRiceLabel",
  "aisleTinsJarsLabel",
  "aisleCondimentsLabel",
  "aisleOilsBakingLabel",
  "aisleSnacksDrinksLabel",
  "aisleHouseholdLabel",
  "aisleOtherLabel",
] as const;

const AISLE_FALLBACKS: Record<typeof AISLE_KEYS[number], string> = {
  aisleProduceLabel:     "Fruit & Veg",
  aisleBakeryLabel:      "Bakery",
  aisleMeatFishLabel:    "Meat & Fish",
  aisleDeliCheeseLabel:  "Deli & Cheese",
  aisleDairyEggsLabel:   "Dairy & Eggs",
  aisleFrozenLabel:      "Frozen",
  aislePastaRiceLabel:   "Pasta, Rice & Grains",
  aisleTinsJarsLabel:    "Tins & Jars",
  aisleCondimentsLabel:  "Condiments & Sauces",
  aisleOilsBakingLabel:  "Oils & Baking",
  aisleSnacksDrinksLabel:"Snacks & Drinks",
  aisleHouseholdLabel:   "Household",
  aisleOtherLabel:       "Other",
};

// ─── Supermarket aisle order ───────────────────────────────────────────────
const AISLES: { key: typeof AISLE_KEYS[number]; keywords: string[] }[] = [
  {
    key: "aisleProduceLabel",
    keywords: [
      "apple","apples","banana","bananas","orange","oranges","lemon","lemons","lime","limes",
      "grape","grapes","strawberr","blueberr","raspberr","blackberr","mango","peach","pear",
      "plum","cherry","cherries","watermelon","melon","pineapple","kiwi","avocado","avocados",
      "tomato","tomatoes","tomat","lettuce","spinach","kale","arugula","rocket","cabbage",
      "broccoli","cauliflower","carrot","carrots","celery","cucumber","courgette","zucchini",
      "pepper","peppers","capsicum","onion","onions","garlic","leek","leeks","spring onion",
      "shallot","radish","beetroot","beet","parsnip","turnip","potato","potatoes","sweet potato",
      "mushroom","mushrooms","corn","asparagus","artichoke","fennel","ginger","chilli","chili",
      "herb","herbs","basil","parsley","coriander","cilantro","thyme","rosemary","mint","dill",
      "sage","oregano","chive","chives","salad","greens","vegetable","vegetables","fruit","fruits",
      "pak choi","bok choy","bean sprout","edamame","pea","peas","green bean","green beans",
      "aubergine","eggplant","plantain","dragonfruit","passionfruit","papaya",
      // Danish
      "æble","æbler","banan","bananer","appelsin","citrон","lime","drue","druer","jordbær",
      "blåbær","hindbær","mango","fersken","pære","blomme","kirsebær","vandmelon","ananas",
      "kiwi","avocado","tomat","tomater","salat","spinat","grønkål","kål","broccoli",
      "blomkål","gulerod","gulerødder","selleri","agurk","courgette","peberfrugt","løg",
      "hvidløg","porre","porrer","radise","rødbede","pastinak","kartoffel","kartofler",
      "søde kartofler","svamp","champignon","majs","asparges","ingefær","chili","krydderurter",
      "basilikum","persille","koriander","timian","rosmarin","mynte","dild","salvie","oregano",
      "purløg","ærter","bønner","aubergine",
    ],
  },
  {
    key: "aisleBakeryLabel",
    keywords: [
      "bread","loaf","baguette","roll","rolls","bun","buns","sourdough","rye","wholegrain",
      "pita","pitta","naan","tortilla","wrap","wraps","bagel","bagels","croissant","muffin",
      "crumpet","crumpets","flatbread","ciabatta","focaccia","brioche",
      // Danish
      "brød","rugbrød","franskbrød","bolle","boller","surdejsbrød","fuldkornsbrød",
      "pitabrød","tortilla","bagel","croissant","muffin","flute","ciabatta","focaccia",
    ],
  },
  {
    key: "aisleMeatFishLabel",
    keywords: [
      "chicken","beef","pork","lamb","turkey","duck","veal","mince","mincemeat","steak",
      "sausage","sausages","bacon","ham","salami","chorizo","prosciutto","pepperoni",
      "liver","kidney","rib","ribs","chop","chops","roast","fillet","breast","thigh","wing",
      "salmon","tuna","cod","haddock","tilapia","trout","sea bass","mackerel","sardine",
      "shrimp","prawn","prawns","crab","lobster","mussel","mussels","clam","clams","oyster",
      "squid","octopus","anchov","fish","seafood","meat","poultry",
      // Danish
      "kylling","oksekød","svinekød","lam","kalkun","and","kalv","hakket","bøf","pølse",
      "pølser","bacon","skinke","salami","chorizo","lever","nyre","ribeye","filet","bryst",
      "lår","vinge","laks","tun","torsk","rødspætte","ørred","havbars","makrel","sild",
      "rejer","krabbe","hummer","musling","muslinger","østers","blæksprutte","fisk","skaldyr","kød",
    ],
  },
  {
    key: "aisleDeliCheeseLabel",
    keywords: [
      "cheese","cheddar","mozzarella","parmesan","brie","camembert","feta","gouda","ricotta",
      "halloumi","gruyère","gruyere","emmental","goat cheese","cream cheese","cottage cheese",
      "hummus","deli","cooked meat","cold cut","paté","pate","smoked salmon",
      // Danish
      "ost","cheddar","mozzarella","parmesan","brie","camembert","feta","gouda","ricotta",
      "halloumi","emmental","gedeost","flødeost","hytteost","hummus","pålæg","røget laks",
    ],
  },
  {
    key: "aisleDairyEggsLabel",
    keywords: [
      "milk","semi-skimmed","skimmed","whole milk","oat milk","almond milk","soy milk",
      "coconut milk","butter","margarine","cream","double cream","single cream","sour cream",
      "crème fraîche","creme fraiche","yogurt","yoghurt","greek yogurt","egg","eggs","quark",
      // Danish
      "mælk","minimælk","skummetmælk","sødmælk","havremælk","mandelmælk","sojamælk",
      "kokosmælk","smør","margarine","fløde","piskefløde","creme fraiche","cremefraiche",
      "yoghurt","græsk yoghurt","æg","kvark",
    ],
  },
  {
    key: "aisleFrozenLabel",
    keywords: [
      "frozen","ice cream","sorbet","gelato","frozen pea","frozen corn","frozen vegetable",
      "frozen fruit","frozen fish","frozen chicken","fish finger","fish fingers","pizza",
      "frozen meal","frozen dinner",
      // Danish
      "frossen","frosne","is","flødeis","frugtsorbét","frosne ærter","frossen fisk",
      "frossen kylling","fiskefingre","frossen pizza","frossen ret",
    ],
  },
  {
    key: "aislePastaRiceLabel",
    keywords: [
      "pasta","spaghetti","penne","rigatoni","fusilli","tagliatelle","linguine","fettuccine",
      "lasagne","lasagna","macaroni","gnocchi","noodle","noodles","rice","basmati","jasmine",
      "arborio","risotto","quinoa","couscous","bulgur","polenta","oat","oats","porridge",
      "granola","muesli","cereal","cornflake","wheat","flour","breadcrumb","breadcrumbs",
      // Danish
      "pasta","spaghetti","penne","fusilli","lasagne","makaroni","nudler","ris","basmati",
      "jasminris","risotto","quinoa","couscous","bulgur","polenta","havregryn","müsli",
      "morgenmad","cornflakes","hvedemel","mel","rasp",
    ],
  },
  {
    key: "aisleTinsJarsLabel",
    keywords: [
      "tin","tinned","canned","can of","jar","beans","chickpea","chickpeas","lentil","lentils",
      "kidney bean","black bean","cannellini","butter bean","baked beans","tomato sauce",
      "passata","chopped tomato","chopped tomatoes","coconut cream","stock","broth","soup",
      "tuna tin","sardine tin","anchov","olive","olives","capers","pickle","pickles","gherkin",
      "pesto","pasta sauce","tahini","peanut butter","almond butter","jam","marmalade","honey",
      "syrup","maple","treacle","spread",
      // Danish
      "dåse","på dåse","glas","bønner","kikærter","linser","kidneybønner","sorte bønner",
      "hvide bønner","tomatsauce","passata","hakkede tomater","kokosfløde","bouillon","suppe",
      "oliven","kapers","sylteagurk","pesto","pastasauce","tahini","jordnøddesmør","syltetøj",
      "marmelade","honning","sirup","ahornsirup","smørepålæg",
    ],
  },
  {
    key: "aisleCondimentsLabel",
    keywords: [
      "ketchup","mustard","mayo","mayonnaise","relish","hot sauce","sriracha","soy sauce",
      "worcestershire","tabasco","vinegar","balsamic","apple cider vinegar","fish sauce",
      "oyster sauce","hoisin","teriyaki","bbq sauce","salsa","guacamole","aioli",
      // Danish
      "ketchup","sennep","mayo","mayonnaise","chilisauce","sojasauce","worcestershire",
      "eddike","balsamico","æblecidereddike","fiskesauce","østersauce","bbq sauce","salsa",
    ],
  },
  {
    key: "aisleOilsBakingLabel",
    keywords: [
      "oil","olive oil","vegetable oil","sunflower oil","coconut oil","sesame oil","rapeseed",
      "sugar","brown sugar","caster sugar","icing sugar","baking powder","baking soda",
      "bicarbonate","yeast","vanilla","cocoa","chocolate","dark chocolate","milk chocolate",
      "white chocolate","cornstarch","cornflour","salt","pepper","spice","spices","cumin",
      "paprika","turmeric","cinnamon","nutmeg","cardamom","clove","cloves","bay leaf","bay leaves",
      "curry powder","garam masala","mixed spice","chilli flakes","cayenne","seasoning",
      // Danish
      "olie","olivenolie","solsikkeolie","kokosolie","sesamolie","rapsolie",
      "sukker","brun farin","rørsukker","flormelis","bagepulver","natron","gær","vanilje",
      "kakao","chokolade","mørk chokolade","mælkechokolade","hvid chokolade","majsstivelse",
      "salt","peber","krydderier","spidskommen","paprika","gurkemeje","kanel","muskatnød",
      "kardemomme","nellike","laurbærblad","karry","garam masala","chiliflager","cayennepeber",
    ],
  },
  {
    key: "aisleSnacksDrinksLabel",
    keywords: [
      "juice","orange juice","apple juice","water","sparkling","soda","cola","lemonade",
      "coffee","tea","herbal tea","wine","beer","cider","spirits","gin","vodka","whisky",
      "crisp","crisps","chip","chips","popcorn","pretzel","cracker","crackers","biscuit",
      "biscuits","cookie","cookies","chocolate bar","sweet","sweets","candy","nut","nuts",
      "almond","cashew","walnut","peanut","pistachio","seed","seeds","dried fruit","raisin",
      "raisins","energy drink","protein shake","kombucha","smoothie",
      // Danish
      "juice","appelsinjuice","æblejuice","vand","sodavand","cola","limonade","kaffe","te",
      "urtete","vin","øl","cider","gin","vodka","whisky","chips","popcorn","kiks","småkager",
      "chokoladebar","slik","nødder","mandler","cashew","valnød","jordnød","pistacienødder",
      "frø","tørret frugt","rosiner","energidrik","proteinshake","kombucha","smoothie",
    ],
  },
  {
    key: "aisleHouseholdLabel",
    keywords: [
      "washing","detergent","soap","shampoo","conditioner","toothpaste","toilet","tissue",
      "kitchen roll","paper towel","bin bag","bin liner","cling film","foil","baking paper",
      "parchment","zip lock","bag","cleaning","bleach","spray","sponge","cloth","dishwasher",
      // Danish
      "vaskemiddel","rengøringsmiddel","sæbe","shampoo","balsam","tandpasta","toiletpapir",
      "køkkenrulle","papirhåndklæde","affaldspose","husholdningsfilm","staniol","bagepapir",
      "rengøring","blegemiddel","svamp","klud","opvaskemaskine",
    ],
  },
];

const OTHER_KEY = "aisleOtherLabel" as const;

function detectAisleKey(name: string): typeof AISLE_KEYS[number] {
  const lower = name.toLowerCase();
  for (const aisle of AISLES) {
    if (aisle.keywords.some((kw) => lower.includes(kw))) return aisle.key;
  }
  return OTHER_KEY;
}

type SortMode = "aisle" | "day";

const ShoppingList = ({ ingredients, onClose, onToggle }: ShoppingListProps) => {
  const { t } = useLanguage();
  const [sortMode, setSortMode] = useState<SortMode>("aisle");

  // Helper: get translated aisle label with fallback
  const aisleLabel = (key: typeof AISLE_KEYS[number]) =>
    (t as any)[key] ?? AISLE_FALLBACKS[key];

  // ── Deduplicate by name ──────────────────────────────────────────────────
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
  const checked   = groupedIngredients.filter((g) => g.items.every((i) => i.checked));
  const allDone   = checked.length === groupedIngredients.length && groupedIngredients.length > 0;

  const handleToggle = (group: typeof groupedIngredients[0]) => {
    const allChecked = group.items.every((i) => i.checked);
    group.items.forEach((i) => {
      if (allChecked || !i.checked) onToggle(i.dayIndex, i.id);
    });
  };

  // ── Aisle grouping ───────────────────────────────────────────────────────
  const byAisle = (() => {
    const map = new Map<string, { key: typeof AISLE_KEYS[number]; items: typeof groupedIngredients }>();
    unchecked.forEach((g) => {
      const key = detectAisleKey(g.name);
      if (!map.has(key)) map.set(key, { key, items: [] });
      map.get(key)!.items.push(g);
    });
    return [...map.values()].sort((a, b) => {
      const ai = [...AISLES.map(x => x.key), OTHER_KEY].indexOf(a.key);
      const bi = [...AISLES.map(x => x.key), OTHER_KEY].indexOf(b.key);
      return ai - bi;
    });
  })();

  // ── Day grouping ─────────────────────────────────────────────────────────
  const byDay = (() => {
    const map = new Map<string, { dayLabel: string; dayIndex: number; items: typeof groupedIngredients }>();
    unchecked.forEach((g) => {
      g.items.forEach((item) => {
        if (!item.checked) {
          const key = item.day;
          if (!map.has(key)) map.set(key, { dayLabel: item.day, dayIndex: item.dayIndex, items: [] });
          if (!map.get(key)!.items.find((x) => x.name.toLowerCase() === g.name.toLowerCase())) {
            map.get(key)!.items.push(g);
          }
        }
      });
    });
    return [...map.values()].sort((a, b) => a.dayIndex - b.dayIndex);
  })();

  const IngredientRow = ({ group, isCheckedStyle = false }: {
    group: typeof groupedIngredients[0];
    isCheckedStyle?: boolean;
  }) => (
    <div
      className={`shopping-row${isCheckedStyle ? " is-checked" : ""}`}
      onClick={() => handleToggle(group)}
      role="button"
      tabIndex={0}
    >
      <div className={`shopping-circle${isCheckedStyle ? " is-checked" : ""}`} />
      <div className="shopping-row__info">
        <p className="shopping-row__name">{group.name}</p>
        {!isCheckedStyle && sortMode === "aisle" && group.days.length > 0 && (
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

  // Toggle labels — use translations if available, else fallback
  const byAisleLabel = (t as any).sortByAisle ?? "By aisle";
  const byDayLabel   = (t as any).sortByDay   ?? "By day";
  const inBasketLabel = (t as any).inBasket   ?? "In basket";

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />

        <div className="sheet__hd">
          <div>
            <h2 className="sheet__title">{t.shoppingList}</h2>
            <p className="sheet__sub">{checked.length}/{groupedIngredients.length} {(t as any).inBasket ?? "in basket"}</p>
          </div>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Sort toggle */}
        {groupedIngredients.length > 0 && (
          <div className="sort-toggle-bar">
            <div className="sort-toggle">
              <button
                className={`sort-toggle__btn${sortMode === "aisle" ? " is-active" : ""}`}
                onClick={() => setSortMode("aisle")}
              >
                {byAisleLabel}
              </button>
              <button
                className={`sort-toggle__btn${sortMode === "day" ? " is-active" : ""}`}
                onClick={() => setSortMode("day")}
              >
                {byDayLabel}
              </button>
            </div>
          </div>
        )}

        <div className="sheet__body">
          {groupedIngredients.length === 0 ? (
            <div className="shopping-empty">
              <p>{(t as any).noIngredientsYet ?? "No ingredients yet."}</p>
              <p>{(t as any).addMealsFirst ?? "Add meals and ingredients to your week first."}</p>
            </div>
          ) : (
            <>
              {sortMode === "aisle" && byAisle.map(({ key, items }) => (
                <div key={key}>
                  <div className="shopping-divider aisle-divider">
                    <span>{aisleLabel(key)}</span>
                  </div>
                  {items.map((group) => (
                    <IngredientRow key={group.name} group={group} />
                  ))}
                </div>
              ))}

              {sortMode === "day" && byDay.map(({ dayLabel, items }) => (
                <div key={dayLabel}>
                  <div className="shopping-divider">
                    <span>{dayLabel}</span>
                  </div>
                  {items.map((group) => (
                    <IngredientRow key={group.name + dayLabel} group={group} />
                  ))}
                </div>
              ))}

              {checked.length > 0 && unchecked.length > 0 && (
                <div className="shopping-divider"><span>{inBasketLabel}</span></div>
              )}
              {checked.map((group) => (
                <IngredientRow key={group.name + "-checked"} group={group} isCheckedStyle />
              ))}

              {allDone && (
                <div className="shopping-complete">
                  <p>{(t as any).allDone ?? "All done!"}</p>
                  <p>{(t as any).allSetForWeek ?? "You're all set for the week."}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;