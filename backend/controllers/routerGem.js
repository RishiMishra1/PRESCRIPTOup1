import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const routerGem= async (req, res) => {
  try {
    console.log("📩 Received Request:", req.body); // Debugging
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const chatSession = model.startChat({
      generationConfig,
      history: [], // You can add chat history if needed
    });

    const result = await chatSession.sendMessage(prompt);
    console.log("✅ Gemini API Response:", result.response.text()); // Debugging

    res.json({ response: result.response.text() });

  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { routerGem };
