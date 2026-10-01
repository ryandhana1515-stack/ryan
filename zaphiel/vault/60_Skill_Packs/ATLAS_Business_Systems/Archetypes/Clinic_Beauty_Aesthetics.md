---
type: business-archetype
pack: ATLAS_Business_Systems
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 3 (2026-10-01)"
tags: [atlas, knowledge-pack, archetype]
---
# Archetype · Clinic / beauty / aesthetics

## Ryan's archetype (verbatim)
**Clinic / beauty / aesthetics**: enquiry → appointment → permitted admin → billing → follow-up. No clinical decisions by AI. Strict health-data access. KPIs: no-shows, rebooking.

## Completed
_Zaphiel's additions in Ryan's format (core flow • must-have modules • common integrations • signature KPIs • typical
traps). A starting point, never the final architecture: "Never use the exact same architecture for every company."_

- **Likely system type:** SERVICE-CRM (confirm with the agent file's SYSTEM-TYPE DECISION RULES).
- **Core flow:** as in Ryan's line above.
- **Must-have modules (cards):** [[06_Calendar_Appointments]] · [[17_WhatsApp_Messaging]] · [[16_Customer_Service]] · [[02_Follow_Up]] · [[08_Accounting_Finance]]
- **Common integrations:** The clinic management system (keep it as the source of truth for patient records), calendar, WhatsApp.
- **Signature KPIs:** No-shows; rebooking rate. Each one needs its management question in `11_dashboard_kpis.md`.
- **Typical traps:** AI giving medical advice; health details in chat notes; advertising claims (healthcare advertising rules: verify current MOH requirements before any campaign).
- **Fusion EDG Core fit today:** Good fit for bookings, reminders and the front-desk assistant (TESTED). Patient records stay in the clinic system.

Back to [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].
