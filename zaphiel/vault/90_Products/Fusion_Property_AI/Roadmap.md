---
type: product
product: Fusion Property AI
section: 17
source: ".claude/agents/fusion-property-sg.md §17, §19, §21 (Ryan, 2026-09-30, verbatim)"
status: phase-0
tags: [product, fusion-property-ai, roadmap]
---
# Fusion Property AI · Roadmap

**Don't build the marketplace first.** Architecture: [[90_Products/Fusion_Property_AI/Architecture]].

| Phase | Scope | Done when | Status |
|---|---|---|---|
| **0** | Knowledge base verified. Test dataset: 30–50 real Singapore floor plans across the types, used with permission, with hand-checked ground-truth geometry. | Register refreshed with dates ([[70_Industry_Packs/Singapore_Property/03_Regulation_Register]]); dataset and metrics ([[90_Products/Fusion_Property_AI/Test_Dataset_Plan]]) in place, with a baseline measured | **In progress:** register first pass 2026-09-30; dataset not started |
| **1** | Upload → interpretation → canonical geometry → verification UI → 10 styles × tones → consistent whole-home visuals | Phase 1 targets in the test plan are met on the held-out plans | Not started |
| **2** | Interactive 3D → 360° → walkthrough → before/after | Viewer on mobile; GLB export | Not started |
| **3** | Property websites → listing generation → marketing assets → video | CEA checklist passes on 3 real listings | Partly exists: cinematic property websites (site kit, PROPERTY journey) |
| **4** | Social publishing → advertising → WhatsApp → lead capture → CRM | Leads land in CRM with source/UTM | Partly exists: John + ATLAS + n8n |
| **5** | **"Make this design real"**: preliminary scope, material schedule, furniture/lighting/carpentry lists, quantities where reliable → quotation request → verified renovation professionals → supplier marketplace | — | Not started |

- The Phase 5 supplier marketplace covers:
  - Singapore suppliers, and manufacturers in China and elsewhere;
  - furniture, lighting and stone;
  - sanitary, kitchen and smart-home;
  - building materials.
- Never label a contractor or supplier as government-approved or HDB-registered unless it is verified on the
  official register at that time.

## Checkpoints (stop and ask; agent §21)
1. The geometry is below the confidence threshold → the user confirms before any designs.
2. Before a paid or credit-spending bulk generation → show the count and the estimated cost.
3. Any PROPOSED structural or layout change → show the compliance flag first.
4. Before marketing assets go public → the CEA / AI-label checklist has passed and the agent confirms.
5. Before a production deploy of platform features → **Ryan approves**.

## Asia expansion (agent §19)
- Every country gets its own pack, `70_Industry_Packs/<Country>_Property/`, with the same structure:
  - property types;
  - authority map;
  - regulation register;
  - compliance matrix;
  - marketing rules.
- Each pack also sets its language, currency and units (sqm or sqft).
- **Never apply Singapore rules to another country.**
- The core engine (geometry, DNA, rendering) stays shared. The rules are plug-in modules.

## Next actions (Phase 0)
- [ ] Ryan: source the first 30–50 floor plans with permission (see the sourcing list in the test plan).
- [ ] Re-verify the register rows marked NEEDS VERIFICATION.
- [ ] Hand-label the ground truth for the first 10 plans; measure the baseline with the Claude Code agent (FLOOR-PLAN
  mode).
