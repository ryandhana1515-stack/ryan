---
type: product
product: Fusion Property AI
section: "15–16"
source: ".claude/agents/fusion-property-sg.md §15–16 (Ryan, 2026-09-30, verbatim)"
status: design
tags: [product, fusion-property-ai, architecture]
---
# Fusion Property AI · Architecture

Build Stage 1 so that everything else plugs in. Agent: `.claude/agents/fusion-property-sg.md` ([[10_Agents/16_Fusion_Property_SG]]).
Knowledge: [[70_Industry_Packs/Singapore_Property/00_Index]]. Data: [[90_Products/Fusion_Property_AI/Data_Model]]. Plan:
[[90_Products/Fusion_Property_AI/Roadmap]].

## Principles
- API-first and modular.
- Providers are swappable through adapters:
  - LLM;
  - vision / plan parser;
  - image generator and video generator;
  - 3D engine;
  - database;
  - social APIs;
  - CRM;
  - automation (n8n).
- Never hard-code around one AI provider.
- Jobs are async, with a status: `queued / running / failed / needs_user / done`.
- A failure is shown honestly. Never fake successful processing.

## Core services
```
Upload → PlanParser → GeometryService (versions) → ValidationService → UserConfirmation UI
      → DesignDNAService → RenderService (job queue) → ConsistencyChecker → 3DSceneService → AssetStore
ComplianceService · KnowledgeService (Regulation Register) · ListingService · MarketingAssetService
PublishingService · LeadService/CRM · Billing/credits · Audit/Logging · Cost tracking per job
```

| Service | Input | Output | Notes |
|---|---|---|---|
| Upload | PDF/JPG/PNG + tenant + consent | `FloorPlanUpload` | private per tenant; owner/agent consent recorded |
| PlanParser | upload | draft geometry v1 + unknowns | provider adapter (vision model) |
| GeometryService | geometry JSON | a new version (immutable) | [[70_Industry_Packs/Singapore_Property/07_Geometry_Model_Schema]] |
| ValidationService | geometry version | `ValidationReport` + questions | the 10 checks; threshold 0.8 |
| UserConfirmation UI | questions | `Confirmation` rows → a new geometry version | tap-to-fix |
| DesignDNAService | style + tone + geometry | `DesignDNA` JSON | [[70_Industry_Packs/Singapore_Property/06_Design_Systems]] |
| RenderService | shell passes + DNA + cameras | `RenderJob` → `Asset` | queue; seed, provider and cost logged |
| ConsistencyChecker | render + shell edges | pass/fail + drift | drifted images are never shipped |
| 3DSceneService | geometry + DNA | GLB, panoramas | Phase 2 |
| ComplianceService | proposed change | `ComplianceFlag` | [[70_Industry_Packs/Singapore_Property/04_Renovation_Compliance_Matrix]] |
| KnowledgeService | question | answer + register rows + dates | [[70_Industry_Packs/Singapore_Property/03_Regulation_Register]] |
| ListingService / MarketingAssetService | concept + real photos + agent details | listing, ad pack | [[70_Industry_Packs/Singapore_Property/05_Marketing_Advertising_Rules]] |
| PublishingService | asset pack | scheduled posts | checkpoint 4; Phase 4 |
| LeadService / CRM | form / WhatsApp | `Lead` | ATLAS ([[10_Agents/07_CRM_Architect]]) |

Every major function has:
- a defined input and a structured output;
- validation and error handling;
- a database representation and an API boundary;
- logging;
- user approval where appropriate;
- a cost and provenance record.

## Visualisation pipeline (agent §11)
1. **3D shell** from the validated geometry:
   - walls extruded at their true thickness and height (default ceiling height marked ASSUMED);
   - openings cut;
   - floors, ceilings and fixed elements added.
2. **Furniture and fixtures** placed from the Design DNA, respecting clearances and door swings.
3. **Camera presets** per room: eye height about 1.5–1.6 m, 2–3 angles. They are identical across all 10 designs,
   so comparisons line up.
4. **Guide passes** rendered from the shell: depth, normals, edges/lines, segmentation.
5. **Photoreal images** conditioned on those passes, the Design DNA prompt and the material references (any capable
   image model, swappable). The walls, windows and doors stay where the shell puts them.
6. **Consistency check**: overlay the shell edges on the output. Drift beyond tolerance → regenerate or reject.
7. **Label**: "AI RENOVATION CONCEPT / VISUALISATION". It is never presented as the existing condition.

- Outputs per concept:
  - living, dining, kitchen;
  - master bedroom, other bedrooms, bathrooms;
  - study, balcony, entrance, feature areas;
  - a dollhouse / axonometric view;
  - a top-down furnished plan.
- The before/after slider shows ORIGINAL against AI RENOVATION CONCEPT. ORIGINAL is a real photo from the same camera
  angle, or the empty-shell render (labelled as such) when no photo exists.

## 3D experience (agent §12, Phase 2)
- A web viewer (for example Three.js / React Three Fiber):
  - dollhouse view and a floor-by-floor toggle;
  - click a room to fly in; walkthrough mode;
  - 360° panoramas per room;
  - hotspots, with dimensions taken from the geometry only;
  - a measure tool, only on confirmed dimensions;
  - a style + tone switcher that does not reload the geometry.
- GLB export.
- Mobile:
  - prebaked lighting;
  - compressed meshes and textures;
  - 360° images instead of live 3D if needed.
- AI image-to-3D models are illustrative only.

## Websites (agent §14)
- Kinds: listing landing pages, agent personal-brand sites, development launch sites, and renovation visualisation
  pages.
- Built with [[cinematic-website]] (the site kit's PROPERTY journey).
- They include:
  - interactive floor plans and before/after sliders;
  - the 3D viewer;
  - verified neighbourhood information, with sources;
  - a WhatsApp CTA, viewing booking and lead capture.
- Mobile performance comes first.
- Never fabricate views, facilities, dimensions, prices, PSF, rental yields or "sold out" claims.

## Agent architecture (agent §16)
An **orchestrator** routes each job to the specialists:
- 01 Floor Plan Intelligence
- 02 Geometry Validation
- 03 Singapore Property Intelligence
- 04 Interior Design Director
- 05 Visualisation
- 06 3D Scene
- 07 Singapore Compliance
- 08 Property Website
- 09 Listing
- 10 Marketing
- 11 Video
- 12 Publishing
- 13 Lead Intelligence
- 14 CRM
- 15 Renovation
- 16 Contractor Matching
- 17 Supplier

Each specialist has inputs, JSON outputs, tools, permissions and failure behaviour. Today the specialists are
sections of one Claude Code subagent. They are split out as the platform is built. This is not one giant prompt in
production.

### How it plugs into FusionTech today
| Need | Existing agent |
|---|---|
| Cinematic property website | [[cinematic-website]] (site kit + Website Build Worker) |
| Research before a website | [[10_Agents/05a_Website_Intelligence]] |
| CRM, lead routing, WhatsApp | [[10_Agents/07_CRM_Architect]] (ATLAS) |
| Ads and social | [[10_Agents/03_Marketing_Growth]] |
| Images, video, Kling/Higgsfield | [[10_Agents/04_Creative_Studio]] |
| Release gate, permissions, PDPA | [[10_Agents/15_Security_Governance_QA]] |

## Privacy and IP
- Uploaded plans and photos are private per tenant.
- Owner or agent consent is recorded.
- Brochure plans may be copyrighted by developers: use them only with rights or consent.
- PDPA applies to all personal data.
- Don't scrape other portals' listings; respect their terms.
- Credentials live only in n8n or the platform's secret store, never in the vault or the repo.
