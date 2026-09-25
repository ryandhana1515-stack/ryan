---
type: platform_service
service_id: deployment_environments
name: Dev / Staging / Production
version: 1.0
status: designed
priority: P0
owner_agent: "[[20_Specialist_Workers/Deployment_Release_Worker]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p0]
---
# Dev / Staging / Production — shared platform service (P0)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
Separate environments (P0 #7): dev (FusionTech's own business as the pilot), staging (client UAT with test data), production. A release gate, a rollback path and change control for workflows, code nodes, prompts and database migrations.

## Data model / schema
- Environments per tenant: `staging` and `production` (separate n8n workflows or projects, separate database schemas/tenants, separate credentials).
- Release record: version, what changed (repo commit), tests, security check, approver, rollback plan, deployed_at.

## Rules
1. Every change starts in the repo (`ceo-brain/`), is generated (`build.js`), tested (`tests/run-tests.js`), then deployed to staging, then production.
2. Release gate: tests green + security review (secrets, permissions) + Ryan's sign-off + rollback tested = go.
3. Rollback = republish the previous n8n version (versions kept) and revert the migration; tested before first production use.
4. Test data never touches production; production data never touches dev.
5. Publishing a website to a live domain is a production deploy: human approval, always.

## Interfaces (what an agent calls → what it gets back)
`release(version, target)` → release record · `rollback(version)`

## Where it runs today → target
- **Today:** one n8n project; test_mode flags separate test from real leads; n8n keeps workflow versions
- **Target:** staging + production workflow sets (or projects), Supabase branches, release records in the vault changelog

## Owner agent
[[20_Specialist_Workers/Deployment_Release_Worker]]

## Tests
Deploy a broken version to staging, roll back, verify production untouched.

## Status
`designed` — see [[00_CEO_Brain/02_Build_Backlog]].
