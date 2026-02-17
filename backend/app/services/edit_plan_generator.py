"""Edit plan generation agent — port of agents/edit-plan-generator.ts."""

import json
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.services.ai_client import get_openai_client
from app.models.video import EditPlan

SYSTEM_PROMPT = """You are an expert video editor AI assistant. Your job is to analyze a set of detected scenes from a video and create an optimal edit plan.

You must:
1. **Select scenes**: Choose which scenes to include based on content quality, relevance, and narrative flow. Consider confidence scores — prefer scenes with higher detection confidence.
2. **Order scenes**: Arrange scenes in the most compelling order for the target format.
3. **Assign transitions**: Choose appropriate transition types between scenes (cut, dissolve, fade, wipe, slide).
4. **Estimate duration**: Calculate the total estimated duration of the final edit in milliseconds.
5. **Name the plan**: Give the edit plan a descriptive name.
6. **Explain reasoning**: Describe why you selected and ordered scenes this way.

If a target duration is specified, trim or select scenes to approximate that duration. For short-form content (reels, shorts), prioritize the most engaging moments. For long-form, maintain narrative coherence."""


def _build_user_message(scenes: list[dict], target_format: str, target_duration_ms: int | None) -> str:
    msg = "Create an edit plan for the following scenes.\n\n"
    msg += f"**Target Format**: {target_format}\n"
    if target_duration_ms:
        msg += f"**Target Duration**: {target_duration_ms}ms ({target_duration_ms / 1000:.1f}s)\n"
    msg += f"\n**Available Scenes** ({len(scenes)} total):\n\n"
    for s in scenes:
        msg += f"- **Scene {s['id']}**: {s['startMs']}ms – {s['endMs']}ms"
        msg += f" | Label: \"{s['label']}\" | Confidence: {s['confidence'] * 100:.0f}%\n"
        if s.get("transcriptText"):
            msg += f"  Transcript: \"{s['transcriptText'][:200]}\"\n"
    return msg


async def generate_edit_plan(
    *,
    scenes: list[dict],
    target_format: str,
    target_duration_ms: int | None,
    project_id: str,
    org_id: str,
    user_id: str,
    db: Session,
) -> dict:
    model = settings.get_model("llm_model_edit", "gpt-4o-mini")
    client = get_openai_client()
    user_message = _build_user_message(scenes, target_format, target_duration_ms)

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
                    "name": "edit_plan",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "sceneSequence": {"type": "array", "items": {"type": "object", "properties": {"sceneId": {"type": "string"}, "transitionType": {"type": "string"}, "transitionDurationMs": {"type": "number"}}, "required": ["sceneId", "transitionType", "transitionDurationMs"], "additionalProperties": False}},
                            "estimatedDurationMs": {"type": "number"},
                            "reasoning": {"type": "string"},
                        },
                        "required": ["name", "sceneSequence", "estimatedDurationMs", "reasoning"],
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
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"{user_message}\n\nReturn only valid JSON with keys: name, sceneSequence, estimatedDurationMs, reasoning."},
            ],
            response_format={"type": "json_object"},
            temperature=0.6,
        )
        content = response.choices[0].message.content
        if content:
            result = json.loads(content)

    if not result:
        raise RuntimeError("LLM returned an empty response")

    name = result.get("name", "AI Edit Plan")
    scene_sequence = result.get("sceneSequence", [])
    estimated_duration_ms = result.get("estimatedDurationMs", 0)
    reasoning = result.get("reasoning", "")

    scene_ids = [s["sceneId"] for s in scene_sequence]
    transitions = [{"sceneId": s["sceneId"], "type": s["transitionType"], "durationMs": s["transitionDurationMs"]} for s in scene_sequence]

    now_iso = datetime.utcnow().isoformat()
    plan = EditPlan(
        id=str(uuid.uuid4()),
        project_id=project_id,
        org_id=org_id,
        name=name,
        scene_ids=json.dumps(scene_ids),
        transitions=json.dumps(transitions),
        status="draft",
        created_by=user_id,
        created_at=now_iso,
        updated_at=now_iso,
    )
    db.add(plan)
    db.commit()

    return {
        "id": plan.id, "name": name, "sceneSequence": scene_sequence,
        "estimatedDurationMs": estimated_duration_ms, "reasoning": reasoning,
        "projectId": project_id, "status": "draft", "createdAt": plan.created_at,
    }
