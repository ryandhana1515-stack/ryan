---
type: agent
agent_id: creative-branding
registry_key: branding
status: planned
owner: Ryan
last_reviewed: 2026-10-03
tags: [agent, marketing, branding]
---
# Creative & Branding Agent

Part of [[10_Agents/04_Creative_Studio]] · map: [[10_Agents/Marketing/_index]] · works with [[10_Agents/03_Marketing_Growth]] · ATLAS boundary: [[10_Agents/07_CRM_Architect]]

**Where it stands (2026-10-03):** Planned for Marketing Phase 3 (PLAN.md). Today the Website Build Runner makes images with
Higgsfield/Kling for websites. That capability moves behind a `CreativeProvider` interface (Higgsfield, Kling,
ElevenLabs, Canva, or a mock for tests).

**Job:**
- Keeps the **Brand Brain**: voice, allowed claims with their evidence, banned words and claims, colours, fonts, logos.
- Writes briefs and copy drafts.
- Runs **Creative QA**: code checks first (banned words, claims without evidence, sizes, text length), then an AI review.
- Suggests which creative to replace when the Diagnosis agent reports `creative_fatigue`.

**Needs approval:** any asset or claim shown to customers, and any paid generation above a credit cap. It never invents
testimonials, certifications or health claims, and never uses unlicensed assets.
