---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "03"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 03 · Administration

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Forms, internal requests, approvals, document generation/storage, templates,
spreadsheets, reports, meeting records, tasks, calendar, appointments,
reminders, internal comms, file organisation, data entry, recurring admin,
employee requests, customer documentation.
Per process: KEEP HUMAN / AI ASSIST / AUTOMATE / REDESIGN / REMOVE. Start
with the highest-volume, rule-based, repetitive tasks.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Staff retype the same information; approvals happen in chat; recurring reports are built by hand; "admin takes all day".

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Which admin tasks does your team repeat every day or every week?"
- "Which of them need someone's approval, and how is it given today?"
- "Where do the finished documents end up?"

**CORE OBJECTS** — request · approval · task · template · document · recurring job.

**KEY EVENTS** — `request.submitted` · `approval.granted` / `approval.denied` · `task.overdue` · `report.generated`

**WORKFLOWS** — Form → validation → task/approval → document → storage → notification. One workflow per process, modular.

**KPIs** — Approval turnaround (*Where do requests get stuck?*) · hours of repeated admin per week (*What is worth automating first?*, only with numbers the client gives).

**KEEP/BUY/BUILD** — Google Workspace / Microsoft 365 forms, tasks and approvals are often enough. Build only where the process must link to the EDG data.

**CONTROLS & RISKS** — Approvals are logged (who, what, when). No automatic approval of money, HR or legal decisions (agent file B5 L5).

## Fusion EDG Core today
Tasks and one-click approval links exist (quotes, invoices). General internal requests: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[22_Forms]] · [[05_Documents_Presentations]] · [[21_Communication_Collaboration]]
