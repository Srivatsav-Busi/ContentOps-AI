"""Reports router: GET /api/v1/reports."""

import json as _json

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.analytics import Report
from app.schemas.common import paginated_response

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


def _report_to_dict(r: Report) -> dict:
    return {
        "id": r.id, "orgId": r.org_id, "dashboardId": r.dashboard_id,
        "frequency": r.frequency,
        "recipients": _json.loads(r.recipients) if r.recipients else [],
        "format": r.format, "aiSummary": r.ai_summary,
        "pdfUrl": r.pdf_url, "sentAt": r.sent_at,
        "openedCount": r.opened_count,
        "periodStart": r.period_start, "periodEnd": r.period_end,
        "createdAt": r.created_at,
    }


@router.get("")
def list_reports(
    limit: int = Query(50, le=100),
    dashboard_id: str | None = Query(None),
    frequency: str | None = None,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(Report).filter(Report.org_id == auth.user.org_id)
    if dashboard_id:
        q = q.filter(Report.dashboard_id == dashboard_id)
    if frequency:
        q = q.filter(Report.frequency == frequency)
    results = q.order_by(desc(Report.created_at)).limit(limit).all()
    data = [_report_to_dict(r) for r in results]
    return paginated_response(data, has_more=len(data) == limit)
