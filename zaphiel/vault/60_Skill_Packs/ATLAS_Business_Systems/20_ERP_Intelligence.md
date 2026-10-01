---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "20"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 20 · ERP Intelligence

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Domains: finance, procurement, inventory, manufacturing, operations, orders,
suppliers, warehouse, projects, HR.
Decide: existing ERP REMAINS • INTEGRATE it • custom EDG modules are
SUFFICIENT • MIGRATE • specialist ERP implementation required. Use the
ERP-LIKE rule in the agent file. Don't rebuild mature ERP functionality.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — 3+ items of the ERP-LIKE rule (agent file): multi-location stock, procurement with approvals, POs + receiving, manufacturing/assembly, landed cost, serial/batch tracking, financial consolidation, many integrated departments.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Do you already use an ERP or an accounting system with stock and purchasing?"
- "Which departments touch an order, from purchase to delivery?"
- "Do you assemble or manufacture anything, or track batches/serial numbers?"

**CORE OBJECTS** — See the domain cards (08, 13, 14, 15).

**KEY EVENTS** — See the domain cards.

**WORKFLOWS** — Raise it early: count each criterion as CONFIRMED / LIKELY / UNKNOWN; stock + purchasing problems together, or 2+ confirmed-or-likely criteria, → **ERP-LIKE (provisional)** at once (agent file v3 NOTES). Then count the ERP-LIKE criteria → decision (REMAINS / INTEGRATE / SUFFICIENT / MIGRATE / SPECIALIST) with the reason → only then design custom EDG parts around it (CRM, WhatsApp, dashboard).

**KPIs** — See the domain cards.

**KEEP/BUY/BUILD** — See Ryan's Decide list. Options are compared on fit, cost and local support (verify vendors before naming them to a client).

**CONTROLS & RISKS** — Never rebuild mature ERP/accounting functions without a strong, written reason. Migration through agent file B6.

## Fusion EDG Core today
ERP functions: not in the catalog; EDG Core sits beside an ERP (CRM, WhatsApp, AI team, CEO brief). Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[13_Inventory_Warehouse]] · [[14_Procurement]] · [[08_Accounting_Finance]] · [[Archetypes/Wholesale_Distribution]]
