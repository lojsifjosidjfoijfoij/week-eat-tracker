import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the JWT and get the user
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { mealName, language = "en" } = await req.json();

    if (!mealName || typeof mealName !== "string" || mealName.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Meal name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clamp input to prevent prompt injection via very long strings
    const safeMealName = mealName.trim().slice(0, 100);

    // Rate limit: max 20 AI calls per user per day, stored in the ai_usage table
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const today = new Date().toISOString().split("T")[0];
    const { data: usageRow } = await adminClient
      .from("ai_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle();

    const currentCount = usageRow?.count ?? 0;
    if (currentCount >= 20) {
      return new Response(
        JSON.stringify({ error: "Daily limit reached. Try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment before calling OpenAI so a failed request still counts
    await adminClient.from("ai_usage").upsert({
      user_id: user.id,
      usage_date: today,
      count: currentCount + 1,
    });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const languageName =
      language === "da" ? "Danish" :
      language === "de" ? "German" :
      language === "fr" ? "French" :
      language === "es" ? "Spanish" : "English";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: `You are a shopping list assistant. When given a meal name, return the ingredients someone would need to BUY at the supermarket.
Rules:
- Never include salt, pepper, water, or oil — things everyone has at home
- Butter is fine to include
- If the dish has a main protein variant (like fish vs chicken), list BOTH as separate ingredients so the user can choose — but only for the main protein, not for minor ingredients
- Never write "chicken or fish" as one item — always split into separate items
- Each ingredient is one specific thing
- Return ONLY a JSON array of strings, nothing else
Respond in ${languageName}.`,
          },
          {
            role: "user",
            content: `Suggest ingredients for: ${safeMealName}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    let ingredients: string[];
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      ingredients = JSON.parse(cleanContent);
      if (!Array.isArray(ingredients) || !ingredients.every((item) => typeof item === "string")) {
        throw new Error("Invalid response format");
      }
    } catch {
      ingredients = content
        .split(/[,\n]/)
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
        .slice(0, 8);
    }

    return new Response(
      JSON.stringify({ ingredients }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
