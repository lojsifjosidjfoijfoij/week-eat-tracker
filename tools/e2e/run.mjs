import { chromium } from "playwright";
import { makeBackend, fakeSession } from "./mock.mjs";
const BASE = process.env.BASE || "http://localhost:4173";
const OUT = process.env.OUT || "./shots";
import fs from "node:fs"; fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
let failures = 0;
const check = (c, m) => { console.log((c ? "  PASS " : "  FAIL ") + m); if (!c) failures++; };

async function newPage({ session = true, lang = "da", onboarded = true, backend }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: lang === "da" ? "da-DK" : "en-US", hasTouch: true, isMobile: true });
  await ctx.route(/supabase\.co/, (r) => backend.handle(r));
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date("2026-10-10T17:30:00"));
  const shot = page.screenshot.bind(page);
  page.screenshot = async (o) => { await page.waitForTimeout(700); return shot(o); };
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/WebSocket|realtime|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.addInitScript(([s, lang, onboarded]) => {
    if (s) localStorage.setItem("sb-exfsipwxedgvlhsmfrub-auth-token", JSON.stringify(s));
    localStorage.setItem("mealweek-language", lang);
    if (onboarded) localStorage.setItem("onboarding_done", "true");
  }, [session ? fakeSession() : null, lang, onboarded]);
  await page.goto(BASE);
  return { page, errors, ctx };
}

// 1. Login
{
  const backend = makeBackend();
  const { page, errors, ctx } = await newPage({ session: false, lang: "da", backend });
  await page.waitForSelector(".auth-card");
  await page.screenshot({ path: `${OUT}/01-login.png` });
  check(await page.getByText("Velkommen tilbage").isVisible(), "login renders in Danish");
  await page.getByRole("button", { name: "Log ind" }).click();
  check(await page.getByText("Skriv din e-mail og adgangskode.").isVisible(), "empty sign-in shows validation");
  await page.getByRole("button", { name: "Glemt adgangskode?" }).click();
  check(await page.getByText("Nulstil adgangskode").isVisible(), "forgot password mode");
  await page.getByRole("button", { name: "Tilbage til log ind" }).click();
  await page.getByRole("button", { name: "Opret konto" }).last().click();
  await page.screenshot({ path: `${OUT}/02-signup.png` });
  check(await page.getByPlaceholder("Dit navn").isVisible(), "sign-up mode shows name field");
  check(errors.length === 0, "no runtime errors on login: " + errors.join(" | "));
  await ctx.close();
}

// 2. Onboarding
{
  const backend = makeBackend();
  const { page, errors, ctx } = await newPage({ onboarded: false, lang: "en", backend });
  await page.waitForSelector(".onboarding");
  await page.screenshot({ path: `${OUT}/03-onboarding.png` });
  await page.getByRole("button", { name: "Next" }).click();
  check(await page.getByText("One shopping list").isVisible(), "onboarding step 2");
  await page.getByRole("button", { name: "Skip" }).click();
  await page.waitForSelector(".tonight");
  check(true, "skip lands on planner");
  check(errors.length === 0, "no runtime errors in onboarding: " + errors.join(" | "));
  await ctx.close();
}

// 3. Solo planner (free user)
{
  const backend = makeBackend();
  const { page, errors, ctx } = await newPage({ lang: "da", backend });
  await page.waitForSelector(".tonight");
  check((await page.locator(".week-row").count()) === 7, "7 week rows");
  check((await page.locator(".week-strip__day.is-today").count()) === 1, "today is highlighted in strip");
  const wk = await page.locator(".wk-num").innerText();
  check(wk === "41", "ISO week number shown (" + wk + ")");
  await page.locator(".week-row").first().click();
  await page.waitForSelector(".day-sheet");
  check(await page.locator(".day-sheet__meal").evaluate((el) => document.activeElement === el), "empty day focuses the meal input");
  await page.locator(".day-sheet__meal").fill("Spaghetti bolognese");
  await page.locator(".day-sheet__meal").press("Enter");
  check(await page.locator(".ai-box--gate").isVisible(), "free user sees AI upsell");
  const add = page.locator(".day-sheet .add-bar input");
  for (const n of ["Spaghetti", "Hakket oksekød", "Tomater"]) { await add.fill(n); await add.press("Enter"); }
  check((await page.locator(".item-row").count()) === 3, "3 ingredients added");
  await page.locator(".item-row__main").first().click();
  check((await page.locator(".day-sheet .check.is-checked").count()) === 1, "ingredient ticked");
  await page.screenshot({ path: `${OUT}/04-day-solo.png` });
  await page.getByRole("button", { name: "Luk" }).click();
  check((await page.locator(".week-row").first().innerText()).includes("Spaghetti bolognese"), "meal shown in week list");
  check((await page.locator(".week-strip__dot.has-meal").count()) === 1, "strip dot for planned day");

  await page.locator(".shop-btn").click();
  await page.waitForSelector(".shop-mode");
  await page.locator(".shop-mode .add-bar input").fill("Toiletpapir");
  await page.locator(".shop-mode .add-bar input").press("Enter");
  const sections = (await page.locator(".shop-section__title").allInnerTexts()).map((d) => d.toLowerCase());
  check(sections.includes("husholdning") && sections.includes("kød & fisk"), "aisles: " + sections.join(", "));
  await page.locator(".shop-row__main").first().click();
  check((await page.locator(".basket-btn").innerText()).includes("2"), "basket shows ticked items (" + (await page.locator(".basket-btn").innerText()) + ")");
  await page.screenshot({ path: `${OUT}/05-shopping.png` });
  await page.getByRole("tab", { name: "Efter dag" }).click();
  check((await page.locator(".shop-section__title").allInnerTexts()).map((x) => x.toLowerCase()).includes("mandag"), "by-day sections");
  await page.screenshot({ path: `${OUT}/06-shopping-by-day.png` });
  await page.locator(".back-btn").click();

  // swap Monday ↔ Wednesday locally
  await page.locator(".week-row").first().click();
  await page.locator(".day-sheet .chip").click();
  await page.locator(".swap-picker__day").nth(1).click(); // ON (Monday excluded)
  await page.waitForTimeout(200);
  check((await page.locator(".day-sheet__date").innerText()).toLowerCase().startsWith("onsdag"), "sheet follows the swapped dinner");
  await page.getByRole("button", { name: "Luk" }).click();
  check((await page.locator(".week-row").nth(2).innerText()).includes("Spaghetti bolognese") && (await page.locator(".week-row").first().innerText()).includes("Tilføj"), "swap moved meal to Wednesday");

  // reload → persisted
  await page.reload();
  await page.waitForSelector(".tonight");
  check((await page.locator(".week-row").nth(2).innerText()).includes("Spaghetti bolognese"), "solo plan persists after reload");

  // paywall from upsell
  await page.locator(".week-row").nth(3).click();
  await page.locator(".day-sheet__meal").fill("Fiskefrikadeller");
  await page.locator(".day-sheet__meal").press("Enter");
  await page.locator(".ai-box--gate").click();
  await page.waitForSelector(".paywall");
  await page.screenshot({ path: `${OUT}/07-paywall-web.png` });
  check((await page.locator(".paywall").count()) === 1, "only one paywall rendered");
  await page.locator(".paywall").getByRole("button", { name: "Luk" }).click();
  await page.locator(".day-sheet").getByRole("button", { name: "Luk" }).click();

  // reset week
  await page.getByRole("button", { name: "Nulstil uge" }).click();
  await page.locator(".btn-destructive").click();
  await page.waitForTimeout(200);
  check((await page.locator(".week-row__meal.is-empty").count()) === 7, "reset clears the week");

  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForSelector(".settings-overlay");
  await page.screenshot({ path: `${OUT}/08-settings-free.png`, fullPage: true });
  check(await page.getByText("Kræver dinrr+").isVisible(), "create family locked for free user");
  check(errors.length === 0, "no runtime errors in solo flow: " + errors.join(" | "));
  await ctx.close();
}

// 4. Family planner (premium) with sync calls
{
  const backend = makeBackend({ family: { id: "f1", name: "Kjær", code: "AB7KQ9ZP", owner_id: "u1" }, premium: { self: true, family: true } });
  const { page, errors, ctx } = await newPage({ lang: "da", backend });
  await page.waitForSelector(".tonight");
  check(await page.locator(".bottom-bar__family").isVisible(), "family avatars shown");
  await page.locator(".week-row").nth(1).click();
  await page.locator(".day-sheet__meal").fill("Lasagne");
  await page.waitForTimeout(900);
  const upserts = backend.db.calls.filter((c) => c.startsWith("POST /rest/v1/meal_plans"));
  check(upserts.length === 1 && upserts[0].includes("on_conflict=family_id%2Cday_index"), "one debounced upsert while typing (" + upserts.length + ")");
  await page.locator(".day-sheet__meal").press("Enter");
  await page.waitForSelector(".ai-chip");
  await page.screenshot({ path: `${OUT}/10-ai-suggestions.png` });
  await page.locator(".ai-box__all").click();
  await page.waitForTimeout(300);
  check(backend.db.ingredients.length === 6, "AI 'add all' inserted 6 rows (" + backend.db.ingredients.length + ")");
  await page.locator(".item-row__main").first().click();
  await page.waitForTimeout(300);
  check(backend.db.ingredients.filter(i => i.checked).length === 1, "toggle synced to server");
  await page.locator(".item-row__delete").first().click();
  await page.waitForTimeout(300);
  check(backend.db.ingredients.length === 5, "delete synced to server");
  // swap Tuesday → Friday
  await page.locator(".day-sheet .chip").click();
  await page.locator(".swap-picker__day", { hasText: "FR" }).click();
  await page.waitForTimeout(500);
  const fri = backend.db.meal_plans.find((m) => m.day_index === 4)?.meal;
  const tue = backend.db.meal_plans.find((m) => m.day_index === 1)?.meal;
  check(fri === "Lasagne" && tue === "", "swap saved meals (fri=" + fri + ", tue=" + JSON.stringify(tue) + ")");
  check(backend.db.ingredients.every((i) => i.day_index === 4), "swap moved ingredients to Friday on the server");
  await page.waitForTimeout(600);
  check((await page.locator(".item-row").count()) === 5, "sheet still shows the 5 ingredients after swap");
  await page.getByRole("button", { name: "Luk" }).click();
  await page.locator(".shop-btn").click();
  check(await page.locator(".live-chip").isVisible(), "live chip in shopping mode");
  await page.locator(".back-btn").click();
  await page.getByRole("button", { name: "Indstillinger" }).click();
  await page.waitForSelector(".family-code-box");
  check(await page.getByText("AB7KQ9ZP").isVisible(), "family code shown");
  await page.locator(".settings-overlay").getByRole("button", { name: "Luk" }).click();
  await page.getByRole("button", { name: "Nulstil uge" }).click();
  check(await page.getByText(/for alle i Kjær/).isVisible(), "family reset warning names the family");
  await page.locator(".btn-destructive").click();
  await page.waitForTimeout(300);
  check(backend.db.meal_plans.length === 0, "family reset cleared server meals");
  check(errors.length === 0, "no runtime errors in family flow: " + errors.join(" | "));
  await ctx.close();
}

// 5. Family without premium → read-only
{
  const backend = makeBackend({ family: { id: "f1", name: "Kjær", code: "AB7KQ9ZP", owner_id: "u2" }, premium: { self: false, family: false } });
  backend.db.meal_plans.push({ id: "m1", family_id: "f1", day_index: 0, meal: "Tacos" });
  const { page, errors, ctx } = await newPage({ lang: "en", backend });
  await page.waitForSelector(".paused-banner", { timeout: 8000 });
  await page.screenshot({ path: `${OUT}/12-family-paused.png` });
  await page.locator(".week-row").first().click();
  check((await page.locator(".day-sheet input").count()) === 0, "read-only: no inputs when sharing paused");
  check(await page.locator(".day-sheet__meal").innerText() === "Tacos", "family plan still visible");
  check(errors.length === 0, "no runtime errors in paused flow: " + errors.join(" | "));
  await ctx.close();
}

await browser.close();
console.log(failures ? `${failures} FAILURE(S)` : "ALL PASS");
process.exit(failures ? 1 : 0);
