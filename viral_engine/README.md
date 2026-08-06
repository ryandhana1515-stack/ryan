# Viral Content Engine

Reference link in → cinematic original short-form video out → auto-published →
funnel to AI automation course sales.

```
[1] INGEST        Paste competitor URL (TikTok / YT Short / Reel)
[2] EXTRACT       Download media + pull transcript (Whisper)
[3] DECONSTRUCT   Agent A → format DNA as JSON (hook, beats, pacing, CTA)
[4] REGENERATE    Agent B → NEW original script in your voice, same format
[5] TAG           Agent C → per-line B-roll keywords + shot type + duration
[6] SOURCE        Stock API pull + Kling generation for shots that don't exist
[7] VOICE         ElevenLabs TTS → timed audio track
[8] ASSEMBLE      JSON timeline → render API → MP4 with captions
[9] DISTRIBUTE    Metricool → TikTok / IG / YT / FB at best-time slots
```

Stages 3–8 run unattended. Your only manual input is Stage 1 and a 30-second
approval gate after Stage 4. **The approval gate is non-negotiable** — full
auto-publish will eventually push something factually wrong or off-brand
under your name.

## What's in this folder

| Path | What it is |
|---|---|
| `prompts/agent_a_deconstruct.txt` | Format analyst — extracts structural DNA, never wording |
| `prompts/agent_b_regenerate.txt` | Scriptwriter — new original script in your voice |
| `prompts/agent_c_broll.txt` | B-roll director — per-line keyword, shot type, source class |
| `engine/pipeline.py` | Stages 1–5 (extract → A → B → approval → C), CLI |
| `engine/broll_router.py` | Stage 6 — routes each shot to Pexels / Pixabay / Kling / library |
| `engine/tts.py` | Stage 7 — ElevenLabs voiceover + per-line timings |
| `engine/timeline_builder.py` | Stage 8 — JSON2Video spec + cloud render, or local ffmpeg fallback |
| `engine/variant_engine.py` | The 100-variant engine — permutes one script into up to 160 render specs |
| `n8n/viral-content-engine.json` | Importable 14-node n8n workflow (the full automation lane) |
| `library/` | Local B-roll library — grows with every run, see `library/README.md` |

## Setup

```bash
pip install -r ../requirements.txt        # from repo root: pip install -r requirements.txt
cp ../.env.example ../.env                # fill in the keys you have
```

Keys (all in root `.env`; each stage degrades gracefully if a key is missing):

```
ANTHROPIC_API_KEY      Agents A/B/C (Claude)
OPENAI_API_KEY         Whisper transcription
APIFY_TOKEN            TikTok download
PEXELS_API_KEY         free stock B-roll (workhorse)
PIXABAY_API_KEY        free stock B-roll (tech/abstract)
ELEVENLABS_API_KEY     voiceover
ELEVENLABS_VOICE_ID    your cloned voice
JSON2VIDEO_API_KEY     cloud render (the volume engine)
```

## Manual lane (Week 1 — prove the format before automating)

```bash
cd viral_engine

# Full run from a reference URL:
python engine/pipeline.py \
  --url "https://www.tiktok.com/@creator/video/123" \
  --topic "how I automated lead capture for an SME with n8n" \
  --proof "screen recording of the live workflow + before/after response times"

# Or from a transcript you already have (no Apify/Whisper needed):
python engine/pipeline.py --transcript ref.txt --topic "..." --proof "..."

# Then:
python engine/broll_router.py runs/<run-dir>       # stage 6
python engine/tts.py runs/<run-dir>                # stage 7
python engine/timeline_builder.py runs/<run-dir> --local   # stage 8 (ffmpeg)
# → run final.mp4 through Submagic for captions, post via Metricool
```

Cloud render instead of ffmpeg: host `voiceover.mp3` somewhere public, then

```bash
python engine/timeline_builder.py runs/<run-dir> --render --voiceover-url https://...
```

## Automation lane (Weeks 2–4 — n8n)

Import `n8n/viral-content-engine.json`, then:

1. Paste the three prompt files into the **Load Prompts** code node (or read
   them from disk if your instance allows it).
2. Set env vars on the n8n instance (same names as `.env`) and attach a
   Telegram credential for the approval gate.
3. Nodes are a working template, not gospel — test each stage with pinned
   data before switching on the whole chain. Build order: ship nodes 01–07
   first, use it for a week, then extend to 08–14.

## The 100-variant engine

Once one video works, don't move on — mine it:

```bash
python engine/variant_engine.py runs/<run-dir> --init   # writes variants.json
# edit variants.json: 5 hooks x 4 broll_sets x 2 paces x 2 caption styles x 2 thumbs = 160
python engine/variant_engine.py runs/<run-dir> --limit 20
```

Each spec in `runs/<run-dir>/variants/` renders via JSON2Video (loop them
through node 12 of the n8n workflow). Post 3–5 variants per week, log
views/watch-time per variant — after ~40 data points you stop guessing.

## B-roll rules (baked into Agent C)

- 1 cut every 1.5–2.5 s. Under 1.5 s = nauseating, over 3 s = retention drop.
- Router priority: local library → Pexels/Pixabay → Kling for impossible
  shots. `cinematic_hero` shots: swap in Artgrid plates manually for pillar
  content.

## Build order (4 weeks)

1. **Week 1** — manual lane, 5 videos by hand. Prove the format.
2. **Week 2** — n8n nodes 01–07 (through the Telegram approval gate).
3. **Week 3** — nodes 08–12 (B-roll, TTS, render).
4. **Week 4** — nodes 13–14 (Metricool + logging) and the variant engine.

Do not attempt to build all 14 nodes at once.
