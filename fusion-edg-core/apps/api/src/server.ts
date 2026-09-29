import { createServer } from 'node:http';
import { createPool, loadLocalEnv, requireEnv } from '@edg/db';
import { createRuntime } from '@edg/crm';
import { createHandler } from './app';

loadLocalEnv();
const env = (process.env.EDG_ENV ?? 'development') as 'development';
if (env !== 'development') throw new Error('This entry point is the DEVELOPMENT server. Staging/production deploys need Ryan\'s approval (L3/L4) and real adapters.');
const pool = createPool(requireEnv('APP_DATABASE_URL'));
const rt = createRuntime(pool, { env });
const handler = createHandler(rt, {
  webhookSecret: process.env.EDG_WEBHOOK_SECRET,
  whatsappAppSecret: process.env.WHATSAPP_APP_SECRET,
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
});
const port = Number(process.env.PORT ?? 8787);
createServer(handler).listen(port, () => {
  console.log(`EDG API (DEVELOPMENT, MOCK adapters) on http://localhost:${port}`);
  console.log(`  test form: http://localhost:${port}/test-form`);
  if (!process.env.EDG_WEBHOOK_SECRET) console.log('  WARNING: EDG_WEBHOOK_SECRET not set: keyed endpoints (n8n, jobs) will answer 401.');
});
