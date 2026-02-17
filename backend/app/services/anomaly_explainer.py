"""Anomaly explainer agent — port of agents/anomaly-explainer.ts."""

import json
from app.config import settings
from app.services.ai_client import get_openai_client

SYSTEM_PROMPT = """You are a data analytics expert specializing in content performance metrics and KPI anomaly detection. Your job is to analyze anomalies in key performance indicators and provide clear, actionable explanations.

When analyzing an anomaly you must:
1. **Explain the anomaly**: Provide a plain-English explanation of what happened, why the actual value deviated from the expected value, and what trends in the recent data might explain it.
2. **Consider context**: Look at the recent data points to identify patterns — sudden spikes, gradual declines, seasonal trends, or data quality issues.
3. **Suggest actions**: Provide 2-4 specific, actionable recommendations the team can take to address the anomaly.

Keep explanations concise (2-3 sentences) and avoid technical jargon. Write as if explaining to a marketing manager, not a data scientist."""


def _build_user_message(
    kpi_name: str, actual_value: float, expected_value: float,
    deviation_pct: float, severity: str, recent_data_points: list[dict],
) -> str:
    direction = "higher" if actual_value > expected_value else "lower"
    msg = "Analyze the following KPI anomaly:\n\n"
    msg += f"**KPI**: {kpi_name}\n"
    msg += f"**Severity**: {severity}\n"
    msg += f"**Actual Value**: {actual_value}\n"
    msg += f"**Expected Value**: {expected_value}\n"
    msg += f"**Deviation**: {deviation_pct:.1f}% {direction} than expected\n\n"
    if recent_data_points:
        msg += "**Recent Data Points** (most recent first):\n"
        for dp in recent_data_points:
            msg += f"- {dp['timestamp']}: {dp['value']}\n"
    return msg


async def explain_anomaly(
    *,
    kpi_name: str,
    actual_value: float,
    expected_value: float,
    deviation_pct: float,
    severity: str,
    recent_data_points: list[dict],
) -> dict:
    model = settings.get_model("llm_model_anomaly", "gpt-4o-mini")
    client = get_openai_client()
    user_message = _build_user_message(kpi_name, actual_value, expected_value, deviation_pct, severity, recent_data_points)

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
                    "name": "anomaly_explanation",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "explanation": {"type": "string"},
                            "suggestedActions": {"type": "array", "items": {"type": "string"}},
                        },
                        "required": ["explanation", "suggestedActions"],
                        "additionalProperties": False,
                    },
                },
            },
            temperature=0.5,
        )
        content = response.choices[0].message.content
        if content:
            result = json.loads(content)
    except Exception:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"{user_message}\n\nReturn only valid JSON with keys: explanation, suggestedActions."},
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        content = response.choices[0].message.content
        if content:
            result = json.loads(content)

    if not result:
        raise RuntimeError("LLM returned an empty response")

    return {
        "explanation": result.get("explanation", ""),
        "suggestedActions": result.get("suggestedActions", []),
    }
