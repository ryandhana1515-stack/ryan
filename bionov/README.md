# BIO N:OV — Immersive Landing Site

A WebGL-driven marketing site for **BIO N:OV**, a third-generation nitric-oxide
supplement by Bzzworld Korea. The design language clones the award-winning
[oryzo.ai](https://oryzo.ai) (Awwwards Site of the Day by Lusion): a dark,
full-bleed "museum artifact" canvas, generous negative space, and physics-driven
motion — here rebuilt as a fully immersive experience in BIO N:OV's blue →
violet → coral brand gradient.

All product copy and figures are sourced from the official BIO N:OV brand deck.

## The immersive layer

- **Real 3D product** — a WebGL box (Three.js) with canvas-drawn brand faces that
  auto-rotates, spins as you scroll through the hero, drifts up and fades into the
  content, and can be dragged to spin. Its face carries the "V" mark, name, weight,
  and GMP/health badges.
- **Live aurora background** — a custom GLSL shader flows brand-coloured light
  through a dark, readable ground and reacts to scroll and pointer.
- **Nitric-oxide particle field** — hundreds of additive-blended glowing points
  drift and swirl with subtle mouse parallax.
- **Buttery smooth scroll** (Lenis), cinematic scroll-reveals, and count-up stats.
- **Glow cursor**, **magnetic buttons**, and **hover-tilt cards** for tactile,
  21st.dev-style micro-interactions.

Everything degrades gracefully: without WebGL the hero shows a static product
render, and `prefers-reduced-motion` disables the heavy motion.

## Structure

- `index.html` — markup, import map, WebGL canvas
- `styles.css` — dark design system, brand gradient, cursor/scrim, responsive layout
- `main.js` — orchestration (smooth scroll, reveals, cursor, magnetic, tilt, nav)
- `scene.js` — the Three.js scene (shader background, particles, 3D product)
- `vendor/` — locally-vendored `three.module.min.js` and `lenis.mjs` (no CDN)
- `assets/` — product imagery from the brand deck

## Run

ES modules require an HTTP origin (not `file://`):

```bash
cd bionov
python3 -m http.server 8000
# visit http://localhost:8000
```

Fonts (Space Grotesk + Inter) load from Google Fonts with a system-font
fallback.

> BIO N:OV is a health functional food by Bzzworld Korea. Statements are brand-deck
> marketing copy, not medical claims. Consult a physician for medical advice.
