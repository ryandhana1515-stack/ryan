# Fusion EDG Core

The reusable, multi-tenant CRM + EDG engine that **ATLAS** (`.claude/agents/atlas.md`, BUILD ENGINE v2) builds each
client's system on. Every client project uses the core, with its own organisation, adapters and workflows.

**Status: DEVELOPMENT only.** Local PostgreSQL, MOCK providers, FAKE data. Nothing is deployed to staging or production,
and no real customer data is used, until Ryan approves (L3/L4).

## What is in it

| Package | What it does |
|---|---|
| `packages/core` | Tool registry (23 runtime tools), capability detection, the **one** `executeTool()` safety pipeline (validate → capability → permission → approval/QA gate → idempotency → dry-run → execute with retries → validate output → audit → event), approval engine, vendor-neutral adapter interfaces + MOCK adapters |
| `packages/db` | Versioned SQL migrations (checksummed), multi-tenant schema with **forced Row Level Security**, append-only audit log, outbox, FAKE seed, backup/restore |
| `packages/events` | Transactional outbox dispatcher: retries with backoff, dead-letter → manual queue + alert, idempotent consumers |
| `packages/crm` | The first vertical slice: lead intake (form/WhatsApp/email), dedupe, round-robin assignment, next action, acknowledgement, follow-ups, opt-out, KPI engine, CEO Daily Brief |
| `apps/api` | Development HTTP API + test form (`/test-form`) |
| `workflows/` | 8 n8n templates (SDK source + compiled JSON), created **inactive** in Ryan's n8n TEST folder |
| `docs/` | Plan, ADRs, architecture, env var names, runbook, cost, test report, demo script |

## Run it (development)

```bash
pnpm install
pnpm db:local        # creates local dev + test databases with random passwords → .env.local (git-ignored)
pnpm test            # 51 tests (unit + database + end-to-end slice)
pnpm demo            # scripted client demo, printed step by step
pnpm db:reset && pnpm dev   # API on http://localhost:8787, test form at /test-form
node scripts/test-report.mjs   # regenerates docs/test-report.md with evidence
```

Needs Node ≥ 22.12, pnpm, and PostgreSQL 16 (local, or Docker).

## Rules this code enforces
- Nothing runs a tool except `executeTool()`; the raw executor is not exported.
- A MOCK adapter can never count as AVAILABLE in production.
- L4 needs Ryan's approval **and** a passing QA gate; L5 always needs a named human approver, bound to the exact input, and used once.
- Every tenant table has `organization_id` + forced RLS; the cross-tenant test is critical and passes.
- WON/LOST can only be set by a human user (database trigger).
- Every active lead has an owner, status, last interaction, next action and next action date (database constraint).
- An inbound message is stored before anything else; failures go to the manual queue, never lost.
- KPI numbers come only from SQL; the LLM's narration is rejected if it contains any number not in the computed data.
- No secrets in git: `.env.example` lists names only.
