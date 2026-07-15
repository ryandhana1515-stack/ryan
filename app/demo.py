"""End-to-end demo of the money loop, no server or API keys needed.
Run: AIBOS_MOCK_LLM=1 python -m app.demo
"""
from sqlalchemy import select

from app import events
from app.agents.orchestrator import handle_inbound_message
from app.db import SessionLocal, init_db
from app.models import (Appointment, ApprovalItem, Conversation, Deal,
                        Invoice, Lead, Message, Task)
from app.seed import seed
from app.workflows import register_all
from app.workflows.kpi import health_score, materialize_kpis
from app.workflows.lead_flow import create_lead_from_webhook


def show(title: str) -> None:
    print(f"\n{'=' * 8} {title} {'=' * 8}")


def main() -> None:
    init_db()
    register_all()
    with SessionLocal() as session:
        tenant = seed(session)

        show("1. Facebook ad lead arrives (webhook)")
        lead = create_lead_from_webhook(
            session, tenant, name="Aisha Rahman", phone="+60123456789",
            source="fb_ad", channel="whatsapp",
            message="Hi, how much is your social media package?")
        session.commit()
        print(f"lead stage={lead.stage} score={lead.score} reasons={lead.score_reasons}")

        show("2. Sales AI reply waits in the approval queue (autonomy=approve)")
        item = session.scalar(select(ApprovalItem).where(
            ApprovalItem.status == "pending").order_by(ApprovalItem.created_at.desc()))
        print(f"[{item.agent_key}] wants to send:\n{item.payload['body'][:300]}")

        show("3. CEO approves -> message goes out")
        from app.agents.orchestrator import send_message
        conv = session.get(Conversation, item.payload["conversation_id"])
        send_message(session, tenant.id, conv, item.payload["body"], "agent")
        item.status = "approved"
        session.commit()

        show("4. Customer wants to book -> lead qualifies -> appointment auto-proposed")
        contact_id = lead.contact_id
        from app.models import Contact
        contact = session.get(Contact, contact_id)
        handle_inbound_message(session, tenant, contact, "whatsapp",
                               "Sounds good, I want to book a demo appointment please")
        session.commit()
        session.refresh(lead)
        appt = session.scalar(select(Appointment).where(Appointment.contact_id == contact_id))
        print(f"lead stage={lead.stage} score={lead.score}")
        print(f"appointment: {appt.starts_at} status={appt.status}")
        reminder = session.scalar(select(Task).where(Task.kind == "reminder"))
        print(f"reminder task: {reminder.title} due {reminder.due_at}")

        show("5. Human closer wins the deal -> invoice auto-created")
        deal = Deal(tenant_id=tenant.id, lead_id=lead.id, title="Growth package", value=1200.0)
        session.add(deal)
        session.flush()
        deal.stage = "won"
        events.publish(session, tenant.id, "deal.won", entity_type="deal",
                       entity_id=deal.id, payload={"value": deal.value})
        session.commit()
        invoice = session.scalar(select(Invoice).where(Invoice.deal_id == deal.id))
        print(f"invoice: ${invoice.total} status={invoice.status} due={invoice.due_at}")

        show("6. Payment webhook -> onboarding + review request spawned")
        invoice.status = "paid"
        from app.models import Payment
        session.add(Payment(tenant_id=tenant.id, invoice_id=invoice.id, amount=invoice.total))
        events.publish(session, tenant.id, "invoice.paid", entity_type="invoice",
                       entity_id=invoice.id, payload={"total": invoice.total})
        session.commit()
        for t in session.scalars(select(Task).where(Task.kind == "task")).all():
            print(f"task: {t.title} (assignee: {t.assignee_role})")

        show("7. CEO Dashboard numbers")
        metrics = materialize_kpis(session, tenant.id)
        health = health_score(session, tenant.id, metrics)
        session.commit()
        for k, v in metrics.items():
            print(f"  {k:26s} {v}")
        print(f"  Business Health Score: {health['overall']} {health['components']}")

        show("Full conversation transcript")
        msgs = session.scalars(select(Message).join(
            Conversation, Message.conversation_id == Conversation.id)
            .where(Conversation.contact_id == contact_id)
            .order_by(Message.created_at)).all()
        for m in msgs:
            who = "Customer" if m.direction == "in" else f"{m.sender_type.title()} (us)"
            print(f"  {who}: {m.body.splitlines()[0][:110]}")


if __name__ == "__main__":
    main()
