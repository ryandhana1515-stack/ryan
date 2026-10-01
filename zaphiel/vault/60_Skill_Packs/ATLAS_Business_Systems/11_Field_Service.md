---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "11"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 11 · Field Service

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
SIGNALS: staff work at customer sites; jobs, technicians, materials, photos,
sign-off.
OBJECTS: job/work order, site/address, technician, schedule slot, materials
used, checklist, photos (before/after), customer signature, job status,
time on site.
MOBILE JOB CARD: today's jobs, address + map link, customer contact, scope,
checklist, materials, photo upload, signature, "complete" button. It must
work on a phone with a weak signal.
FLOW: enquiry → site visit → quotation → approval → job → assignment →
schedule → mobile job card → materials → status → photos → sign-off →
invoice → payment → follow-up → dashboard.
KPIs: jobs completed vs scheduled, late jobs, callbacks/rework, time from
completion to invoice. Location tracking only with clear staff
consent/policy.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — See Ryan's SIGNALS. Also: "my staff forget jobs", job details passed on by phone or WhatsApp.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "How do your technicians get their jobs today, and how do they report back?"
- "How do you know a job is finished, and finished properly?"
- "How long after a job is done does the customer get the invoice?"

**CORE OBJECTS** — See Ryan's OBJECTS.

**KEY EVENTS** — `job.scheduled` · `job.started` · `job.completed` · `signoff.captured` · `callback.requested` · `invoice.issued`

**WORKFLOWS** — See Ryan's FLOW.

**KPIs** — Ryan's KPIs, each with its question: jobs completed vs scheduled (*Are we delivering what we booked?*), late jobs (*What is late?*), callbacks/rework (*Is the work done right first time?*), completion-to-invoice time (*Are we slow to bill?*).

**KEEP/BUY/BUILD** — Compare a mature field-service product (check current Singapore availability and pricing) with Fusion EDG Core plus the mobile job card. Choose by fit to the flow, staff phones and cost. Never just a sales CRM.

**CONTROLS & RISKS** — Location tracking only with staff consent and a written policy. Customer signature and photos stored with the job in the client's storage. Works offline / on a weak signal.

## Fusion EDG Core today
Appointments, the staff app Jobs tab, quotations, invoices: **TESTED**. **Mobile job card** (job address + map link, checklist per service, materials used, before/after photos, customer signature or reason, complete; works on a weak signal; AI agents can never write it): **TESTED, staging (2026-10-01)**. Materials picked from stock come off the technician's van when the job is completed: **TESTED, staging (2026-10-01)**. Not yet: GPS/time tracking. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[06_Calendar_Appointments]] · [[10_Operations]] · [[08_Accounting_Finance]] · [[Archetypes/Field_Service]]
