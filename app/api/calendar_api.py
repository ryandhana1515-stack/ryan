"""Content calendar / social scheduler (V2-A): plan posts per platform,
mark them posted, and see appointments alongside. Native auto-publishing
to Meta/TikTok is Phase V2-B (needs platform developer approval) — until
then the "post now" flow opens the platform's own upload page."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_tenant
from app.db import get_session
from app.models import Appointment, Contact, ScheduledPost, Tenant, utcnow

router = APIRouter(prefix="/api/calendar", tags=["calendar"])

PLATFORMS = {
    "facebook": {"label": "Facebook", "emoji": "📘",
                 "post_url": "https://business.facebook.com/latest/composer"},
    "instagram": {"label": "Instagram", "emoji": "📸",
                  "post_url": "https://business.facebook.com/latest/composer"},
    "tiktok": {"label": "TikTok", "emoji": "🎵",
               "post_url": "https://www.tiktok.com/tiktokstudio/upload"},
    "youtube": {"label": "YouTube", "emoji": "▶️",
                "post_url": "https://studio.youtube.com"},
    "xiaohongshu": {"label": "Xiaohongshu", "emoji": "📕",
                    "post_url": "https://creator.xiaohongshu.com/publish/publish"},
    "other": {"label": "Other", "emoji": "📝", "post_url": ""},
}


@router.get("")
def calendar(days: int = 14, tenant: Tenant = Depends(get_tenant),
             session: Session = Depends(get_session)):
    start = utcnow() - timedelta(days=1)
    end = utcnow() + timedelta(days=max(1, min(days, 60)))
    posts = session.scalars(select(ScheduledPost)
        .where(ScheduledPost.tenant_id == tenant.id,
               ScheduledPost.scheduled_at >= start.replace(tzinfo=None),
               ScheduledPost.scheduled_at <= end.replace(tzinfo=None))
        .order_by(ScheduledPost.scheduled_at)).all()
    appts = session.scalars(select(Appointment)
        .where(Appointment.tenant_id == tenant.id,
               Appointment.starts_at >= start.replace(tzinfo=None),
               Appointment.starts_at <= end.replace(tzinfo=None))
        .order_by(Appointment.starts_at)).all()
    contact_names = {c.id: c.name for c in session.scalars(select(Contact).where(
        Contact.id.in_([a.contact_id for a in appts]))).all()} if appts else {}
    return {
        "platforms": PLATFORMS,
        "posts": [{"id": p.id, "platform": p.platform, "caption": p.caption,
                   "media_url": p.media_url, "scheduled_at": p.scheduled_at.isoformat(),
                   "status": p.status} for p in posts],
        "appointments": [{"id": a.id, "starts_at": a.starts_at.isoformat(),
                          "status": a.status,
                          "contact": contact_names.get(a.contact_id, "customer")}
                         for a in appts],
    }


class PostIn(BaseModel):
    platform: str = Field(default="instagram", max_length=30)
    caption: str = Field(default="", max_length=5000)
    media_url: str = Field(default="", max_length=500)
    scheduled_at: datetime


@router.post("/posts")
def create_post(body: PostIn, tenant: Tenant = Depends(get_tenant),
                session: Session = Depends(get_session)):
    platform = body.platform if body.platform in PLATFORMS else "other"
    post = ScheduledPost(tenant_id=tenant.id, platform=platform,
                         caption=body.caption, media_url=body.media_url,
                         scheduled_at=body.scheduled_at.replace(tzinfo=None))
    session.add(post)
    session.commit()
    return {"id": post.id, "status": post.status}


class PostPatch(BaseModel):
    status: str | None = None       # scheduled|posted|skipped
    caption: str | None = Field(default=None, max_length=5000)
    scheduled_at: datetime | None = None


@router.patch("/posts/{post_id}")
def update_post(post_id: str, body: PostPatch,
                tenant: Tenant = Depends(get_tenant),
                session: Session = Depends(get_session)):
    post = session.get(ScheduledPost, post_id)
    if post is None or post.tenant_id != tenant.id:
        raise HTTPException(404, "post not found")
    if body.status is not None:
        if body.status not in ("scheduled", "posted", "skipped"):
            raise HTTPException(422, "bad status")
        post.status = body.status
        post.posted_at = utcnow().replace(tzinfo=None) if body.status == "posted" else None
    if body.caption is not None:
        post.caption = body.caption
    if body.scheduled_at is not None:
        post.scheduled_at = body.scheduled_at.replace(tzinfo=None)
    session.commit()
    return {"id": post.id, "status": post.status}


@router.delete("/posts/{post_id}")
def delete_post(post_id: str, tenant: Tenant = Depends(get_tenant),
                session: Session = Depends(get_session)):
    post = session.get(ScheduledPost, post_id)
    if post is None or post.tenant_id != tenant.id:
        raise HTTPException(404, "post not found")
    session.delete(post)
    session.commit()
    return {"ok": True}
