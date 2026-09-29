# ADR-0004 · n8n is the trigger/schedule layer; business logic stays in the EDG API

- **Date:** 2026-09-30
- **Status:** accepted

**Decision.**
- n8n workflows only receive or schedule, then call the EDG API with `X-EDG-Key`.
- Dedupe, assignment, permissions, idempotency, audit and events live in tested code.
- Templates are generated from `workflows/generate.mjs`: never hand-edited in n8n (FusionTech rule).
- Templates are compiled to JSON with the official `@n8n/workflow-sdk`.
- Templates are created **inactive**; activation per client is an approved step.

**Why.**
- Code that decides who owns a lead, or whether a customer opted out, must be versioned, tested and multi-tenant.
- n8n's strengths are triggers, schedules and connectors.

**Production note (cost/limits).**
- An every-minute n8n schedule is about 43,200 executions a month, while n8n Cloud Starter includes 2,500 executions a
  month (n8n support page, 2026-09-30).
- So in production, run the outbox dispatcher and follow-up job from the API's own scheduler (for example Vercel Cron,
  or `pg_cron` in Supabase; check the plan limits). Keep n8n for intake webhooks, IMAP and the daily brief.
- The `edg-outbox-dispatcher` template is for development/test.
