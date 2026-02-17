"""Video & editing tables: projects, video_assets, transcripts, scenes,
edit_plans, render_jobs, exports."""

from sqlalchemy import Column, Text, Integer, Float, ForeignKey, Index
from app.database import Base


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
        Index("projects_org_id_idx", "org_id"),
        Index("projects_status_idx", "status"),
    )

    id = Column(Text, primary_key=True)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    template = Column(Text)
    status = Column(Text, nullable=False, default="active")
    created_by = Column(Text, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(Text, nullable=False)
    updated_at = Column(Text, nullable=False)


class VideoAsset(Base):
    __tablename__ = "video_assets"
    __table_args__ = (
        Index("video_assets_project_id_idx", "project_id"),
        Index("video_assets_org_id_idx", "org_id"),
    )

    id = Column(Text, primary_key=True)
    project_id = Column(Text, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    filename = Column(Text, nullable=False)
    storage_key = Column(Text, nullable=False)
    mime_type = Column(Text, nullable=False)
    duration_ms = Column(Integer)
    resolution = Column(Text)
    codec = Column(Text)
    size_bytes = Column(Integer)
    thumbnail_url = Column(Text)
    status = Column(Text, nullable=False, default="uploading")
    created_at = Column(Text, nullable=False)


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Text, primary_key=True)
    asset_id = Column(Text, ForeignKey("video_assets.id", ondelete="CASCADE"), nullable=False, unique=True)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    language = Column(Text, nullable=False, default="en")
    full_text = Column(Text)
    srt_url = Column(Text)
    vtt_url = Column(Text)
    segments = Column(Text, default="[]")
    overall_confidence = Column(Float)
    created_at = Column(Text, nullable=False)


class Scene(Base):
    __tablename__ = "scenes"
    __table_args__ = (
        Index("scenes_asset_id_idx", "asset_id"),
        Index("scenes_order_idx", "asset_id", "order_index"),
    )

    id = Column(Text, primary_key=True)
    asset_id = Column(Text, ForeignKey("video_assets.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    start_ms = Column(Integer, nullable=False)
    end_ms = Column(Integer, nullable=False)
    label = Column(Text)
    confidence = Column(Float)
    thumbnail_url = Column(Text)
    transcript_text = Column(Text)
    order_index = Column(Integer, nullable=False)


class EditPlan(Base):
    __tablename__ = "edit_plans"

    id = Column(Text, primary_key=True)
    project_id = Column(Text, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    scene_ids = Column(Text, default="[]")
    transitions = Column(Text, default="[]")
    captions = Column(Text)
    overlays = Column(Text, default="[]")
    music_track = Column(Text)
    status = Column(Text, nullable=False, default="draft")
    approved_by = Column(Text, ForeignKey("users.id", ondelete="SET NULL"))
    created_by = Column(Text, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(Text, nullable=False)
    updated_at = Column(Text, nullable=False)


class RenderJob(Base):
    __tablename__ = "render_jobs"
    __table_args__ = (
        Index("render_jobs_edit_plan_id_idx", "edit_plan_id"),
        Index("render_jobs_status_idx", "status"),
    )

    id = Column(Text, primary_key=True)
    edit_plan_id = Column(Text, ForeignKey("edit_plans.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    format = Column(Text, nullable=False)
    resolution = Column(Text, nullable=False)
    aspect_ratio = Column(Text)
    status = Column(Text, nullable=False, default="queued")
    progress_pct = Column(Integer, default=0)
    worker_id = Column(Text)
    started_at = Column(Text)
    completed_at = Column(Text)
    error_message = Column(Text)
    retry_count = Column(Integer, nullable=False, default=0)
    created_at = Column(Text, nullable=False)


class Export(Base):
    __tablename__ = "exports"

    id = Column(Text, primary_key=True)
    render_job_id = Column(Text, ForeignKey("render_jobs.id", ondelete="CASCADE"), nullable=False, unique=True)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    storage_key = Column(Text, nullable=False)
    public_url = Column(Text)
    format = Column(Text, nullable=False)
    size_bytes = Column(Integer)
    duration_ms = Column(Integer)
    download_count = Column(Integer, nullable=False, default=0)
    expires_at = Column(Text)
    created_at = Column(Text, nullable=False)
