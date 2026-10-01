---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "27"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 27 · AI Agent Layer

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Sales, Lead Qualification, Follow-Up, Email, Customer Support, Appointment,
Quotation, Document, Operations, Inventory, Procurement, Admin, Accounting
Assistant, Reporting, CEO Intelligence. Only where there's genuine value.
Each agent: ROLE • PURPOSE • INPUT • TOOLS • DATA ACCESS • PERMISSIONS •
TRIGGERS • ALLOWED ACTIONS • PROHIBITED ACTIONS • ESCALATION RULE • OUTPUT •
LOGGING • TEST CASES. No unlimited access by default.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — High message volume; the same answers given all day; after-hours enquiries lost.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Which questions do customers ask most often?"
- "What should never be answered without a person?"

**CORE OBJECTS** — agent · tool grant · knowledge item · hand-over · action log.

**KEY EVENTS** — `agent.replied` · `agent.handed_over` · `agent.tool_called` · `ai_limit.reached`

**WORKFLOWS** — Agent file B20 (the client's AI team).

**KPIs** — Hand-over rate (*What can the AI not handle?*) · AI cost per month vs limit (*Is AI use under control?*).

**KEEP/BUY/BUILD** — EDG Core agent runtime when the safe tool catalog fits; otherwise NEW BUILD.

**CONTROLS & RISKS** — Ryan's rules; never quotes outside the price list; never records payments or WON/LOST; monthly AI limit per client.

## Fusion EDG Core today
AI team (tools `find_free_times`, `book_job`, `prepare_quote`, `save_customer_details`, `add_note`, `hand_over_to_person`), price guard, monthly AI limit: **TESTED, staging**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[16_Customer_Service]] · [[26_Automation_n8n]]
