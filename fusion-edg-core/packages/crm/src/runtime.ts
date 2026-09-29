import {
  ApprovalEngine, executeTool, mockAdapters, standardRegistry, type AdapterSet, type Environment, type PipelineDeps, type ToolContext, type ToolResult,
} from '@edg/core';
import { PgApprovalStore, PgAuditStore, PgConnectionStore, PgIdempotencyStore, PgOutboxSink, type Client, type Pool } from '@edg/db';
import { CollectingAlertHook, type AlertHook } from '@edg/events';

/**
 * Everything the slice needs, wired once. In development/test the adapters are MOCK (labelled mock:*), and the
 * capability rows in integration_connections say what is "connected". In staging/production, real adapters are
 * injected and the same capability checks apply (MOCK adapters are refused in production by checkCapability).
 */
export interface Runtime {
  pool: Pool;
  env: Environment;
  adapters: AdapterSet;
  alerts: AlertHook;
  pipeline: PipelineDeps;
  /** Run a tool through the one safety pipeline. */
  tool<O = unknown>(name: string, input: unknown, ctx: Omit<ToolContext, 'environment'>): Promise<ToolResult<O>>;
  now: () => Date;
}

export function createRuntime(pool: Pool, opts: { env?: Environment; adapters?: AdapterSet; alerts?: AlertHook; now?: () => Date } = {}): Runtime {
  const env = opts.env ?? ((process.env.EDG_ENV as Environment) || 'development');
  const adapters = opts.adapters ?? mockAdapters();
  const pipeline: PipelineDeps = {
    registry: standardRegistry(), adapters, connections: new PgConnectionStore(pool), approvals: new ApprovalEngine(new PgApprovalStore(pool)),
    audit: new PgAuditStore(pool), idempotency: new PgIdempotencyStore(pool), events: new PgOutboxSink(pool),
  };
  return {
    pool, env, adapters, alerts: opts.alerts ?? new CollectingAlertHook(), pipeline, now: opts.now ?? (() => new Date()),
    tool: (name, input, ctx) => executeTool(name, input, { ...ctx, environment: env }, pipeline),
  };
}

/** Audit + outbox writers that join an open business transaction. */
export const txWriters = (pool: Pool, c: Client) => ({ audit: new PgAuditStore(pool, c), events: new PgOutboxSink(pool, c) });
