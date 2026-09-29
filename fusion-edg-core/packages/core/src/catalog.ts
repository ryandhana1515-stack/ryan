import { z } from 'zod';
import { ToolRegistry } from './registry';
import type { ActionLevel, AdapterKind, AdapterSet, Environment, ExecuteDeps, RetryPolicy, ToolCategory, ToolDefinition } from './types';

/**
 * The standard runtime tool catalogue (B1). Each tool is a thin, typed call into one adapter; the safety rules live
 * in executeTool(). Client projects register extra tools the same way.
 */
const ALL_ENVS: Environment[] = ['development', 'test', 'staging', 'production'];
const PRE_PROD: Environment[] = ['development', 'test', 'staging'];
const NO_RETRY: RetryPolicy = { attempts: 1, baseDelayMs: 0, maxDelayMs: 0 };
const RETRY3: RetryPolicy = { attempts: 3, baseDelayMs: 500, maxDelayMs: 5000 };

function need<K extends AdapterKind>(a: AdapterSet, k: K): NonNullable<AdapterSet[K]> {
  const x = a[k];
  if (!x) throw new Error(`no ${k} adapter`);
  return x as NonNullable<AdapterSet[K]>;
}

interface Spec<I, O> {
  name: string; category: ToolCategory; adapter: AdapterKind; description: string; level: ActionLevel;
  input: z.ZodType<I>; output: z.ZodType<O>; scopes?: string[]; envs?: Environment[]; approval?: boolean;
  idem?: (i: I) => string; dryRun?: boolean; timeoutMs?: number; retry?: RetryPolicy;
  run: (i: I, d: ExecuteDeps) => Promise<O>;
}
function tool<I, O>(s: Spec<I, O>): ToolDefinition<I, O> {
  return {
    name: s.name, category: s.category, adapter: s.adapter, description: s.description, level: s.level,
    input: s.input, output: s.output, requiredScopes: s.scopes ?? [], allowedEnvironments: s.envs ?? ALL_ENVS,
    requiresApproval: s.approval ?? (s.level === 'L4' || s.level === 'L5'), idempotent: !!s.idem,
    idempotencyKey: s.idem ? (i: I) => s.idem!(i) : undefined, supportsDryRun: s.dryRun ?? true,
    timeoutMs: s.timeoutMs ?? 15_000, retry: s.retry ?? NO_RETRY, execute: s.run,
    describeDryRun: (i: I) => `would call ${s.adapter}.${s.name.split('.')[1]} with ${JSON.stringify(i).slice(0, 200)}`,
  };
}

const phone = z.string().regex(/^\+[1-9]\d{6,14}$/, 'E.164 phone, e.g. +6591234567');
const idOut = z.object({ id: z.string() });

export const catalog = [
  // ---- database (build time) ----
  tool({ name: 'database.create', category: 'database', adapter: 'database', level: 'L3', description: 'Create a database for an environment (dev/staging); production needs the L4 variant via deployment approval.',
    input: z.object({ name: z.string().min(3), region: z.string().optional() }), output: z.object({ id: z.string(), url: z.string() }), envs: PRE_PROD, scopes: ['projects:write'],
    idem: (i) => `db:${i.name}`, run: (i, d) => need(d.adapters, 'database').create(i.name, { region: i.region }) }),
  tool({ name: 'database.migrate', category: 'database', adapter: 'database', level: 'L2', description: 'Apply version-controlled migrations to the target.',
    input: z.object({ target: z.string() }), output: z.object({ applied: z.array(z.string()) }), envs: PRE_PROD, run: (i, d) => need(d.adapters, 'database').migrate(i.target) }),
  tool({ name: 'database.query', category: 'database', adapter: 'database', level: 'L0', description: 'Read-only query.',
    input: z.object({ sql: z.string().refine((s) => /^\s*(select|with)\b/i.test(s), 'read-only (SELECT/WITH) only'), params: z.array(z.unknown()).optional() }),
    output: z.object({ rows: z.array(z.record(z.string(), z.unknown())) }), run: (i, d) => need(d.adapters, 'database').query(i.sql, i.params) }),
  tool({ name: 'database.backup', category: 'database', adapter: 'database', level: 'L1', description: 'Take a backup.',
    input: z.object({ target: z.string() }), output: z.object({ file: z.string(), bytes: z.number() }), run: (i, d) => need(d.adapters, 'database').backup(i.target) }),
  tool({ name: 'storage.create', category: 'storage', adapter: 'storage', level: 'L2', description: 'Create a storage bucket (private by default).',
    input: z.object({ name: z.string(), public: z.boolean().default(false) }), output: z.object({ bucket: z.string() }), envs: PRE_PROD,
    idem: (i) => `bucket:${i.name}`, run: (i, d) => need(d.adapters, 'storage').createBucket(i.name, { public: i.public }) }),
  tool({ name: 'auth.configure', category: 'auth', adapter: 'database', level: 'L3', description: 'Configure auth providers/redirects for staging (production via approval).',
    input: z.object({ providers: z.array(z.string()), redirectUrls: z.array(z.string().url()) }), output: z.object({ applied: z.array(z.string()) }), envs: PRE_PROD,
    run: async (i, d) => ({ applied: (await need(d.adapters, 'database').migrate(`auth:${i.providers.join(',')}`)).applied }) }),
  // ---- repository ----
  tool({ name: 'github.createRepository', category: 'github', adapter: 'repository', level: 'L2', description: 'Create a private repository.',
    input: z.object({ name: z.string().regex(/^[a-z0-9-]+$/), private: z.boolean().default(true) }), output: z.object({ url: z.string() }), scopes: ['repo'],
    idem: (i) => `repo:${i.name}`, run: (i, d) => need(d.adapters, 'repository').createRepository(i.name, { private: i.private }) }),
  tool({ name: 'github.commit', category: 'github', adapter: 'repository', level: 'L2', description: 'Commit files to a branch (never the default branch of a client repo without review).',
    input: z.object({ repo: z.string(), branch: z.string().refine((b) => !['main', 'master'].includes(b), 'commit to a feature branch'), files: z.array(z.object({ path: z.string(), content: z.string() })).min(1), message: z.string().min(3) }),
    output: z.object({ sha: z.string() }), scopes: ['repo'], run: (i, d) => need(d.adapters, 'repository').commit(i.repo, i.branch, i.files, i.message) }),
  // ---- deployment ----
  tool({ name: 'deployment.create', category: 'deployment', adapter: 'deployment', level: 'L2', description: 'Create a hosting project.',
    input: z.object({ project: z.string() }), output: z.object({ projectId: z.string() }), idem: (i) => `project:${i.project}`, run: (i, d) => need(d.adapters, 'deployment').create(i.project) }),
  tool({ name: 'deployment.deploy', category: 'deployment', adapter: 'deployment', level: 'L3', description: 'Deploy to development or staging.',
    input: z.object({ project: z.string(), ref: z.string(), environment: z.enum(['development', 'staging']) }), output: z.object({ deploymentId: z.string(), url: z.string() }), envs: PRE_PROD,
    run: (i, d) => need(d.adapters, 'deployment').deploy(i.project, i.ref, i.environment) }),
  tool({ name: 'deployment.deployProduction', category: 'deployment', adapter: 'deployment', level: 'L4', description: 'Deploy to production (Ryan approves; QA gate must pass).',
    input: z.object({ project: z.string(), ref: z.string(), rollbackTo: z.string().min(1, 'a tested rollback target is required') }), output: z.object({ deploymentId: z.string(), url: z.string() }), envs: ['production'], dryRun: true,
    run: (i, d) => need(d.adapters, 'deployment').deploy(i.project, i.ref, 'production') }),
  tool({ name: 'deployment.rollback', category: 'deployment', adapter: 'deployment', level: 'L3', description: 'Roll back to a previous deployment.',
    input: z.object({ project: z.string(), toDeploymentId: z.string() }), output: z.object({ deploymentId: z.string() }), run: (i, d) => need(d.adapters, 'deployment').rollback(i.project, i.toDeploymentId) }),
  // ---- automation (n8n) ----
  tool({ name: 'n8n.createWorkflow', category: 'n8n', adapter: 'automation', level: 'L2', description: 'Create a workflow INACTIVE (activation is a separate, approved step).',
    input: z.object({ name: z.string(), json: z.unknown(), active: z.literal(false).default(false) }), output: z.object({ workflowId: z.string() }), envs: PRE_PROD,
    idem: (i) => `wf:${i.name}`, run: (i, d) => need(d.adapters, 'automation').createWorkflow({ name: i.name, json: i.json, active: false }) }),
  tool({ name: 'n8n.updateWorkflow', category: 'n8n', adapter: 'automation', level: 'L2', description: 'Update a workflow definition.',
    input: z.object({ id: z.string(), json: z.unknown() }), output: z.object({ workflowId: z.string(), version: z.number() }), envs: PRE_PROD, run: (i, d) => need(d.adapters, 'automation').updateWorkflow(i.id, { json: i.json }) }),
  tool({ name: 'n8n.testWorkflow', category: 'n8n', adapter: 'automation', level: 'L2', description: 'Run a workflow with test data.',
    input: z.object({ id: z.string(), payload: z.unknown() }), output: z.object({ executionId: z.string(), status: z.enum(['success', 'error']) }), envs: PRE_PROD, run: (i, d) => need(d.adapters, 'automation').testWorkflow(i.id, i.payload) }),
  // ---- CRM ----
  tool({ name: 'crm.createContact', category: 'crm', adapter: 'crm', level: 'L2', description: 'Create a contact.',
    input: z.object({ name: z.string().optional(), phone: phone.optional(), email: z.string().email().optional(), source: z.string().optional() }).refine((c) => c.phone || c.email, 'phone or email required'),
    output: idOut, scopes: ['contacts:write'], idem: (i) => `contact:${i.phone ?? ''}:${(i.email ?? '').toLowerCase()}`, run: (i, d) => need(d.adapters, 'crm').createContact(d.ctx.organizationId, i) }),
  tool({ name: 'crm.updateContact', category: 'crm', adapter: 'crm', level: 'L2', description: 'Update approved contact fields.',
    input: z.object({ id: z.string(), patch: z.object({ name: z.string().optional(), phone: phone.optional(), email: z.string().email().optional() }) }), output: idOut, scopes: ['contacts:write'],
    run: (i, d) => need(d.adapters, 'crm').updateContact(d.ctx.organizationId, i.id, i.patch) }),
  tool({ name: 'crm.createDeal', category: 'crm', adapter: 'crm', level: 'L2', description: 'Create a deal.',
    input: z.object({ contactId: z.string(), title: z.string(), pipeline: z.string().optional(), stage: z.string().optional(), valueCents: z.number().int().nonnegative().optional() }), output: idOut, scopes: ['deals:write'],
    run: (i, d) => need(d.adapters, 'crm').createDeal(d.ctx.organizationId, i) }),
  // ---- messaging / email ----
  tool({ name: 'whatsapp.send', category: 'whatsapp', adapter: 'messaging', level: 'L2', description: 'Send one WhatsApp message to one opted-in contact (templates outside the 24h window). Bulk sends are L5.',
    input: z.object({ to: phone, text: z.string().max(4096).optional(), template: z.object({ name: z.string(), language: z.string(), params: z.array(z.string()).optional() }).optional(), dedupeKey: z.string() })
      .refine((m) => !!m.text !== !!m.template, 'exactly one of text or template'),
    output: z.object({ messageId: z.string(), status: z.enum(['sent', 'queued']) }), scopes: ['messages:send'], idem: (i) => `wa:${i.dedupeKey}`, retry: RETRY3, timeoutMs: 10_000,
    run: (i, d) => need(d.adapters, 'messaging').send(d.ctx.organizationId, { to: i.to, text: i.text, template: i.template }) }),
  tool({ name: 'whatsapp.bulkSend', category: 'whatsapp', adapter: 'messaging', level: 'L5', description: 'Bulk outbound to many customers: always a named human approver.',
    input: z.object({ recipients: z.array(phone).min(2), template: z.object({ name: z.string(), language: z.string() }) }), output: z.object({ sent: z.number() }), scopes: ['messages:send'],
    run: async (i, d) => { let sent = 0; for (const to of i.recipients) { await need(d.adapters, 'messaging').send(d.ctx.organizationId, { to, template: i.template }); sent++; } return { sent }; } }),
  tool({ name: 'email.createDraft', category: 'email', adapter: 'email', level: 'L1', description: 'Create an email draft (no send).',
    input: z.object({ to: z.string().email(), subject: z.string(), body: z.string() }), output: z.object({ draftId: z.string() }), run: (i, d) => need(d.adapters, 'email').createDraft(d.ctx.organizationId, i) }),
  tool({ name: 'email.send', category: 'email', adapter: 'email', level: 'L2', description: 'Send an email when the client policy permits auto-send.',
    input: z.object({ to: z.string().email(), subject: z.string(), body: z.string(), dedupeKey: z.string() }), output: z.object({ messageId: z.string() }), scopes: ['mail:send'], idem: (i) => `mail:${i.dedupeKey}`, retry: RETRY3,
    run: (i, d) => need(d.adapters, 'email').send(d.ctx.organizationId, i) }),
  // ---- accounting / inventory / reports ----
  tool({ name: 'accounting.createInvoice', category: 'accounting', adapter: 'accounting', level: 'L2', description: 'Create a DRAFT invoice in the accounting system (authorising/sending is a human step).',
    input: z.object({ customerRef: z.string(), currency: z.string().length(3), lines: z.array(z.object({ description: z.string(), amountCents: z.number().int() })).min(1), dedupeKey: z.string() }),
    output: z.object({ invoiceId: z.string(), status: z.enum(['DRAFT', 'AUTHORISED']) }), scopes: ['accounting.transactions'], idem: (i) => `inv:${i.dedupeKey}`,
    run: (i, d) => need(d.adapters, 'accounting').createInvoice(d.ctx.organizationId, i) }),
  tool({ name: 'inventory.update', category: 'inventory', adapter: 'inventory', level: 'L2', description: 'Record a stock movement (stock changes only via movements).',
    input: z.object({ sku: z.string(), warehouse: z.string(), quantity: z.number().int().refine((q) => q !== 0), reason: z.enum(['purchase', 'sale', 'return', 'adjustment', 'transfer']), dedupeKey: z.string() }),
    output: z.object({ movementId: z.string(), onHand: z.number() }), idem: (i) => `mv:${i.dedupeKey}`, run: (i, d) => need(d.adapters, 'inventory').recordMovement(d.ctx.organizationId, i) }),
  tool({ name: 'report.generate', category: 'report', adapter: 'report', level: 'L0', description: 'Generate a report from computed data.',
    input: z.object({ kind: z.string(), data: z.unknown() }), output: z.object({ reportId: z.string(), text: z.string() }), run: (i, d) => need(d.adapters, 'report').generate(d.ctx.organizationId, i) }),
];

export function standardRegistry(): ToolRegistry {
  const r = new ToolRegistry();
  for (const t of catalog) r.register(t as ToolDefinition<unknown, unknown>);
  return r;
}
