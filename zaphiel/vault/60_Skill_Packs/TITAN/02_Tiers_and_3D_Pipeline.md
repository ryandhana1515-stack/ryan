---
tags: [zaphiel, skill-pack, titan, 3d, cinematic]
version: 1.0 (2026-10-12)
---
# Tiers and the 3D pipeline

**Rule:** recommend the **lowest tier** that reaches the goal. 3D only where it helps understanding or conversion.

| Tier | What | When | How |
|---|---|---|---|
| **1 Premium conversion site** | Strong design, CSS/GSAP motion, fast | Most SMEs, landing pages, funnels | Site kit or Lovable; no films needed |
| **2 Cinematic scroll** | Pinned chapters, scroll-scrubbed films, parallax, colour changes | Brands that sell on feeling | Site kit + 1–3 Kling/Higgsfield films |
| **3 Flagship film experience** | A full 3D-feel scene film (5–7 chained scenes) that builds/transforms with the scroll, plus video sections | Luxury products, doctors' body journeys, property journeys | TITAN 3D Studio (`cinematic-director`) films → site kit (products) or Lovable (doctors) |

## Ryan's 3D decision (2026-10-12)
- 3D feel comes from **films made on Kling and Higgsfield**, not code-drawn shapes.
- Real-time WebGL (Three.js) only if Ryan asks for it **and** an accurate, licensed model exists (client CAD or a
  licensed model). Then: model → clean-up → glTF/GLB → compress (Draco/Meshopt, KTX2/WebP) → HTML labels → poster
  first, lazy load, mobile pre-rendered fallback.

## Doctors and clinics: the body journey (Lovable)
1. **The film:** TITAN 3D Studio makes a super-real journey **inside the body** (the recipes in
   [[60_Skill_Packs/Cinematic_Director/02_Medical_Anatomy_Films]]):
   - the person → through the skin;
   - **arteries and blood vessels**, blood cells flowing;
   - the heart, **the lungs** breathing, **the stomach** and digestive tract, the liver and kidneys;
   - the clinic's specialty in detail, then back out.
   Each organ is a chained scene (last frame = next first frame).
2. **The presenter video section:** a "How it works" player (poster, play button, captions, transcript). The
   presenter is the clinic's **real doctor filmed** (best), or an **AI presenter clearly labelled** "AI presenter".
   The voice is the doctor's own, or a licensed ElevenLabs voice. The script comes from the clinic and is reviewed by
   its doctor.
3. **The site, built on Lovable:**
   - the body-journey film scrubbed by the scroll (Lovable scrubs the video in the browser);
   - specialty pages, doctor profiles (real, verified), the presenter video section;
   - FAQ, booking/WhatsApp → CRM via ATLAS.
   - Labels "Illustration for education only".
4. **Gates:** clinician review of every film, caption and page ([[03_Medical_Supplement_Rules]]); titan-qa.

## Cinematic products: TITAN decides (site kit on Vercel)
TITAN picks the story from the product:
- **Watch:** splits into pieces and reassembles; macro dial; light sweep.
- **Clothing:** fabric forms the garment; models walk; macro stitching.
- **Car / motorbike:** parts float apart and snap together, 360 turn, launch on a wet road.
- **Drinks:** ingredients float in, the pour, the can or bottle assembles, condensation macro.
- **Jewellery / perfume:** molten gold, stone set / glass and liquid column.

Method: [[60_Skill_Packs/Cinematic_Director/01_Split_and_Reassemble]] (keyframes first, first/tail films, reverse
scroll = reassembly). Build: `ceo-brain/site-kit/README.md` (`.film-sequence`, `media.json`).

## Performance budgets (every tier)
- **Poster image first.** Hero LCP ≤ 2.5 s on mobile.
- **Films:** frames cut by the site kit build (96 per 5 s scene), smaller on phones, lazy-load later scenes.
- **Reduced motion:** stills and normal page flow.
- **No layout shift** from media (fixed aspect boxes).
