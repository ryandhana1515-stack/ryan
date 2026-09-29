import { randomUUID, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import { PgAuditStore, withTenant } from '@edg/db';
import { OutboxDispatcher, type Consumer } from '@edg/events';
import {
  assignLead, computeKpis, dedupeCheck, emailFromHeader, generateCeoBrief, intakeLead, parseWhatsAppWebhook, processDueFollowUps, verifyChallenge, verifySignature,
  authorize, type Runtime,
} from '@edg/crm';

/**
 * EDG API (development build). Framework-free Node HTTP so it runs anywhere (local, container, or wrapped as a Vercel
 * function). Auth:
 *  - X-EDG-Key (server-to-server, e.g. n8n): constant-time compare with EDG_WEBHOOK_SECRET → role "system".
 *  - WhatsApp: Meta signature (X-Hub-Signature-256 with WHATSAPP_APP_SECRET).
 *  - Public website form: POST /leads without a key (channel forced to website_form, honeypot, rate limit).
 *  - X-EDG-Dev-User (development/test ONLY): act as a seeded user to demo role permissions. Ignored elsewhere.
 * Production user auth = Supabase JWT → the same TenantContext (see docs/architecture.md).
 */
export interface AppConfig { webhookSecret?: string; whatsappAppSecret?: string; whatsappVerifyToken?: string; publicFormRatePerMinute?: number }

class HttpError extends Error { constructor(readonly status: number, msg: string) { super(msg); } }

export function createHandler(rt: Runtime, cfg: AppConfig) {
  const hits = new Map<string, number[]>();
  const formHtml = () => readFileSync(fileURLToPath(new URL('../public/test-form.html', import.meta.url)), 'utf8');
  const dev = rt.env === 'development' || rt.env === 'test';

  const consumers: Consumer[] = [{
    name: 'owner-notifier', types: ['lead.assigned', 'follow_up.due'],
    handle: async (e, c) => {
      const owner = (await c.query('SELECT email, name FROM users WHERE id = $1', [e.payload.owner_id])).rows[0];
      if (!owner?.email) return;
      const what = e.type === 'lead.assigned' ? 'A new lead was assigned to you' : 'A follow-up is due';
      const r = await rt.tool('email.createDraft', { to: owner.email, subject: what, body: `${what}. Lead ${e.payload.lead_id}. Open the CRM to act.` },
        { organizationId: e.organizationId, actor: { type: 'system', id: 'owner-notifier', role: 'system' }, correlationId: e.correlationId, workflow: 'notifications' });
      if (r.outcome !== 'success') throw new Error(`notify failed: ${r.reason}`);
    },
  }];

  return async function handle(req: IncomingMessage, res: ServerResponse) {
    const correlationId = String(req.headers['x-correlation-id'] ?? randomUUID()).slice(0, 100);
    let orgId: string | null = null;
    let actorForAudit: { role: string; userId?: string } | null = null;
    let routeForAudit = '';
    const send = (status: number, body: unknown) => { res.writeHead(status, { 'content-type': 'application/json', 'x-correlation-id': correlationId }); res.end(JSON.stringify(body)); };
    try {
      const url = new URL(req.url ?? '/', 'http://local');
      if (req.method === 'GET' && url.pathname === '/health') return send(200, { ok: true, env: rt.env });
      if (req.method === 'GET' && url.pathname === '/test-form') {
        if (!dev) throw new HttpError(404, 'not found');
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(formHtml());
      }
      const m = /^\/api\/o\/([a-z0-9-]{2,60})\/(.+)$/.exec(url.pathname);
      if (!m) throw new HttpError(404, 'not found');
      const [, slug, route] = m as unknown as [string, string, string];
      orgId = await orgBySlug(rt, slug);
      routeForAudit = route;
      if (!orgId) throw new HttpError(404, 'organisation not found');
      const raw = await readBody(req);
      const body = raw.length ? safeJson(raw) : {};
      const actor = await resolveActor(rt, orgId, req, cfg, dev);
      actorForAudit = actor;

      // --- WhatsApp Cloud API webhook (direct from Meta)
      if (route === 'webhooks/whatsapp') {
        if (!cfg.whatsappAppSecret || !cfg.whatsappVerifyToken) throw new HttpError(503, 'CONNECTION_REQUIRED: set WHATSAPP_APP_SECRET and WHATSAPP_VERIFY_TOKEN for this environment');
        if (req.method === 'GET') {
          const ch = verifyChallenge(url.searchParams, cfg.whatsappVerifyToken);
          if (!ch) throw new HttpError(403, 'verification failed');
          res.writeHead(200, { 'content-type': 'text/plain' }); return res.end(ch);
        }
        if (!verifySignature(raw, req.headers['x-hub-signature-256'] as string | undefined, cfg.whatsappAppSecret)) throw new HttpError(401, 'bad signature');
        const results = [];
        for (const msg of parseWhatsAppWebhook(body)) results.push(await intakeLead(rt, orgId, msg, { correlationId }));
        return send(200, { ok: true, results });
      }
      if (req.method !== 'POST') throw new HttpError(405, 'method not allowed');

      // --- Public website form (or keyed server-to-server lead intake)
      if (route === 'leads') {
        if (!actor) {
          if ((body as any).website) return send(200, { ok: true }); // honeypot: silently accept, do nothing
          rateLimit(hits, `${slug}|${req.socket.remoteAddress}`, cfg.publicFormRatePerMinute ?? 10);
          const r = await intakeLead(rt, orgId, { ...(body as object), channel: 'website_form' }, { correlationId, role: 'system' });
          return send(r.status === 'manual_queue' ? 202 : 200, { ok: true, lead_id: r.leadId, duplicate: r.status !== 'created', status: r.status });
        }
        const r = await intakeLead(rt, orgId, body, { correlationId, role: actor.role });
        return send(r.status === 'manual_queue' ? 202 : 200, { ok: true, lead_id: r.leadId, duplicate: r.status !== 'created', status: r.status, ack: r.ack });
      }

      if (!actor) throw new HttpError(401, 'X-EDG-Key required');
      switch (route) {
        case 'webhooks/whatsapp/forwarded': {
          const results = [];
          for (const msg of parseWhatsAppWebhook(body)) results.push(await intakeLead(rt, orgId, msg, { correlationId, role: actor.role }));
          return send(200, { ok: true, results });
        }
        case 'email-intake': {
          const b = body as { from?: string; subject?: string; text?: string; message_id?: string };
          const r = await intakeLead(rt, orgId, { channel: 'email', source: 'email', email: emailFromHeader(b.from) ?? undefined, name: (b.from ?? '').replace(/<.*>/, '').trim() || undefined,
            message: [b.subject, b.text].filter(Boolean).join('\n\n').slice(0, 4000), externalId: b.message_id }, { correlationId, role: actor.role });
          return send(r.status === 'manual_queue' ? 202 : 200, { ok: true, ...r });
        }
        case 'dedupe-check': return send(200, await dedupeCheck(rt, orgId, body as { phone?: string; email?: string }, actor));
        case 'leads/assign': return send(200, await assignLead(rt, orgId, String((body as any).lead_id ?? ''), actor, correlationId));
        case 'jobs/follow-ups': authorize(actor.role, 'jobs.run'); return send(200, await processDueFollowUps(rt, orgId, correlationId));
        case 'jobs/dispatch-events': authorize(actor.role, 'jobs.run'); return send(200, await new OutboxDispatcher(rt.pool, consumers, rt.alerts).runOnce());
        case 'jobs/ceo-brief': {
          authorize(actor.role, 'jobs.run');
          const b = await generateCeoBrief(rt, orgId, { correlationId });
          return send(200, { ok: true, day: b.snapshot.day, narrated_by: b.narratedBy, guard_rejected: b.guardRejected, delivery: b.delivery, text: b.text });
        }
        case 'kpis': return send(200, await computeKpis(rt, orgId, { role: actor.role }));
        default: throw new HttpError(404, 'not found');
      }
    } catch (e) {
      const status = (e as { status?: number }).status ?? 500;
      if (status >= 500) console.error(`[api] ${correlationId}`, e);
      if (status === 403 && orgId) {
        // Refused attempts are audited too (who tried what).
        await new PgAuditStore(rt.pool).append({ organizationId: orgId, actorType: 'user', actorId: actorForAudit?.userId ?? actorForAudit?.role ?? 'anonymous',
          action: `api.${routeForAudit}`, result: 'blocked', error: (e as Error).message, correlationId, environment: rt.env }).catch(() => {});
      }
      return send(status, { ok: false, error: status >= 500 ? 'internal error (see logs with this correlation id)' : (e as Error).message, correlation_id: correlationId });
    }
  };
}

async function orgBySlug(rt: Runtime, slug: string): Promise<string | null> {
  return (await rt.pool.query('SELECT app.org_id_by_slug($1) AS id', [slug])).rows[0]?.id ?? null;
}

async function resolveActor(rt: Runtime, orgId: string, req: IncomingMessage, cfg: AppConfig, dev: boolean) {
  const key = req.headers['x-edg-key'];
  if (typeof key === 'string' && cfg.webhookSecret) {
    if (!constantTimeEqual(key, cfg.webhookSecret)) throw new HttpError(401, 'bad X-EDG-Key');
    return { role: 'system', actorType: 'system' as const };
  }
  const devUser = req.headers['x-edg-dev-user'];
  if (dev && typeof devUser === 'string') {
    const u = await withTenant(rt.pool, { organizationId: orgId, role: 'system', actorType: 'system' }, (c) =>
      c.query('SELECT id, role_key FROM users WHERE id::text = $1 AND active', [devUser]));
    if (!u.rows[0]) throw new HttpError(401, 'unknown user for this organisation');
    return { role: u.rows[0].role_key as string, userId: u.rows[0].id as string, actorType: 'user' as const };
  }
  return null;
}

function constantTimeEqual(a: string, b: string) {
  const x = Buffer.from(a); const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function rateLimit(hits: Map<string, number[]>, k: string, perMinute: number) {
  const now = Date.now(); const arr = (hits.get(k) ?? []).filter((t) => now - t < 60_000);
  if (arr.length >= perMinute) throw new HttpError(429, 'too many requests');
  arr.push(now); hits.set(k, arr);
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []; let size = 0;
    req.on('data', (c: Buffer) => { size += c.length; if (size > 256 * 1024) { reject(new HttpError(413, 'body too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function safeJson(b: Buffer): unknown {
  try { return JSON.parse(b.toString('utf8')); } catch { throw new HttpError(400, 'invalid JSON'); }
}
