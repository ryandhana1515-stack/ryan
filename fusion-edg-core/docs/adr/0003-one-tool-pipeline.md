# ADR-0003 · One tool pipeline, adapters, capability data

- **Date:** 2026-09-30
- **Status:** accepted

**Decision.**
- **One pipeline.** All runtime tools are registered in `ToolRegistry` and run only through `executeTool()`:
  validate → capability → permission → approval (+ QA gate for L4) → idempotency → dry-run → execute (timeout, retry
  with backoff) → validate output → audit → event.
- **No bypass.** The executor map is module-private: `internalExecutor` is not exported.
- **Adapters.** Providers sit behind vendor-neutral adapters (CRM, Database, Messaging, Email, Accounting, Deployment,
  Automation, Storage, LLM, Repository, Inventory, Report).
- **MOCK adapters.** Every MOCK adapter says `mode: 'MOCK'` and is refused in production.
- **Capability is data.** `integration_connections` records what an admin actually connected, per organisation and
  environment: connected, authorised, scopes, plan features, and outstanding human steps. It stores secret *names* only.
- **Status per check.** `checkCapability()` returns exactly one of the B4 statuses and the human step to fix it.

**Approvals.**
- L4/L5 tools must require approval (checked at registration).
- An approval is bound to org + tool + a hash of the exact input, expires, cannot be approved by its requester, needs a
  named approver for L4/L5, and is consumed on use.
- Per-client thresholds are functions (for example, an invoice above a set amount needs the owner).
