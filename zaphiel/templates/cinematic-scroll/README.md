# Cinematic scroll template

The reusable engine behind `zaphiel/playbooks/cinematic-3d-sites.md`. Copy this folder,
drop in frames, edit four things, ship.

## What it does

- **Frame-sequence scroll scrubbing** on `<canvas>` — scrolling drives the orbit. Frames,
  not `<video>`, because video scrubbing stutters badly on mobile Safari.
- **Smooth scroll** — lerped virtual scroll, same feel as Lenis, no dependency.
- **Pinned reveals** — `data-reveal` (+ `data-delay="1..3"`) fade up once on entry.
- **Parallax** — `data-parallax="0.14"` on any element; the number is the speed.
- **Graceful degradation** — no JS or `prefers-reduced-motion` gives a static poster and a
  normal-height page. Nothing breaks.

Zero dependencies, zero build step. Open `index.html` over HTTP and it runs.

## Build one

1. Generate the hero image and three clips per the playbook (ORBIT, MACRO, EXPLODED),
   image-referenced to the hero so the subject stays identical.
2. Extract frames:
   ```bash
   mkdir -p frames
   ffmpeg -i orbit.mp4    -vf "fps=15,scale=1600:-2" -q:v 6 frames/orbit_%03d.jpg
   ffmpeg -i macro.mp4    -vf "fps=15,scale=1600:-2" -q:v 6 frames/macro_%03d.jpg
   ffmpeg -i exploded.mp4 -vf "fps=15,scale=1600:-2" -q:v 6 frames/exploded_%03d.jpg
   ```
   Keep the whole `frames/` folder under ~6 MB or first paint suffers.
3. Edit the four things:
   - `styles.css` `:root` — `--accent`, `--display`, `--sans`
   - `index.html` — copy, specs, price, CTA
   - the inline `<script>` — `CONFIG.frames.count` (and `frames2.count`, 0 disables)
   - `[data-scrub] { height: 500vh }` in `styles.css` — longer = slower scrub
4. Verify locally, then deploy:
   ```bash
   python3 -m http.server 8000    # then actually open it and scroll
   ```

## Notes

- Frame count drives smoothness. 120 frames over 500vh is a good default; below ~60 the
  orbit visibly steps.
- The ORBIT clip must hold a constant rotation speed and loop cleanly — that is what makes
  the scrub feel like a real 3D object rather than a video.
- The first frame doubles as the `poster` fallback, so keep `frames/orbit_001.jpg` present.
- For a supplement or wellness client, run the compliance gate in the playbook **before**
  publishing. It is not optional.
