# 10. Deployment, Testing, Training & Operations

## 10.1 Environments

| Env | Purpose | Data |
|---|---|---|
| `dev` | feature work | synthetic seed data |
| `staging` | integration + agent evals | anonymized copies + sandbox vendor accounts (Twilio test, Stripe test, WhatsApp sandbox) |
| `prod` | live tenants | real data, restricted access |

## 10.2 Installation / Deployment Guide (shape)

Phase 1–3 (single VPS or small cloud footprint):

```
# 1. Provision: Ubuntu host (8 vCPU / 16GB), managed Postgres 16 (+pgvector),
#    Redis, S3-compatible bucket, domain + TLS
# 2. Clone infra repo; configure .env from vault (DB, Redis, S3, LLM keys,
#    WhatsApp, Twilio/Retell, Stripe, OAuth apps)
docker compose up -d        # api, workers, n8n, keycloak, langfuse, grafana
pnpm db:migrate && pnpm db:seed:demo
# 3. Frontend deploys to Vercel (or same host) pointing at the API
# 4. Connect integrations per tenant via the admin panel OAuth flows
# 5. Import knowledge: upload SOPs/products/FAQs → auto-chunk + embed
# 6. Run smoke suite: pnpm test:smoke (creates a lead, watches it flow)
```

Phase 4 (SaaS): same containers on Kubernetes with per-service scaling,
managed Postgres with read replicas, multi-region object storage.

## 10.3 Testing Strategy

| Layer | What | How |
|---|---|---|
| Unit | services, scoring, guardrails, adapters | CI on every PR |
| Integration | API + DB + queue, webhook handling, idempotency | CI with test containers |
| Workflow | every workflow in [doc 6](06-workflows.md) replayed against staged events | n8n test executions + assertions on resulting DB state |
| **Agent evals** | golden sets per agent: 50–200 real (anonymized) conversations/tasks with expected outcomes; scored on correctness, groundedness (KB citations), tone, guardrail compliance | run on every prompt/model change; block deploy on regression |
| Voice | scripted test calls against the voice agent (happy path, voicemail, angry caller, wrong number) | before every voice script change |
| Load | webhook bursts, broadcast sends, month-end jobs | before Phase 4 |
| Security | dependency scans continuous; pen-test before external tenants | Phase 4 gate |
| UAT | 2-week live pilot checklist per phase (the "exit criteria" in the roadmap) | with the real business |

## 10.4 Monitoring & Operations

- **Golden signals:** API latency/errors, queue depth, webhook failure rate,
  workflow success rate, LLM error/latency/cost per agent, per-tenant AI
  spend vs budget.
- **Agent quality watch:** approval-queue edit rate (how often humans change
  AI output), handoff rate, CSAT on AI conversations — trending on an
  internal ops dashboard. Rising edit rate = prompt regression signal.
- **Runbooks:** vendor outage, runaway agent (kill switch → replay queue),
  webhook flood, restore-from-backup, tenant offboarding/export.

## 10.5 Training Plan (humans)

| Audience | Format | Content |
|---|---|---|
| CEO | 2 sessions + cheat sheet | dashboard reading, approval queue, autonomy dials, kill switch, weekly review ritual |
| Sales/Support staff | half-day + videos | working WITH the AI: handoffs, editing drafts, feeding the knowledge base, when to take over |
| Ops/admin | full day | tenant config, integration connections, workflow editor basics, monitoring |
| New SME tenant (Phase 4) | self-serve wizard + 5 short videos | onboarding: connect accounts, upload knowledge, approve brand kit, first campaign |

Training videos map 1:1 to the user manual chapters; SOP AI itself answers
"how do I…" questions about the platform using this documentation.

## 10.6 Ongoing Support & Improvement Loop (post-launch)

Weekly: review approval-queue edits → prompt tweaks; check cost per
conversation; triage agent errors.
Monthly: eval-set refresh with new real cases; autonomy-level reviews
(graduate agents that earn it); vendor/model price-performance review.
Quarterly: restore drill, security review, roadmap grooming (new industry
packs, new channels).

Support tiers to offer SME customers later: self-serve (docs + SOP AI),
standard (email, 1-business-day), premium (dedicated success manager +
custom workflows) — priced accordingly.
