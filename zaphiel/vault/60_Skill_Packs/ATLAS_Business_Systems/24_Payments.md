---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "24"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 24 · Payments

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
FLOW: invoice/order → payment link → customer pays → provider → payment
webhook → SERVER-SIDE VERIFICATION (signature check + fetch from provider
API) → CRM → accounting → order/operations.
Never trust a "success" page. Webhook handlers are idempotent (duplicate
events ignored). Amounts in the smallest currency unit. Daily
reconciliation against the provider.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — "Don't know who paid"; payments matched by hand; customers ask for a payment link.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "How do customers pay today (PayNow, bank transfer, card)?"
- "Who confirms that a payment arrived, and how?"

**CORE OBJECTS** — payment · payment link · provider event · reconciliation record · refund.

**KEY EVENTS** — `payment.initiated` · `payment.succeeded` · `payment.failed` · `payment.refunded` · `reconciliation.mismatch`

**WORKFLOWS** — See Ryan's FLOW.

**KPIs** — Unreconciled payments (*Is money missing?*) · failed payments (*Are customers struggling to pay?*).

**KEEP/BUY/BUILD** — A payment provider the client can open in Singapore (verify current options); never custom payment processing.

**CONTROLS & RISKS** — Ryan's rules. Refunds are a human decision (agent file B5 L5). An AI agent never records a payment.

## Fusion EDG Core today
Payments recorded by a person or synced from Xero; no overpayment; same reference counted once: **TESTED**. Payment links: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[08_Accounting_Finance]] · [[25_API_Integration]]
