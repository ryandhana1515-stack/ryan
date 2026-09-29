-- 004 · Row Level Security on every tenant table (FORCED, so even the table owner is subject to it unless superuser).
-- Rule: a row is visible/writable only when organization_id = app.current_org_id(), AND the caller's role is allowed
-- for that operation. Server-side authorisation (executeTool permission checks) sits on top of this, not instead.

-- Application roles. edg_app = the API/workers' login role (no BYPASSRLS). On Supabase the same policies apply to
-- `authenticated`; never use the service_role key from a browser.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'edg_app') THEN CREATE ROLE edg_app NOLOGIN NOBYPASSRLS; END IF;
END $$;

CREATE OR REPLACE FUNCTION app.tenant_policies(
  tbl text, read_roles text[], write_roles text[], update_roles text[], delete_roles text[], org_col text DEFAULT 'organization_id'
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  in_org text := format('%I = app.current_org_id()', org_col);
  role_ok text;
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
  role_ok := CASE WHEN read_roles IS NULL THEN 'true' ELSE format('app.has_role(VARIADIC %L::text[])', read_roles) END;
  EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (%s AND %s)', tbl || '_select', tbl, in_org, role_ok);
  IF write_roles IS NOT NULL THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (%s AND app.has_role(VARIADIC %L::text[]))', tbl || '_insert', tbl, in_org, write_roles);
  END IF;
  IF update_roles IS NOT NULL THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (%s AND app.has_role(VARIADIC %L::text[])) WITH CHECK (%s)', tbl || '_update', tbl, in_org, update_roles, in_org);
  END IF;
  IF delete_roles IS NOT NULL THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (%s AND app.has_role(VARIADIC %L::text[]))', tbl || '_delete', tbl, in_org, delete_roles);
  END IF;
END $$;

DO $$
DECLARE
  all_writers text[] := ARRAY['owner','admin','manager','sales','support','agent','system'];
  crm_writers text[] := ARRAY['owner','admin','manager','sales','agent','system'];
  admins      text[] := ARRAY['owner','admin'];
  managers    text[] := ARRAY['owner','admin','manager'];
  ops_readers text[] := ARRAY['owner','admin','manager','system'];
  everyone    text[] := ARRAY['owner','admin','manager','sales','support','agent','system','viewer','fusion_admin'];
BEGIN
  PERFORM app.tenant_policies('organizations', NULL, NULL, admins, NULL, 'id');
  PERFORM app.tenant_policies('roles', NULL, admins, admins, admins);
  PERFORM app.tenant_policies('permissions', NULL, admins, admins, admins);
  PERFORM app.tenant_policies('users', NULL, admins, ARRAY['owner','admin','system'], admins);
  PERFORM app.tenant_policies('integration_connections', ops_readers, admins, admins, admins);
  PERFORM app.tenant_policies('companies', NULL, all_writers, all_writers, admins);
  PERFORM app.tenant_policies('contacts', NULL, all_writers, all_writers, admins);
  PERFORM app.tenant_policies('pipelines', NULL, managers, managers, admins);
  PERFORM app.tenant_policies('leads', NULL, crm_writers, crm_writers, admins);
  PERFORM app.tenant_policies('deals', NULL, crm_writers, crm_writers, admins);
  PERFORM app.tenant_policies('activities', NULL, all_writers, NULL, NULL);                -- history is not edited
  PERFORM app.tenant_policies('tasks', NULL, all_writers, all_writers, admins);
  PERFORM app.tenant_policies('conversations', NULL, all_writers, all_writers, NULL);
  PERFORM app.tenant_policies('knowledge_items', NULL, managers, managers, admins);
  PERFORM app.tenant_policies('events', ops_readers, everyone, ARRAY['system'], NULL);
  PERFORM app.tenant_policies('event_consumptions', ops_readers, ARRAY['system'], NULL, NULL);
  PERFORM app.tenant_policies('manual_queue', ARRAY['owner','admin','manager','support','system'], everyone, ARRAY['owner','admin','manager','support','system'], NULL);
  PERFORM app.tenant_policies('idempotency_keys', NULL, everyone, NULL, NULL);
  PERFORM app.tenant_policies('approvals', NULL, everyone, ARRAY['owner','admin','fusion_admin','manager','system'], NULL);
  PERFORM app.tenant_policies('audit_logs', managers, everyone, NULL, NULL);               -- append-only
  PERFORM app.tenant_policies('workflow_runs', ops_readers, everyone, ARRAY['system'], NULL);
  PERFORM app.tenant_policies('agent_actions', ops_readers, everyone, NULL, NULL);
END $$;

-- Knowledge: non-managers only see APPROVED items that are visible to their role.
DROP POLICY knowledge_items_select ON knowledge_items;
CREATE POLICY knowledge_items_select ON knowledge_items FOR SELECT USING (
  organization_id = app.current_org_id()
  AND (app.has_role('owner','admin','manager') OR (approved AND (cardinality(visible_to) = 0 OR app.current_app_role() = ANY(visible_to))))
);

-- Grants for the application roles (RLS still decides which rows).
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['edg_app','authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('GRANT USAGE ON SCHEMA public, app TO %I', r);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', r);
      EXECUTE format('REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM %I', r);
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON organizations FROM %I', r);
      EXECUTE format('GRANT UPDATE ON organizations TO %I', r);
      EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO %I', r);
    END IF;
  END LOOP;
END $$;
