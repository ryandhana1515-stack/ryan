"""The money loop (doc 6 §6.1), Phase 1 slice: qualification -> appointment
-> reminders -> deal won -> invoice -> payment -> onboarding + review request.
Each step is a small subscriber on the event bus; that is the whole trick —
departments never call each other directly.
"""
from datetime import datetime, time, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import events
from app.models import (Appointment, Contact, Deal, Event, Invoice, Lead,
                        Task, Tenant, utcnow)


def _tomorrow_at(hour: int) -> datetime:
    tomorrow = (utcnow() + timedelta(days=1)).date()
    return datetime.combine(tomorrow, time(hour=hour), tzinfo=timezone.utc).replace(tzinfo=None)


def on_lead_qualified(session: Session, event: Event) -> None:
    """W3: a qualified lead who asked to book gets a proposed appointment."""
    if event.payload.get("next_action") != "book_appointment":
        return
    lead = session.get(Lead, event.entity_id)
    if lead is None:
        return
    existing = session.scalar(select(Appointment).where(
        Appointment.tenant_id == event.tenant_id,
        Appointment.contact_id == lead.contact_id,
        Appointment.status.in_(("proposed", "confirmed"))))
    if existing:
        return
    appt = Appointment(tenant_id=event.tenant_id, contact_id=lead.contact_id,
                       starts_at=_tomorrow_at(10), status="proposed", source="chat",
                       notes=f"Auto-proposed from qualified lead (score {lead.score})")
    session.add(appt)
    lead.stage = "appointment"
    session.flush()
    events.publish(session, event.tenant_id, "appointment.booked",
                   entity_type="appointment", entity_id=appt.id,
                   payload={"contact_id": lead.contact_id})


def on_appointment_booked(session: Session, event: Event) -> None:
    """W3: reminder task 24h ahead (sent via Voice/WhatsApp when connected)."""
    appt = session.get(Appointment, event.entity_id)
    if appt is None:
        return
    session.add(Task(tenant_id=event.tenant_id, kind="reminder",
                     title="Send appointment reminder (WhatsApp + voice)",
                     entity_type="appointment", entity_id=appt.id,
                     assignee_role="sales",
                     due_at=appt.starts_at - timedelta(hours=24)))


def on_deal_won(session: Session, event: Event) -> None:
    """W9: quote accepted -> invoice with payment link."""
    deal = session.get(Deal, event.entity_id)
    if deal is None:
        return
    lead = session.get(Lead, deal.lead_id)
    invoice = Invoice(tenant_id=event.tenant_id,
                      contact_id=lead.contact_id if lead else "",
                      deal_id=deal.id, total=deal.value, status="sent",
                      due_at=utcnow() + timedelta(days=7))
    session.add(invoice)
    if lead:
        lead.stage = "won"
    session.flush()
    events.publish(session, event.tenant_id, "invoice.created",
                   entity_type="invoice", entity_id=invoice.id,
                   payload={"total": invoice.total})


def on_invoice_paid(session: Session, event: Event) -> None:
    """W11/W12: payment -> onboarding checklist + timed review request."""
    invoice = session.get(Invoice, event.entity_id)
    if invoice is None:
        return
    session.add(Task(tenant_id=event.tenant_id, kind="task",
                     title="Run customer onboarding checklist",
                     entity_type="contact", entity_id=invoice.contact_id,
                     assignee_role="support", due_at=utcnow() + timedelta(days=1)))
    session.add(Task(tenant_id=event.tenant_id, kind="task",
                     title="Send review request",
                     entity_type="contact", entity_id=invoice.contact_id,
                     assignee_role="marketing", due_at=utcnow() + timedelta(days=7)))


def register() -> None:
    events.subscribe("lead.qualified", on_lead_qualified)
    events.subscribe("appointment.booked", on_appointment_booked)
    events.subscribe("deal.won", on_deal_won)
    events.subscribe("invoice.paid", on_invoice_paid)


# --------------------------------------------------------------- intake

def create_lead_from_webhook(session: Session, tenant: Tenant, *, name: str,
                             phone: str = "", email: str = "", source: str = "webform",
                             channel: str = "webchat", message: str = "") -> Lead:
    """W1 entry point: ad/webform webhook -> contact + lead + instant AI reply."""
    contact = None
    if phone or email:
        stmt = select(Contact).where(Contact.tenant_id == tenant.id)
        if phone:
            stmt = stmt.where(Contact.phone == phone)
        else:
            stmt = stmt.where(Contact.email == email)
        contact = session.scalar(stmt)
    if contact is None:
        contact = Contact(tenant_id=tenant.id, name=name, phone=phone, email=email)
        session.add(contact)
        session.flush()

    lead = Lead(tenant_id=tenant.id, contact_id=contact.id, source=source, channel=channel)
    session.add(lead)
    session.flush()
    events.publish(session, tenant.id, "lead.created",
                   entity_type="lead", entity_id=lead.id,
                   payload={"source": source, "channel": channel})

    if message:
        from app.agents.orchestrator import handle_inbound_message

        handle_inbound_message(session, tenant, contact, channel, message)
    return lead
