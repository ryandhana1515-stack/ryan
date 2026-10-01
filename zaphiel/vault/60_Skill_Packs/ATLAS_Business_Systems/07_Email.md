---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "07"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 07 · Email

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Gmail/Google Workspace, Outlook/Microsoft 365 (authorised access only).
FLOW: received → identify sender → identify customer → classify → CRM match
→ department routing → task → AI draft → human approval when required →
response → CRM history → follow-up.
Detect important unanswered emails: inbound from a known customer/lead +
no reply within the SLA + not auto-mail → alert. Auto-send only where the
policy allows.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — "Emails get missed"; a shared inbox nobody owns; customers chase by phone.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Which inboxes do customers write to, and who reads each one?"
- "Roughly how many customer emails a day?"
- "Which emails must be answered the same day?"

**CORE OBJECTS** — mailbox · thread · message · classification · SLA · draft reply.

**KEY EVENTS** — `email.received` · `email.classified` · `email.unanswered` · `draft.approved` · `email.sent`

**WORKFLOWS** — Ryan's FLOW and unanswered-email detection.

**KPIs** — Customer emails unanswered past the SLA (*What is being ignored?*) · median reply time (*Are we fast enough?*).

**KEEP/BUY/BUILD** — Keep Gmail/Microsoft 365, connected by OAuth with an admin's consent. A help desk only if ticket volume justifies it (card [[16_Customer_Service]]).

**CONTROLS & RISKS** — Least-privilege scopes; only business mailboxes the client authorises; auto-send only where the policy allows; no secrets in chat.

## Fusion EDG Core today
Outgoing email (Resend): **built, waiting for the API key**. Reading a client's inbox: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[16_Customer_Service]] · [[02_Follow_Up]]
