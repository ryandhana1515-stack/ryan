import { createHash, randomUUID } from 'node:crypto';
import type { ToolDescriptor } from './registry';
import { LEVEL_RANK, type ActionLevel, type ToolCategory, type ToolContext } from './types';

/* ---------------------------------------------------------------- permissions (role → what it may request) */

export interface RolePermission { maxLevel: ActionLevel; categories: ToolCategory[] | '*' }
export type PermissionPolicy = Record<string, RolePermission>;

/**
 * Default roles. A role may REQUEST up to maxLevel; L4/L5 additionally always need an approval. Clients override
 * this per organisation (B9 roles/permissions).
 */
export const DEFAULT_PERMISSIONS: PermissionPolicy = {
  owner: { maxLevel: 'L5', categories: '*' },
  admin: { maxLevel: 'L4', categories: '*' },
  fusion_admin: { maxLevel: 'L4', categories: '*' },
  system: { maxLevel: 'L3', categories: '*' },
  manager: { maxLevel: 'L3', categories: ['crm', 'whatsapp', 'email', 'report', 'inventory', 'accounting'] },
  sales: { maxLevel: 'L2', categories: ['crm', 'whatsapp', 'email', 'report'] },
  support: { maxLevel: 'L2', categories: ['crm', 'whatsapp', 'email'] },
  agent: { maxLevel: 'L2', categories: ['crm', 'whatsapp', 'email', 'report'] },
  viewer: { maxLevel: 'L0', categories: ['report'] },
};

export function checkPermission(def: ToolDescriptor, ctx: ToolContext, policy: PermissionPolicy = DEFAULT_PERMISSIONS): { ok: true } | { ok: false; reason: string } {
  const p = policy[ctx.actor.role];
  if (!p) return { ok: false, reason: `role "${ctx.actor.role}" has no permissions` };
  if (p.categories !== '*' && !p.categories.includes(def.category)) return { ok: false, reason: `role "${ctx.actor.role}" may not use ${def.category} tools` };
  if (LEVEL_RANK[def.level] > LEVEL_RANK[p.maxLevel]) return { ok: false, reason: `role "${ctx.actor.role}" may request up to ${p.maxLevel}; ${def.name} is ${def.level}` };
  return { ok: true };
}

/* ---------------------------------------------------------------- approvals (B5, B15) */

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONSUMED';
export interface Approver { id: string; name: string; role: string }
export interface ApprovalRequest {
  id: string;
  organizationId: string;
  tool: string;
  level: ActionLevel;
  /** Hash of the exact input: an approval is only valid for what was approved. */
  scopeHash: string;
  scopeSummary: string;
  requestedBy: string;
  approverRoles: string[];
  reason: string;
  status: ApprovalStatus;
  approver?: Approver;
  decidedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface ApprovalStore {
  create(r: ApprovalRequest): Promise<void>;
  get(id: string): Promise<ApprovalRequest | undefined>;
  update(r: ApprovalRequest): Promise<void>;
}
export class InMemoryApprovalStore implements ApprovalStore {
  private rows = new Map<string, ApprovalRequest>();
  async create(r: ApprovalRequest) { this.rows.set(r.id, { ...r }); }
  async get(id: string) { const r = this.rows.get(id); return r && { ...r }; }
  async update(r: ApprovalRequest) { this.rows.set(r.id, { ...r }); }
}

/** Per-client thresholds (e.g. discount > 15% needs a manager). Return null when no approval is needed. */
export type ApprovalThreshold = (def: ToolDescriptor, input: unknown, ctx: ToolContext) => { approverRoles: string[]; reason: string } | null;

export function approvalRequirement(def: ToolDescriptor, input: unknown, ctx: ToolContext, thresholds: ApprovalThreshold[] = []) {
  if (def.level === 'L5') return { approverRoles: ['owner'], reason: 'L5 high-impact action: a named human approver is always required', named: true };
  if (def.level === 'L4') return { approverRoles: ['owner', 'fusion_admin'], reason: 'L4 production change: Ryan\'s explicit approval and a passing QA gate', named: true };
  if (def.requiresApproval) return { approverRoles: ['owner', 'admin', 'manager'], reason: `${def.name} requires approval`, named: false };
  for (const t of thresholds) { const r = t(def, input, ctx); if (r) return { ...r, named: false }; }
  return null;
}

export const scopeHash = (tool: string, orgId: string, input: unknown) =>
  createHash('sha256').update(JSON.stringify([tool, orgId, stable(input)])).digest('hex');

function stable(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, stable((v as Record<string, unknown>)[k])]));
  return v;
}

export class ApprovalEngine {
  constructor(private store: ApprovalStore, private ttlMs = 24 * 3600_000) {}

  async request(def: ToolDescriptor, input: unknown, ctx: ToolContext, req: { approverRoles: string[]; reason: string }): Promise<ApprovalRequest> {
    const now = Date.now();
    const r: ApprovalRequest = {
      id: randomUUID(), organizationId: ctx.organizationId, tool: def.name, level: def.level,
      scopeHash: scopeHash(def.name, ctx.organizationId, input), scopeSummary: JSON.stringify(input).slice(0, 500),
      requestedBy: `${ctx.actor.type}:${ctx.actor.id}`, approverRoles: req.approverRoles, reason: req.reason, status: 'PENDING',
      expiresAt: new Date(now + this.ttlMs).toISOString(), createdAt: new Date(now).toISOString(),
    };
    await this.store.create(r);
    return r;
  }

  async decide(id: string, approver: Approver, decision: 'APPROVED' | 'REJECTED'): Promise<ApprovalRequest> {
    const r = await this.store.get(id);
    if (!r) throw new Error('approval not found');
    if (r.status !== 'PENDING') throw new Error(`approval is ${r.status}`);
    if (!r.approverRoles.includes(approver.role)) throw new Error(`role "${approver.role}" cannot approve this (needs ${r.approverRoles.join(' or ')})`);
    if (!approver.name.trim()) throw new Error('approver must be a named person');
    if (`user:${approver.id}` === r.requestedBy) throw new Error('requester cannot approve their own request');
    const next = { ...r, status: decision, approver, decidedAt: new Date().toISOString() } as ApprovalRequest;
    await this.store.update(next);
    return next;
  }

  /** Valid only for the same org, tool and exact input, before expiry, once. */
  async verify(id: string, def: ToolDescriptor, input: unknown, ctx: ToolContext): Promise<{ ok: true; approval: ApprovalRequest } | { ok: false; reason: string }> {
    const r = await this.store.get(id);
    if (!r) return { ok: false, reason: 'approval_not_found' };
    if (r.organizationId !== ctx.organizationId || r.tool !== def.name) return { ok: false, reason: 'approval_scope_mismatch' };
    if (r.scopeHash !== scopeHash(def.name, ctx.organizationId, input)) return { ok: false, reason: 'approval_scope_mismatch' };
    if (Date.parse(r.expiresAt) < Date.now()) { if (r.status === 'PENDING') await this.store.update({ ...r, status: 'EXPIRED' }); return { ok: false, reason: 'approval_expired' }; }
    if (r.status !== 'APPROVED') return { ok: false, reason: `approval_${r.status.toLowerCase()}` };
    return { ok: true, approval: r };
  }

  async consume(r: ApprovalRequest) { await this.store.update({ ...r, status: 'CONSUMED' }); }
}
