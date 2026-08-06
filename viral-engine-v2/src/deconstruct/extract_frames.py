"""Stage 1b — extract 2 frames per detected shot (head + mid) at 480px wide,
then tile them into labelled contact sheets for the vision pass.

    python extract_frames.py work/cuts_ref.json work/frames
"""

import json
import subprocess
import sys
from pathlib import Path


def ffmpeg_exe() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def grab(src: Path, t: float, dest: Path, ffmpeg: str, width: int = 480):
    subprocess.run([
        ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
        "-ss", f"{t:.3f}", "-i", str(src), "-frames:v", "1",
        "-vf", f"scale={width}:-2", str(dest),
    ], check=True)


def extract(cuts_json: Path, out_dir: Path) -> list[dict]:
    ff = ffmpeg_exe()
    data = json.loads(cuts_json.read_text())
    src = Path(data["source"])
    out_dir.mkdir(parents=True, exist_ok=True)
    frames = []
    for s in data["shots"]:
        head = s["start"] + min(0.12, s["len"] * 0.15)
        mid = s["start"] + s["len"] * 0.55
        for tag, t in (("a", head), ("b", mid)):
            p = out_dir / f"s{s['i']:02d}{tag}.jpg"
            grab(src, t, p, ff)
            frames.append({"shot": s["i"], "tag": tag, "t": round(t, 2),
                           "start": s["start"], "end": s["end"], "len": s["len"],
                           "path": str(p)})
    return frames


def contact_sheets(frames: list[dict], out_dir: Path, per_sheet: int = 12, cols: int = 4):
    """Tile head-frames into grids so a vision model can read many shots at once."""
    ff = ffmpeg_exe()
    heads = [f for f in frames if f["tag"] == "a"]
    sheets = []
    for n, i in enumerate(range(0, len(heads), per_sheet)):
        batch = heads[i:i + per_sheet]
        lst = out_dir / f"sheet{n}.txt"
        lst.write_text("".join(f"file '{Path(f['path']).name}'\n" for f in batch))
        dest = out_dir / f"sheet{n}.jpg"
        rows = (len(batch) + cols - 1) // cols
        subprocess.run([
            ff, "-y", "-hide_banner", "-loglevel", "error",
            "-f", "concat", "-safe", "0", "-r", "1", "-i", lst.name,
            "-vf", f"scale=360:-2,tile={cols}x{rows}:margin=6:padding=6:color=0x101014",
            "-frames:v", "1", dest.name,
        ], check=True, cwd=out_dir)
        sheets.append({"sheet": str(dest),
                       "shots": [{"i": f["shot"], "start": f["start"], "end": f["end"],
                                  "len": f["len"]} for f in batch]})
    return sheets


if __name__ == "__main__":
    cuts = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("work/frames")
    frames = extract(cuts, out)
    sheets = contact_sheets(frames, out)
    (out / "index.json").write_text(json.dumps({"frames": frames, "sheets": sheets}, indent=2))
    print(f"{len(frames)} frames, {len(sheets)} contact sheets -> {out}")
    for s in sheets:
        ids = ", ".join(str(x["i"]) for x in s["shots"])
        print(f"  {Path(s['sheet']).name}: shots {ids}")
