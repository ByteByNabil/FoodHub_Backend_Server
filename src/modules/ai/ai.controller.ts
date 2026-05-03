import type { Request, Response } from "express";
import { getChatCompletion } from "./ai.service";

export const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid messages array." });
      return;
    }

    const reply = await getChatCompletion(messages);
    
    res.status(200).json({ reply });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response." });
  }
};
