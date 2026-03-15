import "dotenv/config";
import { OpenAI } from "openai";

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing AI API key. Set GEMINI_API_KEY or OPENAI_API_KEY in server/.env"
  );
}

const openai = new OpenAI({
  apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export default openai
