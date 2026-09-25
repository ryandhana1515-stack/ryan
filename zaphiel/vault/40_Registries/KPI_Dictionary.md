---
type: registry
priority: P1
name: KPI Dictionary
status: draft
owner_agent: "[[10_Agents/14_Data_BI_KPI]]"
last_reviewed: 2026-09-25
tags: [registry, kpi]
---
# KPI Dictionary — one definition per number, versioned

Rule: a KPI is used only after it is defined here (name, definition, formula, source table, owner, refresh, version). Changing a definition = new version, never silent.

| KPI | Definition | Formula / source | Owner agent | Refresh | Version | Status |
|---|---|---|---|---|---|---|
| New leads | leads created in the period | count(`leads` where created_at in period) | [[10_Agents/02_Sales_CRM]] | daily | 1.0 | live (Daily Brief) |
| First-response time | time from inbound message to John's first reply | median(reply.ts − inbound.ts) | Sales/CRM | daily | 1.0 | draft |
| Qualified rate | leads that reach QUALIFIED/HOT ÷ new leads | | Sales/CRM | weekly | 1.0 | draft |
| Follow-ups overdue | open follow-up tasks past due_at | count(`tasks` type follow_up, due_at < now, status open) | Orchestrator | daily | 1.0 | live (Daily Brief) |
| Approvals waiting | tasks requires_approval = true and open | | [[30_Platform_Services/Approval_Service]] | daily | 1.0 | live (Daily Brief) |
| Mock-ups delivered | website_build tasks status built | | [[10_Agents/05_Website_App_General]] | weekly | 1.0 | draft |
| Time to mock-up | built.ts − intake complete.ts | | Website/App | weekly | 1.0 | draft |
| Integration health | connectors with health = ok ÷ live connectors | [[40_Registries/Integration_Registry]] | Security/QA | daily | 1.0 | draft |
| Workflow failure rate | failed executions ÷ executions | n8n executions | [[10_Agents/09_Workflow_Automation]] | daily | 1.0 | draft |
| AI cost per lead | AI spend ÷ new leads | [[20_Specialist_Workers/Cost_Usage_Agent]] | Cost/Usage | weekly | 1.0 | draft |
| Client business result | agreed per client at onboarding (e.g. response time, bookings, revenue reported) | client's system of record | Data/BI | monthly | — | per client |
