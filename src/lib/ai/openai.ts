import OpenAI from "openai";

const apiKey =
  process.env.LLM_API_KEY ??
  process.env.OPENROUTER_API_KEY ??
  process.env.OPENAI_API_KEY;

const baseURL = process.env.LLM_API_URL ?? process.env.OPENAI_BASE_URL;

export const openai = new OpenAI({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
});
