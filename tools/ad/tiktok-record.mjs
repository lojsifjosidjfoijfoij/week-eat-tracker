// Records the "family group chat at 5pm" TikTok frame by frame.
// The chat is drawn by tiktok.html; the middle part is the REAL dinrr app in English.
// Writes frames/ + sfx.json (exact timing of every sound effect) for the audio mix.
import { chromium } from "playwright";
import fs from "node:fs";
import { makeBackend, fakeSession } from "../e2e/mock.mjs";

const FPS = 30, DUR = Number(process.env.DUR || 20.5), OUT = process.env.OUT || "frames-tt";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : null;
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

const FID = "f1";
const backend = makeBackend({ family: { id: FID, name: "Family", code: "AB7KQ9ZP", owner_id: "u1" }, premium: { self: true, family: true } });
backend.state.members = [
  { user_id: "u1", email: "louis@example.com", name: "Louis", is_owner: true },
  { user_id: "u2", email: "mom@example.com", name: "Mom", is_owner: false },
  { user_id: "u3", email: "dad@example.com", name: "Dad", is_owner: false },
  { user_id: "u4", email: "emma@example.com", name: "Emma", is_owner: false },
  { user_id: "u5", email: "noah@example.com", name: "Noah", is_owner: false },
];
const MEALS = ["Tacos", "Salmon & potatoes", "Chicken curry", "Meatballs", "Pizza", "Lasagna", "Roast chicken"];
let created = Date.parse("2026-10-07T15:00:00Z");
const item = (name, day) => ({ id: `it-${name}-${day}`.replace(/\W+/g, "-"), family_id: FID, day_index: day, name, checked: false, created_at: new Date(created += 1000).toISOString() });
const BATCHES = [
  [["Onion", 2], ["Onion", 5], ["Garlic", 2], ["Avocado", 0], ["Chicken breast", 2], ["Ground beef", 0]],
  [["Mozzarella", 4], ["Sour cream", 0]],
  [["Coconut milk", 2], ["Curry paste", 2], ["Rice", 2]],
];

const sfx = [];
const ev = (t, type, extra = {}) => sfx.push({ t: Math.round(t * 1000) / 1000, type, ...extra });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const ctx = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, locale: "en-US" });
await ctx.route(/supabase\.co/, (route) => backend.handle(route));
await ctx.addInitScript(([s]) => {
  if (location.port === "4173") {
    localStorage.setItem("sb-exfsipwxedgvlhsmfrub-auth-token", JSON.stringify(s));
    localStorage.setItem("mealweek-language", "en");
    localStorage.setItem("onboarding_done", "true");
    localStorage.setItem("dinrr:shoppingSort", "aisle");
    localStorage.removeItem("dinrr:aisleOverrides");
  }
}, [fakeSession()]);
const page = await ctx.newPage();
await page.clock.setFixedTime(new Date("2026-10-07T17:01:00"));
await page.goto("http://localhost:4174/tiktok.html");
const app = page.frameLocator("#app");
const appFrame = () => page.frames().find((f) => f.url().startsWith("http://localhost:4173"));
await app.locator(".bottom-bar__family").waitFor();
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))); });
await appFrame().evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
await page.evaluate(() => window.measure());
// Entry animations for things that appear live in the ad (same easing as the app)
await appFrame().evaluate(() => {
  const st = document.createElement("style");
  st.textContent = `
    @keyframes adPop { 0% { transform: scale(0.96); background: #EBF2E2; } 55% { transform: scale(1.015); background: #EBF2E2; } 100% { transform: none; } }
    .week-row.ad-pop { animation: adPop .55s cubic-bezier(0.22,1,0.36,1); }
    .shop-row.ad-in { animation: fadeUp .38s cubic-bezier(0.22,1,0.36,1) both; }`;
  document.head.appendChild(st);
});

async function stagePoint(sel, nth = 0) {
  const r = await app.locator(sel).nth(nth).evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  const f = await page.locator("#app").evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, s: b.width / 390 }; });
  return { x: f.x + r.x * f.s, y: f.y + r.y * f.s };
}
const refresh = async () => { await appFrame().evaluate(() => window.dispatchEvent(new Event("online"))); };

let tap = null;
let scrollTarget = null;
const actions = [];
const at = (t, run) => actions.push({ t, run });

// ── Chat sounds (times match SCRIPT in tiktok.html) ──
[[0.22, 0], [0.62, 1], [0.98, 2], [1.30, 3], [1.62, 4], [1.92, 5]].forEach(([t, i]) => ev(t, "ding", { i }));
ev(2.22, "typing");
ev(2.72, "freeze");
ev(2.9, "boom");
ev(3.02, "send");
ev(3.95, "whoosh", { dir: "out" });
[[15.45, 6], [16.25, 7], [16.85, 8]].forEach(([t, i]) => ev(t, "ding", { i, soft: true }));
ev(15.95, "heart");
ev(14.45, "whoosh", { dir: "in" });
ev(18.1, "end");
ev(3.0, "music");

// ── Week fills itself ──
MEALS.forEach((meal, d) => {
  const t = 5.1 + d * 0.48;
  ev(t, "pop", { i: d });
  at(t, async () => {
    backend.db.meal_plans.push({ id: `m${d}`, family_id: FID, day_index: d, meal });
    await refresh();
    for (let k = 0; k < 40; k++) {
      const txt = await app.locator(".week-row").nth(d).innerText();
      if (txt.includes(meal)) break;
      await page.waitForTimeout(25);
    }
    await app.locator(".week-row").nth(d).evaluate((el) => { el.classList.remove("ad-pop"); void el.offsetWidth; el.classList.add("ad-pop"); });
  });
});

// ── Shopping list ──
const taps = [
  { t: 9.3, sel: ".shop-btn" },
  { t: 12.15, sel: ".shop-row__main" }, { t: 12.55, sel: ".shop-row__main" },
  { t: 12.95, sel: ".shop-row__main" }, { t: 13.35, sel: ".shop-row__main" },
  { t: 13.95, sel: ".back-btn" },
];
for (const k of taps) {
  at(k.t - 0.3, async () => { tap = { t: k.t, ...(await stagePoint(k.sel)) }; });
  at(k.t, () => app.locator(k.sel).first().dispatchEvent("click"));
  ev(k.t, k.sel === ".shop-row__main" ? "check" : "tap");
}
BATCHES.forEach((batch, b) => {
  const t = 9.85 + b * 0.6;
  batch.forEach((_, i) => ev(t + i * 0.055, "tick", { i: b * 6 + i }));
  at(t, async () => {
    const before = await app.locator(".shop-row").count();
    batch.forEach(([name, day]) => backend.db.ingredients.push(item(name, day)));
    await refresh();
    for (let k = 0; k < 40; k++) { if ((await app.locator(".shop-row").count()) > before) break; await page.waitForTimeout(25); }
    await page.waitForTimeout(80);
    const names = new Set(batch.map(([n]) => n));
    await appFrame().evaluate((names) => {
      document.querySelectorAll(".shop-row").forEach((row) => {
        const n = row.querySelector(".shop-row__name")?.textContent?.trim();
        if (names.includes(n) && !row.dataset.adSeen) { row.dataset.adSeen = "1"; row.classList.add("ad-in"); }
      });
    }, [...names]);
    if (b >= 1) scrollTarget = "bottom";
  });
});
at(11.7, () => { scrollTarget = 0; });
actions.sort((a, b) => a.t - b.t);

const seek = async (ms, scroll) => {
  await appFrame().evaluate(async ([vt, scroll]) => {
    await new Promise((r) => requestAnimationFrame(() => r()));
    for (const a of document.getAnimations()) {
      if (a.__s === undefined) a.__s = vt;
      a.pause();
      a.currentTime = Math.max(0, vt - a.__s);
    }
    const body = document.querySelector(".shop-mode__body");
    if (body && scroll !== null) {
      const target = scroll === "bottom" ? body.scrollHeight - body.clientHeight : scroll;
      body.scrollTop = body.scrollTop + (target - body.scrollTop) * 0.22;
    }
  }, [ms, scroll]);
};

const N = Math.round(DUR * FPS);
let next = 0;
const t0 = Date.now();
for (let f = 0; f < N; f++) {
  const t = f / FPS;
  while (next < actions.length && actions[next].t <= t + 1e-6) { await actions[next].run(); next++; }
  await seek(t * 1000, scrollTarget);
  if (ONLY && !ONLY.some((x) => Math.abs(x - t) < 0.5 / FPS)) continue;
  await page.evaluate(([t, tap]) => window.render(t, tap), [t, tap]);
  await page.screenshot({ path: `${OUT}/${String(f).padStart(5, "0")}.png` });
  if (f % 90 === 0) console.log(`frame ${f}/${N} t=${t.toFixed(2)} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
fs.writeFileSync("sfx.json", JSON.stringify(sfx.sort((a, b) => a.t - b.t), null, 1));
await browser.close();
console.log("done", sfx.length, "sound events");
