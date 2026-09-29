import { withTenant } from '@edg/db';
import { authorize, NotFoundError } from './authz';
import { pickOwner } from './intake';
import { normalizeEmail, normalizePhone } from './normalize';
import { txWriters, type Runtime } from './runtime';

export interface Actor { role: string; userId?: string; actorType?: 'user' | 'agent' | 'system' }

/** lead-assignment: re-assign by round-robin (excluding the current owner). Runs AS the caller: RLS applies. */
export async function assignLead(rt: Runtime, orgId: string, leadId: string, actor: Actor, correlationId: string) {
  authorize(actor.role, 'lead.assign');
  return withTenant(rt.pool, { organizationId: orgId, role: actor.role, userId: actor.userId, actorType: actor.actorType ?? 'user' }, async (c) => {
    const lead = (await c.query(`SELECT id, owner_id FROM leads WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`, [leadId])).rows[0];
    if (!lead) throw new NotFoundError('lead not found'); // also what another tenant's lead looks like
    const owner = await pickOwnerAs(rt, orgId, lead.owner_id);
    const upd = await c.query(`UPDATE leads SET owner_id = $2, next_action_at = LEAST(next_action_at, now() + interval '1 hour') WHERE id = $1`, [leadId, owner.id]);
    if (upd.rowCount !== 1) throw new NotFoundError('lead not found');
    await c.query(`UPDATE tasks SET assignee_id = $2 WHERE lead_id = $1 AND status = 'open'`, [leadId, owner.id]);
    await c.query(`INSERT INTO activities (organization_id, lead_id, kind, summary, actor_type, actor_id) VALUES ($1,$2,'assignment',$3,$4,$5)`,
      [orgId, leadId, `Re-assigned to ${owner.name} (${owner.rule})`, actor.actorType ?? 'user', actor.userId ?? actor.role]);
    const { audit, events } = txWriters(rt.pool, c);
    await events.emit({ organizationId: orgId, type: 'lead.assigned', payload: { lead_id: leadId, owner_id: owner.id, previous_owner_id: lead.owner_id, rule: owner.rule }, correlationId });
    await audit.append({ organizationId: orgId, actorType: actor.actorType ?? 'user', actorId: actor.userId ?? actor.role, action: 'lead.assign', resource: `lead:${leadId}`,
      previousState: { owner_id: lead.owner_id }, newState: { owner_id: owner.id }, result: 'success', correlationId, environment: rt.env, workflow: 'lead-assignment' });
    return { leadId, ownerId: owner.id, previousOwnerId: lead.owner_id as string, rule: owner.rule };
  });
}

/** The round-robin pointer lives on users, which only system/admins may update: pick the owner as system. */
async function pickOwnerAs(rt: Runtime, orgId: string, exclude: string) {
  return withTenant(rt.pool, { organizationId: orgId, role: 'system', actorType: 'system' }, (c) => pickOwner(c, orgId, exclude));
}

/** lead-deduplication check: does this phone/email already belong to a contact / open lead? Read-only. */
export async function dedupeCheck(rt: Runtime, orgId: string, input: { phone?: string; email?: string }, actor: Actor) {
  authorize(actor.role, 'lead.dedupeCheck');
  const phone = normalizePhone(input.phone); const email = normalizeEmail(input.email);
  return withTenant(rt.pool, { organizationId: orgId, role: actor.role, actorType: actor.actorType ?? 'system' }, async (c) => {
    const r = await c.query(`SELECT c.id AS contact_id, l.id AS lead_id, l.status, l.owner_id FROM contacts c
        LEFT JOIN LATERAL (SELECT id, status, owner_id FROM leads WHERE contact_id = c.id AND status IN ('new','contacted','qualified','nurturing') ORDER BY created_at DESC LIMIT 1) l ON true
      WHERE c.deleted_at IS NULL AND ((c.phone_e164 = $1 AND $1 IS NOT NULL) OR (c.email_normalized = $2 AND $2 IS NOT NULL))`, [phone, email]);
    return { normalized: { phone, email }, matches: r.rows, duplicate: r.rowCount! > 0, ambiguous: new Set(r.rows.map((x) => x.contact_id)).size > 1 };
  });
}

/** follow-up runner: remind owners of due follow-ups once; never message opted-out contacts. */
export async function processDueFollowUps(rt: Runtime, orgId: string, correlationId: string) {
  return withTenant(rt.pool, { organizationId: orgId, role: 'system', actorType: 'system' }, async (c) => {
    const due = (await c.query(`SELECT t.id, t.lead_id, t.assignee_id, ct.opted_out_at FROM tasks t JOIN leads l ON l.id = t.lead_id JOIN contacts ct ON ct.id = l.contact_id
      WHERE t.organization_id = $1 AND t.status = 'open' AND t.kind = 'follow_up' AND t.due_at <= $2 AND t.reminded_at IS NULL FOR UPDATE OF t SKIP LOCKED`, [orgId, rt.now()])).rows;
    const { audit, events } = txWriters(rt.pool, c);
    let reminded = 0, skipped = 0;
    for (const t of due) {
      if (t.opted_out_at) {
        await c.query(`UPDATE tasks SET status = 'skipped_opt_out' WHERE id = $1`, [t.id]);
        skipped++;
        continue;
      }
      await c.query(`UPDATE tasks SET reminded_at = $2 WHERE id = $1`, [t.id, rt.now()]);
      await c.query(`INSERT INTO activities (organization_id, lead_id, kind, summary, actor_type, actor_id) VALUES ($1,$2,'follow_up_due','Follow-up is due: owner reminded','system','follow-up')`, [orgId, t.lead_id]);
      await events.emit({ organizationId: orgId, type: 'follow_up.due', payload: { task_id: t.id, lead_id: t.lead_id, owner_id: t.assignee_id }, correlationId });
      reminded++;
    }
    await audit.append({ organizationId: orgId, actorType: 'system', actorId: 'follow-up', action: 'jobs.follow_ups', result: 'success', newState: { reminded, skipped_opt_out: skipped },
      correlationId, environment: rt.env, workflow: 'follow-up' });
    return { reminded, skippedOptOut: skipped };
  });
}
