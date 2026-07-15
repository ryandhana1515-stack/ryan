"""Manager AI — the single chat interface for the CEO (the 'agent in
control'). It understands a plain-language request, delegates to the right
department agent, runs media generation for image/video, and reports back.

Delegation is one decision per turn: with a real LLM the manager prompt
returns a JSON action; in mock mode a keyword router makes the same
decision so the experience works offline.
"""
import json
import re
import time
import uuid

from sqlalchemy.orm import Session

from app import config
from app.agents import llm, media
from app.agents.orchestrator import (_parse_side_channel, get_agent,
                                     run_agent)
from app.agents.registry import load_agent_configs, read_prompt
from app.models import AgentRun

MEDIA_AGENTS = ("image", "video")

_KEYWORD_ROUTES: list[tuple[tuple[str, ...], str]] = [
    (("image", "photo", "picture", "logo", "visual", "poster"), "image"),
    (("video", "reel", "clip", "animation"), "video"),
    (("website", "landing page", "web page", "webpage", "site"), "website"),
    (("tiktok", "instagram", "post", "caption", "blog", "email", "hashtag", "content", "script"), "content"),
    (("plan", "campaign", "calendar", "marketing", "persona", "competitor"), "marketing"),
    (("brand", "mission", "vision", "story", "positioning", "name for"), "branding"),
    (("call", "phone", "voicemail"), "voice"),
    (("finance", "revenue", "expense", "cash", "profit", "invoice report"), "finance"),
    (("hire", "hiring", "job", "resume", "recruit", "staff", "onboard"), "hr"),
    (("sop", "procedure", "process", "checklist", "how should my team"), "sop"),
    (("comment", "dm", "reply to"), "social"),
    (("number", "kpi", "performance", "how is the business", "digest", "report"), "analytics"),
]


def _roster_text() -> str:
    lines = []
    for cfg in load_agent_configs():
        if cfg["key"] == "manager":
            continue
        lines.append(f"- {cfg['key']} — {cfg.get('description', '')}")
    return "\n".join(lines)


def _decide_mock(message: str) -> dict:
    low = message.lower()
    for keywords, agent_key in _KEYWORD_ROUTES:
        if any(k in low for k in keywords):
            return {"action": "delegate", "agent": agent_key, "task": message}
    return {"action": "reply",
            "message": ("I can put any of your AI employees to work — try asking me for "
                        "a marketing plan, social posts, an image, a video, a landing "
                        "page, a call script, a hiring post, an SOP, or your business "
                        "numbers.")}


def _decide_llm(message: str, history: list[dict]) -> dict:
    system = read_prompt("prompts/manager_system.md").format(agent_roster=_roster_text())
    convo = "\n".join(f"{m.get('role', 'user')}: {m.get('content', '')}" for m in history[-12:])
    user = (f"Conversation so far:\n{convo}\n\nCEO's new message: {message}" if convo
            else f"CEO's message: {message}")
    result = llm.complete(system, user, tier="frontier", max_tokens=600)
    text = result.text.strip()
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            decision = json.loads(m.group(0))
            if decision.get("action") in ("delegate", "reply"):
                return decision
        except json.JSONDecodeError:
            pass
    return {"action": "reply", "message": text or "Could you rephrase that?"}


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
    decision = _decide_llm(message, history) if use_real else _decide_mock(message)

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
