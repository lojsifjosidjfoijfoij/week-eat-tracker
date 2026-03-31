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
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { mealName, language = "en" } = await req.json();
    
    if (!mealName || mealName.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Meal name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: max 20 suggestions per user per day
    const today = new Date().toISOString().split("T")[0];
    const rateLimitKey = `rate_limit_${user.id}_${today}`;
    const currentCount = parseInt(Deno.env.get(rateLimitKey) ?? "0");
    if (currentCount >= 20) {
      return new Response(
        JSON.stringify({ error: "Daily limit reached. Try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const languageName = language === "da" ? "Danish" : language === "de" ? "German" : language === "fr" ? "French" : language === "es" ? "Spanish" : "English";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful cooking assistant. When given a meal name, suggest a list of common ingredients needed for that dish. Return ONLY a JSON array of ingredient names as strings, nothing else. Example format: ["Spaghetti", "Ground beef", "Tomatoes", "Garlic"]. Keep the list between 5-8 items. Respond in ${languageName}.`
          },
          {
            role: "user",
            content: `Suggest ingredients for: ${mealName}`
          }
        ],
        max_tokens: 200,
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
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      ingredients = JSON.parse(cleanContent);
      if (!Array.isArray(ingredients) || !ingredients.every(item => typeof item === 'string')) {
        throw new Error("Invalid response format");
      }
    } catch {
      ingredients = content.split(/[,\n]/).map((item: string) => item.trim()).filter((item: string) => item.length > 0).slice(0, 8);
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
