import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

/** Loads .env.local (development only). Secrets are never hard-coded; the file is git-ignored. */
export function loadLocalEnv() {
  const f = fileURLToPath(new URL('../../../.env.local', import.meta.url));
  if (existsSync(f)) process.loadEnvFile(f);
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set. Development: run "pnpm db:local". Staging/production: set it in the platform's secret manager.`);
  return v;
}

export type Pool = pg.Pool;
export type Client = pg.PoolClient;
export const createPool = (url: string, max = 5) => new pg.Pool({ connectionString: url, max });

/** Who is acting, inside which organisation. Becomes the transaction-local settings RLS reads. */
export interface TenantContext {
  organizationId: string;
  userId?: string;
  role: string; // owner, admin, manager, sales, support, viewer, agent, system
  actorType?: 'user' | 'agent' | 'system';
}

/**
 * Run fn in ONE transaction with the tenant context set (set_config(..., true) = transaction-local, so a pooled
 * connection never leaks one tenant's context into the next request). Rolls back on any error.
 */
export async function withTenant<T>(pool: Pool, t: TenantContext, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query(
      `SELECT set_config('app.organization_id', $1, true), set_config('app.user_id', $2, true),
              set_config('app.app_role', $3, true), set_config('app.actor_type', $4, true)`,
      [t.organizationId, t.userId ?? '', t.role, t.actorType ?? 'user'],
    );
    const out = await fn(c);
    await c.query('COMMIT');
    return out;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
