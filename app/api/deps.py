from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Tenant


def get_tenant(session: Session = Depends(get_session),
               x_tenant_id: str | None = Header(default=None)) -> Tenant:
    """Phase 1 tenant resolution: X-Tenant-Id header, or the sole tenant.
    Replaced by JWT claims when auth (Keycloak) lands — see docs/08."""
    if x_tenant_id:
        tenant = session.get(Tenant, x_tenant_id)
        if tenant is None:
            raise HTTPException(404, "tenant not found")
        return tenant
    tenant = session.scalar(select(Tenant).order_by(Tenant.created_at))
    if tenant is None:
        raise HTTPException(404, "no tenant provisioned — run: python -m app.seed")
    return tenant
