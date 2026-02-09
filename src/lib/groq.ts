import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Modèles disponibles sur Groq (gratuits)
export const GROQ_MODELS = {
  // Llama 3.3 - Le plus récent et performant
  LLAMA_70B: "llama-3.3-70b-versatile",
  // Mixtral - Bon pour le code
  MIXTRAL: "mixtral-8x7b-32768",
  // Llama 3.1 - Alternative rapide
  LLAMA_8B: "llama-3.1-8b-instant",
} as const;

export const DEFAULT_MODEL = GROQ_MODELS.LLAMA_70B;
