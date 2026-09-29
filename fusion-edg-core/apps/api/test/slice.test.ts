import { createHmac } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mockAdapters, type LLMAdapter } from '@edg/core';
import { DEMO, withTenant, type Pool } from '@edg/db';
import { CollectingAlertHook } from '@edg/events';
import { createRuntime, generateCeoBrief, processDueFollowUps, type Runtime } from '@edg/crm';
import { createHandler } from '../src/app';
import { closeDb, freshDb, HAS_DB } from '../../../packages/db/test/testdb';

const KEY = 'test-only-webhook-secret-not-a-real-credential';
const APP_SECRET = 'test-only-whatsapp-app-secret';
const A = DEMO.orgA, B = DEMO.orgB;

/** A WhatsApp Cloud API webhook payload (shape per Meta's docs), FAKE data. */
const wa = (from: string, id: string, text: string, name = 'WA Customer (FAKE)') => ({
  object: 'whatsapp_business_account',
  entry: [{ id: 'waba-fake', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp', metadata: { display_phone_number: '6500000000', phone_number_id: 'fake' },
    contacts: [{ profile: { name }, wa_id: from }], messages: [{ from, id, timestamp: '1759200000', type: 'text', text: { body: text } }] } }] }],
});

describe.skipIf(!HAS_DB)('Part C — vertical slice: lead → CRM → follow-up → CEO brief (DEVELOPMENT, MOCK adapters)', () => {
  let owner: Pool, app: Pool, server: Server, base: string, rt: Runtime;
  const adapters = mockAdapters();
  const alerts = new CollectingAlertHook();

  beforeAll(async () => {
    ({ owner, app } = await freshDb());
    rt = createRuntime(app, { env: 'test', adapters, alerts });
    server = createServer(createHandler(rt, { webhookSecret: KEY, whatsappAppSecret: APP_SECRET, whatsappVerifyToken: 'verify-me', publicFormRatePerMinute: 100 }));
    await new Promise<void>((r) => server.listen(0, r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(async () => { server?.close(); await closeDb(); });

  const post = async (path: string, body: unknown, headers: Record<string, string> = {}) => {
    const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
    return { status: r.status, json: await r.json() as any };
  };
  const keyed = { 'x-edg-key': KEY };
  const q = async (sql: string, p: unknown[] = []) => (await owner.query(sql, p)).rows;

  let formLead: string;

  it('NEW LEAD: website form → contact (+65 normalised, email lower-case) → lead with owner, next action + date → follow-up → events + audit → ack draft', async () => {
    const r = await post('/api/o/acme-demo/leads', { name: 'Form Customer (FAKE)', phone: '9000 0123', email: 'Form.Customer@Example.COM', message: 'Please call me', utm: { utm_source: 'test' } });
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({ ok: true, status: 'created', duplicate: false });
    formLead = r.json.lead_id;
    const [lead] = await q(`SELECT l.*, c.phone_e164, c.email_normalized FROM leads l JOIN contacts c ON c.id = l.contact_id WHERE l.id = $1`, [formLead]);
    expect(lead).toMatchObject({ phone_e164: '+6590000123', email_normalized: 'form.customer@example.com', status: 'new', next_action: 'First response: acknowledge and qualify' });
    expect([DEMO.usersA.sales1, DEMO.usersA.sales2]).toContain(lead.owner_id);
    expect(lead.next_action_at.getTime()).toBeGreaterThan(Date.now());
    expect(await q(`SELECT kind, title FROM tasks WHERE lead_id = $1`, [formLead])).toEqual([{ kind: 'follow_up', title: 'Follow up if no reply' }]);
    const types = (await q(`SELECT type FROM events WHERE payload->>'lead_id' = $1 ORDER BY created_at`, [formLead])).map((e) => e.type);
    expect(types).toEqual(expect.arrayContaining(['lead.created', 'lead.assigned', 'message.received', 'follow_up.scheduled']));
    const audit = await q(`SELECT action, result FROM audit_logs WHERE organization_id = $1 ORDER BY created_at`, [A]);
    expect(audit).toEqual(expect.arrayContaining([{ action: 'lead.created', result: 'success' }, { action: 'email.createDraft', result: 'success' }]));
    expect(adapters.email.drafts).toHaveLength(1);
    expect(await q(`SELECT status, automated FROM conversations WHERE lead_id = $1 AND direction = 'outbound'`, [formLead])).toEqual([{ status: 'draft', automated: true }]);
  });

  it('round-robin: the next new lead goes to the other salesperson', async () => {
    const r = await post('/api/o/acme-demo/leads', { name: 'Second (FAKE)', email: 'second@example.com' });
    const owners = await q(`SELECT owner_id FROM leads WHERE id = ANY($1)`, [[formLead, r.json.lead_id]]);
    expect(new Set(owners.map((o) => o.owner_id)).size).toBe(2);
  });

  it('DUPLICATE LEAD: same phone via WhatsApp (+65 9000 0123 vs "9000 0123") lands on the same contact and open lead, no new owner, no second auto-reply', async () => {
    const r = await post('/api/o/acme-demo/webhooks/whatsapp/forwarded', wa('6590000123', 'wamid.FAKE.dup1', 'Hi, any update?'), keyed);
    expect(r.status).toBe(200);
    expect(r.json.results[0]).toMatchObject({ status: 'repeat_enquiry', leadId: formLead, ack: 'not_sent_repeat' });
    const [lead] = await q(`SELECT enquiry_count, next_action FROM leads WHERE id = $1`, [formLead]);
    expect(lead).toEqual({ enquiry_count: 2, next_action: 'Reply to repeat enquiry' });
    expect(await q(`SELECT count(*)::int AS n FROM contacts WHERE phone_e164 = '+6590000123'`)).toEqual([{ n: 1 }]);
    expect(await q(`SELECT count(*)::int AS n FROM leads WHERE contact_id = (SELECT contact_id FROM leads WHERE id = $1)`, [formLead])).toEqual([{ n: 1 }]);
    expect(adapters.messaging.sent).toHaveLength(0);
  });

  it('DUPLICATE WEBHOOK: the same WhatsApp message id delivered twice is processed once', async () => {
    const payload = wa('6590000456', 'wamid.FAKE.same', 'Hello (FAKE)');
    const first = await post('/api/o/acme-demo/webhooks/whatsapp/forwarded', payload, keyed);
    const second = await post('/api/o/acme-demo/webhooks/whatsapp/forwarded', payload, keyed);
    expect(first.json.results[0]).toMatchObject({ status: 'created', ack: 'sent' });
    expect(second.json.results[0]).toMatchObject({ status: 'duplicate_webhook', leadId: first.json.results[0].leadId });
    expect(await q(`SELECT count(*)::int AS n FROM conversations WHERE external_id = 'wamid.FAKE.same'`)).toEqual([{ n: 1 }]);
    expect(adapters.messaging.sent).toHaveLength(1);
    expect(await q(`SELECT result FROM audit_logs WHERE resource LIKE 'conversation:%' AND result = 'duplicate'`)).toHaveLength(1);
  });

  it('MESSAGING OUTAGE: the enquiry and lead are kept, the failed acknowledgement goes to the manual queue with an alert', async () => {
    adapters.messaging.outage = true;
    try {
      const r = await post('/api/o/acme-demo/webhooks/whatsapp/forwarded', wa('6590000789', 'wamid.FAKE.outage', 'Is anyone there? (FAKE)'), keyed);
      expect(r.status).toBe(200);
      const res = r.json.results[0];
      expect(res).toMatchObject({ status: 'created', ack: 'manual_queue' });
      expect(await q(`SELECT direction, status FROM conversations WHERE lead_id = $1 ORDER BY direction`, [res.leadId])).toEqual([
        { direction: 'inbound', status: 'processed' }, { direction: 'outbound', status: 'failed' }]);
      const mq = await q(`SELECT kind, reason FROM manual_queue WHERE reference_id = $1`, [res.leadId]);
      expect(mq).toHaveLength(1);
      expect(mq[0].kind).toBe('message_send_failed');
      expect(mq[0].reason).toMatch(/simulated outage/);
      expect(alerts.alerts.some((a) => a.kind === 'message_send_failed' && a.reference === res.leadId)).toBe(true);
      expect((await q(`SELECT result, error FROM audit_logs WHERE action = 'whatsapp.send' AND result = 'failed'`))[0].error).toMatch(/simulated outage/);
    } finally { adapters.messaging.outage = false; }
  });

  it('PERMISSION DENIED: viewer and sales cannot re-assign a lead; a manager can', async () => {
    const as = (u: string) => ({ 'x-edg-dev-user': u });
    expect((await post('/api/o/acme-demo/leads/assign', { lead_id: formLead }, as(DEMO.usersA.viewer))).status).toBe(403);
    expect((await post('/api/o/acme-demo/leads/assign', { lead_id: formLead }, as(DEMO.usersA.sales1))).status).toBe(403);
    expect(await q(`SELECT actor_id, result FROM audit_logs WHERE action = 'api.leads/assign' ORDER BY created_at`)).toEqual([
      { actor_id: DEMO.usersA.viewer, result: 'blocked' }, { actor_id: DEMO.usersA.sales1, result: 'blocked' }]);
    const before = (await q(`SELECT owner_id FROM leads WHERE id = $1`, [formLead]))[0].owner_id;
    const ok = await post('/api/o/acme-demo/leads/assign', { lead_id: formLead }, as(DEMO.usersA.manager));
    expect(ok.status).toBe(200);
    expect(ok.json.ownerId).not.toBe(before);
    expect((await q(`SELECT actor_id, action FROM audit_logs WHERE action = 'lead.assign'`))).toEqual([{ actor_id: DEMO.usersA.manager, action: 'lead.assign' }]);
  });

  it('CROSS-TENANT BLOCKED: Acme cannot touch Beta\'s lead, Beta\'s user cannot act in Acme, KPIs never count Beta', async () => {
    const betaLead = '0000000b-0000-4000-8000-0000000000d1';
    expect((await post('/api/o/acme-demo/leads/assign', { lead_id: betaLead }, keyed)).status).toBe(404);
    expect((await post('/api/o/acme-demo/leads/assign', { lead_id: formLead }, { 'x-edg-dev-user': DEMO.usersB.owner })).status).toBe(401);
    expect((await q(`SELECT owner_id FROM leads WHERE id = $1`, [betaLead]))[0].owner_id).toBe(DEMO.usersB.sales1);
    const dup = await post('/api/o/acme-demo/dedupe-check', { phone: '+6590000002' }, keyed); // Beta's customer's phone
    expect(dup.json.duplicate).toBe(false);
    const kA = await post('/api/o/beta-demo/kpis', {}, keyed);
    expect(kA.json.kpis.find((k: any) => k.key === 'unanswered_leads').value).toBe(1); // only Beta's own seeded lead
  });

  it('OPT-OUT RESPECTED: STOP cancels follow-ups; later enquiries get no automatic message and no follow-up task', async () => {
    const first = await post('/api/o/acme-demo/webhooks/whatsapp/forwarded', wa('6590000555', 'wamid.FAKE.opt1', 'Interested (FAKE)'), keyed);
    const leadId = first.json.results[0].leadId;
    const sentBefore = adapters.messaging.sent.length;
    const stop = await post('/api/o/acme-demo/webhooks/whatsapp/forwarded', wa('6590000555', 'wamid.FAKE.opt2', 'STOP'), keyed);
    expect(stop.json.results[0]).toMatchObject({ status: 'opted_out' });
    expect(await q(`SELECT status FROM tasks WHERE lead_id = $1`, [leadId])).toEqual([{ status: 'skipped_opt_out' }]);
    // a human closes the lead, the customer writes again later: new lead, but nothing automatic goes out
    await withTenant(app, { organizationId: A, role: 'sales', actorType: 'user', userId: DEMO.usersA.sales1 }, (c) => c.query(`UPDATE leads SET status = 'lost' WHERE id = $1`, [leadId]));
    const again = await post('/api/o/acme-demo/webhooks/whatsapp/forwarded', wa('6590000555', 'wamid.FAKE.opt3', 'Actually one question (FAKE)'), keyed);
    expect(again.json.results[0]).toMatchObject({ status: 'created', ack: 'skipped_opt_out' });
    expect(adapters.messaging.sent.length).toBe(sentBefore);
    expect(await q(`SELECT count(*)::int AS n FROM tasks WHERE lead_id = $1`, [again.json.results[0].leadId])).toEqual([{ n: 0 }]);
  });

  it('FOLLOW-UP: due follow-ups remind the owner once; opted-out contacts are skipped', async () => {
    const later = createRuntime(app, { env: 'test', adapters, alerts, now: () => new Date(Date.now() + 25 * 3600_000) });
    const r1 = await processDueFollowUps(later, A, 'corr-fu-1');
    expect(r1.reminded).toBeGreaterThanOrEqual(3);
    expect((await processDueFollowUps(later, A, 'corr-fu-2')).reminded).toBe(0);
  });

  it('EVENTS: the outbox dispatcher delivers owner notifications once', async () => {
    const drafts = adapters.email.drafts.length;
    // Drain the outbox (the notifier's own tool calls emit tool.executed events, which are drained too).
    for (let i = 0; i < 20; i++) {
      const r = await post('/api/o/acme-demo/jobs/dispatch-events', {}, keyed);
      expect(r.json.dead).toBe(0);
      if (r.json.claimed === 0) break;
    }
    const notified = adapters.email.drafts.length - drafts;
    const expected = (await q(`SELECT count(*)::int AS n FROM events WHERE organization_id = $1 AND type IN ('lead.assigned','follow_up.due')`, [A]))[0].n;
    expect(notified).toBe(expected);
    expect(await q(`SELECT count(*)::int AS n FROM events WHERE status <> 'done'`)).toEqual([{ n: 0 }]);
    // Redelivery (e.g. a crash before 'done' was written): consumers are idempotent, nobody is notified twice.
    await owner.query(`UPDATE events SET status = 'pending', next_attempt_at = now() WHERE type IN ('lead.assigned','follow_up.due')`);
    const again = await post('/api/o/acme-demo/jobs/dispatch-events', {}, keyed);
    expect(again.json.claimed).toBe(expected);
    expect(adapters.email.drafts.length - drafts).toBe(notified);
  });

  it('CEO BRIEF: KPIs by query, narrated from JSON only; accounting not connected → "data unavailable"', async () => {
    const r = await post('/api/o/acme-demo/jobs/ceo-brief', {}, keyed);
    expect(r.status).toBe(200);
    expect(r.json.text).toMatch(/GOOD MORNING/);
    expect(r.json.text).toMatch(/YESTERDAY/);
    expect(r.json.text).toMatch(/TODAY'S PRIORITIES/);
    expect(r.json.text).toMatch(/Sales \/ revenue: data unavailable/);
    expect(r.json.delivery).toBe('email_draft');
    const today = (await q(`SELECT (now() AT TIME ZONE 'Asia/Singapore')::date::text AS d`))[0].d;
    const b = await generateCeoBrief(rt, A, { correlationId: 'corr-brief', day: today });
    const newLeads = b.snapshot.kpis.find((k) => k.key === 'new_leads')!;
    const actual = (await q(`SELECT count(*)::int AS n FROM leads WHERE organization_id = $1 AND (created_at AT TIME ZONE 'Asia/Singapore')::date = $2::date`, [A, today]))[0].n;
    expect(newLeads.value).toBe(actual);
    expect(await q(`SELECT agent, model_tier FROM agent_actions LIMIT 1`)).toEqual([{ agent: 'ceo-intelligence', model_tier: 'standard' }]);
  });

  it('CEO BRIEF: when the CRM source is down the brief says "data unavailable" instead of numbers', async () => {
    const b = await generateCeoBrief(rt, A, { correlationId: 'corr-down', sources: { crm_db: 'down' } });
    expect(b.text).toMatch(/New leads: data unavailable/);
    expect(b.text).toMatch(/Overdue follow-ups: data unavailable/);
    expect(b.snapshot.exceptions).toContain('source_unavailable:crm_db');
  });

  it('CEO BRIEF: an LLM that invents a number is rejected and the computed brief is used', async () => {
    const liar: LLMAdapter = { provider: 'mock:liar', mode: 'MOCK', complete: async () => ({ text: 'GOOD MORNING. You had 4,217 new leads yesterday!', inputTokens: 1, outputTokens: 1 }) };
    const rtLiar = createRuntime(app, { env: 'test', adapters: { ...adapters, llm: liar }, alerts });
    const b = await generateCeoBrief(rtLiar, A, { correlationId: 'corr-liar' });
    expect(b.guardRejected).toBe(true);
    expect(b.narratedBy).toBe('template');
    expect(b.text).not.toMatch(/4,217/);
  });

  it('WhatsApp direct webhook: verification challenge, and unsigned/badly-signed payloads are refused', async () => {
    const v = await fetch(`${base}/api/o/acme-demo/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345`);
    expect(await v.text()).toBe('12345');
    const body = JSON.stringify(wa('6590000999', 'wamid.FAKE.sig', 'signed (FAKE)'));
    const bad = await fetch(`${base}/api/o/acme-demo/webhooks/whatsapp`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-signature-256': 'sha256=' + '0'.repeat(64) }, body });
    expect(bad.status).toBe(401);
    const sig = 'sha256=' + createHmac('sha256', APP_SECRET).update(body).digest('hex');
    const good = await fetch(`${base}/api/o/acme-demo/webhooks/whatsapp`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-signature-256': sig }, body });
    expect(good.status).toBe(200);
    expect((await good.json() as any).results[0].status).toBe('created');
  });

  it('public form: honeypot is silently ignored, keyed endpoints need the key, bad input is a 400', async () => {
    const leadsBefore = (await q(`SELECT count(*)::int AS n FROM leads`))[0].n;
    expect((await post('/api/o/acme-demo/leads', { name: 'Bot', email: 'bot@example.com', website: 'http://spam.invalid' })).status).toBe(200);
    expect((await q(`SELECT count(*)::int AS n FROM leads`))[0].n).toBe(leadsBefore);
    expect((await post('/api/o/acme-demo/jobs/ceo-brief', {})).status).toBe(401);
    expect((await post('/api/o/acme-demo/jobs/ceo-brief', {}, { 'x-edg-key': 'wrong' })).status).toBe(401);
    expect((await post('/api/o/acme-demo/leads', { name: 'No contact (FAKE)' })).status).toBe(400);
  });
});
