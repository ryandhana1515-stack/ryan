---
type: business-archetype
pack: ATLAS_Business_Systems
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 3 (2026-10-01)"
tags: [atlas, knowledge-pack, archetype]
---
# Archetype · F&B

## Ryan's archetype (verbatim)
**F&B**: reservations/orders → kitchen → inventory/procurement → suppliers. Usually POS-centric: integrate the POS, don't rebuild it.

## Completed
_Zaphiel's additions in Ryan's format (core flow • must-have modules • common integrations • signature KPIs • typical
traps). A starting point, never the final architecture: "Never use the exact same architecture for every company."_

- **Likely system type:** COMMERCE EDG (POS-centric) (confirm with the agent file's SYSTEM-TYPE DECISION RULES).
- **Core flow:** as in Ryan's line above.
- **Must-have modules (cards):** [[06_Calendar_Appointments]] · [[17_WhatsApp_Messaging]] · [[13_Inventory_Warehouse]] · [[14_Procurement]] · [[28_Management_Dashboard]]
- **Common integrations:** POS, reservation and delivery platforms, accounting.
- **Signature KPIs:** Covers per day; food cost %; stock-outs of key items. Each one needs its management question in `11_dashboard_kpis.md`.
- **Typical traps:** Rebuilding the POS; ordering from suppliers by WhatsApp with no record.
- **Fusion EDG Core fit today:** Light fit: reservations and WhatsApp assistant TESTED; POS integration NEW BUILD.

Back to [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].
