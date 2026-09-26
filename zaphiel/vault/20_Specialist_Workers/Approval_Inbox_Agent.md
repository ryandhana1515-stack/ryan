---
type: worker
worker_id: approval-inbox
name: Approval Inbox Agent (human task inbox)
version: 1.0
status: live
build_phase: 1
reports_to: "[[10_Agents/00_CEO_Orchestrator]]"
owner: Ryan
last_reviewed: 2026-09-26
tags: [worker, phase-1]
---
# Approval Inbox Agent (human task inbox) — specialist worker

> **Universal execution rule:** verified context → structured output → permission check → action or approval → audit log → measurable result.

**Where it stands (2026-09-26): running (v1.0).** n8n workflow **CEO Brain — Approval Inbox** (`r4ynzcSqRy8zHoFl`), page https://ryan1515.app.n8n.cloud/webhook/ceo-brain/inbox. One page: approvals waiting (Approve & send / Reject go through the existing Approve Reply gate `uQxHTTdEkazgKpRT`), exceptions to recover (Mark recovered), leads needing a human, overdue follow-ups, stale leads, AI fallback. Mark done / recovered needs the PIN (default the same as the Trainer PIN; change it in the n8n node "Inbox Config") and writes an audit row. Test leads are excluded; exceptions are always shown. Nothing on the page moves money or publishes a site. Source: `ceo-brain/workflows/approval-inbox/build.js`.

## 1. Job (one sentence)
The one inbox for everything that needs a human: approvals, exceptions to recover, questions from agents. Shows context, reason, deadline; records the decision; nudges before timeout.

## 2. Triggered by
any approval request or exception

## 3. Inputs → Outputs
requests → inbox items → decisions back to the requesting workflow

## 4. MUST DO / MUST NOT DO
MUST: show the full context and audit trail; enforce timeouts and escalation. MUST NOT: decide anything itself; expire silently. Plus [[00_CEO_Brain/00_Master_Rules]].

## 5. Permissions (read / write / approval)
write decisions (as the human), close recovery tasks — see [[40_Registries/Agent_Permission_Matrix]].

## 6. Platform services used
[[30_Platform_Services/Approval_Service]] · [[30_Platform_Services/Workflow_Event_Service]] · [[30_Platform_Services/Notification_Service]]

## 7. Steps
collect → present → remind → record

## 8. KPIs & logs
approvals decided within timeout % — [[40_Registries/KPI_Dictionary]]; every run audited.

## 9. Tests
An expired item escalates to the next approver.

## 10. Failure / fallback
Email fallback (today's approval emails).

## 11. Open questions for Ryan
Inbox inside the Training Room dashboard or a separate page? — v1 is a separate page (2026-09-26); a link from the Training Room can be added when Ryan wants it.
