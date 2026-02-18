import { createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export const ollama = createOpenAI({
  baseURL: `${OLLAMA_BASE_URL}/v1`,
  apiKey: "ollama", // Ollama doesn't need a real key but the SDK requires one
});

/**
 * Returns the appropriate AI model instance based on provider.
 */
export function getModel(provider: string, model: string) {
  if (provider === "ollama") {
    return ollama(model);
  }
  return openai(model || "gpt-4o");
}
