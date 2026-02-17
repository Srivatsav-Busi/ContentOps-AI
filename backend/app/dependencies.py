"""Auth dependencies for FastAPI routes."""

import json
from dataclasses import dataclass
from fastapi import Request, HTTPException


@dataclass
class UserContext:
    id: str
    org_id: str
    email: str
    display_name: str | None
    role: str
    avatar_url: str | None


@dataclass
class OrgContext:
    id: str
    name: str
    slug: str
    plan_tier: str


@dataclass
class AuthContext:
    user: UserContext
    org: OrgContext


def require_auth(request: Request) -> AuthContext:
    """
    Parse the X-Auth-Context header set by the Next.js proxy.
    Raises 401 if the header is missing or malformed.
    """
    raw = request.headers.get("X-Auth-Context")
    if not raw:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=401, detail="Malformed auth context")

    user_data = data.get("user", data)
    org_data = data.get("org", {})

    user = UserContext(
        id=user_data.get("id", ""),
        org_id=user_data.get("orgId", ""),
        email=user_data.get("email", ""),
        display_name=user_data.get("displayName"),
        role=user_data.get("role", "viewer"),
        avatar_url=user_data.get("avatarUrl"),
    )

    org = OrgContext(
        id=org_data.get("id", user.org_id),
        name=org_data.get("name", ""),
        slug=org_data.get("slug", ""),
        plan_tier=org_data.get("planTier", "free"),
    )

    if not user.id or not user.org_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return AuthContext(user=user, org=org)
