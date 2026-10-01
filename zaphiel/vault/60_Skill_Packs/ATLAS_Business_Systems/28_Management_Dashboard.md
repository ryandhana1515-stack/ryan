---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "28"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 28 · Management Dashboard

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Candidate metrics: sales, leads, conversion, pipeline, follow-ups,
appointments, quotations, orders, revenue, payments, outstanding invoices,
customer service, operations, inventory, procurement, projects, staff
workload, critical alerts.
No vanity dashboards. Every KPI answers a management question. Write the
question next to the KPI. If nobody would act on it, remove it.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — "I can't see what's happening"; the owner asks staff for numbers.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "What do you wish you could see every morning about the business?"
- "Which decisions would those numbers change?"

**CORE OBJECTS** — KPI (definition in [[KPI_Dictionary]]) · view · drill-down.

**KEY EVENTS** — `kpi.computed` · `alert.raised`

**WORKFLOWS** — Agent file B10 KPI ENGINE.

**KPIs** — Chosen per client from the domain cards; each with its question.

**KEEP/BUY/BUILD** — EDG Core report tab, or the client's BI tool if they have one.

**CONTROLS & RISKS** — Numbers from queries only; stale data never shown as live.

## Fusion EDG Core today
Staff app "Today" report and KPIs from SQL: **TESTED, staging**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[29_CEO_Daily_Brief]]
