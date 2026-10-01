---
type: business-archetype
pack: ATLAS_Business_Systems
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 3 (2026-10-01)"
tags: [atlas, knowledge-pack, archetype]
---
# Archetype · Retail / e-commerce

## Ryan's archetype (verbatim)
**Retail / e-commerce**: traffic → cart → order → payment → inventory → fulfilment → retention. Shopify etc. stays the source of truth for orders. KPIs: repeat rate, stock-outs, fulfilment time.

## Completed
_Zaphiel's additions in Ryan's format (core flow • must-have modules • common integrations • signature KPIs • typical
traps). A starting point, never the final architecture: "Never use the exact same architecture for every company."_

- **Likely system type:** COMMERCE EDG (confirm with the agent file's SYSTEM-TYPE DECISION RULES).
- **Core flow:** as in Ryan's line above.
- **Must-have modules (cards):** [[17_WhatsApp_Messaging]] · [[16_Customer_Service]] · [[13_Inventory_Warehouse]] · [[15_Logistics]] · [[24_Payments]] · [[28_Management_Dashboard]]
- **Common integrations:** The e-commerce platform, payment provider, couriers, accounting.
- **Signature KPIs:** Repeat rate; stock-outs; fulfilment time. Each one needs its management question in `11_dashboard_kpis.md`.
- **Typical traps:** Copying orders into a second system; two places holding stock numbers; marketing messages without consent.
- **Fusion EDG Core fit today:** Partial: WhatsApp AI assistant and CRM TESTED; orders, stock and fulfilment stay in the commerce platform (integration NEW BUILD).

Back to [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].
