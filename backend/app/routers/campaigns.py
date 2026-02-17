"""Campaigns router: GET/POST /api/v1/campaigns."""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.publishing import Campaign
from app.schemas.common import json_response, paginated_response, error_body

router = APIRouter(prefix="/api/v1/campaigns", tags=["campaigns"])


def _campaign_to_dict(c: Campaign) -> dict:
    return {
        "id": c.id, "projectId": c.project_id, "orgId": c.org_id,
        "name": c.name, "status": c.status,
        "startDate": c.start_date, "endDate": c.end_date,
        "createdBy": c.created_by,
        "createdAt": c.created_at, "updatedAt": c.updated_at,
    }


@router.get("")
def list_campaigns(
    limit: int = Query(50, le=100),
    status: str | None = None,
    project_id: str | None = Query(None),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(Campaign).filter(Campaign.org_id == auth.user.org_id)
    if status:
        q = q.filter(Campaign.status == status)
    if project_id:
        q = q.filter(Campaign.project_id == project_id)
    results = q.order_by(desc(Campaign.created_at)).limit(limit).all()
    data = [_campaign_to_dict(c) for c in results]
    return paginated_response(data, has_more=len(data) == limit)


class CreateCampaignBody(BaseModel):
    name: str
    projectId: str
    startDate: str | None = None
    endDate: str | None = None


@router.post("", status_code=201)
def create_campaign(
    body: CreateCampaignBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    if not body.name or not body.name.strip():
        raise HTTPException(status_code=422, detail=error_body("Campaign name is required", "ERR_VALIDATION"))
    if not body.projectId:
        raise HTTPException(status_code=422, detail=error_body("projectId is required", "ERR_VALIDATION"))

    now_iso = datetime.utcnow().isoformat()
    campaign = Campaign(
        id=str(uuid.uuid4()),
        org_id=auth.user.org_id,
        project_id=body.projectId,
        name=body.name.strip(),
        status="draft",
        start_date=body.startDate,
        end_date=body.endDate,
        created_by=auth.user.id,
        created_at=now_iso,
        updated_at=now_iso,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return json_response(_campaign_to_dict(campaign))
