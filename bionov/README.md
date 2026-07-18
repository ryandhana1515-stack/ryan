# BIO N:OV — Immersive Scroll-Driven 3D Website

A cinematic, scroll-controlled product journey for **BIO N:OV**, built from
`BIO_NOV_ENG_V1.pdf` as the absolute source of truth. The packaging artwork
on the 3D box is the original PDF art (perspective-rectified), so the Korean
text, V graphic, logo and certification seals are pixel-accurate — never
AI-regenerated.

**Live site:** https://ryandhana1515-stack.github.io/ryan/

## Stack

Next.js 14 (App Router, static export) · TypeScript · Tailwind CSS ·
GSAP + ScrollTrigger · Three.js + React Three Fiber · Lenis · lucide-react ·
@fal-ai/client (server-side pipeline)

## The scroll film

Chapters 1–7 and 17–18 are a real-time Three.js film driven purely by scroll
progress (stop = animation stops, scroll up = reverses):

1. Product arrival (gradient environment from the PDF cover)
2. Full 360° rotation
3. Levitation with light trails
4. Box opening, blister packs emerging
5. Tablet release (speckled grey-beige oblong tablets — procedural texture)
6. Camera through the tablet field
7. Macro tablet
8–16. Science chapters (fermentation chamber, NO molecule network, age
timeline, body journey, blood vessel, five wellness pillars, research team,
product information) — canvas/SVG scroll scenes
17. Reassembly
18. Closing CTA mirroring the opening

Reduced-motion users get a static, fully readable fallback.

## Local development

```bash
cd bionov
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
```

## Deployment (GitHub Pages)

```bash
npm run build
npx gh-pages -d bionov/out --dotfiles   # from the repo root
```

The site is served under `/ryan/` — `basePath` and `assetPrefix` are set in
`next.config.mjs`. `.nojekyll` is required (the `_next/` folder would be
ignored by Jekyll otherwise).

## fal.ai asset pipeline (optional enhancement)

The site ships complete without generated video. To layer in AI-generated
cinematic clips later:

```bash
cp .env.example .env    # add FAL_KEY
npx tsx scripts/generate-assets.ts references   # Stage 1: cheap stills
# review outputs vs the PDF, set "approved": true in data/asset-manifest.json
npx tsx scripts/generate-assets.ts tests        # Stage 2: 5s low-cost clips
npx tsx scripts/generate-assets.ts final        # Stage 3: final clips
npx tsx scripts/convert-video-to-frames.ts <clip.mp4> public/assets/sequences/<name> 24
npx tsx scripts/optimise-frames.ts <desktopDir> <tabletDir> <mobileDir>
```

- Budget-guarded by `FAL_GENERATION_BUDGET_USD` (default $100) — requests
  that would exceed it throw.
- Every generation is recorded in `data/asset-manifest.json` and
  `data/generation-costs.json`.
- Approved assets are never regenerated.
- `FAL_KEY` is server-side only — never exposed to the client.

## Content & medical-safety

Marketing claims from the PDF that assert disease treatment or guaranteed
outcomes were **not** reproduced. All wellness copy uses "supports /
designed to support / may support" language, and a medical disclaimer is
included on-page and in the footer.

**Verification checklist before commercial launch:**
- [ ] Researcher titles, affiliations and fields (pages 13–14 of the PDF)
- [ ] Certification details (GMP, patent, KACC91554P registration)
- [ ] Usage instructions against the authorised product label
- [ ] Regulatory review of all wellness claims for target markets
- [ ] Privacy / terms / cookie policy pages with real legal copy

## Asset provenance

`public/assets/` contains images extracted directly from the PDF
(researcher portraits, product photography, wellness icons) plus
perspective-rectified box faces in `product/clean/`. The tablet speckle
texture is procedural (canvas-generated at runtime).
