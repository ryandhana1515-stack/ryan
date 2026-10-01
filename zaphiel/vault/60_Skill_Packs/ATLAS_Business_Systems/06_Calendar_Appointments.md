---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "06"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 06 · Calendar & Appointments

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Google/Outlook calendars, booking tools, employee/team calendars, site
visits, meetings, service schedules, availability, reminders, rescheduling,
cancellations, no-shows.
FLOW: customer books → CRM contact → appointment → calendar → assigned
employee → reminder → appointment → outcome → CRM update → follow-up.
KPIs: no-show rate (Are reminders working?), utilisation (Are staff fully booked?).
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Bookings by phone/WhatsApp; double bookings; no-shows; staff unsure of their day.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "How do customers book today?"
- "Roughly how many no-shows a month?"
- "Does each staff member have their own calendar, or is there one shared one?"

**CORE OBJECTS** — appointment type · slot · booking · staff calendar · reminder · outcome.

**KEY EVENTS** — `appointment.booked` · `appointment.rescheduled` · `appointment.cancelled` · `appointment.completed` · `appointment.no_show` · `reminder.sent`

**WORKFLOWS** — Ryan's FLOW.

**KPIs** — See Ryan's KPIs.

**KEEP/BUY/BUILD** — Google/Outlook stays the calendar; the EDG books into it. A standalone booking tool only when bookings are the whole need.

**CONTROLS & RISKS** — No double booking. Completed / no-show is recorded by staff, not the AI. Client time zone. Reminder opt-out respected.

## Fusion EDG Core today
Appointments (slots, no double booking, reschedule, 24 h reminders): **TESTED**. Google Calendar: **TESTED (MOCK); live NEEDS VERIFICATION**. Outlook: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[11_Field_Service]] · [[02_Follow_Up]]
