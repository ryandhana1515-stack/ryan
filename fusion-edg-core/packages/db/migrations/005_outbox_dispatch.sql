-- 005 · Outbox dispatch. Claiming pending events spans organisations, so it is ONE narrow SECURITY DEFINER function
-- (fixed search_path, returns only what the dispatcher needs). Handling and completing an event then happens inside
-- that event's own tenant context, under RLS.

CREATE OR REPLACE FUNCTION app.claim_events(batch_size integer, lock_seconds integer)
RETURNS TABLE (id uuid, organization_id uuid, type text, payload jsonb, correlation_id text, attempts integer)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE events e
     SET status = 'processing', attempts = e.attempts + 1, locked_until = now() + make_interval(secs => lock_seconds)
   WHERE e.id IN (
     SELECT x.id FROM events x
      WHERE (x.status = 'pending' AND x.next_attempt_at <= now())
         OR (x.status = 'processing' AND x.locked_until < now())      -- a crashed worker's claim expires
      ORDER BY x.next_attempt_at, x.created_at
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED)
  RETURNING e.id, e.organization_id, e.type, e.payload, e.correlation_id, e.attempts
$$;

REVOKE ALL ON FUNCTION app.claim_events(integer, integer) FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'edg_app') THEN GRANT EXECUTE ON FUNCTION app.claim_events(integer, integer) TO edg_app; END IF;
END $$;
