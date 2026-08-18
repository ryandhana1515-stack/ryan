# 8. Security & Compliance

Autonomous agents touching money, customer data, and outbound communication
make security a first-class feature, not an afterthought. These controls map
directly to the requirements: RBAC, backups, logging, audit trails, secure
APIs, authentication, data privacy.

## 8.1 Identity & Access

| Control | Implementation |
|---|---|
| Authentication | OIDC via Keycloak/Auth0: SSO, enforced MFA for admin/finance roles, session limits |
| RBAC | Roles: `owner`, `ceo`, `manager`, `sales`, `support`, `finance`, `hr`, `marketing`, `readonly`. Permissions checked at the API layer, per endpoint + per record scope |
| Tenant isolation | PostgreSQL Row-Level Security keyed on `tenant_id` from the JWT — enforced in the database, so a code bug cannot leak cross-tenant data |
| Agent identity | Every agent has its own service identity and scoped permissions (Sales AI cannot read payroll; HR AI cannot send invoices). Agents are subject to RBAC exactly like humans |
| API access | Scoped API keys per integration, hashed at rest, expiring, rate-limited; webhooks verified by HMAC signatures |

## 8.2 Data Protection & Privacy

- **Encryption:** TLS everywhere in transit; AES-256 at rest (DB volumes,
  object storage, backups). Integration credentials encrypted with
  per-tenant keys (envelope encryption via KMS).
- **PII handling:** PII fields tagged in the schema; automatic redaction in
  logs and LLM traces; configurable retention per data class (e.g. call
  recordings 90 days, invoices 7 years).
- **LLM data policy:** business data goes to model providers with
  no-training/zero-retention API terms; document this in the tenant DPA.
  Option for sensitive tenants: route classification tasks to self-hosted
  open-weight models.
- **Consent & messaging compliance:** consent flags on contacts; quiet
  hours, opt-out honoring, and attempt caps enforced *in the workflow
  engine* (deterministically), not by the LLM. Voice calls announce
  recording where law requires; comply with WhatsApp Business and local
  telemarketing rules (e.g. PDPA/GDPR depending on market).
- **Right to erasure:** one procedure deletes/anonymizes a contact across
  CRM, conversations, recordings, embeddings, and backups index.

## 8.3 Audit & Logging

- `audit_log` records every state change with actor (human/agent/system),
  before/after, IP, and correlation id — immutable (append-only, WORM
  backup copy).
- Every agent run is fully traceable: prompt version, context docs, tool
  calls, tokens, cost, output, human edits (Langfuse + `agent_runs`).
- Security events (failed logins, permission denials, key usage anomalies)
  alert to the admin channel.

## 8.4 Agent-Specific Safeguards

1. **Hard-coded never-auto list:** payments out, payroll changes, deleting
   records, changing permissions, sending to >200 recipients — always
   require a human click regardless of autonomy setting.
2. **Spend & rate limits per agent per day** (messages sent, calls dialed,
   AI budget) — a runaway loop hits a wall, not your customer list.
3. **Prompt-injection defense:** external content (emails, comments, uploaded
   docs) is wrapped and labeled untrusted; agents may summarize it but
   instructions inside it are never executed; tool allowlists per agent cap
   the blast radius.
4. **Kill switch** per agent and global, on the CEO dashboard.

## 8.5 Availability & Backups

| Item | Policy |
|---|---|
| Database | Continuous WAL archiving + nightly full backup; PITR; restore drill quarterly |
| Object storage | Versioned buckets, cross-region replication for recordings/documents |
| Config/prompts | In git — the entire agent layer is reproducible from the repo |
| RTO / RPO targets | RTO 4h, RPO 15min for Phase 4 SaaS |
| Monitoring | Uptime, queue depth, webhook failures, LLM error rates, cost anomalies → on-call alerts |

## 8.6 SDLC Security

- Secrets in a vault (never in code); dependency scanning + Dependabot;
  branch protection + reviews; staging environment with synthetic tenant
  data; annual pen-test before selling to external SMEs; incident response
  runbook (who flips the kill switch, who notifies tenants).
