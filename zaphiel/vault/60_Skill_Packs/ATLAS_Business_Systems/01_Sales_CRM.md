---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "01"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 01 · Sales & CRM

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
CRM = the structured customer relationship layer. It is NOT necessarily the
whole EDG.
OBJECTS: contacts, companies, leads, opportunities/deals, pipelines, stages,
activities, tasks, notes, appointments, quotations, communication history,
segments, support history, documents, orders, invoices, payments, renewals,
subscriptions (where relevant).
CAPABILITIES: lead capture, qualification, lead scoring (only with enough
data), assignment, pipeline, activities, quotations/proposals, follow-up,
negotiation, won/lost + LOST REASONS (required), targets, commission (where
applicable), forecasting, repeat customers, renewals, upsell/cross-sell,
reporting.
DEFAULT PIPELINE (adapt it): NEW LEAD → CONTACTED → QUALIFIED → DISCOVERY →
QUOTATION/PROPOSAL → FOLLOW-UP → NEGOTIATION → WON/LOST.
KPIs: response time (Are we fast enough?), conversion by source (Which
channel brings paying customers?), pipeline value by stage (What's likely to
close?), win rate + lost reasons (Why do we lose?).
KEEP/BUY/BUILD: an existing CRM that people actually use → KEEP/CONNECT.
For SMEs with standard sales processes → a mature CRM is usually cheaper than
custom. Build custom only for unusual workflows or a unified Fusion portal.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Enquiries arrive in several places (WhatsApp, ads, website, calls); more than one person sells; quotes are sent; the owner cannot say how many deals are open; "leads go missing".

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Walk me through your last customer, from the first message until they paid."
- "Where do enquiries come in, and who replies to them?"
- "Roughly how many enquiries a month, and how many people handle them?"

**CORE OBJECTS** — See Ryan's OBJECTS list. Create only what the mapped workflow uses (agent file §5).

**KEY EVENTS** — `lead.created` · `lead.assigned` · `deal.stage_changed` · `quotation.sent` · `deal.won` · `deal.lost` (lost reason required)

**WORKFLOWS** — Lead intake → dedupe → assign owner → acknowledge → follow-up (card [[02_Follow_Up]]) → quotation (card [[05_Documents_Presentations]]) → WON/LOST by a person.

**KPIs** — See Ryan's KPIs (each already carries its management question).

**KEEP/BUY/BUILD** — See Ryan's KEEP/BUY/BUILD.

**CONTROLS & RISKS** — WON/LOST is a human decision. A lead never exists without an owner and a next action. Prices only from the client's approved list. Lead source captured at intake (agent file §4).

## Fusion EDG Core today
Lead intake + CRM: **TESTED, staging**. Quotations from the approved price list: **TESTED**. Staff app (Customers board) with **staff logins** (own email + password, lockout) and an owner switch so **each salesperson sees only their own customers** (enforced by the database): **TESTED, staging (2026-10-01)**. Facebook/Instagram lead forms and property-portal / enquiry emails come in as customers by themselves: **TESTED, staging (2026-10-01)**; real Page and real portal emails NEEDS VERIFICATION per client. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[02_Follow_Up]] · [[05_Documents_Presentations]] · [[17_WhatsApp_Messaging]] · [[28_Management_Dashboard]]
