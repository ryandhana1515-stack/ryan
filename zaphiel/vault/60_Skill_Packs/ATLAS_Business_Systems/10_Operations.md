---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "10"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 10 · Operations

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Jobs, work orders, projects, tasks, owners, deadlines, dependencies, SOPs,
status, quality checks, completion, exceptions, customer updates, internal
escalation.
Management must be able to answer: WHAT IS PENDING? WHAT IS LATE? WHAT IS
BLOCKED? WHO OWNS IT? WHAT NEEDS ATTENTION? WHAT WAS COMPLETED?
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Work tracked in chat groups; nobody knows what is pending; customers chase for updates.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "When a customer says yes, what happens next, and who does it?"
- "How do you find out today that a job is late?"
- "What usually goes wrong?"

**CORE OBJECTS** — job / work order · task · owner · due date · dependency · SOP checklist · exception.

**KEY EVENTS** — `job.created` · `job.assigned` · `job.blocked` · `job.completed` · `exception.raised`

**WORKFLOWS** — Accepted order → job → owner + due date → status updates → quality check → completion → customer update. Work on site → card [[11_Field_Service]]. Long multi-step work → card [[12_Project_Management]].

**KPIs** — Late jobs (*What is late?*) · blocked jobs (*What is blocked?*) · completed this week (*What was completed?*).

**KEEP/BUY/BUILD** — Decided by the work type (cards 11, 12).

**CONTROLS & RISKS** — Every job has an owner and a due date; exceptions escalate to a named person.

## Fusion EDG Core today
Jobs = booked appointments in the staff app (Jobs tab): built. Generic work orders with dependencies: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[11_Field_Service]] · [[12_Project_Management]] · [[16_Customer_Service]]
