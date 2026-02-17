"""Billing router: GET /api/v1/billing."""

import json as _json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.tenant import Org
from app.models.system import BillingPlan, UsageEvent
from app.schemas.common import json_response, error_body

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])


@router.get("")
def get_billing(
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    org_row = db.query(Org).filter(Org.id == auth.user.org_id).first()
    if not org_row:
        raise HTTPException(status_code=404, detail=error_body("Organization not found"))

    plan = None
    if org_row.plan_id:
        plan_row = db.query(BillingPlan).filter(BillingPlan.id == org_row.plan_id).first()
        if plan_row:
            plan = {
                "id": plan_row.id, "name": plan_row.name, "tier": plan_row.tier,
                "priceMonthly": plan_row.price_monthly, "priceYearly": plan_row.price_yearly,
                "limitsJson": _json.loads(plan_row.limits_json) if plan_row.limits_json else None,
                "features": _json.loads(plan_row.features) if plan_row.features else [],
                "isActive": plan_row.is_active, "createdAt": plan_row.created_at,
            }

    usage_count = (
        db.query(func.count(UsageEvent.id))
        .filter(UsageEvent.org_id == auth.user.org_id)
        .scalar() or 0
    )

    org_settings = _json.loads(org_row.settings) if org_row.settings else {}

    return json_response({
        "org": {
            "id": auth.org.id, "name": auth.org.name,
            "slug": auth.org.slug, "planTier": auth.org.plan_tier,
            "settings": org_settings,
        },
        "plan": plan,
        "usageEventsCount": usage_count,
    })
