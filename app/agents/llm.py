"""LLMPort (doc 9 §9.1): one interface, three providers.

Priority: Anthropic API -> OpenRouter -> deterministic mock. The mock keeps
the whole system runnable and testable with zero keys and zero network —
replies are template-based but structurally identical to real ones (including
the sales JSON side-channel), so every downstream code path is exercised.
"""
import json
import re

import requests

from app import config


class LLMResult:
    def __init__(self, text: str, tokens_in: int = 0, tokens_out: int = 0, cost: float = 0.0):
        self.text = text
        self.tokens_in = tokens_in
        self.tokens_out = tokens_out
        self.cost = cost


def complete(system: str, user: str, tier: str = "frontier", max_tokens: int = 1024) -> LLMResult:
    if config.USE_MOCK_LLM:
        return _mock(system, user)
    if config.ANTHROPIC_API_KEY:
        return _anthropic(system, user, tier, max_tokens)
    if config.OPENROUTER_API_KEY:
        return _openrouter(system, user, tier, max_tokens)
    return _mock(system, user)


def _anthropic(system: str, user: str, tier: str, max_tokens: int) -> LLMResult:
    model = config.MODEL_FRONTIER if tier == "frontier" else config.MODEL_SMALL
    resp = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={"x-api-key": config.ANTHROPIC_API_KEY,
                 "anthropic-version": "2023-06-01",
                 "content-type": "application/json"},
        json={"model": model, "max_tokens": max_tokens, "system": system,
              "messages": [{"role": "user", "content": user}]},
        timeout=120,
    )
    resp.raise_for_status()
    data = resp.json()
    text = "".join(b.get("text", "") for b in data.get("content", []))
    usage = data.get("usage", {})
    return LLMResult(text, usage.get("input_tokens", 0), usage.get("output_tokens", 0),
                     _est_cost(usage.get("input_tokens", 0), usage.get("output_tokens", 0), tier))


def _openrouter(system: str, user: str, tier: str, max_tokens: int) -> LLMResult:
    model = config.OPENROUTER_MODEL_FRONTIER if tier == "frontier" else config.OPENROUTER_MODEL_SMALL
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {config.OPENROUTER_API_KEY}",
                 "Content-Type": "application/json",
                 "HTTP-Referer": "https://localhost", "X-Title": "AI-BOS"},
        json={"model": model, "max_tokens": max_tokens,
              "messages": [{"role": "system", "content": system},
                           {"role": "user", "content": user}]},
        timeout=120,
    )
    resp.raise_for_status()
    data = resp.json()
    text = data["choices"][0]["message"]["content"] or ""
    usage = data.get("usage", {})
    return LLMResult(text, usage.get("prompt_tokens", 0), usage.get("completion_tokens", 0),
                     _est_cost(usage.get("prompt_tokens", 0), usage.get("completion_tokens", 0), tier))


def _est_cost(tokens_in: int, tokens_out: int, tier: str) -> float:
    rate_in, rate_out = (3.0, 15.0) if tier == "frontier" else (0.8, 4.0)  # $/MTok, approx
    return round((tokens_in * rate_in + tokens_out * rate_out) / 1_000_000, 6)


# ------------------------------------------------------------------ mock

BUYING_SIGNALS = ["price", "cost", "how much", "buy", "book", "appointment",
                  "available", "start", "quote", "demo", "interested"]
SUPPORT_SIGNALS = ["help", "issue", "problem", "broken", "not working",
                   "complaint", "refund", "cancel", "error", "wrong"]
ANGRY_SIGNALS = ["angry", "furious", "lawyer", "sue", "terrible", "worst", "scam"]


def _mock(system: str, user: str) -> LLMResult:
    low = user.lower()

    if "classify the intent" in system.lower():
        if any(s in low for s in SUPPORT_SIGNALS):
            return LLMResult("support")
        return LLMResult("sales")

    if "sales development rep" in system.lower():
        signals = [s for s in BUYING_SIGNALS if s in low]
        score = min(95, 30 + 20 * len(signals))
        wants_booking = any(s in low for s in ("book", "appointment", "demo", "start"))
        if wants_booking:
            reply = ("Great — I can get that set up for you. I have tomorrow at 10:00 "
                     "or 15:00 available. Which works better for you?")
            next_action = "book_appointment"
        elif signals:
            reply = ("Happy to help with that! To point you to the right option, "
                     "may I ask what you're mainly looking to achieve?")
            next_action = "qualify"
        else:
            reply = ("Thanks for reaching out! What brings you to us today?")
            next_action = "engage"
        side = {"score": score, "score_reasons": [f"signal:{s}" for s in signals] or ["cold_inbound"],
                "intent": "buy" if signals else "browse",
                "buying_signals": signals, "next_action": next_action}
        return LLMResult(reply + "\n```json\n" + json.dumps(side) + "\n```")

    if "resolve customer issues" in system.lower():
        m = re.search(r"\[KB:([^\]]+)\]", system)
        cite = m.group(1).strip() if m else None
        if cite:
            return LLMResult(
                f"I can help with that. According to our \"{cite}\" guide: please try the "
                f"steps described there and let me know if the issue persists — I'm here.")
        return LLMResult(
            "I'm sorry you're running into this. I don't have a documented answer, so I've "
            "opened a ticket and our team will follow up today.\n[ESCALATE]")

    # Generic department agents (marketing, finance, hr, analytics, ...)
    return LLMResult("[mock draft]\n" + user[:400])
