import { prisma } from "../../lib/prisma";

// Uses Google Gemini API via native fetch — no npm package required!
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const BASE_SYSTEM_PROMPT = `
You are "Foodie", the official AI culinary assistant for FoodHub.
Your goal is to help users discover meals, provide personalized recommendations, and answer questions related to food, ingredients, and the FoodHub platform.

Keep your answers concise, friendly, and engaging.
Use Markdown to format your responses (e.g., bolding meal names, using bullet points).

CRITICAL RULE:
You MUST ONLY recommend meals, categories, and restaurants that are explicitly provided in the DATABASE CONTEXT below.
DO NOT invent, hallucinate, or recommend external meals or restaurants that are not in the context. If a user asks for something not in the context, politely inform them that it's not currently available on FoodHub and suggest something from the available options.
`;

type ChatMessage = { role: string; content: string };

export const getChatCompletion = async (messages: ChatMessage[]): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Please add GEMINI_API_KEY to your .env file."
    );
  }

  // Fetch meals and providers from the database
  const availableMeals = await prisma.meal.findMany({
    where: { isAvailable: true, isDeleted: false },
    include: {
      category: true,
      provider: true,
    },
  });

  // Format the database context into a string
  const mealsContext = availableMeals.map(meal => {
    return `- ${meal.title} ($${meal.price}) at ${meal.provider.restaurantName} [Category: ${meal.category.name}]`;
  }).join("\n");

  const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}\n\n--- DATABASE CONTEXT ---\nAVAILABLE MEALS:\n${mealsContext || "No meals currently available."}\n------------------------`;

  // Convert our message format to Gemini's "contents" format
  const contents = [
    // Inject system prompt as the first user turn
    {
      role: "user",
      parts: [{ text: fullSystemPrompt }],
    },
    {
      role: "model",
      parts: [{ text: "Understood! I will strictly use only the provided database context to recommend meals and restaurants." }],
    },
    // Append actual conversation history
    ...messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
  ];

  const fetchResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.2, // Lower temperature to prevent hallucination
        maxOutputTokens: 400,
      },
    }),
  });

  if (!fetchResponse.ok) {
    const err = await fetchResponse.json() as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? "Gemini API request failed");
  }

  const data = await fetchResponse.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";

  return text;
};
