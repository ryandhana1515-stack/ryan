import { checkCapability, type ConnectionStore } from './capability';
import { approvalRequirement, checkPermission, DEFAULT_PERMISSIONS, type ApprovalEngine, type ApprovalThreshold, type PermissionPolicy } from './policy';
import { internalExecutor, type ToolDescriptor, type ToolRegistry } from './registry';
import type { AuditStore, EventSink, IdempotencyStore } from './stores';
import type { AdapterSet, CapabilityCheck, ToolContext, ToolOutcome, ToolResult } from './types';

export interface PipelineDeps {
  registry: ToolRegistry;
  adapters: AdapterSet;
  connections: ConnectionStore;
  approvals: ApprovalEngine;
  audit: AuditStore;
  idempotency: IdempotencyStore;
  events: EventSink;
  permissions?: PermissionPolicy;
  thresholds?: ApprovalThreshold[];
  /** Injected for tests; defaults to real timers. */
  sleep?: (ms: number) => Promise<void>;
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The ONLY way to run a tool (B1):
 * validate input → capability → permission → approval (+QA gate for L4) → idempotency → dry-run → execute
 * (timeout + retry with backoff) → validate output → audit → event.
 * Every exit path writes an audit entry, including blocked and failed calls.
 */
export async function executeTool<O = unknown>(name: string, rawInput: unknown, ctx: ToolContext, deps: PipelineDeps): Promise<ToolResult<O>> {
  const def = deps.registry.describe(name);
  const base = { organizationId: ctx.organizationId, actorType: ctx.actor.type, actorId: ctx.actor.id, action: name, correlationId: ctx.correlationId, workflow: ctx.workflow, environment: ctx.environment };

  const finish = async (outcome: ToolOutcome, extra: Partial<ToolResult<O>> & { resource?: string; newState?: unknown } = {}): Promise<ToolResult<O>> => {
    const entry = await deps.audit.append({
      ...base, level: def?.level, result: outcome, resource: extra.resource,
      newState: outcome === 'success' ? redact(extra.output) : extra.newState,
      error: extra.reason,
    });
    const { resource: _r, newState: _n, ...rest } = extra;
    return { outcome, tool: name, auditId: entry.id, ...rest };
  };

  if (!def) return finish('blocked', { reason: 'unknown_tool' });

  // 1. validate input
  const parsed = def.input.safeParse(rawInput);
  if (!parsed.success) return finish('blocked', { reason: `invalid_input: ${parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'} ${i.message}`).join('; ')}` });
  const input = parsed.data;

  // 2. capability
  const capability: CapabilityCheck = await checkCapability(def, ctx.organizationId, ctx.environment, { connections: deps.connections, adapters: deps.adapters });
  if (capability.status !== 'AVAILABLE') return finish('blocked', { reason: `capability:${capability.status}`, capability, humanAction: capability.humanAction });

  // 3. permission
  const perm = checkPermission(def, ctx, deps.permissions ?? DEFAULT_PERMISSIONS);
  if (!perm.ok) return finish('blocked', { reason: `permission_denied: ${perm.reason}`, capability });

  // 4. approval (L4 also needs a passing QA gate)
  const need = approvalRequirement(def, input, ctx, deps.thresholds);
  let approval: Awaited<ReturnType<ApprovalEngine['verify']>> | undefined;
  if (need) {
    if (def.level === 'L4' && !ctx.qaGatePassed) return finish('blocked', { reason: 'qa_gate_not_passed', capability, humanAction: 'Run the QA gate for this environment; all critical tests must pass before production.' });
    if (!ctx.approvalId) {
      if (ctx.dryRun) return finish('dry_run', { capability, output: undefined, reason: `would need approval: ${need.reason}` });
      const req = await deps.approvals.request(def, input, ctx, need);
      await deps.events.emit({ organizationId: ctx.organizationId, type: 'approval.requested', payload: { approvalId: req.id, tool: name, level: def.level, reason: need.reason }, correlationId: ctx.correlationId });
      return finish('pending_approval', { approvalId: req.id, capability, reason: need.reason, humanAction: `Approver (${need.approverRoles.join(' or ')}) must approve request ${req.id}.` });
    }
    approval = await deps.approvals.verify(ctx.approvalId, def, input, ctx);
    if (!approval.ok) return finish('blocked', { reason: approval.reason, capability, approvalId: ctx.approvalId });
  }

  // 5. idempotency
  const idemKey = def.idempotent ? (ctx.idempotencyKey ?? def.idempotencyKey!(input, ctx)) : undefined;
  if (idemKey) {
    const prev = await deps.idempotency.get(ctx.organizationId, `${name}:${idemKey}`);
    if (prev) return finish('duplicate', { output: prev.result as O, capability, reason: 'idempotency_key_seen' });
  }

  // 6. dry run
  if (ctx.dryRun) {
    if (!def.supportsDryRun) return finish('blocked', { reason: 'dry_run_not_supported', capability });
    return finish('dry_run', { capability, reason: def.describeDryRun?.(input) ?? `would run ${name}` });
  }

  // 7. execute with timeout + retries
  const run = internalExecutor(deps.registry, name)!;
  const sleep = deps.sleep ?? realSleep;
  let attempts = 0;
  let lastError: unknown;
  let output: unknown;
  let ok = false;
  while (attempts < Math.max(1, def.retry.attempts)) {
    attempts++;
    try {
      output = await withTimeout(run(input, { ctx, adapters: deps.adapters }), def.timeoutMs, name);
      ok = true;
      break;
    } catch (e) {
      lastError = e;
      if (attempts < def.retry.attempts) await sleep(Math.min(def.retry.maxDelayMs, def.retry.baseDelayMs * 2 ** (attempts - 1)));
    }
  }
  if (!ok) {
    const reason = `execution_failed: ${errMsg(lastError)}`;
    await deps.events.emit({ organizationId: ctx.organizationId, type: 'tool.failed', payload: { tool: name, attempts, error: errMsg(lastError) }, correlationId: ctx.correlationId });
    return finish('failed', { reason, capability, attempts });
  }

  // 8. validate output
  const out = def.output.safeParse(output);
  if (!out.success) return finish('failed', { reason: 'invalid_output', capability, attempts });

  if (idemKey) await deps.idempotency.put(ctx.organizationId, `${name}:${idemKey}`, name, out.data);
  if (approval?.ok) await deps.approvals.consume(approval.approval);

  // 9. audit + 10. event
  const res = await finish('success', { output: out.data as O, capability, attempts, approvalId: ctx.approvalId });
  await deps.events.emit({ organizationId: ctx.organizationId, type: 'tool.executed', payload: { tool: name, level: def.level, auditId: res.auditId }, correlationId: ctx.correlationId });
  return res;
}

function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  let t: NodeJS.Timeout;
  return Promise.race([p, new Promise<never>((_, rej) => { t = setTimeout(() => rej(new Error(`${name} timed out after ${ms} ms`)), ms); })]).finally(() => clearTimeout(t));
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Never write secrets or full message bodies into the audit log. */
const SECRET_KEYS = /(token|secret|password|api[_-]?key|authorization|service[_-]?role)/i;
export function redact(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(redact);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SECRET_KEYS.test(k) ? '[REDACTED]' : redact(x)]));
  return v;
}

export type { ToolDescriptor };
