"""Auth router: GET /api/v1/auth, POST /api/v1/auth/register."""

import uuid
from datetime import datetime

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.tenant import User, Org, Role
from app.models.system import BillingPlan
from app.schemas.common import json_response, error_body

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


# ── Permissions mapping (mirrors TypeScript derivePermissions) ──


_BASE_PERMS = ["project:read", "asset:read", "export:read", "dashboard:read"]

_ROLE_PERMS: dict[str, list[str]] = {
    "viewer": _BASE_PERMS,
    "editor": [*_BASE_PERMS, "project:write", "asset:write", "render:create", "seo:write", "campaign:write"],
    "admin": [
        *_BASE_PERMS, "project:write", "project:delete", "asset:write", "asset:delete",
        "render:create", "seo:write", "campaign:write", "dashboard:write",
        "alert:write", "report:write", "billing:read", "org:settings",
    ],
    "owner": [
        *_BASE_PERMS, "project:write", "project:delete", "asset:write", "asset:delete",
        "render:create", "seo:write", "campaign:write", "dashboard:write",
        "alert:write", "report:write", "billing:read", "billing:write",
        "org:settings", "org:delete", "member:manage",
    ],
    "billing": [*_BASE_PERMS, "billing:read", "billing:write"],
}


# ── GET /api/v1/auth ──


@router.get("")
def get_auth_context(auth: AuthContext = Depends(require_auth)):
    permissions = _ROLE_PERMS.get(auth.user.role, _BASE_PERMS)
    return json_response({
        "user": {
            "id": auth.user.id,
            "orgId": auth.user.org_id,
            "email": auth.user.email,
            "displayName": auth.user.display_name,
            "role": auth.user.role,
            "avatarUrl": auth.user.avatar_url,
        },
        "org": {
            "id": auth.org.id,
            "name": auth.org.name,
            "slug": auth.org.slug,
            "planTier": auth.org.plan_tier,
        },
        "permissions": permissions,
    })


# ── POST /api/v1/auth/register ──


class RegisterBody(BaseModel):
    email: str
    password: str
    displayName: str | None = None


@router.post("/register", status_code=201)
def register(body: RegisterBody, db: Session = Depends(get_db)):
    if not body.email or not body.password:
        raise HTTPException(status_code=422, detail=error_body("Email and password are required", "VALIDATION"))

    if len(body.password) < 8:
        raise HTTPException(status_code=422, detail=error_body("Password must be at least 8 characters", "VALIDATION"))

    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail=error_body("An account with this email already exists", "CONFLICT"))

    # Get the owner role
    owner_role = db.query(Role).filter(Role.name == "owner").first()

    # Get the free plan
    free_plan = db.query(BillingPlan).filter(BillingPlan.tier == "free").first()

    now_iso = datetime.utcnow().isoformat()
    org_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    slug_base = body.email.split("@")[0].lower()
    slug_base = "".join(c if c.isalnum() else "-" for c in slug_base)
    org_slug = f"{slug_base}-{uuid.uuid4().hex[:6]}"

    # Create org
    org = Org(
        id=org_id,
        name=f"{body.displayName}'s Team" if body.displayName else "My Team",
        slug=org_slug,
        plan_id=free_plan.id if free_plan else None,
        settings='{"defaultTimezone":"UTC"}',
        region="us-east-1",
        created_at=now_iso,
        updated_at=now_iso,
    )
    db.add(org)

    # Create user
    password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    user = User(
        id=user_id,
        org_id=org_id,
        email=body.email,
        display_name=body.displayName or body.email.split("@")[0],
        password_hash=password_hash,
        role_id=owner_role.id if owner_role else None,
        email_verified=False,
        created_at=now_iso,
        updated_at=now_iso,
    )
    db.add(user)
    db.commit()

    return json_response({"id": user_id, "email": body.email, "orgId": org_id})
