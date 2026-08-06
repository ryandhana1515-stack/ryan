"""Stage 1c — mechanical layout measurement per shot.

Finds the strongest horizontal composition seam (the split between a B-roll /
graphic band and the A-roll band) by looking for the row where the image
statistics change hardest. Gives the blueprint real numbers for:
  - split vs full-bleed
  - split ratio
  - dominant hue / contrast / brightness per band

    python measure_layout.py work/frames/index.json work/layout.json
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np


def load_jpg(path: Path) -> np.ndarray:
    """Decode a JPEG to RGB via ffmpeg (no PIL dependency)."""
    try:
        import imageio_ffmpeg
        ff = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        ff = "ffmpeg"
    probe = subprocess.run([ff, "-hide_banner", "-i", str(path)],
                           capture_output=True, text=True).stderr
    import re
    m = re.search(r", (\d+)x(\d+)", probe)
    w, h = int(m.group(1)), int(m.group(2))
    raw = subprocess.run([ff, "-v", "error", "-i", str(path),
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(np.float32)


def seam(img: np.ndarray) -> tuple[float, float]:
    """Return (best_split_ratio, seam_coverage).

    Two images butted together produce a discontinuity that runs the *entire
    width* as a straight line. An edge inside a graphic (a card, a UI bar) does
    not. So score each row by the FRACTION of columns that jump hard across it.
    """
    h = img.shape[0]
    diff = np.abs(np.diff(img.mean(axis=2), axis=0))  # (h-1, w) row-to-row jump
    frac = (diff > 24).mean(axis=1)                   # share of width that jumps
    lo, hi = int(h * 0.25), int(h * 0.75)
    band = frac[lo:hi]
    best = int(band.argmax())
    return round((lo + best + 1) / h, 3), round(float(band[best]), 3)


def band_stats(img: np.ndarray, y0: float, y1: float) -> dict:
    h = img.shape[0]
    b = img[int(h * y0):int(h * y1)]
    mx, mn = b.max(axis=2), b.min(axis=2)
    sat = float(((mx - mn) / (mx + 1e-6)).mean())
    r, g, bl = b[..., 0].mean(), b[..., 1].mean(), b[..., 2].mean()
    hue = "green" if g > r * 1.15 and g > bl * 1.15 else (
        "blue" if bl > r * 1.12 else ("warm" if r > bl * 1.12 else "neutral"))
    return {"brightness": round(float(b.mean()) / 255, 3),
            "contrast": round(float(b.std()) / 255, 3),
            "saturation": round(sat, 3), "dominant_hue": hue}


def measure(index_json: Path) -> list[dict]:
    idx = json.loads(index_json.read_text())
    out = []
    for f in idx["frames"]:
        if f["tag"] != "a":
            continue
        img = load_jpg(Path(f["path"]))
        ratio, strength = seam(img)
        split = strength >= 0.80 and 0.3 < ratio < 0.7  # seam spans >=80% of width
        rec = {"shot": f["shot"], "start": f["start"], "end": f["end"], "len": f["len"],
               "split_detected": bool(split), "split_ratio": ratio if split else None,
               "seam_coverage": strength,
               "full": band_stats(img, 0, 1)}
        if split:
            rec["top"] = band_stats(img, 0, ratio)
            rec["bottom"] = band_stats(img, ratio, 1)
        out.append(rec)
    return out


if __name__ == "__main__":
    res = measure(Path(sys.argv[1]))
    dest = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("work/layout.json")
    dest.write_text(json.dumps(res, indent=2))
    splits = [r for r in res if r["split_detected"]]
    print(f"{len(res)} shots measured, {len(splits)} split-composition")
    if splits:
        rr = [r["split_ratio"] for r in splits]
        print(f"  split ratio: median {sorted(rr)[len(rr)//2]}  range {min(rr)}-{max(rr)}")
    for r in res:
        tag = f"split @ {r['split_ratio']}" if r["split_detected"] else "full-bleed"
        print(f"  shot {r['shot']:2d} {r['len']:5.2f}s  {tag:<16} "
              f"seam {r['seam_coverage']:.2f} bright {r['full']['brightness']:.2f} hue {r['full']['dominant_hue']}")
    print(f"-> {dest}")
