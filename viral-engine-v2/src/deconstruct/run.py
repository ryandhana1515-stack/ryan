"""Stage 1 orchestrator — reference video in, Shot Blueprint out.

    python src/deconstruct/run.py work/ref.mp4 blueprints/name.json [source_url]

Runs: cut detection (adaptive threshold) -> per-shot frames + contact sheets ->
Claude vision annotation -> mechanical layout/grade measurement -> blueprint.

Error policy: vision requires ANTHROPIC_API_KEY and raises without it. If an
existing work/vision.json is present it is reused (so annotations produced by
another route can be supplied), and that reuse is reported, never silent.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import blueprint as bp_mod
import detect_cuts
import extract_frames
import measure_layout


def run(src: Path, dest: Path, url: str = "", work: Path = Path("work")) -> dict:
    work.mkdir(parents=True, exist_ok=True)

    print(f"[1/4] scene detection: {src.name}")
    cuts = detect_cuts.detect(src)
    (work / "cuts.json").write_text(json.dumps(cuts, indent=2))
    print(f"      threshold {cuts['threshold_used']} · {cuts['cut_count']} cuts · "
          f"mean {cuts['mean_shot_sec']}s · median {cuts['median_shot_sec']}s")
    if cuts["warning"]:
        print(f"      WARNING: {cuts['warning']}")

    print("[2/4] frames + contact sheets")
    frames = extract_frames.extract(work / "cuts.json", work / "frames")
    sheets = extract_frames.contact_sheets(frames, work / "frames")
    (work / "frames" / "index.json").write_text(
        json.dumps({"frames": frames, "sheets": sheets}, indent=2))
    print(f"      {len(frames)} frames · {len(sheets)} sheets")

    print("[3/4] vision annotation")
    vis_path = work / "vision.json"
    if vis_path.exists():
        vision = json.loads(vis_path.read_text())
        print(f"      REUSING existing {vis_path} ({len(vision)} shots) — delete it to re-annotate")
    else:
        import vision as vision_mod
        vision = vision_mod.annotate(work / "frames" / "index.json")
        vis_path.write_text(json.dumps(vision, indent=2))
        print(f"      annotated {len(vision)} shots")

    print("[4/4] layout + grade measurement")
    layout = measure_layout.measure(work / "frames" / "index.json")
    (work / "layout.json").write_text(json.dumps(layout, indent=2))

    bp = bp_mod.build(cuts, layout, vision, url)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(bp, indent=2))
    print(f"\nShot Blueprint -> {dest}")
    return bp


if __name__ == "__main__":
    run(Path(sys.argv[1]),
        Path(sys.argv[2]) if len(sys.argv) > 2 else Path("blueprints/blueprint.json"),
        sys.argv[3] if len(sys.argv) > 3 else "")
