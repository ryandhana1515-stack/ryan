"""Stage 3 — A-roll conditioning.

Takes the creator's raw footage + a speech-segment list and produces a
full-width, jump-cut, captioned 1080x1920 master.

  - silences between kept segments are removed -> jump cuts
  - video is scaled/cropped to fill 1080x1920 (full-width, never a card)
  - captions are word-level ASS, 3-4 words visible, styled from a blueprint
  - asserts frame coverage: the A-roll must fill its band edge to edge

    python condition.py edit.json out/checkpoint2.mp4
"""

import json
import re
import subprocess
import sys
from pathlib import Path

W, H, FPS = 1080, 1920, 30


def ff() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def run(args: list[str], cwd: Path | None = None):
    r = subprocess.run(args, capture_output=True, text=True, cwd=cwd)
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg failed:\n{r.stderr[-2500:]}")
    return r


def ass_time(t: float) -> str:
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def build_ass(lines: list[dict], style: dict, path: Path):
    """Word-level captions: <=N words visible, active word boxed in the accent."""
    maxw = style.get("max_words_visible", 4)
    fsize = int(H * style.get("height_share_of_frame", 0.055))
    ymargin = int(H * (1 - style.get("y_center_pct", 0.80)))
    accent = style.get("accent_hex", "#3AFF5F").lstrip("#")
    acc_bgr = f"&H00{accent[4:6]}{accent[2:4]}{accent[0:2]}"

    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,DejaVu Sans,{fsize},&H00FFFFFF,&H00FFFFFF,&H00000000,&HB0000000,-1,0,0,0,100,100,0,0,3,{max(6, fsize//9)},0,2,60,60,{ymargin},1
Style: Hot,DejaVu Sans,{fsize},&H00000000,&H00000000,&H00000000,&HD0{accent[4:6]}{accent[2:4]}{accent[0:2]},-1,0,0,0,100,100,0,0,3,{max(6, fsize//9)},0,2,60,60,{ymargin},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    for ln in lines:
        words = ln["words"]
        groups = [words[gi:gi + maxw] for gi in range(0, len(words), maxw)]
        for gidx, grp in enumerate(groups):
            # a group must vanish when the next one starts, or captions stack up
            grp_end = groups[gidx + 1][0]["t"] if gidx + 1 < len(groups) else ln["end"]
            for k, w in enumerate(grp):
                start = w["t"]
                end = grp[k + 1]["t"] if k + 1 < len(grp) else grp_end
                if end - start < 0.04:
                    continue
                txt = "".join(
                    (f"{{\\1c&H000000&\\3c{acc_bgr}\\bord{max(8, fsize//7)}}}{x['w']}{{\\r}} "
                     if j == k else f"{x['w']} ")
                    for j, x in enumerate(grp)).strip()
                ev.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Cap,,0,0,0,,{txt}")
    path.write_text(head + "\n".join(ev) + "\n")
    return len(ev)


def condition(edit: dict, dest: Path, work: Path = Path("work")):
    f = ff()
    work.mkdir(parents=True, exist_ok=True)
    src, audio = Path(edit["video"]), Path(edit["audio"])
    segs = edit["segments"]

    # 1. cut each kept speech segment, scaled to fill 1080x1920 (full-bleed band)
    parts, timeline, cursor = [], [], 0.0
    for i, s in enumerate(segs):
        a = max(0.0, s["start"] - edit.get("pre_roll", 0.12))
        b = s["end"] + edit.get("post_roll", 0.12)
        p = work / f"seg{i:02d}.mp4"
        run([f, "-y", "-hide_banner", "-loglevel", "error",
             "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", str(src),
             "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", str(audio),
             "-map", "0:v:0", "-map", "1:a:0",
             "-vf", (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
                     f"crop={W}:{H},fps={FPS},setsar=1"),
             "-c:v", "libx264", "-preset", "medium", "-crf", "18",
             "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "1", str(p)])
        dur = b - a
        # words distributed inside the segment, mapped onto the new timeline
        words = s["text"].split()
        weights = [len(x) + 3 for x in words]
        speech_start = cursor + edit.get("pre_roll", 0.12)
        span = s["end"] - s["start"]
        acc, wl = speech_start, []
        for wt, wd in zip(weights, words):
            wl.append({"w": wd, "t": round(acc, 3)})
            acc += span * wt / sum(weights)
        timeline.append({"end": round(cursor + dur, 3), "words": wl})
        parts.append(p)
        cursor += dur

    # 2. concat -> jump cuts
    lst = work / "concat.txt"
    lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    cut = work / "cut.mp4"
    run([f, "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", lst.name, "-c", "copy", str(cut.resolve())], cwd=work)

    # 3. captions
    ass = work / "captions.ass"
    n = build_ass(timeline, edit.get("caption_style", {}), ass)

    # 4. burn
    dest.parent.mkdir(parents=True, exist_ok=True)
    run([f, "-y", "-hide_banner", "-loglevel", "error", "-i", cut.name,
         "-vf", f"subtitles={ass.name}",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dest.resolve())],
        cwd=work)

    probe = subprocess.run([f, "-hide_banner", "-i", str(dest)],
                           capture_output=True, text=True).stderr
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe)
    total = int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 + float(dur.group(3))
    assert f"{W}x{H}" in probe, "A-roll is not 1080x1920 full-frame"
    return {"out": str(dest), "duration": round(total, 2), "cuts": len(segs) - 1,
            "caption_events": n,
            "mean_shot_sec": round(total / max(len(segs), 1), 2)}


if __name__ == "__main__":
    edit = json.loads(Path(sys.argv[1]).read_text())
    res = condition(edit, Path(sys.argv[2]) if len(sys.argv) > 2 else Path("out/checkpoint2.mp4"))
    print(json.dumps(res, indent=2))
