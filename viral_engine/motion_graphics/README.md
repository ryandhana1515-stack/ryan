# Motion Graphics Template

Code-driven motion-graphics lane (dark editorial style: kinetic word-by-word
captions with highlight boxes, animated workflow card, metric slam, CTA).
Renders 1080x1920 @ 24fps entirely from HTML/CSS/JS — no editor needed.

- `template.html` — the composition. Everything is a pure function of time:
  `window.seek(t)` positions every element for time `t`, so frames render
  deterministically. Fonts (Archivo Black + Inter) are embedded as base64.
  Script/captions/scene timings live in the `SEGS` array and the `seek()`
  scene blocks — edit those per video.
- `render.py` — Playwright frame renderer (uses the preinstalled Chromium).

Produce a video:

```bash
pip install playwright imageio-ffmpeg
# 1. voiceover.mp3 from ElevenLabs (or engine/tts.py)
# 2. adjust SEGS word timings to the voiceover length
python3 render.py                     # writes frames/f0000.png ...
FF=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
$FF -framerate 24 -i frames/f%04d.png -i voiceover.mp3 \
    -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a aac -movflags +faststart out.mp4
```

Style tokens (matching the reference aesthetic): bg #0a0a0c, accent #ff5e1c,
secondary #ffaa00, captions Archivo Black 74px with orange boxed highlight,
dot-grid + radial orange glow background.
