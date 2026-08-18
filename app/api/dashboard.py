"""CEO Dashboard API (doc 1 Layer 5): every tile in one summary call, plus
the Analytics AI daily digest."""
import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents.orchestrator import get_agent, run_agent
from app.api.deps import get_tenant
from app.db import get_session
from app.models import Agent, AgentRun, Tenant
from app.workflows.kpi import health_score, materialize_kpis

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(tenant: Tenant = Depends(get_tenant),
            session: Session = Depends(get_session)):
    metrics = materialize_kpis(session, tenant.id)
    health = health_score(session, tenant.id, metrics)

    agents = session.scalars(select(Agent).where(Agent.tenant_id == tenant.id)
                             .order_by(Agent.key)).all()
    agent_status = []
    for a in agents:
        runs_today = session.scalar(
            select(AgentRun.id).where(AgentRun.agent_id == a.id).limit(1))
        agent_status.append({"key": a.key, "name": a.name, "autonomy": a.autonomy,
                             "active": a.active, "has_activity": runs_today is not None})
    session.commit()
    return {"tenant": tenant.name, "metrics": metrics, "health": health,
            "agents": agent_status}


@router.post("/daily-digest")
def daily_digest(tenant: Tenant = Depends(get_tenant),
                 session: Session = Depends(get_session)):
    """W5: the Analytics AI narrates today's numbers for the CEO."""
    metrics = materialize_kpis(session, tenant.id)
    health = health_score(session, tenant.id, metrics)
    agent = get_agent(session, tenant.id, "analytics")
    if agent is None:
        return {"digest": None, "metrics": metrics, "health": health}
    task = ("Write the CEO daily digest from this data:\n"
            f"METRICS: {json.dumps(metrics)}\nHEALTH: {json.dumps(health)}")
    run = run_agent(session, tenant, agent, task, trigger="daily_digest")
    session.commit()
    return {"digest": run.output_text, "metrics": metrics, "health": health}
