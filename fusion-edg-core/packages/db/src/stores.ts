import type {
  AdapterKind, ApprovalRequest, ApprovalStore, AuditEntry, AuditStore, BusinessEvent, Connection, ConnectionStore, Environment, EventSink,
  IdempotencyRecord, IdempotencyStore,
} from '@edg/core';
import { withTenant, type Client, type Pool, type TenantContext } from './client';

/**
 * Postgres implementations of the core stores. Each call runs as the tenant (RLS applies). When a Client is given
 * (inside a business transaction), writes join that transaction, which is how events/audit stay consistent with the
 * change they describe (transactional outbox).
 */
type Runner = <T>(fn: (c: Client) => Promise<T>) => Promise<T>;
const runner = (pool: Pool, t: (orgId: string) => TenantContext, client?: Client) =>
  (orgId: string): Runner => (fn) => (client ? fn(client) : withTenant(pool, t(orgId), fn));

export const systemTenant = (orgId: string): TenantContext => ({ organizationId: orgId, role: 'system', actorType: 'system' });

export class PgAuditStore implements AuditStore {
  private run: (orgId: string) => Runner;
  constructor(private pool: Pool, client?: Client) { this.run = runner(pool, systemTenant, client); }
  async append(e: Omit<AuditEntry, 'id' | 'createdAt'>): Promise<AuditEntry> {
    return this.run(e.organizationId)(async (c) => {
      const r = await c.query(
        `INSERT INTO audit_logs (organization_id, actor_type, actor_id, action, resource, previous_state, new_state, result, error, level, environment, workflow, correlation_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id, created_at`,
        [e.organizationId, e.actorType, e.actorId, e.action, e.resource ?? null, json(e.previousState), json(e.newState), e.result, e.error ?? null, e.level ?? null, e.environment ?? null, e.workflow ?? null, e.correlationId],
      );
      return { ...e, id: r.rows[0].id, createdAt: r.rows[0].created_at.toISOString() };
    });
  }
  async list(orgId: string): Promise<AuditEntry[]> {
    return withTenant(this.pool, { organizationId: orgId, role: 'admin' }, async (c) =>
      (await c.query('SELECT * FROM audit_logs WHERE organization_id = $1 ORDER BY created_at, id', [orgId])).rows.map((r) => ({
        id: r.id, organizationId: r.organization_id, actorType: r.actor_type, actorId: r.actor_id, action: r.action, resource: r.resource ?? undefined,
        previousState: r.previous_state ?? undefined, newState: r.new_state ?? undefined, result: r.result, error: r.error ?? undefined, level: r.level ?? undefined,
        environment: r.environment ?? undefined, workflow: r.workflow ?? undefined, correlationId: r.correlation_id, createdAt: r.created_at.toISOString(),
      })));
  }
}

export class PgIdempotencyStore implements IdempotencyStore {
  private run: (orgId: string) => Runner;
  constructor(pool: Pool, client?: Client) { this.run = runner(pool, systemTenant, client); }
  async get(orgId: string, key: string): Promise<IdempotencyRecord | undefined> {
    return this.run(orgId)(async (c) => {
      const r = await c.query('SELECT key, organization_id, tool, result, created_at FROM idempotency_keys WHERE organization_id = $1 AND key = $2', [orgId, key]);
      const x = r.rows[0];
      return x && { key: x.key, organizationId: x.organization_id, tool: x.tool, result: x.result, createdAt: x.created_at.toISOString() };
    });
  }
  async put(orgId: string, key: string, tool: string, result: unknown): Promise<boolean> {
    return this.run(orgId)(async (c) => {
      const r = await c.query('INSERT INTO idempotency_keys (organization_id, key, tool, result) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING', [orgId, key, tool, json(result)]);
      return r.rowCount === 1;
    });
  }
}

/** Transactional outbox writer. */
export class PgOutboxSink implements EventSink {
  private run: (orgId: string) => Runner;
  constructor(pool: Pool, client?: Client) { this.run = runner(pool, systemTenant, client); }
  async emit(e: Omit<BusinessEvent, 'id' | 'createdAt'>): Promise<BusinessEvent> {
    return this.run(e.organizationId)(async (c) => {
      const r = await c.query('INSERT INTO events (organization_id, type, payload, correlation_id) VALUES ($1,$2,$3,$4) RETURNING id, created_at', [e.organizationId, e.type, json(e.payload), e.correlationId]);
      return { ...e, id: r.rows[0].id, createdAt: r.rows[0].created_at.toISOString() };
    });
  }
}

export class PgApprovalStore implements ApprovalStore {
  constructor(private pool: Pool) {}
  async create(r: ApprovalRequest) {
    await withTenant(this.pool, systemTenant(r.organizationId), (c) => c.query(
      `INSERT INTO approvals (id, organization_id, tool, level, scope_hash, scope_summary, requested_by, approver_roles, reason, status, expires_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [r.id, r.organizationId, r.tool, r.level, r.scopeHash, r.scopeSummary, r.requestedBy, r.approverRoles, r.reason, r.status, r.expiresAt, r.createdAt]));
  }
  /** Approvals are looked up by id across the org the caller is in; the engine then checks org/tool/scope. */
  async get(id: string, orgId?: string): Promise<ApprovalRequest | undefined> {
    const find = async (c: Client) => (await c.query('SELECT * FROM approvals WHERE id = $1', [id])).rows[0];
    const row = orgId ? await withTenant(this.pool, systemTenant(orgId), find) : (await this.pool.query('SELECT * FROM approvals WHERE id = $1', [id])).rows[0];
    return row && {
      id: row.id, organizationId: row.organization_id, tool: row.tool, level: row.level, scopeHash: row.scope_hash, scopeSummary: row.scope_summary,
      requestedBy: row.requested_by, approverRoles: row.approver_roles, reason: row.reason, status: row.status, approver: row.approver ?? undefined,
      decidedAt: row.decided_at?.toISOString(), expiresAt: row.expires_at.toISOString(), createdAt: row.created_at.toISOString(),
    };
  }
  async update(r: ApprovalRequest) {
    await withTenant(this.pool, systemTenant(r.organizationId), (c) => c.query('UPDATE approvals SET status = $2, approver = $3, decided_at = $4 WHERE id = $1',
      [r.id, r.status, json(r.approver), r.decidedAt ?? null]));
  }
}

export class PgConnectionStore implements ConnectionStore {
  constructor(private pool: Pool) {}
  async get(orgId: string, env: Environment, adapter: AdapterKind): Promise<Connection | undefined> {
    return withTenant(this.pool, systemTenant(orgId), async (c) => {
      const r = (await c.query('SELECT * FROM integration_connections WHERE organization_id = $1 AND environment = $2 AND adapter = $3', [orgId, env, adapter])).rows[0];
      return r && { adapter: r.adapter, provider: r.provider, connected: r.connected, authorized: r.authorized, scopes: r.scopes, planFeatures: r.plan_features,
        unsupported: r.unsupported, environments: [r.environment], pendingHumanAction: r.pending_human_action ?? undefined };
    });
  }
}

const json = (v: unknown) => (v === undefined ? null : JSON.stringify(v));
