"""Video Studio API: brief -> AI Director plan -> storyboard scenes ->
per-scene generation -> assembled multi-format exports."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_tenant
from app.db import get_session
from app.models import Tenant, VideoProject, VideoScene
from app.video import director, render
from app.video.providers import ProviderNotEnabled, roster, route

router = APIRouter(prefix="/api/video-studio", tags=["video-studio"])

GOALS = ["product_ad", "social_ad", "talking_avatar", "founder_video",
         "explainer", "tutorial", "testimonial", "real_estate",
         "restaurant_hotel", "ugc_ad", "short_film", "custom"]


def _scene_out(s: VideoScene) -> dict:
    return {"id": s.id, "idx": s.idx, "purpose": s.purpose,
            "scene_type": s.scene_type, "dialogue": s.dialogue,
            "on_screen_text": s.on_screen_text, "visual_prompt": s.visual_prompt,
            "camera": s.camera, "duration_sec": s.duration_sec,
            "provider": s.provider, "status": s.status, "media_url": s.media_url,
            "error": s.error, "estimated_credits": s.estimated_credits}


def _project_out(p: VideoProject, scenes: list[VideoScene]) -> dict:
    return {"id": p.id, "title": p.title, "goal": p.goal, "brief": p.brief,
            "direction": p.direction, "plan": p.plan, "status": p.status,
            "estimated_credits": p.estimated_credits, "outputs": p.outputs,
            "scenes": [_scene_out(s) for s in sorted(scenes, key=lambda s: s.idx)]}


def _get_project(project_id: str, tenant: Tenant, session: Session) -> VideoProject:
    project = session.get(VideoProject, project_id)
    if project is None or project.tenant_id != tenant.id:
        raise HTTPException(404, "project not found")
    return project


def _scenes(project_id: str, session: Session) -> list[VideoScene]:
    return list(session.scalars(select(VideoScene)
                .where(VideoScene.project_id == project_id)).all())


@router.get("/providers")
def providers():
    return roster()


class ProjectIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    goal: str = Field(default="product_ad", max_length=50)
    brief: dict = Field(default_factory=dict)      # product, audience, cta, ...
    direction: dict = Field(default_factory=dict)  # style, mood, music, ...


@router.post("/projects")
def create_project(body: ProjectIn, tenant: Tenant = Depends(get_tenant),
                   session: Session = Depends(get_session)):
    goal = body.goal if body.goal in GOALS else "custom"
    plan = director.make_plan({"title": body.title, "goal": goal, **body.brief},
                              body.direction)
    project = VideoProject(tenant_id=tenant.id, title=body.title, goal=goal,
                           brief=body.brief, direction=body.direction, plan=plan,
                           status="awaiting_approval",
                           estimated_credits=plan["estimated_credits"])
    session.add(project)
    session.flush()
    scenes = []
    for s in plan["scenes"]:
        scene = VideoScene(tenant_id=tenant.id, project_id=project.id,
                           idx=s["idx"], purpose=s.get("purpose", ""),
                           scene_type=s.get("scene_type", "broll"),
                           dialogue=s.get("dialogue", ""),
                           on_screen_text=s.get("on_screen_text", ""),
                           visual_prompt=s.get("visual_prompt", ""),
                           camera=s.get("camera", ""),
                           duration_sec=s["duration_sec"],
                           provider=s.get("recommended_provider", "auto"),
                           estimated_credits=s["estimated_credits"])
        session.add(scene)
        scenes.append(scene)
    session.commit()
    return _project_out(project, scenes)


@router.get("/projects")
def list_projects(tenant: Tenant = Depends(get_tenant),
                  session: Session = Depends(get_session)):
    projects = session.scalars(select(VideoProject)
        .where(VideoProject.tenant_id == tenant.id)
        .order_by(VideoProject.created_at.desc()).limit(50)).all()
    return [{"id": p.id, "title": p.title, "goal": p.goal, "status": p.status,
             "estimated_credits": p.estimated_credits, "outputs": p.outputs,
             "created_at": p.created_at.isoformat()} for p in projects]


@router.get("/projects/{project_id}")
def get_project(project_id: str, tenant: Tenant = Depends(get_tenant),
                session: Session = Depends(get_session)):
    project = _get_project(project_id, tenant, session)
    return _project_out(project, _scenes(project.id, session))


@router.post("/projects/{project_id}/replan")
def replan(project_id: str, tenant: Tenant = Depends(get_tenant),
           session: Session = Depends(get_session)):
    """Regenerate the whole Director plan (keeps the brief)."""
    project = _get_project(project_id, tenant, session)
    plan = director.make_plan({"title": project.title, "goal": project.goal,
                               **project.brief}, project.direction)
    for old in _scenes(project.id, session):
        session.delete(old)
    project.plan = plan
    project.estimated_credits = plan["estimated_credits"]
    project.status = "awaiting_approval"
    project.outputs = []
    scenes = []
    for s in plan["scenes"]:
        scene = VideoScene(tenant_id=tenant.id, project_id=project.id,
                           idx=s["idx"], purpose=s.get("purpose", ""),
                           scene_type=s.get("scene_type", "broll"),
                           dialogue=s.get("dialogue", ""),
                           on_screen_text=s.get("on_screen_text", ""),
                           visual_prompt=s.get("visual_prompt", ""),
                           camera=s.get("camera", ""),
                           duration_sec=s["duration_sec"],
                           provider=s.get("recommended_provider", "auto"),
                           estimated_credits=s["estimated_credits"])
        session.add(scene)
        scenes.append(scene)
    session.commit()
    return _project_out(project, scenes)


class ScenePatch(BaseModel):
    dialogue: str | None = None
    on_screen_text: str | None = Field(default=None, max_length=300)
    visual_prompt: str | None = None
    camera: str | None = Field(default=None, max_length=200)
    duration_sec: int | None = Field(default=None, ge=2, le=20)
    provider: str | None = Field(default=None, max_length=30)
    scene_type: str | None = Field(default=None, max_length=30)


@router.patch("/scenes/{scene_id}")
def edit_scene(scene_id: str, body: ScenePatch,
               tenant: Tenant = Depends(get_tenant),
               session: Session = Depends(get_session)):
    scene = session.get(VideoScene, scene_id)
    if scene is None or scene.tenant_id != tenant.id:
        raise HTTPException(404, "scene not found")
    for field in ("dialogue", "on_screen_text", "visual_prompt", "camera",
                  "duration_sec", "provider", "scene_type"):
        value = getattr(body, field)
        if value is not None:
            setattr(scene, field, value)
    scene.status = "draft" if scene.status == "completed" else scene.status
    session.commit()
    return _scene_out(scene)


@router.post("/scenes/{scene_id}/generate")
def generate_scene(scene_id: str, tenant: Tenant = Depends(get_tenant),
                   session: Session = Depends(get_session)):
    scene = session.get(VideoScene, scene_id)
    if scene is None or scene.tenant_id != tenant.id:
        raise HTTPException(404, "scene not found")
    scene.status = "generating"
    scene.error = ""
    session.commit()
    try:
        provider = route(scene.scene_type, scene.provider)
        scene.media_url = provider.generate({
            "idx": scene.idx, "purpose": scene.purpose,
            "dialogue": scene.dialogue, "on_screen_text": scene.on_screen_text,
            "visual_prompt": scene.visual_prompt, "camera": scene.camera,
            "duration_sec": scene.duration_sec})
        scene.status = "completed"
        scene.provider = provider.id
    except ProviderNotEnabled as exc:
        scene.status = "failed"
        scene.error = str(exc)
    except Exception as exc:  # provider/network failure — report honestly
        scene.status = "failed"
        scene.error = f"Generation failed: {exc}"
    session.commit()
    if scene.status == "failed":
        raise HTTPException(502, scene.error)
    return _scene_out(scene)


class AssembleIn(BaseModel):
    formats: list[str] = Field(default_factory=lambda: ["landscape_16_9"])


@router.post("/projects/{project_id}/assemble")
def assemble(project_id: str, body: AssembleIn,
             tenant: Tenant = Depends(get_tenant),
             session: Session = Depends(get_session)):
    project = _get_project(project_id, tenant, session)
    scenes = sorted(_scenes(project.id, session), key=lambda s: s.idx)
    done = [s.media_url for s in scenes
            if s.status == "completed" and s.media_url.endswith(".mp4")]
    if not done:
        raise HTTPException(422, "Generate at least one scene first.")
    try:
        project.outputs = render.assemble(done, body.formats)
        project.status = "completed"
        session.commit()
    except Exception as exc:
        project.status = "failed"
        session.commit()
        raise HTTPException(502, f"Render failed: {exc}")
    return {"outputs": project.outputs, "status": project.status,
            "formats": render.FORMATS}


@router.delete("/projects/{project_id}")
def delete_project(project_id: str, tenant: Tenant = Depends(get_tenant),
                   session: Session = Depends(get_session)):
    project = _get_project(project_id, tenant, session)
    for scene in _scenes(project.id, session):
        session.delete(scene)
    session.delete(project)
    session.commit()
    return {"ok": True}
