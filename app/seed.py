"""Provision a demo tenant with brand kit, knowledge base, and all AI
employees. Idempotent. Run: python -m app.seed"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents import rag
from app.agents.registry import sync_agents_for_tenant
from app.db import SessionLocal, init_db
from app.models import KnowledgeDoc, Tenant, User

DEMO_KNOWLEDGE = [
    ("Pricing & Packages", "product", """Our packages:

Starter — $500/month: social media management for 2 platforms, 12 posts per month, monthly report.

Growth — $1,200/month: 4 platforms, 30 posts per month, ad management up to $3,000 ad spend, weekly report, WhatsApp support.

Scale — $2,500/month: everything in Growth plus AI voice agent, CRM setup, landing pages, dedicated account manager.

All packages have no setup fee and a 30-day money-back guarantee. Discounts above 10% require manager approval."""),
    ("Appointment Policy", "faq", """Appointments can be booked on weekdays between 09:00 and 18:00.

Consultations are free and last 30 minutes. We confirm every appointment 24 hours ahead by WhatsApp and again 1 hour ahead by phone call. Rescheduling is free with 4 hours notice."""),
    ("Refund & Cancellation Policy", "policy", """Customers may cancel anytime with 30 days written notice.

The 30-day money-back guarantee applies to the first month of a new subscription only. Refunds are processed within 5 business days to the original payment method. Refund approval is handled by a human manager, never automatically."""),
    ("Common Login Issue Fix", "faq", """If a customer cannot log in to the client portal: 1) ask them to reset the password using the Forgot Password link, 2) check the caps lock key, 3) clear the browser cache. If the account shows as locked, it unlocks automatically after 15 minutes. If none of this works, open a ticket for the technical team."""),
    ("Sales Call Script", "script", """Opening: thank the prospect for their interest and ask what outcome they want to achieve in the next 90 days.

Qualification: budget band, current marketing spend, decision maker, timeline. Present the package that matches their goal, anchored to outcomes not features. Close: propose two concrete consultation slots."""),
]


def seed(session: Session) -> Tenant:
    tenant = session.scalar(select(Tenant).where(Tenant.name == "Demo Marketing Agency"))
    if tenant is None:
        tenant = Tenant(
            name="Demo Marketing Agency",
            plan="internal",
            brand_kit={
                "voice": "warm, confident, plain-spoken — like a helpful expert friend",
                "banned_words": ["synergy", "guru", "cheap"],
                "mission": "Make world-class marketing available to every small business.",
            },
        )
        session.add(tenant)
        session.flush()
        session.add(User(tenant_id=tenant.id, email="ceo@demo.local",
                         name="Demo CEO", role="ceo"))

    agents = sync_agents_for_tenant(session, tenant.id)

    existing_docs = session.scalar(select(KnowledgeDoc.id).where(
        KnowledgeDoc.tenant_id == tenant.id).limit(1))
    if existing_docs is None:
        for title, kind, body in DEMO_KNOWLEDGE:
            doc = KnowledgeDoc(tenant_id=tenant.id, title=title, kind=kind, body=body)
            session.add(doc)
            session.flush()
            rag.chunk_and_store(session, tenant.id, doc.id, title, kind, body)

    session.commit()
    print(f"Tenant: {tenant.name} ({tenant.id})")
    print(f"AI employees: {', '.join(sorted(a.key for a in agents))}")
    return tenant


if __name__ == "__main__":
    init_db()
    with SessionLocal() as session:
        seed(session)
