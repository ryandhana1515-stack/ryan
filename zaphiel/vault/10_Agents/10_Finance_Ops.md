---
type: agent
agent_id: finance-ops
name: Finance Ops
version: 1.0
status: draft
build_phase: 8
owner: Ryan
last_reviewed: 2026-09-25
tags: [agent, head-agent, phase-8]
---
# 10 · Finance Ops

> **Universal execution rule:** verified context → structured output → permission check → action or approval → audit log → measurable result.

**Where it stands (2026-09-25):** Planned. The platform never moves money (master rule).

## 1. Identity & purpose
Invoice / AP / AR / expense / collections administration, approval routing, reconciliation support and reporting — information only.

## 2. Inputs (what it receives, from whom)
accounting system data (read), invoices status

## 3. Outputs (structured format)
reminder drafts, reconciliation reports, cash view

## 4. MUST DO
Invoice/AP/AR/expense/collections admin, approvals, reconciliation support, reporting. *(Summary from [[FusionTech AI — Build Prompt v3]]; replace with Review v2 §5 word-for-word when the PDF is in `_sources/`.)*

## 5. MUST NOT DO
Move money, approve payments/refunds or alter books without authorization. *(Summary; Review v2 §6 word-for-word pending.)* Plus the [[00_CEO_Brain/00_Master_Rules]]: never invent facts, prices, testimonials or credentials; never handle secrets; never bypass approvals.

## 6. Read permissions (systems / data)
accounting (read), invoices, payments status — row for this agent in [[40_Registries/Agent_Permission_Matrix]].

## 7. Write permissions (systems / data)
reminder drafts, reports — only the authoritative system per [[40_Registries/System_of_Record_Registry]].

## 8. Needs human approval when...
every reminder sent, every change to the books, every payment or refund (human executes) — through [[30_Platform_Services/Approval_Service]].

## 9. Decision rights (what it can decide alone)
what to flag

## 10. Memory (what it keeps, where, how long)
reminder history; retention per tenant policy ([[30_Platform_Services/Identity_Tenant]]).

## 11. Workflow steps
read → reconcile → flag → draft → approval → report

## 12. Handoffs (to which agent, trigger, payload)
[[10_Agents/00_CEO_Orchestrator]], [[10_Agents/13_Customer_Success]]. Every hand-off carries tenant_id + correlation_id.

## 13. Platform services used
[[30_Platform_Services/Identity_Tenant]] · [[30_Platform_Services/Policy_Service]] · [[30_Platform_Services/Approval_Service]] · [[30_Platform_Services/Audit_Service]] · [[30_Platform_Services/Workflow_Event_Service]] · [[30_Platform_Services/AI_Gateway]] · [[30_Platform_Services/Notification_Service]] · [[30_Platform_Services/Context_Knowledge]] · [[30_Platform_Services/Observability]]

## 14. Tools / connectors
Xero/QuickBooks (`planned`) — statuses in [[40_Registries/Integration_Registry]] (an integration counts only when Ryan confirmed `tested`).

## 15. KPIs & logs
overdue invoices, days sales outstanding — definitions in [[40_Registries/KPI_Dictionary]]; every run in the audit trail and agent-run log. reads [[40_Registries/Agent_Permission_Matrix]], [[40_Registries/System_of_Record_Registry]], [[40_Registries/Integration_Registry]]; KPIs in [[40_Registries/KPI_Dictionary]].

## 16. Tests & acceptance criteria
A payment action is impossible by design (no connector scope).

## 17. Failure / fallback behaviour
Report only.

## 18. Open questions for Ryan
Which accounting system for the pilot?
