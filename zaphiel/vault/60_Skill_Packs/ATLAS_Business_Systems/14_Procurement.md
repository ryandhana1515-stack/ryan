---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "14"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 14 · Procurement

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Purchase requests, supplier records, supplier quotations, quotation
comparison, approvals (thresholds), POs, receiving (full/partial), supplier
invoices (3-way match: PO ↔ receipt ↔ bill), payment status, supplier
performance.
FLOW: low stock → purchase request → approval → PO → supplier → receiving →
inventory update → accounting.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Purchasing over WhatsApp; nobody knows what was ordered; supplier bills do not match deliveries.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Who decides what to buy, and is there a spending limit that needs approval?"
- "How are orders sent to suppliers today?"
- "How do you check a delivery against what was ordered?"

**CORE OBJECTS** — See Ryan's list.

**KEY EVENTS** — `purchase_request.created` · `po.approved` · `po.sent` · `goods.received` (full/partial) · `bill.matched` / `bill.mismatch`

**WORKFLOWS** — See Ryan's FLOW.

**KPIs** — Supplier on-time delivery (*Which suppliers let us down?*) · bills not matched (*Are we paying for what we did not receive?*) · request-to-PO time (*Is purchasing slow?*).

**KEEP/BUY/BUILD** — Usually part of the ERP or accounting software (integrate). Custom only for an unusual approval chain.

**CONTROLS & RISKS** — Approval thresholds from the client. The requester is not the approver. 3-way match before payment.

## Fusion EDG Core today
Procurement: suppliers, low stock → draft purchase order (one per supplier) → approval by a person (approval limit from the client; the preparer cannot approve above it) → emailed to the supplier → deliveries in full or in part → stock up → supplier bill checked against what arrived (order ↔ delivery ↔ bill): **TESTED, staging (2026-10-01)**. Supplier quotation comparison, pushing supplier bills to Xero, supplier performance reports: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[13_Inventory_Warehouse]] · [[08_Accounting_Finance]] · [[20_ERP_Intelligence]]
