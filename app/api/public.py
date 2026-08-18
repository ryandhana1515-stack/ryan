"""Public (unauthenticated) endpoints for the marketing funnel.

The signup form is dogfooding: every prospect becomes a lead in the
platform owner's own tenant, so the owner's Sales AI follows up with
people who want to buy the platform itself.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import config
from app.db import get_session
from app.models import Tenant
from app.workflows.lead_flow import create_lead_from_webhook

router = APIRouter(prefix="/api/public", tags=["public"])

PLANS = {
    "starter": {"name": "Starter", "price": "$49/mo"},
    "growth": {"name": "Growth", "price": "$149/mo"},
    "scale": {"name": "Scale", "price": "$399/mo"},
    "reseller": {"name": "Reseller (White-label)", "price": "from $297/mo"},
}


@router.get("/plans")
def plans():
    return {key: {**meta, "pay_link": config.STRIPE_LINKS.get(key, "")}
            for key, meta in PLANS.items()}


class SignupIn(BaseModel):
    business: str = Field(min_length=1, max_length=200)
    name: str = Field(min_length=1, max_length=200)
    email: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=50)
    country: str = Field(default="", max_length=100)
    plan: str = Field(default="growth", max_length=20)
    message: str = Field(default="", max_length=2000)
    website: str = Field(default="", max_length=200)  # honeypot — humans leave empty


@router.post("/signup")
def signup(body: SignupIn, session: Session = Depends(get_session)):
    if body.website:  # bot filled the invisible field
        return {"ok": True, "pay_link": ""}
    tenant = session.scalar(select(Tenant).order_by(Tenant.created_at))
    if tenant is None:
        return {"ok": False, "error": "platform not provisioned"}
    plan = body.plan if body.plan in PLANS else "growth"
    note = (f"OmniX signup — plan: {PLANS[plan]['name']}, business: {body.business}, "
            f"country: {body.country or 'n/a'}, email: {body.email or 'n/a'}. "
            f"Goal: {body.message or 'not stated'}")
    create_lead_from_webhook(session, tenant, name=f"{body.name} ({body.business})",
                             phone=body.phone, email=body.email,
                             source="omnix_signup", channel="webchat", message=note)
    session.commit()
    return {"ok": True, "pay_link": config.STRIPE_LINKS.get(plan, "")}
