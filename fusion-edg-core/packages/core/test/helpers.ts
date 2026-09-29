import {
  ApprovalEngine, InMemoryApprovalStore, InMemoryAuditStore, InMemoryConnectionStore, InMemoryEventSink, InMemoryIdempotencyStore,
  mockAdapters, standardRegistry, type AdapterKind, type Environment, type PipelineDeps, type ToolContext,
} from '@edg/core';

export const ORG = 'org_alpha';
export const OTHER_ORG = 'org_beta';

export function setup(opts: { connect?: AdapterKind[]; env?: Environment; scopes?: string[] } = {}) {
  const adapters = mockAdapters();
  const connections = new InMemoryConnectionStore();
  const env = opts.env ?? 'development';
  for (const a of opts.connect ?? []) {
    connections.set(ORG, env, { adapter: a, provider: `mock:${a}`, connected: true, authorized: true, environments: [env],
      scopes: opts.scopes ?? ['contacts:write', 'deals:write', 'messages:send', 'mail:send', 'repo', 'projects:write', 'accounting.transactions'] });
  }
  const audit = new InMemoryAuditStore();
  const events = new InMemoryEventSink();
  const approvalStore = new InMemoryApprovalStore();
  const deps: PipelineDeps = {
    registry: standardRegistry(), adapters, connections, approvals: new ApprovalEngine(approvalStore), audit,
    idempotency: new InMemoryIdempotencyStore(), events, sleep: async () => {},
  };
  return { deps, adapters, connections, audit, events, approvalStore };
}

export const ctx = (over: Partial<ToolContext> = {}): ToolContext => ({
  organizationId: ORG, actor: { type: 'user', id: 'u_sales_1', role: 'sales' }, environment: 'development', correlationId: 'corr-1', ...over,
});
