---
type: business-archetype
pack: ATLAS_Business_Systems
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 3 (2026-10-01)"
tags: [atlas, knowledge-pack, archetype]
---
# Archetype · Professional services

## Ryan's archetype (verbatim)
**Professional services** (consultancy, agency, accounting firm): lead → proposal → engagement → project/timesheets → billing. KPIs: utilisation, WIP, overdue invoices.

## Completed
_Zaphiel's additions in Ryan's format (core flow • must-have modules • common integrations • signature KPIs • typical
traps). A starting point, never the final architecture: "Never use the exact same architecture for every company."_

- **Likely system type:** SALES-CRM + PROJECT/OPS EDG (confirm with the agent file's SYSTEM-TYPE DECISION RULES).
- **Core flow:** as in Ryan's line above.
- **Must-have modules (cards):** [[01_Sales_CRM]] · [[05_Documents_Presentations]] · [[23_E_Signature]] · [[12_Project_Management]] · [[08_Accounting_Finance]]
- **Common integrations:** Accounting (Xero/QuickBooks), Google Workspace / Microsoft 365, the existing project tool, e-signature.
- **Signature KPIs:** Utilisation; work in progress not yet billed; overdue invoices. Each one needs its management question in `11_dashboard_kpis.md`.
- **Typical traps:** Timesheets nobody fills in; rebuilding a project tool the team already likes; engagement terms decided by AI.
- **Fusion EDG Core fit today:** Partial: CRM, quotations, invoices TESTED. Projects and timesheets NEW BUILD (or connect the client's tool).

Back to [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].
