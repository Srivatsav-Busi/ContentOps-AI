"""SEO brief generation agent — port of agents/seo-generator.ts."""

import json
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.services.ai_client import get_openai_client
from app.models.publishing import SeoBrief, Keyword, Hashtag

SYSTEM_PROMPT = """You are an expert SEO specialist for video content platforms (YouTube, Instagram Reels, TikTok). Your job is to analyze video transcripts and generate highly optimized SEO metadata.

Your responsibilities:
1. **Title**: Generate an SEO-optimized title under 60 characters. Front-load the primary keyword. Make it compelling and click-worthy without being clickbait.
2. **Description**: Write a keyword-rich description of at least 150 characters. The first 2 lines must contain the most important keywords as they appear in search previews. Include a call to action.
3. **Chapters**: Suggest 8-10 chapter timestamps based on the transcript content. Each chapter should have a clear, descriptive title.
4. **Thumbnail Text**: Suggest short, punchy text (2-5 words) for the video thumbnail that drives clicks.
5. **Keywords**: Suggest 5-8 keywords with estimated monthly search volume and keyword difficulty (0-100 scale). Prioritize long-tail keywords with reasonable volume and low difficulty.
6. **Hashtags**: Suggest 10-15 hashtags. Tag each with the platform it's best suited for (youtube, instagram, or both).
7. **Reasoning**: Explain your SEO strategy and why you chose these specific optimizations.

Always consider the target audience and brand voice when provided."""


def _build_user_message(transcript_text: str, platform: str, target_audience: str | None = None) -> str:
    msg = "Analyze the following video transcript and generate SEO metadata.\n\n"
    msg += f"**Platform**: {platform}\n"
    if target_audience:
        msg += f"**Target Audience**: {target_audience}\n"
    msg += f"\n**Transcript**:\n{transcript_text}"
    return msg


async def generate_seo_brief(
    *,
    transcript_text: str,
    platform: str,
    target_audience: str | None,
    project_id: str,
    org_id: str,
    user_id: str,
    db: Session,
) -> dict:
    model = settings.get_model("llm_model_seo", "gpt-4o-mini")
    client = get_openai_client()
    user_message = _build_user_message(transcript_text, platform, target_audience)

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
                    "name": "seo_brief",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "chapters": {"type": "array", "items": {"type": "object", "properties": {"time": {"type": "string"}, "title": {"type": "string"}}, "required": ["time", "title"], "additionalProperties": False}},
                            "thumbnailText": {"type": "string"},
                            "keywords": {"type": "array", "items": {"type": "object", "properties": {"keyword": {"type": "string"}, "volume": {"type": "number"}, "difficulty": {"type": "number"}}, "required": ["keyword", "volume", "difficulty"], "additionalProperties": False}},
                            "hashtags": {"type": "array", "items": {"type": "object", "properties": {"hashtag": {"type": "string"}, "platform": {"type": "string"}}, "required": ["hashtag", "platform"], "additionalProperties": False}},
                            "reasoning": {"type": "string"},
                        },
                        "required": ["title", "description", "chapters", "thumbnailText", "keywords", "hashtags", "reasoning"],
                        "additionalProperties": False,
                    },
                },
            },
            temperature=0.7,
        )
        content = response.choices[0].message.content
        if content:
            result = json.loads(content)
    except Exception:
        # Fallback for providers that don't support strict json_schema
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"{user_message}\n\nReturn only valid JSON with keys: title, description, chapters, thumbnailText, keywords, hashtags, reasoning."},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        content = response.choices[0].message.content
        if content:
            result = json.loads(content)

    if not result:
        raise RuntimeError("LLM returned an empty response")

    # Normalize
    title = result.get("title", "Generated SEO Title")
    description = result.get("description", "")
    chapters = result.get("chapters", [])
    thumbnail_text = result.get("thumbnailText", "")
    kws = result.get("keywords", [])
    hts = result.get("hashtags", [])
    reasoning = result.get("reasoning", "")

    # Persist
    now_iso = datetime.utcnow().isoformat()
    brief = SeoBrief(
        id=str(uuid.uuid4()),
        project_id=project_id,
        org_id=org_id,
        title=title,
        description=description,
        chapters=json.dumps(chapters),
        thumbnail_text=thumbnail_text,
        target_audience=target_audience,
        platform=platform,
        created_by=user_id,
        created_at=now_iso,
    )
    db.add(brief)
    db.flush()

    for idx, kw in enumerate(kws):
        db.add(Keyword(
            id=str(uuid.uuid4()), brief_id=brief.id,
            keyword=kw.get("keyword", ""), search_volume=int(kw.get("volume", 0)),
            difficulty=kw.get("difficulty", 0), rank=idx + 1,
        ))

    for idx, ht in enumerate(hts):
        db.add(Hashtag(
            id=str(uuid.uuid4()), brief_id=brief.id,
            hashtag=ht.get("hashtag", ""), platform=ht.get("platform", ""),
            rank=idx + 1,
        ))

    db.commit()

    return {
        "id": brief.id, "title": title, "description": description,
        "chapters": chapters, "thumbnailText": thumbnail_text,
        "keywords": kws, "hashtags": hts, "reasoning": reasoning,
        "projectId": project_id, "platform": platform, "createdAt": brief.created_at,
    }
