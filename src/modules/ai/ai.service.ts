// Uses Google Gemini API via native fetch — no npm package required!
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `
You are "Foodie", the official AI culinary assistant for FoodHub.
Your goal is to help users discover meals, provide personalized recommendations, and answer questions related to food, ingredients, and the FoodHub platform.

Keep your answers concise, friendly, and engaging.
Use Markdown to format your responses (e.g., bolding meal names, using bullet points).

If a user asks for recommendations, you can invent realistic-sounding meals (e.g., "Spicy Garlic Ramen", "Vegan Avocado Burger") or refer to general categories like Pizza, Sushi, Burgers.
Do not hallucinate features that a food delivery app wouldn't have.
`;

type ChatMessage = { role: string; content: string };

export const getChatCompletion = async (messages: ChatMessage[]): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Please add GEMINI_API_KEY to your .env file."
    );
  }

  // Convert our message format to Gemini's "contents" format
  const contents = [
    // Inject system prompt as the first user turn
    {
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }],
    },
    {
      role: "model",
      parts: [{ text: "Understood! I'm Foodie, ready to help." }],
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
        temperature: 0.7,
        maxOutputTokens: 300,
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
