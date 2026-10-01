---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "18"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 18 · File & Document Storage

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Google Drive, OneDrive, SharePoint, approved cloud/object storage, Supabase
Storage where appropriate, DMS.
Decide: folder structure (e.g. /Customers/<ID-Name>/Quotes|Invoices|Jobs),
customer linking, permissions, versions, retention, searchability, access,
backups. Business documents never live only in personal accounts.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Files on personal phones and accounts; "which version is the latest?".

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Where are company files kept today?"
- "Are any kept in personal accounts or on phones?"
- "Who needs to see which files?"

**CORE OBJECTS** — folder · file · version · permission · retention rule.

**KEY EVENTS** — `file.stored` · `file.shared` · `file.deleted` (by retention rule)

**WORKFLOWS** — Generated or uploaded document → customer folder → linked from the customer record.

**KPIs** — None by default (this card is controls, not metrics).

**KEEP/BUY/BUILD** — Keep the client's Drive / OneDrive / SharePoint.

**CONTROLS & RISKS** — See Ryan's Decide list. Company-owned accounts; access by role; backups.

## Fusion EDG Core today
File storage per client: **NEW BUILD** (photos for the job card would need it). Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[05_Documents_Presentations]] · [[11_Field_Service]]
