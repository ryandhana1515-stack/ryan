/**
 * Client demo (DEVELOPMENT, FAKE data, MOCK providers): `pnpm db:local && pnpm demo`
 * Resets the local dev database, then walks the whole chain and prints what happened at each step.
 */
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mockAdapters } from '@edg/core';
import { createPool, loadLocalEnv, migrate, requireEnv, resetDatabase, seed, DEMO } from '@edg/db';
import { CollectingAlertHook } from '@edg/events';
import { createRuntime } from '@edg/crm';
import { createHandler } from '../apps/api/src/app';

loadLocalEnv();
process.env.EDG_ENV = 'development';
const ownerPool = createPool(requireEnv('DATABASE_URL'));
const appPool = createPool(requireEnv('APP_DATABASE_URL'));
const KEY = 'demo-only-key';
const say = (s: string) => console.log(`\n\x1b[1m▶ ${s}\x1b[0m`);
const show = (x: unknown) => console.log(JSON.stringify(x, null, 2));

await resetDatabase(ownerPool); await migrate(ownerPool); await seed(ownerPool);
const adapters = mockAdapters();
const rt = createRuntime(appPool, { env: 'development', adapters, alerts: new CollectingAlertHook() });
const server = createServer(createHandler(rt, { webhookSecret: KEY }));
await new Promise<void>((r) => server.listen(0, r));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/o/acme-demo`;
const post = async (p: string, b: unknown, h: Record<string, string> = {}) => (await fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json', ...h }, body: JSON.stringify(b) })).json() as Promise<any>;
const q = async (sql: string, p: unknown[] = []) => (await ownerPool.query(sql, p)).rows;

try {
  say('1. A customer fills in the website form (phone typed as "9000 0123")');
  const form = await post('/leads', { name: 'Tan Wei Ming (FAKE)', phone: '9000 0123', email: 'WeiMing.Tan@Example.com', message: 'Do you do office fit-outs?' });
  show(form);
  const [lead] = await q(`SELECT l.status, u.name AS owner, l.next_action, l.next_action_at, c.phone_e164, c.email_normalized FROM leads l JOIN users u ON u.id = l.owner_id JOIN contacts c ON c.id = l.contact_id WHERE l.id = $1`, [form.lead_id]);
  say('   → the CRM now has one contact and one lead, owned, with the next action and its deadline'); show(lead);
  say('   → an acknowledgement DRAFT was prepared for the team (MOCK email)'); show(adapters.email.drafts.at(-1));

  say('2. The same person messages on WhatsApp from +65 9000 0123');
  const wa = await post('/webhooks/whatsapp/forwarded', { entry: [{ changes: [{ value: { contacts: [{ wa_id: '6590000123', profile: { name: 'Wei Ming' } }], messages: [{ from: '6590000123', id: 'wamid.DEMO.1', type: 'text', text: { body: 'Hi, following up on my form' } }] } }] }] }, { 'x-edg-key': KEY });
  show(wa.results[0]);
  say('   → no duplicate: same contact, same lead, enquiry count now 2, the owner is told to reply');
  show(await q(`SELECT enquiry_count, next_action FROM leads WHERE id = $1`, [form.lead_id]));

  say('3. WhatsApp sends the same webhook again (it does that): ignored');
  show((await post('/webhooks/whatsapp/forwarded', { entry: [{ changes: [{ value: { messages: [{ from: '6590000123', id: 'wamid.DEMO.1', type: 'text', text: { body: 'Hi, following up on my form' } }] } }] }] }, { 'x-edg-key': KEY })).results[0]);

  say('4. A new WhatsApp enquiry while the WhatsApp provider is DOWN');
  adapters.messaging.outage = true;
  const down = await post('/webhooks/whatsapp/forwarded', { entry: [{ changes: [{ value: { messages: [{ from: '6590000777', id: 'wamid.DEMO.2', type: 'text', text: { body: 'Price for a 3-room reno?' } }] } }] }] }, { 'x-edg-key': KEY });
  adapters.messaging.outage = false;
  show(down.results[0]);
  say('   → the enquiry and the lead are kept; the reply that could not be sent is in the manual queue');
  show(await q(`SELECT kind, reason FROM manual_queue`));

  say('5. A salesperson tries to re-assign a lead (not allowed) — then the manager does');
  show(await post('/leads/assign', { lead_id: form.lead_id }, { 'x-edg-dev-user': DEMO.usersA.sales1 }));
  show(await post('/leads/assign', { lead_id: form.lead_id }, { 'x-edg-dev-user': DEMO.usersA.manager }));

  say('6. The owners are notified (event outbox → notifier)');
  for (let i = 0; i < 5; i++) { const r = await post('/jobs/dispatch-events', {}, { 'x-edg-key': KEY }); if (!r.claimed) break; }
  console.log(`   ${adapters.email.drafts.length} email drafts prepared in total (MOCK)`);

  say('7. Next morning: the CEO Daily Brief (numbers come from the database; the AI only words them)');
  const brief = await post('/jobs/ceo-brief', {}, { 'x-edg-key': KEY });
  console.log('\n' + brief.text.replace(/^\[MOCK NARRATION\]\n/, ''));

  say('8. The audit trail (every action, who, result)');
  show(await q(`SELECT created_at::time(0) AS at, actor_id AS who, action, result FROM audit_logs ORDER BY created_at LIMIT 25`));
} finally {
  server.close(); await ownerPool.end(); await appPool.end();
}
