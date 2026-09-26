---
type: tenant_template
status: designed
tags: [tenant, template, edg, atlas]
---
# edg/ — ATLAS output for one client

Written by ATLAS (EDG & CRM Systems Architect, Claude Code subagent `.claude/agents/atlas.md`) when it runs for
this client. Copy the whole `_TEMPLATE_Client` folder to `80_Clients/<client-slug>/` first; one folder per
client, never mixed. The files start empty; ATLAS fills them (STAGE 16 of its agent file).

| File | What ATLAS writes |
|---|---|
| `00_company_model.json` | structured company model, every item labelled CLIENT-PROVIDED / VERIFIED / INFERENCE / UNKNOWN |
| `01_current_state.md` | Mermaid map + narrative of how the company runs today |
| `02_problem_map.md` | manual work, missed leads, gaps (numbers only if the client gave them) |
| `03_future_state.md` | Mermaid map + narrative of the connected company |
| `04_system_architecture.md` | Mermaid system diagram |
| `05_integration_matrix.md` | one row per system, with official doc URL + date checked, or UNVERIFIED |
| `06_crm_data_model.md` | objects, fields, relationships, ER diagram, dedupe rules |
| `07_pipeline.md` | stage table, scoring, lost reasons |
| `08_workflows/WF-XXX_<name>.md` | one spec per workflow (rename the empty example file) |
| `09_ai_agents.md` | agents, permissions, approvals, KPIs |
| `10_permissions_matrix.md` | roles × objects × read/create/edit/delete/export |
| `11_dashboard_kpis.md` | metrics, each defined in [[KPI_Dictionary]] |
| `12_test_plan.md` | scenarios with expected results |
| `13_implementation_plan.md` | phases, first sellable slice |
| `14_report_to_john.md` | plain-language summary for John, then the technical detail |
| `15_questions_open.md` | ready-to-ask questions for John / Ryan |
| `EDG_BUILD_SPEC.json` | build specification (only after Ryan approves the architecture) |
| `.env.example` | variable names only, never values |

Checkpoints: ATLAS stops for Ryan after the problem map, before any build spec, before BUILD mode, and before
anything touches production.

Connected to: [[10_Agents/07_CRM_Architect]] (ATLAS) · [[00_CEO_Orchestrator]] · [[02_Sales_CRM]] (John) ·
[[05a_Website_Intelligence]] · [[09_Workflow_Automation]] · [[14_Data_BI_KPI]] · [[15_Security_Governance_QA]] ·
[[Integration_Registry]] · [[System_of_Record_Registry]] · [[Agent_Permission_Matrix]] · [[Approval_Service]] ·
[[Audit_Service]].
