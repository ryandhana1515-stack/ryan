"""Customer accounts: self-serve registration, login, sessions.

Every registered customer gets their OWN tenant (a private workspace) with
all 18 AI employees provisioned on the spot, plus an owner login. Emails
are unique platform-wide, so login is just email + password.

The very first tenant in the database is the platform owner's; new
registrations also drop a lead there so the owner's Sales AI follows up
with every new customer (dogfooding).
"""
import re

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import config
from app.agents import rag
from app.agents.registry import sync_agents_for_tenant
from app.db import get_session
from app.models import KnowledgeDoc, Tenant, User
from app.security import (SESSION_COOKIE, SESSION_TTL, create_session_token,
                          hash_password, verify_password, verify_session_token)

router = APIRouter(prefix="/api/auth", tags=["auth"])

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _set_session_cookie(request: Request, response: Response, token: str) -> None:
    https = (request.url.scheme == "https"
             or request.headers.get("x-forwarded-proto", "") == "https")
    response.set_cookie(SESSION_COOKIE, token, max_age=SESSION_TTL, path="/",
                        httponly=True, samesite="lax", secure=https)


class RegisterIn(BaseModel):
    business: str = Field(min_length=1, max_length=200)
    name: str = Field(min_length=1, max_length=200)
    email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=8, max_length=200)
    plan: str = Field(default="trial", max_length=20)
    goal: str = Field(default="", max_length=2000)
    website: str = Field(default="", max_length=200)  # honeypot


@router.post("/register")
def register(body: RegisterIn, request: Request, response: Response,
             session: Session = Depends(get_session)):
    if body.website:  # bot filled the invisible field
        return {"ok": True}
    email = body.email.strip().lower()
    if not _EMAIL_RE.match(email):
        raise HTTPException(422, "That email address doesn't look valid.")
    if session.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "An account with this email already exists — sign in instead.")

    owner_tenant = session.scalar(select(Tenant).order_by(Tenant.created_at))

    tenant = Tenant(name=body.business.strip(), plan=body.plan or "trial",
                    brand_kit={"voice": "warm, confident, plain-spoken",
                               "mission": body.goal.strip()})
    session.add(tenant)
    session.flush()
    user = User(tenant_id=tenant.id, email=email, name=body.name.strip(),
                role="ceo", is_owner=True, password_hash=hash_password(body.password))
    session.add(user)
    sync_agents_for_tenant(session, tenant.id)

    # Starter knowledge so the new workspace's agents know who they work for.
    doc = KnowledgeDoc(
        tenant_id=tenant.id, title=f"About {tenant.name}", kind="brand",
        body=(f"Business name: {tenant.name}. Owner: {user.name}. "
              f"Goal: {body.goal.strip() or 'not stated yet'}. "
              "Add your prices, policies, and FAQs in the knowledge base so "
              "your AI employees can answer customers accurately."))
    session.add(doc)
    session.flush()
    rag.chunk_and_store(session, tenant.id, doc.id, doc.title, doc.kind, doc.body)

    # Dogfood: the platform owner's Sales AI follows up with every new customer.
    if owner_tenant is not None and owner_tenant.id != tenant.id:
        from app.workflows.lead_flow import create_lead_from_webhook
        create_lead_from_webhook(
            session, owner_tenant, name=f"{user.name} ({tenant.name})",
            phone="", email=email, source="omnix_account", channel="webchat",
            message=f"New OmniX workspace created — plan: {tenant.plan}. "
                    f"Goal: {body.goal.strip() or 'not stated'}")
    session.commit()

    _set_session_cookie(request, response, create_session_token(user.id, tenant.id))
    return {"ok": True, "tenant": tenant.name, "name": user.name}


class LoginIn(BaseModel):
    email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=1, max_length=200)


@router.post("/login")
def login(body: LoginIn, request: Request, response: Response,
          session: Session = Depends(get_session)):
    email = body.email.strip().lower()
    user = session.scalar(select(User).where(User.email == email))

    if user is not None and user.password_hash and verify_password(body.password, user.password_hash):
        tenant = session.get(Tenant, user.tenant_id)
    elif config.ADMIN_PASSWORD and body.password == config.ADMIN_PASSWORD:
        # Platform-owner fallback: the ADMIN_PASSWORD opens the first
        # (owner) tenant, so the founder can sign in before having an account.
        tenant = session.scalar(select(Tenant).order_by(Tenant.created_at))
        if tenant is None:
            raise HTTPException(401, "Platform not provisioned yet.")
        user = session.scalar(select(User).where(User.tenant_id == tenant.id)
                              .order_by(User.created_at))
        if user is None:
            user = User(tenant_id=tenant.id, email=email, name="Owner",
                        role="ceo", is_owner=True)
            session.add(user)
            session.commit()
    else:
        raise HTTPException(401, "Wrong email or password.")

    if tenant is None:
        raise HTTPException(401, "This account's workspace no longer exists.")
    _set_session_cookie(request, response, create_session_token(user.id, tenant.id))
    return {"ok": True, "tenant": tenant.name, "name": user.name}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"ok": True}


@router.get("/me")
def me(request: Request, session: Session = Depends(get_session)):
    token = request.cookies.get(SESSION_COOKIE, "")
    payload = verify_session_token(token) if token else None
    if payload is None:
        raise HTTPException(401, "Not signed in.")
    user = session.get(User, payload["u"])
    tenant = session.get(Tenant, payload["t"])
    if user is None or tenant is None:
        raise HTTPException(401, "Session no longer valid.")
    return {"name": user.name, "email": user.email, "role": user.role,
            "tenant": tenant.name, "plan": tenant.plan}
