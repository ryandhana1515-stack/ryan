-- CEO Brain — Migration 002: modular CRM + ERP/operations core (PostgreSQL 15+ / Supabase)
--
-- Extends 0001_init.sql. Read database/crm-erp-data-layer.md for the plain-English version.
--
-- Rules baked into this file
--   * Every business table carries tenant_id (uuid → companies.id) NOT NULL, created_at and
--     updated_at, one index on tenant_id and an RLS policy named `tenant_isolation`.
--   * tenant_id is the canonical tenant column from this migration on. The 0001 tables keep
--     their company_id column (the live n8n Phase-1 workflow writes it); a trigger keeps the
--     two columns identical so nothing breaks while the workflow is moved over.
--   * tenant_isolation = "row.tenant_id equals the tenant of this connection". The tenant of
--     the connection is `current_setting('app.tenant_id', true)` (set per transaction by the
--     API / n8n: select set_config('app.tenant_id', '<uuid>', true)) OR, on Supabase, a
--     company the logged-in user is a member of (company_members). The service role bypasses
--     RLS and MUST always set tenant_id explicitly.
--   * No secrets anywhere. integrations.secret_ref is a NAME in the secret store (n8n
--     credential id), never a value. A check constraint refuses obvious secret keys in JSONB.
--   * The system never moves money: invoices and payments are STATUS records only.
--   * AI recommends → human approves (approvals) → execution → audit_logs. Nothing in a
--     money / refund / contract / pricing / delete / permission / production-deploy category
--     is executed without an approvals row in status APPROVED.
--
-- Apply (after 0001):  psql "$DATABASE_URL" -f database/migrations/002_crm_erp_core.sql
-- Idempotent: safe to run twice.

begin;

create extension if not exists "pgcrypto";

-- ================================================================ enums
do $$ begin
  create type integration_mode as enum ('CONNECTED_LIVE','IMPORTED','INDEXED','SUMMARIZED','LEFT_IN_PLACE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type data_availability as enum ('AVAILABLE','NOT_AVAILABLE','UNKNOWN','CONNECTION_REQUIRED','IMPORT_REQUIRED','NOT_REQUIRED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('PENDING','APPROVED','REJECTED','EXECUTED','FAILED','CANCELLED','EXPIRED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type risk_category as enum ('money','refund','contract','pricing','delete','permission','production_deploy','communication','other');
exception when duplicate_object then null; end $$;

-- ================================================================ helpers
-- Tenant of the current connection / transaction. NULL when not set or malformed.
create or replace function current_tenant_id() returns uuid language sql stable as $$
  select case
           when current_setting('app.tenant_id', true) ~ '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$'
           then current_setting('app.tenant_id', true)::uuid
           else null
         end
$$;

-- Companies the logged-in Supabase user belongs to. Redefined in plpgsql so the same
-- migration also runs on plain PostgreSQL (no auth schema → simply returns no rows).
create or replace function current_company_ids() returns setof uuid language plpgsql stable as $$
begin
  return query execute 'select company_id from company_members where user_id = auth.uid()';
exception when undefined_function or invalid_schema_name or undefined_table or insufficient_privilege then
  return;
end $$;

-- The single predicate every tenant_isolation policy uses.
create or replace function tenant_visible(t uuid) returns boolean language sql stable as $$
  select t is not null and (t = current_tenant_id() or t in (select current_company_ids()))
$$;

-- Keeps legacy company_id and canonical tenant_id identical on the 0001 tables.
create or replace function sync_tenant_company() returns trigger language plpgsql as $$
begin
  if new.tenant_id is null then new.tenant_id := new.company_id; end if;
  if new.company_id is null then new.company_id := new.tenant_id; end if;
  if new.tenant_id is distinct from new.company_id then
    raise exception 'tenant_id (%) and company_id (%) must be identical', new.tenant_id, new.company_id;
  end if;
  return new;
end $$;

-- Refuses JSONB that looks like it carries a credential (secrets live only in the secret store).
create or replace function jsonb_has_no_secrets(j jsonb) returns boolean language sql immutable as $$
  select j is null or not (j ?| array[
    'password','passwd','secret','client_secret','token','access_token','refresh_token',
    'api_key','apikey','api_secret','private_key','bearer','authorization'])
$$;

-- ================================================================ tenants (extend)
alter table companies add column if not exists status           text not null default 'active' check (status in ('trial','active','suspended','churned'));
alter table companies add column if not exists plan             text;                        -- e.g. 'starter' | 'growth' | 'enterprise' (label only, no prices)
alter table companies add column if not exists industry         text;
alter table companies add column if not exists onboarding_stage text not null default 'discovery' check (onboarding_stage in ('discovery','data_mapping','integration','pilot','live'));
alter table companies add column if not exists onboarded_at     timestamptz;
comment on table companies is 'TENANTS: one row per client company of the platform. Every other table points here through tenant_id. Company A never sees Company B.';

alter table company_members add column if not exists updated_at timestamptz not null default now();
comment on table company_members is 'TENANTS: which platform users belong to which tenant and with what role. Membership changes are permission changes → approvals.';

-- Platform-owner tenant. Rows created before 002 with no company (workflow_runs etc.) land here.
insert into companies (slug, name, country, status)
values ('fusiontech', 'FusionTech AI', 'SG', 'active')
on conflict (slug) do nothing;

-- ================================================================ 0001 tables → add tenant_id (+ updated_at) and keep company_id in sync
do $$
declare t text; platform uuid;
begin
  select id into platform from companies where slug = 'fusiontech';
  foreach t in array array['contacts','leads','conversations','messages','opportunities','tasks','workflow_runs','agent_runs','audit_logs']
  loop
    execute format('alter table %I add column if not exists tenant_id uuid', t);
    execute format('update %I set tenant_id = coalesce(company_id, %L) where tenant_id is null', t, platform);
    execute format('update %I set company_id = tenant_id where company_id is null', t);
    execute format('alter table %I alter column tenant_id set not null', t);
    execute format('alter table %I add column if not exists updated_at timestamptz not null default now()', t);
    begin
      execute format('alter table %I add constraint %I foreign key (tenant_id) references companies(id) on delete cascade', t, 'fk_' || t || '_tenant');
    exception when duplicate_object then null; end;
    execute format('create index if not exists %I on %I (tenant_id)', 'ix_' || t || '_tenant', t);
    execute format('drop trigger if exists %I on %I', 'trg_' || t || '_tenant_sync', t);
    execute format('create trigger %I before insert or update on %I for each row execute function sync_tenant_company()', 'trg_' || t || '_tenant_sync', t);
  end loop;
end $$;

-- ================================================================ CRM
-- Customer / prospect / partner organisations of a tenant (NOT tenants — those are `companies`).
create table if not exists organizations (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references companies(id) on delete cascade,
  name             text not null,
  legal_name       text,
  registration_no  text,                              -- UEN in Singapore
  industry         text,
  website          text,
  email            text,
  phone            text,
  address          jsonb not null default '{}'::jsonb,
  relationship     text not null default 'prospect' check (relationship in ('prospect','customer','partner','supplier','other')),
  owner_user_id    uuid,
  tags             text[] not null default '{}',
  external_ids     jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(external_ids)),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists ix_organizations_tenant_name on organizations(tenant_id, lower(name));
comment on table organizations is 'CRM: the businesses a tenant deals with (prospects, customers, partners). The tenant itself lives in companies.';

alter table contacts add column if not exists organization_id  uuid references organizations(id) on delete set null;
alter table contacts add column if not exists job_title        text;
alter table contacts add column if not exists lifecycle_stage  text not null default 'lead' check (lifecycle_stage in ('subscriber','lead','customer','partner','churned','other'));
alter table contacts add column if not exists whatsapp_opt_in  boolean not null default false;
alter table contacts add column if not exists email_opt_in     boolean not null default false;
alter table contacts add column if not exists preferred_channel text;
alter table contacts add column if not exists language         text;
alter table contacts add column if not exists tags             text[] not null default '{}';
alter table contacts add column if not exists owner_user_id    uuid;
alter table contacts add column if not exists notes            text;
create index if not exists ix_contacts_tenant_org on contacts(tenant_id, organization_id);
comment on table contacts is 'CRM: people (customers, prospects, partner staff). Unique per tenant on email and on phone.';

-- Sales pipelines and their ordered stages (a tenant may run several: sales, onboarding, support).
create table if not exists pipelines (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references companies(id) on delete cascade,
  name        text not null,
  kind        text not null default 'sales' check (kind in ('sales','onboarding','support','service','custom')),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, name)
);
create unique index if not exists ux_pipelines_default on pipelines(tenant_id, kind) where is_default;
comment on table pipelines is 'CRM: named funnels per tenant. Stages live in pipeline_stages.';

create table if not exists pipeline_stages (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references companies(id) on delete cascade,
  pipeline_id   uuid not null references pipelines(id) on delete cascade,
  name          text not null,
  position      integer not null,
  probability   numeric(5,2) check (probability between 0 and 100),
  is_won        boolean not null default false,
  is_lost       boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (pipeline_id, position),
  unique (pipeline_id, name)
);
create index if not exists ix_pipeline_stages_tenant on pipeline_stages(tenant_id, pipeline_id, position);
comment on table pipeline_stages is 'CRM: ordered steps of a pipeline. Moving a lead/opportunity between stages is written to audit_logs.';

alter table leads add column if not exists organization_id uuid references organizations(id) on delete set null;
alter table leads add column if not exists pipeline_id     uuid references pipelines(id) on delete set null;
alter table leads add column if not exists stage_id        uuid references pipeline_stages(id) on delete set null;
alter table leads add column if not exists score           integer check (score between 0 and 100);
alter table leads add column if not exists estimated_value numeric(14,2);
alter table leads add column if not exists currency        text not null default 'SGD';
alter table leads add column if not exists lost_reason     text;
alter table leads add column if not exists converted_opportunity_id uuid;   -- FK added after opportunities extended
create index if not exists ix_leads_tenant_stage on leads(tenant_id, pipeline_id, stage_id);
comment on table leads is 'CRM: an inbound interest (from Facebook, WhatsApp, website...) with its qualification state. Mirrors n8n table ceo_leads.';

alter table opportunities add column if not exists organization_id uuid references organizations(id) on delete set null;
alter table opportunities add column if not exists contact_id      uuid references contacts(id) on delete set null;
alter table opportunities add column if not exists pipeline_id     uuid references pipelines(id) on delete set null;
alter table opportunities add column if not exists stage_id        uuid references pipeline_stages(id) on delete set null;
alter table opportunities add column if not exists probability     numeric(5,2) check (probability between 0 and 100);
alter table opportunities add column if not exists owner_user_id   uuid;
alter table opportunities add column if not exists lost_reason     text;
alter table opportunities add column if not exists closed_at       timestamptz;
alter table opportunities alter column lead_id drop not null;       -- an opportunity may start from an existing customer, not a lead
create index if not exists ix_opportunities_tenant_stage on opportunities(tenant_id, stage_id);
comment on table opportunities is 'CRM: a qualified sales chance with an amount and a stage. Amounts/proposals are human-approved (approved_by).';

do $$ begin
  alter table leads add constraint fk_leads_converted_opportunity foreign key (converted_opportunity_id) references opportunities(id) on delete set null;
exception when duplicate_object then null; end $$;

-- A closed-won commercial agreement (what was actually sold, on what terms).
create table if not exists deals (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references companies(id) on delete cascade,
  opportunity_id   uuid references opportunities(id) on delete set null,
  organization_id  uuid references organizations(id) on delete set null,
  contact_id       uuid references contacts(id) on delete set null,
  title            text not null,
  status           text not null default 'draft' check (status in ('draft','pending_approval','active','completed','cancelled')),
  value            numeric(14,2),
  currency         text not null default 'SGD',
  third_party_costs numeric(14,2) not null default 0,   -- always separate from FusionTech fees
  contract_ref     text,                                 -- document id / external contract id, never the contract text
  starts_on        date,
  ends_on          date,
  terms            jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(terms)),
  approval_id      uuid,                                 -- FK added after approvals
  approved_by      uuid,
  approved_at      timestamptz,
  owner_user_id    uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists ix_deals_tenant_status on deals(tenant_id, status);
comment on table deals is 'CRM: signed / agreed engagements. Contracts and prices are human decisions: status active requires an APPROVED approvals row.';

-- Projects: delivery work for a customer (website build, automation rollout, CEO Brain onboarding).
create table if not exists projects (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references companies(id) on delete cascade,
  code             text,
  name             text not null,
  project_type     text,                                 -- website_build | automation | ceo_brain_rollout | custom
  organization_id  uuid references organizations(id) on delete set null,
  deal_id          uuid references deals(id) on delete set null,
  status           text not null default 'planning' check (status in ('planning','active','on_hold','completed','cancelled')),
  starts_on        date,
  due_on           date,
  completed_at     timestamptz,
  budget           numeric(14,2),
  currency         text not null default 'SGD',
  progress_pct     integer not null default 0 check (progress_pct between 0 and 100),
  owner_user_id    uuid,
  description      text,
  metadata         jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(metadata)),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, code)
);
create index if not exists ix_projects_tenant_status on projects(tenant_id, status);
comment on table projects is 'CRM/delivery: a piece of work for a customer with dates, budget and progress. Tasks and service_jobs hang off it.';

-- ---------------------------------------------------------------- approvals (platform-wide ladder)
create table if not exists approvals (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references companies(id) on delete cascade,
  entity_type        text not null,                      -- deal | quotation | invoice | payment | order | purchase_order | message | contact | integration | deployment ...
  entity_id          uuid,
  action             text not null,                      -- send_quote | issue_refund | sign_contract | change_price | delete_record | grant_permission | deploy_production ...
  risk               risk_category not null default 'other',
  requires_approval  boolean not null default true,      -- false = policy allowed auto-execution; row kept for the audit trail
  status             approval_status not null default 'PENDING',
  ai_recommendation  jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(ai_recommendation)),
  ai_rationale       text,
  requested_by       text not null,                      -- 'agent:<id>' | 'user:<uuid>' | 'system'
  requested_at       timestamptz not null default now(),
  expires_at         timestamptz,
  approved_by        uuid,                               -- the human who decided (company_members.user_id)
  decided_at         timestamptz,
  decision_note      text,
  executed_at        timestamptz,
  executed_by        text,                               -- the workflow / agent that carried out the approved action
  execution_result   jsonb check (jsonb_has_no_secrets(execution_result)),
  audit_log_id       bigint references audit_logs(id) on delete set null,
  task_id            uuid references tasks(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (status <> 'APPROVED' or approved_by is not null),
  check (status not in ('APPROVED','REJECTED') or decided_at is not null)
);
create index if not exists ix_approvals_tenant_status on approvals(tenant_id, status, requested_at desc);
create index if not exists ix_approvals_entity on approvals(tenant_id, entity_type, entity_id);
comment on table approvals is 'PLATFORM: the human-approval ladder. AI writes the recommendation (PENDING), a human sets APPROVED/REJECTED, the workflow executes (EXECUTED) and links the audit_logs row.';

do $$ begin
  alter table deals add constraint fk_deals_approval foreign key (approval_id) references approvals(id) on delete set null;
exception when duplicate_object then null; end $$;

alter table tasks add column if not exists contact_id   uuid references contacts(id) on delete set null;
alter table tasks add column if not exists project_id   uuid references projects(id) on delete set null;
alter table tasks add column if not exists approval_id  uuid references approvals(id) on delete set null;
alter table tasks add column if not exists priority     text not null default 'normal' check (priority in ('low','normal','high','urgent'));
alter table tasks add column if not exists completed_at timestamptz;
create index if not exists ix_tasks_tenant_project on tasks(tenant_id, project_id) where project_id is not null;
comment on table tasks is 'CRM/ops: follow-ups and to-dos for humans or agents. Mirrors n8n table ceo_tasks (requires_approval rows now also create an approvals row).';

-- ---------------------------------------------------------------- conversations / messages (extend)
alter table conversations add column if not exists contact_id      uuid references contacts(id) on delete set null;
alter table conversations add column if not exists organization_id uuid references organizations(id) on delete set null;
alter table conversations add column if not exists subject         text;
alter table conversations add column if not exists assigned_to     text;                 -- 'user:<uuid>' | 'agent:john'
alter table conversations add column if not exists summary         text;
alter table conversations add column if not exists last_message_at timestamptz;
alter table conversations alter column lead_id drop not null;       -- support / customer threads have no lead
create index if not exists ix_conversations_tenant_contact on conversations(tenant_id, contact_id, last_message_at desc);
comment on table conversations is 'CRM: one thread per channel per contact (WhatsApp, email, web chat). Messages hang off it.';

alter table messages add column if not exists contact_id    uuid references contacts(id) on delete set null;
alter table messages add column if not exists content_type  text not null default 'text' check (content_type in ('text','image','audio','video','document','template','system'));
alter table messages add column if not exists media_ref     text;                        -- storage reference, never the bytes
alter table messages add column if not exists approval_id   uuid references approvals(id) on delete set null;
alter table messages add column if not exists error         text;
alter table messages add column if not exists metadata      jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(metadata));
alter table messages alter column lead_id drop not null;
create index if not exists ix_messages_tenant_conversation on messages(tenant_id, conversation_id, created_at);
comment on table messages is 'CRM: every inbound message and every AI draft/sent reply. Mirrors n8n table ceo_messages (direction, status).';

-- ---------------------------------------------------------------- appointments
create table if not exists appointments (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references companies(id) on delete cascade,
  title             text not null,
  contact_id        uuid references contacts(id) on delete set null,
  lead_id           uuid references leads(id) on delete set null,
  organization_id   uuid references organizations(id) on delete set null,
  opportunity_id    uuid references opportunities(id) on delete set null,
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  timezone          text not null default 'Asia/Singapore',
  location          text,
  meeting_url       text,
  status            text not null default 'proposed' check (status in ('proposed','confirmed','rescheduled','cancelled','completed','no_show')),
  assigned_to       text,                                  -- 'user:<uuid>' | 'employee:<uuid>'
  calendar_provider text,                                  -- google | outlook | calendly | none
  external_event_id text,
  attendees         jsonb not null default '[]'::jsonb,
  notes             text,
  created_by        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists ix_appointments_tenant_time on appointments(tenant_id, starts_at);
comment on table appointments is 'CRM: meetings/calls/site visits booked with contacts, mirrored to the connected calendar (calendar_provider + external_event_id).';

-- ---------------------------------------------------------------- quotations
create table if not exists quotations (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references companies(id) on delete cascade,
  quote_number      text not null,
  opportunity_id    uuid references opportunities(id) on delete set null,
  organization_id   uuid references organizations(id) on delete set null,
  contact_id        uuid references contacts(id) on delete set null,
  status            text not null default 'draft' check (status in ('draft','pending_approval','approved','sent','accepted','rejected','expired','cancelled')),
  currency          text not null default 'SGD',
  subtotal          numeric(14,2) not null default 0,
  tax_total         numeric(14,2) not null default 0,
  total             numeric(14,2) not null default 0,
  third_party_costs numeric(14,2) not null default 0,   -- shown separately from FusionTech fees
  valid_until       date,
  prepared_by       text,                                -- 'agent:<id>' | 'user:<uuid>'
  approval_id       uuid references approvals(id) on delete set null,
  approved_by       uuid,
  approved_at       timestamptz,
  sent_at           timestamptz,
  document_id       uuid,                                -- FK added after documents
  terms             text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, quote_number),
  check (status not in ('approved','sent','accepted') or approved_by is not null)
);
create index if not exists ix_quotations_tenant_status on quotations(tenant_id, status);
comment on table quotations is 'CRM: price quotes. Agents may DRAFT; a human must approve before status sent (prices are never quoted by AI).';

create table if not exists quotation_items (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references companies(id) on delete cascade,
  quotation_id         uuid not null references quotations(id) on delete cascade,
  position             integer not null default 1,
  description          text not null,
  quantity             numeric(12,3) not null default 1 check (quantity >= 0),
  unit                 text,
  unit_price           numeric(14,2) not null default 0,
  discount_pct         numeric(5,2) not null default 0 check (discount_pct between 0 and 100),
  tax_rate_pct         numeric(5,2) not null default 0,
  is_third_party_cost  boolean not null default false,
  line_total           numeric(14,2) generated always as (round(quantity * unit_price * (1 - discount_pct / 100), 2)) stored,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists ix_quotation_items_quote on quotation_items(tenant_id, quotation_id, position);
comment on table quotation_items is 'CRM: quote lines. is_third_party_cost marks pass-through costs (hosting, ads, licences) kept separate from fees.';

-- ---------------------------------------------------------------- activities (timeline)
create table if not exists activities (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references companies(id) on delete cascade,
  activity_type  text not null check (activity_type in ('note','call','email','whatsapp','meeting','status_change','task','document','system','other')),
  subject        text,
  body           text,
  entity_type    text,                                   -- lead | contact | organization | opportunity | deal | project | order | service_job ...
  entity_id      uuid,
  contact_id     uuid references contacts(id) on delete set null,
  lead_id        uuid references leads(id) on delete set null,
  organization_id uuid references organizations(id) on delete set null,
  actor          text not null,                          -- 'agent:<id>' | 'user:<uuid>' | 'system'
  occurred_at    timestamptz not null default now(),
  metadata       jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(metadata)),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists ix_activities_entity on activities(tenant_id, entity_type, entity_id, occurred_at desc);
create index if not exists ix_activities_contact on activities(tenant_id, contact_id, occurred_at desc);
comment on table activities is 'CRM: the human-readable timeline (calls, notes, meetings, status changes) shown on a contact / deal / project.';

-- ---------------------------------------------------------------- documents (references, never bytes)
create table if not exists documents (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references companies(id) on delete cascade,
  title             text not null,
  doc_type          text not null default 'other' check (doc_type in ('contract','proposal','quotation','invoice','sop','procedure','brief','report','image','spreadsheet','other')),
  storage_provider  text not null default 'url' check (storage_provider in ('google_drive','supabase_storage','s3','onedrive','dropbox','url','left_in_place')),
  storage_ref       text not null,                       -- file id / object key / URL
  mime_type         text,
  size_bytes        bigint,
  checksum          text,
  entity_type       text,
  entity_id         uuid,
  handling          integration_mode not null default 'LEFT_IN_PLACE',   -- INDEXED / SUMMARIZED / IMPORTED / LEFT_IN_PLACE
  index_status      text not null default 'none' check (index_status in ('none','queued','indexed','failed')),
  summary           text,
  sensitivity       text not null default 'internal' check (sensitivity in ('public','internal','confidential','restricted','pii')),
  uploaded_by       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists ix_documents_entity on documents(tenant_id, entity_type, entity_id);
create index if not exists ix_documents_type on documents(tenant_id, doc_type);
comment on table documents is 'PLATFORM: pointers to files (contracts, SOPs, quotes). Bytes stay in the storage provider; handling says whether the file is indexed, summarised or left in place.';

do $$ begin
  alter table quotations add constraint fk_quotations_document foreign key (document_id) references documents(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- observability (extend)
alter table workflow_runs add column if not exists input_ref  text;
alter table workflow_runs add column if not exists metadata   jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(metadata));
create index if not exists ix_workflow_runs_tenant_started on workflow_runs(tenant_id, started_at desc);
comment on table workflow_runs is 'PLATFORM: one row per n8n workflow execution (which workflow, which trigger, success/failure).';

alter table agent_runs add column if not exists approval_id     uuid references approvals(id) on delete set null;
alter table agent_runs add column if not exists conversation_id uuid references conversations(id) on delete set null;
alter table agent_runs add column if not exists cost_usd        numeric(10,4);
create index if not exists ix_agent_runs_tenant_started on agent_runs(tenant_id, started_at desc);
comment on table agent_runs is 'PLATFORM: one row per AI agent invocation (agent, model, input ref, output, latency). Mirrors n8n table ceo_agent_runs.';

alter table audit_logs add column if not exists approval_id  uuid references approvals(id) on delete set null;
alter table audit_logs add column if not exists ip_address   inet;
alter table audit_logs add column if not exists user_agent   text;
comment on table audit_logs is 'PLATFORM: immutable record of every state change with actor + reason. Mirrors n8n table ceo_audit_logs. Insert-only by convention.';

-- ================================================================ ERP / operations (each module optional per tenant, see tenant_modules)
-- ---------------------------------------------------------------- people
create table if not exists roles (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references companies(id) on delete cascade,
  name         text not null,
  description  text,
  permissions  jsonb not null default '[]'::jsonb,       -- e.g. ["crm.read","crm.write","approvals.decide","finance.read"]
  can_approve  risk_category[] not null default '{}',    -- which approval categories this role may decide
  is_system    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tenant_id, name)
);
comment on table roles is 'ERP/HR: job roles per tenant with their permissions and which approval categories they may decide. Changing permissions is itself an approval.';

create table if not exists employees (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references companies(id) on delete cascade,
  user_id          uuid,                                 -- company_members.user_id when the employee logs in
  employee_no      text,
  full_name        text not null,
  email            text,
  phone            text,
  job_title        text,
  department       text,
  role_id          uuid references roles(id) on delete set null,
  manager_id       uuid references employees(id) on delete set null,
  employment_type  text check (employment_type in ('full_time','part_time','contract','intern','agent')),
  status           text not null default 'active' check (status in ('active','on_leave','inactive','left')),
  starts_on        date,
  ends_on          date,
  skills           text[] not null default '{}',
  metadata         jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(metadata)),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, employee_no)
);
create index if not exists ix_employees_tenant_status on employees(tenant_id, status);
comment on table employees is 'ERP/HR: the tenant''s people (and AI agents as employment_type agent) — who can be assigned jobs, tasks and approvals. No payroll data.';

-- ---------------------------------------------------------------- suppliers & purchasing
create table if not exists suppliers (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references companies(id) on delete cascade,
  organization_id  uuid references organizations(id) on delete set null,
  name             text not null,
  contact_name     text,
  email            text,
  phone            text,
  address          jsonb not null default '{}'::jsonb,
  payment_terms    text,                                 -- e.g. 'NET30'
  currency         text not null default 'SGD',
  category         text,
  status           text not null default 'active' check (status in ('active','inactive','blocked')),
  rating           integer check (rating between 1 and 5),
  external_ref     text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, name)
);
comment on table suppliers is 'ERP: vendors the tenant buys from. Purchase orders and inventory items point here.';

create table if not exists inventory_items (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references companies(id) on delete cascade,
  sku               text not null,
  name              text not null,
  description       text,
  category          text,
  unit              text not null default 'unit',
  item_type         text not null default 'product' check (item_type in ('product','material','service','digital')),
  quantity_on_hand  numeric(14,3) not null default 0,    -- maintained by the app from stock_movements
  quantity_reserved numeric(14,3) not null default 0,
  reorder_level     numeric(14,3),
  reorder_qty       numeric(14,3),
  unit_cost         numeric(14,2),
  unit_price        numeric(14,2),
  location          text,
  supplier_id       uuid references suppliers(id) on delete set null,
  status            text not null default 'active' check (status in ('active','discontinued','archived')),
  external_ref      text,
  metadata          jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(metadata)),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, sku)
);
create index if not exists ix_inventory_items_tenant_status on inventory_items(tenant_id, status);
comment on table inventory_items is 'ERP: products / materials / services with stock levels. Levels are derived from stock_movements; low-stock alerts use reorder_level.';

create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references companies(id) on delete cascade,
  order_number      text not null,
  organization_id   uuid references organizations(id) on delete set null,
  contact_id        uuid references contacts(id) on delete set null,
  deal_id           uuid references deals(id) on delete set null,
  quotation_id      uuid references quotations(id) on delete set null,
  status            text not null default 'draft' check (status in ('draft','pending_approval','confirmed','in_progress','fulfilled','delivered','cancelled','refunded')),
  source            text,                                -- whatsapp | website | shopify | manual | pos
  ordered_at        timestamptz not null default now(),
  currency          text not null default 'SGD',
  subtotal          numeric(14,2) not null default 0,
  tax_total         numeric(14,2) not null default 0,
  shipping_total    numeric(14,2) not null default 0,
  total             numeric(14,2) not null default 0,
  shipping_address  jsonb not null default '{}'::jsonb,
  approval_id       uuid references approvals(id) on delete set null,
  external_ref      text,                                -- e.g. Shopify order id
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, order_number)
);
create index if not exists ix_orders_tenant_status on orders(tenant_id, status, ordered_at desc);
comment on table orders is 'ERP: customer sales orders (what was bought). Refunds / cancellations go through approvals first.';

create table if not exists order_items (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references companies(id) on delete cascade,
  order_id           uuid not null references orders(id) on delete cascade,
  inventory_item_id  uuid references inventory_items(id) on delete set null,
  position           integer not null default 1,
  description        text not null,
  quantity           numeric(12,3) not null default 1 check (quantity >= 0),
  unit_price         numeric(14,2) not null default 0,
  discount_pct       numeric(5,2) not null default 0 check (discount_pct between 0 and 100),
  tax_rate_pct       numeric(5,2) not null default 0,
  line_total         numeric(14,2) generated always as (round(quantity * unit_price * (1 - discount_pct / 100), 2)) stored,
  fulfilled_qty      numeric(12,3) not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists ix_order_items_order on order_items(tenant_id, order_id, position);
comment on table order_items is 'ERP: the lines of a sales order.';

create table if not exists purchase_orders (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references companies(id) on delete cascade,
  po_number        text not null,
  supplier_id      uuid not null references suppliers(id) on delete restrict,
  status           text not null default 'draft' check (status in ('draft','pending_approval','approved','sent','partially_received','received','cancelled')),
  ordered_at       timestamptz,
  expected_at      timestamptz,
  received_at      timestamptz,
  currency         text not null default 'SGD',
  subtotal         numeric(14,2) not null default 0,
  tax_total        numeric(14,2) not null default 0,
  total            numeric(14,2) not null default 0,
  approval_id      uuid references approvals(id) on delete set null,
  approved_by      uuid,
  approved_at      timestamptz,
  requested_by     text,
  external_ref     text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, po_number),
  check (status not in ('approved','sent','partially_received','received') or approved_by is not null)
);
create index if not exists ix_purchase_orders_tenant_status on purchase_orders(tenant_id, status);
comment on table purchase_orders is 'ERP: what the tenant orders from suppliers. Spending money = approval required before status approved.';

create table if not exists purchase_order_items (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references companies(id) on delete cascade,
  purchase_order_id  uuid not null references purchase_orders(id) on delete cascade,
  inventory_item_id  uuid references inventory_items(id) on delete set null,
  position           integer not null default 1,
  description        text not null,
  quantity_ordered   numeric(12,3) not null default 1 check (quantity_ordered >= 0),
  quantity_received  numeric(12,3) not null default 0,
  unit_cost          numeric(14,2) not null default 0,
  line_total         numeric(14,2) generated always as (round(quantity_ordered * unit_cost, 2)) stored,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists ix_po_items_po on purchase_order_items(tenant_id, purchase_order_id, position);
comment on table purchase_order_items is 'ERP: the lines of a purchase order, with received quantities.';

create table if not exists stock_movements (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references companies(id) on delete cascade,
  inventory_item_id  uuid not null references inventory_items(id) on delete cascade,
  movement_type      text not null check (movement_type in ('in','out','adjustment','transfer','reserve','release','return')),
  quantity           numeric(14,3) not null,             -- signed: positive adds stock, negative removes
  reference_type     text,                               -- order | purchase_order | service_job | manual
  reference_id       uuid,
  from_location      text,
  to_location        text,
  reason             text,
  actor              text not null,                      -- who recorded it
  occurred_at        timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists ix_stock_movements_item on stock_movements(tenant_id, inventory_item_id, occurred_at desc);
comment on table stock_movements is 'ERP: the ledger of every stock change. quantity_on_hand on inventory_items is the running sum.';

-- ---------------------------------------------------------------- service delivery
create table if not exists service_jobs (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references companies(id) on delete cascade,
  job_number            text not null,
  title                 text not null,
  service_type          text,                            -- installation | repair | consultation | delivery | onboarding ...
  organization_id       uuid references organizations(id) on delete set null,
  contact_id            uuid references contacts(id) on delete set null,
  order_id              uuid references orders(id) on delete set null,
  project_id            uuid references projects(id) on delete set null,
  appointment_id        uuid references appointments(id) on delete set null,
  status                text not null default 'requested' check (status in ('requested','scheduled','in_progress','on_hold','completed','cancelled')),
  priority              text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  scheduled_start       timestamptz,
  scheduled_end         timestamptz,
  actual_start          timestamptz,
  actual_end            timestamptz,
  assigned_employee_id  uuid references employees(id) on delete set null,
  location              jsonb not null default '{}'::jsonb,
  checklist             jsonb not null default '[]'::jsonb,
  description           text,
  outcome_notes         text,
  customer_signoff_at   timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (tenant_id, job_number)
);
create index if not exists ix_service_jobs_tenant_status on service_jobs(tenant_id, status, scheduled_start);
create index if not exists ix_service_jobs_employee on service_jobs(tenant_id, assigned_employee_id, scheduled_start);
comment on table service_jobs is 'ERP: service delivery work (installs, repairs, consultations) with schedule, assignee, checklist and sign-off.';

-- ---------------------------------------------------------------- invoicing & payments (STATUS ONLY — money moves in the accounting / payment system)
create table if not exists invoices (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references companies(id) on delete cascade,
  invoice_number    text not null,
  organization_id   uuid references organizations(id) on delete set null,
  contact_id        uuid references contacts(id) on delete set null,
  order_id          uuid references orders(id) on delete set null,
  deal_id           uuid references deals(id) on delete set null,
  project_id        uuid references projects(id) on delete set null,
  status            text not null default 'draft' check (status in ('draft','pending_approval','approved','issued','partially_paid','paid','overdue','void')),
  issue_date        date,
  due_date          date,
  currency          text not null default 'SGD',
  subtotal          numeric(14,2) not null default 0,
  tax_total         numeric(14,2) not null default 0,
  total             numeric(14,2) not null default 0,
  amount_paid       numeric(14,2) not null default 0,
  third_party_costs numeric(14,2) not null default 0,
  approval_id       uuid references approvals(id) on delete set null,
  approved_by       uuid,
  approved_at       timestamptz,
  issued_at         timestamptz,
  document_id       uuid references documents(id) on delete set null,
  accounting_ref    text,                                -- id in Xero / QuickBooks etc. (CONNECTED_LIVE integration)
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, invoice_number),
  check (status not in ('approved','issued','partially_paid','paid') or approved_by is not null)
);
create index if not exists ix_invoices_tenant_status on invoices(tenant_id, status, due_date);
comment on table invoices is 'ERP: invoice records mirrored from / pushed to the accounting system. Issuing an invoice is an approval. The platform never collects money.';

create table if not exists invoice_items (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references companies(id) on delete cascade,
  invoice_id    uuid not null references invoices(id) on delete cascade,
  position      integer not null default 1,
  description   text not null,
  quantity      numeric(12,3) not null default 1 check (quantity >= 0),
  unit_price    numeric(14,2) not null default 0,
  tax_rate_pct  numeric(5,2) not null default 0,
  is_third_party_cost boolean not null default false,
  line_total    numeric(14,2) generated always as (round(quantity * unit_price, 2)) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists ix_invoice_items_invoice on invoice_items(tenant_id, invoice_id, position);
comment on table invoice_items is 'ERP: invoice lines. Third-party costs are flagged so they are always shown apart from FusionTech fees.';

create table if not exists payments (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references companies(id) on delete cascade,
  invoice_id     uuid references invoices(id) on delete set null,
  order_id       uuid references orders(id) on delete set null,
  direction      text not null default 'inbound' check (direction in ('inbound','outbound')),   -- outbound = refund / supplier payment
  amount         numeric(14,2) not null check (amount > 0),
  currency       text not null default 'SGD',
  method         text,                                   -- paynow | bank_transfer | card | cash | stripe | other
  status         text not null default 'pending' check (status in ('pending','confirmed','failed','refunded','cancelled')),
  paid_at        timestamptz,
  external_ref   text,                                   -- transaction id in the payment / accounting system
  approval_id    uuid references approvals(id) on delete set null,   -- required for outbound (refunds)
  recorded_by    text not null,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (direction <> 'outbound' or approval_id is not null)
);
create index if not exists ix_payments_invoice on payments(tenant_id, invoice_id);
comment on table payments is 'ERP: a record that money moved (or is expected) in an external system. Status only — no card data, no bank details, no transfers initiated here.';

-- ================================================================ platform: modules, integrations, data discovery, company map
create table if not exists tenant_modules (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references companies(id) on delete cascade,
  module_key  text not null check (module_key in (
                'crm','sales_pipeline','whatsapp','email','website','appointments','quotations','projects',
                'orders','suppliers','purchasing','inventory','service_delivery','invoicing','payments',
                'hr','approvals','documents','accounting_integration','calendar_integration','reporting')),
  enabled     boolean not null default true,
  config      jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(config)),
  enabled_by  text,
  enabled_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, module_key)
);
comment on table tenant_modules is 'PLATFORM: which modules a tenant has switched on (e.g. only whatsapp + sales_pipeline + crm + accounting_integration). Agents and UI hide the rest.';

create table if not exists integrations (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references companies(id) on delete cascade,
  name             text not null,
  system_type      text not null check (system_type in ('crm','calendar','accounting','payments','whatsapp','email','spreadsheet','file_storage','erp','pos','ecommerce','hr','marketing','website','other')),
  vendor           text,                                 -- hubspot | google_calendar | xero | quickbooks | whatsapp_cloud | shopify | google_sheets ...
  mode             integration_mode not null,            -- CONNECTED_LIVE | IMPORTED | INDEXED | SUMMARIZED | LEFT_IN_PLACE
  status           text not null default 'planned' check (status in ('planned','pending_authorization','connected','importing','imported','error','disconnected')),
  owner_name       text,                                 -- the client-side person who owns this system
  owner_email      text,
  auth_type        text not null default 'none' check (auth_type in ('oauth2','api_key','basic','webhook_secret','service_account','none')),
  secret_ref       text,                                 -- NAME/ID of the credential in the secret store (n8n credential id). NEVER the secret.
  scopes           text[] not null default '{}',
  sync_direction   text not null default 'inbound' check (sync_direction in ('inbound','outbound','bidirectional','none')),
  sync_schedule    text,                                 -- cron or 'realtime' / 'manual'
  last_synced_at   timestamptz,
  last_error       text,
  config           jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(config)),
  authorized_by    text,
  authorized_at    timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, name),
  check (secret_ref is null or secret_ref !~* '(^|[^a-z])(sk|pk|rk|xox[a-z]?|gh[pousr]|glpat|bearer)[_-]'),   -- refuse things that look like actual keys
  check (secret_ref is null or length(secret_ref) <= 128)
);
create index if not exists ix_integrations_tenant_mode on integrations(tenant_id, mode, status);
comment on table integrations is 'PLATFORM: every external system per tenant and how we treat it (connect live vs import vs index vs summarise vs leave in place), its owner and auth type. Secrets never stored here.';

create table if not exists data_sources (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references companies(id) on delete cascade,
  category                text not null check (category in ('customers','sales','marketing','finance','operations','inventory','products','suppliers','hr','documents_sops','communications','calendar','website','other')),
  name                    text not null,
  description             text,
  availability            data_availability not null default 'UNKNOWN',
  source_system           text,                          -- 'Google Sheets', 'Xero', 'paper files', 'WhatsApp Business'...
  owner_name              text,
  owner_email             text,
  format                  text check (format in ('spreadsheet','database','saas_app','pdf','paper','email','chat','api','other')),
  approx_volume           text,                          -- '~2,000 rows', '5 years of invoices'
  sensitivity             text not null default 'internal' check (sensitivity in ('public','internal','confidential','restricted','pii')),
  import_method           text check (import_method in ('live_connection','api_sync','csv_export','manual_entry','document_index','summary_only','none')),
  proposed_mode           integration_mode,              -- what the CEO Brain recommends for it
  authorization_required  boolean not null default true,
  authorized_by           text,
  authorized_at           timestamptz,
  integration_id          uuid references integrations(id) on delete set null,
  checklist_status        text not null default 'open' check (checklist_status in ('open','in_progress','done','skipped')),
  discovered_by           text,                          -- 'agent:ceo-brain' | 'user:<uuid>'
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (tenant_id, category, name)
);
create index if not exists ix_data_sources_tenant_avail on data_sources(tenant_id, availability, checklist_status);
comment on table data_sources is 'PLATFORM: the data-discovery checklist filled in during onboarding — what data exists, where, who owns it, how sensitive, and how we will bring it in.';

create table if not exists company_maps (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references companies(id) on delete cascade,
  version         integer not null,
  status          text not null default 'draft' check (status in ('draft','current','archived')),
  title           text,
  map             jsonb not null default '{}'::jsonb check (jsonb_has_no_secrets(map)),   -- the Client Digital Company Map (people, systems, processes, data flows, modules)
  summary         text,
  generated_by    text not null,                         -- 'agent:ceo-brain' | 'user:<uuid>'
  source_snapshot jsonb not null default '{}'::jsonb,   -- ids of data_sources / integrations the map was built from
  approved_by     uuid,
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (tenant_id, version)
);
create unique index if not exists ux_company_maps_current on company_maps(tenant_id) where status = 'current';
comment on table company_maps is 'PLATFORM: versioned JSON snapshot of the Client Digital Company Map per tenant. Exactly one version may be current.';

-- ================================================================ updated_at triggers on every table that has the column
do $$
declare t text;
begin
  for t in
    select c.table_name from information_schema.columns c
    join information_schema.tables tb on tb.table_schema = c.table_schema and tb.table_name = c.table_name
    where c.table_schema = 'public' and c.column_name = 'updated_at' and tb.table_type = 'BASE TABLE'
  loop
    execute format('drop trigger if exists %I on %I', 'trg_' || t || '_updated', t);
    execute format('create trigger %I before update on %I for each row execute function set_updated_at()', 'trg_' || t || '_updated', t);
  end loop;
end $$;

-- ================================================================ Row Level Security: policy `tenant_isolation` on every table
-- companies: a tenant sees only itself. company_members: only rows of visible tenants.
-- Everything else: tenant_visible(tenant_id) for reads and for writes (WITH CHECK).
do $$
declare t text;
begin
  for t in
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
      and (table_name in ('companies','company_members')
           or exists (select 1 from information_schema.columns c
                      where c.table_schema = 'public' and c.table_name = tables.table_name and c.column_name = 'tenant_id'))
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_isolation on %I', t);
    if t = 'companies' then
      execute 'create policy tenant_isolation on companies for all using (tenant_visible(id)) with check (tenant_visible(id))';
    elsif t = 'company_members' then
      execute 'create policy tenant_isolation on company_members for all using (tenant_visible(company_id)) with check (tenant_visible(company_id))';
    else
      execute format('create policy tenant_isolation on %I for all using (tenant_visible(tenant_id)) with check (tenant_visible(tenant_id))', t);
    end if;
  end loop;
end $$;

-- ================================================================ seed: default modules + sales pipeline for the platform tenant
do $$
declare platform uuid; pl uuid;
begin
  select id into platform from companies where slug = 'fusiontech';

  insert into tenant_modules (tenant_id, module_key, enabled_by)
  select platform, m, 'system' from unnest(array['crm','sales_pipeline','whatsapp','website','appointments','quotations','projects','approvals','documents']) m
  on conflict (tenant_id, module_key) do nothing;

  insert into pipelines (tenant_id, name, kind, is_default)
  values (platform, 'Sales', 'sales', true)
  on conflict (tenant_id, name) do nothing;
  select id into pl from pipelines where tenant_id = platform and name = 'Sales';

  insert into pipeline_stages (tenant_id, pipeline_id, name, position, probability, is_won, is_lost)
  values
    (platform, pl, 'New',               1, 5,   false, false),
    (platform, pl, 'Contacted',         2, 10,  false, false),
    (platform, pl, 'Qualifying',        3, 20,  false, false),
    (platform, pl, 'Qualified',         4, 40,  false, false),
    (platform, pl, 'Proposal',          5, 60,  false, false),
    (platform, pl, 'Negotiation',       6, 80,  false, false),
    (platform, pl, 'Won',               7, 100, true,  false),
    (platform, pl, 'Lost',              8, 0,   false, true)
  on conflict (pipeline_id, position) do nothing;
end $$;

commit;
