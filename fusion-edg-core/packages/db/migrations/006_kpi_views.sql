-- 006 · KPI views (B10) + organisation lookup for public endpoints.
-- Views use security_invoker, so Row Level Security of the CALLER applies: a KPI can never count another tenant's rows.
-- KPI values come ONLY from these queries; the LLM narrates the computed JSON and never produces numbers.

-- Public endpoints know only the org slug. This narrow definer function maps slug → id and nothing else.
CREATE OR REPLACE FUNCTION app.org_id_by_slug(p_slug text) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT id FROM organizations WHERE slug = p_slug AND deleted_at IS NULL
$$;
REVOKE ALL ON FUNCTION app.org_id_by_slug(text) FROM PUBLIC;

-- Leads created per local day and channel.
CREATE VIEW kpi_leads_by_day WITH (security_invoker = true) AS
SELECT l.organization_id,
       (l.created_at AT TIME ZONE o.timezone)::date AS day,
       count(*)::int AS new_leads,
       count(*) FILTER (WHERE l.channel = 'whatsapp')::int AS whatsapp,
       count(*) FILTER (WHERE l.channel = 'website_form')::int AS website_form,
       count(*) FILTER (WHERE l.channel = 'email')::int AS email
  FROM leads l JOIN organizations o ON o.id = l.organization_id
 WHERE l.deleted_at IS NULL
 GROUP BY 1, 2;

-- Unanswered = active lead with no outbound message SENT after it was created.
CREATE VIEW kpi_unanswered_leads WITH (security_invoker = true) AS
SELECT l.organization_id, l.id AS lead_id, l.owner_id, l.created_at, l.next_action_at
  FROM leads l
 WHERE l.deleted_at IS NULL AND l.status IN ('new','contacted','qualified','nurturing')
   AND NOT EXISTS (SELECT 1 FROM conversations c WHERE c.organization_id = l.organization_id AND c.lead_id = l.id
                    AND c.direction = 'outbound' AND c.status = 'sent');

-- Overdue follow-ups = open follow-up tasks past due.
CREATE VIEW kpi_overdue_followups WITH (security_invoker = true) AS
SELECT t.organization_id, t.id AS task_id, t.lead_id, t.assignee_id, t.due_at
  FROM tasks t WHERE t.status = 'open' AND t.due_at < now();

-- Open pipeline.
CREATE VIEW kpi_pipeline WITH (security_invoker = true) AS
SELECT d.organization_id, count(*)::int AS open_deals, COALESCE(sum(d.value_cents), 0)::bigint AS pipeline_value_cents
  FROM deals d WHERE d.status = 'open' AND d.deleted_at IS NULL GROUP BY 1;

-- Work waiting on a human.
CREATE VIEW kpi_manual_queue WITH (security_invoker = true) AS
SELECT organization_id, count(*)::int AS open_items FROM manual_queue WHERE status <> 'resolved' GROUP BY 1;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'edg_app') THEN
    GRANT EXECUTE ON FUNCTION app.org_id_by_slug(text) TO edg_app;
    GRANT SELECT ON kpi_leads_by_day, kpi_unanswered_leads, kpi_overdue_followups, kpi_pipeline, kpi_manual_queue TO edg_app;
  END IF;
END $$;
