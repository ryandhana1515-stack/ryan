import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Backup + restore with the standard PostgreSQL tools (pg_dump custom format → pg_restore). The procedure is in
 * docs/runbook.md; the test suite runs it once end to end (backup edg_test → restore into a scratch database →
 * compare row counts). In Supabase projects, use the platform's managed backups/PITR as well.
 */
export function backup(databaseUrl: string, file: string): { file: string; bytes: number } {
  mkdirSync(dirname(file), { recursive: true });
  execFileSync('pg_dump', ['--format=custom', '--no-owner', '--file', file, databaseUrl], { stdio: 'pipe' });
  return { file, bytes: statSync(file).size };
}

export function restore(file: string, targetDatabaseUrl: string) {
  execFileSync('pg_restore', ['--no-owner', '--exit-on-error', '--dbname', targetDatabaseUrl, file], { stdio: 'pipe' });
}
