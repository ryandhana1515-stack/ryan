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
| **3 Flagship film experience** | A full 3D-feel scene film (5–7 chained scenes) that builds/transforms with the scroll, plus video sections | Luxury products, property journeys (not doctors) | TITAN 3D Studio (`cinematic-director`) films → site kit (products) or Lovable (doctors) |

## Ryan's 3D decision (2026-10-12)
- 3D feel comes from **films made on Kling and Higgsfield**, not code-drawn shapes.
- **Doctors' sites** are not cinematic: real photos + a video section where Lovable renders the anatomy explainers
  ([[14_Clinic_Video_Explainers]], [[13_Lovable_Medical_Prompt]]).
- Real-time WebGL (Three.js) only if Ryan asks for it **and** an accurate, licensed model exists (client CAD or a
  licensed model). Then: model → clean-up → glTF/GLB → compress (Draco/Meshopt, KTX2/WebP) → HTML labels → poster
  first, lazy load, mobile pre-rendered fallback.

## Doctors and clinics: real clinic site + video section (Lovable)
**Ryan, 2026-10-12 (final): no cinematic scroll or parallax for doctors.** Tier 1 design with the clinic's **real
photos**, plus a **video section** of narrated explainers matched to the clinic's specialty, one video per topic
(dental: enamel, dentin, pulp, root, gums, jawbone; cardiology: heart, arteries, blood flow…). Each video explains the
part of the body, what can go wrong, how the clinic's own services treat it, and factual reasons to visit.
- Topics and the four-beat script: [[14_Clinic_Video_Explainers]].
- Build: Lovable, [[13_Lovable_Medical_Prompt]] (Lovable renders the anatomy in each video; Kling/Higgsfield clips
  optional).
- Narration: Lovable creates the voice (natural, not robotic, American English), or the doctor's own recording;
  captions and transcripts always.
- Gates: clinician review of every script and visual ([[03_Medical_Supplement_Rules]]); titan-qa.

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
