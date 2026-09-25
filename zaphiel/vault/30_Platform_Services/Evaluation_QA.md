---
type: platform_service
service_id: evaluation_qa
name: Evaluation & QA
version: 1.0
status: built (partial)
priority: P1
owner_agent: "[[10_Agents/15_Security_Governance_QA]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p1]
---
# Evaluation & QA — shared platform service (P1)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
Proves agents behave before and after every change: repo test suite (simulated n8n Code nodes), acceptance tests per agent (contract §16), website QA checklist, release gate.

## Data model / schema
Test results per run (`evaluations`: tenant_id, agent, version, test, result, evidence, ts). Acceptance criteria live in each agent note §16; website QA checklist generated with every brief.

## Rules
1. No deploy with a failing test (today: `node tests/run-tests.js`, 40 passing). 2. Every guardrail has a test. 3. A built website passes the QA checklist before a customer sees it (Website QA agent, backlog Phase 5).

## Interfaces (what an agent calls → what it gets back)
`evaluate(agent, version)` → pass/fail with evidence · `qa_website(preview_url, checklist)` → report

## Where it runs today → target
- **Today:** repo tests on every change; QA checklist text only
- **Target:** CI on the repo; Website QA agent inspecting previews; evaluation rows per release

## Owner agent
[[10_Agents/15_Security_Governance_QA]]

## Tests
A deliberately broken guardrail fails the suite.

## Status
`built (partial)` — see [[00_CEO_Brain/02_Build_Backlog]].
