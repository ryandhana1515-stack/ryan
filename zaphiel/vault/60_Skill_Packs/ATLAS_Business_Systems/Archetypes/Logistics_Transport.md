---
type: business-archetype
pack: ATLAS_Business_Systems
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 3 (2026-10-01)"
tags: [atlas, knowledge-pack, archetype]
---
# Archetype · Logistics / transport

## Ryan's archetype (verbatim)
**Logistics / transport**: booking → dispatch → driver → tracking → POD → billing. KPIs: on-time delivery, failed deliveries.

## Completed
_Zaphiel's additions in Ryan's format (core flow • must-have modules • common integrations • signature KPIs • typical
traps). A starting point, never the final architecture: "Never use the exact same architecture for every company."_

- **Likely system type:** FIELD-SERVICE / OPS EDG (confirm with the agent file's SYSTEM-TYPE DECISION RULES).
- **Core flow:** as in Ryan's line above.
- **Must-have modules (cards):** [[15_Logistics]] · [[16_Customer_Service]] · [[24_Payments]] · [[08_Accounting_Finance]]
- **Common integrations:** Dispatch/transport system, driver app, accounting.
- **Signature KPIs:** On-time delivery; failed deliveries; billing lag after proof of delivery. Each one needs its management question in `11_dashboard_kpis.md`.
- **Typical traps:** Tracking drivers without consent; rebuilding a dispatch system that already works.
- **Fusion EDG Core fit today:** Partial: CRM and WhatsApp assistant TESTED; dispatch and proof of delivery NEW BUILD or integrate.

Back to [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].
