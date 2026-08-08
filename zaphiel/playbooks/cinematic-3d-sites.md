# Playbook — Cinematic "3D scroll" websites

Ryan's own playbook (uploaded 2026-08-08), turned into an executable procedure.
This is a **repeatable product**: mid-market builds sell at roughly $1.5k–$8k, and the
fictional-brand demos exist so big-brand pitches can be made with a finished site
rather than a deck. Never publish a demo carrying a real brand's name or logo without
their engagement.

## The formula (don't deviate — it's what makes it look expensive)

1. **One named hero subject.** Product, property, vehicle, suite — one thing.
2. **Generate ONE hero image first**, then pass it as the image reference to *every*
   clip. This is the whole trick: it is what keeps the subject identical across shots.
   Skipping it is why most AI site builds look incoherent.
3. **Three shots, always in this order:** ORBIT → MACRO → EXPLODED/ASSEMBLY.
   It works for anything with parts, rooms or details.
4. **Scroll-scrubbed canvas frame sequence** (the orbit clip becomes the hero),
   Lenis smooth scroll, text reveals pinned to scroll position.
5. **Section order:** hero → story → detail scrub → specs → scarcity/price → private CTA.
6. **Dark palette, ONE accent colour**, high-contrast serif display + minimal sans,
   very few words. Copy tone: quiet, expensive.
7. **Verify it actually runs before declaring it done.**

Per client, only four things change: accent colour, type pairing, the specs/price, and
the CTA. Everything else is the template.

## How Zaphiel actually builds one

### Step 1 — hero image (Higgsfield)
`mcp__higgsfield__generate_image` with the hero description from the brief. Dark ground,
one accent, studio or golden-hour light. Keep the returned image URL — it is the
reference for everything that follows. Confirm with Ryan before batches; generation
spends credits (`mcp__higgsfield__balance` to check).

### Step 2 — three clips, image-referenced
Call `mcp__higgsfield__get_workflow_instructions` (no args) first to see the current
catalogue, then follow the matching workflow. Default generation settings from the
playbook: **Seedance 2.0, std mode, 1080p, 16:9, no audio, ~8s per clip.** Pass the
Step-1 image as the image reference on all three.

- Clip 1 ORBIT — slow, perfectly smooth 360°. This one gets scroll-scrubbed, so it must
  loop cleanly and hold constant speed.
- Clip 2 MACRO — gliding extreme close-ups of detail.
- Clip 3 EXPLODED / ASSEMBLY — components separating or converging.

Use `generate_video_batch` + `jobs_wait` for all three at once.
**Kling** (`mcp__kling__image_to_video`) is the alternative for cinematic product motion —
every Kling job is charged, so confirm parameters before submitting, never send trial jobs.

### Step 3 — frames
The scrub needs stills, not a video element (video scrubbing stutters on mobile Safari).
Extract with ffmpeg, ~120 frames for an 8s clip, width 1600, then compress:

```bash
ffmpeg -i orbit.mp4 -vf "fps=15,scale=1600:-2" -q:v 6 frames/orbit_%03d.jpg
```

Keep the sequence under ~6 MB total or first paint suffers.

### Step 4 — assemble
Copy `zaphiel/templates/cinematic-scroll/` and drop the frames in. The template already
implements scroll-scrubbing, Lenis-style smooth scroll, pinned reveals, parallax layers
and reduced-motion fallbacks — see its README for the four things to edit.

### Step 5 — ship
Deploy to Vercel (see memory §4b — deploy into an existing project; creating new ones is
blocked on this team). Verify the deployed URL actually loads and scrolls before telling
Ryan it is done.

## Compliance gate — applies to BIO N:OV and any supplement client

Run this before any wellness build goes public. Learned the hard way on `bionov/`, whose
original copy claimed the product addressed stroke, dementia, Alzheimer's, myocardial
infarction, diabetes and hypertension, said garlic "promotes anticancer substances", and
advertised "−25% blood pressure". That is an HSA problem in Singapore and an automatic
Meta rejection.

- No named diseases anywhere — not in body copy, not in a stat block, not in a
  researcher's listed field.
- No efficacy numbers on disease markers (blood pressure, blood sugar, cholesterol).
- Lab measurements must be labelled as lab measurements on the raw material, never as
  clinical outcomes.
- Support / promote / help maintain. Never cure, treat, diagnose, prevent, heal.
- Carry the "not intended to diagnose, treat, cure or prevent any disease" line plus a
  consult-your-doctor note for pregnancy, medication and existing conditions.

## The five ready briefs

Full text lives in Ryan's upload; the subjects and settings are:

| # | Brand (fictional) | Sector | Hero subject | Palette |
|---|---|---|---|---|
| 1 | SOLSTICE TOWER | Luxury real estate | Glass-and-bronze tower at blue hour | Off-black / warm bronze |
| 2 | MAREA | Boutique resort | Cliffside villa over a turquoise cove | Sea-ink / sand-gold |
| 3 | VELOCE AUTOMOBILI | Automotive | Graphite GT coupé, studio black | Off-black / gold |
| 4 | AURELIA AIR | Airline first class | Midnight-navy widebody on wet tarmac | Midnight-navy / champagne |
| 5 | VERDANT | Shopify / D2C wellness | Emerald apothecary bottle | Off-black / emerald + gold |

**Build #5 first with the real BIO N:OV bottle as the hero.** It doubles as the live demo
for every retail client pitch and as BIO N:OV's own product page — but it must clear the
compliance gate above, which the fictional VERDANT copy does not need to.
