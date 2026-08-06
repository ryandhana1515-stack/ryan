# viral-engine-v2

Rebuild of the short-form video system. The old one (n8n `FYNbtG0oHGWiDI2g`)
treated a video as a list of assets glued to a voice track and produced a
slideshow. This one models a video as **layers composited on a timeline** and
copies the **form** of a reference — pacing, shot grammar, graphic vocabulary,
grade, caption style — never its content.

```
L5  GRADE      grain + vignette + unified LUT
L4  CAPTIONS   word-level, 3-4 words
L3  GRAPHICS   Remotion React components, animated
L2  B-ROLL     cinematic cut-ins at blueprint pacing
L1  A-ROLL     your footage, full-width
L0  SOUND      music bed + SFX transient per cut
```

## Status

| Stage | What | State |
|---|---|---|
| 1 | Visual deconstruction → Shot Blueprint | **built, run, checkpoint pending** |
| 2 | Script agent | not started |
| 3 | A-roll conditioning | not started |
| 4 | B-roll generation (Kling v3.0) | not started |
| 5 | Motion-graphics codegen (Remotion) | not started |
| 6 | Captions | not started |
| 7 | Sound design | not started |
| 8 | Composite + render | not started |
| 9 | QC gate | not started |
| 10 | Deliver (n8n) | not started |

Per the build order, stages 2–10 stay unwritten until the blueprint is confirmed.

## Stage 1 — usage

```bash
python3 src/deconstruct/run.py work/ref.mp4 blueprints/name.json "https://..."
```

Pieces, each runnable alone:

| File | Does |
|---|---|
| `detect_cuts.py` | ffmpeg scene detection, adaptive threshold ladder 0.3→0.1, merges sub-0.2s "shots" into flash transitions, warns if the reference only registers below 0.15 |
| `extract_frames.py` | 2 frames per shot (head + mid) at 480px, tiles 12-up contact sheets |
| `vision.py` | Claude vision per sheet → per-shot layer / framing / camera move / graphics / transition / sfx hint |
| `measure_layout.py` | full-width seam test (split vs full-bleed + ratio), per-band brightness/contrast/saturation/hue |
| `blueprint.py` | merges the above into the Shot Blueprint, asserts form-only |

### The honesty check

Scene detection at threshold 0.3 is the calibration number. A real short-form
edit registers 15–25 cuts. Measured:

| File | 0.3 | 0.2 | 0.15 | 0.1 | mean shot |
|---|---|---|---|---|---|
| Reference (`ai-agent-explainer`) | **15** | 25 | 30 | 41 | 2.52s |
| Old v1 output | **0** | 0 | 0 | 5 | 5.91s |

The old output only registers at the sensitivity where soft dissolves start to
count — objectively a slideshow, not an edit.

## Blueprints

`blueprints/*.json` are the real asset. Once a blueprint exists you can render
many videos in that style without touching the reference again.
