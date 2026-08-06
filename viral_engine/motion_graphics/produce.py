"""Motion-graphics producer: script -> scene plan (Agent D) -> frames -> MP4.

    python produce.py --plan plan.json --audio voiceover.mp3 --out final.mp4
    python produce.py --run-dir ../runs/<dir> --agent-plan --tts --out final.mp4

Modes:
  --plan            use an existing plan JSON (scenes + captions + brand + avatar)
  --agent-plan      generate the scene plan with Claude (Agent D prompt),
                    needs ANTHROPIC_API_KEY and --run-dir with script.json
  --tts             generate the voiceover with ElevenLabs (needs keys),
                    otherwise pass --audio
  --avatar PATH     your avatar clip (mp4); dropped into avatar scenes.
                    Without it, avatar scenes render a styled placeholder.
"""

import argparse
import json
import re
import subprocess
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

import os

BASE = Path(__file__).resolve().parent
FPS = 24


def audio_duration(path: Path, ffmpeg: str) -> float:
    out = subprocess.run([ffmpeg, "-hide_banner", "-i", str(path)], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out.stderr)
    h, mnt, s = m.groups()
    return int(h) * 3600 + int(mnt) * 60 + float(s)


def ffmpeg_exe() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def sentence_windows(script_lines: list, total: float, lead: float = 0.2, tail: float = 0.4) -> list:
    """Char-weighted start/end windows per script line across the voiceover."""
    texts = [l["text"] for l in script_lines]
    weights = [len(t) + 12 for t in texts]
    span = total - lead - tail
    acc, out = lead, []
    for w, t in zip(weights, texts):
        d = span * w / sum(weights)
        out.append({"text": t, "start": round(acc, 2), "end": round(acc + d, 2)})
        acc += d
    return out


def estimate_captions(windows: list) -> list:
    """Word-level times, char-weighted inside each sentence window."""
    caps = []
    for w in windows:
        words = w["text"].split()
        weights = [len(x) + 3 for x in words]
        span = w["end"] - w["start"]
        acc = w["start"]
        entry = {"end": w["end"], "words": []}
        for wt, word in zip(weights, words):
            entry["words"].append({"w": word, "t": round(acc, 2)})
            acc += span * wt / sum(weights)
        caps.append(entry)
    return caps


def whisper_captions(audio: Path) -> list | None:
    """Word-accurate caption timing via Whisper, if OPENAI_API_KEY is set."""
    if not os.environ.get("OPENAI_API_KEY"):
        return None
    from openai import OpenAI
    client = OpenAI()
    with open(audio, "rb") as f:
        r = client.audio.transcriptions.create(
            model="whisper-1", file=f, response_format="verbose_json",
            timestamp_granularities=["word", "segment"],
        )
    caps = []
    words = list(r.words)
    for seg in r.segments:
        seg_words = [w for w in words if seg.start - 0.05 <= w.start < seg.end + 0.05]
        if seg_words:
            caps.append({
                "end": round(seg.end, 2),
                "words": [{"w": w.word.strip(), "t": round(w.start, 2)} for w in seg_words],
            })
    return caps or None


def agent_d_plan(script: dict, duration: float, windows: list) -> dict:
    import anthropic
    prompt = (BASE.parent / "prompts" / "agent_d_motion_graphics.txt").read_text()
    prompt = (prompt
              .replace("{{SCRIPT_LINES}}", json.dumps(script["script_lines"]))
              .replace("{{DURATION}}", str(round(duration, 1)))
              .replace("{{SENTENCE_WINDOWS}}", json.dumps(windows)))
    client = anthropic.Anthropic()
    resp = client.messages.create(
        model=os.environ.get("VIRAL_ENGINE_MODEL", "claude-sonnet-4-6"),
        max_tokens=8000,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    )
    text = next(b.text for b in resp.content if b.type == "text").strip()
    text = re.sub(r"^```[a-z]*\n?", "", text)
    text = re.sub(r"\n?```$", "", text)
    return json.loads(text)


def render(plan: dict, out_dir: Path, duration: float):
    from playwright.sync_api import sync_playwright
    frames = out_dir / "frames"
    frames.mkdir(parents=True, exist_ok=True)
    chromium = os.environ.get("CHROMIUM_PATH")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=chromium if chromium else None,
            args=["--no-sandbox", "--force-color-profile=srgb", "--autoplay-policy=no-user-gesture-required"],
        )
        page = browser.new_page(viewport={"width": 1080, "height": 1920})
        page.goto((BASE / "template_v2.html").as_uri())
        page.wait_for_timeout(600)
        page.evaluate("loadData(" + json.dumps(plan) + ")")
        page.wait_for_timeout(400)
        n = int(duration * FPS)
        for i in range(n):
            page.evaluate(f"seekAsync({i / FPS})")
            page.screenshot(path=str(frames / f"f{i:04d}.png"))
            if i % 96 == 0:
                print(f"  frame {i}/{n}", flush=True)
    return frames


def mux(frames: Path, audio: Path, out: Path, ffmpeg: str):
    subprocess.run([
        ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
        "-framerate", str(FPS), "-i", str(frames / "f%04d.png"), "-i", str(audio),
        "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out),
    ], check=True)


def main():
    ap = argparse.ArgumentParser(description="Motion-graphics producer")
    ap.add_argument("--plan", type=Path, help="Existing plan JSON")
    ap.add_argument("--run-dir", type=Path, help="Pipeline run dir with script.json")
    ap.add_argument("--agent-plan", action="store_true", help="Generate plan with Claude (Agent D)")
    ap.add_argument("--audio", type=Path, help="Voiceover mp3")
    ap.add_argument("--tts", action="store_true", help="Generate voiceover via engine/tts.py first")
    ap.add_argument("--avatar", type=Path, help="Your avatar clip (mp4)")
    ap.add_argument("--out", type=Path, default=Path("final_mg.mp4"))
    args = ap.parse_args()

    ff = ffmpeg_exe()
    work = (args.run_dir or Path("mg_out")).resolve()
    work.mkdir(parents=True, exist_ok=True)

    if args.tts and args.run_dir:
        subprocess.run(["python3", str(BASE.parent / "engine" / "tts.py"), str(args.run_dir)], check=True)
        args.audio = args.run_dir / "voiceover.mp3"
    if not args.audio or not args.audio.exists():
        raise SystemExit("Need --audio (or --tts with --run-dir)")
    duration = audio_duration(args.audio, ff)

    if args.plan:
        plan = json.loads(args.plan.read_text())
    elif args.agent_plan and args.run_dir:
        script = json.loads((args.run_dir / "script.json").read_text())
        windows = sentence_windows(script["script_lines"], duration)
        plan = agent_d_plan(script, duration, windows)
        plan["captions"] = whisper_captions(args.audio) or estimate_captions(windows)
        (work / "plan.json").write_text(json.dumps(plan, indent=2))
        print(f"plan.json written to {work}")
    else:
        raise SystemExit("Need --plan, or --agent-plan with --run-dir")

    if args.avatar and args.avatar.exists():
        plan["avatar"] = {"src": args.avatar.resolve().as_uri()}

    total = max(duration + 1.0, max(s["end"] for s in plan["scenes"]))
    frames = render(plan, work, total)
    mux(frames, args.audio, args.out, ff)
    print(f"done: {args.out}")


if __name__ == "__main__":
    main()
