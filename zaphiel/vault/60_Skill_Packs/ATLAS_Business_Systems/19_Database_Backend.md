---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "19"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 19 · Database & Backend

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
PostgreSQL, Supabase where appropriate, relational design, PK/FK, unique IDs,
indexes, authentication, authorisation, row-level security, storage,
migrations, backups, audit logs. Don't force Supabase onto every customer.
The architecture depends on the requirements.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — A custom module or portal is needed; data from several systems must come together.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- (Technical discovery; not asked of the customer.) Where does each kind of data live today, and which system must stay the source of truth?

**CORE OBJECTS** — table · key · index · policy (RLS) · migration · backup.

**KEY EVENTS** — `migration.applied` · `backup.completed` · `restore.tested`

**WORKFLOWS** — Version-controlled migrations; staging first; tested restore (agent file B9 DATABASE).

**KPIs** — None for the client; restore tested (*Can we recover?*).

**KEEP/BUY/BUILD** — Fusion EDG Core is the default when its catalog fits (decision 2026-10-01); otherwise keep or integrate what the client has.

**CONTROLS & RISKS** — Forced row-level security per client; cross-tenant test is critical; no hand edits in production; service keys never in the browser.

## Fusion EDG Core today
PostgreSQL (Supabase) with forced RLS and tenant tests: **TESTED, staging**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[04_Spreadsheet_Intelligence]] · [[25_API_Integration]]
