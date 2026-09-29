# ADR-0006 · KPI numbers from SQL only; the LLM narrates

- **Date:** 2026-09-30
- **Status:** accepted

**Decision.**
- **KPIs.** Each KPI has a definition (name, meaning, formula, source, window, owner, refresh, drill-down) in
  `packages/crm/src/kpi.ts`, backed by `security_invoker` views, so the caller's RLS applies.
- **Unavailable sources.** A source that is down or not connected gives `status: unavailable`, and the brief prints
  "data unavailable". Accounting is unavailable until an accounting adapter is actually connected.
- **Brief generation.** The CEO brief is built deterministically from the computed JSON. The LLM may re-word it.
- **Number guard.** It rejects any narration containing a number that is not in the computed facts; the deterministic
  brief is then used.
- **Logging.** Tokens and model tier are logged in `agent_actions` (B14 cost tracking).
