---
type: playbook
agent_id: atlas
mode: DISCOVERY
owner: Ryan
added: 2026-09-27
tags: [agent, atlas, playbook, discovery]
---
# ATLAS — Discovery Playbook (DISCOVERY MODE)

> Ryan's DISCOVERY MODE text (D0–D13) has ONE home: the "DISCOVERY MODE" section of ATLAS's agent file
> (`.claude/agents/atlas.md`). This note no longer keeps a copy (Ryan's OK, 2026-10-01: one home per rule); the
> copy that was here is in git history and was identical, word for word.

**Works with:** [[10_Agents/07_CRM_Architect]] (ATLAS) · [[10_Agents/02_Sales_CRM]] (John, customer-facing) ·
[[10_Agents/05a_Website_Intelligence]] · [[10_Agents/01_Discovery_Solution_Architect]] ·
[[10_Agents/15_Security_Governance_QA]]
**Output:** `80_Clients/<client-slug>/edg/discovery/` (template: `80_Clients/_TEMPLATE_Client/edg/discovery/`), then
DESIGN mode.
**Start it (Claude Code):** `Use the atlas agent in DISCOVERY mode. New customer: <name/website or "no info">. I'll paste their replies.`

## What DISCOVERY MODE does (summary, not Ryan's words)
ATLAS talks with the business owner (or Ryan relays the answers) like an experienced consultant, not a questionnaire:
1–3 questions at a time, plain words, research first, map today's workflow from a real recent customer, track what is
known in `00_discovery_state.md` (14-point coverage), play back a summary, and hand over `DISCOVERY_BRIEF.json` to
DESIGN mode only after the Final Discovery Check passes. Never prices, timelines, passwords or jargon.

**Sections in the agent file:** D0 core intelligence rule · D1 conversation rules · D2 opening · D3 intent playbook
("when the customer says X") · D4 map today's workflow · D5 research before asking · D6 existing tools · D7 Excel ·
D8 answer → next-question signals · D9 knowledge tracking · D10 final discovery check · D11 right-size · D12 hand-off
(`DISCOVERY_BRIEF.json`) · D13 must not.

**Since 2026-10-01 (v3):** after discovery ATLAS uses the knowledge pack
[[60_Skill_Packs/ATLAS_Business_Systems/00_Index|ATLAS Business Systems]] (symptom → investigate table, cards,
archetypes) to classify the company and pick the minimum modules.
