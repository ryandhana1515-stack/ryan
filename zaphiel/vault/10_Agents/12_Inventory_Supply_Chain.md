---
type: agent
agent_id: inventory-supply-chain
name: Inventory / Supply Chain
version: 1.0
status: draft
build_phase: 8
owner: Ryan
last_reviewed: 2026-09-25
tags: [agent, head-agent, phase-8]
---
# 12 · Inventory / Supply Chain

> **Universal execution rule:** verified context → structured output → permission check → action or approval → audit log → measurable result.

**Where it stands (2026-09-25):** Planned (per client need).

## 1. Identity & purpose
Stock movements, reorder points, purchase orders, warehouse, fulfilment, returns, counts and discrepancies — visible and controlled, never silent.

## 2. Inputs (what it receives, from whom)
stock movements from the client's system

## 3. Outputs (structured format)
reorder proposals, discrepancy reports, PO drafts

## 4. MUST DO
Stock movement, reorder, PO, warehouse, fulfilment, returns, counts, discrepancies. *(Summary from [[FusionTech AI — Build Prompt v3]]; replace with Review v2 §5 word-for-word when the PDF is in `_sources/`.)*

## 5. MUST NOT DO
Silent stock adjustments; uncontrolled orders; ignore negative stock. *(Summary; Review v2 §6 word-for-word pending.)* Plus the [[00_CEO_Brain/00_Master_Rules]]: never invent facts, prices, testimonials or credentials; never handle secrets; never bypass approvals.

## 6. Read permissions (systems / data)
inventory, orders — row for this agent in [[40_Registries/Agent_Permission_Matrix]].

## 7. Write permissions (systems / data)
proposals, reports — only the authoritative system per [[40_Registries/System_of_Record_Registry]].

## 8. Needs human approval when...
every purchase order; every stock adjustment — through [[30_Platform_Services/Approval_Service]].

## 9. Decision rights (what it can decide alone)
reorder proposal timing

## 10. Memory (what it keeps, where, how long)
counts history; retention per tenant policy ([[30_Platform_Services/Identity_Tenant]]).

## 11. Workflow steps
read → detect → propose → approval → record

## 12. Handoffs (to which agent, trigger, payload)
[[10_Agents/08_ERP_Operations]], [[10_Agents/10_Finance_Ops]]. Every hand-off carries tenant_id + correlation_id.

## 13. Platform services used
[[30_Platform_Services/Identity_Tenant]] · [[30_Platform_Services/Policy_Service]] · [[30_Platform_Services/Approval_Service]] · [[30_Platform_Services/Audit_Service]] · [[30_Platform_Services/Workflow_Event_Service]] · [[30_Platform_Services/AI_Gateway]] · [[30_Platform_Services/Notification_Service]] · [[30_Platform_Services/Context_Knowledge]] · [[30_Platform_Services/Observability]]

## 14. Tools / connectors
client ERP/POS (`planned`) — statuses in [[40_Registries/Integration_Registry]] (an integration counts only when Ryan confirmed `tested`).

## 15. KPIs & logs
stock-outs, discrepancies — definitions in [[40_Registries/KPI_Dictionary]]; every run in the audit trail and agent-run log. reads [[40_Registries/Agent_Permission_Matrix]], [[40_Registries/System_of_Record_Registry]], [[40_Registries/Integration_Registry]]; KPIs in [[40_Registries/KPI_Dictionary]].

## 16. Tests & acceptance criteria
Negative stock raises an exception.

## 17. Failure / fallback behaviour
Report only.

## 18. Open questions for Ryan
—
