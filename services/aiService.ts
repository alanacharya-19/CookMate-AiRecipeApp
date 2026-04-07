import type { GeneratedRecipe, IngredientItem, VegType } from "@/services/types";

function extractJson(text: string) {
  // Tries to recover from models that wrap JSON in extra text.
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  const start =
    firstBrace === -1
      ? firstBracket
      : firstBracket === -1
        ? firstBrace
        : Math.min(firstBrace, firstBracket);

  const lastBrace = text.lastIndexOf("}");
  const lastBracket = text.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);

  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type RecipeSuggestion = {
  title: string;
  emoji: string;
  description: string;
};

export async function generateRecipeSuggestionsFromAI(params: {
  prompt: string;
  vegType: VegType;
}) {
  const { prompt, vegType } = params;

  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_OPENROUTER_API (OpenRouter API key).");
  }

  const model = process.env.EXPO_PUBLIC_OPENROUTER_MODEL || "openai/gpt-5.2";
  const siteUrl = process.env.EXPO_PUBLIC_OPENROUTER_SITE_URL;
  const siteName = process.env.EXPO_PUBLIC_OPENROUTER_SITE_NAME;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "Return ONLY valid JSON. No markdown. You are a cooking app assistant.",
    },
    {
      role: "user",
      content: `User input: "${prompt}"

Generate exactly 3 recipe suggestions. All must include the main ingredient(s) from the user input.
Include variety (e.g., curry, salad, soup). Keep it fun and appetizing.

Return JSON with this exact shape:
{
  "suggestions": [
    {
      "title": "Recipe Name",
      "emoji": "🍛",
      "description": "1-2 sentences describing taste, texture, occasion.",
      "vegType": "${vegType}"
    }
  ]
}

Rules:
- Always include an emoji.
- Keep description 1-2 sentences.
- Use common ingredients.`,
    },
  ];

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(siteUrl ? { "HTTP-Referer": siteUrl } : null),
      ...(siteName ? { "X-OpenRouter-Title": siteName } : null),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.9,
    }),
  });

  const data: any = await resp.json().catch(() => ({}));
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    const err = data?.error?.message || "AI response did not include message content.";
    throw new Error(err);
  }

  const json = extractJson(content);
  const list = (json?.suggestions ?? json) as any;
  if (!Array.isArray(list)) {
    throw new Error("AI did not return suggestions array.");
  }

  const suggestions: RecipeSuggestion[] = list
    .map((s: any) => ({
      title: String(s?.title ?? "").trim(),
      emoji: String(s?.emoji ?? "").trim(),
      description: String(s?.description ?? "").trim(),
    }))
    .filter((s: RecipeSuggestion) => s.title && s.emoji && s.description)
    .slice(0, 3);

  if (suggestions.length !== 3) {
    throw new Error("AI returned invalid suggestions.");
  }

  return suggestions;
}

export async function generateRecipesFromAI(params: {
  prompt: string;
  vegType: VegType;
  category?: string;
  count?: number;
}) {
  const { prompt, vegType, category, count = 6 } = params;
  const normalizedCategory = category && category.trim() ? category.trim() : "Any";

  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_OPENROUTER_API (OpenRouter API key).");
  }

  const model = process.env.EXPO_PUBLIC_OPENROUTER_MODEL || "openai/gpt-5.2";

  const siteUrl = process.env.EXPO_PUBLIC_OPENROUTER_SITE_URL;
  const siteName = process.env.EXPO_PUBLIC_OPENROUTER_SITE_NAME;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a professional recipe generator. Return ONLY valid JSON. Do not wrap in markdown.",
    },
    {
      role: "user",
      content: `Generate ${count} ${vegType === "veg" ? "vegetarian" : "non-vegetarian"} recipes.
Category: ${normalizedCategory === "Any" ? "Choose the best category yourself (Breakfast, Lunch, Dinner, Dessert, Drink, Salad, Fastfood, Cake)." : `"${normalizedCategory}"`}.
The user says: "${prompt}"

Return JSON with this exact shape:
{
  "recipes": [
    {
      "title": string,
      "ingredients": [
        { "name": string, "quantity": string, "unit": string, "notes": string }
      ],
      "instructions": string[],
      "tips": string[],
      "vegType": "${vegType}",
      "category": string
    }
  ]
}

Rules:
- Each ingredients array should have 6-12 items.
- Always include quantity and unit (example units: cup, tbsp, tsp, gram, ml, piece).
- Each instructions array should have 5-10 steps.
- Keep instructions simple and short.
- Use common ingredients.
- Ensure vegType is exactly "${vegType}" for every recipe.
- Tips should be 1-3 bullets as strings.`,
    },
  ];

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(siteUrl ? { "HTTP-Referer": siteUrl } : null),
      ...(siteName ? { "X-OpenRouter-Title": siteName } : null),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
    }),
  });

  const data: any = await resp.json().catch(() => ({}));
  const content: string | undefined = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    const err = data?.error?.message || "AI response did not include message content.";
    throw new Error(err);
  }

  const json = extractJson(content);
  if (!json) {
    throw new Error("Could not parse AI response as JSON.");
  }

  const recipes = json.recipes ?? json;
  if (!Array.isArray(recipes)) {
    throw new Error("Parsed AI JSON did not contain a recipes array.");
  }

  return recipes.map((r: any) => {
    const ingredientsRaw = Array.isArray(r.ingredients) ? r.ingredients : [];
    const ingredients: IngredientItem[] = ingredientsRaw
      .map((it: any) => ({
        name: String(it?.name ?? "").trim(),
        quantity: String(it?.quantity ?? "").trim(),
        unit: String(it?.unit ?? "").trim(),
        notes: String(it?.notes ?? "").trim(),
      }))
      .filter((it: IngredientItem) => it.name && it.quantity && it.unit);

    const tips: string[] = Array.isArray(r.tips)
      ? r.tips.map((t: any) => String(t).trim()).filter(Boolean)
      : [];

    const recipe: GeneratedRecipe = {
      title: String(r.title ?? ""),
      ingredients,
      instructions: Array.isArray(r.instructions)
        ? r.instructions.map(String)
        : [],
      tips,
      vegType: (r.vegType as VegType) ?? vegType,
      category: String(r.category ?? category),
    };

    if (!recipe.title) throw new Error("AI returned a recipe missing title.");
    return recipe;
  });
}

