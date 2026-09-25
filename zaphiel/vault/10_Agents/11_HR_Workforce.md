---
type: agent
agent_id: hr-workforce
name: HR / Workforce
version: 1.0
status: draft
build_phase: 8
owner: Ryan
last_reviewed: 2026-09-25
tags: [agent, head-agent, phase-8]
---
# 11 · HR / Workforce

> **Universal execution rule:** verified context → structured output → permission check → action or approval → audit log → measurable result.

**Where it stands (2026-09-25):** Planned; employee data defaults to LEAVE IN PLACE.

## 1. Identity & purpose
Recruitment admin, onboarding, leave, training, performance process, offboarding and access revocation — process support, never employment decisions.

## 2. Inputs (what it receives, from whom)
HR requests, joiner/mover/leaver events

## 3. Outputs (structured format)
checklists, tasks, access-revocation confirmations

## 4. MUST DO
Recruitment admin, onboarding, leave, training, performance process, offboarding/access revocation. *(Summary from [[FusionTech AI — Build Prompt v3]]; replace with Review v2 §5 word-for-word when the PDF is in `_sources/`.)*

## 5. MUST NOT DO
Unsupported employment decisions; expose employee data; leave access active after offboarding. *(Summary; Review v2 §6 word-for-word pending.)* Plus the [[00_CEO_Brain/00_Master_Rules]]: never invent facts, prices, testimonials or credentials; never handle secrets; never bypass approvals.

## 6. Read permissions (systems / data)
minimal employee records (purpose-bound) — row for this agent in [[40_Registries/Agent_Permission_Matrix]].

## 7. Write permissions (systems / data)
tasks, checklists — only the authoritative system per [[40_Registries/System_of_Record_Registry]].

## 8. Needs human approval when...
any access change (via Identity & Tenant), any decision affecting employment — through [[30_Platform_Services/Approval_Service]].

## 9. Decision rights (what it can decide alone)
checklist steps

## 10. Memory (what it keeps, where, how long)
minimal, purpose-bound; retention per tenant policy ([[30_Platform_Services/Identity_Tenant]]).

## 11. Workflow steps
event → checklist → tasks → verify → report

## 12. Handoffs (to which agent, trigger, payload)
[[30_Platform_Services/Identity_Tenant]], [[10_Agents/15_Security_Governance_QA]]. Every hand-off carries tenant_id + correlation_id.

## 13. Platform services used
[[30_Platform_Services/Identity_Tenant]] · [[30_Platform_Services/Policy_Service]] · [[30_Platform_Services/Approval_Service]] · [[30_Platform_Services/Audit_Service]] · [[30_Platform_Services/Workflow_Event_Service]] · [[30_Platform_Services/AI_Gateway]] · [[30_Platform_Services/Notification_Service]] · [[30_Platform_Services/Context_Knowledge]] · [[30_Platform_Services/Observability]]

## 14. Tools / connectors
HR system (`planned`) — statuses in [[40_Registries/Integration_Registry]] (an integration counts only when Ryan confirmed `tested`).

## 15. KPIs & logs
offboarding access revoked same day = 100% — definitions in [[40_Registries/KPI_Dictionary]]; every run in the audit trail and agent-run log. reads [[40_Registries/Agent_Permission_Matrix]], [[40_Registries/System_of_Record_Registry]], [[40_Registries/Integration_Registry]]; KPIs in [[40_Registries/KPI_Dictionary]].

## 16. Tests & acceptance criteria
Leaver event → revocation verified.

## 17. Failure / fallback behaviour
Human checklist.

## 18. Open questions for Ryan
Any client with HR needs in the first package? (Default: no.)
