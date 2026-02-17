"""KPI recommendation agent — suggests KPIs based on business context.

Uses GPT-4o-mini to analyze business goals, industry, and existing metrics
to recommend actionable KPIs with visualization types and target values.
"""

import json
from app.config import settings
from app.services.ai_client import get_openai_client

SYSTEM_PROMPT = """\
You are a business intelligence expert specializing in KPI selection and \
dashboard design for content-focused businesses. Your job is to recommend \
the most impactful KPIs based on the company's industry, goals, and existing data.

For each recommended KPI you must provide:
1. **name** — Clear, jargon-free metric name (e.g., "Average Watch Time", "Content ROI")
2. **metricType** — The category: engagement, reach, conversion, revenue, operational, content_quality
3. **description** — 1-2 sentence explanation of what this KPI measures and why it matters
4. **vizType** — Best visualization: line (trends), bar (comparisons), number (single value), gauge (progress toward target), sparkline (compact trend)
5. **targetValue** — A reasonable initial target value (numeric)
6. **comparison** — Recommended comparison period: wow (week-over-week), mom (month-over-month), yoy (year-over-year)
7. **source** — Where the data would come from (e.g., "youtube_analytics", "instagram_insights", "internal_db", "google_analytics")
8. **priority** — high, medium, or low — based on impact and relevance to stated goals
9. **rationale** — Why this KPI is important for THIS specific business

Recommend 6-10 KPIs. Order them by priority (high first). \
Ensure a balanced mix across categories (not all engagement metrics). \
Consider the company's maturity — startups need different KPIs than enterprises.\
"""


def _build_user_message(
    industry: str,
    business_type: str,
    goals: list[str],
    existing_kpis: list[str] | None = None,
) -> str:
    msg = "Recommend KPIs for the following business:\n\n"
    msg += f"**Industry**: {industry}\n"
    msg += f"**Business Type**: {business_type}\n"
    msg += f"**Goals**: {', '.join(goals)}\n"
    if existing_kpis:
        msg += f"\n**Already Tracking**: {', '.join(existing_kpis)}\n"
        msg += "\nDo NOT recommend KPIs they are already tracking. Suggest complementary metrics.\n"
    return msg


async def recommend_kpis(
    *,
    industry: str,
    business_type: str,
    goals: list[str],
    existing_kpis: list[str] | None = None,
) -> dict:
    model = settings.get_model("llm_model", "gpt-4o-mini")
    client = get_openai_client()
    user_message = _build_user_message(industry, business_type, goals, existing_kpis)

    result = None
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "kpi_recommendations",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "recommendations": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "metricType": {"type": "string"},
                                        "description": {"type": "string"},
                                        "vizType": {"type": "string"},
                                        "targetValue": {"type": "number"},
                                        "comparison": {"type": "string"},
                                        "source": {"type": "string"},
                                        "priority": {"type": "string"},
                                        "rationale": {"type": "string"},
                                    },
                                    "required": [
                                        "name", "metricType", "description", "vizType",
                                        "targetValue", "comparison", "source", "priority", "rationale",
                                    ],
                                    "additionalProperties": False,
                                },
                            },
                            "summary": {"type": "string"},
                        },
                        "required": ["recommendations", "summary"],
                        "additionalProperties": False,
                    },
                },
            },
            temperature=0.6,
        )
        content = response.choices[0].message.content
        if content:
            result = json.loads(content)
    except Exception:
        # Fallback for providers without strict json_schema
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": (
                    f"{user_message}\n\nReturn only valid JSON with keys: "
                    "recommendations (array), summary (string)."
                )},
            ],
            response_format={"type": "json_object"},
            temperature=0.6,
        )
        content = response.choices[0].message.content
        if content:
            result = json.loads(content)

    if not result:
        raise RuntimeError("LLM returned an empty response")

    return {
        "recommendations": result.get("recommendations", []),
        "summary": result.get("summary", ""),
    }
