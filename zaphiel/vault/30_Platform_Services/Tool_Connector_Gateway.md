---
type: platform_service
service_id: tool_connector_gateway
name: Tool / Connector Gateway
version: 1.0
status: designed
priority: P0
owner_agent: "[[10_Agents/09_Workflow_Automation]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p0]
---
# Tool / Connector Gateway — shared platform service (P0)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
The one door to every external tool (WhatsApp, email, CRM, accounting, Lovable, Higgsfield, Kling…). Holds no secret itself; uses n8n credentials, checks the [[40_Registries/Integration_Registry]] status and the permission matrix before any call, and reports health.

## Data model / schema
- Registry entries (see [[40_Registries/Integration_Registry]] schema) with `status` and `health`.
- Call log: tenant_id, agent, connector, operation, correlation_id, result, latency, error (feeds [[30_Platform_Services/Observability]]).

## Rules
1. A call to a connector whose status is not `tested` or `live` is refused (except the test workflow itself).
2. Secrets only from n8n credentials / a secret manager; never in parameters, logs or notes.
3. Every call carries the correlation_id and idempotency_key from the [[30_Platform_Services/Workflow_Event_Service]].
4. Rate limits and token expiry are respected; `reauth_needed` raises a human task, never a silent failure.

## Interfaces (what an agent calls → what it gets back)
`call(tenant, agent, connector, operation, payload)` → result or typed error (unauthenticated / rate_limited / failed) · `health(connector)` → ok / degraded / down

## Where it runs today → target
- **Today:** n8n nodes with named credentials (Gmail, GitHub); HTTP Request / MCP Client nodes in the Website Build Runner
- **Target:** one shared sub-workflow per connector family with registry check + logging; per-tenant credentials

## Owner agent
[[10_Agents/09_Workflow_Automation]]

## Tests
A call with a `planned` connector is refused and logged; a 401 produces a reauth task, not a retry loop.

## Status
`designed` — see [[00_CEO_Brain/02_Build_Backlog]].
