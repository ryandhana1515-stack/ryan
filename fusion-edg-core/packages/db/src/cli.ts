import { createPool, loadLocalEnv, requireEnv } from './client';
import { migrate, resetDatabase, schemaVersion } from './migrate';
import { seed } from './seed';

loadLocalEnv();
const cmd = process.argv[2];
const pool = createPool(requireEnv('DATABASE_URL'));
try {
  if (cmd === 'migrate') console.log('applied:', await migrate(pool), 'version:', await schemaVersion(pool));
  else if (cmd === 'seed') { await seed(pool); console.log('seeded FAKE demo data'); }
  else if (cmd === 'reset') { await resetDatabase(pool); console.log('applied:', await migrate(pool)); await seed(pool); console.log('reset + migrated + seeded (FAKE data)'); }
  else { console.error('usage: cli.ts migrate|seed|reset'); process.exitCode = 1; }
} finally {
  await pool.end();
}
