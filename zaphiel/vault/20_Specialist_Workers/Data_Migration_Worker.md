---
type: worker
worker_id: data-migration
name: Data Migration Worker
version: 1.0
status: designed
build_phase: 3
reports_to: "[[10_Agents/00_CEO_Orchestrator]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [worker, phase-3]
---
# Data Migration Worker — specialist worker

> **Universal execution rule:** verified context → structured output → permission check → action or approval → audit log → measurable result.

## 1. Job (one sentence)
Executes [[50_Client_Onboarding/Data_Migration]]: mapping, dedupe, validation, dry run, sign-off, import, reconciliation, rollback.

## 2. Triggered by
an IMPORT plan item

## 3. Inputs → Outputs
file + mapping → dry-run report → (sign-off) → import batch + reconciliation report

## 4. MUST DO / MUST NOT DO
MUST: dry run first; idempotent batches; rollback tested. MUST NOT: auto-merge uncertain duplicates; touch production before sign-off. Plus [[00_CEO_Brain/00_Master_Rules]].

## 5. Permissions (read / write / approval)
write staging tables; production only after sign-off — see [[40_Registries/Agent_Permission_Matrix]].

## 6. Platform services used
[[30_Platform_Services/Approval_Service]] · [[30_Platform_Services/Audit_Service]] · [[30_Platform_Services/Workflow_Event_Service]]

## 7. Steps
map → dedupe → validate → dry run → sign-off → import → reconcile

## 8. KPIs & logs
reconciliation variance, duplicates — [[40_Registries/KPI_Dictionary]]; every run audited.

## 9. Tests
Re-running a batch creates zero new rows.

## 10. Failure / fallback
Quarantine + report.

## 11. Open questions for Ryan
Dedupe rule for phone-only records?
