"""Report summary writer agent — port of agents/report-writer.ts."""

import json
from app.config import settings
from app.services.ai_client import get_openai_client

SYSTEM_PROMPT = """You are an executive reporting specialist for a content operations platform. Your job is to write concise, insightful executive summaries from dashboard KPI data.

Write a 3-paragraph executive summary following this structure:
1. **Key Wins**: Highlight the most positive trends and achievements. Call out KPIs that exceeded targets.
2. **Areas of Concern**: Identify underperforming metrics, negative trends, or KPIs significantly below target. Be direct but constructive.
3. **Recommendations**: Provide 2-3 strategic recommendations based on the data. Each recommendation should be specific and tied to observed metrics.

Guidelines:
- Use plain business language suitable for C-level executives.
- Include specific numbers and percentages when referencing KPIs.
- Keep the total summary under 300 words.
- Focus on insights, not just data recitation."""


async def generate_report_summary(
    *,
    dashboard_name: str,
    kpis: list[dict],
    period_start: str,
    period_end: str,
) -> str:
    model = settings.get_model("llm_model_report", "gpt-4o-mini")
    client = get_openai_client()

    msg = f"Generate an executive summary for the following dashboard report.\n\n"
    msg += f"**Dashboard**: {dashboard_name}\n"
    msg += f"**Period**: {period_start} to {period_end}\n\n"
    msg += "**KPIs**:\n\n"

    for kpi in kpis:
        current = kpi.get("currentValue", 0)
        previous = kpi.get("previousValue", 0)
        target = kpi.get("targetValue", 0)
        change_pct = f"{((current - previous) / previous * 100):.1f}" if previous != 0 else "N/A"
        vs_target = f"{((current - target) / target * 100):.1f}" if target != 0 else "N/A"
        msg += f"- **{kpi['name']}**: Current = {current}, Previous = {previous}"
        msg += f" ({change_pct}% change), Target = {target}"
        msg += f" ({vs_target}% vs target), Trend: {kpi.get('trend', 'N/A')}\n"

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": msg},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "report_summary",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {"summary": {"type": "string"}},
                        "required": ["summary"],
                        "additionalProperties": False,
                    },
                },
            },
            temperature=0.6,
        )
        content = response.choices[0].message.content
        if content:
            return json.loads(content).get("summary", "")
    except Exception:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"{msg}\n\nReturn only valid JSON with key: summary."},
            ],
            response_format={"type": "json_object"},
            temperature=0.6,
        )
        content = response.choices[0].message.content
        if content:
            return json.loads(content).get("summary", "")

    raise RuntimeError("LLM returned an empty response")
