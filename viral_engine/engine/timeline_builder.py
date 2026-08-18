"""Viral Content Engine — Stage 8: timeline + render.

Builds a JSON2Video movie spec (render.json) from a run dir, and either:

  --render        submit to JSON2Video and poll for the MP4 (assets must be
                  URL-reachable: stock clips use their source URLs; the
                  voiceover needs a public URL via --voiceover-url)
  --local         render locally with ffmpeg instead (no captions; use
                  Submagic/DaVinci for the caption pass)

    python timeline_builder.py runs/<run-dir> --render --voiceover-url https://...
    python timeline_builder.py runs/<run-dir> --local
"""

import argparse
import json
import subprocess
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

import os


def build_movie(run_dir: Path, voiceover_url: str | None) -> dict:
    script = json.loads((run_dir / "script.json").read_text())
    assets = json.loads((run_dir / "broll_assets.json").read_text())

    scenes = []
    for asset in assets:
        src = asset.get("url")
        if not src:
            # Local-only clip (library/Kling/screen recording): must be hosted
            # for a cloud render. Flag it clearly in the spec.
            src = f"UPLOAD_ME/{asset['clip']}"
        scenes.append({
            "comment": f"line {asset['line_id']}: {asset['keyword']}",
            "elements": [{
                "type": "video",
                "src": src,
                "duration": asset["duration_sec"],
                "resize": "cover",
                "muted": True,
            }],
        })

    movie = {
        "resolution": "instagram-story",  # 1080x1920
        "quality": "high",
        "scenes": scenes,
        "elements": [
            {
                "type": "subtitles",
                "settings": {
                    "style": "boxed-word",
                    "font-family": "Oswald Bold",
                    "font-size": 120,
                    "position": "mid-bottom-center",
                    "word-color": "#FFFF00",
                    "line-color": "#FFFFFF",
                },
            }
        ],
    }
    if voiceover_url:
        movie["elements"].append({"type": "audio", "src": voiceover_url})
    # On-screen overlays from Agent B
    for i, overlay in enumerate(script.get("on_screen_text", [])[:5]):
        if i < len(movie["scenes"]):
            movie["scenes"][i]["elements"].append({
                "type": "text",
                "text": overlay,
                "position": "top-center",
                "duration": -1,
            })
    return movie


def render_json2video(movie: dict, run_dir: Path):
    api_key = os.environ["JSON2VIDEO_API_KEY"]
    headers = {"x-api-key": api_key, "Content-Type": "application/json"}
    resp = requests.post("https://api.json2video.com/v2/movies", headers=headers, json=movie, timeout=60)
    resp.raise_for_status()
    project = resp.json()["project"]
    print(f"Render submitted (project {project}). Polling...")

    while True:
        time.sleep(10)
        status = requests.get(
            "https://api.json2video.com/v2/movies", headers=headers,
            params={"project": project}, timeout=60,
        )
        status.raise_for_status()
        movie_status = status.json()["movie"]
        state = movie_status["status"]
        print(f"  status: {state}")
        if state == "done":
            url = movie_status["url"]
            video = requests.get(url, timeout=600)
            (run_dir / "final.mp4").write_bytes(video.content)
            print(f"final.mp4 downloaded ({url})")
            return
        if state == "error":
            raise RuntimeError(f"Render failed: {movie_status.get('message')}")


def render_local(run_dir: Path):
    """ffmpeg fallback: trim each clip to its duration, concat, overlay voiceover."""
    assets = json.loads((run_dir / "broll_assets.json").read_text())
    broll = run_dir / "broll"
    parts = []
    for i, asset in enumerate(assets):
        clip = broll / asset["clip"]
        if not clip.exists():
            raise FileNotFoundError(f"{clip} missing — finish stage 6 first")
        part = broll / f"part_{i:02d}.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-i", str(clip), "-t", str(asset["duration_sec"]),
            "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30",
            "-an", "-c:v", "libx264", "-preset", "fast", str(part),
        ], check=True, capture_output=True)
        parts.append(part)

    concat_list = broll / "concat.txt"
    concat_list.write_text("\n".join(f"file '{p.name}'" for p in parts))
    silent = run_dir / "silent.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list),
        "-c", "copy", str(silent),
    ], check=True, capture_output=True, cwd=broll)

    voiceover = run_dir / "voiceover.mp3"
    if voiceover.exists():
        subprocess.run([
            "ffmpeg", "-y", "-i", str(silent), "-i", str(voiceover),
            "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-shortest",
            str(run_dir / "final.mp4"),
        ], check=True, capture_output=True)
    else:
        (run_dir / "final.mp4").write_bytes(silent.read_bytes())
    print(f"final.mp4 written to {run_dir} (no captions — run it through Submagic)")


def main():
    ap = argparse.ArgumentParser(description="Viral Content Engine: stage 8 (assemble/render)")
    ap.add_argument("run_dir", type=Path)
    ap.add_argument("--render", action="store_true", help="Render via JSON2Video API")
    ap.add_argument("--local", action="store_true", help="Render locally with ffmpeg")
    ap.add_argument("--voiceover-url", help="Public URL of voiceover.mp3 for the cloud render")
    args = ap.parse_args()

    movie = build_movie(args.run_dir, args.voiceover_url)
    (args.run_dir / "render.json").write_text(json.dumps(movie, indent=2))
    print(f"render.json written")

    hosted = [s for s in movie["scenes"] if s["elements"][0]["src"].startswith("UPLOAD_ME/")]
    if hosted and args.render:
        print(f"WARNING: {len(hosted)} scene(s) use local-only clips — host them and fix render.json first.")
        return
    if args.render:
        render_json2video(movie, args.run_dir)
    elif args.local:
        render_local(args.run_dir)


if __name__ == "__main__":
    main()
