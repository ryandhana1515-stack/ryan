-- 002 · Core CRM: companies, contacts, pipelines, deals, leads, activities, tasks, conversations, knowledge.

CREATE TABLE companies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name            text NOT NULL,
  domain          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  UNIQUE (organization_id, id)
);

CREATE TABLE contacts (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid NOT NULL REFERENCES organizations(id),
  company_id           uuid,
  name                 text,
  phone_e164           text CHECK (phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  email_normalized     text CHECK (email_normalized = lower(email_normalized)),
  source               text,
  whatsapp_opt_in_at   timestamptz,
  opted_out_at         timestamptz,         -- marketing/follow-up opt-out: respected by every workflow
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz,
  CHECK (phone_e164 IS NOT NULL OR email_normalized IS NOT NULL),
  FOREIGN KEY (organization_id, company_id) REFERENCES companies(organization_id, id),
  UNIQUE (organization_id, id)
);
-- Dedupe keys (B9/C): one live contact per phone and per email within an organisation.
CREATE UNIQUE INDEX contacts_org_phone ON contacts (organization_id, phone_e164) WHERE deleted_at IS NULL AND phone_e164 IS NOT NULL;
CREATE UNIQUE INDEX contacts_org_email ON contacts (organization_id, email_normalized) WHERE deleted_at IS NULL AND email_normalized IS NOT NULL;

CREATE TABLE pipelines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name            text NOT NULL,
  stages          jsonb NOT NULL,            -- [{key, name, sla_hours, owner_role}]
  is_default      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id)
);

CREATE TABLE leads (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id),
  contact_id          uuid NOT NULL,
  source              text NOT NULL,         -- website_form, whatsapp, email, meta_ads …
  channel             text NOT NULL,
  status              text NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new','contacted','qualified','nurturing','unqualified','won','lost','archived')),
  owner_id            uuid,
  last_interaction_at timestamptz,
  next_action         text,
  next_action_at      timestamptz,
  first_message       text,
  utm                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  enquiry_count       integer NOT NULL DEFAULT 1,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz,
  FOREIGN KEY (organization_id, contact_id) REFERENCES contacts(organization_id, id),
  FOREIGN KEY (organization_id, owner_id) REFERENCES users(organization_id, id),
  UNIQUE (organization_id, id),
  -- Every ACTIVE lead has OWNER • STATUS • LAST INTERACTION • NEXT ACTION • NEXT ACTION DATE (B9 CRM).
  CONSTRAINT active_lead_is_owned CHECK (
    status IN ('unqualified','won','lost','archived')
    OR (owner_id IS NOT NULL AND last_interaction_at IS NOT NULL AND next_action IS NOT NULL AND next_action_at IS NOT NULL)
  )
);
CREATE INDEX leads_org_status ON leads (organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX leads_org_next_action ON leads (organization_id, next_action_at) WHERE deleted_at IS NULL;
CREATE INDEX leads_org_owner ON leads (organization_id, owner_id);
CREATE INDEX leads_org_contact ON leads (organization_id, contact_id);

CREATE TABLE deals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  lead_id         uuid,
  contact_id      uuid NOT NULL,
  pipeline_id     uuid NOT NULL,
  title           text NOT NULL,
  stage           text NOT NULL,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','won','lost')),
  value_cents     bigint CHECK (value_cents >= 0),
  currency        char(3) NOT NULL DEFAULT 'SGD',
  owner_id        uuid,
  lost_reason     text,
  closed_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  FOREIGN KEY (organization_id, contact_id) REFERENCES contacts(organization_id, id),
  FOREIGN KEY (organization_id, lead_id) REFERENCES leads(organization_id, id),
  FOREIGN KEY (organization_id, pipeline_id) REFERENCES pipelines(organization_id, id),
  FOREIGN KEY (organization_id, owner_id) REFERENCES users(organization_id, id)
);
CREATE INDEX deals_org_status ON deals (organization_id, status, stage);

-- WON/LOST are human decisions (FusionTech rule): agents and system automations cannot close a deal.
CREATE OR REPLACE FUNCTION app.deal_close_is_human() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IN ('won','lost') AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status)
     AND app.current_actor_type() <> 'user' THEN
    RAISE EXCEPTION 'deal won/lost must be set by a human user (actor_type=%)', app.current_actor_type() USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER deals_close_is_human BEFORE INSERT OR UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION app.deal_close_is_human();

CREATE TABLE activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  lead_id         uuid,
  contact_id      uuid,
  kind            text NOT NULL,             -- enquiry, note, call, message_out, assignment, follow_up_scheduled …
  summary         text NOT NULL,
  actor_type      text NOT NULL DEFAULT 'system',
  actor_id        text,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id, lead_id) REFERENCES leads(organization_id, id),
  FOREIGN KEY (organization_id, contact_id) REFERENCES contacts(organization_id, id)
);
CREATE INDEX activities_org_lead ON activities (organization_id, lead_id, occurred_at DESC);

CREATE TABLE tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  lead_id         uuid,
  assignee_id     uuid,
  kind            text NOT NULL DEFAULT 'follow_up',
  title           text NOT NULL,
  due_at          timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','cancelled','skipped_opt_out')),
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id, lead_id) REFERENCES leads(organization_id, id),
  FOREIGN KEY (organization_id, assignee_id) REFERENCES users(organization_id, id)
);
CREATE INDEX tasks_org_due ON tasks (organization_id, status, due_at);

-- Every inbound message is stored FIRST (never lose a customer enquiry), then processed.
CREATE TABLE conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  contact_id      uuid,
  lead_id         uuid,
  channel         text NOT NULL,             -- whatsapp, email, website_form
  direction       text NOT NULL CHECK (direction IN ('inbound','outbound')),
  external_id     text,                      -- provider message id (webhook dedupe)
  body            text,
  status          text NOT NULL DEFAULT 'received' CHECK (status IN ('received','processed','draft','sent','failed','manual_queue')),
  error           text,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id, contact_id) REFERENCES contacts(organization_id, id),
  FOREIGN KEY (organization_id, lead_id) REFERENCES leads(organization_id, id)
);
CREATE UNIQUE INDEX conversations_org_external ON conversations (organization_id, channel, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX conversations_org_status ON conversations (organization_id, status);

CREATE TABLE knowledge_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  title           text NOT NULL,
  body            text NOT NULL,
  source          text NOT NULL,
  category        text NOT NULL,             -- product, service, pricing, faq, sop, policy, script …
  version         integer NOT NULL DEFAULT 1,
  owner           text,
  approved        boolean NOT NULL DEFAULT false,   -- agents answer only from approved items
  visible_to      text[] NOT NULL DEFAULT '{}',     -- role keys; empty = all roles in the org
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['companies','contacts','pipelines','leads','deals','tasks','conversations','knowledge_items'] LOOP
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at()', t || '_touch', t);
  END LOOP;
END $$;
