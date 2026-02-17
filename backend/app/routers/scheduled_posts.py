"""Scheduled posts router: CRUD + action endpoints for /api/v1/scheduled-posts."""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.publishing import ScheduledPost, Campaign, SocialAccount, PublishEvent
from app.schemas.common import json_response, paginated_response, error_body

router = APIRouter(prefix="/api/v1/scheduled-posts", tags=["scheduled-posts"])


def _post_to_dict(p: ScheduledPost) -> dict:
    return {
        "id": p.id,
        "campaignId": p.campaign_id,
        "orgId": p.org_id,
        "exportId": p.export_id,
        "accountId": p.account_id,
        "platform": p.platform,
        "scheduledAt": p.scheduled_at,
        "timezone": p.timezone,
        "title": p.title,
        "description": p.description,
        "hashtags": p.hashtags,
        "status": p.status,
        "approvedBy": p.approved_by,
        "createdAt": p.created_at,
    }


def _event_to_dict(e: PublishEvent) -> dict:
    return {
        "id": e.id,
        "postId": e.post_id,
        "platform": e.platform,
        "platformPostId": e.platform_post_id,
        "status": e.status,
        "errorCode": e.error_code,
        "errorMessage": e.error_message,
        "retryCount": e.retry_count,
        "publishedAt": e.published_at,
        "platformUrl": e.platform_url,
        "createdAt": e.created_at,
    }


# ── GET / ─────────────────────────────────────────────────────

@router.get("")
def list_scheduled_posts(
    campaign_id: str | None = Query(None),
    status: str | None = None,
    platform: str | None = None,
    limit: int = Query(50, le=100),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(ScheduledPost).filter(ScheduledPost.org_id == auth.user.org_id)
    if campaign_id:
        q = q.filter(ScheduledPost.campaign_id == campaign_id)
    if status:
        q = q.filter(ScheduledPost.status == status)
    if platform:
        q = q.filter(ScheduledPost.platform == platform)
    results = q.order_by(desc(ScheduledPost.scheduled_at)).limit(limit).all()
    data = [_post_to_dict(p) for p in results]
    return paginated_response(data, has_more=len(data) == limit)


# ── POST / ────────────────────────────────────────────────────

class CreatePostBody(BaseModel):
    campaignId: str
    accountId: str
    platform: str
    scheduledAt: str
    timezone: str = "UTC"
    exportId: str | None = None
    title: str | None = None
    description: str | None = None
    hashtags: str | None = None


@router.post("", status_code=201)
def create_scheduled_post(
    body: CreatePostBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    # Validate campaign belongs to org
    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == body.campaignId, Campaign.org_id == auth.user.org_id)
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail=error_body("Campaign not found", "ERR_NOT_FOUND"))

    # Validate social account
    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.id == body.accountId, SocialAccount.org_id == auth.user.org_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail=error_body("Social account not found", "ERR_NOT_FOUND"))
    if account.status != "active":
        raise HTTPException(
            status_code=422,
            detail=error_body(f"Social account is {account.status}. Re-authorize first.", "ERR_ACCOUNT_INACTIVE"),
        )

    if body.platform not in ("youtube", "instagram"):
        raise HTTPException(status_code=422, detail=error_body("Platform must be 'youtube' or 'instagram'", "ERR_VALIDATION"))

    now_iso = datetime.utcnow().isoformat()
    post = ScheduledPost(
        id=str(uuid.uuid4()),
        campaign_id=body.campaignId,
        org_id=auth.user.org_id,
        export_id=body.exportId,
        account_id=body.accountId,
        platform=body.platform,
        scheduled_at=body.scheduledAt,
        timezone=body.timezone,
        title=body.title,
        description=body.description,
        hashtags=body.hashtags,
        status="draft",
        created_at=now_iso,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return json_response(_post_to_dict(post))


# ── PATCH /{id} ───────────────────────────────────────────────

class UpdatePostBody(BaseModel):
    title: str | None = None
    description: str | None = None
    hashtags: str | None = None
    scheduledAt: str | None = None
    timezone: str | None = None
    exportId: str | None = None


@router.patch("/{post_id}")
def update_scheduled_post(
    post_id: str,
    body: UpdatePostBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    post = (
        db.query(ScheduledPost)
        .filter(ScheduledPost.id == post_id, ScheduledPost.org_id == auth.user.org_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail=error_body("Post not found", "ERR_NOT_FOUND"))

    if post.status not in ("draft", "scheduled"):
        raise HTTPException(
            status_code=422,
            detail=error_body(f"Cannot edit a post with status '{post.status}'", "ERR_POST_LOCKED"),
        )

    if body.title is not None:
        post.title = body.title
    if body.description is not None:
        post.description = body.description
    if body.hashtags is not None:
        post.hashtags = body.hashtags
    if body.scheduledAt is not None:
        post.scheduled_at = body.scheduledAt
    if body.timezone is not None:
        post.timezone = body.timezone
    if body.exportId is not None:
        post.export_id = body.exportId

    db.commit()
    db.refresh(post)
    return json_response(_post_to_dict(post))


# ── POST /{id}/approve ────────────────────────────────────────

@router.post("/{post_id}/approve")
def approve_post(
    post_id: str,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    post = (
        db.query(ScheduledPost)
        .filter(ScheduledPost.id == post_id, ScheduledPost.org_id == auth.user.org_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail=error_body("Post not found", "ERR_NOT_FOUND"))
    if post.status != "draft":
        raise HTTPException(
            status_code=422,
            detail=error_body(f"Can only approve draft posts (current: {post.status})", "ERR_INVALID_STATUS"),
        )

    post.status = "scheduled"
    post.approved_by = auth.user.id
    db.commit()
    db.refresh(post)
    return json_response(_post_to_dict(post))


# ── POST /{id}/publish ────────────────────────────────────────

@router.post("/{post_id}/publish")
async def publish_post_now(
    post_id: str,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    post = (
        db.query(ScheduledPost)
        .filter(ScheduledPost.id == post_id, ScheduledPost.org_id == auth.user.org_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail=error_body("Post not found", "ERR_NOT_FOUND"))
    if post.status in ("published", "publishing"):
        raise HTTPException(
            status_code=422,
            detail=error_body(f"Post is already {post.status}", "ERR_INVALID_STATUS"),
        )

    from app.services.publisher import publish_post

    try:
        event = await publish_post(post.id, db)
        return json_response({
            "post": _post_to_dict(post),
            "event": _event_to_dict(event),
        })
    except Exception as e:
        raise HTTPException(status_code=502, detail=error_body(f"Publishing failed: {e}", "ERR_PUBLISH_FAILED"))


# ── POST /{id}/cancel ─────────────────────────────────────────

@router.post("/{post_id}/cancel")
def cancel_post(
    post_id: str,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    post = (
        db.query(ScheduledPost)
        .filter(ScheduledPost.id == post_id, ScheduledPost.org_id == auth.user.org_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail=error_body("Post not found", "ERR_NOT_FOUND"))
    if post.status in ("published", "publishing"):
        raise HTTPException(
            status_code=422,
            detail=error_body(f"Cannot cancel a post with status '{post.status}'", "ERR_INVALID_STATUS"),
        )

    post.status = "cancelled"
    db.commit()
    db.refresh(post)
    return json_response(_post_to_dict(post))


# ── GET /{id}/events ──────────────────────────────────────────

@router.get("/{post_id}/events")
def list_publish_events(
    post_id: str,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    post = (
        db.query(ScheduledPost)
        .filter(ScheduledPost.id == post_id, ScheduledPost.org_id == auth.user.org_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail=error_body("Post not found", "ERR_NOT_FOUND"))

    events = (
        db.query(PublishEvent)
        .filter(PublishEvent.post_id == post_id)
        .order_by(desc(PublishEvent.created_at))
        .all()
    )
    return paginated_response([_event_to_dict(e) for e in events], has_more=False)
