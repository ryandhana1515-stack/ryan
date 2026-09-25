---
type: worker
worker_id: integration-health
name: Integration Health Worker
version: 1.0
status: designed
build_phase: 4
reports_to: "[[10_Agents/00_CEO_Orchestrator]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [worker, phase-4]
---
# Integration Health Worker — specialist worker

> **Universal execution rule:** verified context → structured output → permission check → action or approval → audit log → measurable result.

## 1. Job (one sentence)
Tests and monitors every connector in the [[40_Registries/Integration_Registry]]: auth check, sample call, rate limits, token expiry; moves status only with Ryan's confirmation; raises reauth tasks.

## 2. Triggered by
daily schedule; a new `authenticated` entry

## 3. Inputs → Outputs
registry entry → health result, `reauth_needed`, human task

## 4. MUST DO / MUST NOT DO
MUST: real calls only; log every result. MUST NOT: mark `tested` without Ryan; store secrets. Plus [[00_CEO_Brain/00_Master_Rules]].

## 5. Permissions (read / write / approval)
update health fields; propose status changes — see [[40_Registries/Agent_Permission_Matrix]].

## 6. Platform services used
[[30_Platform_Services/Tool_Connector_Gateway]] · [[30_Platform_Services/Notification_Service]] · [[30_Platform_Services/Observability]]

## 7. Steps
check → record → alert

## 8. KPIs & logs
integration health %, reauth tasks open — [[40_Registries/KPI_Dictionary]]; every run audited.

## 9. Tests
An expired token produces a task within a day.

## 10. Failure / fallback
Mark degraded; never retry forever.

## 11. Open questions for Ryan
—
