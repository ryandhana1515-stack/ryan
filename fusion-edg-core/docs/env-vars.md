# Environment variables (names only)

- **Where values live.**
  - Development: `.env.local` (git-ignored; `pnpm db:local` writes the database ones with random passwords).
  - Staging/production: the platform's secret manager (Vercel project env, Supabase secrets, n8n credentials).
- **Never.** Values never go in chat, git, notes, logs, CRM fields or handover ZIPs.
- **Rotation.** Separate values per environment; rotate them on handover.

| Name | Used by | Environment | Notes |
|---|---|---|---|
| `DATABASE_URL` | migrations, seed, backup | all | migration owner role; never used by the API at runtime |
| `APP_DATABASE_URL` | API, workers | all | the `edg_app` role: NO BYPASSRLS |
| `TEST_DATABASE_URL`, `TEST_APP_DATABASE_URL` | tests | dev/CI | local test database only |
| `EDG_ENV` | everything | all | `development` · `test` · `staging` · `production` |
| `EDG_WEBHOOK_SECRET` | API ↔ n8n (`X-EDG-Key`) | per env (per client in production) | also stored as the n8n credential "EDG API key (X-EDG-Key)" |
| `WHATSAPP_APP_SECRET` | webhook signature check | staging/prod | Meta app secret |
| `WHATSAPP_VERIFY_TOKEN` | webhook verification | staging/prod | chosen by us, entered in the Meta dashboard |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | messaging adapter | staging/prod | per client |
| `RESPOND_IO_TOKEN` | messaging adapter (if Respond.io) | staging/prod | per client |
| `EMAIL_PROVIDER_API_KEY` | email adapter | staging/prod | |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | LLM adapter | staging/prod | model routing per B14 |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | frontend/auth | staging/prod | anon key is public by design; RLS protects data |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | staging/prod | **never in a browser**; bypasses RLS, so avoid it in request paths |
| `N8N_BASE_URL`, `N8N_API_KEY` | automation adapter | staging/prod | |
| `VERCEL_TOKEN` | deployment adapter | CI only | |
| `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET` | accounting adapter | staging/prod | only if the client uses Xero (OAuth connect flow preferred) |
| `PORT` | dev API | dev | default 8787 |
