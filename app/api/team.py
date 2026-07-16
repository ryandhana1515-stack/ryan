"""Team management (V2-A): the workspace owner adds teammates who share
the same tenant. Roles per docs/08: ceo (owner) | manager | staff."""
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_tenant
from app.db import get_session
from app.models import Tenant, User
from app.security import hash_password

router = APIRouter(prefix="/api/team", tags=["team"])

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ROLES = {"manager", "staff"}


def _require_owner(user: User | None) -> None:
    # None = admin basic auth or unlocked dev — acts as owner.
    if user is not None and not (user.is_owner or user.role == "ceo"):
        raise HTTPException(403, "Only the workspace owner can manage the team.")


@router.get("")
def list_team(tenant: Tenant = Depends(get_tenant),
              session: Session = Depends(get_session)):
    users = session.scalars(select(User).where(User.tenant_id == tenant.id)
                            .order_by(User.created_at)).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role,
             "is_owner": u.is_owner} for u in users]


class MemberIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=8, max_length=200)
    role: str = Field(default="staff", max_length=20)


@router.post("")
def add_member(body: MemberIn, tenant: Tenant = Depends(get_tenant),
               user: User | None = Depends(get_current_user),
               session: Session = Depends(get_session)):
    _require_owner(user)
    email = body.email.strip().lower()
    if not _EMAIL_RE.match(email):
        raise HTTPException(422, "That email address doesn't look valid.")
    if session.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "An account with this email already exists.")
    role = body.role if body.role in ROLES else "staff"
    member = User(tenant_id=tenant.id, email=email, name=body.name.strip(),
                  role=role, is_owner=False,
                  password_hash=hash_password(body.password))
    session.add(member)
    session.commit()
    return {"id": member.id, "name": member.name, "email": member.email,
            "role": member.role, "is_owner": False}


@router.delete("/{member_id}")
def remove_member(member_id: str, tenant: Tenant = Depends(get_tenant),
                  user: User | None = Depends(get_current_user),
                  session: Session = Depends(get_session)):
    _require_owner(user)
    member = session.get(User, member_id)
    if member is None or member.tenant_id != tenant.id:
        raise HTTPException(404, "member not found")
    if member.is_owner or member.role == "ceo":
        raise HTTPException(422, "The workspace owner cannot be removed.")
    session.delete(member)
    session.commit()
    return {"ok": True}
