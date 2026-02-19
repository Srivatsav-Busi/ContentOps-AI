"""KPI router: CRUD + auto-generation + time-series writes."""

import json as _json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.analytics import Dashboard, KpiConfig, TimeSeries
from app.schemas.common import json_response, paginated_response, error_body

router = APIRouter(prefix="/api/v1/kpis", tags=["kpis"])


def _kpi_to_dict(k: KpiConfig) -> dict:
    return {
        "id": k.id,
        "dashboardId": k.dashboard_id,
        "orgId": k.org_id,
        "name": k.name,
        "metricType": k.metric_type,
        "source": k.source,
        "queryConfig": _json.loads(k.query_config) if k.query_config else None,
        "targetValue": k.target_value,
        "comparison": k.comparison,
        "vizType": k.viz_type,
        "positionJson": _json.loads(k.position_json) if k.position_json else None,
        "createdAt": k.created_at,
    }


def _series_to_dict(s: TimeSeries) -> dict:
    return {
        "id": s.id,
        "kpiId": s.kpi_id,
        "orgId": s.org_id,
        "timestamp": s.timestamp,
        "value": s.value,
        "metadata": _json.loads(s.extra_metadata) if s.extra_metadata else None,
    }


@router.get("")
def list_kpis(
    dashboard_id: str = Query(...),
    limit: int = Query(100, le=500),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(KpiConfig)
        .filter(
            KpiConfig.org_id == auth.user.org_id,
            KpiConfig.dashboard_id == dashboard_id,
        )
        .order_by(KpiConfig.created_at)
        .limit(limit)
        .all()
    )
    return paginated_response([_kpi_to_dict(r) for r in rows], has_more=len(rows) == limit)


class CreateKpiBody(BaseModel):
    dashboardId: str
    name: str
    metricType: str
    source: str | None = None
    queryConfig: dict | None = None
    targetValue: float | None = None
    comparison: str | None = None
    vizType: str | None = None
    positionJson: dict | None = None


@router.post("", status_code=201)
def create_kpi(
    body: CreateKpiBody,
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

    now_iso = datetime.utcnow().isoformat()
    row = KpiConfig(
        id=str(uuid.uuid4()),
        dashboard_id=body.dashboardId,
        org_id=auth.user.org_id,
        name=body.name,
        metric_type=body.metricType,
        source=body.source,
        query_config=_json.dumps(body.queryConfig or {}),
        target_value=body.targetValue,
        comparison=body.comparison,
        viz_type=body.vizType,
        position_json=_json.dumps(body.positionJson or {}),
        created_at=now_iso,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return json_response(_kpi_to_dict(row))


class AutoGenerateKpisBody(BaseModel):
    dashboardId: str
    industry: str
    businessType: str
    goals: list[str]
    existingKpis: list[str] | None = None
    replaceExisting: bool = True


@router.post("/auto-generate")
async def auto_generate_kpis(
    body: AutoGenerateKpisBody,
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

    from app.services.kpi_recommender import recommend_kpis

    result = await recommend_kpis(
        industry=body.industry,
        business_type=body.businessType,
        goals=body.goals,
        existing_kpis=body.existingKpis,
    )

    recommendations = result.get("recommendations", [])
    if not recommendations:
        raise HTTPException(status_code=422, detail=error_body("No KPI recommendations returned", "ERR_EMPTY_RECOMMENDATIONS"))

    if body.replaceExisting:
        db.query(KpiConfig).filter(
            KpiConfig.org_id == auth.user.org_id,
            KpiConfig.dashboard_id == body.dashboardId,
        ).delete()
        db.commit()

    created: list[KpiConfig] = []
    now_iso = datetime.utcnow().isoformat()
    for idx, rec in enumerate(recommendations):
        cfg = KpiConfig(
            id=str(uuid.uuid4()),
            dashboard_id=body.dashboardId,
            org_id=auth.user.org_id,
            name=rec.get("name", f"KPI {idx + 1}"),
            metric_type=rec.get("metricType", "operational"),
            source=rec.get("source"),
            query_config=_json.dumps({
                "description": rec.get("description", ""),
                "rationale": rec.get("rationale", ""),
            }),
            target_value=rec.get("targetValue"),
            comparison=rec.get("comparison"),
            viz_type=rec.get("vizType"),
            position_json=_json.dumps({
                "x": (idx % 3) * 4,
                "y": (idx // 3) * 2,
                "w": 4,
                "h": 2,
                "priority": rec.get("priority"),
            }),
            created_at=now_iso,
        )
        db.add(cfg)
        created.append(cfg)

    # Keep dashboard layout JSON aligned with generated KPI widgets.
    dashboard_layout = {
        "widgets": [
            {
                "kpiName": rec.get("name", f"KPI {idx + 1}"),
                "vizType": rec.get("vizType", "number"),
                "x": (idx % 3) * 4,
                "y": (idx // 3) * 2,
                "w": 4,
                "h": 2,
            }
            for idx, rec in enumerate(recommendations)
        ]
    }
    dashboard.layout_json = _json.dumps(dashboard_layout)
    dashboard.updated_at = datetime.utcnow().isoformat()

    db.commit()
    for row in created:
        db.refresh(row)
    db.refresh(dashboard)

    return json_response({
        "dashboardId": body.dashboardId,
        "summary": result.get("summary", ""),
        "kpis": [_kpi_to_dict(r) for r in created],
        "layoutJson": _json.loads(dashboard.layout_json) if dashboard.layout_json else None,
    })


class UpsertTimeSeriesBody(BaseModel):
    timestamp: str
    value: float
    metadata: dict | None = None


@router.post("/{kpi_id}/timeseries")
def upsert_kpi_timeseries(
    kpi_id: str,
    body: UpsertTimeSeriesBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    kpi = (
        db.query(KpiConfig)
        .filter(KpiConfig.id == kpi_id, KpiConfig.org_id == auth.user.org_id)
        .first()
    )
    if not kpi:
        raise HTTPException(status_code=404, detail=error_body("KPI not found", "ERR_NOT_FOUND"))

    existing = (
        db.query(TimeSeries)
        .filter(
            TimeSeries.kpi_id == kpi_id,
            TimeSeries.org_id == auth.user.org_id,
            TimeSeries.timestamp == body.timestamp,
        )
        .first()
    )
    if existing:
        existing.value = body.value
        existing.extra_metadata = _json.dumps(body.metadata or {})
        db.commit()
        db.refresh(existing)
        return json_response(_series_to_dict(existing))

    row = TimeSeries(
        id=str(uuid.uuid4()),
        kpi_id=kpi_id,
        org_id=auth.user.org_id,
        timestamp=body.timestamp,
        value=body.value,
        extra_metadata=_json.dumps(body.metadata or {}),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return json_response(_series_to_dict(row))


@router.get("/{kpi_id}/timeseries")
def list_kpi_timeseries(
    kpi_id: str,
    limit: int = Query(200, le=1000),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    kpi = (
        db.query(KpiConfig)
        .filter(KpiConfig.id == kpi_id, KpiConfig.org_id == auth.user.org_id)
        .first()
    )
    if not kpi:
        raise HTTPException(status_code=404, detail=error_body("KPI not found", "ERR_NOT_FOUND"))

    rows = (
        db.query(TimeSeries)
        .filter(TimeSeries.kpi_id == kpi_id, TimeSeries.org_id == auth.user.org_id)
        .order_by(desc(TimeSeries.timestamp))
        .limit(limit)
        .all()
    )
    return paginated_response([_series_to_dict(r) for r in rows], has_more=len(rows) == limit)
