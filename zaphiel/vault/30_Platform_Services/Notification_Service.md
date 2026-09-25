---
type: platform_service
service_id: notification_service
name: Notification
version: 1.0
status: built (partial)
priority: P1
owner_agent: "[[10_Agents/09_Workflow_Automation]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p1]
---
# Notification — shared platform service (P1)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
One way to tell people things: owner emails, approval requests, exception alerts, client messages through the right channel (WhatsApp, email, chat) with test-mode safety.

## Data model / schema
`notifications` (tenant_id, to, channel, template, payload_ref, status queued/sent/failed/skipped_test_mode, message_id, correlation_id). Templates versioned in the repo.

## Rules
1. Test-mode leads never receive anything; the owner still gets copies. 2. Customer messages go only through the Outbound Sender (`SAcnNxG1GWPwn3N7`) so every send is logged. 3. Escalations and exceptions always reach a human within the timeout.

## Interfaces (what an agent calls → what it gets back)
`notify(tenant, to, channel, template, data)` → message_id

## Where it runs today → target
- **Today:** Gmail nodes + Outbound Sender workflow (WhatsApp pending the Meta credential)
- **Target:** one shared sender with templates, channels and the notification table

## Owner agent
[[10_Agents/09_Workflow_Automation]]

## Tests
A test-mode send is skipped and logged; an owner copy always arrives.

## Status
`built (partial)` — see [[00_CEO_Brain/02_Build_Backlog]].
