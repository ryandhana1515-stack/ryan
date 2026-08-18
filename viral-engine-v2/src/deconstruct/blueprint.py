"""Stage 1e — merge mechanical measures + vision annotations into a Shot Blueprint.

The blueprint captures FORM only: pacing, shot grammar, graphic vocabulary,
grade, caption style. It must never carry the reference's words, claims or
footage. That constraint is asserted in code, not just requested in a prompt.

    python blueprint.py work/cuts_ref.json work/layout.json work/vision.json \
        blueprints/<name>.json
"""

import json
import statistics
import sys
from pathlib import Path

# Fields that would carry the reference's CONTENT rather than its FORM.
CONTENT_FIELDS = ("caption_text_visible",)
AROLL_LAYERS = ("aroll", "split")


def assert_form_only(blueprint: dict):
    """Hard-fail if any transcript-like content leaked into the blueprint."""
    blob = json.dumps(blueprint)
    for f in CONTENT_FIELDS:
        if f in blob:
            raise AssertionError(f"blueprint leaked content field '{f}' — form only")
    for shot in blueprint["shots"]:
        for k, v in shot.items():
            if isinstance(v, str) and len(v) > 240:
                raise AssertionError(f"shot {shot['i']} field '{k}' looks like copied content")


def build(cuts: dict, layout: list[dict], vision: list[dict], source_url: str = "") -> dict:
    lay = {r["shot"]: r for r in layout}
    vis = {v["i"]: v for v in vision}
    lens = [s["len"] for s in cuts["shots"]]

    shots, vocab = [], {}
    aroll_time = 0.0
    for s in cuts["shots"]:
        i = s["i"]
        v, l = vis.get(i, {}), lay.get(i, {})
        layer = v.get("layer", "broll")
        if layer in AROLL_LAYERS:
            aroll_time += s["len"]
        ratio = v.get("split_ratio") or l.get("split_ratio")
        shot = {
            "i": i, "start": s["start"], "end": s["end"], "len": s["len"],
            "layer": layer,
            "split_ratio": round(ratio, 3) if layer == "split" and ratio else None,
            "framing": v.get("framing", ""),
            "camera_move": v.get("camera_move", "static"),
            "graphics_on_screen": [g["name"] for g in v.get("graphics_on_screen", [])],
            "transition_in": v.get("transition_in", s.get("transition_in", "cut")),
            "sfx_hint": v.get("sfx_hint", "none"),
            "measured": {"brightness": l.get("full", {}).get("brightness"),
                         "contrast": l.get("full", {}).get("contrast"),
                         "saturation": l.get("full", {}).get("saturation"),
                         "dominant_hue": l.get("full", {}).get("dominant_hue")},
        }
        shots.append(shot)
        for g in v.get("graphics_on_screen", []):
            e = vocab.setdefault(g["name"], {"name": g["name"], "position": g.get("position", ""),
                                             "anim_in": g.get("anim_in", ""), "uses": 0,
                                             "total_sec": 0.0})
            e["uses"] += 1
            e["total_sec"] = round(e["total_sec"] + s["len"], 2)

    for e in vocab.values():
        e["duration_sec"] = round(e["total_sec"] / e["uses"], 2)
        del e["total_sec"]

    bright = [l["full"]["brightness"] for l in layout if l.get("full")]
    contrast = [l["full"]["contrast"] for l in layout if l.get("full")]
    hues = [l["full"]["dominant_hue"] for l in layout if l.get("full")]
    dominant = max(set(hues), key=hues.count)
    splits = [s["split_ratio"] for s in shots if s["layer"] == "split" and s["split_ratio"]]

    bp = {
        "source_url": source_url,
        "source_file": cuts["source"],
        "duration_sec": cuts["duration_sec"],
        "cut_count": cuts["cut_count"],
        "cuts_per_10s": cuts["cuts_per_10s"],
        "mean_shot_sec": round(statistics.mean(lens), 2),
        "median_shot_sec": round(statistics.median(lens), 2),
        "shot_len_p10_p90": [round(sorted(lens)[int(len(lens) * 0.1)], 2),
                             round(sorted(lens)[int(len(lens) * 0.9)], 2)],
        "threshold_used": cuts["threshold_used"],
        "aroll_seconds": round(aroll_time, 2),
        "aroll_share": round(aroll_time / cuts["duration_sec"], 3),
        "aroll_broll_ratio": round(aroll_time / max(cuts["duration_sec"] - aroll_time, 0.01), 3),
        "composition": {
            "aroll_presentation": "split_band" if splits else "full_bleed",
            "split_ratio_median": round(statistics.median(splits), 3) if splits else None,
            "aroll_band": "bottom",
            "aroll_is_full_width": True,
            "aroll_floating_card": False,
        },
        "grade": {
            "lut_description": ("crushed blacks, high contrast, near-monochrome dark base with a "
                                "single saturated green accent; AI b-roll skews cyan-blue neon; "
                                "presenter band left neutral-warm; fine film grain, soft vignette"),
            "dominant_hue": dominant,
            "accent_hex": "#3AFF5F",
            "mean_brightness": round(statistics.mean(bright), 3),
            "mean_contrast": round(statistics.mean(contrast), 3),
            "grain": "fine",
            "backdrop_motif": "dark plane with palm-frond gobo shadow and faint square grid",
        },
        "caption_style": {
            "position": "lower-third",
            "y_center_pct": 0.80,
            "max_words_visible": 4,
            "font_weight": "800",
            "case": "sentence",
            "highlight_mode": "box",
            "highlight_colour": "#000000",
            "box_opacity": 0.75,
            "corner_radius_px": 10,
            "text_colour": "#FFFFFF",
            "height_share_of_frame": 0.06,
        },
        "graphic_vocabulary": sorted(vocab.values(), key=lambda e: -e["uses"]),
        "shots": shots,
        "beat_map": [],
        "constraints": {
            "form_only": True,
            "note": ("Pacing, shot grammar, graphic vocabulary, grade and caption style only. "
                     "No script, claims, examples or footage from the source."),
        },
    }

    # beat map from shot grammar: opening hook, body, payoff, cta
    d = bp["duration_sec"]
    bp["beat_map"] = [
        {"beat": 1, "function": "hook", "start": 0.0, "end": round(d * 0.12, 2)},
        {"beat": 2, "function": "context", "start": round(d * 0.12, 2), "end": round(d * 0.28, 2)},
        {"beat": 3, "function": "demo", "start": round(d * 0.28, 2), "end": round(d * 0.78, 2)},
        {"beat": 4, "function": "payoff", "start": round(d * 0.78, 2), "end": round(d * 0.92, 2)},
        {"beat": 5, "function": "cta", "start": round(d * 0.92, 2), "end": d},
    ]
    assert_form_only(bp)
    return bp


if __name__ == "__main__":
    cuts = json.loads(Path(sys.argv[1]).read_text())
    layout = json.loads(Path(sys.argv[2]).read_text())
    vision = json.loads(Path(sys.argv[3]).read_text())
    dest = Path(sys.argv[4]) if len(sys.argv) > 4 else Path("blueprints/blueprint.json")
    url = sys.argv[5] if len(sys.argv) > 5 else ""
    bp = build(cuts, layout, vision, url)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(bp, indent=2))
    print(f"Shot Blueprint -> {dest}")
    print(f"  {bp['duration_sec']}s · {bp['cut_count']} cuts · mean {bp['mean_shot_sec']}s "
          f"· median {bp['median_shot_sec']}s")
    print(f"  A-roll {bp['aroll_seconds']}s ({bp['aroll_share']*100:.0f}%) as "
          f"{bp['composition']['aroll_presentation']} @ {bp['composition']['split_ratio_median']}")
    print(f"  graphics: {', '.join(g['name'] for g in bp['graphic_vocabulary'])}")
