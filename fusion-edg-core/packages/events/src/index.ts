import { withTenant, type Client, type Pool } from '@edg/db';

/**
 * Transactional outbox dispatcher (B3/B11). Events are written in the same transaction as the business change
 * (PgOutboxSink). This dispatcher claims them, runs every subscribed consumer ONCE per event (event_consumptions),
 * retries failures with exponential backoff, and after maxAttempts moves the event to 'dead', opens a manual-queue
 * item and fires the alert hook. Nothing is dropped silently.
 */
export interface OutboxEvent { id: string; organizationId: string; type: string; payload: any; correlationId: string; attempts: number }

export interface Consumer {
  name: string;
  /** Event types this consumer handles ('*' = all). */
  types: string[];
  /** Runs inside the event's tenant transaction (role=system). Throw to fail. */
  handle: (e: OutboxEvent, c: Client) => Promise<void>;
}

export interface Alert { organizationId: string; kind: string; message: string; reference?: string }
export interface AlertHook { alert(a: Alert): Promise<void> }
export class CollectingAlertHook implements AlertHook {
  alerts: Alert[] = [];
  async alert(a: Alert) { this.alerts.push(a); console.warn(`[ALERT] ${a.kind}: ${a.message}`); }
}

export interface DispatcherOptions {
  batchSize?: number;
  lockSeconds?: number;
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export function backoffMs(attempt: number, base = 30_000, max = 3_600_000): number {
  return Math.min(max, base * 2 ** Math.max(0, attempt - 1));
}

export class OutboxDispatcher {
  private o: Required<DispatcherOptions>;
  constructor(private pool: Pool, private consumers: Consumer[], private alerts: AlertHook, opts: DispatcherOptions = {}) {
    this.o = { batchSize: 50, lockSeconds: 60, maxAttempts: 5, baseDelayMs: 30_000, maxDelayMs: 3_600_000, ...opts };
  }

  /** One dispatch pass. Returns counts, for logging and tests. */
  async runOnce(): Promise<{ claimed: number; done: number; retried: number; dead: number }> {
    const claimed = (await this.pool.query('SELECT * FROM app.claim_events($1, $2)', [this.o.batchSize, this.o.lockSeconds])).rows.map((r) => ({
      id: r.id, organizationId: r.organization_id, type: r.type, payload: r.payload, correlationId: r.correlation_id, attempts: r.attempts,
    })) as OutboxEvent[];
    const res = { claimed: claimed.length, done: 0, retried: 0, dead: 0 };
    for (const e of claimed) {
      const failures: string[] = [];
      for (const consumer of this.consumers.filter((c) => c.types.includes('*') || c.types.includes(e.type))) {
        try {
          await withTenant(this.pool, { organizationId: e.organizationId, role: 'system', actorType: 'system' }, async (c) => {
            const ins = await c.query('INSERT INTO event_consumptions (event_id, consumer, organization_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [e.id, consumer.name, e.organizationId]);
            if (ins.rowCount === 0) return; // already handled by this consumer: idempotent
            await consumer.handle(e, c); // same transaction: a failure rolls back the consumption mark too
          });
        } catch (err) {
          failures.push(`${consumer.name}: ${(err as Error).message}`);
        }
      }
      await withTenant(this.pool, { organizationId: e.organizationId, role: 'system', actorType: 'system' }, async (c) => {
        if (!failures.length) {
          await c.query(`UPDATE events SET status = 'done', processed_at = now(), locked_until = NULL, last_error = NULL WHERE id = $1`, [e.id]);
          res.done++;
        } else if (e.attempts >= this.o.maxAttempts) {
          const msg = failures.join('; ').slice(0, 1000);
          await c.query(`UPDATE events SET status = 'dead', locked_until = NULL, last_error = $2 WHERE id = $1`, [e.id, msg]);
          await c.query(`INSERT INTO manual_queue (organization_id, kind, reference_type, reference_id, reason, payload) VALUES ($1, 'dead_event', 'event', $2, $3, $4)`,
            [e.organizationId, e.id, `event ${e.type} failed ${e.attempts} times: ${msg}`, JSON.stringify({ type: e.type, payload: e.payload })]);
          res.dead++;
        } else {
          const delay = backoffMs(e.attempts, this.o.baseDelayMs, this.o.maxDelayMs);
          await c.query(`UPDATE events SET status = 'pending', locked_until = NULL, last_error = $2, next_attempt_at = now() + make_interval(secs => $3::double precision) WHERE id = $1`,
            [e.id, failures.join('; ').slice(0, 1000), delay / 1000]);
          res.retried++;
        }
      });
      if (failures.length && e.attempts >= this.o.maxAttempts) {
        await this.alerts.alert({ organizationId: e.organizationId, kind: 'dead_event', message: `${e.type} moved to the manual queue after ${e.attempts} attempts`, reference: e.id });
      }
    }
    return res;
  }
}
