"""Stage 9 — QC gate.

Measures the finished render and compares it to the blueprint. Hard-fails and
refuses delivery if any check fails. A failed render is a bug, not a deliverable.

    python src/qc/check.py out/final.mp4 blueprints/x.json work/shots.json
"""

import json
import re
import subprocess
import sys
from pathlib import Path


def ff() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def probe(path: Path) -> dict:
    f = ff()
    err = subprocess.run([f, "-hide_banner", "-i", str(path)],
                         capture_output=True, text=True).stderr
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
    total = int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 + float(dur.group(3))
    vid = re.search(r"Video: .*?(\d{3,4})x(\d{3,4}).*?(\d+(?:\.\d+)?) fps", err, re.S)
    br = re.search(r"bitrate: (\d+) kb/s", err)
    return {"duration": round(total, 2),
            "width": int(vid.group(1)) if vid else 0,
            "height": int(vid.group(2)) if vid else 0,
            "fps": float(vid.group(3)) if vid else 0.0,
            "bitrate_kbps": int(br.group(1)) if br else 0,
            "has_audio": "Audio:" in err}


def cut_count(path: Path, threshold=0.3) -> int:
    f = ff()
    err = subprocess.run([f, "-hide_banner", "-i", str(path),
                          "-filter:v", f"select='gt(scene,{threshold})',showinfo",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    return len({round(float(m), 2) for m in re.findall(r"pts_time:([\d.]+)", err)})


def frozen_runs(path: Path, min_sec=0.5) -> int:
    """Count runs of near-identical frames longer than min_sec (freeze detection)."""
    f = ff()
    err = subprocess.run([f, "-hide_banner", "-i", str(path),
                          "-vf", f"freezedetect=n=-58dB:d={min_sec}",
                          "-map", "0:v", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return len(re.findall(r"freeze_start", err))


def loudness(path: Path) -> float | None:
    f = ff()
    err = subprocess.run([f, "-hide_banner", "-i", str(path),
                          "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.search(r'"input_i"\s*:\s*"(-?[\d.]+)"', err)
    return float(m.group(1)) if m else None


def check(video: Path, blueprint: dict, plan: dict) -> dict:
    p = probe(video)
    shots = plan["shots"]
    mean_shot = p["duration"] / max(len(shots), 1)
    bp_mean = blueprint["mean_shot_sec"]
    bp_cuts_per10 = blueprint["cuts_per_10s"]
    expect_cuts = bp_cuts_per10 * p["duration"] / 10.0
    cuts = cut_count(video)
    frozen = frozen_runs(video)
    lufs = loudness(video)
    used = {s.get("component") for s in shots if s.get("component")}
    vocab = {g["name"] for g in blueprint["graphic_vocabulary"]}
    # components that exist to decorate another shot are not separately schedulable
    schedulable = vocab - {"CaptionPill", "DashedFrame"}
    covered = len(used & schedulable) / max(len(schedulable), 1)

    checks = [
        ("resolution 1080x1920", p["width"] == 1080 and p["height"] == 1920,
         f"{p['width']}x{p['height']}"),
        ("fps >= 30", p["fps"] >= 29.9, f"{p['fps']}"),
        ("bitrate >= 8 Mbps", p["bitrate_kbps"] >= 8000, f"{p['bitrate_kbps']} kb/s"),
        ("mean shot within +/-25% of blueprint", abs(mean_shot - bp_mean) / bp_mean <= 0.25,
         f"{mean_shot:.2f}s vs blueprint {bp_mean}s"),
        ("cut count >= 80% of blueprint rate", cuts >= expect_cuts * 0.8,
         f"{cuts} detected vs {expect_cuts:.1f} expected"),
        ("zero frozen runs > 0.5s", frozen == 0, f"{frozen} freeze events"),
        ("audio present", p["has_audio"], str(p["has_audio"])),
        ("loudness -14 LUFS +/-1.5", lufs is not None and abs(lufs + 14) <= 1.5,
         f"{lufs} LUFS" if lufs is not None else "unmeasured"),
        ("graphic vocabulary >= 60% used", covered >= 0.60,
         f"{covered*100:.0f}% ({len(used & schedulable)}/{len(schedulable)})"),
        ("no placeholder cards", not any("PENDING" in json.dumps(s.get("props", {})).upper()
                                         for s in shots), "none"),
    ]
    failures = [(n, d) for n, ok, d in checks if not ok]
    return {"probe": p, "mean_shot_sec": round(mean_shot, 2), "cuts_detected": cuts,
            "frozen_runs": frozen, "lufs": lufs, "vocab_coverage": round(covered, 2),
            "checks": [{"name": n, "pass": ok, "detail": d} for n, ok, d in checks],
            "failures": failures, "passed": not failures}


if __name__ == "__main__":
    video = Path(sys.argv[1])
    blueprint = json.loads(Path(sys.argv[2]).read_text())
    plan = json.loads(Path(sys.argv[3]).read_text())
    r = check(video, blueprint, plan)
    print(f"QC GATE — {video}")
    for c in r["checks"]:
        print(f"  [{'PASS' if c['pass'] else 'FAIL'}] {c['name']:<40} {c['detail']}")
    if r["passed"]:
        print("\nAll checks passed — cleared for delivery.")
    else:
        print(f"\n{len(r['failures'])} FAILED — not a deliverable:")
        for n, d in r["failures"]:
            print(f"  - {n}: {d}")
    Path("work/qc_report.json").write_text(json.dumps(r, indent=2))
    sys.exit(0 if r["passed"] else 1)
