---
type: atlas-scenario-results
date: 2026-10-01
data: FAKE
tags: [atlas, test, v3]
---
# ATLAS v3 — scenario test results (Step 4)

ATLAS was run in DESIGN mode (no building, fake data) from the v3 agent file and the knowledge pack
[[60_Skill_Packs/ATLAS_Business_Systems/00_Index|ATLAS Business Systems]]. Each run was a fresh agent that saw only the
customer's message, the agent file and the pack (not the pass criteria).

| # | Criterion (Ryan) | Result | Evidence |
|---|---|---|---|
| A | Recognised as a **field-service EDG** (not just a sales CRM) | **PASS** | [[A-electrical-15-electricians]] §5: FIELD-SERVICE EDG (provisional); opened card 11 + Field_Service archetype; minimum = job list, job to the electrician's phone/calendar, reminder, "not done" alert to the owner, one-tap done |
| B | Flagged **ERP-like** (inventory + procurement) with keep/integrate/buy/build | **FAIL → fixed → PASS** | Run 1 ([[B-wholesale-2-warehouses.run1-FAIL]]) said HYBRID: it counted only 1 of 3 ERP criteria as confirmed and never opened card 20. Fix: agent file v3 NOTES "raise the ERP question early" + card 20. Run 2 ([[B-wholesale-2-warehouses]]): ERP-LIKE EDG (provisional), card 20 opened, KEEP/CONNECT their system or BUY a mature one, no custom stock/purchasing build, the ERP question asked first |
| C | Property pipeline with **CEA/PDPA** notes | **PASS** | [[C-property-agency-20-agents]]: SALES-CRM; pipeline new lead → contacted → qualified → viewing booked → viewing done → offer/negotiation → WON/LOST (human); CEA R29/R30, DNC R37 (from the property pack's register, VERIFIED 2026-09-30), PDPA consent, WhatsApp 24 h rule; anything not in the vault marked NEEDS VERIFICATION |
| all | Discovery questions first | **PASS** | each file opens with 3 plain-language questions, then a prioritised list |
| all | Assumptions listed | **PASS** | each file has "Assumptions to confirm" and facts labelled CLIENT-PROVIDED / INFERENCE / UNKNOWN |
| all | No invented numbers | **PASS** | only the customers' own numbers (15 electricians, 2 warehouses, 20 agents) and figures from the agent file or vault rules; volumes, targets and SLAs are UNKNOWN or [CLIENT TO DEFINE]; no prices or timelines |

## Gaps the tests surfaced (not failures; Fusion EDG Core does not cover them yet)
- Mobile job card (checklist, photos, signature, materials) — NEW BUILD (A).
- Inventory and procurement — NEW BUILD; ATLAS correctly recommends keeping or buying instead (B).
- 20 agents each seeing only their own leads needs proper staff logins (not built); several WhatsApp numbers per client
  and manager escalation separate from the lead owner are unconfirmed; Meta lead forms, portal intake and DNC checks
  are NEW BUILD; the staging scheduler runs once a day (C).
