"""Stages 5 + 7 + 8 — graphics render, sound design, composite.

Reads a shot plan and the conditioned A-roll, renders each graphic shot from the
component library frame-by-frame, composites the layers, synthesises an SFX
transient on every cut, and masters to -14 LUFS.

  mode "aroll"    L1 only, full-bleed
  mode "split"    graphic in the top band, A-roll reframed into the bottom band
  mode "graphic"  full-bleed graphic, the creator's voice continues underneath

    python src/build_video.py work/shots_louis.json out/final.mp4
"""

import json
import math
import subprocess
import sys
import wave
from pathlib import Path

W, H = 1080, 1920
CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"


def ff() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def run(args, cwd=None):
    r = subprocess.run(args, capture_output=True, text=True, cwd=cwd)
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg failed:\n{' '.join(str(a) for a in args)[:400]}\n{r.stderr[-2000:]}")
    return r


# ---------------------------------------------------------------- graphics
def render_graphics(shots, fps, work: Path) -> dict[int, Path]:
    """Render every graphic/split shot to a PNG sequence via the component library."""
    from playwright.sync_api import sync_playwright
    import hashlib
    out = {}
    gdir = work / "gfx"
    gdir.mkdir(parents=True, exist_ok=True)
    lib = Path("src/graphics/components.html")
    page_url = lib.resolve().as_uri()
    lib_hash = hashlib.sha256(lib.read_bytes()).hexdigest()[:12]

    def stamp_of(s, n):
        # a shot's frames depend only on the library and its own spec
        key = json.dumps([lib_hash, s["component"], s.get("props", {}), n, fps], sort_keys=True)
        return hashlib.sha256(key.encode()).hexdigest()[:16]

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROMIUM,
                                    args=["--no-sandbox", "--force-color-profile=srgb"])
        page = browser.new_page(viewport={"width": W, "height": H})
        page.goto(page_url)
        page.wait_for_timeout(400)
        for i, s in enumerate(shots):
            if s["mode"] == "aroll":
                continue
            d = gdir / f"s{i:02d}"
            d.mkdir(exist_ok=True)
            n = max(1, int(round((s["end"] - s["start"]) * fps)))
            want = stamp_of(s, n)
            cached = d / "stamp"
            if cached.exists() and cached.read_text() == want \
                    and len(list(d.glob("f*.png"))) == n:
                out[i] = d
                print(f"  gfx shot {i:02d} {s['component']:<14} {n:3d} frames (cached)", flush=True)
                continue
            for stale in d.glob("f*.png"):
                stale.unlink()
            spec = {"component": s["component"], "props": s.get("props", {}),
                    "start": 0.0, "end": s["end"] - s["start"], "opaque": True}
            for k in range(n):
                page.evaluate("([spec,t]) => renderShot(spec,t)", [spec, k / fps])
                page.screenshot(path=str(d / f"f{k:04d}.png"))
            cached.write_text(want)
            out[i] = d
            print(f"  gfx shot {i:02d} {s['component']:<14} {n:3d} frames", flush=True)
        browser.close()
    return out


# ---------------------------------------------------------------- sound
def sfx(kind: str, path: Path, sr=44100):
    """Synthesised transients — whoosh / sub / tick / riser."""
    import struct
    import random
    dur = {"whoosh": 0.45, "sub": 0.55, "tick": 0.10, "riser": 0.9}.get(kind, 0.2)
    n = int(sr * dur)
    data = []
    random.seed(hash(kind) & 0xffff)
    for i in range(n):
        t = i / sr
        u = t / dur
        if kind == "whoosh":
            env = math.sin(math.pi * u) ** 1.5
            v = (random.uniform(-1, 1)) * env * 0.5
            v *= 0.35 + 0.65 * math.sin(math.pi * u)
        elif kind == "sub":
            f = 120 * (1 - u) + 38
            v = math.sin(2 * math.pi * f * t) * math.exp(-4.0 * u) * 0.85
        elif kind == "tick":
            v = (random.uniform(-1, 1)) * math.exp(-60 * u) * 0.55
        else:  # riser
            f = 220 + 900 * (u ** 2)
            v = math.sin(2 * math.pi * f * t) * (u ** 1.5) * 0.4
            v += random.uniform(-1, 1) * (u ** 3) * 0.18
        data.append(int(max(-1, min(1, v)) * 32767))
    with wave.open(str(path), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(struct.pack(f"<{len(data)}h", *data))


def build_audio(shots, aroll: Path, dest: Path, work: Path, total: float):
    """Voice + an SFX transient on every cut, mastered to -14 LUFS."""
    f = ff()
    sdir = work / "sfx"
    sdir.mkdir(parents=True, exist_ok=True)
    kinds = sorted({s.get("sfx", "tick") for s in shots})
    for k in kinds:
        sfx(k, sdir / f"{k}.wav")

    inputs, filt, mixes = ["-i", str(aroll)], [], ["[0:a]"]
    for i, s in enumerate(shots):
        if i == 0:
            continue  # no transient on the very first frame
        k = s.get("sfx", "tick")
        inputs += ["-i", str(sdir / f"{k}.wav")]
        idx = len(inputs) // 2 - 1
        delay = int(s["start"] * 1000)
        gain = {"tick": 0.30, "whoosh": 0.40, "sub": 0.55, "riser": 0.35}.get(k, 0.3)
        filt.append(f"[{idx}:a]adelay={delay}|{delay},volume={gain}[x{idx}]")
        mixes.append(f"[x{idx}]")
    filt.append("".join(mixes) + f"amix=inputs={len(mixes)}:normalize=0:duration=first[mix]")
    filt.append("[mix]loudnorm=I=-14:TP=-1.5:LRA=11[out]")
    run([f, "-y", "-hide_banner", "-loglevel", "error", *inputs,
         "-filter_complex", ";".join(filt), "-map", "[out]",
         "-c:a", "aac", "-b:a", "192k", "-ar", "44100", str(dest)])


# ---------------------------------------------------------------- composite
def composite(plan: dict, dest: Path, work: Path):
    f = ff()
    fps = plan.get("fps", 30)
    aroll = Path(plan["aroll"])
    shots = plan["shots"]
    band_y = plan.get("aroll_band_crop_y", 520)

    gfx = render_graphics(shots, fps, work)

    clips = []
    cdir = work / "clips"
    cdir.mkdir(parents=True, exist_ok=True)
    for i, s in enumerate(shots):
        dur = s["end"] - s["start"]
        out = cdir / f"c{i:02d}.mp4"
        if s["mode"] == "aroll":
            run([f, "-y", "-hide_banner", "-loglevel", "error",
                 "-ss", f"{s['start']:.3f}", "-t", f"{dur:.3f}", "-i", str(aroll),
                 "-an", "-vf", f"fps={fps},scale={W}:{H},setsar=1",
                 "-c:v", "libx264", "-preset", "medium", "-crf", "18", str(out)])
        elif s["mode"] == "graphic":
            run([f, "-y", "-hide_banner", "-loglevel", "error",
                 "-framerate", str(fps), "-i", str(gfx[i] / "f%04d.png"),
                 "-an", "-vf", f"scale={W}:{H},setsar=1", "-frames:v", str(int(dur * fps)),
                 "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                 "-pix_fmt", "yuv420p", str(out)])
        else:  # split — graphic top band, A-roll reframed into the bottom band
            run([f, "-y", "-hide_banner", "-loglevel", "error",
                 "-framerate", str(fps), "-i", str(gfx[i] / "f%04d.png"),
                 "-ss", f"{s['start']:.3f}", "-t", f"{dur:.3f}", "-i", str(aroll),
                 "-filter_complex",
                 (f"[0:v]crop={W}:{H//2}:0:{(H-H//2)//2},setsar=1[top];"
                  f"[1:v]fps={fps},crop={W}:{H//2}:0:{band_y},setsar=1[bot];"
                  f"[top][bot]vstack=inputs=2[v]"),
                 "-map", "[v]", "-an", "-frames:v", str(int(dur * fps)),
                 "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                 "-pix_fmt", "yuv420p", str(out)])
        clips.append(out)
        print(f"  clip {i:02d} {s['mode']:<8} {dur:5.2f}s", flush=True)

    lst = cdir / "list.txt"
    lst.write_text("".join(f"file '{c.name}'\n" for c in clips))
    silent = work / "video_silent.mp4"
    run([f, "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", lst.name, "-c", "copy", str(silent.resolve())], cwd=cdir)

    total = sum(s["end"] - s["start"] for s in shots)
    audio = work / "audio_master.m4a"
    build_audio(shots, aroll, audio, work, total)

    ass = work / "captions.ass"
    vf = f"subtitles={ass.name}" if ass.exists() else "null"
    dest.parent.mkdir(parents=True, exist_ok=True)
    run([f, "-y", "-hide_banner", "-loglevel", "error",
         "-i", str(silent.resolve()), "-i", str(audio.resolve()),
         "-map", "0:v", "-map", "1:a", "-vf", vf,
         "-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p",
         "-b:v", "10M", "-minrate", "8M", "-maxrate", "12M", "-bufsize", "20M",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dest.resolve())],
        cwd=work)
    return dest


if __name__ == "__main__":
    plan = json.loads(Path(sys.argv[1]).read_text())
    out = composite(plan, Path(sys.argv[2]) if len(sys.argv) > 2 else Path("out/final.mp4"),
                    Path("work"))
    print(f"\n-> {out}")
