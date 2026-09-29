---
type: product
product: Fusion Property AI
section: "15 (core data model) + 3, 10"
source: ".claude/agents/fusion-property-sg.md §15 core data model; fields derived from §3, §4, §10, §11, §13, §20"
status: design
tags: [product, fusion-property-ai, data-model]
---
# Fusion Property AI · Data model

Entity list from agent §15. The fields are Zaphiel's first draft, derived from the agent sections named on each
entity, and are for Ryan to review. See [[90_Products/Fusion_Property_AI/Architecture]]. The geometry JSON itself is in
[[70_Industry_Packs/Singapore_Property/07_Geometry_Model_Schema]].

## Conventions
- Every row carries `id` (uuid), `tenant_id`, `created_at`, `created_by`.
- Soft delete only.
- Geometry, DNA and concepts are **versioned and immutable**: a change is a new row.
- Personal data (PDPA) stays in `User`, `Lead` and `Confirmation.answer`. Every other table refers to it by id only.
- Money is in integer cents, with a currency code (SGD first).

## Entities
| Entity | Key fields | From |
|---|---|---|
| **Tenant** (agency / developer / FusionTech) | name, type (`agency\|developer\|homeowner\|internal`), country (`SG`), cea_licence_no (agencies) | §15 |
| **User** | tenant_id, name, role (`owner\|agent\|admin\|viewer`), cea_registration_no (agents), phone, email, pdpa_consent_at | §13, §15 |
| **Property** | tenant_id, property_type, tenure, storeys, address (optional; private), unit_stack (optional), owner_consent (`{by, at, scope}`), country_pack (`Singapore_Property`) | §3, §15 |
| **FloorPlanUpload** | property_id, file_ref (private store), mime, pages, source (`owner\|agent\|developer_brochure\|official`), rights_basis (`owner\|licence\|consent`), uploaded_by | §3, §15 |
| **GeometryModel** | property_id, version, parent_version, status (`draft\|needs_user\|validated\|user_confirmed\|proposed`), json (the canonical schema), scale_method, overall_confidence, is_proposed_renovation | §3, §4 |
| **ValidationReport** | geometry_id, checks (10 × `{name, pass, detail}`), element_confidence (map), overall_confidence, threshold, questions (list) | §4 |
| **Confirmation** | geometry_id, element_id, question, answer, answered_by, at → produces the next geometry version | §4, §18 |
| **DesignDNA** | property_id, geometry_id, style (1–10), tone (`light_airy\|warm\|cool\|dark_moody\|signature`), palette (hex tokens), flooring, stone, timber, metals, cabinetry, lighting_k, furniture_language, detailing, fabrics, wall_treatments, kitchen_language, bathroom_language, greenery, reference_images | §9, §10 |
| **DesignConcept** | property_id, geometry_id, dna_id, style, tone, status, cover_asset_id | §15 |
| **RenderJob** | concept_id, room_id, camera_preset, kind (`guide_pass\|photoreal\|panorama\|video\|glb`), status (`queued\|running\|failed\|needs_user\|done`), provider, model, seed, inputs (refs), cost_cents, credits, started_at, finished_at, error | §11, §15 |
| **Asset** | job_id, type (`image\|video\|glb\|panorama\|pdf\|html`), url (private until published), label (e.g. `AI RENOVATION CONCEPT / VISUALISATION`), label_on_image (bool), provenance (`{provider, model, seed, inputs, geometry_version, dna_id}`), consistency (`{pass, drift_px}`) | §11, §13 |
| **ComplianceFlag** | geometry_id (proposed), change, property_type, label (`GREEN\|AMBER\|RED`), register_rule_ids, statement, shown_to_user_at | §8 |
| **Listing** | property_id, agent_user_id, real_photo_asset_ids, concept_asset_ids, copy, cea_block (`{agent_name, cea_reg_no, phone}`), checklist (`{real_photos_first, ai_labels, cea_guidance_checked_at, claims_ok, owner_consent}`), status | §13, §14 |
| **MarketingAsset** | listing_id, format (`1:1\|4:5\|9:16\|16:9\|video_15_30s`), headline_variants, primary_text_variants, utm, platform, ai_label, status | §13 |
| **Lead** | tenant_id, listing_id, source, utm, name, phone, email, consent (`{pdpa, dnc_checked_at}`), crm_ref (ATLAS) | §13, §15 |
| **AuditEvent** | actor, action, entity, entity_id, before, after, cost_cents, at | §15 |
| **RegulationRule** (KnowledgeService) | rule, authority, source_url, effective_date, last_verified, status (`VERIFIED\|NEEDS VERIFICATION`), country | §7 |

## DesignDNA
Example shape, with illustrative values:
```json
{
  "dna_id": "", "property_id": "", "geometry_version": 3,
  "style": "Japandi", "tone": "warm",
  "palette": {"base": "#EDE6DA", "wall": "#F4EFE6", "timber": "#B08A62", "accent": "#5E6B57", "metal": "#2B2B2B"},
  "flooring": "light oak-look SPC, matte", "stone": "honed travertine-look porcelain",
  "timber": "white oak, natural oil finish", "metals": "matte black",
  "cabinetry": "flat-panel oak veneer, handleless", "lighting_k": 2700,
  "furniture_language": "low, rounded, linen and oak", "detailing": "slatted timber screens, shadow-gap skirting",
  "fabrics": ["linen", "boucle"], "wall_treatments": ["limewash-effect paint"],
  "kitchen_language": "dry kitchen open, wet kitchen behind glass sliding door",
  "bathroom_language": "warm grey porcelain, timber-look vanity, niche lighting",
  "greenery": ["olive tree", "fiddle-leaf fig"], "reference_images": []
}
```

## Output files per job (agent §20)
Files go in `80_Clients/<client-or-project>/property/<property-id>/`:
- `01_geometry_vN.json`
- `02_validation_report.md`
- `03_confirmations.md`
- `04_design_dna_<style>_<tone>.json`
- `05_render_manifest.json` (image, camera, provider, seed, cost, label)
- `06_compliance_flags.md`
- `07_listing_copy.md`
- `08_ad_asset_pack.md`
- `09_website_brief.md`

In Claude Code today, the agent writes these files. The platform later writes the same objects to the database.
Test runs go under `80_Clients/_Test/`.
