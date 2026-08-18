from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Tenant, User
from app.security import SESSION_COOKIE, verify_session_token


def get_tenant(request: Request, session: Session = Depends(get_session),
               x_tenant_id: str | None = Header(default=None)) -> Tenant:
    """Tenant resolution, in order: signed session cookie (customer
    accounts), X-Tenant-Id header (admin/scripts), else the first tenant
    (the platform owner's — admin basic auth and local dev)."""
    payload = getattr(request.state, "session", None)
    if payload is None:
        token = request.cookies.get(SESSION_COOKIE)
        payload = verify_session_token(token) if token else None
    if payload is not None:
        tenant = session.get(Tenant, payload.get("t", ""))
        if tenant is not None:
            return tenant
        raise HTTPException(401, "session workspace no longer exists")
    if x_tenant_id:
        tenant = session.get(Tenant, x_tenant_id)
        if tenant is None:
            raise HTTPException(404, "tenant not found")
        return tenant
    tenant = session.scalar(select(Tenant).order_by(Tenant.created_at))
    if tenant is None:
        raise HTTPException(404, "no tenant provisioned — run: python -m app.seed")
    return tenant


def get_current_user(request: Request,
                     session: Session = Depends(get_session)) -> User | None:
    """The signed-in user, or None when running on admin basic auth /
    unlocked local dev (both act as the workspace owner)."""
    payload = getattr(request.state, "session", None)
    if payload is None:
        token = request.cookies.get(SESSION_COOKIE)
        payload = verify_session_token(token) if token else None
    if payload is None:
        return None
    return session.get(User, payload.get("u", ""))
