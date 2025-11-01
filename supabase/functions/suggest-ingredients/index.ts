import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealName } = await req.json();
    
    if (!mealName || mealName.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Meal name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a helpful cooking assistant. When given a meal name, suggest a list of common ingredients needed for that dish. Return ONLY a JSON array of ingredient names as strings, nothing else. Example format: [\"Spaghetti\", \"Ground beef\", \"Tomatoes\", \"Garlic\", \"Onion\", \"Olive oil\", \"Basil\"]. Keep the list between 5-8 items."
          },
          {
            role: "user",
            content: `Suggest ingredients for: ${mealName}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON array from the response
    let ingredients: string[];
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      ingredients = JSON.parse(cleanContent);
      
      // Validate it's an array of strings
      if (!Array.isArray(ingredients) || !ingredients.every(item => typeof item === 'string')) {
        throw new Error("Invalid response format");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback: try to extract ingredients from text
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
    console.error("Error in suggest-ingredients function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
