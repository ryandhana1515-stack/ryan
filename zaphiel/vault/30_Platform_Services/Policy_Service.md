---
type: platform_service
service_id: policy_service
name: Policy
version: 1.0
status: designed
priority: P0
owner_agent: "[[10_Agents/15_Security_Governance_QA]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p0]
---
# Policy — shared platform service (P0)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
The rules engine: answers *may this actor do this action on this system in this tenant?* using the permission matrix, the approval matrix and the master rules. Enforced in code, not in prompts.

## Data model / schema
Policies as versioned rules: `policies` (tenant_id, policy_id, subject agent/role, action, system, effect allow/deny/approval, condition, version). Source: [[40_Registries/Agent_Permission_Matrix]], [[00_CEO_Brain/00_Master_Rules]], client overrides in `80_Clients/<tenant>/Approvals.md`.

## Rules
1. Default deny. 2. Approval effects route to the [[30_Platform_Services/Approval_Service]]. 3. Policy changes are ADRs and audit rows. 4. Guardrails already in code (price words, credentials, WON/LOST, medical claims) are policies too and stay in the repo's `postprocess`/`brief` modules.

## Interfaces (what an agent calls → what it gets back)
`can(tenant, actor, action, system, context)` → allow / deny / needs_approval(policy_id)

## Where it runs today → target
- **Today:** guardrails inside each agent's post-processing code (repo), `requires_approval` flags
- **Target:** one shared policy check sub-workflow reading the matrix tables

## Owner agent
[[10_Agents/15_Security_Governance_QA]]

## Tests
Every row of the permission matrix has a passing test case (allow/deny/approval).

## Status
`designed` — see [[00_CEO_Brain/02_Build_Backlog]].
