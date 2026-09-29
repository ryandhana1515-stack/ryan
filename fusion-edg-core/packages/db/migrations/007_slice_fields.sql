-- 007 · Fields the first vertical slice needs.
-- conversations.automated: an automatic acknowledgement is not a human answer, so it does not clear "unanswered".
-- tasks.reminded_at: the follow-up runner reminds the owner once per task, not every 15 minutes.
ALTER TABLE conversations ADD COLUMN automated boolean NOT NULL DEFAULT false;
ALTER TABLE tasks ADD COLUMN reminded_at timestamptz;

CREATE OR REPLACE VIEW kpi_unanswered_leads WITH (security_invoker = true) AS
SELECT l.organization_id, l.id AS lead_id, l.owner_id, l.created_at, l.next_action_at
  FROM leads l
 WHERE l.deleted_at IS NULL AND l.status IN ('new','contacted','qualified','nurturing')
   AND NOT EXISTS (SELECT 1 FROM conversations c WHERE c.organization_id = l.organization_id AND c.lead_id = l.id
                    AND c.direction = 'outbound' AND c.status = 'sent' AND NOT c.automated);
