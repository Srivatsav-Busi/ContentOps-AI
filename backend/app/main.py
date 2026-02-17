"""FastAPI application entry point."""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import (
    auth,
    projects,
    assets,
    campaigns,
    dashboards,
    reports,
    alerts,
    exports,
    render_jobs,
    billing,
    seo_briefs,
    ai,
    social_accounts,
    scheduled_posts,
    oauth,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import all models so Base.metadata knows about them
    import app.models.system  # noqa: F401
    import app.models.tenant  # noqa: F401
    import app.models.video  # noqa: F401
    import app.models.publishing  # noqa: F401
    import app.models.analytics  # noqa: F401

    # Create tables that don't yet exist (safe to call on existing DB)
    Base.metadata.create_all(bind=engine)
    print(f"[startup] Using database: {settings.db_path}")

    # Start background scheduler for auto-publishing
    from app.services.scheduler import run_scheduler
    scheduler_task = asyncio.create_task(run_scheduler(poll_interval=60))
    print("[startup] Background publish scheduler started")

    yield

    # Shutdown: cancel scheduler
    scheduler_task.cancel()
    try:
        await scheduler_task
    except asyncio.CancelledError:
        print("[shutdown] Scheduler stopped")


app = FastAPI(
    title="ContentOps AI — Python Backend",
    version="0.1.0",
    description="Python FastAPI backend for ContentOps AI video content platform.",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Register routers ──

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(assets.router)
app.include_router(campaigns.router)
app.include_router(dashboards.router)
app.include_router(reports.router)
app.include_router(alerts.router)
app.include_router(exports.router)
app.include_router(render_jobs.router)
app.include_router(billing.router)
app.include_router(seo_briefs.router)
app.include_router(ai.router)
app.include_router(social_accounts.router)
app.include_router(scheduled_posts.router)
app.include_router(oauth.router)

