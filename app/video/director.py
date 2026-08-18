"""AI Director: turns a plain-language brief into a production plan —
concept, hook, script, and a scene-by-scene storyboard with recommended
providers and credit estimates. Uses the shared LLM port (Anthropic →
OpenRouter → deterministic fallback), so it works offline too."""
import json

from app.agents import llm
from app.video.providers import PROVIDERS, route

DIRECTOR_PROMPT = """You are the AI Director of a video production studio.
Turn the client brief below into a production plan. Respond with ONLY a
JSON object, no markdown fences, shaped exactly like:
{"concept": "...", "hook": "...", "script": "...",
 "scenes": [{"purpose": "...", "scene_type": "presenter|broll|product|text",
   "dialogue": "spoken words for this scene, if any",
   "on_screen_text": "short caption",
   "visual_prompt": "detailed visual description for a video model",
   "camera": "camera movement", "duration_sec": 5}]}

Rules: 3-8 scenes; total duration close to the requested length; the first
scene must hook the viewer in the first 2 seconds; dialogue in the
requested language; visual prompts concrete and filmable; never invent
product claims not present in the brief.

CLIENT BRIEF:
{brief}
"""


def _fallback_plan(brief: dict) -> dict:
    """Deterministic plan used when no LLM key is configured — honest,
    grounded in the brief only."""
    product = brief.get("product", brief.get("title", "your product"))
    audience = brief.get("audience", "your customers")
    cta = brief.get("cta", "Learn more today")
    selling = brief.get("selling_points", "quality you can trust")
    duration = int(brief.get("duration_sec") or 30)
    per_scene = max(4, duration // 5)
    scenes = [
        {"purpose": "Hook the viewer", "scene_type": "broll",
         "dialogue": f"What if {audience} could finally get this right?",
         "on_screen_text": product, "camera": "fast push-in",
         "visual_prompt": f"Dramatic close-up reveal of {product}, high contrast lighting"},
        {"purpose": "Present the product", "scene_type": "presenter",
         "dialogue": f"Meet {product}. {selling}.",
         "on_screen_text": selling[:60], "camera": "steady medium shot",
         "visual_prompt": f"A friendly spokesperson presenting {product} in a bright modern space"},
        {"purpose": "Show it in real life", "scene_type": "product",
         "dialogue": "See the difference for yourself.",
         "on_screen_text": "Real results", "camera": "slow orbit",
         "visual_prompt": f"Lifestyle footage of {audience} happily using {product}"},
        {"purpose": "Build trust", "scene_type": "broll",
         "dialogue": f"Made for {audience}, loved every day.",
         "on_screen_text": "Why people choose us", "camera": "handheld follow",
         "visual_prompt": f"Authentic natural-light shots of {product} details"},
        {"purpose": "Call to action", "scene_type": "text",
         "dialogue": cta, "on_screen_text": cta, "camera": "static",
         "visual_prompt": f"Bold end card with logo space and the text: {cta}"},
    ]
    for s in scenes:
        s["duration_sec"] = per_scene
    return {"concept": f"A {brief.get('tone', 'confident')} {duration}-second video introducing "
                       f"{product} to {audience}, closing on '{cta}'.",
            "hook": scenes[0]["dialogue"], "script": " ".join(s["dialogue"] for s in scenes),
            "scenes": scenes}


def make_plan(brief: dict, direction: dict) -> dict:
    full_brief = {**brief, **{f"direction_{k}": v for k, v in direction.items() if v}}
    result = llm.complete(
        "You are a world-class video director and ad creative.",
        DIRECTOR_PROMPT.replace("{brief}", json.dumps(full_brief, ensure_ascii=False)),
        tier="frontier", max_tokens=2048)
    plan = None
    try:
        text = result.text.strip()
        if text.startswith("```"):
            text = text.strip("`").lstrip("json").strip()
        plan = json.loads(text)
        assert isinstance(plan.get("scenes"), list) and plan["scenes"]
    except Exception:
        plan = _fallback_plan(brief)

    for i, scene in enumerate(plan["scenes"][:8]):
        scene["duration_sec"] = max(2, min(int(scene.get("duration_sec") or 5), 20))
        scene.setdefault("scene_type", "broll")
        provider = route(scene["scene_type"])
        scene["recommended_provider"] = provider.id
        scene["estimated_credits"] = provider.estimate_credits(scene["duration_sec"])
        scene["idx"] = i
    plan["scenes"] = plan["scenes"][:8]
    plan["estimated_credits"] = round(sum(s["estimated_credits"] for s in plan["scenes"]), 1)
    plan["providers"] = {p.id: p.name for p in PROVIDERS.values() if p.available()}
    return plan
