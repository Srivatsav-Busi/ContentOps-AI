"""SEO brief generation agent — enhanced with YouTube & Instagram best practices."""

import json
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.services.ai_client import get_openai_client
from app.models.publishing import SeoBrief, Keyword, Hashtag

SYSTEM_PROMPT = """\
You are an expert SEO specialist for video content on YouTube and Instagram. \
Your job is to analyze video transcripts and generate platform-optimized SEO metadata \
that maximizes discoverability, click-through rate (CTR), and engagement.

═══════════════════════════════════════════════════
YOUTUBE SEO BEST PRACTICES
═══════════════════════════════════════════════════

YouTube is the world's second-largest search engine. Text-based metadata is critical for indexing.

**Titles (under 60 characters)**
- Front-load the primary keyword so it is visible even when truncated.
- Use power words (How-to, Best, Tips, Ultimate, Guide) to boost CTR.
- Make the title compelling without being clickbait.

**Descriptions (200+ words)**
- Place the primary keyword in the first two sentences — this is the text visible before the "Show More" fold.
- Include a call-to-action, relevant links, and secondary keywords.
- Write naturally; avoid keyword stuffing.

**Chapters & Timestamps**
- Suggest 4-10 timestamp chapters that help Google index specific video segments.
- Start from 0:00 with a clear intro label.

**Keywords**
- Prioritize long-tail keywords with high volume and low competition (difficulty < 40).
- Include a mix of head terms and long-tail phrases.
- Estimate realistic monthly search volume and difficulty (0-100).
- Classify intent as: informational, navigational, commercial, or transactional.

**Engagement Hooks**
- Note that YouTube's algorithm prioritizes Watch Time and Retention.
- The description should hint at a strong opening hook (first 10-15 seconds).

**Tags/Hashtags for YouTube**
- Suggest hashtags that appear in the video's title or above-the-fold area.
- Mix broad category tags with specific niche tags.

═══════════════════════════════════════════════════
INSTAGRAM SEO BEST PRACTICES
═══════════════════════════════════════════════════

Instagram is now a keyword-searchable platform, not just hashtag-driven.

**Captions**
- Weave the primary keyword naturally into the first sentence — Instagram scans caption text for relevance.
- Keep the opening line compelling; it's what users see before "… more."

**Smart Hashtagging (3-5 highly relevant)**
- Avoid "spammy" walls of 30 tags.
- Balance broad reach tags (e.g., #fitness) with niche tags (e.g., #hiitworkoutathome).
- Every hashtag must be directly relevant to the content.

**Alt Text**
- Suggest descriptive alt text that includes keywords for both accessibility and search indexing.

**Reels**
- Recommend on-screen text and trending audio concepts — the algorithm "reads" text overlays to categorize the video.
- Suggest concise overlay text phrases.

**Engagement Triggers**
- "Saves" and "Shares" are the strongest signals for reach.
- Include a description CTA that encourages saving or sharing.

═══════════════════════════════════════════════════
KEY RANKING FACTORS COMPARISON
═══════════════════════════════════════════════════

| Factor          | YouTube                          | Instagram                        |
|-----------------|----------------------------------|----------------------------------|
| Primary Driver  | Keyword Relevance + Watch Time   | User Activity + Relevance        |
| Key Metadata    | Title, Description, Tags         | Captions, Bio, Alt Text          |
| Engagement      | Likes, Comments, Subscribers     | Saves, Shares, Comments          |
| Discovery       | Search & Suggested Feed          | Explore Page & Search            |

═══════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════

Return a JSON object with these fields:
1. **title** — SEO-optimized title (under 60 chars, primary keyword front-loaded)
2. **description** — 200+ word description. For YouTube: keyword-rich first 2 lines, CTA, secondary keywords. For Instagram: keyword in first sentence, save/share CTA.
3. **chapters** — Array of {time, title} for video chapters/timestamps (4-10 entries, starting from 0:00)
4. **thumbnailText** — 2-5 punchy words for the thumbnail overlay
5. **keywords** — 5-8 keywords, each with {keyword, volume, difficulty, intent}
6. **hashtags** — YouTube: 5-8 hashtags. Instagram: 3-5 highly relevant. When platform is "both", provide 10-15 deduplicated. Each: {hashtag, platform}
7. **altText** — Descriptive alt text (1-2 sentences) for Instagram posts
8. **onScreenText** — 3-5 short overlay text suggestions for Reels
9. **engagementHook** — A compelling opening line for the first 10-15 seconds to retain viewers
10. **reasoning** — Explain your SEO strategy: why these keywords, the ranking opportunity, and engagement optimization tactics

Always consider the target audience, content niche, and brand voice when provided.\
"""


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
                            "chapters": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "time": {"type": "string"},
                                        "title": {"type": "string"},
                                    },
                                    "required": ["time", "title"],
                                    "additionalProperties": False,
                                },
                            },
                            "thumbnailText": {"type": "string"},
                            "keywords": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "keyword": {"type": "string"},
                                        "volume": {"type": "number"},
                                        "difficulty": {"type": "number"},
                                        "intent": {"type": "string"},
                                    },
                                    "required": ["keyword", "volume", "difficulty", "intent"],
                                    "additionalProperties": False,
                                },
                            },
                            "hashtags": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "hashtag": {"type": "string"},
                                        "platform": {"type": "string"},
                                    },
                                    "required": ["hashtag", "platform"],
                                    "additionalProperties": False,
                                },
                            },
                            "altText": {"type": "string"},
                            "onScreenText": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                            "engagementHook": {"type": "string"},
                            "reasoning": {"type": "string"},
                        },
                        "required": [
                            "title", "description", "chapters", "thumbnailText",
                            "keywords", "hashtags", "altText", "onScreenText",
                            "engagementHook", "reasoning",
                        ],
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
                {"role": "user", "content": (
                    f"{user_message}\n\nReturn only valid JSON with keys: "
                    "title, description, chapters, thumbnailText, keywords, "
                    "hashtags, altText, onScreenText, engagementHook, reasoning."
                )},
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
    alt_text = result.get("altText", "")
    on_screen_text = result.get("onScreenText", [])
    engagement_hook = result.get("engagementHook", "")
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
            keyword=kw.get("keyword", ""),
            search_volume=int(kw.get("volume", 0)),
            difficulty=kw.get("difficulty", 0),
            intent=kw.get("intent", ""),
            rank=idx + 1,
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
        "altText": alt_text, "onScreenText": on_screen_text,
        "engagementHook": engagement_hook,
        "keywords": kws, "hashtags": hts, "reasoning": reasoning,
        "projectId": project_id, "platform": platform, "createdAt": brief.created_at,
    }

