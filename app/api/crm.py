"""CRM + intake endpoints: leads, deals, conversations, and the two entry
points that start the money loop — the lead webhook and the inbound message."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import events
from app.agents.orchestrator import handle_inbound_message
from app.api.deps import get_tenant
from app.db import get_session
from app.models import (Appointment, Contact, Conversation, Deal, Invoice,
                        Lead, Message, Payment, Task, Tenant)
from app.workflows.lead_flow import create_lead_from_webhook

router = APIRouter(prefix="/api", tags=["crm"])


class LeadWebhook(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    source: str = "webform"
    channel: str = "webchat"
    message: str = ""


@router.post("/webhooks/lead")
def lead_webhook(body: LeadWebhook, tenant: Tenant = Depends(get_tenant),
                 session: Session = Depends(get_session)):
    lead = create_lead_from_webhook(session, tenant, name=body.name, phone=body.phone,
                                    email=body.email, source=body.source,
                                    channel=body.channel, message=body.message)
    session.commit()
    return {"lead_id": lead.id, "contact_id": lead.contact_id,
            "stage": lead.stage, "score": lead.score}


class InboundMessage(BaseModel):
    contact_id: str
    channel: str = "webchat"
    text: str


@router.post("/inbound/message")
def inbound_message(body: InboundMessage, tenant: Tenant = Depends(get_tenant),
                    session: Session = Depends(get_session)):
    contact = session.get(Contact, body.contact_id)
    if contact is None or contact.tenant_id != tenant.id:
        raise HTTPException(404, "contact not found")
    run = handle_inbound_message(session, tenant, contact, body.channel, body.text)
    session.commit()
    return {"agent_run_id": run.id if run else None,
            "outcome": run.outcome if run else "human_owned"}


@router.get("/leads")
def list_leads(tenant: Tenant = Depends(get_tenant),
               session: Session = Depends(get_session)):
    leads = session.scalars(select(Lead).where(Lead.tenant_id == tenant.id)
                            .order_by(Lead.created_at.desc()).limit(100)).all()
    return [{"id": l.id, "contact_id": l.contact_id, "source": l.source,
             "stage": l.stage, "score": l.score, "score_reasons": l.score_reasons}
            for l in leads]


@router.get("/conversations/{conversation_id}/messages")
def conversation_messages(conversation_id: str, tenant: Tenant = Depends(get_tenant),
                          session: Session = Depends(get_session)):
    conv = session.get(Conversation, conversation_id)
    if conv is None or conv.tenant_id != tenant.id:
        raise HTTPException(404, "conversation not found")
    msgs = session.scalars(select(Message).where(Message.conversation_id == conversation_id)
                           .order_by(Message.created_at)).all()
    return [{"direction": m.direction, "sender": m.sender_type, "body": m.body,
             "at": m.created_at.isoformat()} for m in msgs]


class DealCreate(BaseModel):
    lead_id: str
    title: str
    value: float
    currency: str = "USD"


@router.post("/deals")
def create_deal(body: DealCreate, tenant: Tenant = Depends(get_tenant),
                session: Session = Depends(get_session)):
    lead = session.get(Lead, body.lead_id)
    if lead is None or lead.tenant_id != tenant.id:
        raise HTTPException(404, "lead not found")
    deal = Deal(tenant_id=tenant.id, lead_id=lead.id, title=body.title,
                value=body.value, currency=body.currency)
    session.add(deal)
    session.commit()
    return {"deal_id": deal.id}


@router.post("/deals/{deal_id}/won")
def mark_deal_won(deal_id: str, tenant: Tenant = Depends(get_tenant),
                  session: Session = Depends(get_session)):
    deal = session.get(Deal, deal_id)
    if deal is None or deal.tenant_id != tenant.id:
        raise HTTPException(404, "deal not found")
    deal.stage = "won"
    events.publish(session, tenant.id, "deal.won", entity_type="deal", entity_id=deal.id,
                   payload={"value": deal.value})
    session.commit()
    invoice = session.scalar(select(Invoice).where(Invoice.deal_id == deal.id))
    return {"deal_id": deal.id, "invoice_id": invoice.id if invoice else None}


@router.post("/invoices/{invoice_id}/pay")
def pay_invoice(invoice_id: str, tenant: Tenant = Depends(get_tenant),
                session: Session = Depends(get_session)):
    """Stands in for the Stripe webhook (doc 9): payment confirmed -> event."""
    invoice = session.get(Invoice, invoice_id)
    if invoice is None or invoice.tenant_id != tenant.id:
        raise HTTPException(404, "invoice not found")
    if invoice.status == "paid":
        return {"invoice_id": invoice.id, "status": "paid"}
    invoice.status = "paid"
    session.add(Payment(tenant_id=tenant.id, invoice_id=invoice.id, amount=invoice.total))
    events.publish(session, tenant.id, "invoice.paid", entity_type="invoice",
                   entity_id=invoice.id, payload={"total": invoice.total})
    session.commit()
    return {"invoice_id": invoice.id, "status": "paid"}


@router.get("/tasks")
def list_tasks(tenant: Tenant = Depends(get_tenant),
               session: Session = Depends(get_session)):
    tasks = session.scalars(select(Task).where(Task.tenant_id == tenant.id,
                                               Task.done_at.is_(None))
                            .order_by(Task.due_at)).all()
    return [{"id": t.id, "kind": t.kind, "title": t.title, "assignee_role": t.assignee_role,
             "due_at": t.due_at.isoformat() if t.due_at else None} for t in tasks]


@router.get("/appointments")
def list_appointments(tenant: Tenant = Depends(get_tenant),
                      session: Session = Depends(get_session)):
    appts = session.scalars(select(Appointment).where(Appointment.tenant_id == tenant.id)
                            .order_by(Appointment.starts_at)).all()
    return [{"id": a.id, "contact_id": a.contact_id, "starts_at": a.starts_at.isoformat(),
             "status": a.status, "notes": a.notes} for a in appts]
