import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DEMO, PgOutboxSink, withTenant, type Pool } from '@edg/db';
import { CollectingAlertHook, OutboxDispatcher, type Consumer } from '@edg/events';
import { closeDb, freshDb, HAS_DB } from '../../db/test/testdb';

const A = DEMO.orgA;

describe.skipIf(!HAS_DB)('B3 transactional outbox + dispatcher', () => {
  let owner: Pool, app: Pool;
  beforeAll(async () => ({ owner, app } = await freshDb()));
  afterAll(closeDb);
  beforeEach(async () => { await owner.query('DELETE FROM event_consumptions; DELETE FROM manual_queue; DELETE FROM events'); });

  const emitInTx = async (type: string, rollback = false) => {
    try {
      await withTenant(app, { organizationId: A, role: 'sales' }, async (c) => {
        await new PgOutboxSink(app, c).emit({ organizationId: A, type, payload: { n: 1 }, correlationId: 'corr-x' });
        if (rollback) throw new Error('business change failed');
      });
    } catch (e) { if (!rollback) throw e; }
  };

  it('an event is only published if the business transaction commits', async () => {
    await emitInTx('lead.created', true);
    expect((await owner.query('SELECT count(*)::int AS n FROM events')).rows[0].n).toBe(0);
    await emitInTx('lead.created');
    expect((await owner.query('SELECT count(*)::int AS n FROM events')).rows[0].n).toBe(1);
  });

  it('delivers once per consumer, even when the event is redelivered', async () => {
    let calls = 0;
    const consumer: Consumer = { name: 'counter', types: ['lead.created'], handle: async () => { calls++; } };
    const d = new OutboxDispatcher(app, [consumer], new CollectingAlertHook(), { baseDelayMs: 0 });
    await emitInTx('lead.created');
    expect(await d.runOnce()).toMatchObject({ claimed: 1, done: 1 });
    // simulate a redelivery (e.g. a worker crashed after handling but before marking done)
    await owner.query(`UPDATE events SET status = 'pending', next_attempt_at = now()`);
    expect(await d.runOnce()).toMatchObject({ claimed: 1, done: 1 });
    expect(calls).toBe(1);
  });

  it('retries with backoff, then dead-letters to the manual queue and alerts', async () => {
    const alerts = new CollectingAlertHook();
    const failing: Consumer = { name: 'always-fails', types: ['message.received'], handle: async () => { throw new Error('downstream outage'); } };
    const d = new OutboxDispatcher(app, [failing], alerts, { maxAttempts: 3, baseDelayMs: 60_000 });
    await emitInTx('message.received');
    expect(await d.runOnce()).toMatchObject({ retried: 1 });
    const after1 = (await owner.query(`SELECT status, attempts, next_attempt_at > now() + interval '50 seconds' AS backed_off, last_error FROM events`)).rows[0];
    expect(after1).toMatchObject({ status: 'pending', attempts: 1, backed_off: true });
    expect(after1.last_error).toMatch(/downstream outage/);
    for (let i = 0; i < 2; i++) { await owner.query(`UPDATE events SET next_attempt_at = now()`); await d.runOnce(); }
    expect((await owner.query('SELECT status, attempts FROM events')).rows[0]).toEqual({ status: 'dead', attempts: 3 });
    const mq = (await owner.query('SELECT kind, reason FROM manual_queue')).rows;
    expect(mq).toHaveLength(1);
    expect(mq[0].kind).toBe('dead_event');
    expect(alerts.alerts).toHaveLength(1);
  });

  it('a failed consumer does not re-run consumers that already succeeded', async () => {
    let good = 0; let bad = 0;
    const d = new OutboxDispatcher(app, [
      { name: 'good', types: ['*'], handle: async () => { good++; } },
      { name: 'flaky', types: ['*'], handle: async () => { if (++bad === 1) throw new Error('first try fails'); } },
    ], new CollectingAlertHook(), { baseDelayMs: 0 });
    await emitInTx('lead.assigned');
    await d.runOnce();
    await owner.query(`UPDATE events SET next_attempt_at = now()`);
    await d.runOnce();
    expect({ good, bad }).toEqual({ good: 1, bad: 2 });
    expect((await owner.query('SELECT status FROM events')).rows[0].status).toBe('done');
  });

  it('a crashed worker\'s claim expires and the event is picked up again', async () => {
    await emitInTx('lead.created');
    await owner.query(`UPDATE events SET status = 'processing', locked_until = now() - interval '1 second', attempts = 1`);
    const d = new OutboxDispatcher(app, [{ name: 'noop', types: ['*'], handle: async () => {} }], new CollectingAlertHook());
    expect(await d.runOnce()).toMatchObject({ claimed: 1, done: 1 });
  });
});
