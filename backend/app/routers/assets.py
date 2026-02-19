"""Assets router: GET /api/v1/assets, POST /api/v1/assets/upload,
POST /api/v1/assets/process."""

import json
import uuid
import shutil
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.video import VideoAsset, Scene, Transcript
from app.schemas.common import json_response, paginated_response, error_body
from app.utils import storage_key_to_abs_path

router = APIRouter(prefix="/api/v1/assets", tags=["assets"])


def _asset_to_dict(a: VideoAsset) -> dict:
    return {
        "id": a.id, "projectId": a.project_id, "orgId": a.org_id,
        "filename": a.filename, "storageKey": a.storage_key,
        "mimeType": a.mime_type, "durationMs": a.duration_ms,
        "resolution": a.resolution, "codec": a.codec,
        "sizeBytes": a.size_bytes, "thumbnailUrl": a.thumbnail_url,
        "status": a.status, "createdAt": a.created_at,
    }


# ── GET /api/v1/assets ──

@router.get("")
def list_assets(
    limit: int = Query(50, le=100),
    project_id: str | None = Query(None),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(VideoAsset).filter(VideoAsset.org_id == auth.user.org_id)
    if project_id:
        q = q.filter(VideoAsset.project_id == project_id)
    results = q.order_by(desc(VideoAsset.created_at)).limit(limit).all()
    data = [_asset_to_dict(a) for a in results]
    return paginated_response(data, has_more=len(data) == limit)


# ── POST /api/v1/assets/upload ──

@router.post("/upload", status_code=201)
async def upload_asset(
    file: UploadFile = File(...),
    projectId: str = Form(...),
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    asset_id = str(uuid.uuid4())
    org_id = auth.user.org_id
    filename = file.filename or "video.mp4"
    mime_type = file.content_type or "video/mp4"

    # Save file to disk
    upload_dir = settings.project_root / "data" / "uploads" / org_id / asset_id / "original"
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    storage_key = f"uploads/{org_id}/{asset_id}/original/{filename}"

    # Create asset record
    now_iso = datetime.utcnow().isoformat()
    asset = VideoAsset(
        id=asset_id,
        project_id=projectId,
        org_id=org_id,
        filename=filename,
        storage_key=storage_key,
        mime_type=mime_type,
        status="processing",
        created_at=now_iso,
    )
    db.add(asset)
    db.commit()

    # Extract video metadata
    duration_ms = None
    resolution = None
    codec = None
    size_bytes = None
    thumbnail_url = None

    try:
        from app.services.video.processor import extract_metadata, generate_thumbnail

        metadata = await extract_metadata(str(file_path))
        duration_ms = metadata["duration_ms"]
        resolution = metadata["resolution"]
        codec = metadata["codec"]
        size_bytes = metadata["size_bytes"]

        # Generate thumbnail at 25% of duration
        thumb_timestamp = (metadata["duration_ms"] / 1000) * 0.25
        thumb_dir = settings.project_root / "data" / "uploads" / org_id / asset_id / "thumbnails"
        thumb_dir.mkdir(parents=True, exist_ok=True)
        thumb_path = thumb_dir / "thumb.webp"
        await generate_thumbnail(str(file_path), thumb_timestamp, str(thumb_path))
        thumbnail_url = f"uploads/{org_id}/{asset_id}/thumbnails/thumb.webp"
    except Exception as e:
        print(f"Video processing warning: {e}")

    # Update asset with metadata
    asset.duration_ms = duration_ms
    asset.resolution = resolution
    asset.codec = codec
    asset.size_bytes = size_bytes
    asset.thumbnail_url = thumbnail_url
    asset.status = "ready"
    db.commit()
    db.refresh(asset)

    return json_response(_asset_to_dict(asset))


# ── POST /api/v1/assets/process ──

class ProcessBody(BaseModel):
    assetId: str


@router.post("/process")
async def process_asset(
    body: ProcessBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    asset = (
        db.query(VideoAsset)
        .filter(VideoAsset.id == body.assetId, VideoAsset.org_id == auth.user.org_id)
        .first()
    )
    if not asset:
        raise HTTPException(status_code=404, detail=error_body("Asset not found", "ERR_NOT_FOUND"))

    input_path = storage_key_to_abs_path(asset.storage_key)

    from app.services.video.scene_detector import detect_scenes

    detected = await detect_scenes(str(input_path), 0.3)
    if not detected:
        raise HTTPException(status_code=422, detail=error_body("No scenes detected", "ERR_SCENE_DETECTION"))

    # Clear existing scenes
    db.query(Scene).filter(Scene.asset_id == asset.id).delete()

    scene_rows = []
    for idx, s in enumerate(detected):
        scene = Scene(
            id=str(uuid.uuid4()),
            asset_id=asset.id,
            org_id=auth.user.org_id,
            start_ms=s["start_ms"],
            end_ms=s["end_ms"],
            label=f"Scene {idx + 1}",
            confidence=s.get("score", 0),
            transcript_text=f"Scene {idx + 1}",
            order_index=idx,
        )
        db.add(scene)
        scene_rows.append(scene)

    # Persist transcript
    transcript_segments = [
        {"startMs": s.start_ms, "endMs": s.end_ms, "text": s.transcript_text, "confidence": s.confidence or 0}
        for s in scene_rows
    ]
    full_text = ". ".join(seg["text"] for seg in transcript_segments)
    overall_conf = sum(seg["confidence"] for seg in transcript_segments) / len(transcript_segments) if transcript_segments else 0

    existing_transcript = db.query(Transcript).filter(Transcript.asset_id == asset.id).first()
    now_iso = datetime.utcnow().isoformat()

    if existing_transcript:
        existing_transcript.full_text = full_text
        existing_transcript.segments = json.dumps(transcript_segments)
        existing_transcript.overall_confidence = overall_conf
    else:
        t = Transcript(
            id=str(uuid.uuid4()),
            asset_id=asset.id,
            org_id=auth.user.org_id,
            language="en",
            full_text=full_text,
            segments=json.dumps(transcript_segments),
            overall_confidence=overall_conf,
            created_at=now_iso,
        )
        db.add(t)

    asset.status = "ready"
    db.commit()

    # Auto-generate SEO brief from transcript (best-effort)
    seo_generated = False
    try:
        if full_text and full_text.strip():
            from app.services.seo_generator import generate_seo_brief

            await generate_seo_brief(
                transcript_text=full_text,
                platform="both",
                target_audience=None,
                project_id=asset.project_id,
                org_id=auth.user.org_id,
                user_id=auth.user.id,
                db=db,
            )
            seo_generated = True
    except Exception as e:
        print(f"[process] Auto-SEO generation skipped: {e}")

    return json_response({
        "assetId": asset.id,
        "scenesDetected": len(scene_rows),
        "transcriptGenerated": True,
        "seoGenerated": seo_generated,
    })
