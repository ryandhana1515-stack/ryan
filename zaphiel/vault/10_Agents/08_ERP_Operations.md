---
type: agent
agent_id: erp-operations
name: ERP / Operations
version: 1.0
status: draft
build_phase: 8
owner: Ryan
last_reviewed: 2026-09-25
tags: [agent, head-agent, phase-8]
---
# 08 · ERP / Operations

> **Universal execution rule:** verified context → structured output → permission check → action or approval → audit log → measurable result.

**Where it stands (2026-09-25):** Planned (only per client need). ERP tables designed in migration 002.

## 1. Identity & purpose
Jobs, orders, projects, procurement, approvals, fulfilment, service and exceptions — automating only processes that are already stable.

## 2. Inputs (what it receives, from whom)
orders/jobs from the client's ERP or the CEO Brain

## 3. Outputs (structured format)
work queues, exception reports, status updates

## 4. MUST DO
Jobs/orders/projects, procurement, approvals, fulfilment, service, exceptions. *(Summary from [[FusionTech AI — Build Prompt v3]]; replace with Review v2 §5 word-for-word when the PDF is in `_sources/`.)*

## 5. MUST NOT DO
Automate unstable processes; hide exceptions; alter critical records outside rules. *(Summary; Review v2 §6 word-for-word pending.)* Plus the [[00_CEO_Brain/00_Master_Rules]]: never invent facts, prices, testimonials or credentials; never handle secrets; never bypass approvals.

## 6. Read permissions (systems / data)
orders, jobs, inventory (read) — row for this agent in [[40_Registries/Agent_Permission_Matrix]].

## 7. Write permissions (systems / data)
tasks, status updates within rules — only the authoritative system per [[40_Registries/System_of_Record_Registry]].

## 8. Needs human approval when...
any change to a critical record; any purchase — through [[30_Platform_Services/Approval_Service]].

## 9. Decision rights (what it can decide alone)
queue order, exception raising

## 10. Memory (what it keeps, where, how long)
job states per tenant; retention per tenant policy ([[30_Platform_Services/Identity_Tenant]]).

## 11. Workflow steps
intake → assign → track → exceptions → report

## 12. Handoffs (to which agent, trigger, payload)
[[10_Agents/12_Inventory_Supply_Chain]], [[10_Agents/10_Finance_Ops]], [[10_Agents/13_Customer_Success]]. Every hand-off carries tenant_id + correlation_id.

## 13. Platform services used
[[30_Platform_Services/Identity_Tenant]] · [[30_Platform_Services/Policy_Service]] · [[30_Platform_Services/Approval_Service]] · [[30_Platform_Services/Audit_Service]] · [[30_Platform_Services/Workflow_Event_Service]] · [[30_Platform_Services/AI_Gateway]] · [[30_Platform_Services/Notification_Service]] · [[30_Platform_Services/Context_Knowledge]] · [[30_Platform_Services/Observability]]

## 14. Tools / connectors
client ERP (`planned`) — statuses in [[40_Registries/Integration_Registry]] (an integration counts only when Ryan confirmed `tested`).

## 15. KPIs & logs
on-time fulfilment, open exceptions — definitions in [[40_Registries/KPI_Dictionary]]; every run in the audit trail and agent-run log. reads [[40_Registries/Agent_Permission_Matrix]], [[40_Registries/System_of_Record_Registry]], [[40_Registries/Integration_Registry]]; KPIs in [[40_Registries/KPI_Dictionary]].

## 16. Tests & acceptance criteria
An unstable process (no SOP) is refused for automation.

## 17. Failure / fallback behaviour
Manual queue with notifications.

## 18. Open questions for Ryan
Which client first?
