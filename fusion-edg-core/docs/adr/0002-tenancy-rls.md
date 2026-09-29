# ADR-0002 · Tenancy: organization_id + forced RLS + server-side authorisation

- **Date:** 2026-09-30
- **Status:** accepted

**Decision.**
- Every tenant-owned row has `organization_id`.
- RLS is ENABLED and FORCED on every table in `public`.
- Policies read the tenant from the verified JWT claim (Supabase `request.jwt.claims.organization_id`, `app_role`) or,
  for server code, from transaction-local settings (`set_config(..., true)`).
- No context means no rows.
- Role checks live in the policies (read / insert / update / delete per role) **and** in server code (`authorize()`,
  `checkPermission()`) before any database call.
- Cross-org operations (the outbox claim, slug → org lookup) are single, narrow `SECURITY DEFINER` functions with a
  fixed `search_path`.

**Tests.** `packages/db/test/tenancy.test.ts`, including the critical cross-tenant read/write/update/delete test. The API
test also checks cross-tenant access through the HTTP layer.

**Stronger isolation.** A client that needs it gets a dedicated database/project, with the same migrations (B9).
