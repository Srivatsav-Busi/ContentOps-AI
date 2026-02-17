import { openai } from "@/lib/ai/openai";
import { getModel } from "@/lib/ai/model";

interface KPIData {
  name: string;
  currentValue: number;
  previousValue: number;
  targetValue: number;
  trend: string;
}

interface ReportSummaryInput {
  dashboardName: string;
  kpis: KPIData[];
  periodStart: string;
  periodEnd: string;
}

const SYSTEM_PROMPT = `You are an executive reporting specialist for a content operations platform. Your job is to write concise, insightful executive summaries from dashboard KPI data.

Write a 3-paragraph executive summary following this structure:
1. **Key Wins**: Highlight the most positive trends and achievements. Call out KPIs that exceeded targets.
2. **Areas of Concern**: Identify underperforming metrics, negative trends, or KPIs significantly below target. Be direct but constructive.
3. **Recommendations**: Provide 2-3 strategic recommendations based on the data. Each recommendation should be specific and tied to observed metrics.

Guidelines:
- Use plain business language suitable for C-level executives.
- Include specific numbers and percentages when referencing KPIs.
- Keep the total summary under 300 words.
- Focus on insights, not just data recitation.`;

const RESPONSE_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "report_summary",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "3-paragraph executive summary (key wins, concerns, recommendations)",
        },
      },
      required: ["summary"],
      additionalProperties: false,
    },
  },
};

export async function generateReportSummary(
  input: ReportSummaryInput
): Promise<string> {
  const userMessage = buildUserMessage(input);
  const model = getModel("LLM_MODEL_REPORT", "gpt-4o-mini");

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: RESPONSE_SCHEMA,
      temperature: 0.6,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned an empty response");
    }

    const result = JSON.parse(content) as { summary?: string };
    return result.summary ?? "";
  } catch {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `${userMessage}\n\n` +
            "Return only valid JSON with key: summary.",
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned an empty response");
    }

    const result = JSON.parse(content) as { summary?: string };
    return result.summary ?? "";
  }
}

function buildUserMessage(input: ReportSummaryInput): string {
  let message = `Generate an executive summary for the following dashboard report.\n\n`;
  message += `**Dashboard**: ${input.dashboardName}\n`;
  message += `**Period**: ${input.periodStart} to ${input.periodEnd}\n\n`;
  message += `**KPIs**:\n\n`;

  for (const kpi of input.kpis) {
    const changeAbs = kpi.currentValue - kpi.previousValue;
    const changePct =
      kpi.previousValue !== 0
        ? ((changeAbs / kpi.previousValue) * 100).toFixed(1)
        : "N/A";
    const vsTarget =
      kpi.targetValue !== 0
        ? (((kpi.currentValue - kpi.targetValue) / kpi.targetValue) * 100).toFixed(1)
        : "N/A";

    message += `- **${kpi.name}**: Current = ${kpi.currentValue}, Previous = ${kpi.previousValue}`;
    message += ` (${changePct}% change), Target = ${kpi.targetValue}`;
    message += ` (${vsTarget}% vs target), Trend: ${kpi.trend}\n`;
  }

  return message;
}
