"""AI endpoints router: POST /api/v1/ai/seo-generate, POST /api/v1/ai/edit-plan-generate,
POST /api/v1/ai/anomaly-explain."""

import json as _json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.video import VideoAsset, Transcript, Scene
from app.schemas.common import json_response, error_body

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


# ── POST /api/v1/ai/seo-generate ──

class SeoGenerateBody(BaseModel):
    assetId: str
    platform: str | None = "youtube"
    targetAudience: str | None = None


@router.post("/seo-generate")
async def seo_generate(
    body: SeoGenerateBody,
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

    transcript = db.query(Transcript).filter(Transcript.asset_id == asset.id).first()
    transcript_text = transcript.full_text if transcript and transcript.full_text else ""

    if not transcript_text:
        raise HTTPException(status_code=422, detail=error_body("Asset has no transcript. Run processing first.", "ERR_NO_TRANSCRIPT"))

    from app.services.seo_generator import generate_seo_brief

    result = await generate_seo_brief(
        transcript_text=transcript_text,
        platform=body.platform or "youtube",
        target_audience=body.targetAudience,
        project_id=asset.project_id,
        org_id=auth.user.org_id,
        user_id=auth.user.id,
        db=db,
    )
    return json_response(result)


# ── POST /api/v1/ai/edit-plan-generate ──

class EditPlanGenerateBody(BaseModel):
    assetId: str
    targetFormat: str | None = "youtube"
    targetDurationMs: int | None = None


@router.post("/edit-plan-generate")
async def edit_plan_generate(
    body: EditPlanGenerateBody,
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

    scene_rows = (
        db.query(Scene)
        .filter(Scene.asset_id == asset.id, Scene.org_id == auth.user.org_id)
        .order_by(Scene.order_index)
        .all()
    )
    if not scene_rows:
        raise HTTPException(status_code=422, detail=error_body("No scenes found for this asset. Run processing first.", "ERR_NO_SCENES"))

    scenes = [
        {
            "id": s.id, "startMs": s.start_ms, "endMs": s.end_ms,
            "label": s.label or f"Scene {s.order_index + 1}",
            "confidence": s.confidence or 0,
            "transcriptText": s.transcript_text,
        }
        for s in scene_rows
    ]

    from app.services.edit_plan_generator import generate_edit_plan

    result = await generate_edit_plan(
        scenes=scenes,
        target_format=body.targetFormat or "youtube",
        target_duration_ms=body.targetDurationMs,
        project_id=asset.project_id,
        org_id=auth.user.org_id,
        user_id=auth.user.id,
        db=db,
    )
    return json_response(result)


# ── POST /api/v1/ai/anomaly-explain ──

class AnomalyExplainBody(BaseModel):
    kpiName: str
    actualValue: float
    expectedValue: float
    deviationPct: float
    severity: str | None = "medium"
    recentDataPoints: list[dict] | None = None


@router.post("/anomaly-explain")
async def anomaly_explain(body: AnomalyExplainBody):
    from app.services.anomaly_explainer import explain_anomaly

    result = await explain_anomaly(
        kpi_name=body.kpiName,
        actual_value=body.actualValue,
        expected_value=body.expectedValue,
        deviation_pct=body.deviationPct,
        severity=body.severity or "medium",
        recent_data_points=body.recentDataPoints or [],
    )
    return json_response(result)
