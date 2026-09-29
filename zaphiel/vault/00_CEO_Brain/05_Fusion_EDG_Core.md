---
type: product
tags: [ceo-brain, atlas, edg, crm, fusion-edg-core]
status: development
updated: 2026-09-30
---
# 05 · Fusion EDG Core (built by ATLAS v2)

**What it is.** The reusable engine that turns ATLAS from "designs a CRM" into "builds a working CRM + EDG". Every client
system is built on it. Ryan: "Build all now" (2026-09-30).

- **Agent:** [[10_Agents/07_CRM_Architect|ATLAS]]. `.claude/agents/atlas.md` now has **BUILD ENGINE (v2)**, sections B1–B18
  (Ryan's text, verbatim).
- **Code:** `fusion-edg-core/` in the `ryan` repo, outside the vault. It moves to a private repo `fusion-edg-core` once
  Ryan creates it; the GitHub connector cannot create repos (403).
- **Status:** DEVELOPMENT only. Local PostgreSQL, MOCK providers, FAKE data. Nothing is in staging or production, and no
  real customer data is used.

## What was built (all tested: 51/51 pass, typecheck clean)
| Milestone | What | Proof |
|---|---|---|
| A | ATLAS upgraded in place (no second ATLAS) | diff shown; 254 lines added, 0 removed |
| B1 | Tool registry (23 tools), capability detection, the one `executeTool` safety pipeline, approvals (L4 QA gate, L5 named approver, bound to the exact input, single use), audit, idempotency, MOCK adapters | 19 tests |
| B2 | Multi-tenant database: every table has organization_id and **forced RLS**; append-only audit; WON/LOST human-only; every active lead owned with a next action; FAKE seed; backup + restore tried | 11 tests, incl. the **critical cross-tenant** test |
| B3 | Transactional outbox + dispatcher (retry, backoff, dead-letter → manual queue + alert, idempotent consumers); 8 n8n templates | 6 tests; the 8 workflows created **inactive** in n8n, folder "EDG Core — TEST templates (inactive)" |
| C | Vertical slice: website form / WhatsApp / email → dedupe (+65, lower-case) → contact + lead → round-robin owner → next action + date → acknowledgement → follow-up → events + audit → KPI views → CEO Daily Brief (numbers from SQL; the LLM only narrates; a number guard rejects invented numbers) | 15 end-to-end tests: new lead, duplicate lead, duplicate webhook, messaging outage → manual queue, wrong role denied, cross-tenant blocked, opt-out respected, "data unavailable" |

The docs are in the repo (`fusion-edg-core/docs/`): plan, 6 ADRs, architecture diagrams, env var names, runbook, cost,
test report and client demo script. `pnpm demo` runs the demo.

## What Ryan does (the system cannot do these itself)
1. **Create the private GitHub repo `fusion-edg-core`**, empty, at github.com/new. Tell Zaphiel, and it moves the code
   there with its history.
2. **Create a Supabase project for development/staging** (Pro plan, about $25/month; it includes a $10 compute credit).
   Then connect Supabase to Claude, or give a database URL through the secret manager, **never in chat**.
3. **Approve each next step:** staging deploy (L3), then production (L4, needs the QA gate), and any L5 action.
4. **Per real client:** WhatsApp Business Platform setup, CRM/accounting connections, and a signed data-ownership and
   handover agreement.

## Important finding
- An n8n job every minute is about 43,200 executions a month, while n8n Starter includes 2,500.
- So in production the event dispatcher and the follow-up runner run on the API's own scheduler (Vercel Cron / Supabase
  pg_cron), not on n8n.
- n8n stays for intake webhooks, email polling and the daily brief (ADR-0004).
