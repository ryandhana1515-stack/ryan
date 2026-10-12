---
tags: [zaphiel, ceo-brain, titan, audit]
date: 2026-10-12
status: Task 1 of Ryan's TITAN master prompt (checkpoint)
---
# TITAN Task 1: audit of everything web (2026-10-12)

Ryan's prompt: **TITAN, AI Web Experience & Development Director** (the "CLAUDE CODE MASTER PROMPT — TITAN"
of 2026-10-12). This note is Task 1 (the audit). Next is the checkpoint, then Task 2.

## 1. What already exists and works
| Piece | Where | Status |
|---|---|---|
| **Website Intelligence** (research, audit, competitors, reviews, search-intent map, conversion strategy, sitemap, copy, `WEBSITE_BUILD_BRIEF.json`) | `.claude/agents/website-intelligence.md` (18 KB) + n8n workflow `5VWP3tMK3MZysi7w` | CODED; the n8n part is live |
| **Cinematic films** for 3D-looking sites (split-and-reassemble products, photoreal anatomy) | `.claude/agents/cinematic-director.md` + `60_Skill_Packs/Cinematic_Director/` | CODED + MOCK TESTED (2 dry runs, 2026-10-12). Ryan's prompt calls it "cinematic-website"; it becomes **TITAN 3D Studio** |
| **Cinematic doctrine** (reversible scroll, engine router, industry modules, shot package, QA torture test) | `Knowledge/Full Master Cinematic Website Agent 2026`, `Knowledge/Wow website playbook` | Done (Ryan's text) |
| **Website Builder** (brief, design direction, scroll effects, luxury and medical modes, funnel pages, QA checklist, Lovable prompt) | `ceo-brain/agents/website-builder/brief.js` (115 KB) + n8n `hSTRGnHVsu6tMOmH` | CODED + tested (146/146), live in n8n |
| **Website Build Worker** (Kling films → site kit on Vercel; clinics on Lovable; QA report) | `ceo-brain/agents/website-build-worker/ROUTINE.md` | CODED; proven on the Atelier Noir proof (2026-09-29) |
| **Site kit** (scroll film engine, scene sequences, motion, Vercel deploy plan) | `ceo-brain/site-kit/` | CODED, used for real previews |
| **Property specialist** (floor plans, designs, listings, CEA rules, property websites) | `.claude/agents/fusion-property-sg.md` (26 KB) | CODED (agent file) |
| **ATLAS** (CRM/EDG, integrations, permissions); already says "ATLAS is NOT the website builder" (§B2) | `.claude/agents/atlas.md` + Fusion EDG Core | CODED + staging |
| **Lead capture into the CRM:** web leads, Facebook lead forms, signed incoming webhooks, and a **lead attribution table with UTM fields + gclid/fbclid** (migration 026) | `fusion-edg-core` | MOCK TESTED on staging |
| **Marketing Director + 3 specialists** | `.claude/agents/marketing-*.md` etc. | CODED + MOCK TESTED |

## 2. Tool connections (checked live in this session, 2026-10-12)
| Tool | Status | What I saw | Cost note |
|---|---|---|---|
| **Vercel** | CONNECTED (REAL ACCOUNT TESTED) | Team "ryandhana1515-6929's projects", **Hobby plan**; projects: fusion-edg-core-api, bio-nov-website (+2 duplicates) | Hobby is for **non-commercial** use (Vercel's terms). Preview demos OK; paying-client sites need Pro (a cost card when the first client signs) |
| **Supabase** | CONNECTED (REAL ACCOUNT TESTED) | One project: `fusion-edg-dev` (Tokyo, healthy) | Free-plan limits apply |
| **Lovable** | CONNECTED (REAL ACCOUNT TESTED) | Workspace "Ryan's Lovable" (owner) | Every message uses Lovable credits: ask first |
| **Higgsfield** | CONNECTED (REAL ACCOUNT TESTED) | Plus plan, 1,000 credits | Credits: cost card first |
| **Kling** | CONNECTED (REAL ACCOUNT TESTED) | Pro, 1,508 credits | Credits: cost card first |
| **ElevenLabs** | CONNECTED, **partial** | The brand-kit read returned **403 Forbidden** (plan or permission) | Commercial use needs a paid plan |
| **Figma** | CONNECTED, **read mostly** | Starter team, Ryan's seat is **View** | Editing designs through the connector likely needs a full seat (cost) |
| **Canva** | CONNECTED | No brand kits set up | Brand templates need Pro/Teams |
| **Shopify** | CONNECTED | Store "Bio Elixirs" (Basic, SGD) | This is **BioGreen Elixirs**, a separate business: never mixed into FusionTech or client work |
| **n8n** | CONNECTED (REAL ACCOUNT TESTED) | 30+ workflows; Website Builder, Website Intelligence and Build Record live; the old Build Runner off (replaced by the Worker routine) | — |
| **GitHub** | CONNECTED | Repos: ryan, fusion-edg-core, Bio-Nov-website, master-selina | — |
| **Metricool** | CONNECTED (read) | FusionTech.AI connected; BROWREVOLUTION empty | — |
| **Chromium + Playwright** (in this workspace) | AVAILABLE | Used for real screenshots | Free |
| **Lighthouse** | NOT INSTALLED | Can be added free (npm) for speed scores | Free |
| HeyGen | NOT CONNECTED | — | Paid; not needed now |

## 3. Gaps
**3D production**
- Films: strong (Cinematic Director, Kling and Higgsfield).
- **Real-time 3D (Tier 3)** does not exist in the kit yet. Ryan rejected code-drawn shapes (2026-10-12). The TITAN prompt asks for Tier 3 with a **properly licensed real model** (a real anatomy or product GLB), which is different. A prototype engine (drag to turn, take apart, peel layers, labels) was written and tested today, then removed. It can be restored and fed a **licensed** model.
- Licensed anatomy models: research running (open libraries such as Z-Anatomy / BodyParts3D / NIH 3D; licences to confirm).
- No Blender pipeline in this workspace (CPU-only; possible for small clean-ups).

**SEO**
- No SEO agent. Website Intelligence has a free search-intent map only.
- No technical SEO checklist, structured-data templates, sitemap/robots generator, or Search Console / GA4 connection.

**Conversion / funnels**
- Conversion strategy and funnel pages are in Website Intelligence and `brief.js`.
- Missing: funnel templates (quiz, VSL, booking, webinar, tripwire, WhatsApp-first), an A/B test plan, and a standard tracking pack (UTM + click-id capture in the page, analytics events).
- Missing: the **INTEGRATION_SPEC / WEB_BUILD_REQUEST / CAMPAIGN_PAGE_REQUEST / WEB_STATUS** contracts.

**Creative generation:** connected and trained. Costs per item are not measured yet (the first approved run measures them).

**Integrations**
- The EDG side exists (lead webhooks, attribution table).
- Missing: the website half, which is a standard form that sends the lead + UTM + click ids + PDPA consent to the EDG.
- Missing: tested end to end from a real web page. `ttclid` (TikTok) has no column yet.

**QA**
- The doctrine's torture test is a written checklist only.
- Missing: an automated pipeline (Playwright across screen sizes, Lighthouse/Core Web Vitals, accessibility, link/form checks) and a `QA_REPORT.md` generator.

**Deployment**
- Preview deploys work (site kit → Vercel).
- Missing: a production checklist (domain, security headers, analytics, 301 map).
- The Hobby plan is not for commercial sites.

**Routing**
- Nobody owns "web" end to end today: Website Intelligence → Builder → Worker are wired for John's leads only.
- ATLAS and the Marketing Director have no hand-off line to a web director.

## 4. Proposed mapping (no duplicates)
- **TITAN** (new): the director, plus two new specialists, **titan-seo** and **titan-qa**.
- **website-intelligence**, **cinematic-director** (= "TITAN 3D Studio") and **fusion-property-sg** stay as they are. Each gets a short "reports to TITAN" section, with the diff shown to Ryan.
- **Website Builder / Build Worker / site kit** stay as the build engine TITAN uses.
- **ATLAS** keeps integrations; **John** keeps the client; **Marketing** keeps campaigns.

## 5. Decisions needed at this checkpoint (Ryan)
1. **Tier 3 real-time 3D:** OK to restore the 3D engine and use it **only with a licensed real model** (no code-drawn shapes)?
2. **Demo A subject:** a supplement brand or a clinic? (Not BioGreen: separate business.)
3. **Diffs:** OK for me to add the short "reports to TITAN" sections to the 3 existing agents plus routing lines to ATLAS and the Marketing Director, and show you the diffs in the PR?
