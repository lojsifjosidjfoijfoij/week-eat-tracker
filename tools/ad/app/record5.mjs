// APP VIDEO #5 "Swap day" (plans changed? swap Tuesday and Friday in one tap) — records the dinrr ad frame by frame from the REAL app running in a phone frame.
// Template for all app videos: copy to recordN.mjs + stageN.html, change captions/taps/actions/sound events.
// Run from tools/ad/app via ../../ad/app/make_appvideo.sh N (serves tools/ad on :4174, app on :4173).
// All app animations are paused and stepped on a virtual clock, so every frame is exact.
import { chromium } from "playwright";
import fs from "node:fs";
import { makeBackend, fakeSession } from "../../e2e/mock.mjs";

const FPS = 30, DUR = Number(process.env.DUR || 18), OUT = process.env.OUT || "frames5", NUM = process.env.NUM || "5";
const LANG = process.env.LANG_AD || "en";
const L = {
  da: { family: "Familien Kjær", mom: "Mor", ai: ["Kyllingebryst", "Kokosmælk", "Karrypasta", "Løg", "Hvidløg", "Ris"], dish: "Kylling i karry",
        thu: "Frikadeller", thuItems: ["Hakket svinekød", "Kartofler", "Rødkål"], locale: "da-DK" },
  en: { family: "Kjær Family", mom: "Mom", ai: ["Lasagna sheets", "Ground beef", "Chopped tomatoes", "Onion", "Garlic", "Milk", "Butter", "Grated cheese"], dish: "Lasagna",
        thu: "Meatballs", thuItems: ["Ground pork", "Potatoes", "Red cabbage"], locale: "en-US" },
}[LANG];
const ONLY = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : null; // preview single times
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

const backend = makeBackend({ family: { id: "f1", name: L.family, code: "AB7KQ9ZP", owner_id: "u1" }, premium: { self: true, family: true } });
backend.state.members[1].name = L.mom;
// A normal week. Tuesday got busy → swap Tuesday's tacos with Friday's pasta (the real "Swap day" chip).
const WEEK = {
  0: ["Chicken curry", ["Chicken breast", "Coconut milk", "Curry paste", "Rice"]],
  1: ["Tacos", ["Tortillas", "Ground beef", "Avocado", "Sour cream", "Salsa"]],
  2: ["Salmon & potatoes", ["Salmon", "Potatoes", "Lemon", "Dill"]],
  3: ["Meatballs", ["Ground pork", "Potatoes", "Red cabbage"]],
  4: ["Spaghetti bolognese", ["Spaghetti", "Ground beef", "Chopped tomatoes", "Onion"]],
  5: ["Pizza", ["Pizza dough", "Mozzarella", "Ham"]],
  6: ["Pancakes", ["Eggs", "Milk", "Flour"]],
};
let ts = Date.parse("2026-10-11T08:00:00Z");
for (const [d, [meal, items]] of Object.entries(WEEK)) {
  backend.db.meal_plans.push({ id: `m${d}`, family_id: "f1", day_index: Number(d), meal });
  items.forEach((name, i) => backend.db.ingredients.push({ id: `i${d}-${i}`, family_id: "f1", day_index: Number(d), name, checked: false, created_at: new Date(ts += 1000).toISOString() }));
}
let releaseAI = null;
const AI = L.ai;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, locale: L.locale });
await ctx.route(/supabase\.co/, async (route) => {
  const u = route.request().url();
  if (u.includes("/functions/v1/suggest-ingredients") && route.request().method() === "POST") {
    await new Promise((r) => { releaseAI = r; });
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ingredients: AI }) });
  }
  return backend.handle(route);
});
await ctx.addInitScript(([s, lang]) => {
  if (location.port === "4173") {
    localStorage.setItem("sb-exfsipwxedgvlhsmfrub-auth-token", JSON.stringify(s));
    localStorage.setItem("mealweek-language", lang);
    localStorage.setItem("onboarding_done", "true");
    localStorage.setItem("dinrr:shoppingSort", "day");
  }
}, [fakeSession(), LANG]);
const page = await ctx.newPage();
await page.clock.setFixedTime(new Date("2026-10-12T16:30:00"));
await page.goto(`http://localhost:4174/app/stage${NUM}.html?lang=${LANG}`);
const app = page.frameLocator("#app");
const appFrame = () => page.frames().find((f) => f.url().startsWith("http://localhost:4173"));
await app.locator(".bottom-bar__family").waitFor();
await app.locator(".week-row__count").first().waitFor();
await page.evaluate(() => document.fonts.ready);
await appFrame().evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

// Where an app element sits on the stage (for the touch indicator)
async function stagePoint(sel, nth = 0) {
  const r = await app.locator(sel).nth(nth).evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  const f = await page.locator("#app").evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, s: b.width / 390 }; });
  return { x: f.x + r.x * f.s, y: f.y + r.y * f.s };
}

let tap = null;
const taps = [
  { t: 3.4, sel: ".week-row", nth: 1 },                  // open Tuesday (Tacos)
  { t: 5.1, sel: ".day-sheet__chips .chip" },            // "Swap day"
  { t: 6.5, sel: ".swap-picker__day", nth: 3 },          // Friday (Tuesday itself is not in the picker)
  { t: 9.3, sel: ".day-sheet .round-btn" },              // close → week shows the swap
];
// ── sound events (read by app_sound.py) ──
const sfx = [];
const ev = (t, type, extra = {}) => sfx.push({ t: Math.round(t * 1000) / 1000, type, ...extra });
ev(0.0, "boom");
[0.35, 0.75].forEach((t, i) => ev(t, "ding", { i: 2 + i * 2 }));
ev(2.0, "whoosh", { dir: "in" });
[2.75, 6.3, 9.7].forEach((t, i) => ev(t, "pop", { i: i + 1 }));
ev(6.55, "riser"); ev(6.9, "ding", { i: 6 }); ev(7.15, "ding", { i: 8, soft: true });
ev(9.9, "heart");
ev(13.7, "whoosh", { dir: "out" }); ev(14.1, "end");
const actions = [];
for (const k of taps) {
  actions.push({ t: k.t - 0.3, run: async () => { tap = { t: k.t, ...(await stagePoint(k.sel, k.nth ?? 0)) }; } });
  actions.push({ t: k.t, run: () => app.locator(k.sel).nth(k.nth ?? 0).dispatchEvent("click") });
  ev(k.t, "tap");
}
// Yellow rings around Tuesday + Friday once the sheet is closed
actions.push({ t: 9.85, run: async () => {
  const box = async (nth) => {
    const r = await app.locator(".week-row").nth(nth).evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
    const f = await page.locator("#app").evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, s: b.width / 390 }; });
    return { x: f.x + r.x * f.s, y: f.y + r.y * f.s, w: r.w * f.s, h: r.h * f.s };
  };
  const a = await box(1), b = await box(4);
  await page.evaluate(([a, b]) => window.setRings([{ ...a, t: 9.9, hold: 3.2 }, { ...b, t: 10.15, hold: 2.95 }]), [a, b]);
} });
actions.sort((a, b) => a.t - b.t);

const seek = async (ms) => {
  await appFrame().evaluate(async (vt) => {
    await new Promise((r) => requestAnimationFrame(() => r()));
    for (const a of document.getAnimations()) {
      if (a.__s === undefined) a.__s = vt;
      a.pause();
      a.currentTime = Math.max(0, vt - a.__s);
    }
  }, ms);
};

const N = Math.round(DUR * FPS);
let next = 0;
const t0 = Date.now();
for (let f = 0; f < N; f++) {
  const t = f / FPS;
  while (next < actions.length && actions[next].t <= t + 1e-6) { await actions[next].run(); next++; }
  if (ONLY && !ONLY.some((x) => Math.abs(x - t) < 0.5 / FPS)) { await seek(t * 1000); continue; }
  await seek(t * 1000);
  await page.evaluate(([t, tap]) => window.render(t, tap), [t, tap]);
  await page.screenshot({ path: `${OUT}/${String(f).padStart(5, "0")}.png` });
  if (f % 60 === 0) console.log(`frame ${f}/${N} t=${t.toFixed(2)} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
fs.writeFileSync(`sfx${NUM}.json`, JSON.stringify(sfx.sort((a, b) => a.t - b.t), null, 1));
await browser.close();
console.log("done", sfx.length, "sound events");
