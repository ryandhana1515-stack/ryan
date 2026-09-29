import { withTenant } from '@edg/db';
import { authorize } from './authz';
import { computeKpis, type KpiOptions, type KpiSnapshot, type KpiValue } from './kpi';
import { txWriters, type Runtime } from './runtime';

/**
 * CEO Daily Brief (B10): collect → compute KPIs by query → compare → exceptions → the LLM narrates the computed JSON
 * ONLY → a number guard rejects any narration containing a number that is not in the JSON (then the deterministic
 * brief is used) → deliver (email draft through executeTool) → log. "data unavailable" is shown for any KPI whose
 * source is down or not connected.
 */
export interface Brief { text: string; narratedBy: 'llm' | 'template'; guardRejected: boolean; snapshot: KpiSnapshot; delivery: string }

const money = (cents: number) => `SGD ${(cents / 100).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
function show(k: KpiValue): string {
  if (k.status !== 'ok' || k.value === null) return 'data unavailable';
  const v = k.key.endsWith('_cents') ? money(k.value) : String(k.value);
  if (k.previous === null) return v;
  const d = k.value - k.previous;
  return `${v} (${d === 0 ? 'same as' : d > 0 ? `+${d} vs` : `${d} vs`} the day before)`;
}

/** Deterministic brief: always correct, used as the fallback and as the LLM's factual base. */
export function templateBrief(s: KpiSnapshot, orgName: string): string {
  const k = (key: string) => s.kpis.find((x) => x.key === key)!;
  const priorities: string[] = [];
  if ((k('unanswered_leads').value ?? 0) > 0) priorities.push(`Reply to the ${k('unanswered_leads').value} unanswered lead(s).`);
  if ((k('overdue_follow_ups').value ?? 0) > 0) priorities.push(`Clear the ${k('overdue_follow_ups').value} overdue follow-up(s).`);
  if ((k('manual_queue_open').value ?? 0) > 0) priorities.push(`Resolve the ${k('manual_queue_open').value} item(s) in the manual queue.`);
  for (const x of s.kpis.filter((x) => x.status !== 'ok')) priorities.push(`${x.name}: data unavailable (${x.reason}).`);
  if (!priorities.length) priorities.push('No exceptions. Keep the pipeline moving.');
  return [
    `GOOD MORNING — ${orgName}, brief for ${s.day}`,
    '',
    'YESTERDAY',
    `- New leads: ${show(k('new_leads'))}`,
    `- Customers needing attention (unanswered leads): ${show(k('unanswered_leads'))}`,
    `- Overdue follow-ups: ${show(k('overdue_follow_ups'))}`,
    `- Open pipeline: ${show(k('open_pipeline_value_cents'))}`,
    `- Sales / revenue: ${show(k('revenue_cents'))}`,
    `- Critical issues (waiting on a human): ${show(k('manual_queue_open'))}`,
    '',
    "TODAY'S PRIORITIES",
    ...priorities.map((p, i) => `${i + 1}. ${p}`),
  ].join('\n');
}

/** Every number in the narration must appear in the facts (day digits allowed). */
export function numbersAreGrounded(narration: string, facts: string): boolean {
  const nums = (t: string) => new Set((t.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/,/g, '').replace(/\.$/, '')));
  const allowed = nums(facts);
  for (const n of nums(narration)) if (!allowed.has(n)) return false;
  return true;
}

export async function generateCeoBrief(rt: Runtime, orgId: string, opts: KpiOptions & { correlationId: string; deliverTo?: string }): Promise<Brief> {
  authorize(opts.role ?? 'system', 'kpi.read');
  const snapshot = await computeKpis(rt, orgId, opts);
  const org = await withTenant(rt.pool, { organizationId: orgId, role: 'system', actorType: 'system' }, (c) =>
    c.query(`SELECT o.name, (SELECT email FROM users u WHERE u.organization_id = o.id AND u.role_key = 'owner' AND u.active ORDER BY created_at LIMIT 1) AS owner_email FROM organizations o WHERE o.id = $1`, [orgId]));
  const orgName: string = org.rows[0].name;
  const facts = templateBrief(snapshot, orgName);

  let text = facts; let narratedBy: Brief['narratedBy'] = 'template'; let guardRejected = false;
  let tokens = { in: 0, out: 0 };
  const llm = rt.adapters.llm;
  if (llm) {
    try {
      const r = await llm.complete({
        tier: 'standard',
        system: 'You write a short morning brief for a business owner. Use ONLY the facts given. Do not add, estimate or change any number. If a value says "data unavailable", say so. Keep the headings GOOD MORNING, YESTERDAY, TODAY\'S PRIORITIES.',
        prompt: `${facts}\n\nKPI JSON:\n${JSON.stringify(snapshot.kpis)}`,
      });
      tokens = { in: r.inputTokens, out: r.outputTokens };
      if (numbersAreGrounded(r.text, `${facts}\n${JSON.stringify(snapshot.kpis)}`)) { text = r.text; narratedBy = 'llm'; } else guardRejected = true;
    } catch { /* LLM down: the deterministic brief still goes out */ }
  }

  const to = opts.deliverTo ?? org.rows[0].owner_email;
  let delivery = 'not_delivered: no recipient';
  if (to) {
    const res = await rt.tool('email.createDraft', { to, subject: `Morning brief — ${snapshot.day}`, body: text },
      { organizationId: orgId, actor: { type: 'system', id: 'ceo-brief', role: 'system' }, correlationId: opts.correlationId, workflow: 'ceo-daily-brief' });
    delivery = res.outcome === 'success' ? 'email_draft' : `not_delivered: ${res.reason}`;
  }

  await withTenant(rt.pool, { organizationId: orgId, role: 'system', actorType: 'system' }, async (c) => {
    await c.query(`INSERT INTO agent_actions (organization_id, agent, action, model_tier, provider, input_tokens, output_tokens, workflow, correlation_id) VALUES ($1,'ceo-intelligence','daily_brief','standard',$2,$3,$4,'ceo-daily-brief',$5)`,
      [orgId, llm?.provider ?? 'none', tokens.in, tokens.out, opts.correlationId]);
    const { audit, events } = txWriters(rt.pool, c);
    await events.emit({ organizationId: orgId, type: 'report.ceo_brief', payload: { day: snapshot.day, narrated_by: narratedBy, guard_rejected: guardRejected, exceptions: snapshot.exceptions, delivery }, correlationId: opts.correlationId });
    await audit.append({ organizationId: orgId, actorType: 'system', actorId: 'ceo-brief', action: 'report.ceo_brief', result: 'success',
      newState: { day: snapshot.day, narrated_by: narratedBy, guard_rejected: guardRejected, delivery, sources: snapshot.sources }, correlationId: opts.correlationId, environment: rt.env, workflow: 'ceo-daily-brief' });
  });
  return { text, narratedBy, guardRejected, snapshot, delivery };
}
