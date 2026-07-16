"""End-to-end smoke tests (doc 10 §10.3): a lead flows through the whole
Phase 1 loop against the mock LLM — no network, no keys."""
import os

os.environ["AIBOS_MOCK_LLM"] = "1"
os.environ["DATABASE_URL"] = "sqlite://"  # in-memory

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db import SessionLocal, init_db
from app.main import app
from app.models import Agent, ApprovalItem, Appointment, Lead, Message, Task
from app.seed import seed
from app.workflows import register_all


@pytest.fixture(scope="module")
def client():
    init_db()
    register_all()
    with SessionLocal() as session:
        seed(session)
    with TestClient(app) as c:
        yield c


def test_all_department_agents_provisioned(client):
    agents = {a["key"] for a in client.get("/api/agents").json()}
    assert agents == {"sales", "support", "marketing", "branding", "content",
                      "social", "voice", "finance", "hr", "sop", "analytics",
                      "manager", "website", "image", "video", "seo", "sco", "guide"}


def test_lead_webhook_triggers_instant_sales_reply_in_approval_queue(client):
    r = client.post("/api/webhooks/lead", json={
        "name": "Test Buyer", "phone": "+100000001", "source": "fb_ad",
        "channel": "whatsapp", "message": "How much is the price of your package?"})
    assert r.status_code == 200
    lead = r.json()
    assert lead["score"] > 0  # sales AI scored it

    approvals = client.get("/api/approvals").json()
    assert any(a["agent"] == "sales" and a["kind"] == "send_message" for a in approvals)


def test_approve_releases_message(client):
    approvals = client.get("/api/approvals").json()
    item = next(a for a in approvals if a["agent"] == "sales")
    r = client.post(f"/api/approvals/{item['id']}/approve", json={})
    assert r.json()["status"] == "approved"

    msgs = client.get(
        f"/api/conversations/{item['payload']['conversation_id']}/messages").json()
    assert any(m["direction"] == "out" for m in msgs)


def test_booking_message_qualifies_lead_and_creates_appointment(client):
    r = client.post("/api/webhooks/lead", json={
        "name": "Ready Buyer", "phone": "+100000002", "source": "webform",
        "channel": "webchat", "message": "I want to book a demo appointment, what's the price?"})
    lead = r.json()
    assert lead["score"] >= 40

    with SessionLocal() as session:
        db_lead = session.get(Lead, lead["lead_id"])
        assert db_lead.stage == "appointment"
        appt = session.scalar(select(Appointment).where(
            Appointment.contact_id == lead["contact_id"]))
        assert appt is not None and appt.status == "proposed"
        reminder = session.scalar(select(Task).where(
            Task.kind == "reminder", Task.entity_id == appt.id))
        assert reminder is not None


def test_deal_won_creates_invoice_and_payment_spawns_onboarding(client):
    leads = client.get("/api/leads").json()
    deal = client.post("/api/deals", json={
        "lead_id": leads[0]["id"], "title": "Growth", "value": 1200}).json()
    won = client.post(f"/api/deals/{deal['deal_id']}/won").json()
    assert won["invoice_id"] is not None

    paid = client.post(f"/api/invoices/{won['invoice_id']}/pay").json()
    assert paid["status"] == "paid"

    tasks = client.get("/api/tasks").json()
    titles = {t["title"] for t in tasks}
    assert "Run customer onboarding checklist" in titles
    assert "Send review request" in titles


def test_support_intent_routes_to_support_agent_with_kb_answer(client):
    r = client.post("/api/webhooks/lead", json={
        "name": "Existing Customer", "phone": "+100000003",
        "channel": "webchat",
        "message": "I have a problem, I cannot login to the portal, please help"})
    assert r.status_code == 200
    with SessionLocal() as session:
        msg = session.scalar(select(Message).where(
            Message.direction == "out", Message.body.like("%Login%")))
        # support agent is autonomy=auto -> reply sent directly, citing the KB doc
        assert msg is not None


def test_kill_switch_and_never_auto(client):
    agents = client.get("/api/agents").json()
    finance = next(a for a in agents if a["key"] == "finance")
    r = client.patch(f"/api/agents/{finance['id']}", json={"autonomy": "auto"})
    assert r.status_code == 422  # finance is on the never-auto list

    sales = next(a for a in agents if a["key"] == "sales")
    r = client.patch(f"/api/agents/{sales['id']}", json={"active": False})
    assert r.json()["active"] is False
    client.patch(f"/api/agents/{sales['id']}", json={"active": True})


def test_guardrail_keyword_hands_off_to_human(client):
    r = client.post("/api/webhooks/lead", json={
        "name": "Angry Person", "phone": "+100000004", "channel": "webchat",
        "message": "This is a scam, I want my money back or I call my lawyer"})
    assert r.status_code == 200
    with SessionLocal() as session:
        handoff = session.scalar(select(Task).where(Task.kind == "handoff"))
        assert handoff is not None


def test_department_agent_on_demand_run(client):
    r = client.post("/api/agents/marketing/run",
                    json={"task": "Draft a one-week content calendar for Instagram."})
    assert r.status_code == 200
    body = r.json()
    assert body["outcome"] == "draft" and body["output"]


def test_knowledge_search_is_tenant_scoped_and_cited(client):
    hits = client.get("/api/knowledge/search", params={"q": "refund policy"}).json()
    assert hits and hits[0]["doc_title"] == "Refund & Cancellation Policy"


def test_dashboard_summary(client):
    s = client.get("/api/dashboard/summary").json()
    assert s["metrics"]["leads_today"] >= 3
    assert 0 <= s["health"]["overall"] <= 100
    assert len(s["agents"]) == 18


def test_manager_delegates_to_content_agent(client):
    r = client.post("/api/manager/chat", json={
        "message": "Write 3 Instagram captions about laser facials", "history": []})
    body = r.json()
    assert body["delegated_to"] == "content"
    assert body["reply"]


def test_manager_image_agent_returns_media(client):
    r = client.post("/api/manager/chat", json={
        "message": "Create an image of a modern clinic reception", "history": []})
    body = r.json()
    assert body["delegated_to"] == "image"
    assert body["media"] and body["media"][0]["url"].startswith("/generated/")
    file_resp = client.get(body["media"][0]["url"])
    assert file_resp.status_code == 200


def test_manager_website_agent_returns_page(client):
    r = client.post("/api/manager/chat", json={
        "message": "Make me a landing page for my July promo", "history": []})
    body = r.json()
    assert body["delegated_to"] == "website"
    assert body["artifacts"] and body["artifacts"][0]["url"].startswith("/generated/")
    page = client.get(body["artifacts"][0]["url"])
    assert page.status_code == 200 and b"<html" in page.content.lower()


def test_manager_plain_question_gets_direct_reply(client):
    r = client.post("/api/manager/chat", json={"message": "hello", "history": []})
    body = r.json()
    assert body["delegated_to"] is None and body["reply"]


def test_manager_comments_on_ai_employees_with_real_numbers(client):
    r = client.post("/api/manager/chat", json={
        "message": "How are my AI employees doing?", "history": []})
    body = r.json()
    assert body["delegated_to"] is None
    assert "Sales AI" in body["reply"] and "runs this week" in body["reply"]


def test_manager_business_status_uses_live_metrics(client):
    r = client.post("/api/manager/chat", json={
        "message": "How is the business doing today?", "history": []})
    body = r.json()
    assert body["delegated_to"] is None
    assert "Business Health Score" in body["reply"]


def test_manager_agentic_loop_chains_tools_then_replies(client, monkeypatch):
    """Simulates the real-LLM path: the manager calls two tools, receives
    their results in its transcript, then gives a final answer."""
    from app import config as cfg
    from app.agents import llm as llm_mod
    from app.agents import manager

    monkeypatch.setattr(cfg, "USE_MOCK_LLM", False)
    monkeypatch.setattr(cfg, "ANTHROPIC_API_KEY", "scripted")

    seen_prompts = []
    responses = iter([
        llm_mod.LLMResult('{"action": "tool", "tool": "list_agents", "args": {}}'),
        llm_mod.LLMResult('{"action": "tool", "tool": "get_business_summary", "args": {}}'),
        llm_mod.LLMResult('{"action": "reply", "message": "Assessment: sales agent is your workhorse."}'),
    ])

    def scripted(system, user, tier="frontier", max_tokens=1024):
        seen_prompts.append(user)
        return next(responses)

    monkeypatch.setattr(manager.llm, "complete", scripted)
    r = client.post("/api/manager/chat", json={
        "message": "Give me an assessment of my AI team", "history": []})
    body = r.json()
    assert body["reply"].startswith("Assessment:")
    # tool results were fed back into the loop's transcript
    assert "You called list_agents" in seen_prompts[1]
    assert "You called get_business_summary" in seen_prompts[2]


def test_daily_digest(client):
    r = client.post("/api/dashboard/daily-digest").json()
    assert r["digest"]


def test_media_resize_pack_produces_all_platform_sizes(client):
    import io

    from PIL import Image

    buf = io.BytesIO()
    Image.new("RGB", (2000, 1200), (40, 90, 200)).save(buf, "PNG")
    buf.seek(0)
    r = client.post("/api/media/resize-pack",
                    files={"file": ("promo.png", buf, "image/png")})
    assert r.status_code == 200
    pack = r.json()["pack"]
    assert len(pack) == 5
    assert {p["platform"] for p in pack} == {
        "facebook_instagram_feed", "square_post", "story_reel_tiktok",
        "youtube_thumbnail", "xiaohongshu"}
    for p in pack:
        assert client.get(p["url"]).status_code == 200


def test_public_signup_creates_lead_in_owner_tenant(client):
    r = client.post("/api/public/signup", json={
        "business": "Glow Studio", "name": "Mei Lin", "phone": "+6598765432",
        "email": "mei@glow.sg", "country": "Singapore", "plan": "growth",
        "message": "Automate my Instagram replies"})
    assert r.json()["ok"] is True
    leads = client.get("/api/leads").json()
    assert any(l["source"] == "omnix_signup" for l in leads)


def test_public_signup_honeypot_drops_bots(client):
    before = len(client.get("/api/leads").json())
    r = client.post("/api/public/signup", json={
        "business": "Bot Inc", "name": "Bot", "website": "spam.com"})
    assert r.json()["ok"] is True  # bot sees success, nothing stored
    assert len(client.get("/api/leads").json()) == before


def test_signup_page_public_when_locked(client, monkeypatch):
    from app import config as cfg

    monkeypatch.setattr(cfg, "ADMIN_PASSWORD", "secret123")
    assert client.get("/signup").status_code == 200
    assert client.get("/offer").status_code == 200
    assert client.get("/how").status_code == 200
    assert client.get("/agents?a=sales").status_code == 200
    assert client.get("/api/public/plans").status_code == 200


def test_admin_password_locks_the_app(client, monkeypatch):
    from app import config as cfg

    monkeypatch.setattr(cfg, "ADMIN_PASSWORD", "secret123")
    assert client.get("/api/agents").status_code == 401       # no password
    assert client.get("/health").status_code == 200           # health stays open
    assert client.get("/welcome").status_code == 200          # marketing page stays public
    ok = client.get("/api/agents", auth=("ceo", "secret123")) # correct password
    assert ok.status_code == 200
    bad = client.get("/api/agents", auth=("ceo", "wrong"))
    assert bad.status_code == 401


# ------------------------------------------------------ customer accounts

def test_register_creates_private_workspace_with_all_employees(client):
    with TestClient(app) as c:
        r = c.post("/api/auth/register", json={
            "business": "Glow Beauty Bar", "name": "Aisha",
            "email": "aisha@glowbar.com", "password": "sunshine88",
            "goal": "Automate my WhatsApp replies"})
        assert r.status_code == 200 and r.json()["ok"] is True

        me = c.get("/api/auth/me").json()
        assert me["tenant"] == "Glow Beauty Bar" and me["name"] == "Aisha"

        # her own 18 AI employees, provisioned instantly
        agents = c.get("/api/agents").json()
        assert len(agents) == 18

        # her knowledge base starts with her own brand doc, not the demo's
        hits = c.get("/api/knowledge/search", params={"q": "Glow Beauty Bar"}).json()
        assert hits and hits[0]["doc_title"] == "About Glow Beauty Bar"

    # dogfooding: the platform owner's tenant got her as a lead
    owner_leads = client.get("/api/leads").json()
    assert any(l["source"] == "omnix_account" for l in owner_leads)


def test_workspaces_are_isolated_between_customers(client):
    with TestClient(app) as c1, TestClient(app) as c2:
        c1.post("/api/auth/register", json={
            "business": "Studio One", "name": "One",
            "email": "one@studio.com", "password": "password1"})
        c2.post("/api/auth/register", json={
            "business": "Studio Two", "name": "Two",
            "email": "two@studio.com", "password": "password2"})

        lead = c1.post("/api/webhooks/lead", json={
            "name": "Private Customer", "phone": "+6511112222",
            "channel": "webchat", "message": "price please"}).json()

        ids1 = {l["id"] for l in c1.get("/api/leads").json()}
        ids2 = {l["id"] for l in c2.get("/api/leads").json()}
        assert lead["lead_id"] in ids1
        assert lead["lead_id"] not in ids2


def test_login_logout_and_wrong_password(client):
    with TestClient(app) as c:
        ok = c.post("/api/auth/login", json={
            "email": "aisha@glowbar.com", "password": "sunshine88"})
        assert ok.status_code == 200 and ok.json()["tenant"] == "Glow Beauty Bar"
        assert c.get("/api/auth/me").status_code == 200

        c.post("/api/auth/logout")
        assert c.get("/api/auth/me").status_code == 401

        bad = c.post("/api/auth/login", json={
            "email": "aisha@glowbar.com", "password": "wrong-pass"})
        assert bad.status_code == 401


def test_duplicate_email_rejected(client):
    with TestClient(app) as c:
        r = c.post("/api/auth/register", json={
            "business": "Copycat", "name": "Copy",
            "email": "aisha@glowbar.com", "password": "different99"})
        assert r.status_code == 409


def test_admin_password_signs_in_to_owner_workspace(client, monkeypatch):
    from app import config as cfg

    monkeypatch.setattr(cfg, "ADMIN_PASSWORD", "secret123")
    with TestClient(app) as c:
        r = c.post("/api/auth/login", json={
            "email": "founder@omnix.ai", "password": "secret123"})
        assert r.status_code == 200
        assert r.json()["tenant"] == "Demo Marketing Agency"  # first (owner) tenant


def test_team_owner_adds_member_who_shares_workspace(client):
    with TestClient(app) as owner:
        owner.post("/api/auth/register", json={
            "business": "Team Studio", "name": "Boss",
            "email": "boss@teamstudio.com", "password": "bosspass99"})
        r = owner.post("/api/team", json={
            "name": "Sarah", "email": "sarah@teamstudio.com",
            "password": "sarahpass1", "role": "manager"})
        assert r.status_code == 200
        emails = {u["email"] for u in owner.get("/api/team").json()}
        assert emails == {"boss@teamstudio.com", "sarah@teamstudio.com"}

    with TestClient(app) as member:
        r = member.post("/api/auth/login", json={
            "email": "sarah@teamstudio.com", "password": "sarahpass1"})
        assert r.json()["tenant"] == "Team Studio"  # same workspace
        # staff/managers cannot manage the team
        r = member.post("/api/team", json={
            "name": "X", "email": "x@teamstudio.com", "password": "xxxxxxxx"})
        assert r.status_code == 403


def test_team_owner_cannot_be_removed(client):
    with TestClient(app) as owner:
        owner.post("/api/auth/login", json={
            "email": "boss@teamstudio.com", "password": "bosspass99"})
        team = owner.get("/api/team").json()
        boss = next(u for u in team if u["is_owner"])
        sarah = next(u for u in team if not u["is_owner"])
        assert owner.delete(f"/api/team/{boss['id']}").status_code == 422
        assert owner.delete(f"/api/team/{sarah['id']}").json()["ok"] is True


def test_content_calendar_post_lifecycle(client):
    from datetime import timedelta

    from app.models import utcnow

    when = (utcnow() + timedelta(days=2)).isoformat()
    post = client.post("/api/calendar/posts", json={
        "platform": "tiktok", "caption": "New brow transformation 😍",
        "scheduled_at": when}).json()
    cal = client.get("/api/calendar").json()
    assert any(p["id"] == post["id"] and p["platform"] == "tiktok"
               for p in cal["posts"])
    assert "tiktok" in cal["platforms"]

    r = client.patch(f"/api/calendar/posts/{post['id']}", json={"status": "posted"})
    assert r.json()["status"] == "posted"
    assert client.delete(f"/api/calendar/posts/{post['id']}").json()["ok"] is True


def test_calendar_shows_appointments_alongside_posts(client):
    cal = client.get("/api/calendar?days=30").json()
    assert isinstance(cal["appointments"], list)  # booked demo appts flow in
    for a in cal["appointments"]:
        assert "contact" in a and "starts_at" in a


def test_locked_browser_page_redirects_to_login(client, monkeypatch):
    from app import config as cfg

    monkeypatch.setattr(cfg, "ADMIN_PASSWORD", "secret123")
    with TestClient(app) as c:
        r = c.get("/", headers={"accept": "text/html"}, follow_redirects=False)
        assert r.status_code == 303 and r.headers["location"] == "/login"
        assert c.get("/login").status_code == 200  # the door itself stays open
