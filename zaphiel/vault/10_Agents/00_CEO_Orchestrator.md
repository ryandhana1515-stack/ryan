---
type: agent
agent_id: ceo-orchestrator
name: CEO Orchestrator
version: 1.0
status: live
build_phase: 1
owner: Ryan
last_reviewed: 2026-09-26
tags: [agent, head-agent, phase-1]
---
# 00 · CEO Orchestrator

> **Universal execution rule:** verified context → structured output → permission check → action or approval → audit log → measurable result.

**Where it stands (2026-09-26): running (v1.0.0).** n8n workflow **CEO Brain — CEO Orchestrator** (`8Ix4yc223sxrSu5h`): any workflow posts an event to `POST /webhook/ceo-brain/event` (`type`, `source`, `lead_id`, `task_id`, `summary`, `severity`, `correlation_id`, `payload`, `test_mode`); every hour it recomputes the unresolved-issues list from the tables. Routing table (event type → agent, action, severity, notify): `lead.new`, `lead.human_review` (review task), `discovery.complete`, `website.brief` / `building` / `built`, `website.build_failed` / `workflow.failed` / `integration.reauth_needed` / `exception.raised` (exception task + email Ryan), `approval.decided`; unknown types are logged, never dropped. It writes **[[00_CEO_Brain/Management view]]** (this vault, rewritten only when something changed) and the **Approval Inbox** page https://ryan1515.app.n8n.cloud/webhook/ceo-brain/inbox (`r4ynzcSqRy8zHoFl`). Deterministic, no AI credits. The Daily Brief (`Pew2PX1IcgdXqXr7`) still sends the 08:00 email. Source: `ceo-brain/agents/ceo-orchestrator/orchestrator.js` + `workflows/ceo-orchestrator/build.js`. Hand-offs between John, the Website Builder and the Build Runner still run inside those workflows; they will additionally post events here (next step).

## 1. Identity & purpose
The one manager over the whole workforce: receives company-wide work, routes it to the right agent, combines results, keeps track of what is unresolved, enforces the approval rules and produces the management view for the CEO. It owns no data; the registries and systems of record do.

## 2. Inputs (what it receives, from whom)
Events from every channel and agent (new lead, discovery complete, build done, exception, approval decided); Ryan's requests; the daily schedule.

## 3. Outputs (structured format)
Routing decisions (agent, payload, correlation_id); the management view (daily/weekly brief: leads, follow-ups overdue, approvals waiting, exceptions, builds, KPIs vs. targets); the unresolved-issues list (tasks).

## 4. MUST DO
Route company-wide work; combine results; track unresolved issues; enforce approvals; produce management view. *(Summary from [[FusionTech AI — Build Prompt v3]]; replace with Review v2 §5 word-for-word when the PDF is in `_sources/`.)*

## 5. MUST NOT DO
Become source of truth; bypass permissions; do sensitive actions without approval. *(Summary; Review v2 §6 word-for-word pending.)* Plus the [[00_CEO_Brain/00_Master_Rules]]: never invent facts, prices, testimonials or credentials; never handle secrets; never bypass approvals.

## 6. Read permissions (systems / data)
every registry; CRM summaries; task and approval states; audit trail; KPI dictionary — row for this agent in [[40_Registries/Agent_Permission_Matrix]].

## 7. Write permissions (systems / data)
tasks (create/assign), the management view note, routing log — only the authoritative system per [[40_Registries/System_of_Record_Registry]].

## 8. Needs human approval when...
never itself; it routes approval requests to the Approval Service and reports what is waiting — through [[30_Platform_Services/Approval_Service]].

## 9. Decision rights (what it can decide alone)
which agent handles an event; priority order; when to raise an unresolved issue to Ryan

## 10. Memory (what it keeps, where, how long)
unresolved-issues list (tasks table) and the daily view; no customer content beyond references; retention per tenant policy ([[30_Platform_Services/Identity_Tenant]]).

## 11. Workflow steps
1 event in → 2 verify tenant + permissions → 3 pick agent from the routing table → 4 call agent with correlation_id → 5 collect result → 6 create or close tasks → 7 log → 8 roll up into the management view

## 12. Handoffs (to which agent, trigger, payload)
to every head agent by event type; escalation to Ryan through the human task inbox ([[20_Specialist_Workers/Approval_Inbox_Agent]]). Every hand-off carries tenant_id + correlation_id.

## 13. Platform services used
[[30_Platform_Services/Identity_Tenant]] · [[30_Platform_Services/Policy_Service]] · [[30_Platform_Services/Approval_Service]] · [[30_Platform_Services/Audit_Service]] · [[30_Platform_Services/Workflow_Event_Service]] · [[30_Platform_Services/AI_Gateway]] · [[30_Platform_Services/Notification_Service]] · [[30_Platform_Services/Context_Knowledge]] · [[30_Platform_Services/Observability]]

## 14. Tools / connectors
none directly (only through agents and services) — statuses in [[40_Registries/Integration_Registry]] (an integration counts only when Ryan confirmed `tested`).

## 15. KPIs & logs
follow-ups overdue, approvals waiting, open exceptions, brief delivered on time (see KPI Dictionary) — definitions in [[40_Registries/KPI_Dictionary]]; every run in the audit trail and agent-run log. reads [[40_Registries/Agent_Permission_Matrix]], [[40_Registries/System_of_Record_Registry]], [[40_Registries/Integration_Registry]]; KPIs in [[40_Registries/KPI_Dictionary]].

## 16. Tests & acceptance criteria
An inbound lead event reaches John within one run; a build-done event updates the task and the brief; an unresolved exception appears in the next brief.

## 17. Failure / fallback behaviour
If an agent fails, the event goes to the exception queue and the brief shows it; the Orchestrator never silently drops an event.

## 18. Open questions for Ryan
Who receives the management view besides Ryan (Dad? client owners for their tenant)? Daily at what time?
