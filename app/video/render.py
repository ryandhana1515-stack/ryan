"""Final composition: concat completed scene clips with ffmpeg and export
platform formats. All local — no external rendering service needed."""
import subprocess
import uuid

from app import config
from app.video.providers import ffmpeg_exe

FORMATS = {
    "landscape_16_9": {"label": "YouTube / Website (16:9)", "w": 1280, "h": 720},
    "vertical_9_16": {"label": "TikTok / Reels / Shorts (9:16)", "w": 720, "h": 1280},
    "square_1_1": {"label": "Feed (1:1)", "w": 720, "h": 720},
}


def _reencode(src, dst, w: int, h: int) -> None:
    vf = (f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
          f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=0x0a0e1e,fps=24,format=yuv420p")
    subprocess.run([ffmpeg_exe(), "-y", "-i", str(src), "-vf", vf,
                    "-an", "-c:v", "libx264", "-preset", "fast", str(dst)],
                   check=True, capture_output=True, timeout=600)


def assemble(scene_paths: list[str], formats: list[str]) -> list[dict]:
    """scene_paths are /generated/... web paths of completed MP4 clips.
    Returns [{format, label, url}] of final exports."""
    gen = config.GENERATED_DIR
    gen.mkdir(parents=True, exist_ok=True)
    sources = [gen / p.rsplit("/", 1)[-1] for p in scene_paths]
    sources = [s for s in sources if s.exists() and s.suffix == ".mp4"]
    if not sources:
        raise RuntimeError("No completed MP4 scenes to assemble — generate scenes first.")

    outputs = []
    wanted = [f for f in formats if f in FORMATS] or ["landscape_16_9"]
    for fmt in wanted:
        spec = FORMATS[fmt]
        # normalize every clip to identical size/codec, then concat
        norm_paths = []
        for src in sources:
            norm = gen / f"norm_{uuid.uuid4().hex[:8]}.mp4"
            _reencode(src, norm, spec["w"], spec["h"])
            norm_paths.append(norm)
        listing = gen / f"concat_{uuid.uuid4().hex[:8]}.txt"
        listing.write_text("".join(f"file '{p.name}'\n" for p in norm_paths))
        final = gen / f"omnix_video_{fmt}_{uuid.uuid4().hex[:8]}.mp4"
        subprocess.run([ffmpeg_exe(), "-y", "-f", "concat", "-safe", "0",
                        "-i", str(listing), "-c", "copy", str(final)],
                       check=True, capture_output=True, timeout=600, cwd=gen)
        listing.unlink(missing_ok=True)
        for p in norm_paths:
            p.unlink(missing_ok=True)
        outputs.append({"format": fmt, "label": spec["label"],
                        "url": f"/generated/{final.name}"})
    return outputs
