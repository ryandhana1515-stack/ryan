import { describe, expect, it } from 'vitest';
import { checkCapability, executeTool, redact, standardRegistry, ToolRegistry } from '@edg/core';
import * as core from '@edg/core';
import { z } from 'zod';
import { ctx, ORG, setup } from './helpers';

const wa = { to: '+6591234567', text: 'Hi, thanks for your enquiry.', dedupeKey: 'lead_1:ack' };

describe('B1 tool registry', () => {
  it('has the standard catalogue with complete safety metadata', () => {
    const reg = standardRegistry();
    const names = reg.list().map((t) => t.name);
    for (const n of ['database.create', 'database.migrate', 'database.query', 'database.backup', 'storage.create', 'auth.configure', 'github.createRepository',
      'github.commit', 'deployment.create', 'deployment.deploy', 'deployment.rollback', 'n8n.createWorkflow', 'n8n.updateWorkflow', 'n8n.testWorkflow',
      'crm.createContact', 'crm.updateContact', 'crm.createDeal', 'whatsapp.send', 'email.createDraft', 'email.send', 'accounting.createInvoice',
      'inventory.update', 'report.generate']) expect(names).toContain(n);
    for (const t of reg.list()) {
      expect(t.level).toMatch(/^L[0-5]$/);
      expect(t.allowedEnvironments.length).toBeGreaterThan(0);
      expect(t.timeoutMs).toBeGreaterThan(0);
      expect(t.retry.attempts).toBeGreaterThanOrEqual(1);
      if (t.idempotent) expect(t.idempotencyKey).toBeTypeOf('function');
      if (t.level === 'L4' || t.level === 'L5') expect(t.requiresApproval).toBe(true);
      expect('execute' in t).toBe(false); // descriptors cannot run tools
    }
  });

  it('exposes no way to run a tool outside executeTool()', () => {
    expect((core as Record<string, unknown>).internalExecutor).toBeUndefined();
  });

  it('refuses an L5 tool that does not require approval', () => {
    const r = new ToolRegistry();
    expect(() => r.register({ name: 'x.bad', category: 'crm', adapter: 'crm', description: '', input: z.object({}), output: z.object({}), level: 'L5', requiredScopes: [],
      allowedEnvironments: ['development'], requiresApproval: false, idempotent: false, supportsDryRun: false, timeoutMs: 1, retry: { attempts: 1, baseDelayMs: 0, maxDelayMs: 0 }, execute: async () => ({}) })).toThrow(/must require approval/);
  });
});

describe('B4 capability detection', () => {
  it('returns CONNECTION_REQUIRED with the human step when nothing is connected', async () => {
    const { deps } = setup();
    const c = await checkCapability(deps.registry.describe('whatsapp.send')!, ORG, 'development', deps);
    expect(c.status).toBe('CONNECTION_REQUIRED');
    expect(c.humanAction).toMatch(/WHATSAPP_ACCESS_TOKEN/);
  });
  it('returns AUTHORIZATION_REQUIRED, PERMISSION_DENIED, HUMAN_ACTION_REQUIRED, NOT_SUPPORTED as appropriate', async () => {
    const { deps, connections } = setup();
    const t = deps.registry.describe('whatsapp.send')!;
    connections.set(ORG, 'development', { adapter: 'messaging', provider: 'mock:messaging', connected: true, authorized: false, scopes: [], environments: ['development'] });
    expect((await checkCapability(t, ORG, 'development', deps)).status).toBe('AUTHORIZATION_REQUIRED');
    connections.set(ORG, 'development', { adapter: 'messaging', provider: 'mock:messaging', connected: true, authorized: true, scopes: [], environments: ['development'] });
    expect((await checkCapability(t, ORG, 'development', deps)).status).toBe('PERMISSION_DENIED');
    connections.set(ORG, 'development', { adapter: 'messaging', provider: 'mock:messaging', connected: true, authorized: true, scopes: ['messages:send'], environments: ['development'], pendingHumanAction: 'Verify the business number in Meta Business Manager' });
    expect((await checkCapability(t, ORG, 'development', deps)).status).toBe('HUMAN_ACTION_REQUIRED');
    expect((await checkCapability(deps.registry.describe('n8n.createWorkflow')!, ORG, 'production', deps)).status).toBe('NOT_SUPPORTED');
  });
  it('never lets a MOCK adapter count as AVAILABLE in production', async () => {
    const { deps } = setup({ connect: ['crm'], env: 'production' });
    const c = await checkCapability(deps.registry.describe('crm.createContact')!, ORG, 'production', deps);
    expect(c.status).toBe('NOT_SUPPORTED');
    expect(c.detail).toMatch(/MOCK/);
  });
});

describe('B1 executeTool pipeline', () => {
  it('blocks when the provider is not connected, and audits the block', async () => {
    const { deps, audit, adapters } = setup();
    const r = await executeTool('whatsapp.send', wa, ctx(), deps);
    expect(r.outcome).toBe('blocked');
    expect(r.reason).toBe('capability:CONNECTION_REQUIRED');
    expect(adapters.messaging.sent).toHaveLength(0);
    const log = await audit.list(ORG);
    expect(log).toHaveLength(1);
    expect(log[0]!.result).toBe('blocked');
  });

  it('blocks invalid input before anything else', async () => {
    const { deps } = setup({ connect: ['messaging'] });
    const r = await executeTool('whatsapp.send', { ...wa, to: '91234567' }, ctx(), deps);
    expect(r.outcome).toBe('blocked');
    expect(r.reason).toMatch(/invalid_input: to E\.164/);
  });

  it('succeeds, writes audit, emits an event', async () => {
    const { deps, audit, events, adapters } = setup({ connect: ['messaging'] });
    const r = await executeTool('whatsapp.send', wa, ctx(), deps);
    expect(r.outcome).toBe('success');
    expect(adapters.messaging.sent).toHaveLength(1);
    expect((await audit.list(ORG)).map((a) => a.result)).toEqual(['success']);
    expect(events.events.map((e) => e.type)).toContain('tool.executed');
  });

  it('ignores a duplicate call with the same idempotency key', async () => {
    const { deps, adapters, audit } = setup({ connect: ['messaging'] });
    const a = await executeTool('whatsapp.send', wa, ctx(), deps);
    const b = await executeTool('whatsapp.send', wa, ctx({ correlationId: 'corr-2' }), deps);
    expect(a.outcome).toBe('success');
    expect(b.outcome).toBe('duplicate');
    expect(b.output).toEqual(a.output);
    expect(adapters.messaging.sent).toHaveLength(1);
    expect((await audit.list(ORG)).map((x) => x.result)).toEqual(['success', 'duplicate']);
  });

  it('retries with backoff, then records the failure in the audit log', async () => {
    const { deps, adapters, audit, events } = setup({ connect: ['messaging'] });
    adapters.messaging.outage = true;
    const r = await executeTool('whatsapp.send', wa, ctx(), deps);
    expect(r.outcome).toBe('failed');
    expect(r.attempts).toBe(3);
    const log = await audit.list(ORG);
    expect(log[0]!.result).toBe('failed');
    expect(log[0]!.error).toMatch(/simulated outage/);
    expect(events.events.map((e) => e.type)).toContain('tool.failed');
  });

  it('recovers when a retry succeeds', async () => {
    const { deps, adapters } = setup({ connect: ['messaging'] });
    adapters.messaging.failTimes = 2;
    const r = await executeTool('whatsapp.send', wa, ctx(), deps);
    expect(r.outcome).toBe('success');
    expect(r.attempts).toBe(3);
  });

  it('denies a role that may not use the tool', async () => {
    const { deps } = setup({ connect: ['messaging', 'deployment'] });
    expect((await executeTool('whatsapp.send', wa, ctx({ actor: { type: 'user', id: 'v1', role: 'viewer' } }), deps)).reason).toMatch(/^permission_denied/);
    expect((await executeTool('deployment.create', { project: 'x' }, ctx(), deps)).reason).toMatch(/may not use deployment tools/);
  });

  it('supports dry runs without side effects', async () => {
    const { deps, adapters } = setup({ connect: ['messaging'] });
    const r = await executeTool('whatsapp.send', wa, ctx({ dryRun: true }), deps);
    expect(r.outcome).toBe('dry_run');
    expect(adapters.messaging.sent).toHaveLength(0);
  });
});

describe('B5/B15 approval gate', () => {
  const bulk = { recipients: ['+6591111111', '+6592222222'], template: { name: 'promo', language: 'en' } };
  const owner = { id: 'u_owner', name: 'Ryan Dhana', role: 'owner' };

  it('L5 is never autonomous: the first call only creates a pending approval', async () => {
    const { deps, adapters } = setup({ connect: ['messaging'] });
    const r = await executeTool('whatsapp.bulkSend', bulk, ctx({ actor: { type: 'user', id: 'u_owner', role: 'owner' } }), deps);
    expect(r.outcome).toBe('pending_approval');
    expect(r.approvalId).toBeTruthy();
    expect(adapters.messaging.sent).toHaveLength(0);
  });

  it('blocks without approval, runs once after a named approver approves, and the approval cannot be reused', async () => {
    const { deps, adapters } = setup({ connect: ['messaging'] });
    const requester = ctx({ actor: { type: 'agent', id: 'marketing-agent', role: 'owner' } });
    const p = await executeTool('whatsapp.bulkSend', bulk, requester, deps);
    expect((await executeTool('whatsapp.bulkSend', bulk, { ...requester, approvalId: p.approvalId }, deps)).reason).toBe('approval_pending');
    await expect(deps.approvals.decide(p.approvalId!, { id: 'u_sales', name: 'Sam', role: 'sales' }, 'APPROVED')).rejects.toThrow(/cannot approve/);
    await expect(deps.approvals.decide(p.approvalId!, { ...owner, name: ' ' }, 'APPROVED')).rejects.toThrow(/named person/);
    await deps.approvals.decide(p.approvalId!, owner, 'APPROVED');
    // approval is bound to the exact input
    expect((await executeTool('whatsapp.bulkSend', { ...bulk, recipients: [...bulk.recipients, '+6593333333'] }, { ...requester, approvalId: p.approvalId }, deps)).reason).toBe('approval_scope_mismatch');
    const ok = await executeTool('whatsapp.bulkSend', bulk, { ...requester, approvalId: p.approvalId }, deps);
    expect(ok.outcome).toBe('success');
    expect(adapters.messaging.sent).toHaveLength(2);
    expect((await executeTool('whatsapp.bulkSend', bulk, { ...requester, approvalId: p.approvalId }, deps)).reason).toBe('approval_consumed');
  });

  it('L4 production deploy needs a passing QA gate before it can even request approval', async () => {
    const { deps } = setup({ connect: ['deployment'], env: 'production' });
    // mock adapters are refused in production outright
    const r = await executeTool('deployment.deployProduction', { project: 'acme', ref: 'abc123', rollbackTo: 'dpl_prev' }, ctx({ environment: 'production', actor: { type: 'user', id: 'a', role: 'admin' } }), deps);
    expect(r.outcome).toBe('blocked');
    expect(r.reason).toBe('capability:NOT_SUPPORTED');
  });

  it('per-client thresholds can require approval for otherwise-L2 actions', async () => {
    const { deps } = setup({ connect: ['accounting'] });
    deps.thresholds = [(def, input) => (def.name === 'accounting.createInvoice' && (input as { lines: { amountCents: number }[] }).lines.reduce((s, l) => s + l.amountCents, 0) > 1_000_000
      ? { approverRoles: ['owner'], reason: 'invoice above SGD 10,000' } : null)];
    const r = await executeTool('accounting.createInvoice', { customerRef: 'C1', currency: 'SGD', lines: [{ description: 'x', amountCents: 2_000_000 }], dedupeKey: 'q1' }, ctx({ actor: { type: 'user', id: 'm', role: 'manager' } }), deps);
    expect(r.outcome).toBe('pending_approval');
  });
});

describe('secrets never reach the audit log', () => {
  it('redacts secret-looking keys', () => {
    expect(redact({ accessToken: 'abc', nested: { api_key: 'k', ok: 1 }, list: [{ password: 'p' }] })).toEqual({ accessToken: '[REDACTED]', nested: { api_key: '[REDACTED]', ok: 1 }, list: [{ password: '[REDACTED]' }] });
  });
});
