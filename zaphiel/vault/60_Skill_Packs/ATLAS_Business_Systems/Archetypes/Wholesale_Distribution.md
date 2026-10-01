---
type: business-archetype
pack: ATLAS_Business_Systems
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 3 (2026-10-01)"
tags: [atlas, knowledge-pack, archetype]
---
# Archetype · Wholesale / distribution

## Ryan's archetype (verbatim)
**Wholesale / distribution**: order → stock reserve → pick/pack → delivery → invoice → collections. Often ERP-LIKE. KPIs: stock accuracy, DSO, fill rate.

## Completed
_Zaphiel's additions in Ryan's format (core flow • must-have modules • common integrations • signature KPIs • typical
traps). A starting point, never the final architecture: "Never use the exact same architecture for every company."_

- **Likely system type:** ERP-LIKE EDG (confirm with the agent file's SYSTEM-TYPE DECISION RULES).
- **Core flow:** as in Ryan's line above.
- **Must-have modules (cards):** [[20_ERP_Intelligence]] · [[13_Inventory_Warehouse]] · [[14_Procurement]] · [[15_Logistics]] · [[08_Accounting_Finance]] · [[17_WhatsApp_Messaging]]
- **Common integrations:** ERP or accounting with stock, couriers, WhatsApp ordering.
- **Signature KPIs:** Stock accuracy; days to collect payment (DSO); fill rate. Each one needs its management question in `11_dashboard_kpis.md`.
- **Typical traps:** Building inventory modules before deciding the ERP question; purchase orders that live only in WhatsApp; stock edited by hand.
- **Fusion EDG Core fit today:** EDG Core sits beside the ERP: WhatsApp assistant for enquiries, CRM, CEO brief (taking orders by WhatsApp is NEW BUILD). Stock and purchasing stay in the ERP.

Back to [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].
