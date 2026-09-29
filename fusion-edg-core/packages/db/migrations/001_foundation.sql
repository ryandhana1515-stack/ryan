-- 001 · Foundation: tenant context helpers, organisations, people, roles, permissions.
-- Tenant isolation (B9 MULTI-TENANT): every tenant-owned row has organization_id, and Row Level Security is FORCED on
-- every tenant table. The tenant comes from the request's JWT claim (Supabase: request.jwt.claims.organization_id) or,
-- for server code and tests, from the transaction-local setting app.organization_id. No context = no rows.

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.claim(name text) RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    NULLIF(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> name, ''),
    NULLIF(current_setting('app.' || name, true), '')
  )
$$;

CREATE OR REPLACE FUNCTION app.current_org_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT app.claim('organization_id')::uuid $$;
CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT app.claim('user_id')::uuid $$;
CREATE OR REPLACE FUNCTION app.current_app_role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT COALESCE(app.claim('app_role'), 'none') $$;
CREATE OR REPLACE FUNCTION app.current_actor_type() RETURNS text LANGUAGE sql STABLE AS $$ SELECT COALESCE(app.claim('actor_type'), 'user') $$;
CREATE OR REPLACE FUNCTION app.has_role(VARIADIC roles text[]) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT app.current_app_role() = ANY(roles) $$;

CREATE OR REPLACE FUNCTION app.touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

CREATE TABLE organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  timezone    text NOT NULL DEFAULT 'Asia/Singapore',
  settings    jsonb NOT NULL DEFAULT '{}'::jsonb,   -- no secrets here, ever
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE TABLE roles (
  organization_id uuid NOT NULL REFERENCES organizations(id),
  key             text NOT NULL,           -- owner, admin, manager, sales, support, viewer, agent, system
  name            text NOT NULL,
  max_level       text NOT NULL DEFAULT 'L2' CHECK (max_level IN ('L0','L1','L2','L3','L4','L5')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, key)
);

CREATE TABLE permissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  role_key        text NOT NULL,
  resource        text NOT NULL,           -- leads, deals, contacts, tool:whatsapp.send …
  action          text NOT NULL CHECK (action IN ('read','create','update','delete','execute','approve')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, role_key, resource, action),
  FOREIGN KEY (organization_id, role_key) REFERENCES roles(organization_id, key)
);

CREATE TABLE users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id),
  auth_user_id     uuid,                   -- Supabase auth.users id, when used
  name             text NOT NULL,
  email            text,
  role_key         text NOT NULL,
  active           boolean NOT NULL DEFAULT true,
  accepts_leads    boolean NOT NULL DEFAULT false,   -- in the round-robin pool
  last_assigned_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,
  FOREIGN KEY (organization_id, role_key) REFERENCES roles(organization_id, key),
  UNIQUE (organization_id, id)
);
CREATE INDEX users_org_pool ON users (organization_id, accepts_leads, last_assigned_at NULLS FIRST) WHERE active AND deleted_at IS NULL;

-- What is actually connected per org/environment (B4 capability data). Credentials are NOT stored here: only names
-- of the secret-manager entries and the connection's status/scopes.
CREATE TABLE integration_connections (
  organization_id      uuid NOT NULL REFERENCES organizations(id),
  environment          text NOT NULL CHECK (environment IN ('development','test','staging','production')),
  adapter              text NOT NULL,
  provider             text NOT NULL,
  connected            boolean NOT NULL DEFAULT false,
  authorized           boolean NOT NULL DEFAULT false,
  scopes               text[] NOT NULL DEFAULT '{}',
  plan_features        text[] NOT NULL DEFAULT '{}',
  unsupported          text[] NOT NULL DEFAULT '{}',
  pending_human_action text,
  secret_ref           text,               -- e.g. "WHATSAPP_ACCESS_TOKEN@staging" (a name, never a value)
  status               text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','authenticated','tested','live')),
  verified_at          timestamptz,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, environment, adapter)
);

CREATE TRIGGER organizations_touch BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER roles_touch BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER users_touch BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER integration_connections_touch BEFORE UPDATE ON integration_connections FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
