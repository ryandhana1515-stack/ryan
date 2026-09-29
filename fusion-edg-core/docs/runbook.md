# Runbook (development build; the staging/production sections apply once approved)

## Start locally
1. `pnpm install`
2. `pnpm db:local`: starts PostgreSQL 16, creates `edg_dev` and `edg_test`, and writes `.env.local`.
3. `pnpm db:reset`: resets the dev database, runs the migrations and loads FAKE seed data.
4. `pnpm dev`: starts the API (`http://localhost:8787`); the test form is at `/test-form`.
5. `pnpm test`: runs the tests. `node scripts/test-report.mjs` writes `docs/test-report.md`.

## Migrations
- Add a new file `packages/db/migrations/NNN_name.sql`. **Never edit an applied migration**: the migrator refuses
  changed checksums.
- Apply with `pnpm db:migrate`, using `DATABASE_URL` for the target environment.
- Staging/production: apply in staging first, run the QA gate, and get Ryan's approval (L4) before production.
- Rollback: write a forward "down" migration, or restore a backup (below). Test it in staging at least once (B13).

## Backup and restore (tried locally in the test suite)
- **Backup:** `pg_dump --format=custom --no-owner --file backups/<env>-<date>.dump "$DATABASE_URL"`
- **Restore into an EMPTY database:** `pg_restore --no-owner --exit-on-error --dbname "<target url>" <file>`
- **Check:**
  - The row counts of organizations, users, contacts, leads, deals and audit_logs match.
  - RLS is still forced on every table.
  - The test `backup + restore works` does exactly this.
- **Supabase:** also use the platform's daily backups/PITR. Store dumps encrypted, outside the repo (`backups/` is
  git-ignored).

## Manual queue (never lose an enquiry)
Items land in `manual_queue` with a `kind`:

| kind | What happened | What to do |
|---|---|---|
| `intake_failed` | The message is preserved in `conversations` (status `manual_queue`), but the lead was not created. | Read the reason, fix it, and re-run intake for that conversation, or create the lead by hand. |
| `message_send_failed` | The lead exists; the acknowledgement was not sent. | Payload has `to` and `text`: send it manually, or retry once the provider is back. |
| `dead_event` | An event failed `maxAttempts` times. | Fix the consumer, then `UPDATE events SET status='pending', attempts=0, next_attempt_at=now() WHERE id = …`. Consumers are idempotent, so this is safe. |
| `possible_duplicate` | Phone and email match two different contacts. | A human decides whether to merge; nothing is merged automatically. |

Resolve an item: `UPDATE manual_queue SET status='resolved', resolved_by=<user>, resolved_at=now() WHERE id=…`.
The resolution is audited through the app.

## Incident: messaging provider outage
1. Symptoms:
   - `message_send_failed` items grow.
   - Alerts of kind `message_send_failed` appear.
   - `whatsapp.send` audit rows have `result=failed`.
2. Nothing is lost: inbound messages and leads keep being created.
3. When the provider recovers, work the manual queue (oldest first). Tell each owner to reply personally.

## Incident: a tenant sees wrong data
1. Stop: take the API offline (L4 decision: Ryan).
2. Run `pnpm test` against a restored copy and check the `CRITICAL: cross-tenant` test.
3. Check whether any code path used `DATABASE_URL`/`service_role` in a request path, which bypasses RLS.

## Activating an n8n template for a client
See `workflows/README.md` (the per-client steps). Activation is an approved step.

## Rotating secrets
1. Create the new value in the secret manager.
2. Update the n8n credential.
3. Deploy.
4. Revoke the old value.
5. Record it in `OWNERSHIP_REGISTER.md` (per client).
