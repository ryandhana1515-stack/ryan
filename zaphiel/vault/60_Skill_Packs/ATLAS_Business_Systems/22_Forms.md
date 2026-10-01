---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "22"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 22 · Forms

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Lead, customer, employee, inspection, service, onboarding, feedback,
approval, job-completion and site-visit forms.
FLOW: form → validation → database/CRM → workflow → assignment →
notification → action. No manual re-entry. Collect only the necessary
data, with PDPA consent where personal data is involved.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Paper forms; information retyped from forms; incomplete forms.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Which forms does your team fill in today, on paper or in chat?"
- "What happens to a form after it is filled in?"

**CORE OBJECTS** — form · field · submission · consent record.

**KEY EVENTS** — `form.submitted` · `form.rejected` (validation)

**WORKFLOWS** — See Ryan's FLOW.

**KPIs** — Incomplete submissions (*Is the form too hard?*).

**KEEP/BUY/BUILD** — Web forms that post into the EDG; form tools only if the client already uses one.

**CONTROLS & RISKS** — Ryan's rules. Consent recorded with the submission.

## Fusion EDG Core today
Website / web intake into lead intake: **TESTED**. Other forms: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[03_Administration]] · [[11_Field_Service]]
