import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function getOpenAI(apiKey?: string) {
  if (apiKey && typeof apiKey === "string" && apiKey.trim()) {
    return new OpenAI({ apiKey: apiKey.trim() });
  }

  if (cachedClient) return cachedClient;

  const envKey = process.env.OPENAI_API_KEY;
  if (!envKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  cachedClient = new OpenAI({ apiKey: envKey });
  return cachedClient;
}
