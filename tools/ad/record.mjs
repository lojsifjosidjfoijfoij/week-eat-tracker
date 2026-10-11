// Records the dinrr ad frame by frame from the REAL app running in a phone frame.
// All app animations are paused and stepped on a virtual clock, so every frame is exact.
import { chromium } from "playwright";
import fs from "node:fs";
import { makeBackend, fakeSession } from "../e2e/mock.mjs";
import { seed } from "../e2e/seed.mjs";

const FPS = 30, DUR = Number(process.env.DUR || 20.6), OUT = process.env.OUT || "frames";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : null; // preview single times
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

const backend = makeBackend({ family: { id: "f1", name: "Familien Kjær", code: "AB7KQ9ZP", owner_id: "u1" }, premium: { self: true, family: true } });
backend.state.members[1].name = "Mor";
seed(backend);
backend.db.meal_plans = backend.db.meal_plans.filter((m) => m.day_index !== 6); // Sunday is planned in the ad
let releaseAI = null;
const AI = ["Kyllingebryst", "Kokosmælk", "Karrypasta", "Løg", "Hvidløg", "Ris"];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const ctx = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, locale: "da-DK" });
await ctx.route(/supabase\.co/, async (route) => {
  const u = route.request().url();
  if (u.includes("/functions/v1/suggest-ingredients") && route.request().method() === "POST") {
    await new Promise((r) => { releaseAI = r; });
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ingredients: AI }) });
  }
  return backend.handle(route);
});
await ctx.addInitScript(([s]) => {
  if (location.port === "4173") {
    localStorage.setItem("sb-exfsipwxedgvlhsmfrub-auth-token", JSON.stringify(s));
    localStorage.setItem("mealweek-language", "da");
    localStorage.setItem("onboarding_done", "true");
    localStorage.setItem("dinrr:shoppingSort", "aisle");
  }
}, [fakeSession()]);
const page = await ctx.newPage();
await page.clock.setFixedTime(new Date("2026-10-07T17:30:00"));
await page.goto("http://localhost:4174/stage.html");
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
  { t: 4.95, sel: ".week-row", nth: 6 },
  { t: 8.85, sel: ".ai-box__all" },
  { t: 10.25, sel: ".day-sheet .round-btn" },
  { t: 10.9, sel: ".shop-btn" },
  { t: 12.0, sel: ".shop-row__main" },
  { t: 12.55, sel: ".shop-row__main" },
  { t: 13.1, sel: ".shop-row__main" },
  { t: 13.65, sel: ".shop-row__main" },
  { t: 14.75, sel: ".back-btn" },
];
const actions = [];
for (const k of taps) {
  actions.push({ t: k.t - 0.3, run: async () => { tap = { t: k.t, ...(await stagePoint(k.sel, k.nth ?? 0)) }; } });
  if (!k.fake) actions.push({ t: k.t, run: () => app.locator(k.sel).nth(k.nth ?? 0).dispatchEvent("click") });
}
const word = "Kylling i karry";
[...word].forEach((ch, i) => actions.push({ t: 5.75 + i * 0.07, run: () => app.locator(".day-sheet__meal").pressSequentially(ch) }));
actions.push({ t: 6.95, run: () => app.locator(".day-sheet__meal").press("Enter") });
actions.push({ t: 7.75, run: async () => { for (let i = 0; i < 50 && !releaseAI; i++) await page.waitForTimeout(20); releaseAI?.(); } });
// "Mor" plans Thursday from her phone → the app picks it up live
actions.push({ t: 16.05, run: async () => {
  backend.db.meal_plans.push({ id: "m3", family_id: "f1", day_index: 3, meal: "Frikadeller" });
  ["Hakket svinekød", "Kartofler", "Rødkål"].forEach((name, i) => backend.db.ingredients.push({ id: `mor-${i}`, family_id: "f1", day_index: 3, name, checked: false, created_at: new Date(Date.parse("2026-10-10T16:00:00Z") + i).toISOString() }));
  await appFrame().evaluate(() => window.dispatchEvent(new Event("online")));
  await page.waitForTimeout(600); // let the refetch land before the next frame
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
await browser.close();
console.log("done");
