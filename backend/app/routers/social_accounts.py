"""Social accounts router: GET/POST/DELETE /api/v1/social-accounts."""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.publishing import SocialAccount
from app.schemas.common import json_response, paginated_response, error_body

router = APIRouter(prefix="/api/v1/social-accounts", tags=["social-accounts"])
SUPPORTED_PROVIDERS = ("youtube", "instagram", "tiktok", "linkedin", "x", "facebook")


def _account_to_dict(a: SocialAccount) -> dict:
    return {
        "id": a.id,
        "orgId": a.org_id,
        "provider": a.provider,
        "providerUid": a.provider_uid,
        "displayName": a.display_name,
        "scopes": a.scopes,
        "status": a.status,
        "tokenExpiresAt": a.token_expires_at,
        "connectedBy": a.connected_by,
        "createdAt": a.created_at,
    }


@router.get("")
def list_social_accounts(
    provider: str | None = None,
    status: str | None = None,
    limit: int = Query(50, le=100),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(SocialAccount).filter(SocialAccount.org_id == auth.user.org_id)
    if provider:
        q = q.filter(SocialAccount.provider == provider)
    if status:
        q = q.filter(SocialAccount.status == status)
    results = q.order_by(desc(SocialAccount.created_at)).limit(limit).all()
    data = [_account_to_dict(a) for a in results]
    return paginated_response(data, has_more=len(data) == limit)


class ConnectAccountBody(BaseModel):
    provider: str
    providerUid: str
    displayName: str | None = None
    accessToken: str
    refreshToken: str | None = None
    tokenExpiresAt: str | None = None
    scopes: str | None = None


@router.post("", status_code=201)
def connect_account(
    body: ConnectAccountBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    if body.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=422,
            detail=error_body(
                "Provider must be one of: youtube, instagram, tiktok, linkedin, x, facebook",
                "ERR_VALIDATION",
            ),
        )

    # Check for existing account with same provider + uid
    existing = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.org_id == auth.user.org_id,
            SocialAccount.provider == body.provider,
            SocialAccount.provider_uid == body.providerUid,
        )
        .first()
    )

    if existing:
        # Update tokens
        existing.access_token = body.accessToken
        existing.refresh_token = body.refreshToken
        existing.token_expires_at = body.tokenExpiresAt
        existing.scopes = body.scopes
        existing.status = "active"
        if body.displayName:
            existing.display_name = body.displayName
        db.commit()
        db.refresh(existing)
        return json_response(_account_to_dict(existing))

    now_iso = datetime.utcnow().isoformat()
    account = SocialAccount(
        id=str(uuid.uuid4()),
        org_id=auth.user.org_id,
        provider=body.provider,
        provider_uid=body.providerUid,
        display_name=body.displayName or body.providerUid,
        access_token=body.accessToken,
        refresh_token=body.refreshToken,
        token_expires_at=body.tokenExpiresAt,
        scopes=body.scopes,
        status="active",
        connected_by=auth.user.id,
        created_at=now_iso,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return json_response(_account_to_dict(account))


@router.delete("/{account_id}")
def disconnect_account(
    account_id: str,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.id == account_id, SocialAccount.org_id == auth.user.org_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail=error_body("Account not found", "ERR_NOT_FOUND"))

    db.delete(account)
    db.commit()
    return json_response({"deleted": True, "id": account_id})


@router.post("/{account_id}/refresh-token")
async def refresh_account_token(
    account_id: str,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.id == account_id, SocialAccount.org_id == auth.user.org_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail=error_body("Account not found", "ERR_NOT_FOUND"))
    if not account.refresh_token:
        raise HTTPException(
            status_code=422,
            detail=error_body("No refresh token available. Re-authorize the account.", "ERR_NO_REFRESH_TOKEN"),
        )

    from app.services.publisher import refresh_oauth_token

    try:
        new_tokens = await refresh_oauth_token(account.provider, account.refresh_token)
        account.access_token = new_tokens["access_token"]
        if new_tokens.get("refresh_token"):
            account.refresh_token = new_tokens["refresh_token"]
        if new_tokens.get("expires_at"):
            account.token_expires_at = new_tokens["expires_at"]
        account.status = "active"
        db.commit()
        db.refresh(account)
        return json_response(_account_to_dict(account))
    except Exception as e:
        account.status = "expired"
        db.commit()
        raise HTTPException(status_code=502, detail=error_body(f"Token refresh failed: {e}", "ERR_TOKEN_REFRESH"))
