import type { z } from 'zod';

/** B5 action levels. L4 needs Ryan's approval + a passing QA gate; L5 is never autonomous. */
export type ActionLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export const LEVEL_RANK: Record<ActionLevel, number> = { L0: 0, L1: 1, L2: 2, L3: 3, L4: 4, L5: 5 };

export type Environment = 'development' | 'test' | 'staging' | 'production';

/** B4 capability statuses. Anything other than AVAILABLE blocks execution. */
export type CapabilityStatus =
  | 'AVAILABLE'
  | 'CONNECTION_REQUIRED'
  | 'AUTHORIZATION_REQUIRED'
  | 'PERMISSION_DENIED'
  | 'PLAN_LIMIT'
  | 'NOT_SUPPORTED'
  | 'HUMAN_ACTION_REQUIRED';

export type AdapterKind =
  | 'crm'
  | 'database'
  | 'messaging'
  | 'email'
  | 'accounting'
  | 'deployment'
  | 'automation'
  | 'storage'
  | 'llm'
  | 'repository'
  | 'inventory'
  | 'report';

export type ToolCategory =
  | 'database'
  | 'storage'
  | 'auth'
  | 'github'
  | 'deployment'
  | 'n8n'
  | 'crm'
  | 'whatsapp'
  | 'email'
  | 'accounting'
  | 'inventory'
  | 'report';

export interface Actor {
  type: 'user' | 'agent' | 'system';
  id: string;
  /** Role inside the organisation (admin, manager, sales, support, viewer, agent, system…). */
  role: string;
}

export interface ToolContext {
  organizationId: string;
  actor: Actor;
  environment: Environment;
  correlationId: string;
  workflow?: string;
  /** Return what WOULD happen, change nothing. */
  dryRun?: boolean;
  /** Approval id for L4/L5 tools (must be APPROVED and match tool + org + scope). */
  approvalId?: string;
  /** Explicit idempotency key; otherwise derived by the tool definition. */
  idempotencyKey?: string;
  /** For L4: the latest QA gate result for this org/environment. */
  qaGatePassed?: boolean;
}

export interface RetryPolicy {
  attempts: number; // total attempts including the first
  baseDelayMs: number; // exponential backoff base
  maxDelayMs: number;
}

export interface ToolDefinition<I = unknown, O = unknown> {
  name: string;
  category: ToolCategory;
  adapter: AdapterKind;
  description: string;
  input: z.ZodType<I>;
  output: z.ZodType<O>;
  level: ActionLevel;
  requiredScopes: string[];
  allowedEnvironments: Environment[];
  requiresApproval: boolean;
  idempotent: boolean;
  /** Builds the idempotency key from the input (required when idempotent). */
  idempotencyKey?: (input: I, ctx: ToolContext) => string;
  supportsDryRun: boolean;
  timeoutMs: number;
  retry: RetryPolicy;
  /** Only called by executeTool(). Never call directly. */
  execute: (input: I, deps: ExecuteDeps) => Promise<O>;
  /** Optional: what the tool would do, for dry runs. */
  describeDryRun?: (input: I) => string;
}

export interface ExecuteDeps {
  ctx: ToolContext;
  adapters: AdapterSet;
}

export type ToolOutcome = 'success' | 'failed' | 'blocked' | 'pending_approval' | 'duplicate' | 'dry_run';

export interface ToolResult<O = unknown> {
  outcome: ToolOutcome;
  tool: string;
  output?: O;
  /** Machine-readable reason for blocked/failed. */
  reason?: string;
  capability?: CapabilityCheck;
  /** What the human must do (B4). */
  humanAction?: string;
  approvalId?: string;
  auditId: string;
  attempts?: number;
}

export interface CapabilityCheck {
  status: CapabilityStatus;
  adapter: AdapterKind;
  detail: string;
  humanAction?: string;
}

/** Filled in by adapters.ts; declared here to avoid a cycle. */
export interface AdapterSet {
  crm?: import('./adapters').CRMAdapter;
  database?: import('./adapters').DatabaseAdapter;
  messaging?: import('./adapters').MessagingAdapter;
  email?: import('./adapters').EmailAdapter;
  accounting?: import('./adapters').AccountingAdapter;
  deployment?: import('./adapters').DeploymentAdapter;
  automation?: import('./adapters').AutomationAdapter;
  storage?: import('./adapters').StorageAdapter;
  llm?: import('./adapters').LLMAdapter;
  repository?: import('./adapters').RepositoryAdapter;
  inventory?: import('./adapters').InventoryAdapter;
  report?: import('./adapters').ReportAdapter;
}
