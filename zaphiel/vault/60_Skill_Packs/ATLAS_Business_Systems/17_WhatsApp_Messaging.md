---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "17"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 17 · WhatsApp & Messaging

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
WhatsApp Business Platform, Respond.io, other supported platforms.
FLOW: message → identify customer → CRM → intent → sales/support/operations
→ AI or human → action → follow-up → CRM log. Human takeover always
available. Respect the platform's opt-in and template rules and PDPA/DNC for
marketing.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Most enquiries arrive on WhatsApp; several staff phones; chats lost when staff leave.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Do you use normal WhatsApp, the WhatsApp Business app, or a platform like Respond.io?"
- "How many people reply, and roughly how many chats a month?"
- "Which number do customers know: a company number or staff numbers?"

**CORE OBJECTS** — channel account · conversation · message · template · opt-in / opt-out · hand-over.

**KEY EVENTS** — `message.received` · `message.sent` · `agent.handed_over` · `template.sent` · `customer.opted_out`

**WORKFLOWS** — See Ryan's FLOW.

**KPIs** — First-reply time (*Are we fast enough?*) · chats handed to a person (*What can the AI not handle?*).

**KEEP/BUY/BUILD** — WhatsApp Business Platform (Cloud API) directly, or a provider the client already uses. Verify current Meta rules and pricing before promising.

**CONTROLS & RISKS** — 24-hour window; templates outside it; opt-in; PDPA and DNC for marketing; human takeover always; company-owned number.

## Fusion EDG Core today
Client WhatsApp number (onboarding checklist, one platform webhook): **TESTED (MOCK); live NEEDS VERIFICATION**. FusionTech's own John on WhatsApp: live. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[16_Customer_Service]] · [[01_Sales_CRM]] · [[02_Follow_Up]]
