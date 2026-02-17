"""Projects router: GET/POST /api/v1/projects."""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_auth, AuthContext
from app.models.video import Project
from app.schemas.common import json_response, paginated_response, error_body

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


def _project_to_dict(p: Project) -> dict:
    return {
        "id": p.id, "orgId": p.org_id, "name": p.name, "template": p.template,
        "status": p.status, "createdBy": p.created_by,
        "createdAt": p.created_at, "updatedAt": p.updated_at,
    }


@router.get("")
def list_projects(
    limit: int = Query(50, le=100),
    status: str | None = None,
    search: str | None = None,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    q = db.query(Project).filter(Project.org_id == auth.user.org_id)
    if status:
        q = q.filter(Project.status == status)
    if search:
        q = q.filter(Project.name.ilike(f"%{search}%"))
    results = q.order_by(desc(Project.created_at)).limit(limit).all()
    data = [_project_to_dict(p) for p in results]
    return paginated_response(data, has_more=len(data) == limit)


class CreateProjectBody(BaseModel):
    name: str
    template: str | None = None


@router.post("", status_code=201)
def create_project(
    body: CreateProjectBody,
    auth: AuthContext = Depends(require_auth),
    db: Session = Depends(get_db),
):
    if not body.name or not body.name.strip():
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail=error_body("Project name is required", "ERR_VALIDATION"))

    now_iso = datetime.utcnow().isoformat()
    project = Project(
        id=str(uuid.uuid4()),
        org_id=auth.user.org_id,
        name=body.name.strip(),
        template=body.template,
        status="active",
        created_by=auth.user.id,
        created_at=now_iso,
        updated_at=now_iso,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return json_response(_project_to_dict(project))
