# BIO N:OV — Landing Site

A single-page marketing site for **BIO N:OV**, a third-generation nitric-oxide
supplement by Bzzworld Korea. The design language is a clone of the award-winning
[oryzo.ai](https://oryzo.ai) (Awwwards Site of the Day by Lusion): a dark,
full-bleed "museum artifact" canvas, generous negative space, a fixed transparent
nav with the wordmark left / links right, and physics-flavoured scroll motion —
here dressed in BIO N:OV's blue → violet → coral brand gradient.

All product copy and figures are sourced from the official BIO N:OV brand deck
(`BIO_NOV_ENG_V1`).

## Structure

- `index.html` — markup and content
- `styles.css` — design system (dark theme, brand gradient, responsive layout)
- `script.js` — scroll progress, nav state, scroll-reveal, count-up stats,
  hero parallax / pointer tilt, mobile menu
- `assets/` — product imagery extracted from the brand deck
  - `hero-product.jpg` — hero product render on the brand gradient
  - `body-systems.jpg` — "99.9% of diseases are NO-related" visual
  - `box.png` — isolated product box (transparent) for showcase sections

## Sections

Hero → NO-decline-with-age → 99.9% of diseases → global disease stats →
"NO Matters" benefits → three generations of NO tech → why BIO N:OV →
5 ways it optimises the body → measured results → fermented ingredients &
patent → R&D team → usage & storage → contact.

## Run

It's a static site — no build step. Open `index.html` directly, or serve the
folder:

```bash
cd bionov
python3 -m http.server 8000
# visit http://localhost:8000
```

Fonts (Space Grotesk + Inter) load from Google Fonts with a system-font
fallback, so the page degrades gracefully offline.

> Health-functional-food statements are not evaluated as medical treatment.
> This site is a design demo built from the BIO N:OV brand materials.
