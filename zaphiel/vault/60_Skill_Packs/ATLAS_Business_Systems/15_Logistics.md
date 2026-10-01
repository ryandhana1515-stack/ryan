---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "15"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 15 · Logistics

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Delivery, pickup, driver/courier assignment, shipments, tracking numbers,
delivery status, failed delivery, proof of delivery, returns, customer
notifications, warehouse dispatch, route/status info.
FLOW: order ready → delivery created → driver/courier assigned → tracking →
customer notified → delivered → proof of delivery → CRM/order updated.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Customers ask "where is my order?"; failed deliveries; no proof of delivery.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Do you use your own drivers, couriers, or both?"
- "Roughly how many deliveries a day?"
- "How do you prove a delivery was made?"

**CORE OBJECTS** — delivery · shipment · driver/courier · tracking number · proof of delivery · return.

**KEY EVENTS** — `delivery.created` · `delivery.assigned` · `delivery.out` · `delivery.completed` · `delivery.failed` · `return.received`

**WORKFLOWS** — See Ryan's FLOW.

**KPIs** — On-time deliveries (*Are we keeping promises?*) · failed deliveries (*Why do drops fail?*).

**KEEP/BUY/BUILD** — Courier APIs or a delivery-management product; custom only for unusual dispatch rules.

**CONTROLS & RISKS** — Driver location only with consent; proof-of-delivery photos stored with the order.

## Fusion EDG Core today
Logistics: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[13_Inventory_Warehouse]] · [[Archetypes/Logistics_Transport]]
