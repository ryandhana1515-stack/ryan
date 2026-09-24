# Data layer

Two layers exist on purpose:

| Layer | Status | Where | Use |
|---|---|---|---|
| **n8n Data Tables** (`ceo_leads`, `ceo_messages`, `ceo_agent_runs`, `ceo_tasks`, `ceo_audit_logs`) | LIVE — the Phase 1 workflow writes here today | `n8n-data-tables.json` (ids) | Zero-credential interim store. Every row carries `tenant_id`. |
| **PostgreSQL / Supabase** | DESIGNED, not connected | `migrations/0001_init.sql` | Long-term multi-tenant store with Row Level Security. Same column names as the data tables so the swap is mechanical. |

## Multi-tenancy rules

- `companies` = a client of the platform (tenant). `tenant_id` in the data tables is the company `slug`; `company_id` in Postgres is its uuid.
- Every business table has `company_id` + an RLS policy `tenant_isolation`. A logged-in user can only see rows of companies they are a member of (`company_members`).
- n8n connects with the service role (bypasses RLS) and **must set `company_id` on every write** — the workflow already threads `tenant_id` through every node.
- Never store credentials in any table. `companies.settings` holds display config only (notify email, model name).

## Switching the workflow to Supabase (Phase 2)

1. Create a Supabase project, run the migration, add a **Postgres credential** in n8n (service role, least-privilege DB user recommended).
2. In `workflows/lead-intake/build.js` replace the five `dataTable` nodes with Postgres nodes using the same column names. Everything else (agent code, prompts, schema) is unchanged.
3. Backfill by exporting the data tables (n8n UI → table → download CSV).

## Tables at a glance

`companies`, `company_members`, `contacts`, `leads`, `conversations`, `messages`, `opportunities`, `tasks`, `workflow_runs`, `agent_runs`, `audit_logs` — every row has an id and timestamps; status changes are written to `audit_logs` with actor + reason.
