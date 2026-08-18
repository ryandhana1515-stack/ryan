"""The Agent Orchestrator (doc 1 §1.4 / doc 5 §5.2): single entry point for
all AI work. Routes inbound items to department agents, loads context (brand
kit + RAG + CRM timeline), enforces guardrails and the autonomy policy
(draft -> approve -> auto), manages human handoffs, and logs every run for
audit and the CEO dashboard.
"""
import json
import re
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import config, events
from app.agents import llm, rag
from app.agents.registry import read_prompt
from app.audit import audit
from app.models import (Agent, AgentRun, ApprovalItem, Contact, Conversation,
                        Lead, Message, Task, Ticket, utcnow)

ESCALATE_MARKER = "[ESCALATE]"
LEAD_MARKER = "[LEAD]"


# ------------------------------------------------------------- context

def _brand(tenant) -> dict:
    kit = tenant.brand_kit or {}
    return {
        "company_name": tenant.name,
        "brand_voice": kit.get("voice", "friendly, professional, concise"),
        "banned_words": ", ".join(kit.get("banned_words", [])) or "(none)",
    }


def _timeline(session: Session, tenant_id: str, contact_id: str, limit: int = 10) -> str:
    msgs = session.scalars(
        select(Message).join(Conversation, Message.conversation_id == Conversation.id)
        .where(Conversation.contact_id == contact_id, Message.tenant_id == tenant_id)
        .order_by(Message.created_at.desc()).limit(limit)).all()
    lines = []
    for m in reversed(msgs):
        who = "Customer" if m.direction == "in" else "Us"
        lines.append(f"{who}: {m.body}")
    return "\n".join(lines) or "(no history)"


def build_system_prompt(session: Session, tenant, agent: Agent, query: str,
                        contact_id: str | None = None) -> str:
    chunks = rag.retrieve(session, tenant.id, query, scope=agent.knowledge_scope or None)
    rag_context = "\n\n".join(f"[KB:{c.doc_title}]\n{c.text}" for c in chunks) or "(no matching documents)"
    timeline = _timeline(session, tenant.id, contact_id) if contact_id else "(n/a)"
    core = read_prompt("prompts/shared_core.md").format(
        agent_name=agent.name,
        guardrails=json.dumps(agent.guardrails or {}),
        rag_context=rag_context,
        crm_timeline=timeline,
        **_brand(tenant),
    )
    return core + "\n\n" + read_prompt(agent.system_prompt_ref)


# ----------------------------------------------------------- guardrails

def _daily_agent_messages(session: Session, tenant_id: str, agent_id: str) -> int:
    since = utcnow() - timedelta(days=1)
    return session.scalar(
        select(func.count(AgentRun.id)).where(
            AgentRun.tenant_id == tenant_id, AgentRun.agent_id == agent_id,
            AgentRun.created_at >= since)) or 0


def _daily_cost(session: Session, tenant_id: str) -> float:
    since = utcnow() - timedelta(days=1)
    return session.scalar(
        select(func.coalesce(func.sum(AgentRun.cost), 0.0)).where(
            AgentRun.tenant_id == tenant_id, AgentRun.created_at >= since)) or 0.0


def check_guardrails(session: Session, tenant_id: str, agent: Agent, inbound_text: str) -> str | None:
    """Deterministic pre-flight checks (doc 8 §8.4). Returns a block reason or None."""
    if not agent.active:
        return "agent_killed"
    if _daily_agent_messages(session, tenant_id, agent.id) >= config.MAX_MESSAGES_PER_AGENT_PER_DAY:
        return "daily_message_cap"
    if _daily_cost(session, tenant_id) >= config.MAX_AI_COST_PER_TENANT_PER_DAY:
        return "daily_cost_cap"
    for kw in (agent.guardrails or {}).get("escalate_keywords", []):
        if kw.lower() in inbound_text.lower():
            return f"escalate_keyword:{kw}"
    return None


# ---------------------------------------------------------------- runs

def _parse_side_channel(text: str) -> tuple[str, dict]:
    """Split an agent reply from its trailing ```json side-channel block."""
    m = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if not m:
        return text.strip(), {}
    try:
        side = json.loads(m.group(1))
    except json.JSONDecodeError:
        side = {}
    return text[:m.start()].strip(), side


def run_agent(session: Session, tenant, agent: Agent, task_text: str, *,
              trigger: str, contact_id: str | None = None) -> AgentRun:
    """One agent execution loop (doc 5 §5.1 diagram): context -> LLM -> log."""
    start = time.monotonic()
    system = build_system_prompt(session, tenant, agent, task_text, contact_id)
    run = AgentRun(tenant_id=tenant.id, agent_id=agent.id, agent_key=agent.key,
                   trigger=trigger, input_text=task_text)
    try:
        result = llm.complete(system, task_text, tier=agent.model_tier)
        run.output_text = result.text
        run.tokens_in, run.tokens_out, run.cost = result.tokens_in, result.tokens_out, result.cost
    except Exception as exc:  # provider outage degrades gracefully (doc 9 §9.3)
        run.outcome, run.error = "error", str(exc)[:2000]
    run.latency_ms = int((time.monotonic() - start) * 1000)
    session.add(run)
    session.flush()
    audit(session, tenant.id, "agent", agent.id, f"agent_run:{agent.key}",
          entity_type="agent_run", entity_id=run.id, detail={"trigger": trigger})
    return run


def _release_output(session: Session, tenant, agent: Agent, run: AgentRun,
                    conversation: Conversation, reply_text: str) -> None:
    """Apply the autonomy policy to an outward-facing reply."""
    never_auto = (agent.guardrails or {}).get("never_auto")
    autonomy = "approve" if (never_auto and agent.autonomy == "auto") else agent.autonomy

    if autonomy == "auto":
        send_message(session, tenant.id, conversation, reply_text, sender_type="agent")
        run.outcome = "success"
    elif autonomy == "approve":
        session.add(ApprovalItem(
            tenant_id=tenant.id, agent_run_id=run.id, agent_key=agent.key,
            kind="send_message",
            payload={"conversation_id": conversation.id, "body": reply_text}))
        run.outcome = "queued_approval"
    else:  # draft
        run.outcome = "draft"


def send_message(session: Session, tenant_id: str, conversation: Conversation,
                 body: str, sender_type: str) -> Message:
    msg = Message(tenant_id=tenant_id, conversation_id=conversation.id,
                  direction="out", sender_type=sender_type, body=body)
    session.add(msg)
    session.flush()
    events.publish(session, tenant_id, "message.sent",
                   entity_type="message", entity_id=msg.id,
                   payload={"conversation_id": conversation.id, "sender_type": sender_type})
    return msg


def handoff_to_human(session: Session, tenant_id: str, conversation: Conversation,
                     reason: str, summary: str) -> Task:
    """Structured handoff packet (doc 5 §5.2) — a human takes the thread."""
    conversation.assigned_type = "human"
    task = Task(tenant_id=tenant_id, kind="handoff",
                title=f"Take over conversation ({reason})",
                entity_type="conversation", entity_id=conversation.id,
                assignee_role="manager", due_at=utcnow())
    session.add(task)
    session.flush()
    events.publish(session, tenant_id, "agent.handoff_requested",
                   entity_type="conversation", entity_id=conversation.id,
                   payload={"reason": reason, "summary": summary[:500]})
    return task


# ------------------------------------------------------------- routing

def route_intent(text: str) -> str:
    """Cheap-model intent router (doc 5 §5.2)."""
    result = llm.complete(read_prompt("prompts/router.md"), text, tier="small", max_tokens=10)
    intent = result.text.strip().lower()
    return intent if intent in ("sales", "support") else "sales"


def get_agent(session: Session, tenant_id: str, key: str) -> Agent | None:
    return session.scalar(select(Agent).where(
        Agent.tenant_id == tenant_id, Agent.key == key))


def handle_inbound_message(session: Session, tenant, contact: Contact,
                           channel: str, text: str) -> AgentRun | None:
    """Main entry point: customer message in any channel -> routed agent reply.

    This is workflow W1/W2 (doc 6): instant response + qualification.
    """
    conversation = session.scalar(
        select(Conversation).where(Conversation.tenant_id == tenant.id,
                                   Conversation.contact_id == contact.id,
                                   Conversation.channel == channel,
                                   Conversation.status == "open"))
    if conversation is None:
        conversation = Conversation(tenant_id=tenant.id, contact_id=contact.id, channel=channel)
        session.add(conversation)
        session.flush()

    intent = route_intent(text)
    inbound = Message(tenant_id=tenant.id, conversation_id=conversation.id,
                      direction="in", sender_type="contact", body=text, intent=intent)
    session.add(inbound)
    session.flush()
    events.publish(session, tenant.id, "message.received",
                   entity_type="message", entity_id=inbound.id,
                   payload={"conversation_id": conversation.id, "intent": intent})

    if conversation.assigned_type == "human":
        return None  # a human owns this thread; agents stay out

    agent = get_agent(session, tenant.id, intent)
    if agent is None:
        handoff_to_human(session, tenant.id, conversation, "no_agent", text)
        return None

    block = check_guardrails(session, tenant.id, agent, text)
    if block:
        handoff_to_human(session, tenant.id, conversation, block, text)
        run = AgentRun(tenant_id=tenant.id, agent_id=agent.id, agent_key=agent.key,
                       trigger="inbound_message", input_text=text, outcome="guardrail_block",
                       error=block)
        session.add(run)
        session.flush()
        return run

    run = run_agent(session, tenant, agent, text, trigger="inbound_message",
                    contact_id=contact.id)
    if run.outcome == "error":
        handoff_to_human(session, tenant.id, conversation, "agent_error", text)
        return run

    reply, side = _parse_side_channel(run.output_text)

    if ESCALATE_MARKER in reply:
        reply = reply.replace(ESCALATE_MARKER, "").strip()
        if agent.key == "support":
            _open_ticket(session, tenant.id, contact, conversation, text)
        handoff_to_human(session, tenant.id, conversation, "agent_escalation", reply or text)
        run.outcome = "handoff"
        if reply:
            _release_output(session, tenant, agent, run, conversation, reply)
            if run.outcome == "success":
                run.outcome = "handoff"
        return run

    if agent.key == "sales":
        _apply_sales_side_channel(session, tenant, contact, side)

    if reply:
        _release_output(session, tenant, agent, run, conversation, reply)
    return run


def _open_ticket(session: Session, tenant_id: str, contact: Contact,
                 conversation: Conversation, text: str) -> Ticket:
    ticket = Ticket(tenant_id=tenant_id, contact_id=contact.id,
                    subject=text[:280], status="escalated")
    session.add(ticket)
    session.flush()
    events.publish(session, tenant_id, "ticket.escalated",
                   entity_type="ticket", entity_id=ticket.id,
                   payload={"conversation_id": conversation.id})
    return ticket


def _apply_sales_side_channel(session: Session, tenant, contact: Contact, side: dict) -> None:
    """Persist the Sales AI's structured scoring (doc 7 §7.1) to the lead."""
    if not side:
        return
    lead = session.scalar(
        select(Lead).where(Lead.tenant_id == tenant.id, Lead.contact_id == contact.id)
        .order_by(Lead.created_at.desc()))
    if lead is None:
        return
    lead.score = int(side.get("score", lead.score))
    lead.score_reasons = side.get("score_reasons", lead.score_reasons)
    lead.last_activity_at = utcnow()
    if lead.stage == "new":
        lead.stage = "engaging"
    publish = False
    if lead.score >= 40 and lead.stage == "engaging":
        lead.stage = "qualified"
        publish = True
    # a booking request on an already-qualified lead must still fire the
    # appointment workflow (the subscriber dedupes existing appointments)
    if side.get("next_action") == "book_appointment" and lead.stage == "qualified":
        publish = True
    if publish:
        events.publish(session, tenant.id, "lead.qualified",
                       entity_type="lead", entity_id=lead.id,
                       payload={"score": lead.score,
                                "next_action": side.get("next_action", "")})
