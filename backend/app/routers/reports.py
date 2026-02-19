"""Reports router: list + generate report summaries."""

import json as _json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.analytics import Report, Dashboard, KpiConfig, TimeSeries
from app.schemas.common import paginated_response, json_response, error_body

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


def _kpi_payload_for_report(db: Session, org_id: str, dashboard_id: str) -> list[dict]:
    kpis = (
        db.query(KpiConfig)
        .filter(KpiConfig.org_id == org_id, KpiConfig.dashboard_id == dashboard_id)
        .order_by(KpiConfig.created_at)
        .all()
    )
    payload = []
    for kpi in kpis:
        points = (
            db.query(TimeSeries)
            .filter(TimeSeries.org_id == org_id, TimeSeries.kpi_id == kpi.id)
            .order_by(desc(TimeSeries.timestamp))
            .limit(2)
            .all()
        )
        current = points[0].value if len(points) >= 1 else 0
        previous = points[1].value if len(points) >= 2 else 0
        trend = "flat"
        if len(points) >= 2:
            if current > previous:
                trend = "up"
            elif current < previous:
                trend = "down"
        payload.append({
            "name": kpi.name,
            "currentValue": current,
            "previousValue": previous,
            "targetValue": kpi.target_value or 0,
            "trend": trend,
        })
    return payload


class GenerateReportBody(BaseModel):
    dashboardId: str
    frequency: str = "manual"
    recipients: list[str] = []
    format: str = "pdf"
    periodStart: str
    periodEnd: str


@router.post("/generate", status_code=201)
async def generate_report(
    body: GenerateReportBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    dashboard = (
        db.query(Dashboard)
        .filter(Dashboard.id == body.dashboardId, Dashboard.org_id == auth.user.org_id)
        .first()
    )
    if not dashboard:
        raise HTTPException(status_code=404, detail=error_body("Dashboard not found", "ERR_NOT_FOUND"))

    kpi_payload = _kpi_payload_for_report(db, auth.user.org_id, body.dashboardId)
    if not kpi_payload:
        raise HTTPException(status_code=422, detail=error_body("Dashboard has no KPIs configured", "ERR_NO_KPIS"))

    from app.services.report_writer import generate_report_summary

    summary = await generate_report_summary(
        dashboard_name=dashboard.name,
        kpis=kpi_payload,
        period_start=body.periodStart,
        period_end=body.periodEnd,
    )

    now_iso = datetime.utcnow().isoformat()
    report = Report(
        id=str(uuid.uuid4()),
        org_id=auth.user.org_id,
        dashboard_id=body.dashboardId,
        frequency=body.frequency,
        recipients=_json.dumps(body.recipients),
        format=body.format,
        ai_summary=summary,
        pdf_url=None,
        sent_at=now_iso if body.frequency == "manual" else None,
        opened_count=0,
        period_start=body.periodStart,
        period_end=body.periodEnd,
        created_at=now_iso,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return json_response(_report_to_dict(report))
