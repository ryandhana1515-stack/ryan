---
type: platform_service
service_id: audit_service
name: Audit
version: 1.0
status: built
priority: P0
owner_agent: "[[10_Agents/15_Security_Governance_QA]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p0]
---
# Audit — shared platform service (P0)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
Every material action, by agent or human, becomes an immutable audit row: who, what, on which entity, before/after, why, when, under which correlation id.

## Data model / schema
`audit_logs` (tenant_id, entity_type, entity_id, action, old_value, new_value, actor, execution_id, correlation_id, reason, ts) — live today as `ceo_audit_logs`; target table in migration 002 (append-only).

## Rules
1. Append-only; nobody edits or deletes audit rows.
2. Material = anything that changes data, sends a message, spends money or credits, changes a permission, deploys, or decides an approval.
3. Actor is precise: `agent:<id>@<provider>`, `human:<email>`, `workflow:<id>`.
4. Secrets and full customer messages are never in the audit row (references instead).

## Interfaces (what an agent calls → what it gets back)
`log(tenant, actor, action, entity, before, after, reason, correlation_id)` → row id · `trail(entity)` → rows

## Where it runs today → target
- **Today:** `ceo_audit_logs` written by Lead Intake, Website Builder, Build Record, Approve Reply, Discovery
- **Target:** same table under RLS in Postgres; audit viewer in the dashboard

## Owner agent
[[10_Agents/15_Security_Governance_QA]]

## Tests
Every test execution of every workflow leaves at least one audit row with a correlation id.

## Status
`built` — see [[00_CEO_Brain/02_Build_Backlog]].
