function isOpenRouter() {
  const baseUrl = process.env.LLM_API_URL ?? process.env.OPENAI_BASE_URL ?? "";
  return baseUrl.includes("openrouter.ai");
}

export function getModel(envSpecificKey: string, openaiDefault: string) {
  const specific = process.env[envSpecificKey];
  if (specific && specific.trim().length > 0) return specific;

  const globalModel = process.env.LLM_MODEL;
  if (globalModel && globalModel.trim().length > 0) return globalModel;

  return isOpenRouter() ? `openai/${openaiDefault}` : openaiDefault;
}

