---
tags: [zaphiel, skill-pack, titan, tools]
verified: 2026-10-12 (live checks in Ryan's Claude Code session; costs from [[60_Skill_Packs/Marketing_Team/01_Tool_Library]])
---
# Build Router: which tool for which job

Re-check the connection and the price on the first use in every new project. Costs change.

| Need | First choice | Fallback | Connected? (2026-10-12) | Cost / approval |
|---|---|---|---|---|
| Cinematic product site (watch, fashion, car, drinks…), 3D-feel scroll | **Site kit** (`ceo-brain/site-kit`: Vite + GSAP + Lenis scroll films) built in Claude Code, hosted on **Vercel** | React/Next + GSAP for complex apps | ✅ Vercel (Hobby plan) | Free for previews. Hobby is **non-commercial**: a paying client's live site needs a plan decision (cost card) |
| Doctor / clinic site: real photos + video section of narrated anatomy explainers ([[14_Clinic_Video_Explainers]], [[13_Lovable_Medical_Prompt]]) | **Lovable** (Ryan, 2026-09-29 and 2026-10-12; workspace on the **Pro** plan) | Site kit; Kling films only as an optional extra | ✅ Lovable, workspace "Ryan's Lovable" | Every Lovable message uses credits: cost card first |
| App the client edits visually, simple CRUD apps, portals | **Lovable** (React + Supabase) | Claude Code + Supabase | ✅ | Credits |
| Custom app / complex logic | **Claude Code** (React/Next + Tailwind) | Lovable | ✅ (this workspace) | Free |
| Database, login, files | **Supabase** (RLS; a dev project first) | — | ✅ `fusion-edg-dev` only | Free-plan limits; a new project per client = check plan |
| Films: split-and-reassemble, scroll chapters, optional photoreal medical clips | **Kling** (Pro, 1,508 credits) via TITAN 3D Studio | **Higgsfield** (Plus, 1,000 credits; Seedance, Kling 3.0 Omni, Cinema Studio) | ✅ both | Credits: cost card + Ryan's yes |
| Presenter / explainer voice | Real doctor's own voice (free) | **ElevenLabs** (paid plan for commercial use) | ⚠️ ElevenLabs connected, one read got 403 | Paid plan needed for commercial voiceover |
| Talking presenter on screen | The clinic's **real doctor filmed** | No face: narration over the visuals (doctor's voice or a labelled AI voice). **Never an AI person as a doctor** | — (HeyGen not connected) | Free / ElevenLabs plan |
| Design mock-ups, graphics | **Canva** | Figma (read; Ryan's seat is View) | ✅ Canva · ⚠️ Figma view seat | Brand templates need Canva Pro/Teams |
| Store | Client's **Shopify** | Stripe / HitPay (custom) | ✅ Shopify = **Bio Elixirs** (separate business: never use for clients) | Client's subscription |
| Lead routing, notifications, CRM writes | **n8n / EDG via ATLAS** | — | ✅ n8n | ATLAS owns it |
| QA: screenshots, Core Web Vitals | **Playwright + Chromium** (installed), **Lighthouse** (npm, free) | — | ✅ / install on first use | Free |
| Analytics, SEO data | **GA4, Search Console, Bing Webmaster** (client-owned) | — | ❌ not connected (client grants access) | Free |
| Domains | Client buys or Ryan approves | — | — | Always a cost card |

## Real-footage rule
AI-generated people are **not** real footage. For doctors, clinics, supplements and testimonials:
- anything presented as real (a doctor, a patient, a customer, a clinic) is **real filmed footage** or properly
  licensed stock;
- AI people only as clearly **illustrative presenters**, labelled where required;
- never present synthetic people as real doctors, patients or customers.
