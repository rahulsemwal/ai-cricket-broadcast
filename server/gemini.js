import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * Sends a prompt to the Google Gemini 2.5 Flash API and returns the generated text response.
 * @param {string} prompt - The text prompt to send to the AI.
 * @returns {Promise<string>} The AI-generated response text.
 */
export async function callGemini(prompt) {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    const errorDetails = err.response ? err.response.data : err.message;
    console.error("Gemini API Error:", errorDetails);
    throw new Error("Failed to fetch from Gemini API: " + JSON.stringify(errorDetails));
  }
}