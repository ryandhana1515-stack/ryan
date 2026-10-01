---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "09"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 09 · HR & People Admin

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Directory, departments, roles, onboarding, documents, leave, attendance
integrations, training, requests, approvals, tasks, policy
acknowledgements, offboarding, access provisioning/revocation (joiner →
mover → leaver, with access revoked on the last day).
AI assists with admin. No consequential employment decisions by AI alone.
Employee data has restricted access.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Leave requested over WhatsApp; slow onboarding; ex-staff still have logins.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "How many staff, and how are leave requests handled today?"
- "What happens on a new joiner's first day?"
- "When someone leaves, who removes their access, and to which apps?"

**CORE OBJECTS** — employee · role · department · leave request · document · training record · access grant.

**KEY EVENTS** — `employee.joined` · `employee.moved` · `employee.left` · `leave.requested` · `leave.decided` · `access.revoked`

**WORKFLOWS** — Joiner → mover → leaver with access revoked on the last day; leave request → manager approval → calendar.

**KPIs** — Leavers with access still open (*Are we exposed?*) · leave approval time (*Are requests stuck?*).

**KEEP/BUY/BUILD** — Keep or buy an HR/payroll product. Payroll is never custom-built.

**CONTROLS & RISKS** — Ryan's rules. Employment-law questions go to a person or lawyer.

## Fusion EDG Core today
Team list and roles in the staff app: built. Leave, onboarding, access management: **NEW BUILD**. Payroll: not in the catalog. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[03_Administration]] · [[18_File_Document_Storage]]
