"""Stage 1a — cut detection with adaptive threshold.

ffmpeg scene detection is the honesty check for a reference: a real short-form
edit registers 15-25 cuts at threshold 0.3. Anything that only registers below
0.15 is soft-dissolve slideshow material and is a bad style reference.

    python detect_cuts.py ref.mp4
"""

import json
import re
import subprocess
import sys
from pathlib import Path

LADDER = [0.3, 0.2, 0.15, 0.1]


def ffmpeg_exe() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def probe_duration(path: Path, ffmpeg: str) -> float:
    out = subprocess.run([ffmpeg, "-hide_banner", "-i", str(path)],
                         capture_output=True, text=True).stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out)
    if not m:
        raise RuntimeError(f"cannot probe duration of {path}")
    h, mi, s = m.groups()
    return int(h) * 3600 + int(mi) * 60 + float(s)


def cuts_at(path: Path, threshold: float, ffmpeg: str) -> list[float]:
    """Scene-change timestamps at a given threshold."""
    out = subprocess.run([
        ffmpeg, "-hide_banner", "-i", str(path),
        "-filter:v", f"select='gt(scene,{threshold})',showinfo",
        "-f", "null", "-",
    ], capture_output=True, text=True).stderr
    return sorted({round(float(m), 3) for m in re.findall(r"pts_time:([\d.]+)", out)})


def detect(path: Path, ffmpeg: str | None = None) -> dict:
    """Walk the threshold ladder until the cut density looks like a real edit."""
    ffmpeg = ffmpeg or ffmpeg_exe()
    duration = probe_duration(path, ffmpeg)
    target = duration / 4.0  # a real short-form edit cuts at least every ~4s
    ladder, chosen, chosen_cuts = [], None, []

    for t in LADDER:
        c = cuts_at(path, t, ffmpeg)
        ladder.append({"threshold": t, "cuts": len(c)})
        print(f"  threshold {t:<5} -> {len(c):>3} cuts", flush=True)
        if chosen is None and len(c) >= target:
            chosen, chosen_cuts = t, c

    if chosen is None:  # nothing hit target density; keep the most sensitive pass
        chosen = LADDER[-1]
        chosen_cuts = cuts_at(path, chosen, ffmpeg)

    warning = None
    if chosen <= 0.15:
        warning = (f"Reference only registers cuts at threshold {chosen}. This is "
                   "soft-dissolve / slideshow material, not a hard-cut edit. "
                   "It is a weak style reference.")

    # Shot boundaries = [0, ...cuts, duration]
    bounds = [0.0] + [c for c in chosen_cuts if 0.15 < c < duration - 0.15] + [round(duration, 3)]
    raw = [{"start": bounds[i], "end": bounds[i + 1],
            "len": round(bounds[i + 1] - bounds[i], 3)}
           for i in range(len(bounds) - 1)]

    # A sub-0.2s "shot" is not a shot — it is a flash/whip transition frame.
    # Merge it forward and record that the next shot arrives on a transition.
    MICRO = 0.2
    shots, pending_transition = [], None
    for r in raw:
        if r["len"] < MICRO:
            pending_transition = "flash"
            if shots:  # absorb into the previous shot's tail
                shots[-1]["end"] = r["end"]
                shots[-1]["len"] = round(shots[-1]["end"] - shots[-1]["start"], 3)
            continue
        r["transition_in"] = pending_transition or "cut"
        pending_transition = None
        shots.append(r)
    for i, s in enumerate(shots):
        s["i"] = i
    lens = sorted(s["len"] for s in shots)
    median = lens[len(lens) // 2] if lens else 0.0

    return {
        "source": str(path),
        "duration_sec": round(duration, 2),
        "threshold_ladder": ladder,
        "threshold_used": chosen,
        "warning": warning,
        "cut_count": len(shots) - 1,
        "cuts_per_10s": round((len(shots) - 1) / duration * 10, 2),
        "mean_shot_sec": round(sum(lens) / len(lens), 2) if lens else 0.0,
        "median_shot_sec": round(median, 2),
        "shots": shots,
    }


if __name__ == "__main__":
    src = Path(sys.argv[1])
    print(f"scene detection: {src.name}")
    res = detect(src)
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("work/cuts.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(res, indent=2))
    print(f"\n  used threshold : {res['threshold_used']}")
    print(f"  cuts           : {res['cut_count']}  ({res['cuts_per_10s']}/10s)")
    print(f"  mean shot      : {res['mean_shot_sec']}s")
    print(f"  median shot    : {res['median_shot_sec']}s")
    if res["warning"]:
        print(f"  WARNING: {res['warning']}")
    print(f"-> {out}")
