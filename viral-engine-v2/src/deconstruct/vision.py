"""Stage 1d — read the reference's edit with Claude vision.

Sends contact sheets (12 shots per image, timestamped) to Claude and asks for a
per-shot classification. Mechanical measures (cuts, seam geometry, grade stats)
come from ffmpeg/numpy; this supplies the semantic layer that pixels cannot.

    python vision.py work/frames/index.json work/vision.json

Requires ANTHROPIC_API_KEY. If the key is absent this raises — per the error
policy, never degrade silently. To supply annotations from another source
(e.g. an interactive session), write the same schema to work/vision.json and
skip this step.
"""

import base64
import json
import os
import re
import sys
from pathlib import Path

MODEL = os.environ.get("VISION_MODEL", "claude-opus-4-5")

PROMPT = """You are a video editor reverse-engineering the EDIT of a short-form video.

This contact sheet shows the head frame of {n} consecutive shots, in reading
order (left to right, top to bottom). Their timings are:
{timings}

For EACH shot return one object:
{{
  "i": <shot index>,
  "layer": "aroll" | "broll" | "graphic" | "screenrec" | "split",
  "split_ratio": <0-1 if layer is split, else null>,
  "framing": "closeup|medium|wide|ui|type",
  "camera_move": "static|push|pull|handheld|whip|orbit",
  "subject": "<a few words, what is physically on screen>",
  "graphics_on_screen": [{{"name":"<CamelCase component name>","position":"","anim_in":""}}],
  "caption_text_visible": "<the caption if legible, else empty>",
  "transition_in": "cut|whip|flash|zoom",
  "sfx_hint": "whoosh|sub|tick|riser|none"
}}

Rules:
- "split" means two images butted together edge to edge (e.g. B-roll on top,
  the presenter full-width underneath). A presenter in a small floating box is
  NOT a split - call that out explicitly in `subject`.
- Name graphics as reusable COMPONENTS (LogoOrbit, NumberBadge, KineticType),
  not as descriptions of this one instance.
- Describe FORM only. Never transcribe the script or copy claims.

Return a JSON array only. No prose, no markdown fences."""


def encode(path: Path) -> dict:
    return {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                        "data": base64.standard_b64encode(path.read_bytes()).decode()}}


def annotate(index_json: Path) -> list[dict]:
    import anthropic
    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
        raise RuntimeError("ANTHROPIC_API_KEY is not set — refusing to continue. "
                           "Vision is mandatory for Stage 1; there is no fallback.")
    client = anthropic.Anthropic()
    idx = json.loads(index_json.read_text())
    shots = []
    for sheet in idx["sheets"]:
        timings = "\n".join(
            f"  shot {s['i']}: {s['start']:.2f}-{s['end']:.2f}s ({s['len']:.2f}s)"
            for s in sheet["shots"])
        msg = client.messages.create(
            model=MODEL, max_tokens=8000,
            thinking={"type": "adaptive"},
            messages=[{"role": "user", "content": [
                encode(Path(sheet["sheet"])),
                {"type": "text", "text": PROMPT.format(n=len(sheet["shots"]), timings=timings)},
            ]}],
        )
        text = next(b.text for b in msg.content if b.type == "text").strip()
        text = re.sub(r"^```[a-z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
        shots.extend(json.loads(text))
    return shots


if __name__ == "__main__":
    res = annotate(Path(sys.argv[1]))
    dest = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("work/vision.json")
    dest.write_text(json.dumps(res, indent=2))
    print(f"annotated {len(res)} shots -> {dest}")
