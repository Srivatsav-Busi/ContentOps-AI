"""Realtime SSE streams for KPI dashboards and publish status."""

import asyncio
import json as _json
from datetime import datetime

from fastapi import APIRouter, Depends, Query, Request, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.dependencies import require_auth, AuthContext
from app.models.analytics import Dashboard, KpiConfig, TimeSeries
from app.models.publishing import ScheduledPost, PublishEvent
from app.schemas.common import error_body

router = APIRouter(prefix="/api/v1/stream", tags=["stream"])


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {_json.dumps(data)}\n\n"


def _dashboard_snapshot(org_id: str, dashboard_id: str) -> dict:
    db = SessionLocal()
    try:
        dashboard = (
            db.query(Dashboard)
            .filter(Dashboard.id == dashboard_id, Dashboard.org_id == org_id)
            .first()
        )
        if not dashboard:
            return {"dashboardId": dashboard_id, "exists": False, "kpis": []}

        kpis = (
            db.query(KpiConfig)
            .filter(KpiConfig.org_id == org_id, KpiConfig.dashboard_id == dashboard_id)
            .order_by(KpiConfig.created_at)
            .all()
        )
        out = []
        for kpi in kpis:
            points = (
                db.query(TimeSeries)
                .filter(TimeSeries.org_id == org_id, TimeSeries.kpi_id == kpi.id)
                .order_by(desc(TimeSeries.timestamp))
                .limit(2)
                .all()
            )
            current = points[0].value if len(points) >= 1 else None
            previous = points[1].value if len(points) >= 2 else None
            trend = "flat"
            if current is not None and previous is not None:
                if current > previous:
                    trend = "up"
                elif current < previous:
                    trend = "down"
            out.append({
                "id": kpi.id,
                "name": kpi.name,
                "metricType": kpi.metric_type,
                "vizType": kpi.viz_type,
                "targetValue": kpi.target_value,
                "currentValue": current,
                "previousValue": previous,
                "trend": trend,
            })

        return {
            "dashboardId": dashboard_id,
            "exists": True,
            "timestamp": datetime.utcnow().isoformat(),
            "kpis": out,
        }
    finally:
        db.close()


@router.get("/kpis")
async def stream_kpis(
    request: Request,
    dashboard_id: str = Query(...),
    interval_sec: int = Query(5, ge=1, le=60),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    dashboard = (
        db.query(Dashboard)
        .filter(Dashboard.id == dashboard_id, Dashboard.org_id == auth.user.org_id)
        .first()
    )
    if not dashboard:
        raise HTTPException(status_code=404, detail=error_body("Dashboard not found", "ERR_NOT_FOUND"))

    async def event_generator():
        yield _sse("connected", {"dashboardId": dashboard_id, "timestamp": datetime.utcnow().isoformat()})
        while True:
            if await request.is_disconnected():
                break
            yield _sse("snapshot", _dashboard_snapshot(auth.user.org_id, dashboard_id))
            await asyncio.sleep(interval_sec)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.get("/posts/{post_id}")
async def stream_post_status(
    post_id: str,
    request: Request,
    interval_sec: int = Query(3, ge=1, le=30),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    post = (
        db.query(ScheduledPost)
        .filter(ScheduledPost.id == post_id, ScheduledPost.org_id == auth.user.org_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail=error_body("Post not found", "ERR_NOT_FOUND"))

    async def event_generator():
        yield _sse("connected", {"postId": post_id, "timestamp": datetime.utcnow().isoformat()})
        while True:
            if await request.is_disconnected():
                break

            loop_db = SessionLocal()
            try:
                latest_post = loop_db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
                latest_event = (
                    loop_db.query(PublishEvent)
                    .filter(PublishEvent.post_id == post_id)
                    .order_by(desc(PublishEvent.created_at))
                    .first()
                )
                payload = {
                    "postId": post_id,
                    "status": latest_post.status if latest_post else "unknown",
                    "timestamp": datetime.utcnow().isoformat(),
                    "event": {
                        "status": latest_event.status if latest_event else None,
                        "platformPostId": latest_event.platform_post_id if latest_event else None,
                        "platformUrl": latest_event.platform_url if latest_event else None,
                        "errorCode": latest_event.error_code if latest_event else None,
                        "errorMessage": latest_event.error_message if latest_event else None,
                    } if latest_event else None,
                }
            finally:
                loop_db.close()

            yield _sse("status", payload)

            if payload["status"] in ("published", "failed", "cancelled"):
                break
            await asyncio.sleep(interval_sec)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
