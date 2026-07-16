"""Multi-tenant schema — Phase 1 subset of docs/04-database-design.md.

Every table carries tenant_id. UUIDs are stored as 36-char strings so the
schema runs identically on SQLite (dev) and PostgreSQL (prod, where
row-level security is added by migration).
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TenantScoped:
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(36), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Tenant(Base):
    __tablename__ = "tenants"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200))
    plan: Mapped[str] = mapped_column(String(50), default="internal")
    brand_kit: Mapped[dict] = mapped_column(JSON, default=dict)
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class User(TenantScoped, Base):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String(200), index=True)
    name: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(50), default="manager")  # doc 8 roles
    password_hash: Mapped[str] = mapped_column(String(300), default="")
    is_owner: Mapped[bool] = mapped_column(Boolean, default=False)


# ---------------------------------------------------------------- CRM

class Contact(TenantScoped, Base):
    __tablename__ = "contacts"
    name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(50), default="")
    email: Mapped[str] = mapped_column(String(200), default="")
    company: Mapped[str] = mapped_column(String(200), default="")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    consent: Mapped[dict] = mapped_column(JSON, default=dict)  # {"whatsapp": true, ...}


class Lead(TenantScoped, Base):
    __tablename__ = "leads"
    contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"))
    source: Mapped[str] = mapped_column(String(100), default="manual")
    channel: Mapped[str] = mapped_column(String(50), default="webchat")
    stage: Mapped[str] = mapped_column(String(50), default="new")
    # new -> engaging -> qualified -> appointment -> won/lost/cold
    score: Mapped[int] = mapped_column(Integer, default=0)
    score_reasons: Mapped[list] = mapped_column(JSON, default=list)
    owner_type: Mapped[str] = mapped_column(String(20), default="agent")  # agent|human
    owner_id: Mapped[str] = mapped_column(String(36), default="")
    last_activity_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Deal(TenantScoped, Base):
    __tablename__ = "deals"
    lead_id: Mapped[str] = mapped_column(ForeignKey("leads.id"))
    title: Mapped[str] = mapped_column(String(200))
    value: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    stage: Mapped[str] = mapped_column(String(50), default="open")  # open|won|lost
    probability: Mapped[int] = mapped_column(Integer, default=50)


class Conversation(TenantScoped, Base):
    __tablename__ = "conversations"
    contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"))
    channel: Mapped[str] = mapped_column(String(50), default="webchat")
    status: Mapped[str] = mapped_column(String(50), default="open")  # open|closed
    assigned_type: Mapped[str] = mapped_column(String(20), default="agent")  # agent|human
    csat: Mapped[int | None] = mapped_column(Integer, nullable=True)


class Message(TenantScoped, Base):
    __tablename__ = "messages"
    conversation_id: Mapped[str] = mapped_column(ForeignKey("conversations.id"), index=True)
    direction: Mapped[str] = mapped_column(String(10))  # in|out
    sender_type: Mapped[str] = mapped_column(String(20))  # contact|agent|human
    body: Mapped[str] = mapped_column(Text)
    intent: Mapped[str] = mapped_column(String(50), default="")
    sentiment: Mapped[str] = mapped_column(String(20), default="")


class ScheduledPost(TenantScoped, Base):
    """Content calendar entries — planned social posts per platform."""
    __tablename__ = "scheduled_posts"
    platform: Mapped[str] = mapped_column(String(30), default="instagram")
    # facebook|instagram|tiktok|youtube|xiaohongshu|other
    caption: Mapped[str] = mapped_column(Text, default="")
    media_url: Mapped[str] = mapped_column(String(500), default="")
    scheduled_at: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(20), default="scheduled")
    # scheduled|posted|skipped
    posted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Appointment(TenantScoped, Base):
    __tablename__ = "appointments"
    contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"))
    starts_at: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(30), default="proposed")
    # proposed|confirmed|completed|no_show|cancelled
    source: Mapped[str] = mapped_column(String(30), default="chat")
    notes: Mapped[str] = mapped_column(Text, default="")


class Invoice(TenantScoped, Base):
    __tablename__ = "invoices"
    contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"))
    deal_id: Mapped[str] = mapped_column(String(36), default="")
    total: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(30), default="sent")  # sent|paid|overdue
    due_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Payment(TenantScoped, Base):
    __tablename__ = "payments"
    invoice_id: Mapped[str] = mapped_column(ForeignKey("invoices.id"))
    amount: Mapped[float] = mapped_column(Float)
    method: Mapped[str] = mapped_column(String(50), default="link")
    paid_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Ticket(TenantScoped, Base):
    __tablename__ = "tickets"
    contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"))
    subject: Mapped[str] = mapped_column(String(300))
    priority: Mapped[str] = mapped_column(String(20), default="normal")
    status: Mapped[str] = mapped_column(String(30), default="open")  # open|escalated|resolved
    resolution: Mapped[str] = mapped_column(Text, default="")


class Task(TenantScoped, Base):
    """Unified tasks/reminders — the 'activities' table of doc 4."""
    __tablename__ = "tasks"
    kind: Mapped[str] = mapped_column(String(50), default="task")  # task|reminder|handoff
    title: Mapped[str] = mapped_column(String(300))
    entity_type: Mapped[str] = mapped_column(String(50), default="")
    entity_id: Mapped[str] = mapped_column(String(36), default="")
    assignee_role: Mapped[str] = mapped_column(String(50), default="manager")
    due_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    done_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ------------------------------------------------------------ Knowledge

class KnowledgeDoc(TenantScoped, Base):
    __tablename__ = "knowledge_docs"
    title: Mapped[str] = mapped_column(String(300))
    kind: Mapped[str] = mapped_column(String(50), default="faq")
    # sop|policy|product|script|faq|training|brand
    body: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="active")


class KnowledgeChunk(TenantScoped, Base):
    __tablename__ = "knowledge_chunks"
    doc_id: Mapped[str] = mapped_column(ForeignKey("knowledge_docs.id"), index=True)
    doc_title: Mapped[str] = mapped_column(String(300))
    doc_kind: Mapped[str] = mapped_column(String(50))
    text: Mapped[str] = mapped_column(Text)
    # Phase 1 retrieval is keyword-scored; a pgvector `embedding` column is
    # added by migration when moving to Postgres (doc 3).


# ------------------------------------------------------------ AI layer

class Agent(TenantScoped, Base):
    __tablename__ = "agents"
    key: Mapped[str] = mapped_column(String(50), index=True)  # sales, support, ...
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text, default="")
    system_prompt_ref: Mapped[str] = mapped_column(String(200))
    model_tier: Mapped[str] = mapped_column(String(20), default="frontier")  # frontier|small
    tools: Mapped[list] = mapped_column(JSON, default=list)
    knowledge_scope: Mapped[list] = mapped_column(JSON, default=list)
    autonomy: Mapped[str] = mapped_column(String(20), default="approve")  # draft|approve|auto
    guardrails: Mapped[dict] = mapped_column(JSON, default=dict)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class AgentRun(TenantScoped, Base):
    __tablename__ = "agent_runs"
    agent_id: Mapped[str] = mapped_column(ForeignKey("agents.id"), index=True)
    agent_key: Mapped[str] = mapped_column(String(50))
    trigger: Mapped[str] = mapped_column(String(100))
    input_text: Mapped[str] = mapped_column(Text, default="")
    output_text: Mapped[str] = mapped_column(Text, default="")
    tool_calls: Mapped[list] = mapped_column(JSON, default=list)
    tokens_in: Mapped[int] = mapped_column(Integer, default=0)
    tokens_out: Mapped[int] = mapped_column(Integer, default=0)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    outcome: Mapped[str] = mapped_column(String(30), default="success")
    # success|queued_approval|draft|handoff|guardrail_block|error
    error: Mapped[str] = mapped_column(Text, default="")


class ApprovalItem(TenantScoped, Base):
    __tablename__ = "approval_queue"
    agent_run_id: Mapped[str] = mapped_column(ForeignKey("agent_runs.id"))
    agent_key: Mapped[str] = mapped_column(String(50))
    kind: Mapped[str] = mapped_column(String(50))  # send_message|content|report
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    # pending|approved|rejected|edited
    reviewed_by: Mapped[str] = mapped_column(String(36), default="")
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ------------------------------------------------------ Events & audit

class Event(TenantScoped, Base):
    __tablename__ = "events"
    name: Mapped[str] = mapped_column(String(100), index=True)
    entity_type: Mapped[str] = mapped_column(String(50), default="")
    entity_id: Mapped[str] = mapped_column(String(36), default="")
    payload: Mapped[dict] = mapped_column(JSON, default=dict)


class AuditLog(TenantScoped, Base):
    __tablename__ = "audit_log"
    actor_type: Mapped[str] = mapped_column(String(20))  # user|agent|system
    actor_id: Mapped[str] = mapped_column(String(36), default="")
    action: Mapped[str] = mapped_column(String(100))
    entity_type: Mapped[str] = mapped_column(String(50), default="")
    entity_id: Mapped[str] = mapped_column(String(36), default="")
    detail: Mapped[dict] = mapped_column(JSON, default=dict)


class KpiDaily(TenantScoped, Base):
    __tablename__ = "kpi_daily"
    date: Mapped[str] = mapped_column(String(10), index=True)  # YYYY-MM-DD
    metric: Mapped[str] = mapped_column(String(50), index=True)
    value: Mapped[float] = mapped_column(Float, default=0.0)
