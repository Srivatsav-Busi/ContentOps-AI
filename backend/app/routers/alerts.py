"""Alerts router: GET/POST /api/v1/alerts."""

import json as _json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.analytics import Alert
from app.schemas.common import json_response, paginated_response, error_body

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


def _alert_to_dict(a: Alert) -> dict:
    return {
        "id": a.id, "orgId": a.org_id, "kpiId": a.kpi_id,
        "name": a.name, "ruleType": a.rule_type,
        "thresholdConfig": _json.loads(a.threshold_config) if a.threshold_config else None,
        "severity": a.severity,
        "channels": _json.loads(a.channels) if a.channels else [],
        "isActive": a.is_active, "lastFiredAt": a.last_fired_at,
        "cooldownMinutes": a.cooldown_minutes, "createdAt": a.created_at,
    }


@router.get("")
def list_alerts(
    limit: int = Query(50, le=100),
    severity: str | None = None,
    is_active: str | None = Query(None),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(Alert).filter(Alert.org_id == auth.user.org_id)
    if severity:
        q = q.filter(Alert.severity == severity)
    if is_active is not None:
        q = q.filter(Alert.is_active == (is_active == "true"))
    results = q.order_by(desc(Alert.created_at)).limit(limit).all()
    data = [_alert_to_dict(a) for a in results]
    return paginated_response(data, has_more=len(data) == limit)


class CreateAlertBody(BaseModel):
    name: str
    ruleType: str
    severity: str | None = "warning"
    channels: list[str]
    kpiId: str | None = None
    thresholdConfig: dict | None = None
    cooldownMinutes: int | None = 60


@router.post("", status_code=201)
def create_alert(
    body: CreateAlertBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    if not body.name or not body.name.strip():
        raise HTTPException(status_code=422, detail=error_body("Alert name is required", "ERR_VALIDATION"))
    if not body.ruleType:
        raise HTTPException(status_code=422, detail=error_body("ruleType is required", "ERR_VALIDATION"))
    if not body.channels:
        raise HTTPException(status_code=422, detail=error_body("At least one channel is required", "ERR_VALIDATION"))

    now_iso = datetime.utcnow().isoformat()
    alert = Alert(
        id=str(uuid.uuid4()),
        org_id=auth.user.org_id,
        kpi_id=body.kpiId,
        name=body.name.strip(),
        rule_type=body.ruleType,
        threshold_config=_json.dumps(body.thresholdConfig or {}),
        severity=body.severity or "warning",
        channels=_json.dumps(body.channels),
        is_active=True,
        cooldown_minutes=body.cooldownMinutes or 60,
        created_at=now_iso,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return json_response(_alert_to_dict(alert))
