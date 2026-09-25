# CEO Brain — architecture

## The product (Ryan's directive, 2026-09-25)

FusionTech sells a **CEO Brain operating system** per customer: CEO Brain + AI workforce + CRM/ERP
company data layer + automation + custom software + high-end websites. Layers that never mix:
**live operational data** in the CRM/database, **long-term knowledge** in the Obsidian vault
(`zaphiel/vault/`), **orchestration** in n8n, **reasoning** in Claude. Customer journey: Discovery
Agent (never "send us all your data") → Client Digital Company Map (`schemas/company-map.schema.json`)
→ data onboarding plan (CONNECTED LIVE / IMPORTED / INDEXED / SUMMARIZED / LEFT IN PLACE) → CEO Brain
modules selected per customer → proposal draft (pricing human) → build pipeline (tenant → CRM →
agents → integrations → workflows → interface → tests → security → human review → UAT → production).
Data layer: `database/migrations/002_crm_erp_core.sql` (39 tables, tenant RLS) explained in
`database/crm-erp-data-layer.md`. Human approval ladder and security rules: `docs/approvals-and-guardrails.md`.
The twelve-agent roster and status live in the vault: `Knowledge/AI Workforce — roster.md`.

## Phase 1 slice (how the first workflows were built)

```
Facebook / Instagram / TikTok / Website / WhatsApp / Email
        │  (channel adapters → one JSON contract)
        ▼
  n8n: CEO Brain — Lead Intake (b7kbJpnKLN2uQxyn)     ← Phase 1 built this box
        │  validate → persist → qualify → guard → persist → notify → respond
        ▼
  AI Agent Router (Phase 2) ──► Sales Qualification Agent (Phase 1, live)
                              ► Solution Architect / Proposal / CS / Marketing … (later)
        ▼
  Data layer: n8n Data Tables now  →  Supabase/Postgres (migration ready)
        ▼
  Human approval gate (email + task with requires_approval) → WhatsApp/Email/Calendar/Proposals/Payments (Phase 2)
        ▼
  Customer project → Lovable/coding → deployment → CEO Brain reporting (Phase 3+)
```

## Design decisions

1. **Repo is the source of truth, n8n is the runtime.** Agent logic lives in plain JS modules
   (`agents/`), prompts in `prompts/`, contracts in `schemas/`. `workflows/lead-intake/build.js`
   inlines them into n8n Code nodes and emits Workflow-SDK code. Tests run the same code the
   workflow runs. Nothing is hand-built in the n8n UI.
2. **Structured output, validated in code.** The model is told the JSON schema; the result is
   parsed, coerced, and validated by our own validator inside the workflow. Invalid → deterministic
   fallback, never a crash, never a dropped lead.
3. **Deterministic baseline always runs.** The rule engine computes a result on every lead. It is
   the mock mode, the fallback, and a future comparison baseline for model quality.
4. **Guardrails are code.** Prices, discounts, guarantees, refunds, contracts, deployment dates,
   credentials in a draft reply → reply withheld + human review. WON/LOST are human-only.
   Proposals always need approval. Status transitions are checked against `schemas/lead-status.json`.
5. **Multi-tenant from day one.** Every row carries `tenant_id`; the Postgres schema has RLS.
6. **Least privilege.** The workflow holds no third-party secrets; Claude runs on n8n's managed
   Gateway credential, email on the existing Gmail OAuth credential. Phase 2 adds a shared secret
   header to the webhook.
7. **Observability per run.** `ceo_agent_runs` + `ceo_audit_logs` capture agent, model, provider,
   input ref, output, success, latency, execution id, lead id.

## Lifecycle implemented (Phase 1 objective)

NEW LEAD → n8n receives → validate/normalize → save/update lead (dedupe on email/phone) → AI
analyses → classify intent/temperature/status → determine missing information → generate reply
draft → store conversation + result → determine next action → schedule follow-up (task with
due time) → notify human when approval/escalation is required → respond with the structured result.
