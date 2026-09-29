# Milestone B0 — plan

Written with the build (Ryan: "Build all now", 2026-09-30). Decisions are recorded as ADRs in `docs/adr/`.

## Repo structure
```
fusion-edg-core/
  packages/core     tool registry · capability · executeTool pipeline · approvals · stores · adapters (+ MOCK)
  packages/db       migrations/*.sql · migrate (checksums) · seed (FAKE) · Pg stores · backup/restore
  packages/events   outbox dispatcher (retry, backoff, dead-letter, alert hook)
  packages/crm      lead intake · dedupe · assignment · follow-ups · KPI engine · CEO brief · WhatsApp helpers
  apps/api          development HTTP API + test form
  workflows/        n8n templates: generate.mjs → sdk/*.sdk.js → export-json.mjs → n8n/*.json
  scripts/          dev-db.sh · demo.ts · test-report.mjs
  docs/             plan · adr · architecture · env-vars · runbook · cost · test-report · demo-script
```

## Location
- **Plan:** a private repo `ryandhana1515-stack/fusion-edg-core`.
- **Now:** the GitHub connector cannot create repositories (403, "Resource not accessible by integration"), so the code
  lives in `fusion-edg-core/` inside the `ryan` repo, **outside the vault**. The vault holds documentation and links only.
- **Next:** when Ryan creates the private repo, move the folder with its history (`git subtree split`).

## Modules (core only; client modules are added per BUILD_PLAN)
CRM (contacts, companies, leads, deals, pipelines, activities, tasks, conversations), platform (events/outbox, manual queue,
idempotency, approvals, audit, workflow runs, agent actions, knowledge, integration connections), KPI views.
Not built into the core: quotations, invoices, orders, payments, products, inventory, tickets, documents, campaigns.
Those arrive per client, with migrations, when the BUILD_PLAN selects them (B7: "don't install modules unnecessarily").

## ADRs
- [ADR-0001](adr/0001-stack.md) Stack: TypeScript, pnpm, PostgreSQL/Supabase, Zod, Vitest
- [ADR-0002](adr/0002-tenancy-rls.md) Tenancy: organization_id + forced RLS + server-side authorisation
- [ADR-0003](adr/0003-one-tool-pipeline.md) One tool pipeline, adapters, capability data
- [ADR-0004](adr/0004-n8n-thin-trigger-layer.md) n8n is the trigger/schedule layer; logic stays in the EDG API
- [ADR-0005](adr/0005-outbox-events.md) Transactional outbox with idempotent consumers
- [ADR-0006](adr/0006-kpi-numbers-from-sql.md) KPI numbers from SQL only; LLM narration with a number guard

Cost: [cost.md](cost.md).
