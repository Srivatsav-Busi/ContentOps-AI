"""OAuth 2.0 flow router for connecting YouTube and Instagram accounts.

GET /api/v1/oauth/youtube/authorize  — returns Google OAuth URL
GET /api/v1/oauth/youtube/callback   — handles callback, stores tokens
GET /api/v1/oauth/instagram/authorize — returns Facebook OAuth URL
GET /api/v1/oauth/instagram/callback  — handles callback, resolves IG Business Account
"""

import uuid
from datetime import datetime
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.publishing import SocialAccount
from app.schemas.common import json_response, error_body

router = APIRouter(prefix="/api/v1/oauth", tags=["oauth"])


# ── YouTube (Google) OAuth ────────────────────────────────────

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/userinfo.profile",
]


@router.get("/youtube/authorize")
def youtube_authorize(auth: AuthContext = Depends(require_auth)):
    """Generate a Google OAuth 2.0 authorization URL for YouTube."""
    if not settings.google_client_id:
        raise HTTPException(
            status_code=501,
            detail=error_body(
                "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local",
                "ERR_OAUTH_NOT_CONFIGURED",
            ),
        )

    redirect_uri = f"{settings.oauth_redirect_base_url}/api/v1/oauth/youtube/callback"

    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(YOUTUBE_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": auth.user.org_id,  # Pass org_id in state for callback
    }

    authorize_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return json_response({"authorizeUrl": authorize_url, "provider": "youtube"})


@router.get("/youtube/callback")
async def youtube_callback(
    code: str = Query(...),
    state: str = Query(""),
    db: Session = Depends(get_db),
):
    """Handle Google OAuth callback — exchange code for tokens and store the account."""
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=501, detail=error_body("Google OAuth not configured", "ERR_OAUTH_NOT_CONFIGURED"))

    redirect_uri = f"{settings.oauth_redirect_base_url}/api/v1/oauth/youtube/callback"

    async with httpx.AsyncClient(timeout=30) as client:
        # Exchange authorization code for tokens
        token_resp = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        })

        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=error_body(f"Token exchange failed: {token_resp.text}", "ERR_TOKEN_EXCHANGE"),
            )

        tokens = token_resp.json()
        access_token = tokens["access_token"]
        refresh_token = tokens.get("refresh_token", "")

        # Get user profile info
        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        userinfo = userinfo_resp.json() if userinfo_resp.status_code == 200 else {}

    provider_uid = userinfo.get("sub", "unknown")
    display_name = userinfo.get("name", "YouTube Account")
    org_id = state or "unknown"

    # Upsert social account
    existing = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.org_id == org_id,
            SocialAccount.provider == "youtube",
            SocialAccount.provider_uid == provider_uid,
        )
        .first()
    )

    if existing:
        existing.access_token = access_token
        existing.refresh_token = refresh_token or existing.refresh_token
        existing.display_name = display_name
        existing.scopes = ",".join(YOUTUBE_SCOPES)
        existing.status = "active"
        db.commit()
        return json_response({"message": "YouTube account reconnected", "id": existing.id})

    now_iso = datetime.utcnow().isoformat()
    account = SocialAccount(
        id=str(uuid.uuid4()),
        org_id=org_id,
        provider="youtube",
        provider_uid=provider_uid,
        display_name=display_name,
        access_token=access_token,
        refresh_token=refresh_token,
        scopes=",".join(YOUTUBE_SCOPES),
        status="active",
        connected_by=None,  # Callback doesn't have auth context
        created_at=now_iso,
    )
    db.add(account)
    db.commit()

    return json_response({"message": "YouTube account connected successfully", "id": account.id})


# ── Instagram (Facebook) OAuth ────────────────────────────────

FACEBOOK_AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth"
FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"
FACEBOOK_GRAPH_URL = "https://graph.facebook.com/v19.0"

INSTAGRAM_SCOPES = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
]


@router.get("/instagram/authorize")
def instagram_authorize(auth: AuthContext = Depends(require_auth)):
    """Generate a Facebook OAuth URL for Instagram Business Account access."""
    if not settings.facebook_app_id:
        raise HTTPException(
            status_code=501,
            detail=error_body(
                "Facebook/Instagram OAuth not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env.local",
                "ERR_OAUTH_NOT_CONFIGURED",
            ),
        )

    redirect_uri = f"{settings.oauth_redirect_base_url}/api/v1/oauth/instagram/callback"

    params = {
        "client_id": settings.facebook_app_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": ",".join(INSTAGRAM_SCOPES),
        "state": auth.user.org_id,
    }

    authorize_url = f"{FACEBOOK_AUTH_URL}?{urlencode(params)}"
    return json_response({"authorizeUrl": authorize_url, "provider": "instagram"})


@router.get("/instagram/callback")
async def instagram_callback(
    code: str = Query(...),
    state: str = Query(""),
    db: Session = Depends(get_db),
):
    """Handle Facebook OAuth callback — exchange code, find IG Business Account, store."""
    if not settings.facebook_app_id or not settings.facebook_app_secret:
        raise HTTPException(status_code=501, detail=error_body("Facebook OAuth not configured", "ERR_OAUTH_NOT_CONFIGURED"))

    redirect_uri = f"{settings.oauth_redirect_base_url}/api/v1/oauth/instagram/callback"

    async with httpx.AsyncClient(timeout=30) as client:
        # Step 1: Exchange code for short-lived token
        token_resp = await client.get(FACEBOOK_TOKEN_URL, params={
            "client_id": settings.facebook_app_id,
            "client_secret": settings.facebook_app_secret,
            "redirect_uri": redirect_uri,
            "code": code,
        })

        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=error_body(f"Token exchange failed: {token_resp.text}", "ERR_TOKEN_EXCHANGE"),
            )

        short_lived_token = token_resp.json().get("access_token", "")

        # Step 2: Exchange for long-lived token (60 days)
        ll_resp = await client.get(FACEBOOK_TOKEN_URL, params={
            "grant_type": "fb_exchange_token",
            "client_id": settings.facebook_app_id,
            "client_secret": settings.facebook_app_secret,
            "fb_exchange_token": short_lived_token,
        })
        ll_data = ll_resp.json()
        long_lived_token = ll_data.get("access_token", short_lived_token)

        # Step 3: Find the user's Facebook Pages
        pages_resp = await client.get(
            f"{FACEBOOK_GRAPH_URL}/me/accounts",
            params={"access_token": long_lived_token},
        )
        pages = pages_resp.json().get("data", [])

        if not pages:
            raise HTTPException(
                status_code=422,
                detail=error_body(
                    "No Facebook Pages found. Instagram Business accounts require a connected Facebook Page.",
                    "ERR_NO_PAGES",
                ),
            )

        # Step 4: Find the Instagram Business Account connected to the first Page
        page = pages[0]
        page_token = page.get("access_token", long_lived_token)

        ig_resp = await client.get(
            f"{FACEBOOK_GRAPH_URL}/{page['id']}",
            params={
                "fields": "instagram_business_account",
                "access_token": page_token,
            },
        )
        ig_data = ig_resp.json()
        ig_account = ig_data.get("instagram_business_account", {})
        ig_user_id = ig_account.get("id", "")

        if not ig_user_id:
            raise HTTPException(
                status_code=422,
                detail=error_body(
                    f"No Instagram Business Account linked to Facebook Page '{page.get('name', 'unknown')}'. "
                    "Connect your Instagram account in Facebook Page settings first.",
                    "ERR_NO_IG_ACCOUNT",
                ),
            )

        # Step 5: Get Instagram account info
        ig_info_resp = await client.get(
            f"{FACEBOOK_GRAPH_URL}/{ig_user_id}",
            params={
                "fields": "username,name",
                "access_token": page_token,
            },
        )
        ig_info = ig_info_resp.json() if ig_info_resp.status_code == 200 else {}
        display_name = ig_info.get("username") or ig_info.get("name") or f"IG:{ig_user_id}"

    org_id = state or "unknown"

    # Upsert social account
    existing = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.org_id == org_id,
            SocialAccount.provider == "instagram",
            SocialAccount.provider_uid == ig_user_id,
        )
        .first()
    )

    if existing:
        existing.access_token = page_token
        existing.refresh_token = long_lived_token
        existing.display_name = display_name
        existing.scopes = ",".join(INSTAGRAM_SCOPES)
        existing.status = "active"
        db.commit()
        return json_response({"message": "Instagram account reconnected", "id": existing.id})

    now_iso = datetime.utcnow().isoformat()
    account = SocialAccount(
        id=str(uuid.uuid4()),
        org_id=org_id,
        provider="instagram",
        provider_uid=ig_user_id,
        display_name=display_name,
        access_token=page_token,
        refresh_token=long_lived_token,
        scopes=",".join(INSTAGRAM_SCOPES),
        status="active",
        connected_by=None,
        created_at=now_iso,
    )
    db.add(account)
    db.commit()

    return json_response({"message": "Instagram account connected successfully", "id": account.id})
