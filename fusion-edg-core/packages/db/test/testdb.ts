import { createPool, loadLocalEnv, migrate, resetDatabase, seed, type Pool } from '@edg/db';

loadLocalEnv();
process.env.EDG_ENV = 'test';

export const HAS_DB = !!(process.env.TEST_DATABASE_URL && process.env.TEST_APP_DATABASE_URL);
if (!HAS_DB) console.warn('BLOCKED: TEST_DATABASE_URL / TEST_APP_DATABASE_URL not set. Run "pnpm db:local" to create the local test database.');

let owner: Pool | undefined;
let app: Pool | undefined;

/** Owner pool: migrations + seed only (bypasses RLS as superuser). App pool: the RLS-bound role the API uses. */
export async function freshDb(): Promise<{ owner: Pool; app: Pool }> {
  owner ??= createPool(process.env.TEST_DATABASE_URL!);
  app ??= createPool(process.env.TEST_APP_DATABASE_URL!, 10);
  await resetDatabase(owner);
  await migrate(owner);
  await seed(owner);
  return { owner, app };
}

export async function closeDb() {
  await owner?.end(); await app?.end();
  owner = undefined; app = undefined;
}
