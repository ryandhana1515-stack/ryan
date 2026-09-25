-- CEO Brain — Phase 1 data layer (PostgreSQL 15+ / Supabase)
-- Multi-tenant by design: every business row carries company_id (the CLIENT company that
-- owns the data). Row Level Security keeps tenants apart; the service role used by n8n
-- bypasses RLS and is expected to always set company_id explicitly.
--
-- Naming: "companies" = the tenant (a client of the platform). Prospect organisations
-- are stored in "contacts.organization_name" + "leads" so a tenant never becomes
-- confused with the businesses it sells to.
--
-- Apply:  psql "$DATABASE_URL" -f database/migrations/0001_init.sql
--         (or paste into the Supabase SQL editor)

begin;

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ---------------------------------------------------------------- enums
do $$ begin
  create type lead_status as enum (
    'NEW','CONTACTED','QUALIFYING','QUALIFIED','HOT','PROPOSAL_REQUIRED',
    'HUMAN_REVIEW','WON','LOST','FOLLOW_UP');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_temperature as enum ('cold','warm','hot');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_direction as enum ('inbound','outbound','internal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_status as enum ('received','draft','draft_pending_approval','approved','sent','withheld','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('open','in_progress','done','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type run_status as enum ('success','failed','fallback');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- helpers
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------- tenants
create table if not exists companies (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,                 -- e.g. 'biogreen'
  name          text not null,
  country       text,
  timezone      text not null default 'Asia/Singapore',
  owner_email   text,
  settings      jsonb not null default '{}'::jsonb,   -- notify_email, default model, etc. NO secrets.
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_companies_updated before update on companies for each row execute function set_updated_at();

-- Users of the platform (humans who approve things). Maps to auth.users on Supabase.
create table if not exists company_members (
  company_id    uuid not null references companies(id) on delete cascade,
  user_id       uuid not null,                        -- auth.users.id on Supabase
  role          text not null default 'member' check (role in ('owner','admin','member','viewer')),
  created_at    timestamptz not null default now(),
  primary key (company_id, user_id)
);

-- ---------------------------------------------------------------- CRM core
create table if not exists contacts (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references companies(id) on delete cascade,
  full_name          text,
  email              text,
  phone              text,                            -- E.164
  organization_name  text,                            -- the prospect's business
  industry           text,
  external_ids       jsonb not null default '{}'::jsonb,   -- {facebook_lead_id, wa_id, respond_io_contact_id}
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create unique index if not exists ux_contacts_company_email on contacts(company_id, lower(email)) where email is not null;
create unique index if not exists ux_contacts_company_phone on contacts(company_id, phone) where phone is not null;
create trigger trg_contacts_updated before update on contacts for each row execute function set_updated_at();

create table if not exists leads (
  id                     uuid primary key default gen_random_uuid(),
  company_id             uuid not null references companies(id) on delete cascade,
  contact_id             uuid references contacts(id) on delete set null,
  lead_key               text not null,               -- dedupe key from normalize.js
  status                 lead_status not null default 'NEW',
  temperature            lead_temperature,
  source                 text,                        -- facebook | instagram | tiktok | website | whatsapp | email | referral | manual
  channel                text,                        -- whatsapp | email | messenger | instagram_dm | web_chat | phone
  intent                 text,
  summary                text,
  extracted              jsonb not null default '{}'::jsonb,   -- SalesQualificationResult.extracted
  missing_information    text[] not null default '{}',
  next_action            text,
  follow_up_at           timestamptz,
  human_review_required  boolean not null default false,
  test_mode              boolean not null default false,
  owner_user_id          uuid,
  last_contact_at        timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (company_id, lead_key)
);
create index if not exists ix_leads_company_status on leads(company_id, status);
create index if not exists ix_leads_follow_up on leads(company_id, follow_up_at) where follow_up_at is not null;
create trigger trg_leads_updated before update on leads for each row execute function set_updated_at();

create table if not exists conversations (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  lead_id       uuid not null references leads(id) on delete cascade,
  channel       text not null,
  external_thread_id text,
  status        text not null default 'open' check (status in ('open','closed','archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists ix_conversations_lead on conversations(company_id, lead_id);
create trigger trg_conversations_updated before update on conversations for each row execute function set_updated_at();

create table if not exists messages (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references companies(id) on delete cascade,
  conversation_id  uuid references conversations(id) on delete cascade,
  lead_id          uuid not null references leads(id) on delete cascade,
  direction        message_direction not null,
  channel          text not null,
  sender           text,                              -- 'customer' | 'agent:<id>' | 'user:<uuid>'
  content          text not null,
  status           message_status not null default 'received',
  approved_by      uuid,
  approved_at      timestamptz,
  sent_at          timestamptz,
  external_message_id text,
  workflow_execution_id text,
  created_at       timestamptz not null default now()
);
create index if not exists ix_messages_lead on messages(company_id, lead_id, created_at);

create table if not exists opportunities (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  lead_id         uuid not null references leads(id) on delete cascade,
  title           text not null,
  stage           text not null default 'discovery' check (stage in ('discovery','proposal','negotiation','won','lost')),
  amount          numeric(14,2),
  currency        text not null default 'SGD',
  expected_close  date,
  proposal_url    text,
  approved_by     uuid,                               -- proposals/prices are human-approved
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_opportunities_updated before update on opportunities for each row execute function set_updated_at();

create table if not exists tasks (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references companies(id) on delete cascade,
  lead_id            uuid references leads(id) on delete cascade,
  opportunity_id     uuid references opportunities(id) on delete set null,
  task_type          text not null,                   -- follow_up | call | approval | proposal | admin
  title              text not null,
  description        text,
  due_at             timestamptz,
  status             task_status not null default 'open',
  assigned_to        text,                            -- 'human' | 'user:<uuid>' | 'agent:<id>'
  requires_approval  boolean not null default false,
  approval_reason    text,
  approved_by        uuid,
  approved_at        timestamptz,
  payload            jsonb not null default '{}'::jsonb,
  created_by         text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists ix_tasks_open on tasks(company_id, status, due_at);
create trigger trg_tasks_updated before update on tasks for each row execute function set_updated_at();

-- ---------------------------------------------------------------- observability
create table if not exists workflow_runs (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references companies(id) on delete cascade,
  workflow_id      text not null,                     -- n8n workflow id
  workflow_name    text,
  execution_id     text not null,
  trigger_type     text,
  status           run_status not null,
  error            text,
  started_at       timestamptz not null default now(),
  finished_at      timestamptz,
  unique (workflow_id, execution_id)
);

create table if not exists agent_runs (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references companies(id) on delete cascade,
  workflow_run_id  uuid references workflow_runs(id) on delete set null,
  agent            text not null,                     -- 'sales-qualification'
  agent_version    text,
  lead_id          uuid references leads(id) on delete set null,
  input_ref        text,                              -- e.g. 'messages:<uuid>' — a reference, never raw secrets
  output           jsonb,
  provider         text,                              -- anthropic | rules | openai
  model            text,
  usage            jsonb,                             -- token counts
  status           run_status not null,
  error            text,
  latency_ms       integer,
  test_mode        boolean not null default false,
  workflow_id      text,
  execution_id     text,
  started_at       timestamptz not null default now(),
  finished_at      timestamptz
);
create index if not exists ix_agent_runs_lead on agent_runs(company_id, lead_id, started_at desc);

create table if not exists audit_logs (
  id            bigserial primary key,
  company_id    uuid references companies(id) on delete cascade,
  entity_type   text not null,                        -- lead | message | task | opportunity | contact
  entity_id     uuid,
  action        text not null,                        -- status_changed | created | approved | sent | deleted
  old_value     jsonb,
  new_value     jsonb,
  actor         text not null,                        -- 'agent:sales-qualification@anthropic' | 'user:<uuid>' | 'system'
  reason        text,
  execution_id  text,
  created_at    timestamptz not null default now()
);
create index if not exists ix_audit_entity on audit_logs(company_id, entity_type, entity_id, created_at desc);

-- ---------------------------------------------------------------- Row Level Security
-- Members of a company may read/write only that company's rows. n8n uses the service
-- role (bypasses RLS) and MUST set company_id on every insert.
create or replace function current_company_ids() returns setof uuid language sql stable as $$
  select company_id from company_members where user_id = auth.uid()
$$;

do $$
declare t text;
begin
  foreach t in array array['companies','contacts','leads','conversations','messages','opportunities','tasks','workflow_runs','agent_runs','audit_logs']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_isolation on %I', t);
    if t = 'companies' then
      execute 'create policy tenant_isolation on companies for all using (id in (select current_company_ids())) with check (id in (select current_company_ids()))';
    else
      execute format('create policy tenant_isolation on %I for all using (company_id in (select current_company_ids())) with check (company_id in (select current_company_ids()))', t);
    end if;
  end loop;
end $$;

alter table company_members enable row level security;
drop policy if exists member_self on company_members;
create policy member_self on company_members for select using (user_id = auth.uid());

-- ---------------------------------------------------------------- seed the platform owner tenant
insert into companies (slug, name, country, owner_email)
values ('biogreen', 'Bio Green Elixirs / VEX', 'SG', null)
on conflict (slug) do nothing;

commit;
