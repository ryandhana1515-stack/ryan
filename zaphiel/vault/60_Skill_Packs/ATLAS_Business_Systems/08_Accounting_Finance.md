---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "08"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 08 · Accounting & Finance

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Xero, QuickBooks, existing accounting/ERP modules, payment providers.
Concepts: quotation, sales order, invoice, credit note, payment status,
expenses, supplier bill, purchase order, AR, AP, cash-flow reporting,
management reporting, tax-related data flows.
ATLAS is NOT the accountant. No accounting treatment or tax advice.
Preserve accountant/human oversight. Accounting software is the source of
truth for invoices/payments unless decided otherwise.
CRM ↔ ACCOUNTING: deal won → customer info → accounting → invoice → payment
→ payment status → CRM updated → sales dashboard → finance dashboard. No
duplicate data entry.
Singapore notes (verify current rules with IRAS before advising): GST
registration status matters for invoice formats. Check current e-invoicing
(InvoiceNow/Peppol) requirements for the client's GST situation. Common
local payment methods: PayNow, bank transfer, cards.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — "Don't know who paid"; invoices typed twice; month-end takes days.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Which accounting software do you use, and who keeps the books?"
- "Is the company GST-registered? (Recorded as a fact for the accountant; no advice.)"
- "How do customers pay, and how do you match a payment to its invoice today?"

**CORE OBJECTS** — See Ryan's Concepts.

**KEY EVENTS** — `invoice.issued` · `invoice.overdue` · `payment.received` · `credit_note.issued` · `bill.received`

**WORKFLOWS** — Ryan's CRM ↔ ACCOUNTING flow.

**KPIs** — Overdue receivables and days to collect (*Who owes us, and for how long?*) · cash received this week (*How is cash coming in?*).

**KEEP/BUY/BUILD** — Keep and connect the accounting software. Never rebuild a ledger.

**CONTROLS & RISKS** — Ryan's rules. Issuing or voiding an invoice is a human decision. Tax and treatment questions go to the client's accountant.

## Fusion EDG Core today
Invoices + payments (gap-free numbers, payments recorded by a person or synced back): **TESTED**. Xero: **TESTED (MOCK); live NEEDS VERIFICATION**. QuickBooks, InvoiceNow: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[24_Payments]] · [[14_Procurement]] · [[20_ERP_Intelligence]]
