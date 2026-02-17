"""SEO briefs router: GET /api/v1/seo-briefs."""

import json as _json

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.publishing import SeoBrief
from app.schemas.common import paginated_response

router = APIRouter(prefix="/api/v1/seo-briefs", tags=["seo-briefs"])


def _brief_to_dict(b: SeoBrief) -> dict:
    return {
        "id": b.id, "projectId": b.project_id, "orgId": b.org_id,
        "title": b.title, "description": b.description,
        "chapters": _json.loads(b.chapters) if b.chapters else [],
        "thumbnailText": b.thumbnail_text,
        "targetAudience": b.target_audience,
        "platform": b.platform, "version": b.version,
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
    data = [_brief_to_dict(b) for b in results]
    return paginated_response(data, has_more=len(data) == limit)
