from sqlalchemy.orm import Session

from app.models import AuditLog


def audit(session: Session, tenant_id: str, actor_type: str, actor_id: str,
          action: str, *, entity_type: str = "", entity_id: str = "",
          detail: dict | None = None) -> None:
    session.add(AuditLog(tenant_id=tenant_id, actor_type=actor_type, actor_id=actor_id,
                         action=action, entity_type=entity_type, entity_id=entity_id,
                         detail=detail or {}))
