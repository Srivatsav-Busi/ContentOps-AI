"""Exports router: GET /api/v1/exports."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.video import Export
from app.schemas.common import paginated_response

router = APIRouter(prefix="/api/v1/exports", tags=["exports"])


def _export_to_dict(e: Export) -> dict:
    return {
        "id": e.id, "renderJobId": e.render_job_id, "orgId": e.org_id,
        "storageKey": e.storage_key, "publicUrl": e.public_url,
        "format": e.format, "sizeBytes": e.size_bytes,
        "durationMs": e.duration_ms, "downloadCount": e.download_count,
        "expiresAt": e.expires_at, "createdAt": e.created_at,
    }


@router.get("")
def list_exports(
    limit: int = Query(50, le=100),
    render_job_id: str | None = Query(None),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(Export).filter(Export.org_id == auth.user.org_id)
    if render_job_id:
        q = q.filter(Export.render_job_id == render_job_id)
    results = q.order_by(desc(Export.created_at)).limit(limit).all()
    data = [_export_to_dict(e) for e in results]
    return paginated_response(data, has_more=len(data) == limit)
