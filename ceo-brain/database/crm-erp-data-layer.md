# CRM + ERP data layer — how the CEO Brain stores a client's company

For Ryan (plain words) and for the next engineer (exact names). The schema is
`migrations/0001_init.sql` + `migrations/002_crm_erp_core.sql`. Apply both, in order, on
PostgreSQL 15+ / Supabase. 002 is safe to run twice.

## 1. The one-sentence idea

Every client company gets the **same** set of tables, switched on module by module, and a
wall between companies that the database itself enforces. The AI agents read and write
these tables; humans approve anything risky; every change is logged.

## 2. What is in it (39 tables)

**Tenant (who owns the data)**
- `companies` — one row per client of the platform ("the tenant"). `slug` is the same value
  as `tenant_id` in the n8n Data Tables. Status, plan label, onboarding stage.
- `company_members` — which platform users belong to which tenant, with a role.

**CRM (selling and talking to customers)**
- `organizations` — the businesses a client deals with (prospects, customers, partners,
  suppliers). Not to be confused with `companies`, which is the client itself.
- `contacts` — people, with WhatsApp / email opt-in, preferred channel, tags.
- `leads` — an inbound interest and its qualification state (same columns as `ceo_leads`).
- `pipelines` + `pipeline_stages` — named funnels (Sales, Onboarding, Support) with ordered
  stages and win probability. A default 8-stage Sales pipeline is seeded.
- `opportunities` — a qualified chance with an amount and a stage.
- `deals` — what was actually agreed (value, third-party costs kept separate, contract ref).
- `quotations` + `quotation_items` — quotes. Agents may draft; a human must approve before
  `sent`. Lines can be flagged `is_third_party_cost`.
- `conversations` + `messages` — one thread per channel per contact; every inbound message
  and every AI draft / sent reply (same columns as `ceo_messages`).
- `appointments` — meetings and site visits, mirrored to the connected calendar.
- `tasks` — follow-ups for humans or agents (same columns as `ceo_tasks`).
- `activities` — the timeline you see on a contact: calls, notes, meetings, status changes.
- `projects` — delivery work (website build, automation rollout) with dates and progress.
- `documents` — pointers to files (contracts, SOPs, quotes). The file bytes stay where they
  are (Google Drive, Supabase Storage…); we store the reference plus how we treat the file.

**ERP / operations (running the business) — each one optional per tenant**
- `orders` + `order_items` — customer sales orders.
- `suppliers`, `purchase_orders` + `purchase_order_items` — buying from vendors.
- `inventory_items` + `stock_movements` — products/materials and the ledger of every stock
  change; `quantity_on_hand` is the running sum.
- `service_jobs` — service delivery: schedule, assigned employee, checklist, sign-off.
- `invoices` + `invoice_items`, `payments` — **status records only**. The platform never
  collects, sends or refunds money; the accounting / payment system does. A refund
  (`payments.direction = 'outbound'`) cannot even be inserted without an approval.
- `employees` + `roles` — the client's people (and AI agents, as `employment_type = 'agent'`),
  what each role may do and which approval categories it may decide. No payroll data.

**Platform (how the brain is wired for this tenant)**
- `tenant_modules` — which modules are switched on.
- `integrations` — every external system, how we treat it, its owner and auth type.
- `data_sources` — the data-discovery checklist from onboarding.
- `company_maps` — versioned JSON snapshot of the Client Digital Company Map.
- `approvals` — the human-approval ladder (section 6).
- `workflow_runs`, `agent_runs`, `audit_logs` — what ran, what the AI did, what changed
  (same columns as `ceo_agent_runs` and `ceo_audit_logs`).

## 3. Tenant isolation — "Company A never sees Company B"

- Every table has `tenant_id` (uuid → `companies.id`) **NOT NULL**, `created_at`,
  `updated_at`, an index on `tenant_id` and a Row Level Security policy called
  `tenant_isolation`.
- The policy is one rule: a row is visible, insertable or updatable only if its `tenant_id`
  is the tenant of the current connection. That tenant is set per request / transaction:
  `select set_config('app.tenant_id', '<company uuid>', true);`
  On Supabase a logged-in user also sees the tenants listed for them in `company_members`.
- No tenant set = nothing visible. Wrong tenant on an insert = rejected by the database, not
  by application code. This was tested: acting as Acme, only Acme rows are returned and an
  insert with another tenant's id fails.
- n8n connects with the service role (bypasses RLS) and therefore **must set `tenant_id`
  on every write** — the workflows already thread `tenant_id` through every node.
- The 0001 tables (`contacts`, `leads`, `conversations`, `messages`, `opportunities`,
  `tasks`, `workflow_runs`, `agent_runs`, `audit_logs`) keep their older `company_id`
  column; a trigger keeps `company_id` and `tenant_id` identical, so the live Phase-1
  workflow keeps working unchanged. New code uses `tenant_id`.

## 4. Connect vs copy — how we treat each client system

Recorded per system in `integrations.mode` (and proposed per checklist item in
`data_sources.proposed_mode`). Five modes, nothing else:

| Mode | Meaning | Typical examples |
|---|---|---|
| `CONNECTED_LIVE` | Read/write through the vendor API in real time; the vendor stays the source of truth | CRM (HubSpot), calendar (Google), accounting (Xero / QuickBooks), WhatsApp Business |
| `IMPORTED` | Copied once (or on a schedule) into our tables | Spreadsheets of customers, price lists, old order history (CSV export) |
| `INDEXED` | Left where it is, but made searchable so agents can quote from it | SOPs, product manuals, past proposals in Drive |
| `SUMMARIZED` | Only a written summary is kept; the original is not searchable | Long procedures, policies, meeting recordings |
| `LEFT_IN_PLACE` | Noted in the Company Map, not touched | Payroll, legal archive, anything the owner does not want moved |

Rule of thumb: systems of record that change daily are connected live; static lists are
imported; reference documents are indexed; long prose is summarised; sensitive or
out-of-scope systems are left in place and only mapped.

## 5. Modules — a client takes only what it needs

`tenant_modules.module_key` (on/off per tenant): `crm`, `sales_pipeline`, `whatsapp`,
`email`, `website`, `appointments`, `quotations`, `projects`, `orders`, `suppliers`,
`purchasing`, `inventory`, `service_delivery`, `invoicing`, `payments`, `hr`, `approvals`,
`documents`, `accounting_integration`, `calendar_integration`, `reporting`.

Example: a small clinic that wants "WhatsApp + sales + CRM + accounting" gets
`whatsapp`, `sales_pipeline`, `crm`, `appointments`, `approvals`, `accounting_integration`
and nothing else. The tables for orders, inventory, purchasing still exist (empty) but the
agents and the dashboard hide them. Switching a module on later is one row, no migration.

## 6. The human-approval ladder

AI recommendation → human approval → execution → audit. Implemented in `approvals`:

1. **Recommend** — an agent inserts a row: what it wants to do (`entity_type`, `entity_id`,
   `action`), the risk category, its recommendation and reasoning, status `PENDING`.
2. **Approve** — a human (`approved_by`, `decided_at`) sets `APPROVED` or `REJECTED`. The
   database refuses `APPROVED` without an approver. `roles.can_approve` says which roles
   may decide which categories.
3. **Execute** — the workflow performs the action only after `APPROVED`, then sets
   `EXECUTED` (or `FAILED`) with the result.
4. **Audit** — the resulting `audit_logs` row is linked back (`audit_log_id`).

Always requires approval (the `risk_category` values): **money** (invoices, payments,
purchase orders), **refund**, **contract** (deals), **pricing** (quotations), **delete**,
**permission** (roles, memberships, integrations), **production_deploy** (websites, workflow
publishes), plus outbound **communication** where the tenant wants it. `requires_approval =
false` is allowed only where a tenant policy explicitly pre-approves a low-risk action; the
row is still written so the trail is complete. WON / LOST, prices, guarantees, delivery
dates, contracts and refunds are always human decisions.

## 7. How the interim n8n Data Tables map onto it

| n8n Data Table (live today) | Postgres table | Notes |
|---|---|---|
| `ceo_leads` | `leads` (+ `contacts`, `organizations`) | `tenant_id` slug → `companies.id`; `lead_key` is the dedupe key in both |
| `ceo_messages` | `messages` (+ `conversations`) | `direction` / `status` values identical |
| `ceo_agent_runs` | `agent_runs` | same columns; `workflow_run_id` optional |
| `ceo_tasks` | `tasks` (+ `approvals` when `requires_approval`) | approval rows give the ladder in section 6 |
| `ceo_audit_logs` | `audit_logs` | insert-only by convention |

Cut-over is mechanical: swap each Data Table node for a Postgres node with the same column
names, add a lookup of `companies.id` by slug at the top of each workflow, backfill by CSV
export (see `README.md`).

## 8. Security rules (non-negotiable)

- **OAuth first.** Connect live systems with OAuth (the client authorises in their own
  account, can revoke any time). API keys only where the vendor offers nothing else.
- **Least privilege.** Request the narrowest scopes (`integrations.scopes`) and the
  narrowest database role. Read-only until write is actually needed.
- **Secrets live only in the secret store** (today: n8n credentials). The database holds
  `integrations.secret_ref`, a *name* of the credential — never the value. Check
  constraints reject values that look like tokens and JSON that contains keys such as
  `api_key`, `token`, `password`. Nothing secret goes into logs, the vault or chat.
- **Every write is attributable**: `actor` / `requested_by` / `recorded_by` is
  `agent:<id>`, `user:<uuid>` or `system`; `audit_logs` keeps old and new values.
- **Sensitive data is labelled** (`sensitivity` on `documents` and `data_sources`:
  public / internal / confidential / restricted / pii) so agents can refuse to move it.
- **No money movement, no deletes without approval, no production deploy without
  approval** — enforced by the ladder above.

## 9. For the engineer: conventions

- ids are `uuid` (`gen_random_uuid()`); `audit_logs.id` is `bigserial`.
- Amounts are `numeric(14,2)` with a `currency` column (default `SGD`); line totals are
  generated columns. Quantities are `numeric(12,3)`.
- Enum-like columns are `text` + `check (...)` so a value can be added by migration;
  the fixed vocabularies (`integration_mode`, `data_availability`, `approval_status`,
  `risk_category`) are Postgres enums.
- `updated_at` is bumped by trigger on every table. `company_maps` allows exactly one
  `status = 'current'` version per tenant.
- Helper functions: `current_tenant_id()`, `tenant_visible(uuid)`, `sync_tenant_company()`,
  `jsonb_has_no_secrets(jsonb)`.
- Next migrations: number them `003_…`, keep the same six rules per table (tenant_id,
  timestamps, index, comment, updated_at trigger, `tenant_isolation` policy) — the trigger
  and policy loops at the end of 002 can be copied as-is.
