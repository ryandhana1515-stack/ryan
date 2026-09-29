# Architecture

## The first vertical slice
```mermaid
flowchart LR
  F[Website form<br/>/test-form] -->|POST /api/o/:org/leads<br/>honeypot + rate limit| API
  W[WhatsApp Cloud API] -->|signed webhook<br/>X-Hub-Signature-256| API
  N[n8n templates<br/>intake / IMAP / schedules] -->|X-EDG-Key| API
  subgraph API[EDG API]
    I[intakeLead] --> P1[(1 · store inbound<br/>message first)]
    P1 --> P2[2 · one transaction:<br/>dedupe → contact → lead or repeat<br/>→ round-robin owner → next action<br/>→ follow-up task → outbox events → audit]
    P2 --> ACK[3 · acknowledgement via<br/>executeTool: whatsapp.send / email.createDraft]
    ACK -- failure --> MQ[(manual queue + alert)]
    P2 -- failure --> MQ
  end
  P2 --> DB[(PostgreSQL · forced RLS<br/>organization_id everywhere)]
  DB --> OB[(events outbox)]
  OB --> D[Outbox dispatcher<br/>retry · backoff · dead-letter]
  D --> NOTIF[owner-notifier]
  DB --> K[KPI views<br/>security_invoker]
  K --> B[CEO Daily Brief<br/>numbers from SQL · LLM narrates · number guard]
  B -->|email.createDraft| CEO[CEO]
```

## The safety pipeline (every runtime tool)
```mermaid
flowchart LR
  A[input] --> V{Zod valid?} -->|no| X[blocked + audit]
  V --> C{capability<br/>AVAILABLE?} -->|no: status + human step| X
  C --> P{role may<br/>use tool?} -->|no| X
  P --> AP{L4/L5 or threshold?}
  AP -->|yes, no approval| PA[pending approval + event]
  AP -->|approved, same input, unexpired| I
  AP -->|no| I{idempotency<br/>key seen?} -->|yes| DUP[duplicate + audit]
  I --> DR{dry run?} -->|yes| DRY[dry_run + audit]
  DR --> E[execute · timeout · retries] -->|fails| FL[failed + audit + tool.failed]
  E --> O{output valid?} --> OK[success + audit + tool.executed]
```

## Tenancy
- **Tenant context.** The JWT claim `organization_id` (Supabase), or `set_config('app.organization_id', …, true)` in
  server transactions. Also `app_role` and `actor_type`.
- **RLS.**
  - Every table in `public` has RLS enabled and forced.
  - Policies combine "same organisation" with "role allowed for this operation".
  - `audit_logs` has no UPDATE/DELETE policy, the grants are revoked, and a trigger refuses changes even for the owner.
- **Cross-org helpers.** Exactly two narrow `SECURITY DEFINER` functions: `app.claim_events` (outbox) and
  `app.org_id_by_slug`.

## Environments (B13)
DEVELOPMENT (local, MOCK) → TEST (CI, MOCK) → STAGING (Supabase + Vercel preview, sandbox providers, FAKE data) → QA
gate → Ryan's approval → PRODUCTION → monitor.

Today, only DEVELOPMENT/TEST exist. A MOCK adapter is refused in production by `checkCapability()`.

## Build-time vs runtime tools (B3)
- **Build time:** what Claude Code / ATLAS uses to build: git, the GitHub connector, the n8n MCP, the Vercel MCP,
  Docker, local Postgres.
- **Runtime:** the `ToolRegistry` inside the delivered product (`crm.createContact`, `whatsapp.send`, …), used by the
  client's agents and workflows through `executeTool()`.
