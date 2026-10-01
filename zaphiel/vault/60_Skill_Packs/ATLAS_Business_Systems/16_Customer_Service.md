---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "16"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 16 · Customer Service

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Tickets, WhatsApp, email, calls, complaints, questions, priority, SLA,
assignment, AI response, human escalation, resolution, feedback, repeat-issue
analysis.
FLOW: message → identify customer → classify → priority → knowledge
retrieval → AI response OR human assignment → SLA → resolution → follow-up →
close. Serious complaints are never auto-closed.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Complaints lost in chats; the same questions answered by hand; no record of past issues.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Where do customers send questions or complaints?"
- "Which questions come up again and again?"
- "Who handles a serious complaint, and how quickly?"

**CORE OBJECTS** — ticket · conversation · category · priority · SLA · resolution · feedback.

**KEY EVENTS** — `ticket.opened` · `ticket.assigned` · `ticket.escalated` · `ticket.resolved` · `feedback.received`

**WORKFLOWS** — See Ryan's FLOW.

**KPIs** — First-response time (*Are customers waiting?*) · resolution time (*How long do problems last?*) · repeat issues by category (*What should we fix at the root?*).

**KEEP/BUY/BUILD** — A help desk when volume is high; otherwise inside the CRM.

**CONTROLS & RISKS** — Serious complaints never auto-closed; AI answers only from approved knowledge; hand-over always available.

## Fusion EDG Core today
AI assistant hand-over (`hand_over_to_person`) and notes: **TESTED**. Tickets: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[17_WhatsApp_Messaging]] · [[07_Email]] · [[27_AI_Agent_Layer]]
