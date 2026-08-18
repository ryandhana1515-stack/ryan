"""In-process event bus (doc 1 §1.2). Every event is persisted to the
`events` table (the analytics spine) and fanned out synchronously to
subscribers. The publish/subscribe surface is what matters — swapping the
transport for Redis Streams/NATS later (doc 3) changes nothing upstream.
"""
from collections import defaultdict
from typing import Callable

from sqlalchemy.orm import Session

from app.models import Event

_subscribers: dict[str, list[Callable]] = defaultdict(list)


def subscribe(event_name: str, handler: Callable) -> None:
    if handler not in _subscribers[event_name]:
        _subscribers[event_name].append(handler)


def publish(session: Session, tenant_id: str, name: str, *,
            entity_type: str = "", entity_id: str = "", payload: dict | None = None) -> Event:
    event = Event(tenant_id=tenant_id, name=name, entity_type=entity_type,
                  entity_id=entity_id, payload=payload or {})
    session.add(event)
    session.flush()
    for handler in list(_subscribers[name]):
        handler(session, event)
    return event
