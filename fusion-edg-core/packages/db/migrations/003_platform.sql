-- 003 · Platform: transactional outbox, manual queue, idempotency, approvals, append-only audit, runs, agent actions.

-- Transactional outbox (B11): the event row is written in the SAME transaction as the business change.
CREATE TABLE events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  type            text NOT NULL,             -- lead.created, lead.assigned, message.received …
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id  text NOT NULL,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','dead')),
  attempts        integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_until    timestamptz,
  last_error      text,
  processed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX events_dispatch ON events (status, next_attempt_at) WHERE status IN ('pending','processing');
CREATE INDEX events_org_type ON events (organization_id, type, created_at DESC);

-- Per-consumer processing record: consumers are idempotent (an event is handled once per consumer).
CREATE TABLE event_consumptions (
  event_id    uuid NOT NULL REFERENCES events(id),
  consumer    text NOT NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, consumer)
);

-- Work a human must pick up (failed automations, preserved messages, dead events).
CREATE TABLE manual_queue (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  kind            text NOT NULL,             -- message_send_failed, dead_event, intake_failed …
  reference_type  text,
  reference_id    uuid,
  reason          text NOT NULL,
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
  resolved_by     uuid,
  resolved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX manual_queue_org_open ON manual_queue (organization_id, status, created_at);

CREATE TABLE idempotency_keys (
  organization_id uuid NOT NULL REFERENCES organizations(id),
  key             text NOT NULL,
  tool            text NOT NULL,
  result          jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, key)
);

CREATE TABLE approvals (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  tool            text NOT NULL,
  level           text NOT NULL CHECK (level IN ('L0','L1','L2','L3','L4','L5')),
  scope_hash      text NOT NULL,
  scope_summary   text NOT NULL,
  requested_by    text NOT NULL,
  approver_roles  text[] NOT NULL,
  reason          text NOT NULL,
  status          text NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED','CONSUMED')),
  approver        jsonb,                      -- {id, name, role}: who approved
  decided_at      timestamptz,
  expires_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX approvals_org_status ON approvals (organization_id, status);

-- Append-only audit log (B11). No UPDATE/DELETE for anyone: a trigger blocks it even for the table owner.
CREATE TABLE audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  actor_type      text NOT NULL,
  actor_id        text NOT NULL,
  action          text NOT NULL,
  resource        text,
  previous_state  jsonb,
  new_state       jsonb,
  result          text NOT NULL,
  error           text,
  level           text,
  environment     text,
  workflow        text,
  correlation_id  text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_org_time ON audit_logs (organization_id, created_at DESC);
CREATE INDEX audit_logs_org_corr ON audit_logs (organization_id, correlation_id);

CREATE OR REPLACE FUNCTION app.audit_is_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'audit_logs is append-only (% refused)', TG_OP USING ERRCODE = '42501'; END $$;
CREATE TRIGGER audit_logs_append_only BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION app.audit_is_append_only();
CREATE TRIGGER audit_logs_no_truncate BEFORE TRUNCATE ON audit_logs FOR EACH STATEMENT EXECUTE FUNCTION app.audit_is_append_only();

CREATE TABLE workflow_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  workflow        text NOT NULL,
  version         text,
  status          text NOT NULL CHECK (status IN ('running','success','failed','partial')),
  correlation_id  text NOT NULL,
  error           text,
  started_at      timestamptz NOT NULL DEFAULT now(),
  finished_at     timestamptz
);
CREATE INDEX workflow_runs_org ON workflow_runs (organization_id, workflow, started_at DESC);

CREATE TABLE agent_actions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  agent           text NOT NULL,
  action          text NOT NULL,
  model_tier      text CHECK (model_tier IN ('rules','small','standard','advanced')),
  provider        text,
  input_tokens    integer NOT NULL DEFAULT 0,
  output_tokens   integer NOT NULL DEFAULT 0,
  cost_micros     bigint NOT NULL DEFAULT 0,  -- cost tracking per org per workflow (B14)
  workflow        text,
  correlation_id  text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX agent_actions_org ON agent_actions (organization_id, created_at DESC);

CREATE TRIGGER manual_queue_touch BEFORE UPDATE ON manual_queue FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
