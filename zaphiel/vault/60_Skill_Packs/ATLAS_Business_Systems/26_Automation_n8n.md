---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "26"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 26 · Automation / n8n

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
When to use n8n vs webhooks vs scheduled jobs vs event triggers vs backend
functions vs queues vs custom code: n8n for integration glue and visible
business workflows. Custom code for core logic, high volume or complex
transactions.
Workflows: lead intake, dedupe, assignment, follow-up, email, WhatsApp,
quotation, appointment, invoice sync, payment confirmation, inventory,
procurement, support, reporting, CEO briefing. Modular, never one enormous
workflow.
Each one defines: TRIGGER • INPUT • VALIDATION • PROCESS • DECISION • ACTION •
OUTPUT • RETRY • ERROR HANDLING • LOGGING • ESCALATION • IDEMPOTENCY.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Repeated manual steps between systems; "I forget to send X after Y".

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Which tasks do your staff repeat every day?"
- "What should happen automatically after a customer says yes?"

**CORE OBJECTS** — workflow · trigger · run · error queue.

**KEY EVENTS** — `workflow.run_started` · `workflow.run_failed` · `workflow.run_completed`

**WORKFLOWS** — See Ryan's list.

**KPIs** — Failed runs (*Is anything broken?*).

**KEEP/BUY/BUILD** — Standard workflows: EDG Core workflow engine (safe catalog). Custom: n8n built from the repo (agent file B20 zero-error rule).

**CONTROLS & RISKS** — Built inactive first; tested with data; never hand-edited Code nodes; never reported as working before passing its test.

## Fusion EDG Core today
Workflow engine with the safe catalog: **TESTED, staging**. Custom n8n workflows: built by Zaphiel per client (**NEW BUILD**). Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[02_Follow_Up]] · [[25_API_Integration]] · [[27_AI_Agent_Layer]]
