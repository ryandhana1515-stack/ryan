"""Viral Content Engine — Stage 7: voiceover via ElevenLabs.

Reads script.json from a run dir, generates voiceover.mp3 and per-line
timing estimates (voiceover_timing.json) for the timeline builder.

    python tts.py runs/<run-dir>
"""

import argparse
import json
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

import os


def main():
    ap = argparse.ArgumentParser(description="Viral Content Engine: stage 7 (TTS)")
    ap.add_argument("run_dir", type=Path)
    ap.add_argument("--pace-wpm", type=int, default=165, help="Spoken pace for timing estimates")
    args = ap.parse_args()

    api_key = os.environ["ELEVENLABS_API_KEY"]
    voice_id = os.environ["ELEVENLABS_VOICE_ID"]

    script = json.loads((args.run_dir / "script.json").read_text())
    lines = script["script_lines"]
    full_text = " ".join(l["text"] for l in lines)
    if script.get("cta"):
        full_text += " " + script["cta"]

    resp = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        headers={"xi-api-key": api_key, "Content-Type": "application/json"},
        json={
            "text": full_text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
        },
        timeout=300,
    )
    resp.raise_for_status()
    (args.run_dir / "voiceover.mp3").write_bytes(resp.content)

    # Word-count based per-line timings; good enough for cut points, and the
    # renderer's auto-captions handle exact word timing.
    sec_per_word = 60.0 / args.pace_wpm
    t = 0.0
    timings = []
    for l in lines:
        dur = round(len(l["text"].split()) * sec_per_word, 2)
        timings.append({"line_id": l["id"], "start": round(t, 2), "duration": dur})
        t += dur
    (args.run_dir / "voiceover_timing.json").write_text(json.dumps(timings, indent=2))
    print(f"voiceover.mp3 written ({t:.1f}s estimated). Timings in voiceover_timing.json.")


if __name__ == "__main__":
    main()
