"""Render jobs router: GET/POST /api/v1/render-jobs."""

import json as _json
import os
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.video import RenderJob, EditPlan, Scene, VideoAsset, Export
from app.schemas.common import json_response, paginated_response, error_body
from app.utils import storage_key_to_abs_path

router = APIRouter(prefix="/api/v1/render-jobs", tags=["render-jobs"])


def _job_to_dict(j: RenderJob) -> dict:
    return {
        "id": j.id, "editPlanId": j.edit_plan_id, "orgId": j.org_id,
        "format": j.format, "resolution": j.resolution,
        "aspectRatio": j.aspect_ratio, "status": j.status,
        "progressPct": j.progress_pct, "workerId": j.worker_id,
        "startedAt": j.started_at, "completedAt": j.completed_at,
        "errorMessage": j.error_message, "retryCount": j.retry_count,
        "createdAt": j.created_at,
    }


def _export_to_dict(e: Export) -> dict:
    return {
        "id": e.id, "renderJobId": e.render_job_id, "orgId": e.org_id,
        "storageKey": e.storage_key, "publicUrl": e.public_url,
        "format": e.format, "sizeBytes": e.size_bytes,
        "durationMs": e.duration_ms, "downloadCount": e.download_count,
        "expiresAt": e.expires_at, "createdAt": e.created_at,
    }


@router.get("")
def list_render_jobs(
    limit: int = Query(50, le=100),
    status: str | None = None,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(RenderJob).filter(RenderJob.org_id == auth.user.org_id)
    if status:
        q = q.filter(RenderJob.status == status)
    results = q.order_by(desc(RenderJob.created_at)).limit(limit).all()
    data = [_job_to_dict(j) for j in results]
    return paginated_response(data, has_more=len(data) == limit)


class CreateRenderJobBody(BaseModel):
    editPlanId: str
    format: str | None = "mp4"
    resolution: str | None = "1920x1080"
    aspectRatio: str | None = None


@router.post("", status_code=201)
async def create_render_job(
    body: CreateRenderJobBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    fmt = (body.format or "mp4").lower()
    resolution = body.resolution or "1920x1080"

    plan = (
        db.query(EditPlan)
        .filter(EditPlan.id == body.editPlanId, EditPlan.org_id == auth.user.org_id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail=error_body("Edit plan not found", "ERR_NOT_FOUND"))

    scene_ids: list[str] = _json.loads(plan.scene_ids) if plan.scene_ids else []
    if not scene_ids:
        raise HTTPException(status_code=422, detail=error_body("Edit plan has no scenes", "ERR_VALIDATION"))

    scene_rows = (
        db.query(Scene)
        .filter(Scene.org_id == auth.user.org_id, Scene.id.in_(scene_ids))
        .all()
    )
    if not scene_rows:
        raise HTTPException(status_code=404, detail=error_body("No matching scenes found for edit plan", "ERR_NOT_FOUND"))

    scene_map = {s.id: s for s in scene_rows}
    ordered = [scene_map[sid] for sid in scene_ids if sid in scene_map]

    first_asset_id = ordered[0].asset_id if ordered else None
    if not first_asset_id or any(s.asset_id != first_asset_id for s in ordered):
        raise HTTPException(status_code=422, detail=error_body("All scenes in an edit plan must belong to one asset", "ERR_VALIDATION"))

    asset = (
        db.query(VideoAsset)
        .filter(VideoAsset.id == first_asset_id, VideoAsset.org_id == auth.user.org_id)
        .first()
    )
    if not asset:
        raise HTTPException(status_code=404, detail=error_body("Source asset not found", "ERR_NOT_FOUND"))

    now_iso = datetime.utcnow().isoformat()
    render_job_id = str(uuid.uuid4())

    job = RenderJob(
        id=render_job_id,
        edit_plan_id=plan.id,
        org_id=auth.user.org_id,
        format=fmt.upper(),
        resolution=resolution,
        aspect_ratio=body.aspectRatio,
        status="processing",
        progress_pct=5,
        started_at=now_iso,
        created_at=now_iso,
    )
    db.add(job)
    db.commit()

    try:
        from app.services.video.renderer import render_edited_video
        from app.services.video.processor import extract_metadata

        input_file = str(storage_key_to_abs_path(asset.storage_key))
        output_dir = settings.project_root / "data" / "exports" / auth.user.org_id / render_job_id
        work_dir = output_dir / "work"
        output_filename = f"edited.{fmt}"
        output_file = str(output_dir / output_filename)

        job.progress_pct = 35
        db.commit()

        scene_ranges = [{"start_ms": s.start_ms, "end_ms": s.end_ms} for s in ordered]
        await render_edited_video(input_file, scene_ranges, output_file, str(work_dir))

        job.progress_pct = 85
        db.commit()

        metadata = await extract_metadata(output_file)
        file_size = os.path.getsize(output_file)

        storage_key = f"exports/{auth.user.org_id}/{render_job_id}/{output_filename}"
        public_url = f"/{storage_key}"

        export_id = str(uuid.uuid4())
        export_row = Export(
            id=export_id,
            render_job_id=render_job_id,
            org_id=auth.user.org_id,
            storage_key=storage_key,
            public_url=public_url,
            format=fmt.upper(),
            size_bytes=file_size,
            duration_ms=metadata["duration_ms"],
            created_at=datetime.utcnow().isoformat(),
        )
        db.add(export_row)

        job.status = "completed"
        job.progress_pct = 100
        job.completed_at = datetime.utcnow().isoformat()
        job.error_message = None
        db.commit()
        db.refresh(job)
        db.refresh(export_row)

        return json_response({"job": _job_to_dict(job), "export": _export_to_dict(export_row)})

    except Exception as e:
        job.status = "failed"
        job.progress_pct = 100
        job.completed_at = datetime.utcnow().isoformat()
        job.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=error_body(str(e)))
