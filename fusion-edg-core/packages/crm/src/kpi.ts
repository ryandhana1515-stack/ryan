import { withTenant, type Client } from '@edg/db';
import { authorize } from './authz';
import type { Runtime } from './runtime';

/**
 * KPI engine (B10). Every KPI is defined with its business meaning, formula (SQL over the KPI views), source, window,
 * owner, refresh and drill-down. Values come ONLY from connected data; a source that is down or not connected yields
 * status "unavailable" and value null. Nothing is estimated.
 */
export interface KpiDefinition {
  key: string;
  name: string;
  definition: string;
  formula: string; // SQL (documented, executed below)
  source: 'crm_db' | 'accounting';
  window: 'previous_day' | 'now';
  owner: string;
  target?: number;
  refresh: string;
  drillDown: string;
}

export const KPIS: KpiDefinition[] = [
  { key: 'new_leads', name: 'New leads', definition: 'Leads created during the previous local business day, all channels.', formula: 'SELECT COALESCE(sum(new_leads),0) FROM kpi_leads_by_day WHERE day = :day',
    source: 'crm_db', window: 'previous_day', owner: 'Sales manager', refresh: 'daily 08:00 + on demand', drillDown: 'leads created that day, by channel' },
  { key: 'unanswered_leads', name: 'Unanswered leads', definition: 'Active leads with no human reply sent yet (automatic acknowledgements do not count).', formula: 'SELECT count(*) FROM kpi_unanswered_leads',
    source: 'crm_db', window: 'now', owner: 'Sales manager', refresh: 'live', drillDown: 'kpi_unanswered_leads with owner' },
  { key: 'overdue_follow_ups', name: 'Overdue follow-ups', definition: 'Open follow-up tasks past their due time.', formula: 'SELECT count(*) FROM kpi_overdue_followups',
    source: 'crm_db', window: 'now', owner: 'Each owner', refresh: 'live', drillDown: 'kpi_overdue_followups by assignee' },
  { key: 'open_pipeline_value_cents', name: 'Open pipeline value', definition: 'Sum of open deal values (SGD cents).', formula: 'SELECT pipeline_value_cents FROM kpi_pipeline',
    source: 'crm_db', window: 'now', owner: 'CEO', refresh: 'live', drillDown: 'open deals by stage' },
  { key: 'manual_queue_open', name: 'Items waiting on a human', definition: 'Manual-queue items not resolved (failed sends, dead events, possible duplicates).', formula: 'SELECT open_items FROM kpi_manual_queue',
    source: 'crm_db', window: 'now', owner: 'Operations', refresh: 'live', drillDown: 'manual_queue list' },
  { key: 'revenue_cents', name: 'Revenue (invoiced)', definition: 'Invoices authorised in the accounting system during the previous day.', formula: 'accounting adapter: sum(invoices.total) WHERE date = :day',
    source: 'accounting', window: 'previous_day', owner: 'Finance', refresh: 'daily', drillDown: 'invoice list in the accounting system' },
];

export interface KpiValue { key: string; name: string; value: number | null; previous: number | null; status: 'ok' | 'unavailable'; reason?: string; definition: string }
export interface KpiSnapshot { organizationId: string; day: string; computedAt: string; kpis: KpiValue[]; exceptions: string[]; sources: Record<string, 'ok' | 'unavailable'> }

type Source = (c: Client, day: string, prevDay: string) => Promise<Record<string, [number, number | null]>>;

/** CRM database source: one round trip, all CRM KPIs. */
const crmSource: Source = async (c, day, prevDay) => {
  const r = (await c.query(`SELECT
      (SELECT COALESCE(sum(new_leads),0)::int FROM kpi_leads_by_day WHERE day = $1::date) AS new_leads,
      (SELECT COALESCE(sum(new_leads),0)::int FROM kpi_leads_by_day WHERE day = $2::date) AS new_leads_prev,
      (SELECT count(*)::int FROM kpi_unanswered_leads) AS unanswered_leads,
      (SELECT count(*)::int FROM kpi_overdue_followups) AS overdue_follow_ups,
      (SELECT COALESCE(sum(pipeline_value_cents),0)::bigint FROM kpi_pipeline) AS open_pipeline_value_cents,
      (SELECT COALESCE(sum(open_items),0)::int FROM kpi_manual_queue) AS manual_queue_open`, [day, prevDay])).rows[0];
  return {
    new_leads: [r.new_leads, r.new_leads_prev], unanswered_leads: [r.unanswered_leads, null], overdue_follow_ups: [r.overdue_follow_ups, null],
    open_pipeline_value_cents: [Number(r.open_pipeline_value_cents), null], manual_queue_open: [r.manual_queue_open, null],
  };
};

export interface KpiOptions {
  /** Local business day to report (YYYY-MM-DD); defaults to yesterday in the org's timezone. */
  day?: string;
  /** Test hook / future sources: override a source (e.g. simulate an outage). */
  sources?: Partial<Record<KpiDefinition['source'], Source | 'down'>>;
  role?: string;
}

export async function computeKpis(rt: Runtime, orgId: string, opts: KpiOptions = {}): Promise<KpiSnapshot> {
  const role = opts.role ?? 'system';
  authorize(role, 'kpi.read');
  return withTenant(rt.pool, { organizationId: orgId, role, actorType: 'system' }, async (c) => {
    const tz = (await c.query('SELECT timezone FROM organizations WHERE id = $1', [orgId])).rows[0]?.timezone ?? 'Asia/Singapore';
    const day = opts.day ?? (await c.query(`SELECT ((now() AT TIME ZONE $1)::date - 1)::text AS d`, [tz])).rows[0].d;
    const prevDay = (await c.query(`SELECT ($1::date - 1)::text AS d`, [day])).rows[0].d;

    const status: Record<string, 'ok' | 'unavailable'> = {};
    const values: Record<string, [number, number | null]> = {};
    const reasons: Record<string, string> = {};
    const run = async (name: KpiDefinition['source'], fallback: Source | null) => {
      const s = opts.sources?.[name] ?? fallback;
      if (!s || s === 'down') { status[name] = 'unavailable'; reasons[name] = s === 'down' ? 'source is down' : 'not connected'; return; }
      try {
        await c.query('SAVEPOINT kpi_source');
        Object.assign(values, await s(c, day, prevDay));
        await c.query('RELEASE SAVEPOINT kpi_source');
        status[name] = 'ok';
      } catch (e) {
        await c.query('ROLLBACK TO SAVEPOINT kpi_source');
        status[name] = 'unavailable'; reasons[name] = (e as Error).message.slice(0, 200);
      }
    };
    await run('crm_db', crmSource);
    // Accounting is only a source when an accounting adapter is actually connected (capability data).
    const acct = (await c.query(`SELECT connected AND authorized AS ok FROM integration_connections WHERE environment = $1 AND adapter = 'accounting'`, [rt.env])).rows[0];
    if (opts.sources?.accounting) await run('accounting', null);
    else {
      status.accounting = 'unavailable';
      reasons.accounting = acct?.ok ? 'accounting adapter has no KPI source configured yet' : 'accounting system not connected';
    }

    const kpis: KpiValue[] = KPIS.map((k) => {
      const v = status[k.source] === 'ok' ? values[k.key] : undefined;
      return v ? { key: k.key, name: k.name, value: v[0], previous: v[1], status: 'ok', definition: k.definition }
        : { key: k.key, name: k.name, value: null, previous: null, status: 'unavailable', reason: reasons[k.source] ?? 'no data', definition: k.definition };
    });
    const get = (key: string) => kpis.find((k) => k.key === key)!;
    const exceptions: string[] = [];
    if ((get('unanswered_leads').value ?? 0) > 0) exceptions.push('unanswered_leads');
    if ((get('overdue_follow_ups').value ?? 0) > 0) exceptions.push('overdue_follow_ups');
    if ((get('manual_queue_open').value ?? 0) > 0) exceptions.push('manual_queue_open');
    for (const [s, st] of Object.entries(status)) if (st === 'unavailable') exceptions.push(`source_unavailable:${s}`);
    return { organizationId: orgId, day, computedAt: rt.now().toISOString(), kpis, exceptions, sources: status };
  });
}
