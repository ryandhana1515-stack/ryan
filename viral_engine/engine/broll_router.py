"""Viral Content Engine — Stage 6: B-roll sourcing.

Routes each entry in broll_map.json to a source by tag class:

    generic_business   -> Pexels
    tech_abstract      -> Pixabay
    cinematic_hero     -> local library, else Pexels (swap in Artgrid manually)
    impossible         -> Kling (prompts written to kling_prompts.json for generation)
    screen_recording   -> local library only

Every downloaded clip is also copied into library/clips/ and indexed in
library/index.json, so over time you stop paying per-pull.

    python broll_router.py runs/<run-dir>
"""

import argparse
import hashlib
import json
import shutil
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

import os

ENGINE_DIR = Path(__file__).resolve().parent.parent
LIBRARY = ENGINE_DIR / "library"
LIBRARY_CLIPS = LIBRARY / "clips"
LIBRARY_INDEX = LIBRARY / "index.json"


def load_index() -> list:
    if LIBRARY_INDEX.exists():
        return json.loads(LIBRARY_INDEX.read_text())
    return []


def save_index(index: list):
    LIBRARY_INDEX.write_text(json.dumps(index, indent=2))


def library_lookup(index: list, keyword: str) -> Path | None:
    """Match a keyword against library tags. All keyword words must appear in tags."""
    words = set(keyword.lower().split())
    for entry in index:
        tags = set(" ".join(entry["tags"]).lower().split())
        if words <= tags:
            path = LIBRARY_CLIPS / entry["file"]
            if path.exists():
                return path
    return None


def library_add(index: list, clip: Path, keyword: str, source: str):
    digest = hashlib.md5(clip.read_bytes()).hexdigest()[:10]
    filename = f"{digest}-{clip.name}"
    LIBRARY_CLIPS.mkdir(parents=True, exist_ok=True)
    shutil.copy(clip, LIBRARY_CLIPS / filename)
    index.append({"file": filename, "tags": keyword.lower().split(), "source": source})


def pexels_search(keyword: str) -> str | None:
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return None
    resp = requests.get(
        "https://api.pexels.com/videos/search",
        headers={"Authorization": key},
        params={"query": keyword, "orientation": "portrait", "per_page": 3},
        timeout=60,
    )
    resp.raise_for_status()
    for video in resp.json().get("videos", []):
        files = sorted(video["video_files"], key=lambda f: f.get("height") or 0, reverse=True)
        for f in files:
            if (f.get("height") or 0) >= 1080:
                return f["link"]
        if files:
            return files[0]["link"]
    return None


def pixabay_search(keyword: str) -> str | None:
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        return None
    resp = requests.get(
        "https://pixabay.com/api/videos/",
        params={"key": key, "q": keyword, "per_page": 3},
        timeout=60,
    )
    resp.raise_for_status()
    hits = resp.json().get("hits", [])
    if not hits:
        return None
    videos = hits[0]["videos"]
    for size in ("large", "medium", "small"):
        if videos.get(size, {}).get("url"):
            return videos[size]["url"]
    return None


def download(url: str, dest: Path):
    resp = requests.get(url, timeout=300)
    resp.raise_for_status()
    dest.write_bytes(resp.content)


def source_clip(entry: dict, dest: Path, index: list) -> tuple[str | None, str | None]:
    """Try sources in priority order for this entry's class.

    Returns (source_name, source_url). source_url is kept so the JSON2Video
    render lane can reference the asset without re-hosting it.
    """
    cls = entry["source_class"]
    keywords = [entry["primary_keyword"], entry.get("fallback_keyword", "")]

    # Local library first for every class — it's free.
    for kw in keywords:
        hit = library_lookup(index, kw)
        if hit:
            shutil.copy(hit, dest)
            return "library", None

    if cls == "screen_recording":
        return None, None  # only ever from your own library
    if cls == "impossible":
        return "kling_pending", None

    searchers = {
        "generic_business": [pexels_search, pixabay_search],
        "tech_abstract": [pixabay_search, pexels_search],
        "cinematic_hero": [pexels_search, pixabay_search],  # swap for Artgrid manually
    }.get(cls, [pexels_search, pixabay_search])

    for kw in keywords:
        if not kw:
            continue
        for search in searchers:
            url = search(kw)
            if url:
                download(url, dest)
                name = search.__name__.replace("_search", "")
                library_add(index, dest, kw, name)
                return name, url
    return None, None


def main():
    ap = argparse.ArgumentParser(description="Viral Content Engine: stage 6 (B-roll)")
    ap.add_argument("run_dir", type=Path)
    args = ap.parse_args()

    broll_map = json.loads((args.run_dir / "broll_map.json").read_text())
    broll_dir = args.run_dir / "broll"
    broll_dir.mkdir(exist_ok=True)
    index = load_index()

    assets, kling_prompts, missing = [], [], []
    for i, entry in enumerate(broll_map):
        dest = broll_dir / f"clip_{i:02d}.mp4"
        source, url = source_clip(entry, dest, index)
        if source == "kling_pending":
            kling_prompts.append({
                "clip": dest.name,
                "prompt": entry.get("kling_prompt") or entry["primary_keyword"],
                "duration_sec": entry["duration_sec"],
            })
            print(f"  clip_{i:02d}: KLING -> queued ({entry['primary_keyword']})")
        elif source:
            print(f"  clip_{i:02d}: {source} -> {entry['primary_keyword']}")
        else:
            missing.append(dest.name)
            print(f"  clip_{i:02d}: MISSING ({entry['primary_keyword']}) — add to library or source manually")
        assets.append({
            "clip": dest.name,
            "line_id": entry["line_id"],
            "duration_sec": entry["duration_sec"],
            "source": source or "missing",
            "url": url,
            "keyword": entry["primary_keyword"],
        })

    save_index(index)
    (args.run_dir / "broll_assets.json").write_text(json.dumps(assets, indent=2))
    if kling_prompts:
        (args.run_dir / "kling_prompts.json").write_text(json.dumps(kling_prompts, indent=2))
        print(f"\n{len(kling_prompts)} Kling prompt(s) written to kling_prompts.json.")
        print("Generate them (Kling MCP / app), then drop the MP4s into broll/ with the listed clip names.")
    if missing:
        print(f"\n{len(missing)} clip(s) unresolved: {', '.join(missing)}")


if __name__ == "__main__":
    main()
