// APP VIDEO #4 "Mom changed Thursday. I saw it instantly." — live family sync, two REAL app instances side by side.
// Mom (left iframe) plans Thursday; Dad's app (right iframe) refetches exactly like the real realtime handler does
// (we fire the same "online" event the app listens to, since the mock backend has no websocket).
import { chromium } from "playwright";
import fs from "node:fs";
import { makeBackend, fakeSession } from "../../e2e/mock.mjs";

const FPS = 30, DUR = Number(process.env.DUR || 19.5), OUT = process.env.OUT || "frames4", NUM = process.env.NUM || "4";
const LANG = "en";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : null;
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

const backend = makeBackend({ family: { id: "f1", name: "Kjær Family", code: "AB7KQ9ZP", owner_id: "u1" }, premium: { self: true, family: true } });
backend.state.members[1].name = "Mom";
// Thursday (3) is still empty — Mom fills it in during the video.
const WEEK = {
  0: ["Spaghetti bolognese", ["Spaghetti", "Ground beef", "Onion", "Chopped tomatoes"]],
  1: ["Chicken curry", ["Chicken breast", "Coconut milk", "Rice"]],
  2: ["Salmon & potatoes", ["Salmon", "Potatoes", "Lemon"]],
  4: ["Pizza", ["Pizza dough", "Mozzarella", "Ham"]],
  5: ["Lasagna", ["Lasagna sheets", "Ground beef", "Milk"]],
  6: ["Pancakes", ["Eggs", "Milk", "Flour"]],
};
let ts = Date.parse("2026-10-11T08:00:00Z");
for (const [d, [meal, items]] of Object.entries(WEEK)) {
  backend.db.meal_plans.push({ id: `m${d}`, family_id: "f1", day_index: Number(d), meal });
  items.forEach((name, i) => backend.db.ingredients.push({ id: `i${d}-${i}`, family_id: "f1", day_index: Number(d), name, checked: false, created_at: new Date(ts += 1000).toISOString() }));
}
let releaseAI = null;
const AI = ["Tortillas", "Ground beef", "Onion", "Avocado", "Sour cream", "Cheddar"];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, locale: "en-US" });
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
const mom = page.frameLocator("#mom"), dad = page.frameLocator("#dad");
const fr = (name) => page.frame({ name });
for (const a of [mom, dad]) { await a.locator(".bottom-bar__family").waitFor(); await a.locator(".week-row__count").first().waitFor(); }
await page.evaluate(() => document.fonts.ready);
for (const n of ["mom", "dad"]) await fr(n).evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

async function stageBox(loc, frameId) {
  const r = await loc.evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
  const f = await page.locator("#" + frameId).evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, s: b.width / 390 }; });
  return { x: f.x + r.x * f.s, y: f.y + r.y * f.s, w: r.w * f.s, h: r.h * f.s };
}
const L = (who) => (who === "mom" ? mom : dad);

let tap = null;
const sfx = [];
const ev = (t, type, extra = {}) => sfx.push({ t: Math.round(t * 1000) / 1000, type, ...extra });
const actions = [];
const doTap = (t, who, sel, nth = 0, kind = "tap") => {
  actions.push({ t: t - 0.3, run: async () => { const b = await stageBox(L(who).locator(sel).nth(nth), who); tap = { t, x: b.x + b.w / 2, y: b.y + b.h / 2 }; } });
  actions.push({ t, run: () => L(who).locator(sel).nth(nth).dispatchEvent("click") });
  ev(t, kind);
};
// Dad's app receives the change: same refetch the realtime handler triggers
const syncDad = (t, ring) => {
  actions.push({ t, run: async () => {
    await fr("dad").evaluate(() => window.dispatchEvent(new Event("online")));
    await page.waitForTimeout(700);
    if (ring) { const b = await stageBox(dad.locator(".week-row").nth(3), "dad"); await page.evaluate((b) => window.setRing(b), { ...b, t, hold: ring }); }
  } });
};

// ── hook sounds ──
ev(0.0, "boom");
[0.2, 0.55, 0.9, 1.25, 1.6].forEach((t, i) => ev(t, "ding", { i: 2 + i }));
ev(2.0, "whoosh", { dir: "in" });
[2.8, 7.7, 11.7].forEach((t, i) => ev(t, "pop", { i: i + 1 }));

// ── Mom plans Thursday ──
doTap(3.3, "mom", ".week-row", 3);
[..."Tacos"].forEach((ch, i) => { const t = 4.0 + i * 0.11; actions.push({ t, run: () => mom.locator(".day-sheet__meal").pressSequentially(ch) }); ev(t, "tick", { i }); });
actions.push({ t: 4.7, run: () => mom.locator(".day-sheet__meal").press("Enter") });
ev(4.75, "send");
actions.push({ t: 5.3, run: async () => { for (let i = 0; i < 100 && !releaseAI; i++) await page.waitForTimeout(20); releaseAI?.(); await page.waitForTimeout(300); } });
AI.forEach((_, i) => ev(5.35 + i * 0.08, "pop", { i: i % 7 }));
doTap(6.4, "mom", ".ai-box__all");
doTap(7.25, "mom", ".day-sheet .round-btn");
// ── Dad sees it ──
syncDad(7.8, 2.6);
ev(7.85, "riser"); ev(8.1, "ding", { i: 6 }); ev(8.35, "ding", { i: 8, soft: true });
doTap(10.6, "dad", ".shop-btn");
// ── Dad ticks Thursday's taco items at the store; Mom's app updates too ──
// (rows by day: Thursday's items come after Mon–Wed; find them by name)
const tickAt = (t, name) => {
  actions.push({ t: t - 0.3, run: async () => { const loc = dad.locator(".shop-row__main", { hasText: name }).first(); await loc.scrollIntoViewIfNeeded().catch(() => {}); const b = await stageBox(loc, "dad"); tap = { t, x: b.x + b.w / 2, y: b.y + b.h / 2 }; } });
  actions.push({ t, run: () => dad.locator(".shop-row__main", { hasText: name }).first().dispatchEvent("click") });
  ev(t, "check"); ev(t + 0.05, "ding", { i: 4, soft: true });
};
tickAt(12.3, "Tortillas");
tickAt(13.0, "Avocado");
tickAt(13.7, "Sour cream");
actions.push({ t: 14.2, run: async () => { await fr("mom").evaluate(() => window.dispatchEvent(new Event("online"))); await page.waitForTimeout(700); } });
ev(14.3, "ding", { i: 7, soft: true });
ev(15.7, "whoosh", { dir: "out" }); ev(16.1, "end");
actions.sort((a, b) => a.t - b.t);

const seek = async (ms) => {
  for (const n of ["mom", "dad"]) await fr(n).evaluate(async (vt) => {
    await new Promise((r) => requestAnimationFrame(() => r()));
    for (const a of document.getAnimations()) { if (a.__s === undefined) a.__s = vt; a.pause(); a.currentTime = Math.max(0, vt - a.__s); }
  }, ms);
};

const N = Math.round(DUR * FPS);
let next = 0;
const t0 = Date.now();
for (let f = 0; f < N; f++) {
  const t = f / FPS;
  while (next < actions.length && actions[next].t <= t + 1e-6) { await page.evaluate(([t, tap]) => window.render(t, tap), [t, tap]); await actions[next].run(); next++; }
  await seek(t * 1000);
  await page.evaluate(([t, tap]) => window.render(t, tap), [t, tap]);
  if (ONLY && !ONLY.some((x) => Math.abs(x - t) < 0.5 / FPS)) continue;
  await page.screenshot({ path: `${OUT}/${String(f).padStart(5, "0")}.png` });
  if (f % 60 === 0) console.log(`frame ${f}/${N} t=${t.toFixed(2)} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
fs.writeFileSync(`sfx${NUM}.json`, JSON.stringify(sfx.sort((a, b) => a.t - b.t), null, 1));
await browser.close();
console.log("done", sfx.length, "sound events");
