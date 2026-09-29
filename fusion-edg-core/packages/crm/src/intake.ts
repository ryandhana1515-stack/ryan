import { z } from 'zod';
import { withTenant, type Client, type TenantContext } from '@edg/db';
import { authorize, ValidationError } from './authz';
import { normalizeEmail, normalizePhone, OPT_OUT_WORDS } from './normalize';
import { txWriters, type Runtime } from './runtime';

export const IntakeInput = z.object({
  channel: z.enum(['website_form', 'whatsapp', 'email']),
  source: z.string().max(80).optional(),
  name: z.string().trim().max(200).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().max(320).optional(),
  message: z.string().max(4000).optional(),
  /** Provider message id (WhatsApp wamid, email Message-ID): makes webhooks idempotent. */
  externalId: z.string().max(300).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
});
export type IntakeInput = z.infer<typeof IntakeInput>;

export type AckStatus = 'sent' | 'draft' | 'skipped_opt_out' | 'manual_queue' | 'not_sent_repeat' | 'none';
export interface IntakeResult {
  status: 'created' | 'repeat_enquiry' | 'duplicate_webhook' | 'opted_out' | 'manual_queue';
  leadId?: string;
  contactId?: string;
  ownerId?: string;
  conversationId?: string;
  ack: AckStatus;
  correlationId: string;
}

const ACTIVE = ['new', 'contacted', 'qualified', 'nurturing'];
const FIRST_RESPONSE_SLA_HOURS = 1;
const FOLLOW_UP_AFTER_HOURS = 24;

/**
 * lead-intake (Part C): preserve the message FIRST (own transaction), then in one transaction: dedupe → contact →
 * lead (or repeat enquiry) → round-robin owner → next action + date → follow-up task → events (outbox) → audit.
 * After commit, the acknowledgement goes through executeTool (capability, idempotency, audit). Any failure after
 * the message is preserved lands in the manual queue: an enquiry is never lost.
 */
export async function intakeLead(rt: Runtime, orgId: string, raw: unknown, opts: { correlationId: string; role?: string }): Promise<IntakeResult> {
  const role = opts.role ?? 'system';
  authorize(role, 'lead.intake');
  const parsed = IntakeInput.safeParse(raw);
  if (!parsed.success) throw new ValidationError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  const input = parsed.data;
  const phone = normalizePhone(input.phone);
  const email = normalizeEmail(input.email);
  if (!phone && !email) throw new ValidationError('a valid phone number or email address is required');
  const correlationId = opts.correlationId;
  const sys: TenantContext = { organizationId: orgId, role: 'system', actorType: 'system' };

  // 1. Preserve the inbound message (idempotent on the provider's message id).
  const conv = await withTenant(rt.pool, sys, async (c) => {
    const r = await c.query(
      `INSERT INTO conversations (organization_id, channel, direction, external_id, body, status)
       VALUES ($1,$2,'inbound',$3,$4,'received')
       ON CONFLICT (organization_id, channel, external_id) WHERE external_id IS NOT NULL DO NOTHING RETURNING id`,
      [orgId, input.channel, input.externalId ?? null, input.message ?? null]);
    if (r.rowCount === 1) return { id: r.rows[0].id as string, duplicate: false };
    const prev = await c.query('SELECT id, lead_id, contact_id FROM conversations WHERE organization_id = $1 AND channel = $2 AND external_id = $3', [orgId, input.channel, input.externalId]);
    await txWriters(rt.pool, c).audit.append({ organizationId: orgId, actorType: 'system', actorId: 'intake', action: 'lead.intake', resource: `conversation:${prev.rows[0].id}`,
      result: 'duplicate', error: 'duplicate webhook (same provider message id) ignored', correlationId, environment: rt.env, workflow: 'lead-intake' });
    return { id: prev.rows[0].id as string, duplicate: true, leadId: prev.rows[0].lead_id as string | undefined, contactId: prev.rows[0].contact_id as string | undefined };
  });
  if (conv.duplicate) return { status: 'duplicate_webhook', conversationId: conv.id, leadId: (conv as any).leadId, contactId: (conv as any).contactId, ack: 'none', correlationId };

  // 2. Process in one transaction; on any failure, the preserved message goes to the manual queue.
  let processed: Processed;
  try {
    processed = await withRetryOnUniqueViolation(() => withTenant(rt.pool, sys, (c) => processEnquiry(rt, c, orgId, input, { phone, email, conversationId: conv.id, correlationId })));
  } catch (e) {
    const reason = (e as Error).message.slice(0, 500);
    await withTenant(rt.pool, sys, async (c) => {
      await c.query(`UPDATE conversations SET status = 'manual_queue', error = $2 WHERE id = $1`, [conv.id, reason]);
      await c.query(`INSERT INTO manual_queue (organization_id, kind, reference_type, reference_id, reason, payload) VALUES ($1,'intake_failed','conversation',$2,$3,$4)`,
        [orgId, conv.id, `lead intake failed: ${reason}`, JSON.stringify({ channel: input.channel, phone, email })]);
      await txWriters(rt.pool, c).audit.append({ organizationId: orgId, actorType: 'system', actorId: 'intake', action: 'lead.intake', resource: `conversation:${conv.id}`,
        result: 'failed', error: reason, correlationId, environment: rt.env, workflow: 'lead-intake' });
    });
    await rt.alerts.alert({ organizationId: orgId, kind: 'intake_failed', message: `An enquiry could not be processed and is waiting in the manual queue: ${reason}`, reference: conv.id });
    return { status: 'manual_queue', conversationId: conv.id, ack: 'none', correlationId };
  }

  if (processed.status === 'opted_out') return { ...processed.result, ack: 'none', correlationId };
  // 3. Acknowledge new leads only (a repeat message on an open lead goes to the owner, not an auto-reply).
  const ack: AckStatus = processed.status === 'repeat_enquiry' ? 'not_sent_repeat'
    : processed.optedOut ? 'skipped_opt_out'
    : await acknowledge(rt, orgId, input, processed, correlationId);
  return { ...processed.result, ack, correlationId };
}

interface Processed {
  status: 'created' | 'repeat_enquiry' | 'opted_out';
  result: Omit<IntakeResult, 'ack' | 'correlationId'>;
  phone: string | null;
  email: string | null;
  name?: string;
  ownerName?: string;
  optedOut: boolean;
  orgName: string;
}

async function processEnquiry(rt: Runtime, c: Client, orgId: string, input: IntakeInput, k: { phone: string | null; email: string | null; conversationId: string; correlationId: string }): Promise<Processed> {
  const { audit, events } = txWriters(rt.pool, c);
  const now = rt.now();
  const ev = (type: string, payload: unknown) => events.emit({ organizationId: orgId, type, payload, correlationId: k.correlationId });
  const org = (await c.query('SELECT name FROM organizations WHERE id = $1', [orgId])).rows[0];
  if (!org) throw new Error('organisation not visible');

  // Dedupe: phone first, then email. Two different contacts matching → never auto-merge; flag for a human.
  const byPhone = k.phone ? (await c.query(`SELECT * FROM contacts WHERE organization_id = $1 AND phone_e164 = $2 AND deleted_at IS NULL FOR UPDATE`, [orgId, k.phone])).rows[0] : undefined;
  const byEmail = k.email ? (await c.query(`SELECT * FROM contacts WHERE organization_id = $1 AND email_normalized = $2 AND deleted_at IS NULL FOR UPDATE`, [orgId, k.email])).rows[0] : undefined;
  let contact = byPhone ?? byEmail;
  if (byPhone && byEmail && byPhone.id !== byEmail.id) {
    await c.query(`INSERT INTO manual_queue (organization_id, kind, reference_type, reference_id, reason, payload) VALUES ($1,'possible_duplicate','contact',$2,$3,$4)`,
      [orgId, byPhone.id, 'phone and email match two different contacts; not merged automatically', JSON.stringify({ phone_contact: byPhone.id, email_contact: byEmail.id })]);
  }

  // Opt-out keyword from a known contact: record it, stop automations, do not create a lead.
  if (contact && input.message && OPT_OUT_WORDS.test(input.message)) {
    await c.query(`UPDATE contacts SET opted_out_at = COALESCE(opted_out_at, $2) WHERE id = $1`, [contact.id, now]);
    const cancelled = await c.query(`UPDATE tasks SET status = 'skipped_opt_out' WHERE organization_id = $1 AND status = 'open' AND kind = 'follow_up'
      AND lead_id IN (SELECT id FROM leads WHERE contact_id = $2)`, [orgId, contact.id]);
    await c.query(`UPDATE conversations SET contact_id = $2, status = 'processed' WHERE id = $1`, [k.conversationId, contact.id]);
    await c.query(`INSERT INTO activities (organization_id, contact_id, kind, summary, actor_type, actor_id) VALUES ($1,$2,'opt_out',$3,'system','intake')`,
      [orgId, contact.id, `Contact opted out via ${input.channel}; ${cancelled.rowCount} follow-up(s) cancelled`]);
    await ev('contact.opted_out', { contact_id: contact.id, channel: input.channel });
    await audit.append({ organizationId: orgId, actorType: 'system', actorId: 'intake', action: 'contact.opt_out', resource: `contact:${contact.id}`,
      previousState: { opted_out_at: contact.opted_out_at }, newState: { opted_out_at: now.toISOString() }, result: 'success', correlationId: k.correlationId, environment: rt.env, workflow: 'lead-intake' });
    return { status: 'opted_out', result: { status: 'opted_out', contactId: contact.id, conversationId: k.conversationId }, phone: k.phone, email: k.email, optedOut: true, orgName: org.name };
  }

  if (!contact) {
    contact = (await c.query(`INSERT INTO contacts (organization_id, name, phone_e164, email_normalized, source) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [orgId, input.name || null, k.phone, k.email, input.source ?? input.channel])).rows[0];
  } else {
    // Fill blanks only; never overwrite what a human entered, never steal another contact's key.
    await c.query(`UPDATE contacts SET name = COALESCE(name, $2),
        phone_e164 = COALESCE(phone_e164, CASE WHEN $3::text IS NOT NULL AND NOT EXISTS (SELECT 1 FROM contacts x WHERE x.organization_id = $4 AND x.phone_e164 = $3 AND x.deleted_at IS NULL) THEN $3 END),
        email_normalized = COALESCE(email_normalized, CASE WHEN $5::text IS NOT NULL AND NOT EXISTS (SELECT 1 FROM contacts x WHERE x.organization_id = $4 AND x.email_normalized = $5 AND x.deleted_at IS NULL) THEN $5 END)
      WHERE id = $1`, [contact.id, input.name || null, k.phone, orgId, k.email]);
  }
  const optedOut = !!contact.opted_out_at;

  const open = (await c.query(`SELECT * FROM leads WHERE organization_id = $1 AND contact_id = $2 AND status = ANY($3) AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
    [orgId, contact.id, ACTIVE])).rows[0];

  if (open) {
    const due = new Date(Math.min(new Date(open.next_action_at).getTime(), now.getTime() + FIRST_RESPONSE_SLA_HOURS * 3600_000));
    await c.query(`UPDATE leads SET enquiry_count = enquiry_count + 1, last_interaction_at = $2, next_action = 'Reply to repeat enquiry', next_action_at = $3 WHERE id = $1`, [open.id, now, due]);
    await c.query(`UPDATE conversations SET contact_id = $2, lead_id = $3, status = 'processed' WHERE id = $1`, [k.conversationId, contact.id, open.id]);
    await c.query(`INSERT INTO activities (organization_id, lead_id, contact_id, kind, summary, actor_type, actor_id) VALUES ($1,$2,$3,'repeat_enquiry',$4,'system','intake')`,
      [orgId, open.id, contact.id, `Repeat enquiry via ${input.channel} (deduplicated onto the open lead)`]);
    await ev('lead.repeat_enquiry', { lead_id: open.id, contact_id: contact.id, owner_id: open.owner_id, channel: input.channel });
    await ev('message.received', { conversation_id: k.conversationId, lead_id: open.id, channel: input.channel });
    await audit.append({ organizationId: orgId, actorType: 'system', actorId: 'intake', action: 'lead.repeat_enquiry', resource: `lead:${open.id}`,
      previousState: { enquiry_count: open.enquiry_count }, newState: { enquiry_count: open.enquiry_count + 1, next_action_at: due.toISOString() }, result: 'success',
      correlationId: k.correlationId, environment: rt.env, workflow: 'lead-intake' });
    return { status: 'repeat_enquiry', result: { status: 'repeat_enquiry', leadId: open.id, contactId: contact.id, ownerId: open.owner_id, conversationId: k.conversationId },
      phone: k.phone, email: k.email, name: contact.name ?? undefined, optedOut, orgName: org.name };
  }

  const owner = await pickOwner(c, orgId);
  const dueFirst = new Date(now.getTime() + FIRST_RESPONSE_SLA_HOURS * 3600_000);
  const lead = (await c.query(
    `INSERT INTO leads (organization_id, contact_id, source, channel, status, owner_id, last_interaction_at, next_action, next_action_at, first_message, utm)
     VALUES ($1,$2,$3,$4,'new',$5,$6,'First response: acknowledge and qualify',$7,$8,$9) RETURNING id`,
    [orgId, contact.id, input.source ?? input.channel, input.channel, owner.id, now, dueFirst, input.message ?? null, JSON.stringify(input.utm ?? {})])).rows[0];
  await c.query(`UPDATE conversations SET contact_id = $2, lead_id = $3, status = 'processed' WHERE id = $1`, [k.conversationId, contact.id, lead.id]);
  await c.query(`INSERT INTO activities (organization_id, lead_id, contact_id, kind, summary, actor_type, actor_id) VALUES
      ($1,$2,$3,'enquiry',$4,'system','intake'), ($1,$2,$3,'assignment',$5,'system','intake')`,
    [orgId, lead.id, contact.id, `New enquiry via ${input.channel}`, `Assigned to ${owner.name} (${owner.rule})`]);
  if (!optedOut) {
    await c.query(`INSERT INTO tasks (organization_id, lead_id, assignee_id, kind, title, due_at) VALUES ($1,$2,$3,'follow_up','Follow up if no reply',$4)`,
      [orgId, lead.id, owner.id, new Date(now.getTime() + FOLLOW_UP_AFTER_HOURS * 3600_000)]);
  }
  await ev('lead.created', { lead_id: lead.id, contact_id: contact.id, channel: input.channel, source: input.source ?? input.channel });
  await ev('lead.assigned', { lead_id: lead.id, owner_id: owner.id, rule: owner.rule });
  await ev('message.received', { conversation_id: k.conversationId, lead_id: lead.id, channel: input.channel });
  if (!optedOut) await ev('follow_up.scheduled', { lead_id: lead.id, after_hours: FOLLOW_UP_AFTER_HOURS });
  await audit.append({ organizationId: orgId, actorType: 'system', actorId: 'intake', action: 'lead.created', resource: `lead:${lead.id}`,
    newState: { contact_id: contact.id, owner_id: owner.id, status: 'new', next_action_at: dueFirst.toISOString(), follow_up: !optedOut }, result: 'success',
    correlationId: k.correlationId, environment: rt.env, workflow: 'lead-intake' });
  return { status: 'created', result: { status: 'created', leadId: lead.id, contactId: contact.id, ownerId: owner.id, conversationId: k.conversationId },
    phone: k.phone, email: k.email, name: contact.name ?? input.name, ownerName: owner.name, optedOut, orgName: org.name };
}

/** Round-robin over active users in the lead pool; falls back to a manager/owner so no lead is ever unowned. */
export async function pickOwner(c: Client, orgId: string, exclude?: string): Promise<{ id: string; name: string; rule: string }> {
  const pool = await c.query(`SELECT id, name FROM users WHERE organization_id = $1 AND active AND accepts_leads AND deleted_at IS NULL AND ($2::uuid IS NULL OR id <> $2)
    ORDER BY last_assigned_at NULLS FIRST, created_at, id LIMIT 1 FOR UPDATE SKIP LOCKED`, [orgId, exclude ?? null]);
  const u = pool.rows[0];
  if (u) {
    await c.query('UPDATE users SET last_assigned_at = clock_timestamp() WHERE id = $1', [u.id]);
    return { id: u.id, name: u.name, rule: 'round_robin' };
  }
  const fb = (await c.query(`SELECT id, name FROM users WHERE organization_id = $1 AND active AND deleted_at IS NULL AND role_key IN ('manager','owner','admin')
    ORDER BY array_position(ARRAY['manager','owner','admin'], role_key), created_at LIMIT 1`, [orgId])).rows[0];
  if (!fb) throw new Error('no user can own this lead (lead pool empty and no manager/owner/admin)');
  return { id: fb.id, name: fb.name, rule: 'fallback_no_pool' };
}

async function acknowledge(rt: Runtime, orgId: string, input: IntakeInput, p: Processed, correlationId: string): Promise<AckStatus> {
  const first = (p.name ?? '').split(' ')[0] || 'there';
  const text = `Hi ${first}, thanks for contacting ${p.orgName.replace(/\s*\(FAKE\)$/, '')}. We have received your message${p.ownerName ? ` and ${p.ownerName.split(' ')[0]} will get back to you shortly` : ''}.`;
  const ctx = { organizationId: orgId, actor: { type: 'system' as const, id: 'intake', role: 'system' }, correlationId, workflow: 'lead-intake' };
  const leadId = p.result.leadId!;
  let res; let outbound: { status: 'sent' | 'draft' | 'failed'; body: string; external?: string };
  if (input.channel === 'whatsapp' && p.phone) {
    // Customer just messaged us: inside the WhatsApp service window, a free-form reply is allowed.
    res = await rt.tool<{ messageId: string }>('whatsapp.send', { to: p.phone, text, dedupeKey: `${leadId}:ack` }, ctx);
    outbound = { status: res.outcome === 'success' || res.outcome === 'duplicate' ? 'sent' : 'failed', body: text, external: res.output?.messageId };
  } else if (p.email) {
    res = await rt.tool<{ draftId: string }>('email.createDraft', { to: p.email, subject: `Thanks for your enquiry — ${p.orgName.replace(/\s*\(FAKE\)$/, '')}`, body: text }, ctx);
    outbound = { status: res.outcome === 'success' ? 'draft' : 'failed', body: text };
  } else {
    // Phone-only web form: no opt-in for WhatsApp templates recorded, so the owner calls; nothing is sent automatically.
    await withTenant(rt.pool, { organizationId: orgId, role: 'system', actorType: 'system' }, (c) => c.query(
      `INSERT INTO conversations (organization_id, contact_id, lead_id, channel, direction, body, status, automated) VALUES ($1,$2,$3,'website_form','outbound',$4,'draft',true)`,
      [orgId, p.result.contactId, leadId, `Call the customer: ${text}`]));
    return 'draft';
  }

  await withTenant(rt.pool, { organizationId: orgId, role: 'system', actorType: 'system' }, async (c) => {
    await c.query(`INSERT INTO conversations (organization_id, contact_id, lead_id, channel, direction, external_id, body, status, automated, error)
      VALUES ($1,$2,$3,$4,'outbound',$5,$6,$7,true,$8)`,
      [orgId, p.result.contactId, leadId, input.channel === 'whatsapp' ? 'whatsapp' : 'email', outbound.external ?? null, outbound.body, outbound.status, outbound.status === 'failed' ? res!.reason ?? null : null]);
    if (outbound.status === 'failed') {
      await c.query(`INSERT INTO manual_queue (organization_id, kind, reference_type, reference_id, reason, payload) VALUES ($1,'message_send_failed','lead',$2,$3,$4)`,
        [orgId, leadId, `acknowledgement not sent: ${res!.reason}${res!.humanAction ? ` — ${res!.humanAction}` : ''}`, JSON.stringify({ channel: input.channel, to: p.phone ?? p.email, text })]);
    }
  });
  if (outbound.status === 'failed') {
    await rt.alerts.alert({ organizationId: orgId, kind: 'message_send_failed', message: `Acknowledgement to a new lead failed (${res!.reason}); it is in the manual queue.`, reference: leadId });
    return 'manual_queue';
  }
  return outbound.status;
}

async function withRetryOnUniqueViolation<T>(fn: () => Promise<T>): Promise<T> {
  try { return await fn(); } catch (e) {
    if ((e as { code?: string }).code === '23505') return fn(); // two intakes raced on the same new contact
    throw e;
  }
}
