---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "02"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 02 · Follow-Up System

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Fields: owner, status, priority, last interaction, next action, next-action
date, response SLA. Every important active lead has OWNER • STATUS • LAST
INTERACTION • NEXT ACTION • NEXT ACTION DATE.
Follow-up types: quotation, appointment, payment, renewal, inactive-customer
reactivation.
DETECT (scheduled checks): unanswered enquiries, overdue follow-ups,
unassigned leads, stalled deals, expired quotations, missed appointments,
unanswered email, unanswered WhatsApp. Each one gets a recovery workflow:
alert the owner → escalate to the manager after X → show it in the CEO brief.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — "Nobody follows up", "leads go cold", quotes go unanswered, customers complain nobody called back.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "How do you find out today that a customer was not followed up?"
- "How quickly should a new enquiry get a reply: minutes, hours, same day?"
- "Who should be told when a follow-up is late: the salesperson, a manager, you?"

**CORE OBJECTS** — task / next action · follow-up rule · SLA · escalation step · reminder.

**KEY EVENTS** — `followup.due` · `followup.overdue` · `quote.expired` · `appointment.missed` · `lead.unassigned` · `deal.stalled`

**WORKFLOWS** — Ryan's DETECT list, each with its recovery workflow (alert owner → escalate after X → CEO brief). X comes from the client; never assumed.

**KPIs** — Overdue follow-ups per owner (*Who is falling behind?*) · % of open leads with a next action date (*Is anything slipping through?*) · median first-response time (*Are we fast enough?*).

**KEEP/BUY/BUILD** — Built into whichever CRM is chosen (card [[01_Sales_CRM]]). Never a separate tool.

**CONTROLS & RISKS** — WhatsApp messages more than 24 h after the customer's last message need an approved template, otherwise a person sends them. PDPA consent and the DNC Registry for marketing messages. Opt-outs respected everywhere. A cap on automatic reminders per customer.

## Fusion EDG Core today
Workflow engine (conditions `customer_has_not_replied`, `quote_still_open`, `lead_still_open`; actions `notify_owner`, `ai_follow_up`, `create_task`): **TESTED, staging**. Known gap: the staging scheduler runs once a day (see Open loops). Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[01_Sales_CRM]] · [[26_Automation_n8n]] · [[29_CEO_Daily_Brief]]
