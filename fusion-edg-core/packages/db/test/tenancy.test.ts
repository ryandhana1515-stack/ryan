import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { backup, createPool, DEMO, migrate, restore, schemaVersion, withTenant, type Pool } from '@edg/db';
import { closeDb, freshDb, HAS_DB } from './testdb';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const A = DEMO.orgA, B = DEMO.orgB;
const as = (orgId: string, role: string, actorType: 'user' | 'agent' | 'system' = 'user', userId?: string) => ({ organizationId: orgId, role, actorType, userId });

describe.skipIf(!HAS_DB)('B2 multi-tenant database (Row Level Security)', () => {
  let owner: Pool, app: Pool;
  beforeAll(async () => ({ owner, app } = await freshDb()));
  afterAll(closeDb);

  it('applies every migration and records the schema version', async () => {
    expect(await schemaVersion(owner)).toBe('004_rls.sql');
    expect(await migrate(owner)).toEqual([]); // idempotent: nothing left to apply
  });

  it('forces RLS on every tenant table', async () => {
    const r = await owner.query(`SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT (c.relrowsecurity AND c.relforcerowsecurity)`);
    expect(r.rows.map((x) => x.relname)).toEqual([]);
    const noOrg = await owner.query(`SELECT table_name FROM information_schema.tables t WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name <> 'organizations' AND NOT EXISTS (SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'organization_id')`);
    expect(noOrg.rows).toEqual([]);
  });

  it('the app role cannot bypass RLS', async () => {
    const r = await app.query(`SELECT rolbypassrls, rolsuper FROM pg_roles WHERE rolname = current_user`);
    expect(r.rows[0]).toEqual({ rolbypassrls: false, rolsuper: false });
  });

  it('no tenant context = no rows', async () => {
    expect((await app.query('SELECT count(*)::int AS n FROM leads')).rows[0].n).toBe(0);
    expect((await app.query('SELECT count(*)::int AS n FROM contacts')).rows[0].n).toBe(0);
  });

  it('CRUD per role: sales creates and updates in its own org; viewer reads but cannot write; only admins delete', async () => {
    const contactId = await withTenant(app, as(A, 'sales', 'user', DEMO.usersA.sales1), async (c) => {
      const r = await c.query(`INSERT INTO contacts (organization_id, name, phone_e164, source) VALUES ($1, 'CRUD Test (FAKE)', '+6590000099', 'test') RETURNING id`, [A]);
      await c.query(`UPDATE contacts SET name = 'CRUD Test Renamed (FAKE)' WHERE id = $1`, [r.rows[0].id]);
      return r.rows[0].id as string;
    });
    const seen = await withTenant(app, as(A, 'viewer'), (c) => c.query('SELECT name FROM contacts WHERE id = $1', [contactId]));
    expect(seen.rows[0].name).toBe('CRUD Test Renamed (FAKE)');
    await expect(withTenant(app, as(A, 'viewer'), (c) => c.query(`INSERT INTO contacts (organization_id, phone_e164) VALUES ($1, '+6590000098')`, [A])))
      .rejects.toThrow(/row-level security/);
    const viewerUpdate = await withTenant(app, as(A, 'viewer'), (c) => c.query(`UPDATE contacts SET name = 'x' WHERE id = $1`, [contactId]));
    expect(viewerUpdate.rowCount).toBe(0);
    const salesDelete = await withTenant(app, as(A, 'sales'), (c) => c.query('DELETE FROM contacts WHERE id = $1', [contactId]));
    expect(salesDelete.rowCount).toBe(0);
    const adminDelete = await withTenant(app, as(A, 'admin'), (c) => c.query('DELETE FROM contacts WHERE id = $1', [contactId]));
    expect(adminDelete.rowCount).toBe(1);
  });

  it('CRITICAL: cross-tenant read/write/delete attempts fail', async () => {
    const aAdmin = as(A, 'admin');
    // read: Beta's lead and contact are invisible to Acme, even by exact id
    const read = await withTenant(app, aAdmin, (c) => c.query(`SELECT * FROM leads WHERE id = '0000000b-0000-4000-8000-0000000000d1'`));
    expect(read.rowCount).toBe(0);
    const readAll = await withTenant(app, aAdmin, (c) => c.query('SELECT DISTINCT organization_id FROM contacts'));
    expect(readAll.rows.map((r) => r.organization_id)).toEqual([A]);
    // write into Beta while acting as Acme
    await expect(withTenant(app, aAdmin, (c) => c.query(`INSERT INTO contacts (organization_id, phone_e164) VALUES ($1, '+6590000097')`, [B]))).rejects.toThrow(/row-level security/);
    // update/delete Beta's rows
    expect((await withTenant(app, aAdmin, (c) => c.query(`UPDATE leads SET next_action = 'hijack' WHERE organization_id = $1`, [B]))).rowCount).toBe(0);
    expect((await withTenant(app, aAdmin, (c) => c.query(`DELETE FROM contacts WHERE organization_id = $1`, [B]))).rowCount).toBe(0);
    // moving an own row into another tenant is refused
    await expect(withTenant(app, aAdmin, (c) => c.query(`UPDATE contacts SET organization_id = $1 WHERE organization_id = $2`, [B, A]))).rejects.toThrow(/row-level security/);
    // forged JWT-style claim for another org is still just "that org": Acme's context cannot be widened
    const claims = await withTenant(app, aAdmin, async (c) => {
      await c.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ organization_id: A, app_role: 'admin' })]);
      return c.query('SELECT count(*)::int AS n FROM leads WHERE organization_id = $1', [B]);
    });
    expect(claims.rows[0].n).toBe(0);
    // Beta's data is untouched
    const b = await withTenant(app, as(B, 'owner'), (c) => c.query(`SELECT next_action FROM leads WHERE id = '0000000b-0000-4000-8000-0000000000d1'`));
    expect(b.rows[0].next_action).toBe('Call back');
  });

  it('every active lead must have owner, last interaction, next action and date', async () => {
    await expect(withTenant(app, as(A, 'sales'), (c) => c.query(
      `INSERT INTO leads (organization_id, contact_id, source, channel, status) VALUES ($1, '0000000a-0000-4000-8000-0000000000c1', 'test', 'website_form', 'new')`, [A])))
      .rejects.toThrow(/active_lead_is_owned/);
  });

  it('WON/LOST is a human decision: an agent cannot close a deal', async () => {
    const pipe = (await owner.query('SELECT id FROM pipelines WHERE organization_id = $1', [A])).rows[0].id;
    const deal = await withTenant(app, as(A, 'sales', 'user'), (c) => c.query(
      `INSERT INTO deals (organization_id, contact_id, pipeline_id, title, stage) VALUES ($1, '0000000a-0000-4000-8000-0000000000c1', $2, 'Test deal (FAKE)', 'proposal') RETURNING id`, [A, pipe]));
    await expect(withTenant(app, as(A, 'agent', 'agent'), (c) => c.query(`UPDATE deals SET status = 'won' WHERE id = $1`, [deal.rows[0].id]))).rejects.toThrow(/must be set by a human/);
    const human = await withTenant(app, as(A, 'sales', 'user'), (c) => c.query(`UPDATE deals SET status = 'won', closed_at = now() WHERE id = $1`, [deal.rows[0].id]));
    expect(human.rowCount).toBe(1);
  });

  it('audit_logs is append-only for everyone, including the owner role and the database owner', async () => {
    await withTenant(app, as(A, 'system', 'system'), (c) => c.query(
      `INSERT INTO audit_logs (organization_id, actor_type, actor_id, action, result, correlation_id) VALUES ($1, 'system', 'test', 'test.action', 'success', 'c1')`, [A]));
    await expect(withTenant(app, as(A, 'owner'), (c) => c.query(`UPDATE audit_logs SET result = 'failed'`))).rejects.toThrow(/permission denied/);
    await expect(withTenant(app, as(A, 'owner'), (c) => c.query(`DELETE FROM audit_logs`))).rejects.toThrow(/permission denied/);
    await expect(owner.query(`DELETE FROM audit_logs`)).rejects.toThrow(/append-only/);
    await expect(owner.query(`TRUNCATE audit_logs`)).rejects.toThrow(/append-only/);
  });

  it('knowledge: non-managers only see approved items for their role', async () => {
    await withTenant(app, as(A, 'manager'), (c) => c.query(`INSERT INTO knowledge_items (organization_id, title, body, source, category, approved) VALUES
      ($1, 'Opening hours', '9-6 weekdays (FAKE)', 'SOP v1', 'faq', true), ($1, 'Draft pricing', 'not approved (FAKE)', 'draft', 'pricing', false)`, [A]));
    const sales = await withTenant(app, as(A, 'sales'), (c) => c.query('SELECT title FROM knowledge_items ORDER BY title'));
    expect(sales.rows.map((r) => r.title)).toEqual(['Opening hours']);
    const mgr = await withTenant(app, as(A, 'manager'), (c) => c.query('SELECT title FROM knowledge_items ORDER BY title'));
    expect(mgr.rows).toHaveLength(2);
  });

  it('backup + restore works (tried once locally)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'edg-backup-'));
    const b = backup(process.env.TEST_DATABASE_URL!, join(dir, 'edg_test.dump'));
    expect(b.bytes).toBeGreaterThan(1000);
    const url = new URL(process.env.TEST_DATABASE_URL!);
    const scratch = 'edg_test_restore_check';
    url.pathname = '/postgres';
    const admin = createPool(url.toString(), 1);
    await admin.query(`DROP DATABASE IF EXISTS ${scratch}`);
    await admin.query(`CREATE DATABASE ${scratch}`);
    url.pathname = `/${scratch}`;
    restore(b.file, url.toString());
    const restored = createPool(url.toString(), 1);
    const count = async (p: Pool, t: string) => (await p.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n;
    for (const t of ['organizations', 'users', 'contacts', 'leads', 'deals', 'audit_logs']) expect(await count(restored, t)).toBe(await count(owner, t));
    // RLS survives the restore
    const rls = await restored.query(`SELECT bool_and(relforcerowsecurity) AS ok FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r'`);
    expect(rls.rows[0].ok).toBe(true);
    await restored.end();
    await admin.query(`DROP DATABASE ${scratch}`);
    await admin.end();
    execFileSync('rm', ['-rf', dir]);
  });
});
