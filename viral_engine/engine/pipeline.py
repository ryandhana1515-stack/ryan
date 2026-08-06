"""Viral Content Engine — Stages 1-5.

Reference URL (or transcript) in -> approved script + B-roll map out.

    python pipeline.py --url https://www.tiktok.com/@x/video/123 \
        --topic "n8n lead-capture automation" \
        --proof "screen recording of the live n8n workflow for my ERP client"

    python pipeline.py --transcript ref.txt --topic "..." --proof "..."

Outputs land in runs/<timestamp>-<slug>/:
    transcript.txt, format_dna.json, script.json, broll_map.json
"""

import argparse
import json
import re
import time
from datetime import datetime
from pathlib import Path

import anthropic
import requests
from dotenv import load_dotenv

load_dotenv()

import os

MODEL = os.environ.get("VIRAL_ENGINE_MODEL", "claude-sonnet-4-6")
ENGINE_DIR = Path(__file__).resolve().parent.parent
PROMPTS = ENGINE_DIR / "prompts"
RUNS = ENGINE_DIR / "runs"

claude = anthropic.Anthropic()


# ---------- Stage 2: extract ----------

def apify_download(url: str, run_dir: Path) -> dict:
    """Pull video MP4 + metadata for a TikTok URL via Apify."""
    token = os.environ["APIFY_TOKEN"]
    resp = requests.post(
        "https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items",
        params={"token": token},
        json={"postURLs": [url], "shouldDownloadVideos": True},
        timeout=300,
    )
    resp.raise_for_status()
    items = resp.json()
    if not items:
        raise RuntimeError(f"Apify returned no items for {url}")
    item = items[0]
    (run_dir / "reference_meta.json").write_text(json.dumps(item, indent=2))

    video_url = (
        item.get("videoMeta", {}).get("downloadAddr")
        or item.get("mediaUrls", [None])[0]
        or item.get("videoUrl")
    )
    if not video_url:
        raise RuntimeError("No downloadable video URL in Apify response")
    video = requests.get(video_url, timeout=300)
    video.raise_for_status()
    (run_dir / "reference.mp4").write_bytes(video.content)
    return item


def whisper_transcribe(video_path: Path) -> str:
    """Transcribe with OpenAI Whisper."""
    from openai import OpenAI

    client = OpenAI()
    with open(video_path, "rb") as f:
        result = client.audio.transcriptions.create(model="whisper-1", file=f)
    return result.text


# ---------- Claude helpers ----------

def parse_json(text: str):
    """Parse model output that should be JSON, tolerating stray fences."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    return json.loads(text)


def ask_claude(prompt: str, retries: int = 2):
    """One agent call. Returns parsed JSON, retrying once on a parse failure."""
    messages = [{"role": "user", "content": prompt}]
    for attempt in range(retries + 1):
        response = claude.messages.create(
            model=MODEL,
            max_tokens=8000,
            thinking={"type": "adaptive"},
            messages=messages,
        )
        text = next(b.text for b in response.content if b.type == "text")
        try:
            return parse_json(text)
        except json.JSONDecodeError as e:
            if attempt == retries:
                raise
            messages = [
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": text},
                {"role": "user", "content": f"That was not valid JSON ({e}). Output the corrected JSON only."},
            ]


# ---------- Stages 3-5 ----------

def agent_a(transcript: str, metadata: dict | None):
    prompt = (PROMPTS / "agent_a_deconstruct.txt").read_text()
    meta_note = ""
    if metadata:
        keep = {k: metadata.get(k) for k in ("playCount", "diggCount", "shareCount", "commentCount") if metadata.get(k)}
        if keep:
            meta_note = f"\n\nMETADATA: {json.dumps(keep)}"
    return ask_claude(f"{prompt}\n\nTRANSCRIPT:\n{transcript}{meta_note}")


def agent_b(format_dna: dict, topic: str, proof: str, feedback: str = ""):
    prompt = (
        (PROMPTS / "agent_b_regenerate.txt")
        .read_text()
        .replace("{{FORMAT_DNA}}", json.dumps(format_dna, indent=2))
        .replace("{{TOPIC}}", topic)
        .replace("{{PROOF_ASSET}}", proof)
    )
    if feedback:
        prompt += f"\n\nREVISION NOTES FROM THE FOUNDER (apply these):\n{feedback}"
    return ask_claude(prompt)


def agent_c(script: dict):
    prompt = (PROMPTS / "agent_c_broll.txt").read_text().replace(
        "{{SCRIPT_LINES}}", json.dumps(script["script_lines"], indent=2)
    )
    return ask_claude(prompt)


def approval_gate(script: dict) -> tuple[bool, str]:
    """Stage 4.5 — the human gate. Returns (approved, feedback)."""
    print("\n" + "=" * 60)
    print(f"HOOK: {script['hook']}\n")
    for line in script["script_lines"]:
        print(f"  [{line['id']:>2}] ({line['duration_sec']}s) {line['text']}")
    print(f"\nCTA: {script['cta']}")
    print(f"CAPTION: {script['caption']}")
    print(f"RUNTIME: ~{script['estimated_runtime_sec']}s")
    print("=" * 60)
    choice = input("Approve? [y = yes / anything else = regenerate with that text as feedback]: ").strip()
    if choice.lower() == "y":
        return True, ""
    return False, choice


def main():
    ap = argparse.ArgumentParser(description="Viral Content Engine: stages 1-5")
    ap.add_argument("--url", help="Reference TikTok/Reel/Short URL (needs APIFY_TOKEN + OPENAI_API_KEY)")
    ap.add_argument("--transcript", help="Path to an existing transcript .txt (skips download)")
    ap.add_argument("--topic", required=True, help="Your topic for the new script")
    ap.add_argument("--proof", required=True, help="The real build/result/screenshot you can show")
    ap.add_argument("--yes", action="store_true", help="Skip the approval gate (NOT recommended)")
    args = ap.parse_args()
    if not args.url and not args.transcript:
        ap.error("Provide --url or --transcript")

    slug = re.sub(r"[^a-z0-9]+", "-", args.topic.lower())[:40].strip("-")
    run_dir = RUNS / f"{datetime.now():%Y%m%d-%H%M%S}-{slug}"
    run_dir.mkdir(parents=True)
    print(f"Run dir: {run_dir}")

    metadata = None
    if args.transcript:
        transcript = Path(args.transcript).read_text()
    else:
        print("[1/5] Downloading reference via Apify...")
        metadata = apify_download(args.url, run_dir)
        print("[2/5] Transcribing with Whisper...")
        transcript = whisper_transcribe(run_dir / "reference.mp4")
    (run_dir / "transcript.txt").write_text(transcript)

    print("[3/5] Agent A: deconstructing format...")
    format_dna = agent_a(transcript, metadata)
    (run_dir / "format_dna.json").write_text(json.dumps(format_dna, indent=2))
    print(f"      hook_type={format_dna.get('hook_type')} total={format_dna.get('pacing', {}).get('total_sec')}s")

    print("[4/5] Agent B: writing your script...")
    feedback = ""
    while True:
        script = agent_b(format_dna, args.topic, args.proof, feedback)
        if args.yes:
            break
        approved, feedback = approval_gate(script)
        if approved:
            break
        print("      Regenerating with your feedback...")
    (run_dir / "script.json").write_text(json.dumps(script, indent=2))

    print("[5/5] Agent C: tagging B-roll...")
    broll_map = agent_c(script)
    (run_dir / "broll_map.json").write_text(json.dumps(broll_map, indent=2))

    print(f"\nDone. Next steps:")
    print(f"  python engine/broll_router.py {run_dir}")
    print(f"  python engine/tts.py {run_dir}")
    print(f"  python engine/timeline_builder.py {run_dir} --render")


if __name__ == "__main__":
    main()
