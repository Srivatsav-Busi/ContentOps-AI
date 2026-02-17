import { openai } from "@/lib/ai/openai";
import { getModel } from "@/lib/ai/model";

interface DataPoint {
  timestamp: string;
  value: number;
}

interface AnomalyExplainerInput {
  kpiName: string;
  actualValue: number;
  expectedValue: number;
  deviationPct: number;
  severity: string;
  recentDataPoints: DataPoint[];
}

interface AnomalyExplanation {
  explanation: string;
  suggestedActions: string[];
}

const SYSTEM_PROMPT = `You are a data analytics expert specializing in content performance metrics and KPI anomaly detection. Your job is to analyze anomalies in key performance indicators and provide clear, actionable explanations.

When analyzing an anomaly you must:
1. **Explain the anomaly**: Provide a plain-English explanation of what happened, why the actual value deviated from the expected value, and what trends in the recent data might explain it.
2. **Consider context**: Look at the recent data points to identify patterns — sudden spikes, gradual declines, seasonal trends, or data quality issues.
3. **Suggest actions**: Provide 2-4 specific, actionable recommendations the team can take to address the anomaly.

Keep explanations concise (2-3 sentences) and avoid technical jargon. Write as if explaining to a marketing manager, not a data scientist.`;

const RESPONSE_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "anomaly_explanation",
    strict: true,
    schema: {
      type: "object",
      properties: {
        explanation: {
          type: "string",
          description: "Plain-English explanation of the anomaly (2-3 sentences)",
        },
        suggestedActions: {
          type: "array",
          items: { type: "string" },
          description: "2-4 specific actionable recommendations",
        },
      },
      required: ["explanation", "suggestedActions"],
      additionalProperties: false,
    },
  },
};

export async function explainAnomaly(
  input: AnomalyExplainerInput
): Promise<AnomalyExplanation> {
  const userMessage = buildUserMessage(input);
  const model = getModel("LLM_MODEL_ANOMALY", "gpt-4o-mini");

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: RESPONSE_SCHEMA,
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned an empty response");
    }

    const result: AnomalyExplanation = JSON.parse(content);
    return {
      explanation: result.explanation ?? "",
      suggestedActions: Array.isArray(result.suggestedActions)
        ? result.suggestedActions
        : [],
    };
  } catch {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `${userMessage}\n\n` +
            "Return only valid JSON with keys: explanation, suggestedActions.",
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned an empty response");
    }

    const result = JSON.parse(content) as Partial<AnomalyExplanation>;
    return {
      explanation: result.explanation ?? "",
      suggestedActions: Array.isArray(result.suggestedActions)
        ? result.suggestedActions
        : [],
    };
  }
}

function buildUserMessage(input: AnomalyExplainerInput): string {
  const direction =
    input.actualValue > input.expectedValue ? "higher" : "lower";

  let message = `Analyze the following KPI anomaly:\n\n`;
  message += `**KPI**: ${input.kpiName}\n`;
  message += `**Severity**: ${input.severity}\n`;
  message += `**Actual Value**: ${input.actualValue}\n`;
  message += `**Expected Value**: ${input.expectedValue}\n`;
  message += `**Deviation**: ${input.deviationPct.toFixed(1)}% ${direction} than expected\n\n`;

  if (input.recentDataPoints.length > 0) {
    message += `**Recent Data Points** (most recent first):\n`;
    for (const dp of input.recentDataPoints) {
      message += `- ${dp.timestamp}: ${dp.value}\n`;
    }
  }

  return message;
}
