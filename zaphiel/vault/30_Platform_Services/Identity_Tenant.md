---
type: platform_service
service_id: identity_tenant
name: Identity & Tenant
version: 1.0
status: designed
priority: P0
owner_agent: "[[10_Agents/15_Security_Governance_QA]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p0]
---
# Identity & Tenant — shared platform service (P0)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
One isolated workspace per client (**tenant provisioning**, P0 #2) and one identity model for people and agents (**identity & permissions**, P0 #3): roles, OAuth/SSO where the client has it, least privilege, approval authority, joiner / mover / leaver.

## Data model / schema
- `tenants` (tenant_id, name, slug, status, environments, created_at) · `tenant_modules` (tenant_id, module, enabled)
- `users` (tenant_id, user_id, email, role, auth_provider, status) · `roles` (tenant_id, role, permissions[]) · `agent_grants` (tenant_id, agent_id, system, level none/read/write/approval)
- Every business table carries `tenant_id`; Postgres Row Level Security policy `tenant_isolation` on all of them (migration 002).
- Credential boundary: n8n credentials named `<tenant> — <tool>`; never reused across tenants. Vault boundary: `80_Clients/<tenant>/`.

## Rules
1. Provisioning creates: tenant row, `80_Clients/<slug>/` from the template, default roles (owner, staff, viewer), default policies (approvals, retention), staging + production environments, an empty audit trail.
2. Least privilege by default: a new user or agent gets **none** until the [[40_Registries/Agent_Permission_Matrix]] says otherwise.
3. Joiner / mover / leaver: every change is an approval + audit row; leaver = all access revoked the same day, verified by [[10_Agents/11_HR_Workforce]] for client staff.
4. OAuth / SSO where the client's tools offer it; FusionTech never holds client passwords.
5. No cross-tenant read ever, not even for FusionTech dashboards (aggregate through the [[10_Agents/14_Data_BI_KPI]] with tenant filters).

## Interfaces (what an agent calls → what it gets back)
- `provision_tenant(slug, owner, modules)` → tenant record + folder + environments
- `who_am_i(actor)` → tenant_id, role, grants · `can(actor, action, system)` → allow / deny / needs_approval (via [[30_Platform_Services/Policy_Service]])
- `add_user / change_role / revoke(actor)` → approval request + audit row

## Where it runs today → target
- **Today:** tenant_id on every n8n Data Table row (`fusiontech` only); credentials in n8n; no users/roles tables yet
- **Target:** Supabase project with migration 002 (tenants, users, roles, RLS); provisioning workflow in n8n; per-tenant n8n credentials

## Owner agent
[[10_Agents/15_Security_Governance_QA]]

## Tests
Provision a staging tenant for the pilot client; prove a query as tenant A returns zero rows of tenant B; revoke a user and verify access is gone within the hour.

## Status
`designed` — see [[00_CEO_Brain/02_Build_Backlog]].
