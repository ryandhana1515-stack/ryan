import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Pool } from './client';

export const MIGRATIONS_DIR = fileURLToPath(new URL('../migrations/', import.meta.url));

/**
 * Applies version-controlled migrations in order, each in its own transaction, recording a checksum. Refuses to run
 * if an already-applied migration file was edited (no hand edits: add a new migration instead).
 */
export async function migrate(pool: Pool, dir = MIGRATIONS_DIR): Promise<string[]> {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS app;
    CREATE TABLE IF NOT EXISTS app.schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
  const applied = new Map((await pool.query<{ version: string; checksum: string }>('SELECT version, checksum FROM app.schema_migrations')).rows.map((r) => [r.version, r.checksum]));
  const files = readdirSync(dir).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
  const done: string[] = [];
  for (const f of files) {
    const sql = readFileSync(dir + f, 'utf8');
    const sum = createHash('sha256').update(sql).digest('hex');
    const prev = applied.get(f);
    if (prev) {
      if (prev !== sum) throw new Error(`migration ${f} was changed after it was applied; add a new migration instead`);
      continue;
    }
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      await c.query(sql);
      await c.query('INSERT INTO app.schema_migrations (version, checksum) VALUES ($1, $2)', [f, sum]);
      await c.query('COMMIT');
      done.push(f);
    } catch (e) {
      await c.query('ROLLBACK');
      throw new Error(`migration ${f} failed: ${(e as Error).message}`);
    } finally {
      c.release();
    }
  }
  return done;
}

/** DEVELOPMENT/TEST ONLY: drops everything. Refuses to run unless EDG_ENV is development or test. */
export async function resetDatabase(pool: Pool) {
  const env = process.env.EDG_ENV ?? 'development';
  if (!['development', 'test'].includes(env)) throw new Error(`refusing to reset a ${env} database`);
  const db = (await pool.query<{ d: string }>('SELECT current_database() AS d')).rows[0]!.d;
  if (!/^edg_(dev|test)/.test(db)) throw new Error(`refusing to reset database "${db}" (only edg_dev*/edg_test*)`);
  await pool.query('DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS app CASCADE; CREATE SCHEMA public;');
}

export async function schemaVersion(pool: Pool): Promise<string | null> {
  const r = await pool.query<{ version: string }>('SELECT version FROM app.schema_migrations ORDER BY version DESC LIMIT 1');
  return r.rows[0]?.version ?? null;
}
