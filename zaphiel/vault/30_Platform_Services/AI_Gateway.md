---
type: platform_service
service_id: ai_gateway
name: AI Gateway
version: 1.0
status: built (per-workflow)
priority: P1
owner_agent: "[[10_Agents/15_Security_Governance_QA]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p1]
---
# AI Gateway — shared platform service (P1)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
One controlled door to the models (Claude via n8n Gateway credits today): model choice per agent, prompt versions, cost and token logging per tenant, fallbacks to rule engines, and no secrets in prompts.

## Data model / schema
`ai_calls` (tenant_id, agent, model, prompt_version, tokens_in/out, cost, latency, fallback_used, correlation_id). Prompts versioned in the repo (`ceo-brain/prompts/`); live knowledge injected from the vault at run time.

## Rules
1. Every agent has a rule-based fallback; a model outage never stops a workflow.
2. Model output is validated against the agent's JSON schema before it is used.
3. Never send secrets, other tenants' data or full documents the agent has no permission for.
4. Cost per tenant and per agent is visible ([[20_Specialist_Workers/Cost_Usage_Agent]]).

## Interfaces (what an agent calls → what it gets back)
`complete(tenant, agent, system_prompt, user_prompt, schema)` → validated JSON + usage

## Where it runs today → target
- **Today:** Anthropic nodes with n8n Gateway credits inside each workflow; usage logged in `ceo_agent_runs`
- **Target:** shared sub-workflow with model routing, prompt versions and cost rows

## Owner agent
[[10_Agents/15_Security_Governance_QA]]

## Tests
Credits exhausted → the agent answers from rules and the run is marked fallback (happened 2026-09-25, passed).

## Status
`built (per-workflow)` — see [[00_CEO_Brain/02_Build_Backlog]].
