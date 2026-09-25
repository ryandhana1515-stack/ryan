---
type: platform_service
service_id: workflow_event_service
name: Workflow & Event
version: 1.0
status: designed
priority: P0
owner_agent: "[[10_Agents/09_Workflow_Automation]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p0]
---
# Workflow & Event — shared platform service (P0)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
Makes workflows survive failure: every event has a correlation id and an idempotency key; retries are limited; failures land in an exception queue with a dead-letter list and a manual-recovery task. No silent failures, no infinite retries.

## Data model / schema
- `events` (tenant_id, event_id, type, source, correlation_id, idempotency_key, payload_ref, created_at)
- `workflow_runs` (tenant_id, run_id, workflow, execution_id, correlation_id, status, attempts, started_at, finished_at, error)
- `exception_queue` (tenant_id, run_id, step, error, attempts, state open/retrying/dead/recovered, recovery_task_id)
- Queues: inbound (channels), outbound (sends), builds; dead-letter per queue.

## Rules
1. Every trigger creates an event with a correlation_id that follows all downstream calls and audit rows.
2. Idempotency: the same key never causes a second side effect (sends, imports, builds, payments).
3. Retries: max 3, exponential backoff (30 s, 2 min, 10 min); then dead-letter + a recovery task for a human.
4. Reconciliation jobs compare what should have happened with what did (sends vs. messages, builds vs. tasks) daily.
5. Alerts go through the [[30_Platform_Services/Notification_Service]]; the CEO view shows open exceptions.

## Interfaces (what an agent calls → what it gets back)
`emit(event)` · `run(workflow, event)` → run_id · `retry(run_id)` · `dead_letter(run_id, reason)` · `recover(run_id, action)`

## Where it runs today → target
- **Today:** n8n executions with onError branches; `ceo_agent_runs` rows; no queue or dead-letter yet
- **Target:** event + run + exception tables (migration 002 has agent/workflow runs), a shared error workflow, a daily reconciliation workflow, exceptions in the human inbox

## Owner agent
[[10_Agents/09_Workflow_Automation]]

## Tests
Kill a connector mid-run: the run retries 3 times, lands in the exception queue with a recovery task, and re-running with the same idempotency key does not duplicate the send.

## Status
`designed` — see [[00_CEO_Brain/02_Build_Backlog]].
