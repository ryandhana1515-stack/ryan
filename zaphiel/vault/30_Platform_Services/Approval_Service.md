---
type: platform_service
service_id: approval_service
name: Approval
version: 1.0
status: built (per-workflow) → designed (shared)
priority: P0
owner_agent: "[[20_Specialist_Workers/Approval_Inbox_Agent]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p0]
---
# Approval — shared platform service (P0)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
One place where sensitive actions wait for the right human: who approves what, with thresholds, timeouts and escalation. Agents request; humans decide; the service executes and logs.

## Data model / schema
- `approvals` (tenant_id, approval_id, requested_by agent, action, entity, amount, currency, reason, approver_role, approver, status requested/approved/rejected/edited/expired, requested_at, due_at, decided_at, decision_note, correlation_id).
- Approval matrix (who / what / limit) in [[40_Registries/Agent_Permission_Matrix]] (human approvers table) and per client in `80_Clients/<tenant>/Approvals.md`.

## Rules
1. Always human: money in/out, refunds, contracts, final pricing, deleting critical data, permission changes, production deploys, legal or medical commitments, WON / LOST.
2. Ryan's overrides in [[Decisions]] win (e.g. website **mock-ups need no approval**; publishing does).
3. Timeouts: 4 h for customer-facing replies, 24 h for others; on timeout escalate to the next approver; **nothing executes on silence**.
4. The approver sees the recommendation, the reason, the amount, the tenant and the audit trail; may approve, reject or edit.
5. Every decision is an audit row; the requesting agent is told the outcome and continues its workflow.

## Interfaces (what an agent calls → what it gets back)
`request(tenant, agent, action, entity, amount, reason)` → approval_id · `decide(approval_id, approver, decision, note)` · `status(approval_id)`

## Where it runs today → target
- **Today:** per-workflow approval emails with APPROVE & SEND links (Approve Reply `uQxHTTdEkazgKpRT`); tasks with `requires_approval` in `ceo_tasks`
- **Target:** one shared Approval workflow + the human task inbox (dashboard) with matrix, timeouts and escalation; signed links

## Owner agent
[[20_Specialist_Workers/Approval_Inbox_Agent]]

## Tests
A price mention in a reply is held and the approval email arrives; approving sends exactly the approved text; an expired approval never sends.

## Status
`built (per-workflow) → designed (shared)` — see [[00_CEO_Brain/02_Build_Backlog]].
