"""Viral Content Engine — the 100-variant engine (Section 8 of the blueprint).

Once one video works, mine it: permute hook, B-roll set, voice pace, caption
style and thumbnail frame over the SAME render.json, and emit one render spec
per permutation into runs/<run-dir>/variants/.

Config (variants.json in the run dir — generate a starter with --init):

{
  "hooks": ["hook line 1", "hook line 2", ...],           # x5
  "broll_sets": ["broll", "broll_alt1", ...],             # dirs or URL lists  x4
  "voice_pace_wpm": [165, 185],                           # x2
  "caption_styles": [{...json2video subtitle settings...}, {...}],  # x2
  "thumbnail_frames": [0, 2]                              # scene index  x2
}
  -> 5 x 4 x 2 x 2 x 2 = 160 permutations from ONE script

    python variant_engine.py runs/<run-dir> --init
    python variant_engine.py runs/<run-dir> --limit 20
    python variant_engine.py runs/<run-dir> --render --limit 5
"""

import argparse
import copy
import itertools
import json
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

STARTER_CONFIG = {
    "hooks": [],
    "broll_sets": ["broll"],
    "voice_pace_wpm": [165, 185],
    "caption_styles": [
        {"style": "boxed-word", "font-family": "Oswald Bold", "word-color": "#FFFF00"},
        {"style": "classic", "font-family": "Montserrat ExtraBold", "word-color": "#FFFFFF"},
    ],
    "thumbnail_frames": [0],
}


def apply_variant(base: dict, hook: str, broll_set: str, pace: int, caption: dict, thumb: int) -> dict:
    movie = copy.deepcopy(base)
    # Hook text overlay on the first scene
    if hook and movie["scenes"]:
        movie["scenes"][0]["elements"] = [
            e for e in movie["scenes"][0]["elements"] if e.get("type") != "text"
        ] + [{"type": "text", "text": hook, "position": "top-center", "duration": -1}]
    # Alternate B-roll set: swap the directory prefix in local srcs
    if broll_set != "broll":
        for scene in movie["scenes"]:
            for el in scene["elements"]:
                if el.get("type") == "video" and "UPLOAD_ME/" in el.get("src", ""):
                    el["src"] = el["src"].replace("UPLOAD_ME/", f"UPLOAD_ME/{broll_set}/")
    # Pace: scale scene durations (165 wpm is the baseline)
    factor = 165.0 / pace
    for scene in movie["scenes"]:
        for el in scene["elements"]:
            if el.get("type") == "video" and el.get("duration"):
                el["duration"] = round(el["duration"] * factor, 2)
    # Caption style
    for el in movie.get("elements", []):
        if el.get("type") == "subtitles":
            el["settings"].update(caption)
    movie["_variant"] = {
        "hook": hook, "broll_set": broll_set, "voice_pace_wpm": pace,
        "caption_style": caption.get("style"), "thumbnail_frame": thumb,
    }
    return movie


def main():
    ap = argparse.ArgumentParser(description="Viral Content Engine: variant engine")
    ap.add_argument("run_dir", type=Path)
    ap.add_argument("--init", action="store_true", help="Write a starter variants.json and exit")
    ap.add_argument("--limit", type=int, default=0, help="Cap the number of variants emitted")
    args = ap.parse_args()

    config_path = args.run_dir / "variants.json"
    if args.init:
        starter = copy.deepcopy(STARTER_CONFIG)
        script = json.loads((args.run_dir / "script.json").read_text())
        starter["hooks"] = [script["hook"]]
        config_path.write_text(json.dumps(starter, indent=2))
        print(f"{config_path} written — add 4 more hook variants and alt B-roll sets, then re-run.")
        return

    base = json.loads((args.run_dir / "render.json").read_text())
    cfg = json.loads(config_path.read_text())
    out_dir = args.run_dir / "variants"
    out_dir.mkdir(exist_ok=True)

    combos = itertools.product(
        cfg["hooks"], cfg["broll_sets"], cfg["voice_pace_wpm"],
        cfg["caption_styles"], cfg["thumbnail_frames"],
    )
    manifest = []
    for n, (hook, broll_set, pace, caption, thumb) in enumerate(combos):
        if args.limit and n >= args.limit:
            break
        movie = apply_variant(base, hook, broll_set, pace, caption, thumb)
        name = f"variant_{n:03d}.json"
        (out_dir / name).write_text(json.dumps(movie, indent=2))
        manifest.append({"file": name, **movie["_variant"]})

    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"{len(manifest)} variant spec(s) in {out_dir}. Render each via:")
    print("  timeline_builder.render_json2video() or the n8n render node.")
    print("Log views/watch-time per variant in your tracking sheet — after ~40")
    print("data points you'll know which hook_type and broll_set win.")


if __name__ == "__main__":
    main()
