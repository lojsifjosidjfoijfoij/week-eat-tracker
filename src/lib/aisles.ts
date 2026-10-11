// Sorts shopping-list items into supermarket aisles by keyword.
// The longest matching keyword wins, so "peanut butter" goes to Pantry, not Dairy.
// Short keywords (≤ 4 letters) only match at the start of a word, so "te" (tea)
// doesn't catch "tomater" and "and" (duck) doesn't catch "sandwich".

export type AisleKey =
  | "aisleFreshLabel"
  | "aisleMeatFishLabel"
  | "aisleDairyLabel"
  | "aislePantryLabel"
  | "aisleFrozenLabel"
  | "aisleDrinksSnacksLabel"
  | "aisleHouseholdLabel"
  | "aisleOtherLabel";

export const AISLE_ORDER: AisleKey[] = [
  "aisleFreshLabel",
  "aisleMeatFishLabel",
  "aisleDairyLabel",
  "aislePantryLabel",
  "aisleFrozenLabel",
  "aisleDrinksSnacksLabel",
  "aisleHouseholdLabel",
  "aisleOtherLabel",
];

const KEYWORDS: Record<Exclude<AisleKey, "aisleOtherLabel">, string[]> = {
  aisleFreshLabel: [
    // en
    "apple", "banana", "orange", "lemon", "lime", "grape", "strawberr", "raspberr", "blueberr", "berries", "mango",
    "peach", "pear", "plum", "cherr", "melon", "pineapple", "kiwi", "avocado", "tomato", "lettuce", "spinach",
    "kale", "cabbage", "broccoli", "cauliflower", "carrot", "celery", "cucumber", "courgette", "zucchini",
    "bell pepper", "red pepper", "green pepper", "yellow pepper", "onion", "shallot", "garlic", "leek", "potato", "mushroom", "corn on the cob",
    "asparagus", "ginger", "chilli", "chili", "herb", "basil", "parsley", "coriander", "cilantro", "thyme",
    "rosemary", "mint", "dill", "chive", "salad", "rocket", "arugula", "vegetables", "fruit", "peas", "green bean",
    "aubergine", "eggplant", "beetroot", "radish", "squash", "pumpkin", "spring onion", "scallion", "fennel",
    "bread", "loaf", "baguette", "bun", "roll", "sourdough", "bagel", "croissant", "pita", "naan", "flatbread",
    "ciabatta", "focaccia", "brioche", "oregano", "sage", "tarragon", "lemongrass", "bok choy", "pak choi",
    "parsnip", "brussels sprout", "sweet potato", "tofu", "hummus", "pizza dough", "jalapeño pepper",
    // da
    "æble", "banan", "appelsin", "citron", "drue", "jordbær", "hindbær", "blåbær", "fersken", "pære", "blomme",
    "kirsebær", "ananas", "tomat", "salat", "spinat", "grønkål", "kål", "blomkål", "gulerød", "gulerod", "selleri",
    "agurk", "peberfrugt", "løg", "hvidløg", "porre", "kartof", "svampe", "champignon", "asparges", "ingefær",
    "krydderurt", "basilikum", "persille", "koriander", "timian", "rosmarin", "mynte", "dild", "purløg", "ærter",
    "bønner", "rødbede", "radise", "squash", "græskar", "forårsløg", "fennikel", "brød", "rugbrød", "bolle",
    "boller", "flute", "pitabrød", "grønt", "frugt", "rucola", "pastinak", "rosenkål", "salvie", "estragon",
    "citrongræs", "pizzadej", "toastbrød", "fuldkornsbrød", "rødløg", "skalotteløg", "kiwi", "mango", "melon",
    "nektarin", "vindruer", "majskolbe",
    // de
    "apfel", "äpfel", "zitrone", "trauben", "erdbeer", "himbeer", "heidelbeer", "pfirsich", "birne", "pflaume",
    "kirsche", "tomate", "kopfsalat", "spinat", "grünkohl", "kohl", "blumenkohl", "karotte", "möhre", "sellerie",
    "gurke", "zwiebel", "knoblauch", "lauch", "kartoffel", "pilz", "champignons", "spargel", "ingwer",
    "petersilie", "schnittlauch", "erbsen", "bohnen", "zucchini", "kürbis", "fenchel", "rote bete", "radieschen",
    "brot", "brötchen", "semmel", "laugen", "gemüse", "obst",
    // fr
    "pomme", "citron", "raisin", "fraise", "framboise", "myrtille", "pêche", "poire", "prune", "cerise",
    "tomate", "laitue", "épinard", "chou", "carotte", "céleri", "concombre", "poivron", "oignon", "échalote",
    "ail", "poireau", "pomme de terre", "champignon", "asperge", "gingembre", "persil", "ciboulette", "aneth",
    "petits pois", "haricots verts", "aubergine", "betterave", "radis", "potiron", "courge", "fenouil", "pain",
    "baguette", "légume", "fruit",
    // es
    "manzana", "plátano", "naranja", "limón", "uva", "fresa", "frambuesa", "arándano", "melocotón", "pera",
    "ciruela", "cereza", "piña", "tomate", "lechuga", "espinaca", "repollo", "col", "brócoli", "coliflor",
    "zanahoria", "apio", "pepino", "pimiento", "cebolla", "ajo", "puerro", "patata", "papa", "champiñón", "seta",
    "espárrago", "jengibre", "perejil", "cilantro", "eneldo", "guisantes", "judías verdes", "berenjena",
    "remolacha", "rábano", "calabaza", "calabacín", "hinojo", "pan", "barra de pan", "verdura", "fruta",
  ],
  aisleMeatFishLabel: [
    "chicken", "beef", "pork", "lamb", "turkey", "duck", "mince", "steak", "sausage", "bacon", "ham", "salami",
    "chorizo", "prosciutto", "pepperoni", "fillet", "breast", "thigh", "drumstick", "meatball", "salmon", "tuna",
    "cod", "haddock", "trout", "sea bass", "mackerel", "sardine", "shrimp", "prawn", "crab", "lobster", "mussel",
    "clam", "squid", "fish", "seafood", "meat", "veal",
    "kylling", "oksekød", "svinekød", "svine", "kotelet", "nakkefilet", "kalv", "okse", "lammekød", "kalkun", "and", "hakket", "hakkebøf", "bøf", "pølse", "pølser",
    "skinke", "filet", "bryst", "lår", "tun", "leverpostej", "pålæg", "rullepølse", "spegepølse", "hamburgerryg", "frikadelle", "kødboller", "laks", "torsk", "rødspætte", "ørred", "makrel",
    "sild", "rejer", "krabbe", "hummer", "muslinger", "fisk", "kød", "flæsk", "medister", "kalvekød", "mørbrad",
    "hähnchen", "huhn", "rind", "schwein", "lamm", "pute", "ente", "hackfleisch", "wurst", "würstchen", "schinken",
    "speck", "lachs", "thunfisch", "kabeljau", "forelle", "garnelen", "fleisch",
    "poulet", "bœuf", "boeuf", "porc", "agneau", "dinde", "canard", "haché", "saucisse", "jambon", "lardons",
    "saumon", "thon", "cabillaud", "truite", "crevette", "moules", "poisson", "viande",
    "pollo", "ternera", "cerdo", "cordero", "pavo", "pato", "carne picada", "salchicha", "jamón", "beicon",
    "salmón", "atún", "bacalao", "trucha", "gambas", "langostino", "mejillones", "pescado", "carne",
  ],
  aisleDairyLabel: [
    "milk", "butter", "cream", "sour cream", "yogurt", "yoghurt", "egg", "cheese", "cheddar", "mozzarella",
    "parmesan", "feta", "brie", "gouda", "ricotta", "halloumi", "mascarpone", "cream cheese", "cottage cheese",
    "quark", "crème fraîche", "creme fraiche",
    "mælk", "smør", "fløde", "piskefløde", "madlavningsfløde", "cremefraiche", "skyr", "æg", "ost", "revet ost",
    "flødeost", "hytteost", "kvark", "ymer", "letmælk", "sødmælk", "minimælk", "kærnemælk", "margarine",
    "gorgonzola", "burrata", "camembert", "emmentaler", "pecorino", "smørbar", "yoghurt",
    "milch", "sahne", "schmand", "joghurt", "eier", "käse", "frischkäse",
    "lait", "beurre", "crème", "yaourt", "œufs", "oeufs", "fromage",
    "leche", "mantequilla", "nata", "yogur", "huevo", "queso",
  ],
  aislePantryLabel: [
    "tortilla", "wrap", "taco shell", "pasta", "spaghetti", "penne", "fusilli", "rigatoni", "tagliatelle",
    "linguine", "macaroni", "lasagne", "lasagna", "gnocchi", "rice", "basmati", "jasmine", "arborio", "risotto",
    "noodle", "couscous", "quinoa", "bulgur", "polenta", "flour", "oats", "canned", "tinned", "chopped tomatoes",
    "beans", "chickpea", "lentil", "tomato sauce", "tomato paste", "passata", "stock", "broth", "bouillon",
    "coconut milk", "olive", "pesto", "soy sauce", "fish sauce", "oyster sauce", "hoisin", "teriyaki", "sriracha",
    "bbq sauce", "vinegar", "balsamic", "olive oil", "sesame oil", "sugar", "honey", "jam", "ketchup", "mustard",
    "mayo", "spice", "cumin", "paprika", "turmeric", "curry", "cinnamon", "baking powder", "baking soda",
    "yeast", "breadcrumb", "panko", "cereal", "granola", "tahini", "peanut butter", "chocolate", "cocoa",
    "cornflour", "cornstarch", "kidney bean", "black bean", "nuts for cooking", "salsa", "taco seasoning",
    "nudler", "ris", "kikærter", "linser", "hakkede tomater", "tomatpuré", "flåede tomater", "bouillonterning",
    "kokosmælk", "oliven", "sojasauce", "fiskesauce", "eddike", "olivenolie", "sukker", "honning", "syltetøj",
    "sennep", "remoulade", "krydderi", "spidskommen", "gurkemeje", "kanel", "bagepulver", "gær", "rasp",
    "havregryn", "mel", "hvedemel", "müsli", "jordnøddesmør", "chokolade", "kakao", "majsstivelse", "tacokrydderi",
    "salt", "peber", "pepper", "peppercorn", "sort peber", "black pepper", "white pepper", "paprika", "karry",
    "muskat", "laurbær", "bay leaf", "bay leaves", "nutmeg", "garam masala", "kardemomme", "cardamom", "nelliker",
    "cloves", "allehånde", "allspice", "chili flakes", "cayenne", "kapers", "capers", "jalapeños", "pinjekerner",
    "pine nuts", "sesamfrø", "sesame seeds", "kokosflager", "coconut flakes", "dadler", "dates", "sirup", "syrup",
    "ahornsirup", "maple syrup", "gelatine", "vanilje", "vanilla", "natron", "olie", "oil", "rapsolie",
    "vegetable oil", "sunflower oil", "solsikkeolie", "majs", "corn", "sweetcorn", "worcestershire", "tabasco",
    "sauce", "sovs", "dressing", "kidneybønner", "sorte bønner", "hvide bønner", "butterbeans", "jalapeño", "mayonnaise", "pickles", "asier", "rødbeder i glas", "tranebær", "cranberries",
    "nudeln", "reis", "kichererbsen", "linsen", "tomatenmark", "brühe", "kokosmilch", "essig", "zucker",
    "senf", "gewürz", "zimt", "backpulver", "hefe", "semmelbrösel", "haferflocken", "mehl", "pfeffer", "öl", "mais",
    "pâtes", "riz", "pois chiches", "lentilles", "concentré de tomate", "bouillon", "lait de coco", "vinaigre",
    "sucre", "miel", "confiture", "moutarde", "épice", "cannelle", "levure", "farine", "chapelure", "poivre", "sel", "huile",
    "arroz", "fideos", "garbanzos", "lentejas", "tomate triturado", "caldo", "leche de coco", "vinagre",
    "azúcar", "miel", "mermelada", "mostaza", "especia", "canela", "levadura", "harina", "pan rallado", "pimienta", "sal", "aceite",
  ],
  aisleFrozenLabel: [
    "frozen", "ice cream", "frost", "frosne", "frossen", "frosset", "flødeis", "edamame", "tiefkühl", "eiscreme", "surgelé", "glace",
    "congelad", "helado",
  ],
  aisleDrinksSnacksLabel: [
    "juice", "water", "soda", "cola", "coffee", "tea", "wine", "beer", "cider", "crisps", "chips", "popcorn",
    "cracker", "biscuit", "cookie", "candy", "sweets", "almond", "cashew", "walnut", "peanut", "pistachio",
    "raisin", "lemonade", "sparkling",
    "juice", "vand", "danskvand", "sodavand", "kaffe", "te", "vin", "øl", "saftevand", "saft", "kiks",
    "småkager", "slik", "nødder", "mandler", "valnødder", "jordnødder", "rosiner",
    "saft", "wasser", "kaffee", "tee", "wein", "bier", "kekse", "nüsse", "süßigkeiten",
    "jus", "eau", "café", "thé", "vin", "bière", "biscuits", "noix", "bonbons",
    "zumo", "agua", "café", "té", "vino", "cerveza", "galletas", "frutos secos", "patatas fritas",
  ],
  aisleHouseholdLabel: [
    "washing", "detergent", "soap", "shampoo", "toothpaste", "toilet paper", "tissue", "kitchen roll", "bin bag",
    "cling film", "foil", "baking paper", "cleaning", "bleach", "sponge", "dishwasher", "napkin", "nappies",
    "diapers", "batteries", "paper towel", "kitchen towel", "aluminium foil", "dish soap", "dishwasher tabs",
    "vaskemiddel", "opvaskemiddel", "sæbe", "tandpasta", "toiletpapir", "køkkenrulle", "affaldsposer",
    "husholdningsfilm", "staniol", "bagepapir", "rengøring", "karklud", "servietter", "bleer", "batterier",
    "sølvpapir", "alufolie", "opvasketabs", "vaskepulver", "skyllemiddel", "tabs", "fryseposer", "plastposer",
    "waschmittel", "spülmittel", "seife", "zahnpasta", "toilettenpapier", "küchenrolle", "müllbeutel",
    "lessive", "savon", "dentifrice", "papier toilette", "essuie-tout", "sacs poubelle",
    "detergente", "jabón", "pasta de dientes", "papel higiénico", "papel de cocina", "bolsas de basura",
  ],
};

const norm = (s: string) => s.toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();
const INDEX: { key: AisleKey; kw: string }[] = Object.entries(KEYWORDS).flatMap(([key, kws]) =>
  kws.map((kw) => ({ key: key as AisleKey, kw: norm(kw) })),
);

/**
 * Words that decide the aisle no matter what the item is made of:
 * "frosne ærter" is frozen, "hakkede tomater på dåse" is pantry, "kyllingefond" is pantry,
 * "tørret oregano" is pantry, "appelsinjuice" is drinks. Checked in this order.
 */
const QUALIFIERS: [AisleKey, string[]][] = [
  ["aisleFrozenLabel", ["frozen", "frosne", "frossen", "frosset", "frost", "tiefkühl", "tiefgekühlt", "surgelé", "congelad"]],
  ["aislePantryLabel", [
    "canned", "tinned", "på dåse", "dåse", "konserves", "in der dose", "aus der dose", "en conserve", "en lata", "de lata",
    "dried", "tørret", "tørrede", "getrocknet", "séché", "séchée", "seco", "seca", "pulver", "powder", "poudre", "en polvo",
    "flakes", "flager", "stødt", "gemahlen", "moulu",
    "stock", "broth", "bouillon", "fond", "brühe", "caldo", "terning", "i glas",
  ]],
  ["aisleDrinksSnacksLabel", ["juice", "smoothie", "saftevand", "jus", "zumo"]],
];

/** Same word, different food: German "Paprika" is the vegetable, Danish/English paprika is the spice. */
const LANGUAGE_WORDS: Partial<Record<string, Record<string, AisleKey>>> = {
  de: { paprika: "aisleFreshLabel", mais: "aisleFreshLabel" },
};

/** Whole-name matches for words too short to search inside others ("is" = ice cream in Danish). */
const EXACT: Record<string, AisleKey> = { is: "aisleFrozenLabel", te: "aisleDrinksSnacksLabel", tea: "aisleDrinksSnacksLabel", øl: "aisleDrinksSnacksLabel" };

const isBoundary = (c: string | undefined) => c === undefined || /[\s\-(),/.&+'’]/.test(c);

/**
 * Long keywords match anywhere. Short ones (≤ 4 letters) only at the start or end of a word,
 * so "te" (tea) doesn't catch "tomater" but "kål" does catch "rødkål" and "ost" catches "flødeost"
 * (Danish/German put the main word last in compounds). 1–2 letter words need the whole word.
 */
function matches(name: string, kw: string): boolean {
  if (kw.length >= 5) return name.includes(kw);
  let from = 0;
  for (;;) {
    const i = name.indexOf(kw, from);
    if (i === -1) return false;
    const before = isBoundary(name[i - 1]);
    const after = isBoundary(name[i + kw.length]);
    if (kw.length <= 2 ? before && after : before || (after && kw.length >= 3)) return true;
    from = i + 1;
  }
}

// ── User corrections ("move to another aisle"), remembered per item name on this device ──
const OVERRIDES_KEY = "dinrr:aisleOverrides";
let overrides: Record<string, AisleKey> = {};
try { overrides = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}") ?? {}; } catch { overrides = {}; }
const listeners = new Set<() => void>();
let version = 0;

export function setAisleOverride(itemName: string, aisle: AisleKey | null): void {
  const key = norm(itemName);
  if (!key) return;
  if (aisle) overrides = { ...overrides, [key]: aisle };
  else { const { [key]: _drop, ...rest } = overrides; void _drop; overrides = rest; }
  try { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides)); } catch { /* ignore */ }
  version++;
  listeners.forEach((l) => l());
}
export const subscribeAisles = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const aislesVersion = () => version;
export const hasAisleOverride = (itemName: string) => norm(itemName) in overrides;

/** Automatic guess, ignoring user corrections. */
export function guessAisle(itemName: string, language?: string): AisleKey {
  const name = norm(itemName);
  if (!name) return "aisleOtherLabel";
  if (EXACT[name]) return EXACT[name];
  // Cleaning products first, so "vaskepulver" isn't caught by "pulver" (powder → spices)
  if (KEYWORDS.aisleHouseholdLabel.some((w) => matches(name, norm(w)))) return "aisleHouseholdLabel";
  for (const [key, words] of QUALIFIERS) if (words.some((w) => matches(name, norm(w)))) return key;
  const local = language ? LANGUAGE_WORDS[language] : undefined;
  let best: { key: AisleKey; len: number } | null = null;
  if (local) for (const [kw, key] of Object.entries(local)) if (kw.length > (best?.len ?? 0) && matches(name, kw)) best = { key, len: kw.length };
  for (const { key, kw } of INDEX) {
    if (kw.length > (best?.len ?? 0) && matches(name, kw)) best = { key, len: kw.length };
  }
  return best?.key ?? "aisleOtherLabel";
}

/** Aisle for an item: the user's own correction if there is one, otherwise the automatic guess. */
export function detectAisle(itemName: string, language?: string): AisleKey {
  return overrides[norm(itemName)] ?? guessAisle(itemName, language);
}
