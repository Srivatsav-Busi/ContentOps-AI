"""Dashboards router: GET/POST /api/v1/dashboards."""

import json as _json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.analytics import Dashboard
from app.schemas.common import json_response, paginated_response, error_body

router = APIRouter(prefix="/api/v1/dashboards", tags=["dashboards"])


def _dashboard_to_dict(d: Dashboard) -> dict:
    return {
        "id": d.id, "orgId": d.org_id, "name": d.name,
        "description": d.description, "template": d.template,
        "layoutJson": _json.loads(d.layout_json) if d.layout_json else None,
        "isDefault": d.is_default, "createdBy": d.created_by,
        "createdAt": d.created_at, "updatedAt": d.updated_at,
    }


@router.get("")
def list_dashboards(
    limit: int = Query(50, le=100),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    results = (
        db.query(Dashboard).filter(Dashboard.org_id == auth.user.org_id)
        .order_by(desc(Dashboard.created_at)).limit(limit).all()
    )
    data = [_dashboard_to_dict(d) for d in results]
    return paginated_response(data, has_more=len(data) == limit)


class CreateDashboardBody(BaseModel):
    name: str
    description: str | None = None
    template: str | None = None
    layoutJson: dict | None = None


@router.post("", status_code=201)
def create_dashboard(
    body: CreateDashboardBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    if not body.name or not body.name.strip():
        raise HTTPException(status_code=422, detail=error_body("Dashboard name is required", "ERR_VALIDATION"))

    now_iso = datetime.utcnow().isoformat()
    dashboard = Dashboard(
        id=str(uuid.uuid4()),
        org_id=auth.user.org_id,
        name=body.name.strip(),
        description=body.description,
        template=body.template,
        layout_json=_json.dumps(body.layoutJson) if body.layoutJson else None,
        is_default=False,
        created_by=auth.user.id,
        created_at=now_iso,
        updated_at=now_iso,
    )
    db.add(dashboard)
    db.commit()
    db.refresh(dashboard)
    return json_response(_dashboard_to_dict(dashboard))
