import type { Pool } from './client';

/**
 * FAKE test data only. Two demo organisations so every test can prove tenant isolation. Phone numbers are in the
 * +65 9000 0xxx block and emails use example.com / example.org (reserved for documentation).
 */
export const DEMO = {
  orgA: '00000000-0000-4000-8000-00000000000a',
  orgB: '00000000-0000-4000-8000-00000000000b',
  usersA: {
    owner: '0000000a-0000-4000-8000-000000000001',
    admin: '0000000a-0000-4000-8000-000000000002',
    manager: '0000000a-0000-4000-8000-000000000003',
    sales1: '0000000a-0000-4000-8000-000000000004',
    sales2: '0000000a-0000-4000-8000-000000000005',
    support: '0000000a-0000-4000-8000-000000000006',
    viewer: '0000000a-0000-4000-8000-000000000007',
  },
  usersB: {
    owner: '0000000b-0000-4000-8000-000000000001',
    sales1: '0000000b-0000-4000-8000-000000000004',
  },
} as const;

const ROLES: [string, string, string][] = [
  ['owner', 'Owner', 'L5'], ['admin', 'Administrator', 'L4'], ['manager', 'Manager', 'L3'], ['sales', 'Sales', 'L2'],
  ['support', 'Customer support', 'L2'], ['agent', 'AI agent', 'L2'], ['system', 'System automation', 'L3'], ['viewer', 'Viewer', 'L0'],
];

const STAGES = [
  { key: 'new', name: 'New enquiry', sla_hours: 1, owner_role: 'sales' },
  { key: 'contacted', name: 'Contacted', sla_hours: 24, owner_role: 'sales' },
  { key: 'qualified', name: 'Qualified', sla_hours: 72, owner_role: 'sales' },
  { key: 'proposal', name: 'Proposal sent', sla_hours: 120, owner_role: 'sales' },
  { key: 'negotiation', name: 'Negotiation', sla_hours: 168, owner_role: 'manager' },
];

/** Seeds as the migration owner (bypasses RLS); tests then act through the RLS-bound app role. */
export async function seed(pool: Pool) {
  const q = (sql: string, p: unknown[] = []) => pool.query(sql, p);
  await q(`INSERT INTO organizations (id, name, slug) VALUES ($1, 'Acme Demo Pte Ltd (FAKE)', 'acme-demo'), ($2, 'Beta Demo Pte Ltd (FAKE)', 'beta-demo') ON CONFLICT DO NOTHING`, [DEMO.orgA, DEMO.orgB]);
  for (const org of [DEMO.orgA, DEMO.orgB]) {
    for (const [key, name, lvl] of ROLES) await q('INSERT INTO roles (organization_id, key, name, max_level) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING', [org, key, name, lvl]);
    await q(`INSERT INTO pipelines (organization_id, name, stages, is_default) SELECT $1, 'Sales', $2::jsonb, true WHERE NOT EXISTS (SELECT 1 FROM pipelines WHERE organization_id = $1)`, [org, JSON.stringify(STAGES)]);
  }
  const u = DEMO.usersA;
  const usersA: [string, string, string, boolean][] = [
    [u.owner, 'Olivia Owner (FAKE)', 'owner', false], [u.admin, 'Adam Admin (FAKE)', 'admin', false], [u.manager, 'Mona Manager (FAKE)', 'manager', false],
    [u.sales1, 'Sam Sales (FAKE)', 'sales', true], [u.sales2, 'Siti Sales (FAKE)', 'sales', true], [u.support, 'Sunny Support (FAKE)', 'support', false], [u.viewer, 'Vic Viewer (FAKE)', 'viewer', false],
  ];
  for (const [id, name, role, pool_] of usersA) {
    await q('INSERT INTO users (id, organization_id, name, email, role_key, accepts_leads) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING', [id, DEMO.orgA, name, `${role}@acme.example.com`, role, pool_]);
  }
  await q('INSERT INTO users (id, organization_id, name, email, role_key, accepts_leads) VALUES ($1,$2,$3,$4,$5,$6),($7,$2,$8,$9,$10,$11) ON CONFLICT DO NOTHING',
    [DEMO.usersB.owner, DEMO.orgB, 'Bea Owner (FAKE)', 'owner@beta.example.org', 'owner', false, DEMO.usersB.sales1, 'Ben Sales (FAKE)', 'sales@beta.example.org', 'sales', true]);

  // Capability data for development/test: MOCK providers connected (labelled mock:*), accounting deliberately NOT
  // connected, so the brief proves it says "data unavailable" instead of inventing numbers.
  for (const org of [DEMO.orgA, DEMO.orgB]) {
    for (const env of ['development', 'test']) {
      for (const [adapter, scopes] of [['messaging', ['messages:send']], ['email', ['mail:send']], ['llm', []], ['crm', ['contacts:write', 'deals:write']]] as [string, string[]][]) {
        await q(`INSERT INTO integration_connections (organization_id, environment, adapter, provider, connected, authorized, scopes, status, secret_ref)
                 VALUES ($1,$2,$3,$4,true,true,$5,'tested',NULL) ON CONFLICT DO NOTHING`, [org, env, adapter, `mock:${adapter}`, scopes]);
      }
      await q(`INSERT INTO integration_connections (organization_id, environment, adapter, provider, connected, authorized, status)
               VALUES ($1,$2,'accounting','xero',false,false,'planned') ON CONFLICT DO NOTHING`, [org, env]);
    }
  }

  // One existing customer per org (Beta's is the cross-tenant target in tests).
  await q(`INSERT INTO contacts (id, organization_id, name, phone_e164, email_normalized, source) VALUES
      ('0000000a-0000-4000-8000-0000000000c1', $1, 'Existing Customer A (FAKE)', '+6590000001', 'existing.a@example.com', 'seed'),
      ('0000000b-0000-4000-8000-0000000000c1', $2, 'Existing Customer B (FAKE)', '+6590000002', 'existing.b@example.org', 'seed')
    ON CONFLICT DO NOTHING`, [DEMO.orgA, DEMO.orgB]);
  await q(`INSERT INTO leads (id, organization_id, contact_id, source, channel, status, owner_id, last_interaction_at, next_action, next_action_at, first_message) VALUES
      ('0000000b-0000-4000-8000-0000000000d1', $1, '0000000b-0000-4000-8000-0000000000c1', 'seed', 'website_form', 'contacted', $2, now() - interval '2 days', 'Call back', now() + interval '1 day', 'Beta secret enquiry (FAKE)')
    ON CONFLICT DO NOTHING`, [DEMO.orgB, DEMO.usersB.sales1]);
}
