# EDG Core — test report

- **Run:** 2026-09-29T18:44:28.931Z · environment: DEVELOPMENT/TEST (local PostgreSQL, MOCK adapters, FAKE data)
- **Command:** `npx vitest run` (+ `npx tsc -p tsconfig.json --noEmit`)
- **Tooling:** v22.22.2 · psql (PostgreSQL) 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1) · vitest 5.0.2
- **Result:** 51 PASS · 0 FAIL · 0 BLOCKED · 0 WARNING · typecheck PASS · exit code 0
- **Critical tests** (cross-tenant): PASS, PASS

BLOCKED would mean the database was not available (tests skip with a BLOCKED notice rather than pretend).
Regenerate: `node scripts/test-report.mjs`.

| # | Result | Test | File | ms |
|---|---|---|---|---|
| 1 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › NEW LEAD: website form → contact (+65 normalised, email lower-case) → lead with owner, next action + date → follow-up → events + audit → ack draft | `apps/api/test/slice.test.ts` | 96 |
| 2 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › round-robin: the next new lead goes to the other salesperson | `apps/api/test/slice.test.ts` | 38 |
| 3 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › DUPLICATE LEAD: same phone via WhatsApp (+65 9000 0123 vs "9000 0123") lands on the same contact and open lead, no new owner, no second auto-reply | `apps/api/test/slice.test.ts` | 25 |
| 4 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › DUPLICATE WEBHOOK: the same WhatsApp message id delivered twice is processed once | `apps/api/test/slice.test.ts` | 51 |
| 5 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › MESSAGING OUTAGE: the enquiry and lead are kept, the failed acknowledgement goes to the manual queue with an alert | `apps/api/test/slice.test.ts` | 1544 |
| 6 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › PERMISSION DENIED: viewer and sales cannot re-assign a lead; a manager can | `apps/api/test/slice.test.ts` | 50 |
| 7 | PASS (critical) | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › CROSS-TENANT BLOCKED: Acme cannot touch Beta's lead, Beta's user cannot act in Acme, KPIs never count Beta | `apps/api/test/slice.test.ts` | 27 |
| 8 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › OPT-OUT RESPECTED: STOP cancels follow-ups; later enquiries get no automatic message and no follow-up task | `apps/api/test/slice.test.ts` | 71 |
| 9 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › FOLLOW-UP: due follow-ups remind the owner once; opted-out contacts are skipped | `apps/api/test/slice.test.ts` | 19 |
| 10 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › EVENTS: the outbox dispatcher delivers owner notifications once | `apps/api/test/slice.test.ts` | 235 |
| 11 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › CEO BRIEF: KPIs by query, narrated from JSON only; accounting not connected → "data unavailable" | `apps/api/test/slice.test.ts` | 48 |
| 12 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › CEO BRIEF: when the CRM source is down the brief says "data unavailable" instead of numbers | `apps/api/test/slice.test.ts` | 10 |
| 13 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › CEO BRIEF: an LLM that invents a number is rejected and the computed brief is used | `apps/api/test/slice.test.ts` | 13 |
| 14 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › WhatsApp direct webhook: verification challenge, and unsigned/badly-signed payloads are refused | `apps/api/test/slice.test.ts` | 30 |
| 15 | PASS | Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters) › public form: honeypot is silently ignored, keyed endpoints need the key, bad input is a 400 | `apps/api/test/slice.test.ts` | 8 |
| 16 | PASS | B1 tool registry › has the standard catalogue with complete safety metadata | `packages/core/test/pipeline.test.ts` | 5 |
| 17 | PASS | B1 tool registry › exposes no way to run a tool outside executeTool() | `packages/core/test/pipeline.test.ts` | 0 |
| 18 | PASS | B1 tool registry › refuses an L5 tool that does not require approval | `packages/core/test/pipeline.test.ts` | 1 |
| 19 | PASS | B4 capability detection › returns CONNECTION_REQUIRED with the human step when nothing is connected | `packages/core/test/pipeline.test.ts` | 1 |
| 20 | PASS | B4 capability detection › returns AUTHORIZATION_REQUIRED, PERMISSION_DENIED, HUMAN_ACTION_REQUIRED, NOT_SUPPORTED as appropriate | `packages/core/test/pipeline.test.ts` | 0 |
| 21 | PASS | B4 capability detection › never lets a MOCK adapter count as AVAILABLE in production | `packages/core/test/pipeline.test.ts` | 0 |
| 22 | PASS | B1 executeTool pipeline › blocks when the provider is not connected, and audits the block | `packages/core/test/pipeline.test.ts` | 3 |
| 23 | PASS | B1 executeTool pipeline › blocks invalid input before anything else | `packages/core/test/pipeline.test.ts` | 1 |
| 24 | PASS | B1 executeTool pipeline › succeeds, writes audit, emits an event | `packages/core/test/pipeline.test.ts` | 3 |
| 25 | PASS | B1 executeTool pipeline › ignores a duplicate call with the same idempotency key | `packages/core/test/pipeline.test.ts` | 1 |
| 26 | PASS | B1 executeTool pipeline › retries with backoff, then records the failure in the audit log | `packages/core/test/pipeline.test.ts` | 1 |
| 27 | PASS | B1 executeTool pipeline › recovers when a retry succeeds | `packages/core/test/pipeline.test.ts` | 1 |
| 28 | PASS | B1 executeTool pipeline › denies a role that may not use the tool | `packages/core/test/pipeline.test.ts` | 1 |
| 29 | PASS | B1 executeTool pipeline › supports dry runs without side effects | `packages/core/test/pipeline.test.ts` | 1 |
| 30 | PASS | B5/B15 approval gate › L5 is never autonomous: the first call only creates a pending approval | `packages/core/test/pipeline.test.ts` | 2 |
| 31 | PASS | B5/B15 approval gate › blocks without approval, runs once after a named approver approves, and the approval cannot be reused | `packages/core/test/pipeline.test.ts` | 3 |
| 32 | PASS | B5/B15 approval gate › L4 production deploy needs a passing QA gate before it can even request approval | `packages/core/test/pipeline.test.ts` | 1 |
| 33 | PASS | B5/B15 approval gate › per-client thresholds can require approval for otherwise-L2 actions | `packages/core/test/pipeline.test.ts` | 1 |
| 34 | PASS | secrets never reach the audit log › redacts secret-looking keys | `packages/core/test/pipeline.test.ts` | 0 |
| 35 | PASS | B2 multi-tenant database (Row Level Security) › applies every migration and records the schema version | `packages/db/test/tenancy.test.ts` | 6 |
| 36 | PASS | B2 multi-tenant database (Row Level Security) › forces RLS on every tenant table | `packages/db/test/tenancy.test.ts` | 10 |
| 37 | PASS | B2 multi-tenant database (Row Level Security) › the app role cannot bypass RLS | `packages/db/test/tenancy.test.ts` | 11 |
| 38 | PASS | B2 multi-tenant database (Row Level Security) › no tenant context = no rows | `packages/db/test/tenancy.test.ts` | 4 |
| 39 | PASS | B2 multi-tenant database (Row Level Security) › CRUD per role: sales creates and updates in its own org; viewer reads but cannot write; only admins delete | `packages/db/test/tenancy.test.ts` | 21 |
| 40 | PASS (critical) | B2 multi-tenant database (Row Level Security) › CRITICAL: cross-tenant read/write/delete attempts fail | `packages/db/test/tenancy.test.ts` | 23 |
| 41 | PASS | B2 multi-tenant database (Row Level Security) › every active lead must have owner, last interaction, next action and date | `packages/db/test/tenancy.test.ts` | 2 |
| 42 | PASS | B2 multi-tenant database (Row Level Security) › WON/LOST is a human decision: an agent cannot close a deal | `packages/db/test/tenancy.test.ts` | 15 |
| 43 | PASS | B2 multi-tenant database (Row Level Security) › audit_logs is append-only for everyone, including the owner role and the database owner | `packages/db/test/tenancy.test.ts` | 24 |
| 44 | PASS | B2 multi-tenant database (Row Level Security) › knowledge: non-managers only see approved items for their role | `packages/db/test/tenancy.test.ts` | 7 |
| 45 | PASS | B2 multi-tenant database (Row Level Security) › backup + restore works (tried once locally) | `packages/db/test/tenancy.test.ts` | 758 |
| 46 | PASS | B3 transactional outbox + dispatcher › an event is only published if the business transaction commits | `packages/events/test/dispatcher.test.ts` | 24 |
| 47 | PASS | B3 transactional outbox + dispatcher › delivers once per consumer, even when the event is redelivered | `packages/events/test/dispatcher.test.ts` | 27 |
| 48 | PASS | B3 transactional outbox + dispatcher › retries with backoff, then dead-letters to the manual queue and alerts | `packages/events/test/dispatcher.test.ts` | 30 |
| 49 | PASS | B3 transactional outbox + dispatcher › a failed consumer does not re-run consumers that already succeeded | `packages/events/test/dispatcher.test.ts` | 20 |
| 50 | PASS | B3 transactional outbox + dispatcher › a crashed worker's claim expires and the event is picked up again | `packages/events/test/dispatcher.test.ts` | 11 |
| 51 | PASS | B3 backoff › doubles per attempt and caps | `packages/events/test/unit.test.ts` | 2 |
