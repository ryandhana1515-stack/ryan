---
type: platform_service
service_id: observability
name: Observability
version: 1.0
status: designed
priority: P1
owner_agent: "[[10_Agents/09_Workflow_Automation]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p1]
---
# Observability — shared platform service (P1)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
See what is happening: every run, call, cost and failure with its correlation id; dashboards and alerts for FusionTech and per tenant.

## Data model / schema
Sources: `ceo_agent_runs` / `workflow_runs`, connector call log, `ai_calls`, `exception_queue`, n8n executions. Views: per tenant, per agent, per day.

## Rules
1. Every run has a correlation id you can search. 2. Failures are alerts, not just rows. 3. Stale data is labelled as stale (never presented as live).

## Interfaces (what an agent calls → what it gets back)
`runs(filter)` · `errors(filter)` · `cost(tenant, period)`

## Where it runs today → target
- **Today:** n8n execution list + `ceo_agent_runs`; Daily Brief v0
- **Target:** dashboard page in the Training Room / CEO dashboard with runs, exceptions, cost, integration health

## Owner agent
[[10_Agents/09_Workflow_Automation]]

## Tests
An injected failure appears in the exception view within one run.

## Status
`designed` — see [[00_CEO_Brain/02_Build_Backlog]].
