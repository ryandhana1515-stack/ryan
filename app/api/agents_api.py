"""Agent administration: the autonomy dial, the kill switch, the approval
queue, run history, and on-demand department agent tasks (marketing plans,
content, reports...)."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents.orchestrator import get_agent, run_agent, send_message
from app.api.deps import get_tenant
from app.audit import audit
from app.db import get_session
from app.models import (Agent, AgentRun, ApprovalItem, Conversation, Tenant,
                        utcnow)

router = APIRouter(prefix="/api", tags=["agents"])


@router.get("/agents")
def list_agents(tenant: Tenant = Depends(get_tenant),
                session: Session = Depends(get_session)):
    agents = session.scalars(select(Agent).where(Agent.tenant_id == tenant.id)
                             .order_by(Agent.key)).all()
    return [{"id": a.id, "key": a.key, "name": a.name, "description": a.description,
             "autonomy": a.autonomy, "active": a.active, "model_tier": a.model_tier,
             "tools": a.tools, "knowledge_scope": a.knowledge_scope} for a in agents]


class AgentPatch(BaseModel):
    autonomy: str | None = None  # draft|approve|auto
    active: bool | None = None   # False = kill switch


@router.patch("/agents/{agent_id}")
def patch_agent(agent_id: str, body: AgentPatch, tenant: Tenant = Depends(get_tenant),
                session: Session = Depends(get_session)):
    agent = session.get(Agent, agent_id)
    if agent is None or agent.tenant_id != tenant.id:
        raise HTTPException(404, "agent not found")
    if body.autonomy is not None:
        if body.autonomy not in ("draft", "approve", "auto"):
            raise HTTPException(422, "autonomy must be draft|approve|auto")
        if body.autonomy == "auto" and (agent.guardrails or {}).get("never_auto"):
            raise HTTPException(422, f"{agent.key} is on the never-auto list (see docs/08)")
        agent.autonomy = body.autonomy
    if body.active is not None:
        agent.active = body.active
    audit(session, tenant.id, "user", "", "agent_config_change",
          entity_type="agent", entity_id=agent.id,
          detail={"autonomy": agent.autonomy, "active": agent.active})
    session.commit()
    return {"id": agent.id, "autonomy": agent.autonomy, "active": agent.active}


class AgentTask(BaseModel):
    task: str


@router.post("/agents/{agent_key}/run")
def run_department_agent(agent_key: str, body: AgentTask,
                         tenant: Tenant = Depends(get_tenant),
                         session: Session = Depends(get_session)):
    """On-demand internal work: 'marketing, plan next month', 'content, write
    a TikTok script about X', 'sop, document our refund process'..."""
    agent = get_agent(session, tenant.id, agent_key)
    if agent is None:
        raise HTTPException(404, f"no agent '{agent_key}'")
    if not agent.active:
        raise HTTPException(409, f"agent '{agent_key}' is deactivated (kill switch)")
    run = run_agent(session, tenant, agent, body.task, trigger="manual_task")
    if run.outcome != "error":
        run.outcome = "draft"  # internal work products always land as drafts
    session.commit()
    return {"agent_run_id": run.id, "outcome": run.outcome, "output": run.output_text,
            "cost": run.cost, "latency_ms": run.latency_ms}


@router.get("/agent-runs")
def list_runs(limit: int = 50, tenant: Tenant = Depends(get_tenant),
              session: Session = Depends(get_session)):
    runs = session.scalars(select(AgentRun).where(AgentRun.tenant_id == tenant.id)
                           .order_by(AgentRun.created_at.desc()).limit(limit)).all()
    return [{"id": r.id, "agent": r.agent_key, "trigger": r.trigger, "outcome": r.outcome,
             "cost": r.cost, "latency_ms": r.latency_ms,
             "at": r.created_at.isoformat()} for r in runs]


# ------------------------------------------------------- approval queue

@router.get("/approvals")
def list_approvals(tenant: Tenant = Depends(get_tenant),
                   session: Session = Depends(get_session)):
    items = session.scalars(select(ApprovalItem)
                            .where(ApprovalItem.tenant_id == tenant.id,
                                   ApprovalItem.status == "pending")
                            .order_by(ApprovalItem.created_at)).all()
    return [{"id": i.id, "agent": i.agent_key, "kind": i.kind, "payload": i.payload,
             "at": i.created_at.isoformat()} for i in items]


class ApprovalDecision(BaseModel):
    edited_body: str | None = None  # human edits are gold — logged for prompt tuning


@router.post("/approvals/{item_id}/approve")
def approve(item_id: str, body: ApprovalDecision | None = None,
            tenant: Tenant = Depends(get_tenant),
            session: Session = Depends(get_session)):
    item = session.get(ApprovalItem, item_id)
    if item is None or item.tenant_id != tenant.id:
        raise HTTPException(404, "approval item not found")
    if item.status != "pending":
        raise HTTPException(409, f"already {item.status}")

    edited = bool(body and body.edited_body)
    if item.kind == "send_message":
        conv = session.get(Conversation, item.payload["conversation_id"])
        final_body = body.edited_body if edited else item.payload["body"]
        send_message(session, tenant.id, conv, final_body, sender_type="human" if edited else "agent")
    item.status = "edited" if edited else "approved"
    item.reviewed_at = utcnow()
    audit(session, tenant.id, "user", "", "approval_decision",
          entity_type="approval", entity_id=item.id, detail={"status": item.status})
    session.commit()
    return {"id": item.id, "status": item.status}


@router.post("/approvals/{item_id}/reject")
def reject(item_id: str, tenant: Tenant = Depends(get_tenant),
           session: Session = Depends(get_session)):
    item = session.get(ApprovalItem, item_id)
    if item is None or item.tenant_id != tenant.id:
        raise HTTPException(404, "approval item not found")
    if item.status != "pending":
        raise HTTPException(409, f"already {item.status}")
    item.status = "rejected"
    item.reviewed_at = utcnow()
    audit(session, tenant.id, "user", "", "approval_decision",
          entity_type="approval", entity_id=item.id, detail={"status": "rejected"})
    session.commit()
    return {"id": item.id, "status": "rejected"}
