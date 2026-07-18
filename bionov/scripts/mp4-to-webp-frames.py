#!/usr/bin/env python3
"""Convert a Kling mp4 into a scroll-scrub WebP frame sequence.

usage: python3 scripts/mp4-to-webp-frames.py <clip.mp4> <outDir> [fps] [width]

Uses the static ffmpeg bundled with imageio-ffmpeg (no system ffmpeg
needed), extracts PNG frames, then encodes WebP with Pillow.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import imageio_ffmpeg
from PIL import Image

clip = Path(sys.argv[1])
out_dir = Path(sys.argv[2])
fps = int(sys.argv[3]) if len(sys.argv) > 3 else 20
width = int(sys.argv[4]) if len(sys.argv) > 4 else 1280

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
out_dir.mkdir(parents=True, exist_ok=True)

with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(
        [ffmpeg, "-y", "-i", str(clip), "-vf", f"fps={fps},scale={width}:-2",
         str(Path(tmp) / "f_%04d.png")],
        check=True, capture_output=True,
    )
    pngs = sorted(Path(tmp).glob("f_*.png"))
    for i, p in enumerate(pngs, start=1):
        Image.open(p).convert("RGB").save(
            out_dir / f"frame_{i:04d}.webp", "WEBP", quality=80, method=4
        )
    print(f"{clip.name}: {len(pngs)} frames -> {out_dir}")
