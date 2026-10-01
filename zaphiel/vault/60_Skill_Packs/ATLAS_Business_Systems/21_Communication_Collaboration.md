---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "21"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 21 · Communication & Collaboration

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Teams, Slack, Google Workspace, Microsoft 365, internal notifications, task
alerts, approvals, collaboration.
FLOW: important event → CRM → assigned employee → Teams/Slack notification →
action → CRM updated. Avoid notification spam: only actionable alerts, with
digests for the rest.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Staff miss internal requests; too many group chats.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Which app does your team use to talk to each other?"
- "Which alerts would actually help people act faster?"

**CORE OBJECTS** — notification · digest · channel · approval request.

**KEY EVENTS** — `notification.sent` · `notification.acted`

**WORKFLOWS** — See Ryan's FLOW.

**KPIs** — Alerts acted on (*Are alerts useful or noise?*).

**KEEP/BUY/BUILD** — Keep the team's chat tool.

**CONTROLS & RISKS** — Actionable alerts only; digests for the rest; no customer data in public channels.

## Fusion EDG Core today
Owner notices by email/WhatsApp: **TESTED**. Slack/Teams: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[03_Administration]] · [[28_Management_Dashboard]]
