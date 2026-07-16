"""Manager AI — the single chat interface for the CEO (the 'agent in
control'). A tool-using agentic loop: it can inspect live business data
(KPIs, agent performance, approvals, leads, knowledge) across multiple
steps, delegate production work to department agents, and then answer with
real numbers — like a chief of staff, not a router.

With no LLM key the offline fallback still answers status questions from
real database numbers and keyword-routes delegation, so nothing dead-ends.
"""
import json
import re
import time
import uuid
from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import config
from app.agents import llm, media, rag
from app.agents.orchestrator import (_parse_side_channel, get_agent,
                                     run_agent)
from app.agents.registry import load_agent_configs, read_prompt
from app.models import (Agent, AgentRun, ApprovalItem, Lead, utcnow)
from app.workflows.kpi import health_score, materialize_kpis

MEDIA_AGENTS = ("image", "video")
MAX_STEPS = 6

# ------------------------------------------------------------------ tools


def _tool_get_business_summary(session: Session, tenant, args: dict) -> dict:
    metrics = materialize_kpis(session, tenant.id)
    health = health_score(session, tenant.id, metrics)
    return {"metrics": metrics, "health": health}


def _tool_list_agents(session: Session, tenant, args: dict) -> list[dict]:
    since = utcnow() - timedelta(days=7)
    agents = session.scalars(select(Agent).where(Agent.tenant_id == tenant.id)
                             .order_by(Agent.key)).all()
    out = []
    for a in agents:
        if a.key == "manager":
            continue
        runs = session.scalar(select(func.count(AgentRun.id)).where(
            AgentRun.agent_id == a.id, AgentRun.created_at >= since)) or 0
        errors = session.scalar(select(func.count(AgentRun.id)).where(
            AgentRun.agent_id == a.id, AgentRun.created_at >= since,
            AgentRun.outcome == "error")) or 0
        cost = session.scalar(select(func.coalesce(func.sum(AgentRun.cost), 0.0)).where(
            AgentRun.agent_id == a.id, AgentRun.created_at >= since)) or 0.0
        pending = session.scalar(select(func.count(ApprovalItem.id)).where(
            ApprovalItem.tenant_id == tenant.id, ApprovalItem.agent_key == a.key,
            ApprovalItem.status == "pending")) or 0
        out.append({"key": a.key, "name": a.name, "autonomy": a.autonomy,
                    "active": a.active, "runs_7d": runs, "errors_7d": errors,
                    "cost_7d": round(cost, 4), "pending_approvals": pending})
    return out


def _tool_get_agent_activity(session: Session, tenant, args: dict) -> list[dict]:
    key = args.get("agent", "")
    limit = min(int(args.get("limit", 5) or 5), 10)
    runs = session.scalars(select(AgentRun).where(
        AgentRun.tenant_id == tenant.id, AgentRun.agent_key == key)
        .order_by(AgentRun.created_at.desc()).limit(limit)).all()
    return [{"at": r.created_at.isoformat(), "trigger": r.trigger,
             "outcome": r.outcome, "cost": r.cost, "latency_ms": r.latency_ms,
             "task": r.input_text[:200], "output": r.output_text[:300],
             "error": r.error[:200] if r.error else ""} for r in runs]


def _tool_list_pending_approvals(session: Session, tenant, args: dict) -> list[dict]:
    items = session.scalars(select(ApprovalItem).where(
        ApprovalItem.tenant_id == tenant.id, ApprovalItem.status == "pending")
        .order_by(ApprovalItem.created_at)).all()
    return [{"agent": i.agent_key, "kind": i.kind,
             "content": str(i.payload.get("body", i.payload))[:200]} for i in items]


def _tool_list_recent_leads(session: Session, tenant, args: dict) -> list[dict]:
    limit = min(int(args.get("limit", 10) or 10), 25)
    leads = session.scalars(select(Lead).where(Lead.tenant_id == tenant.id)
                            .order_by(Lead.created_at.desc()).limit(limit)).all()
    return [{"source": l.source, "channel": l.channel, "stage": l.stage,
             "score": l.score, "at": l.created_at.isoformat()} for l in leads]


def _tool_search_knowledge(session: Session, tenant, args: dict) -> list[dict]:
    chunks = rag.retrieve(session, tenant.id, args.get("query", ""), top_k=3)
    return [{"doc": c.doc_title, "kind": c.doc_kind, "text": c.text[:400]} for c in chunks]


TOOLS = {
    "get_business_summary": _tool_get_business_summary,
    "list_agents": _tool_list_agents,
    "get_agent_activity": _tool_get_agent_activity,
    "list_pending_approvals": _tool_list_pending_approvals,
    "list_recent_leads": _tool_list_recent_leads,
    "search_knowledge": _tool_search_knowledge,
}

# ------------------------------------------------------------ LLM decide


def _roster_text() -> str:
    lines = []
    for cfg in load_agent_configs():
        if cfg["key"] == "manager":
            continue
        lines.append(f"- {cfg['key']} — {cfg.get('description', '')}")
    return "\n".join(lines)


def _parse_action(text: str) -> dict | None:
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        return None
    try:
        decision = json.loads(m.group(0))
    except json.JSONDecodeError:
        return None
    return decision if decision.get("action") in ("tool", "delegate", "reply") else None


def _decide_llm(session: Session, tenant, message: str, history: list[dict]) -> dict:
    """Agentic loop: the manager may chain tool calls before its final
    decision. Tool results are appended to a working transcript each step."""
    # .replace, not .format — the prompt contains literal JSON braces
    system = read_prompt("prompts/manager_system.md").replace("{agent_roster}", _roster_text())
    convo = "\n".join(f"{m.get('role', 'user')}: {m.get('content', '')}"
                      for m in history[-12:])
    transcript: list[str] = []
    if convo:
        transcript.append(f"Conversation so far:\n{convo}")
    transcript.append(f"CEO's new message: {message}")

    for _step in range(MAX_STEPS):
        user = "\n\n".join(transcript) + "\n\nRespond with exactly one JSON action."
        result = llm.complete(system, user, tier="frontier", max_tokens=900)
        decision = _parse_action(result.text)
        if decision is None:
            return {"action": "reply",
                    "message": result.text.strip() or "Could you rephrase that?"}
        if decision["action"] != "tool":
            return decision
        name = decision.get("tool", "")
        fn = TOOLS.get(name)
        if fn is None:
            transcript.append(f"Tool call failed: unknown tool '{name}'.")
            continue
        try:
            output = fn(session, tenant, decision.get("args") or {})
            payload = json.dumps(output, default=str)[:1800]
        except Exception as exc:
            payload = f"error: {str(exc)[:200]}"
        transcript.append(f"You called {name} -> {payload}")

    return {"action": "reply",
            "message": "I dug through the data but ran out of steps — ask me that "
                       "again more specifically and I'll get straight to it."}


# ------------------------------------------------------------- offline

_KEYWORD_ROUTES: list[tuple[tuple[str, ...], str]] = [
    (("image", "photo", "picture", "logo", "visual", "poster"), "image"),
    (("video", "reel", "clip", "animation"), "video"),
    (("guide me", "how do i", "step by step", "set up", "register", "create an account",
      "walk me through", "teach me"), "guide"),
    (("seo", "keyword", "rank on google", "backlink", "google business"), "seo"),
    (("sco", "search channel", "amazon listing", "tiktok search", "youtube title", "app store"), "sco"),
    (("website", "landing page", "web page", "webpage", "site"), "website"),
    (("tiktok", "instagram", "post", "caption", "blog", "email", "hashtag", "content", "script"), "content"),
    (("plan", "campaign", "calendar", "marketing", "persona", "competitor"), "marketing"),
    (("brand", "mission", "vision", "story", "positioning", "name for"), "branding"),
    (("call", "phone", "voicemail"), "voice"),
    (("finance", "revenue", "expense", "cash", "profit"), "finance"),
    (("hire", "hiring", "job", "resume", "recruit", "onboard"), "hr"),
    (("sop", "procedure", "process", "checklist"), "sop"),
    (("comment on this", "dm", "reply to"), "social"),
]

_STATUS_WORDS = ("how", "status", "doing", "performance", "review", "comment", "report")


def _mock_status_reply(session: Session, tenant, message: str) -> str | None:
    """Even offline, status questions get answered from real database numbers."""
    low = message.lower()
    asks_status = any(w in low for w in _STATUS_WORDS)
    if asks_status and any(w in low for w in ("agent", "employee", "team", "staff", "ai ")):
        rows = _tool_list_agents(session, tenant, {})
        lines = ["Here's your AI workforce right now:"]
        for r in rows:
            state = "active" if r["active"] else "STOPPED"
            note = f", {r['errors_7d']} errors" if r["errors_7d"] else ""
            queue = f", {r['pending_approvals']} awaiting your approval" if r["pending_approvals"] else ""
            lines.append(f"• {r['name']}: {state}, autonomy={r['autonomy']}, "
                         f"{r['runs_7d']} runs this week{note}{queue}")
        lines.append("\n(Add an LLM API key to .env and I'll give you a real "
                     "manager's assessment, not just the raw numbers.)")
        return "\n".join(lines)
    if asks_status and any(w in low for w in ("business", "number", "kpi", "sales", "today")):
        data = _tool_get_business_summary(session, tenant, {})
        m, h = data["metrics"], data["health"]
        return (f"Today so far: revenue ${m['revenue_today']:.0f}, "
                f"{m['leads_today']:.0f} new leads, {m['deals_won_today']:.0f} deals won, "
                f"conversion {m['conversion_rate']:.1f}%, pipeline ${m['pipeline_value']:.0f}, "
                f"{m['pending_approvals']:.0f} approvals waiting. "
                f"Business Health Score: {h['overall']}/100 "
                f"(components: {h['components']}).")
    return None


def _decide_mock(message: str) -> dict:
    low = message.lower()
    for keywords, agent_key in _KEYWORD_ROUTES:
        if any(k in low for k in keywords):
            return {"action": "delegate", "agent": agent_key, "task": message}
    return {"action": "reply",
            "message": ("I'm running in offline mode (no LLM key in .env yet), so I can "
                        "delegate work and report live numbers, but I can't hold a real "
                        "conversation. Try: a marketing plan, social posts, an image, a "
                        "landing page, an SOP — or ask 'how are my AI employees doing?'")}


# ------------------------------------------------------------ execution


def _run_media(session: Session, tenant, agent, task: str) -> tuple[str, list[dict]]:
    """Image/video agents: optionally refine the prompt with the LLM, then
    call the media adapter. Logged as an agent run like everything else."""
    prompt = task
    if not config.USE_MOCK_LLM and (config.ANTHROPIC_API_KEY or config.OPENROUTER_API_KEY):
        refined = run_agent(session, tenant, agent, task, trigger="manager_delegate")
        if refined.outcome != "error" and refined.output_text.strip():
            prompt = refined.output_text.strip()

    start = time.monotonic()
    run = AgentRun(tenant_id=tenant.id, agent_id=agent.id, agent_key=agent.key,
                   trigger="manager_media", input_text=prompt)
    try:
        paths = (media.generate_image(prompt) if agent.key == "image"
                 else media.generate_video(prompt))
        run.output_text = "\n".join(paths)
        run.outcome = "success"
        kind = "image" if agent.key == "image" else "video"
        media_items = [{"type": "image" if p.endswith(".svg") else kind, "url": p}
                       for p in paths]
        reply = f"Done — {agent.name} generated {len(paths)} file(s) from: \"{prompt[:140]}\""
    except Exception as exc:
        run.outcome, run.error = "error", str(exc)[:2000]
        media_items = []
        reply = f"{agent.name} hit an error: {str(exc)[:200]}"
    run.latency_ms = int((time.monotonic() - start) * 1000)
    session.add(run)
    session.flush()
    return reply, media_items


def _run_website(session: Session, tenant, agent, task: str) -> tuple[str, list[dict]]:
    run = run_agent(session, tenant, agent, task, trigger="manager_delegate")
    if run.outcome == "error":
        return f"Website AI hit an error: {run.error[:200]}", []
    html = run.output_text.strip()
    html = re.sub(r"^```(?:html)?\s*|\s*```$", "", html, flags=re.MULTILINE).strip()
    if "<html" not in html.lower():
        html = ("<!doctype html><html><head><meta charset='utf-8'>"
                "<title>Draft page</title></head><body style='font-family:sans-serif;"
                "max-width:720px;margin:40px auto;line-height:1.6'>"
                f"<h1>Draft (no LLM key set)</h1><pre style='white-space:pre-wrap'>{html}</pre>"
                "</body></html>")
    config.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    path = config.GENERATED_DIR / f"site_{uuid.uuid4().hex[:10]}.html"
    path.write_text(html)
    url = f"/generated/{path.name}"
    return "Done — your landing page draft is ready. Open it, and tell me what to change.", \
           [{"type": "page", "url": url, "title": "Landing page draft"}]


def chat(session: Session, tenant, message: str, history: list[dict]) -> dict:
    """One manager turn. Returns {reply, delegated_to, media, artifacts}."""
    use_real = not config.USE_MOCK_LLM and (config.ANTHROPIC_API_KEY or config.OPENROUTER_API_KEY)

    if use_real:
        decision = _decide_llm(session, tenant, message, history)
    else:
        status = _mock_status_reply(session, tenant, message)
        decision = ({"action": "reply", "message": status} if status
                    else _decide_mock(message))

    if decision.get("action") != "delegate":
        return {"reply": decision.get("message", ""), "delegated_to": None,
                "media": [], "artifacts": []}

    agent_key = decision.get("agent", "")
    task = decision.get("task") or message
    agent = get_agent(session, tenant.id, agent_key)
    if agent is None or not agent.active:
        return {"reply": f"I wanted to hand this to '{agent_key}', but that agent is "
                         "not available (check the kill switch on the dashboard).",
                "delegated_to": None, "media": [], "artifacts": []}

    if agent_key in MEDIA_AGENTS:
        reply, media_items = _run_media(session, tenant, agent, task)
        return {"reply": reply, "delegated_to": agent_key,
                "media": media_items, "artifacts": []}

    if agent_key == "website":
        reply, artifacts = _run_website(session, tenant, agent, task)
        return {"reply": reply, "delegated_to": agent_key,
                "media": [], "artifacts": artifacts}

    run = run_agent(session, tenant, agent, task, trigger="manager_delegate")
    if run.outcome == "error":
        return {"reply": f"{agent.name} hit an error: {run.error[:200]}",
                "delegated_to": agent_key, "media": [], "artifacts": []}
    output, _side = _parse_side_channel(run.output_text)
    reply = f"Here's what {agent.name} produced:\n\n{output}"
    return {"reply": reply, "delegated_to": agent_key, "media": [], "artifacts": []}
