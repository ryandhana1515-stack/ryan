---
type: business-archetype
pack: ATLAS_Business_Systems
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 3 (2026-10-01)"
tags: [atlas, knowledge-pack, archetype]
---
# Archetype · Property agency

## Ryan's archetype (verbatim)
**Property agency**: lead → viewing → follow-up → offer → transaction. CEA ad rules, PDPA/DNC. KPIs: response time, viewings per lead. Link [[fusion-property-sg]].

## Completed
_Zaphiel's additions in Ryan's format (core flow • must-have modules • common integrations • signature KPIs • typical
traps). A starting point, never the final architecture: "Never use the exact same architecture for every company."_

- **Likely system type:** SALES-CRM (confirm with the agent file's SYSTEM-TYPE DECISION RULES).
- **Core flow:** as in Ryan's line above.
- **Must-have modules (cards):** [[01_Sales_CRM]] · [[02_Follow_Up]] · [[06_Calendar_Appointments]] · [[17_WhatsApp_Messaging]] · [[22_Forms]] · [[28_Management_Dashboard]]
- **Common integrations:** Meta lead ads, WhatsApp, property portals (check how each portal delivers leads before promising an integration).
- **Signature KPIs:** Response time; viewings per lead; leads without a next action per agent. Each one needs its management question in `11_dashboard_kpis.md`.
- **Typical traps:** Agents keeping leads on personal phones (the agency loses the data when they leave); messaging numbers on the DNC Registry; ads that break CEA rules ([[70_Industry_Packs/Singapore_Property/05_Marketing_Advertising_Rules]]).
- **Fusion EDG Core fit today:** Good fit: lead intake, round-robin owner, follow-ups, viewing bookings, AI assistant, staff logins and "each agent sees only their own customers" (ATLAS spec `team.visibility: own`) are TESTED. Property know-how: [[fusion-property-sg]].

Back to [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].
