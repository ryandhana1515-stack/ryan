# n8n workflow templates (EDG Core)

n8n is the **trigger and schedule layer only** (ADR-0004). Every template calls the EDG API, where the business rules,
permissions, idempotency, audit and events live and are tested. So a template is always:
trigger → `EDG Config` (API URL + org slug; no secrets) → HTTP call to the EDG API (3 tries, 2 s apart) → success, or a loud error path.

| Template | Trigger | Calls | Inputs | Error path | n8n TEST id (inactive) |
|---|---|---|---|---|---|
| `edg-lead-intake` | Webhook `POST /webhook/edg/lead-intake` | `POST /api/o/{org}/leads` | lead JSON (name, phone, email, message, source, utm) | responds **503** so the sender retries; nothing is acknowledged that EDG did not store | `OfRiSg9DvNrP00gK` |
| `edg-whatsapp-intake` | Webhook `POST /webhook/edg/whatsapp` | `POST /api/o/{org}/webhooks/whatsapp/forwarded` | provider payload (WhatsApp Cloud API shape) | **503**: the provider redelivers; EDG dedupes by message id | `QHv9xC6XOwgeFllT` |
| `edg-email-intake` | IMAP poll (INBOX) | `POST /api/o/{org}/email-intake` | from, subject, text, message_id | Stop and Error; the email stays unread (`postProcessAction: nothing`), EDG dedupes by message id | `5CIX7VRWxhqHqLop` |
| `edg-lead-deduplication` | Sub-workflow (`phone`, `email`) | `POST /api/o/{org}/dedupe-check` | phone, email | Stop and Error | `UxSoMCyWBKFn6Dg4` |
| `edg-lead-assignment` | Sub-workflow (`lead_id`) | `POST /api/o/{org}/leads/assign` | lead_id | Stop and Error | `hYk0TeY7sSysI1UF` |
| `edg-follow-up` | Every 15 min | `POST /api/o/{org}/jobs/follow-ups` | — | Stop and Error (the n8n error workflow alerts) | `DJAAhtxmfL1EQWng` |
| `edg-ceo-daily-brief` | Cron `0 8 * * 1-5` | `POST /api/o/{org}/jobs/ceo-brief` | — | Stop and Error | `oTRAqZs82LBz1PXf` |
| `edg-outbox-dispatcher` | Every minute | `POST /api/o/{org}/jobs/dispatch-events` | — | Stop and Error | `zZc2QsjZ5e1zcev7` |

All eight were created in Ryan's n8n on 2026-09-30, in the folder **EDG Core — TEST templates (inactive)**. They are
**inactive** and point at `https://edg-api.example.invalid`, so nothing can fire.

## Files
- `generate.mjs` → `sdk/*.sdk.js`: the n8n Workflow SDK source (edit `generate.mjs`, never the n8n canvas).
- `export-json.mjs` → `n8n/*.json`: import-ready JSON, compiled with the official `@n8n/workflow-sdk` parser (stable node ids).
- Regenerate: `node workflows/generate.mjs && node workflows/export-json.mjs`.

## Per client (before activation; activation is an approved step)
1. Duplicate the templates into the client's n8n project.
2. Set `EDG Config` → `edg_api_url` (the client's EDG API) and `org` (the client's slug).
3. Create the credential **EDG API key (X-EDG-Key)**: type *Custom Auth (templated)* with the header template
   `{"headers":{"X-EDG-Key":"{{api_key}}"}}`. The value is the client's `EDG_WEBHOOK_SECRET` from the secret manager.
   Nobody pastes it into chat.
4. Email intake: create the IMAP credential for the client's enquiries mailbox.
5. CEO brief: set the workflow's timezone (Settings → Timezone) to the client's, for example Asia/Singapore.
6. Set an **error workflow** that alerts the client's operations channel.
7. Test with FAKE data on the test URLs, then request approval to activate.

## Env var names the API side needs
`DATABASE_URL`, `APP_DATABASE_URL`, `EDG_WEBHOOK_SECRET`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, plus the provider
keys in `.env.example`.

## Production note
An every-minute n8n schedule is about 43,200 executions a month; n8n Cloud Starter includes 2,500 (checked 2026-09-30).
In production, run the outbox dispatcher and the follow-up runner from the API's own scheduler (for example Vercel Cron
or Supabase `pg_cron`), and keep n8n for intake webhooks, IMAP and the daily brief. See `docs/adr/0004`.
The dispatch job is platform-wide: one call processes every tenant's events, each inside that tenant's RLS context.
