---
type: business-archetype
pack: ATLAS_Business_Systems
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 3 (2026-10-01)"
tags: [atlas, knowledge-pack, archetype]
---
# Archetype · Field service

## Ryan's archetype (verbatim)
**Field service** (electrical, aircon, plumbing, cleaning, pest control): enquiry → site visit → quote → job → schedule → mobile job card → photos/sign-off → invoice → payment. KPIs: late jobs, rework, completion-to-invoice time. Trap: building a sales CRM only.

## Completed
_Zaphiel's additions in Ryan's format (core flow • must-have modules • common integrations • signature KPIs • typical
traps). A starting point, never the final architecture: "Never use the exact same architecture for every company."_

- **Likely system type:** FIELD-SERVICE EDG (confirm with the agent file's SYSTEM-TYPE DECISION RULES).
- **Core flow:** as in Ryan's line above.
- **Must-have modules (cards):** [[01_Sales_CRM]] · [[02_Follow_Up]] · [[06_Calendar_Appointments]] · [[11_Field_Service]] · [[05_Documents_Presentations]] · [[08_Accounting_Finance]] · [[24_Payments]] · [[29_CEO_Daily_Brief]]
- **Common integrations:** WhatsApp, Google Calendar, accounting (Xero), maps link on the job card.
- **Signature KPIs:** Jobs completed vs scheduled; late jobs; callbacks/rework; completion-to-invoice time. Each one needs its management question in `11_dashboard_kpis.md`.
- **Typical traps:** Building the job card before fixing how jobs come in; tracking technicians' location without consent; materials never recorded, so jobs look profitable when they are not.
- **Fusion EDG Core fit today:** Strong fit: lead intake, quotations, appointments, Jobs tab, invoices, AI front desk are TESTED. Mobile job card (checklist, photos, signature, materials) is NEW BUILD.

Back to [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].
