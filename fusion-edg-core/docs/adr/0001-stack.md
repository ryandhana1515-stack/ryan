# ADR-0001 · Stack

- **Date:** 2026-09-30
- **Approver:** Ryan ("Build all now"; he proposed this stack in the build prompt)
- **Status:** accepted for development

**Decision.** TypeScript (pnpm workspace) · PostgreSQL 16 (Supabase in staging/production: DB + Auth + RLS + Storage) ·
Zod 4 for schemas · Vitest 5 for tests · plain Node `http` for the API, so it runs locally, in a container, or wrapped as
a Vercel Function.

**Options considered.**
- An ORM: rejected. Plain SQL migrations keep RLS, triggers and views explicit and reviewable.
- An HTTP framework: rejected for now. There are four routes, and it would add a dependency and lock-in.

**Why.** It is low cost and portable to the client (B17). RLS is enforced by the database itself, and every piece is
replaceable behind an adapter.

**Versions.** The npm registry was checked on 2026-09-30: zod 4.6.5, vitest 5.0.2 (needs Node ≥ 22.12),
typescript 7.0.2, pg 8.23.0, tsx 4.23.15.
