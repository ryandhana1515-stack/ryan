---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "13"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 13 · Inventory & Warehouse

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
SKU, products, warehouses/locations, incoming, outgoing, reserved,
available (= on hand − reserved), suppliers, POs, sales orders, returns,
damaged stock, stock movements, reorder levels, low-stock alerts,
inventory-related financial flows.
Rule: stock changes only through MOVEMENTS (receipt, sale, transfer,
adjustment with a reason + approver). Never silent edits. Periodic counts
with reconciliation.
Alerts: LOW STOCK, OUT OF STOCK, REORDER REQUIRED, UNUSUAL MOVEMENT, RETURN,
DAMAGED, DELIVERY DELAY, SUPPLIER DELAY.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — "Stock never matches"; stock-outs; several warehouses; stock kept in a sheet.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Roughly how many products (SKUs), and in how many locations?"
- "Who updates stock today, and when?"
- "How often do you count stock, and how far off is it?"

**CORE OBJECTS** — See Ryan's list.

**KEY EVENTS** — `stock.received` · `stock.moved` · `stock.adjusted` (reason + approver) · `stock.counted` · `stock.low` · `stock.out`

**WORKFLOWS** — Movement-only stock changes; periodic count → variance → approved adjustment; low stock → purchase request (card [[14_Procurement]]).

**KPIs** — Stock accuracy, count vs system (*Can we trust the stock numbers?*) · stock-outs (*Are we losing sales?*) · value of slow stock (*Where is cash stuck?*).

**KEEP/BUY/BUILD** — If the ERP-LIKE rule applies (card [[20_ERP_Intelligence]]) → keep/integrate the ERP or buy a mature one. Otherwise a mature inventory product or an EDG module.

**CONTROLS & RISKS** — Ryan's rule. One source of truth for stock figures. Adjustments need a reason and an approver.

## Fusion EDG Core today
Inventory: **NEW BUILD** (not in the catalog). Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[14_Procurement]] · [[15_Logistics]] · [[20_ERP_Intelligence]] · [[Archetypes/Wholesale_Distribution]]
