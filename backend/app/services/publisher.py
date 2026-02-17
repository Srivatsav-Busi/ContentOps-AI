"""YouTube & Instagram publishing service.

Handles video upload and metadata publishing to YouTube Data API v3
and Instagram Graph API (via Facebook Business API).
Also provides OAuth token refresh functionality.
"""

import os
import uuid
from datetime import datetime

import httpx
from sqlalchemy.orm import Session

from app.models.publishing import ScheduledPost, SocialAccount, PublishEvent
from app.models.video import Export
from app.config import settings


# ── Constants ─────────────────────────────────────────────────

YOUTUBE_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos"
YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

INSTAGRAM_GRAPH_URL = "https://graph.facebook.com/v19.0"
FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"


# ── Token Refresh ─────────────────────────────────────────────

async def refresh_oauth_token(provider: str, refresh_token: str) -> dict:
    """Refresh an OAuth access token for the given provider."""
    async with httpx.AsyncClient(timeout=30) as client:
        if provider == "youtube":
            if not settings.google_client_id or not settings.google_client_secret:
                raise ValueError("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured")

            resp = await client.post(GOOGLE_TOKEN_URL, data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            })
            resp.raise_for_status()
            data = resp.json()
            return {
                "access_token": data["access_token"],
                "refresh_token": refresh_token,  # Google doesn't always return a new refresh token
                "expires_at": datetime.utcnow().isoformat(),
            }

        elif provider == "instagram":
            # Facebook long-lived token refresh
            if not settings.facebook_app_id or not settings.facebook_app_secret:
                raise ValueError("FACEBOOK_APP_ID and FACEBOOK_APP_SECRET must be configured")

            resp = await client.get(FACEBOOK_TOKEN_URL, params={
                "grant_type": "fb_exchange_token",
                "client_id": settings.facebook_app_id,
                "client_secret": settings.facebook_app_secret,
                "fb_exchange_token": refresh_token,
            })
            resp.raise_for_status()
            data = resp.json()
            return {
                "access_token": data["access_token"],
                "expires_at": datetime.utcnow().isoformat(),
            }

        else:
            raise ValueError(f"Unknown provider: {provider}")


# ── YouTube Publishing ────────────────────────────────────────

async def _publish_to_youtube(
    account: SocialAccount,
    export: Export | None,
    post: ScheduledPost,
) -> dict:
    """Upload and publish a video to YouTube using the Data API v3."""
    if not account.access_token:
        raise ValueError("YouTube account has no access token")

    headers = {
        "Authorization": f"Bearer {account.access_token}",
    }

    # Build video metadata
    snippet = {
        "title": post.title or "Untitled Video",
        "description": post.description or "",
        "tags": post.hashtags.split(",") if post.hashtags else [],
        "categoryId": "22",  # People & Blogs (default)
    }
    video_metadata = {
        "snippet": snippet,
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False,
        },
    }

    async with httpx.AsyncClient(timeout=300) as client:
        if export and export.storage_key:
            # Resolve file path
            file_path = os.path.join(str(settings.resolved_data_dir), export.storage_key)
            if not os.path.isfile(file_path):
                raise FileNotFoundError(f"Export file not found: {file_path}")

            # Step 1: Initiate resumable upload
            init_resp = await client.post(
                f"{YOUTUBE_UPLOAD_URL}?uploadType=resumable&part=snippet,status",
                headers={
                    **headers,
                    "Content-Type": "application/json; charset=UTF-8",
                    "X-Upload-Content-Type": "video/mp4",
                    "X-Upload-Content-Length": str(os.path.getsize(file_path)),
                },
                json=video_metadata,
            )
            init_resp.raise_for_status()
            upload_url = init_resp.headers.get("Location")

            if not upload_url:
                raise RuntimeError("YouTube did not return an upload URL")

            # Step 2: Upload the video file
            with open(file_path, "rb") as f:
                upload_resp = await client.put(
                    upload_url,
                    content=f.read(),
                    headers={"Content-Type": "video/mp4"},
                )
                upload_resp.raise_for_status()
                result = upload_resp.json()

            return {
                "platform_post_id": result.get("id", ""),
                "platform_url": f"https://www.youtube.com/watch?v={result.get('id', '')}",
            }
        else:
            # No export file — just update video metadata (e.g., for an existing video)
            # This is a metadata-only publish (useful for scheduling description updates)
            resp = await client.post(
                f"{YOUTUBE_API_URL}/videos?part=snippet,status",
                headers={**headers, "Content-Type": "application/json"},
                json=video_metadata,
            )
            resp.raise_for_status()
            result = resp.json()
            return {
                "platform_post_id": result.get("id", ""),
                "platform_url": f"https://www.youtube.com/watch?v={result.get('id', '')}",
            }


# ── Instagram Publishing ──────────────────────────────────────

async def _publish_to_instagram(
    account: SocialAccount,
    export: Export | None,
    post: ScheduledPost,
) -> dict:
    """Publish a video to Instagram using the Content Publishing API.

    Instagram requires:
    1. A publicly accessible video URL (not a local file)
    2. An Instagram Business Account connected via Facebook
    """
    if not account.access_token:
        raise ValueError("Instagram account has no access token")

    ig_user_id = account.provider_uid

    # Build caption with description + hashtags
    caption_parts = []
    if post.description:
        caption_parts.append(post.description)
    if post.hashtags:
        caption_parts.append(post.hashtags)
    caption = "\n\n".join(caption_parts)

    async with httpx.AsyncClient(timeout=120) as client:
        if export and export.public_url:
            # Step 1: Create media container
            container_resp = await client.post(
                f"{INSTAGRAM_GRAPH_URL}/{ig_user_id}/media",
                data={
                    "media_type": "REELS",
                    "video_url": export.public_url,
                    "caption": caption,
                    "access_token": account.access_token,
                },
            )
            container_resp.raise_for_status()
            container_data = container_resp.json()
            container_id = container_data.get("id")

            if not container_id:
                raise RuntimeError(f"Instagram did not return a container ID: {container_data}")

            # Step 2: Wait for processing (poll status)
            import asyncio
            for _ in range(30):  # Max 5 minutes
                status_resp = await client.get(
                    f"{INSTAGRAM_GRAPH_URL}/{container_id}",
                    params={
                        "fields": "status_code",
                        "access_token": account.access_token,
                    },
                )
                status_data = status_resp.json()
                status_code = status_data.get("status_code")

                if status_code == "FINISHED":
                    break
                elif status_code == "ERROR":
                    raise RuntimeError(f"Instagram processing failed: {status_data}")
                await asyncio.sleep(10)

            # Step 3: Publish the container
            publish_resp = await client.post(
                f"{INSTAGRAM_GRAPH_URL}/{ig_user_id}/media_publish",
                data={
                    "creation_id": container_id,
                    "access_token": account.access_token,
                },
            )
            publish_resp.raise_for_status()
            publish_data = publish_resp.json()

            return {
                "platform_post_id": publish_data.get("id", ""),
                "platform_url": f"https://www.instagram.com/reel/{publish_data.get('id', '')}",
            }
        else:
            raise ValueError(
                "Instagram publishing requires a publicly accessible video URL. "
                "Ensure the export has a public_url set."
            )


# ── Publish Orchestrator ──────────────────────────────────────

async def publish_post(post_id: str, db: Session) -> PublishEvent:
    """Orchestrate publishing a scheduled post to the correct platform.

    1. Loads the post, account, and optional export
    2. Dispatches to the correct platform publisher
    3. Creates a PublishEvent record with the result
    4. Updates the post status
    """
    post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
    if not post:
        raise ValueError(f"Post not found: {post_id}")

    account = db.query(SocialAccount).filter(SocialAccount.id == post.account_id).first()
    if not account:
        raise ValueError(f"Social account not found: {post.account_id}")
    if account.status != "active":
        raise ValueError(f"Social account {account.id} is {account.status}")

    export = None
    if post.export_id:
        export = db.query(Export).filter(Export.id == post.export_id).first()

    # Mark as publishing
    post.status = "publishing"
    db.commit()

    now_iso = datetime.utcnow().isoformat()
    event = PublishEvent(
        id=str(uuid.uuid4()),
        post_id=post.id,
        org_id=post.org_id,
        platform=post.platform,
        status="publishing",
        retry_count=0,
        created_at=now_iso,
    )

    try:
        if post.platform == "youtube":
            result = await _publish_to_youtube(account, export, post)
        elif post.platform == "instagram":
            result = await _publish_to_instagram(account, export, post)
        else:
            raise ValueError(f"Unsupported platform: {post.platform}")

        # Success
        event.status = "published"
        event.platform_post_id = result.get("platform_post_id", "")
        event.platform_url = result.get("platform_url", "")
        event.published_at = datetime.utcnow().isoformat()
        post.status = "published"

    except Exception as e:
        # Failure
        event.status = "failed"
        event.error_code = type(e).__name__
        event.error_message = str(e)[:500]
        post.status = "failed"

    db.add(event)
    db.commit()
    db.refresh(event)
    db.refresh(post)

    return event
