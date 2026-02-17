"""SEO briefs router: GET /api/v1/seo-briefs."""

import json as _json

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.publishing import SeoBrief, Keyword, Hashtag
from app.schemas.common import paginated_response

router = APIRouter(prefix="/api/v1/seo-briefs", tags=["seo-briefs"])


def _brief_to_dict(b: SeoBrief, db: Session) -> dict:
    # Fetch related keywords
    kw_rows = (
        db.query(Keyword)
        .filter(Keyword.brief_id == b.id)
        .order_by(Keyword.rank)
        .all()
    )
    keywords = [
        {
            "id": k.id, "keyword": k.keyword, "searchVolume": k.search_volume,
            "difficulty": k.difficulty, "intent": k.intent, "rank": k.rank,
        }
        for k in kw_rows
    ]

    # Fetch related hashtags
    ht_rows = (
        db.query(Hashtag)
        .filter(Hashtag.brief_id == b.id)
        .order_by(Hashtag.rank)
        .all()
    )
    hashtags = [
        {"id": h.id, "hashtag": h.hashtag, "platform": h.platform, "rank": h.rank}
        for h in ht_rows
    ]

    return {
        "id": b.id, "projectId": b.project_id, "orgId": b.org_id,
        "title": b.title, "description": b.description,
        "chapters": _json.loads(b.chapters) if b.chapters else [],
        "thumbnailText": b.thumbnail_text,
        "altText": b.alt_text,
        "onScreenText": _json.loads(b.on_screen_text) if b.on_screen_text else [],
        "engagementHook": b.engagement_hook,
        "targetAudience": b.target_audience,
        "platform": b.platform, "version": b.version,
        "keywords": keywords,
        "hashtags": hashtags,
        "createdBy": b.created_by, "createdAt": b.created_at,
    }


@router.get("")
def list_seo_briefs(
    limit: int = Query(50, le=100),
    project_id: str | None = Query(None),
    platform: str | None = None,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(SeoBrief).filter(SeoBrief.org_id == auth.user.org_id)
    if project_id:
        q = q.filter(SeoBrief.project_id == project_id)
    if platform:
        q = q.filter(SeoBrief.platform == platform)
    results = q.order_by(desc(SeoBrief.created_at)).limit(limit).all()
    data = [_brief_to_dict(b, db) for b in results]
    return paginated_response(data, has_more=len(data) == limit)

