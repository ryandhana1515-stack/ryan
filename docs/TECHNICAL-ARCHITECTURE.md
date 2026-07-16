# OmniX AI — Technical Architecture Document

**Audience:** any developer or AI coding agent continuing this codebase.
**Rule #1: this is a live, deployed product. Extend it; do not rebuild it.**

## 1. Current stack (as deployed)

| Layer | Technology | Where |
|---|---|---|
| Backend API | Python 3.11+ / FastAPI | `app/` |
| ORM / DB | SQLAlchemy 2 · SQLite (dev) / PostgreSQL (prod via `DATABASE_URL`) | `app/db.py`, `app/models.py` |
| Frontend | Server-served static HTML + vanilla JS (no build step) | `app/static/*.html` |
| AI (text) | LLM port: Anthropic → OpenRouter → deterministic mock | `app/agents/llm.py` |
| AI (media) | fal.ai adapter (image + queued video) with offline placeholder | `app/agents/media.py` |
| Retrieval | Keyword-scored RAG over tenant knowledge chunks (pgvector upgrade path isolated here) | `app/agents/rag.py` |
| Auth (Phase 1) | HTTP Basic via `ADMIN_PASSWORD` env; public paths/prefixes allowlist | `app/auth.py` |
| Events | In-process pub/sub persisted to `events` table (swap for Redis Streams/NATS later without touching subscribers) | `app/events.py` |
| Media utils | Pillow platform-size packs | `app/api/media.py` |
| Deployment | Docker (`Dockerfile`) on DigitalOcean App Platform, autodeploy from GitHub branch; seeds idempotently on boot | `DEPLOY.md` |
| Tests | pytest end-to-end smoke suite vs mock LLM (24 tests) | `tests/test_smoke.py` |

## 2. Repository map

```
app/
  main.py            # FastAPI app, routes, lifespan (init db, sync agents)
  config.py          # ALL env config (keys, models, caps, Stripe links)
  db.py, models.py   # engine + multi-tenant schema (see §4)
  auth.py            # Basic-auth middleware + PUBLIC_PATHS/PREFIXES
  events.py          # event bus  ·  audit.py: audit log writer
  seed.py            # demo tenant + knowledge + agent sync (idempotent)
  agents/
    registry.py      # agents = YAML config bundles in config/agents/
    orchestrator.py  # routing, context, guardrails, autonomy, handoffs
    manager.py       # Manager AI agentic loop + tools + delegation
    llm.py  rag.py  media.py
  api/               # routers: crm, agents_api, knowledge, dashboard,
                     # manager_api, public (signup/plans), media
  workflows/         # lead_flow (money loop) · kpi (metrics+health)
  static/            # dashboard, chat, launch, studio, welcome, how,
                     # offer, signup, agent, videos + brand/ + videos/
config/agents/*.yaml # the 18 AI employees (see AI-EMPLOYEE-BIBLE)
prompts/*.md         # versioned prompt library
docs/                # 01–18 numbered design docs + these master docs
```

## 3. AI orchestration engine

- **Agent = config, not code**: YAML (key, prompt ref, model tier, tools,
  knowledge scope, autonomy, guardrails) synced per-tenant into the
  `agents` table on startup (`registry.sync_agents_for_tenant`).
- **Run loop** (`orchestrator.run_agent`): build system prompt = shared
  core (brand kit + guardrails + RAG context + CRM timeline) + department
  prompt → LLM → log `agent_runs` (tokens, cost, latency, outcome).
- **Autonomy policy** (`_release_output`): draft → approval_queue →
  auto-send; `never_auto` guardrail forces approval for finance/HR.
- **Deterministic guardrails** (`check_guardrails`): kill switch, daily
  message cap, daily tenant AI-cost cap, escalation keywords → human
  handoff with structured packet.
- **Manager AI** (`manager.py`): agentic loop (≤6 steps) with tools:
  get_business_summary, list_agents (+7-day stats), get_agent_activity,
  list_pending_approvals, list_recent_leads, search_knowledge; then
  delegate (special-cases image/video via fal and website → public
  artifact in `/generated`) or reply. Offline mode answers status
  questions from real DB numbers.
- **Model routing**: `model_tier` frontier/small per agent; env-selected
  model IDs; cost estimated per run for metering.

## 4. Database schema (implemented — details in docs/04)

Multi-tenant: every row carries `tenant_id` (UUID string); PostgreSQL RLS
to be enabled by migration in prod. Tables: tenants, users, contacts,
leads, deals, conversations, messages, appointments, invoices, payments,
tickets, tasks, knowledge_docs, knowledge_chunks, agents, agent_runs,
approval_queue, events, audit_log, kpi_daily. Canonical event names in
docs/04 §4.3. Planned additions (Phase 2): integration_connections
(OAuth tokens, encrypted), campaigns, content_items, social_posts,
subscriptions/usage_meters.

## 5. API surface (implemented)

Public (no auth): `GET /welcome /how /offer /signup /videos /agents?a=…
/generated/* /static/brand/* /static/videos/* /health`,
`GET /api/public/plans`, `POST /api/public/signup` (honeypot-protected).
Authed: `POST /api/webhooks/lead`, `POST /api/inbound/message`,
`GET /api/leads /api/tasks /api/appointments`,
`GET/PATCH /api/agents`, `POST /api/agents/{key}/run`,
`GET /api/agent-runs`, approvals list/approve/reject,
knowledge docs CRUD + search, `GET /api/dashboard/summary`,
`POST /api/dashboard/daily-digest`, `POST /api/manager/chat`,
`POST /api/media/resize-pack`. UI routes: `/ /chat /launch /studio`.

## 6. Workflow engine

Today: `app/workflows/lead_flow.py` subscribers on the event bus
(lead.qualified→appointment→reminder; deal.won→invoice; invoice.paid→
onboarding+review). Extension pattern: add subscriber fn + register().
Phase 2: workflow templates table + a runner that executes multi-agent
sequences initiated from Manager AI commands; long jobs via a proper
queue (RQ/Celery + Redis) instead of in-process execution.

## 7. Phase 2 native integrations (the build plan)

Priority order: **WhatsApp Business Cloud API → Meta (Messenger/IG DMs,
Lead Ads, Marketing API) → TikTok (Business + Shop) → Google (GBP,
YouTube/Ads)**.
Prereqs owned by the FOUNDER (cannot be done by devs): Meta developer
app + business verification; TikTok developer app; app review for
scopes (`whatsapp_business_messaging`, `pages_messaging`,
`instagram_manage_messages`, `ads_management`, `leads_retrieval`).
Engineering per connector: OAuth connect flow → store tokens encrypted
per tenant in `integration_connections` → webhook receivers (verify
signatures, enqueue) → adapter implementing MessagingPort/AdsPort
(docs/09 §9.1) → surface in Customer Hub / Marketing Hub. Idempotency
keys on all outbound; per-tenant rate limits; consent + quiet hours
enforced deterministically (docs/08 §8.2).

## 8. Security (implemented + required)

Implemented: Basic-auth gate, tenant scoping on every query, audit log on
state changes, agent guardrails + never-auto list, honeypot on public
signup, PUBLIC allowlist, secrets only via env vars.
Phase 2 requirements: real user auth (JWT sessions; Keycloak/Auth0 per
docs/08), RLS migration in Postgres, encrypted token vault (KMS envelope)
for integrations, per-tenant API keys, rate limiting middleware, GDPR/PDPA
erasure routine (docs/08 §8.2), backups + restore drill (DO managed PG).

## 9. Deployment & ops

DigitalOcean App Platform: Dockerfile build; `PORT` honored; seed runs on
boot (idempotent); autodeploy from the GitHub branch. Env vars:
`ADMIN_PASSWORD, OPENROUTER_API_KEY (or ANTHROPIC_API_KEY), FAL_KEY,
DATABASE_URL (auto from attached dev database), STRIPE_LINK_*,
AIBOS_MODEL_*, AIBOS_MAX_*`. ⚠️ A managed database MUST be attached in
prod or data resets on redeploy. `/generated` is ephemeral on App
Platform → move media to DO Spaces/S3 when it matters (adapter point:
`config.GENERATED_DIR` writers). Monitoring to add: uptime check on
`/health`, error alerting, LLM cost dashboards (agent_runs has the data).

## 10. Engineering conventions

- Tests: extend `tests/test_smoke.py`; suite must stay green offline
  (mock LLM). Run: `python -m pytest tests/`.
- Never hardcode secrets; add config via `app/config.py` env reads.
- New agent = YAML + prompt file only; it auto-syncs to tenants on boot.
- New outward-facing capability MUST pass through autonomy policy.
- Frontend stays dependency-free static HTML/JS unless a real build need
  emerges; follow the design tokens in docs/DESIGN-SYSTEM.md.
- All numbered docs (01–18) remain source-of-truth deep dives; update
  them alongside code changes.
