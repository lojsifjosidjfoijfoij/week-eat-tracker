// POST /functions/v1/suggest-ingredients   body: { mealName: string, language?: "en"|"da"|"de"|"fr"|"es" }
// dinrr+ only. Returns { ingredients: string[] }.
//
// Secrets: OPENAI_API_KEY (required), OPENAI_MODEL (optional, default below)
import { adminClient, json, preflight, requireUser } from "../_shared/http.ts";
import { refreshEntitlement, revenueCatConfigured } from "../_shared/revenuecat.ts";

const DAILY_LIMIT = 30;
// gpt-4.1-nano is shut down by OpenAI on 2026-10-23. Primary = current small
// model; fallback = a model that is not scheduled for shutdown.
const PRIMARY_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-6-luna";
const FALLBACK_MODEL = "gpt-4.1-mini";

const LANGUAGES: Record<string, string> = {
  en: "English", da: "Danish", de: "German", fr: "French", es: "Spanish",
};

const SYSTEM_PROMPT = (languageName: string) => `You are a shopping list assistant for a family meal planner.
Given the name of a dish, return the ingredients someone needs to BUY at the supermarket to cook it for a family dinner.
Rules:
- Never include salt, pepper, water or cooking oil — everyone has those at home. Butter is fine to include.
- One specific item per entry. Never combine alternatives ("chicken or fish") in one entry — if the main protein is ambiguous, list each option as its own entry. Only do this for the main protein.
- Use short, everyday product names as they appear in a supermarket, without quantities.
- At most 12 items, most important first.
- If the text is not a dish or food, return an empty list.
- Write every ingredient in ${languageName}.`;

function sanitize(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    if (typeof item !== "string") continue;
    const clean = item.replace(/\s+/g, " ").trim().slice(0, 60);
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    if (out.length >= 12) break;
  }
  return out;
}

async function askOpenAI(model: string, apiKey: string, meal: string, languageName: string): Promise<string[]> {
  const isLegacy = model.startsWith("gpt-4");
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT(languageName) },
      { role: "user", content: `Dish: ${meal}` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ingredients",
        strict: true,
        schema: {
          type: "object",
          properties: { ingredients: { type: "array", items: { type: "string" } } },
          required: ["ingredients"],
          additionalProperties: false,
        },
      },
    },
  };
  if (isLegacy) {
    body.temperature = 0.1;
    body.max_tokens = 300;
  } else {
    body.reasoning_effort = "none";
    body.max_completion_tokens = 400;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI ${model} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
  return sanitize(Array.isArray(parsed) ? parsed : parsed?.ingredients);
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;
  const { user, userClient } = auth;

  let payload: { mealName?: unknown; language?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const meal = typeof payload.mealName === "string" ? payload.mealName.replace(/\s+/g, " ").trim().slice(0, 100) : "";
  if (!meal) return json({ error: "meal_required" }, 400);
  const language = typeof payload.language === "string" && LANGUAGES[payload.language] ? payload.language : "en";

  const admin = adminClient();

  // 1. dinrr+ only — checked on the server, not just in the app
  const isPremium = async () => {
    const { data } = await userClient.rpc("get_premium_status");
    return !!(data?.self || data?.family);
  };
  let premium = await isPremium();
  if (!premium && revenueCatConfigured()) {
    try {
      await refreshEntitlement(admin, user.id); // just bought? webhook may not have arrived yet
      premium = await isPremium();
    } catch (e) {
      console.warn("suggest-ingredients: entitlement refresh failed", e);
    }
  }
  if (!premium) return json({ error: "premium_required" }, 402);

  // 2. Shared cache — the same dish in the same language gets the same list
  const cacheKey = `${language}:${meal.toLowerCase()}`;
  const { data: cached } = await admin
    .from("ai_suggestion_cache").select("ingredients").eq("cache_key", cacheKey).maybeSingle();
  if (cached?.ingredients && Array.isArray(cached.ingredients) && cached.ingredients.length) {
    return json({ ingredients: cached.ingredients, cached: true });
  }

  // 3. Daily limit (atomic, so parallel requests can't sneak past it)
  const { data: allowed, error: creditError } = await admin.rpc("consume_ai_credit", {
    p_user_id: user.id,
    p_limit: DAILY_LIMIT,
  });
  if (creditError) {
    console.error("suggest-ingredients: consume_ai_credit failed", creditError);
    return json({ error: "server_error" }, 500);
  }
  if (!allowed) return json({ error: "daily_limit" }, 429);

  // 4. Ask OpenAI (with a fallback model)
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.error("suggest-ingredients: OPENAI_API_KEY is not set");
    return json({ error: "server_error" }, 500);
  }
  let ingredients: string[] = [];
  try {
    ingredients = await askOpenAI(PRIMARY_MODEL, apiKey, meal, LANGUAGES[language]);
  } catch (e) {
    console.warn("suggest-ingredients: primary model failed, trying fallback", e);
    try {
      ingredients = await askOpenAI(FALLBACK_MODEL, apiKey, meal, LANGUAGES[language]);
    } catch (e2) {
      console.error("suggest-ingredients: fallback model failed", e2);
      return json({ error: "ai_unavailable" }, 502);
    }
  }

  if (ingredients.length) {
    await admin.from("ai_suggestion_cache").upsert({ cache_key: cacheKey, ingredients, created_at: new Date().toISOString() });
  }
  return json({ ingredients });
});
