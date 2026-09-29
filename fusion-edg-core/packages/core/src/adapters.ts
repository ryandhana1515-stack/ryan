/**
 * Vendor-neutral adapter interfaces (no lock-in). A client project plugs in real providers (Supabase, HubSpot,
 * WhatsApp Cloud API, Xero, Vercel, n8n, Anthropic…) behind these. Every adapter says what it is (`kind`) so a MOCK
 * can never be mistaken for a live integration.
 */
export type AdapterMode = 'MOCK' | 'SANDBOX' | 'LIVE';

interface BaseAdapter {
  readonly provider: string;
  readonly mode: AdapterMode;
}

export interface ContactInput { name?: string; phone?: string; email?: string; source?: string; companyName?: string }
export interface CRMAdapter extends BaseAdapter {
  createContact(orgId: string, c: ContactInput): Promise<{ id: string }>;
  updateContact(orgId: string, id: string, patch: Partial<ContactInput>): Promise<{ id: string }>;
  createDeal(orgId: string, d: { contactId: string; title: string; pipeline?: string; stage?: string; valueCents?: number }): Promise<{ id: string }>;
}

export interface DatabaseAdapter extends BaseAdapter {
  create(name: string, opts: { region?: string }): Promise<{ id: string; url: string }>;
  migrate(target: string): Promise<{ applied: string[] }>;
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  backup(target: string): Promise<{ file: string; bytes: number }>;
}

export interface OutboundMessage { to: string; text?: string; template?: { name: string; language: string; params?: string[] } }
export interface MessagingAdapter extends BaseAdapter {
  send(orgId: string, m: OutboundMessage): Promise<{ messageId: string; status: 'sent' | 'queued' }>;
}

export interface EmailAdapter extends BaseAdapter {
  createDraft(orgId: string, m: { to: string; subject: string; body: string }): Promise<{ draftId: string }>;
  send(orgId: string, m: { to: string; subject: string; body: string }): Promise<{ messageId: string }>;
}

export interface AccountingAdapter extends BaseAdapter {
  createInvoice(orgId: string, inv: { customerRef: string; lines: { description: string; amountCents: number }[]; currency: string }): Promise<{ invoiceId: string; status: 'DRAFT' | 'AUTHORISED' }>;
}

export interface DeploymentAdapter extends BaseAdapter {
  create(project: string): Promise<{ projectId: string }>;
  deploy(project: string, ref: string, environment: string): Promise<{ deploymentId: string; url: string }>;
  rollback(project: string, toDeploymentId: string): Promise<{ deploymentId: string }>;
}

export interface AutomationAdapter extends BaseAdapter {
  createWorkflow(def: { name: string; json: unknown; active: boolean }): Promise<{ workflowId: string }>;
  updateWorkflow(id: string, def: { json: unknown }): Promise<{ workflowId: string; version: number }>;
  testWorkflow(id: string, payload: unknown): Promise<{ executionId: string; status: 'success' | 'error' }>;
}

export interface StorageAdapter extends BaseAdapter {
  createBucket(name: string, opts: { public: boolean }): Promise<{ bucket: string }>;
}

export interface LLMAdapter extends BaseAdapter {
  /** Tier routing (B14): small → classify/extract, standard → customer interaction, advanced → analysis. */
  complete(req: { tier: 'small' | 'standard' | 'advanced'; system: string; prompt: string }): Promise<{ text: string; inputTokens: number; outputTokens: number }>;
}

export interface RepositoryAdapter extends BaseAdapter {
  createRepository(name: string, opts: { private: boolean }): Promise<{ url: string }>;
  commit(repo: string, branch: string, files: { path: string; content: string }[], message: string): Promise<{ sha: string }>;
}

export interface InventoryAdapter extends BaseAdapter {
  /** Stock changes only via movements (never silent edits). */
  recordMovement(orgId: string, m: { sku: string; warehouse: string; quantity: number; reason: string }): Promise<{ movementId: string; onHand: number }>;
}

export interface ReportAdapter extends BaseAdapter {
  generate(orgId: string, r: { kind: string; data: unknown }): Promise<{ reportId: string; text: string }>;
}
