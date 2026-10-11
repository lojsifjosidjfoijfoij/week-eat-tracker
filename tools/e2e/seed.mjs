// Realistic week (matches the design artboards) for screenshots and the ad
const EN = {
  meals: ["Tacos", "Salmon & potatoes", "Pesto pasta", "", "Pizza", "Lasagna", "Chicken curry"],
  items: {
    0: ["Tortillas", "Ground beef", "Avocado", "Sour cream"],
    1: ["Salmon", "Potatoes", "Lemon", "Dill", "Butter"],
    2: ["Pasta", "Pesto", "Parmesan"],
    4: ["Pizza dough", "Mozzarella", "Tomato sauce", "Ham", "Mushrooms", "Basil"],
    5: ["Lasagna sheets", "Ground beef", "Chopped tomatoes", "Onion", "Milk", "Grated cheese"],
  },
  extra: "Toilet paper",
};

export function seed(backend, { fid = "f1", lang = "da" } = {}) {
  let meals = ["Tacos", "Laks med kartofler", "Pasta pesto", "", "Pizza", "Lasagne", "Kylling i karry"];
  let items = {
    0: ["Tortillas", "Hakket oksekød", "Avocado", "Creme fraiche"],
    1: ["Laks", "Kartofler", "Citron", "Dild", "Smør"],
    2: ["Pasta", "Pesto", "Parmesan"],
    4: ["Pizzadej", "Mozzarella", "Tomatsauce", "Skinke", "Champignon", "Basilikum"],
    5: ["Lasagneplader", "Hakket oksekød", "Hakkede tomater", "Løg", "Mælk", "Revet ost"],
  };
  let extra = "Toiletpapir";
  if (lang === "en") ({ meals, items, extra } = EN);
  const checked = { 0: 4, 1: 5, 2: 3, 4: 6, 5: 4 };
  let t = Date.parse("2026-10-05T08:00:00Z");
  meals.forEach((m, d) => { if (m) backend.db.meal_plans.push({ id: `m${d}`, family_id: fid, day_index: d, meal: m }); });
  Object.entries(items).forEach(([d, list]) => list.forEach((name, i) => {
    backend.db.ingredients.push({ id: `i${d}-${i}`, family_id: fid, day_index: Number(d), name, checked: i < (checked[d] ?? 0), created_at: new Date(t += 1000).toISOString() });
  }));
  backend.db.ingredients.push({ id: "x1", family_id: fid, day_index: 7, name: extra, checked: false, created_at: new Date(t += 1000).toISOString() });
}
