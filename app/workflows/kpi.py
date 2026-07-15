"""KPI materialization + Business Health Score (doc 6 §6.7).

`materialize_kpis` snapshots today's metrics into kpi_daily (idempotent
upsert); the dashboard and Analytics AI read from there, never from raw
tables — one source of truth for every number the CEO sees.
"""
from datetime import datetime, time, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (Agent, AgentRun, Appointment, ApprovalItem,
                        Conversation, Deal, KpiDaily, Lead, Message, Payment,
                        Task, Ticket, utcnow)


def _today_start() -> datetime:
    return datetime.combine(utcnow().date(), time.min)


def _upsert(session: Session, tenant_id: str, date: str, metric: str, value: float) -> None:
    row = session.scalar(select(KpiDaily).where(
        KpiDaily.tenant_id == tenant_id, KpiDaily.date == date, KpiDaily.metric == metric))
    if row is None:
        session.add(KpiDaily(tenant_id=tenant_id, date=date, metric=metric, value=value))
    else:
        row.value = value


def materialize_kpis(session: Session, tenant_id: str) -> dict[str, float]:
    start = _today_start()
    date = start.date().isoformat()

    def count(model, *conds) -> int:
        return session.scalar(select(func.count(model.id)).where(
            model.tenant_id == tenant_id, *conds)) or 0

    leads_today = count(Lead, Lead.created_at >= start)
    deals_won_today = count(Deal, Deal.stage == "won", Deal.created_at >= start)
    revenue_today = session.scalar(select(func.coalesce(func.sum(Payment.amount), 0.0)).where(
        Payment.tenant_id == tenant_id, Payment.paid_at >= start)) or 0.0
    total_leads = count(Lead)
    total_won = count(Deal, Deal.stage == "won")
    conversion = round(100.0 * total_won / total_leads, 1) if total_leads else 0.0
    pipeline_value = session.scalar(select(func.coalesce(func.sum(Deal.value), 0.0)).where(
        Deal.tenant_id == tenant_id, Deal.stage == "open")) or 0.0
    ai_cost_today = session.scalar(select(func.coalesce(func.sum(AgentRun.cost), 0.0)).where(
        AgentRun.tenant_id == tenant_id, AgentRun.created_at >= start)) or 0.0

    metrics = {
        "leads_today": float(leads_today),
        "deals_won_today": float(deals_won_today),
        "revenue_today": float(revenue_today),
        "conversion_rate": conversion,
        "pipeline_value": float(pipeline_value),
        "appointments_upcoming": float(count(Appointment, Appointment.status.in_(("proposed", "confirmed")),
                                             Appointment.starts_at >= utcnow())),
        "pending_tasks": float(count(Task, Task.done_at.is_(None))),
        "pending_approvals": float(count(ApprovalItem, ApprovalItem.status == "pending")),
        "open_tickets": float(count(Ticket, Ticket.status != "resolved")),
        "messages_today": float(count(Message, Message.created_at >= start)),
        "agent_runs_today": float(count(AgentRun, AgentRun.created_at >= start)),
        "ai_cost_today": round(ai_cost_today, 4),
    }
    for metric, value in metrics.items():
        _upsert(session, tenant_id, date, metric, value)
    return metrics


def health_score(session: Session, tenant_id: str, metrics: dict[str, float]) -> dict:
    """Business Health Score (doc 2 Phase 4, simplified for Phase 1):
    weighted components, each 0-100."""
    avg_csat = session.scalar(select(func.avg(Conversation.csat)).where(
        Conversation.tenant_id == tenant_id, Conversation.csat.is_not(None)))

    sales = min(100.0, metrics["leads_today"] * 10 + metrics["conversion_rate"])
    cash = min(100.0, 50 + metrics["revenue_today"] / 100)
    service = (avg_csat / 5 * 100) if avg_csat else (100.0 if metrics["open_tickets"] == 0 else
                                                     max(0.0, 100 - 15 * metrics["open_tickets"]))
    error_runs = session.scalar(select(func.count(AgentRun.id)).where(
        AgentRun.tenant_id == tenant_id, AgentRun.outcome == "error",
        AgentRun.created_at >= _today_start())) or 0
    total_runs = metrics["agent_runs_today"] or 1
    agents = max(0.0, 100 - 100 * error_runs / total_runs)

    components = {"sales": round(sales, 1), "cash": round(cash, 1),
                  "service": round(service, 1), "agents": round(agents, 1)}
    weights = {"sales": 0.35, "cash": 0.30, "service": 0.20, "agents": 0.15}
    overall = round(sum(components[k] * weights[k] for k in components), 1)
    risks = [k for k, v in components.items() if v < 50]
    return {"overall": overall, "components": components, "risks": risks}
