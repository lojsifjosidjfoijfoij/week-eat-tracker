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
    "bell pepper", "pepper", "onion", "shallot", "garlic", "leek", "potato", "mushroom", "corn on the cob",
    "asparagus", "ginger", "chilli", "chili", "herb", "basil", "parsley", "coriander", "cilantro", "thyme",
    "rosemary", "mint", "dill", "chive", "salad", "rocket", "arugula", "vegetable", "fruit", "peas", "green bean",
    "aubergine", "eggplant", "beetroot", "radish", "squash", "pumpkin", "spring onion", "scallion", "fennel",
    "bread", "loaf", "baguette", "bun", "roll", "sourdough", "bagel", "croissant", "pita", "naan", "flatbread",
    "ciabatta", "focaccia", "brioche",
    // da
    "æble", "banan", "appelsin", "citron", "drue", "jordbær", "hindbær", "blåbær", "fersken", "pære", "blomme",
    "kirsebær", "ananas", "tomat", "salat", "spinat", "grønkål", "kål", "blomkål", "gulerød", "gulerod", "selleri",
    "agurk", "peberfrugt", "løg", "hvidløg", "porre", "kartof", "svampe", "champignon", "asparges", "ingefær",
    "krydderurt", "basilikum", "persille", "koriander", "timian", "rosmarin", "mynte", "dild", "purløg", "ærter",
    "bønner", "rødbede", "radise", "squash", "græskar", "forårsløg", "fennikel", "brød", "rugbrød", "bolle",
    "boller", "flute", "pitabrød", "grønt", "frugt",
    // de
    "apfel", "äpfel", "zitrone", "trauben", "erdbeer", "himbeer", "heidelbeer", "pfirsich", "birne", "pflaume",
    "kirsche", "tomate", "kopfsalat", "spinat", "grünkohl", "kohl", "blumenkohl", "karotte", "möhre", "sellerie",
    "gurke", "paprika", "zwiebel", "knoblauch", "lauch", "kartoffel", "pilz", "champignons", "spargel", "ingwer",
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
    "skinke", "filet", "bryst", "lår", "frikadelle", "kødboller", "laks", "torsk", "rødspætte", "ørred", "makrel",
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
    "flødeost", "hytteost", "kvark", "ymer",
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
    "mayo", "spice", "cumin", "paprika powder", "turmeric", "curry", "cinnamon", "oregano", "baking powder",
    "yeast", "breadcrumb", "panko", "cereal", "granola", "tahini", "peanut butter", "chocolate", "cocoa",
    "cornflour", "cornstarch", "kidney bean", "black bean", "nuts for cooking", "salsa", "taco seasoning",
    "nudler", "ris", "kikærter", "linser", "hakkede tomater", "tomatpuré", "flåede tomater", "bouillonterning",
    "kokosmælk", "oliven", "sojasauce", "fiskesauce", "eddike", "olivenolie", "sukker", "honning", "syltetøj",
    "sennep", "remoulade", "krydderi", "spidskommen", "gurkemeje", "kanel", "bagepulver", "gær", "rasp",
    "havregryn", "mel", "hvedemel", "müsli", "jordnøddesmør", "chokolade", "kakao", "majsstivelse", "tacokrydderi",
    "nudeln", "reis", "kichererbsen", "linsen", "tomatenmark", "brühe", "kokosmilch", "essig", "zucker",
    "senf", "gewürz", "zimt", "backpulver", "hefe", "semmelbrösel", "haferflocken", "mehl",
    "pâtes", "riz", "pois chiches", "lentilles", "concentré de tomate", "bouillon", "lait de coco", "vinaigre",
    "sucre", "miel", "confiture", "moutarde", "épice", "cannelle", "levure", "farine", "chapelure",
    "arroz", "fideos", "garbanzos", "lentejas", "tomate triturado", "caldo", "leche de coco", "vinagre",
    "azúcar", "miel", "mermelada", "mostaza", "especia", "canela", "levadura", "harina", "pan rallado",
  ],
  aisleFrozenLabel: [
    "frozen", "ice cream", "frost", "frosne", "flødeis", "tiefkühl", "eiscreme", "surgelé", "glace",
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
    "diapers", "batter",
    "vaskemiddel", "opvaskemiddel", "sæbe", "tandpasta", "toiletpapir", "køkkenrulle", "affaldsposer",
    "husholdningsfilm", "staniol", "bagepapir", "rengøring", "karklud", "servietter", "bleer", "batterier",
    "waschmittel", "spülmittel", "seife", "zahnpasta", "toilettenpapier", "küchenrolle", "müllbeutel",
    "lessive", "savon", "dentifrice", "papier toilette", "essuie-tout", "sacs poubelle",
    "detergente", "jabón", "pasta de dientes", "papel higiénico", "papel de cocina", "bolsas de basura",
  ],
};

const norm = (s: string) => s.toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();
const INDEX: { key: AisleKey; kw: string }[] = Object.entries(KEYWORDS).flatMap(([key, kws]) =>
  kws.map((kw) => ({ key: key as AisleKey, kw: norm(kw) })),
);

function matches(name: string, kw: string): boolean {
  if (kw.length >= 5) return name.includes(kw);
  let from = 0;
  for (;;) {
    const i = name.indexOf(kw, from);
    if (i === -1) return false;
    if (i === 0 || /[\s\-(,/]/.test(name[i - 1])) return true;
    from = i + 1;
  }
}

export function detectAisle(itemName: string): AisleKey {
  const name = norm(itemName);
  let best: { key: AisleKey; len: number } | null = null;
  for (const { key, kw } of INDEX) {
    if (kw.length > (best?.len ?? 0) && matches(name, kw)) best = { key, len: kw.length };
  }
  return best?.key ?? "aisleOtherLabel";
}
