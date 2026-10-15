// APP VIDEO #2 "Type a dish, get the ingredients" — records the dinrr ad frame by frame from the REAL app running in a phone frame.
// Template for all app videos: copy to recordN.mjs + stageN.html, change captions/taps/actions/sound events.
// Run from tools/ad/app via ../../ad/app/make_appvideo.sh N (serves tools/ad on :4174, app on :4173).
// All app animations are paused and stepped on a virtual clock, so every frame is exact.
import { chromium } from "playwright";
import fs from "node:fs";
import { makeBackend, fakeSession } from "../../e2e/mock.mjs";
import { seed } from "../../e2e/seed.mjs";

const FPS = 30, DUR = Number(process.env.DUR || 19.5), OUT = process.env.OUT || "frames2", NUM = process.env.NUM || "2";
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
seed(backend, { lang: LANG });
// Saturday's seeded lasagna is replaced so Thursday's lasagna (typed in the ad) is the only one
backend.db.meal_plans = backend.db.meal_plans.filter((m) => m.day_index !== 5 && m.day_index !== 3);
backend.db.ingredients = backend.db.ingredients.filter((i) => i.day_index !== 5);
backend.db.meal_plans.push({ id: "m5", family_id: "f1", day_index: 5, meal: "Burgers" });
["Burger buns", "Ground beef", "Cheddar", "Lettuce"].forEach((name, i) => backend.db.ingredients.push({ id: `b5-${i}`, family_id: "f1", day_index: 5, name, checked: i < 1, created_at: new Date(Date.parse("2026-10-06T08:00:00Z") + i * 1000).toISOString() }));
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
    localStorage.setItem("dinrr:shoppingSort", "aisle");
  }
}, [fakeSession(), LANG]);
const page = await ctx.newPage();
await page.clock.setFixedTime(new Date("2026-10-07T17:30:00"));
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
  { t: 3.4, sel: ".week-row", nth: 3 },          // Thursday
  { t: 8.45, sel: ".ai-box__all" },               // Add all
  { t: 10.2, sel: ".day-sheet .round-btn" },      // close sheet
  { t: 10.95, sel: ".shop-btn" },                 // open shopping list
  { t: 12.7, sel: ".shop-row__main" },
  { t: 13.3, sel: ".shop-row__main" },
  { t: 13.9, sel: ".shop-row__main" },
  { t: 15.05, sel: ".back-btn" },
];
// ── sound events (read by app_sound.py) ──
const sfx = [];
const ev = (t, type, extra = {}) => sfx.push({ t: Math.round(t * 1000) / 1000, type, ...extra });
ev(0.0, "boom");
for (let i = 0; i < 8; i++) ev(0.2 + i * 0.13, "pop", { i: i % 7 });
ev(2.0, "whoosh", { dir: "in" });
[2.75, 7.4, 11.3].forEach((t, i) => ev(t, "pop", { i: i + 1 }));
ev(15.7, "whoosh", { dir: "out" }); ev(16.1, "end");
const actions = [];
for (const k of taps) {
  actions.push({ t: k.t - 0.3, run: async () => { tap = { t: k.t, ...(await stagePoint(k.sel, k.nth ?? 0)) }; } });
  actions.push({ t: k.t, run: () => app.locator(k.sel).nth(k.nth ?? 0).dispatchEvent("click") });
  ev(k.t, k.sel === ".shop-row__main" ? "check" : "tap");
}
const word = L.dish;
[...word].forEach((ch, i) => { actions.push({ t: 4.1 + i * 0.1, run: () => app.locator(".day-sheet__meal").pressSequentially(ch) }); ev(4.1 + i * 0.1, "tick", { i }); });
actions.push({ t: 5.1, run: () => app.locator(".day-sheet__meal").press("Enter") });
ev(5.15, "send");
actions.push({ t: 6.3, run: async () => { for (let i = 0; i < 50 && !releaseAI; i++) await page.waitForTimeout(20); releaseAI?.(); await page.waitForTimeout(250); } });
AI.forEach((_, i) => ev(6.35 + i * 0.08, "pop", { i: i % 7 }));
ev(8.5, "ding", { i: 6 }); ev(8.75, "ding", { i: 8, soft: true });
[12.75, 13.35, 13.95].forEach((t, i) => ev(t + 0.05, "ding", { i: 4 + i, soft: true }));
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
