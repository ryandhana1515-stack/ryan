/**
 * MOCK adapters, for tests and demos only. Every one reports mode 'MOCK' and provider 'mock:*', and records what it
 * was asked to do so tests can assert on it. They never call a network.
 */
import type {
  AccountingAdapter, AutomationAdapter, CRMAdapter, DatabaseAdapter, DeploymentAdapter, EmailAdapter, InventoryAdapter,
  LLMAdapter, MessagingAdapter, OutboundMessage, ReportAdapter, RepositoryAdapter, StorageAdapter,
} from './adapters';
import type { AdapterSet } from './types';

let n = 0;
const id = (p: string) => `${p}_mock_${(++n).toString(36)}`;

export class MockMessagingAdapter implements MessagingAdapter {
  readonly provider = 'mock:messaging';
  readonly mode = 'MOCK' as const;
  sent: { orgId: string; m: OutboundMessage }[] = [];
  /** Simulate a provider outage (B12 "API outage" test). */
  outage = false;
  failTimes = 0;
  async send(orgId: string, m: OutboundMessage) {
    if (this.outage || this.failTimes > 0) {
      if (this.failTimes > 0) this.failTimes--;
      throw new Error('MOCK messaging provider unavailable (simulated outage)');
    }
    this.sent.push({ orgId, m });
    return { messageId: id('msg'), status: 'sent' as const };
  }
}

export class MockCRMAdapter implements CRMAdapter {
  readonly provider = 'mock:crm';
  readonly mode = 'MOCK' as const;
  contacts = new Map<string, { orgId: string; data: Record<string, unknown> }>();
  async createContact(orgId: string, c: Record<string, unknown>) { const k = id('contact'); this.contacts.set(k, { orgId, data: { ...c } }); return { id: k }; }
  async updateContact(orgId: string, cid: string, patch: Record<string, unknown>) {
    const row = this.contacts.get(cid);
    if (!row || row.orgId !== orgId) throw new Error('contact not found in this organisation');
    Object.assign(row.data, patch);
    return { id: cid };
  }
  async createDeal() { return { id: id('deal') }; }
}

export class MockEmailAdapter implements EmailAdapter {
  readonly provider = 'mock:email';
  readonly mode = 'MOCK' as const;
  drafts: unknown[] = []; sent: unknown[] = [];
  async createDraft(_o: string, m: unknown) { this.drafts.push(m); return { draftId: id('draft') }; }
  async send(_o: string, m: unknown) { this.sent.push(m); return { messageId: id('email') }; }
}

export class MockLLMAdapter implements LLMAdapter {
  readonly provider = 'mock:llm';
  readonly mode = 'MOCK' as const;
  calls: { tier: string; system: string; prompt: string }[] = [];
  /** Deterministic "narration": echoes the facts it was given, so tests can prove it adds no numbers. */
  async complete(req: { tier: 'small' | 'standard' | 'advanced'; system: string; prompt: string }) {
    this.calls.push(req);
    return { text: `[MOCK NARRATION]\n${req.prompt}`, inputTokens: req.prompt.length, outputTokens: req.prompt.length };
  }
}

export class MockDatabaseAdapter implements DatabaseAdapter {
  readonly provider = 'mock:database'; readonly mode = 'MOCK' as const;
  async create(name: string) { return { id: id('db'), url: `mock://${name}` }; }
  async migrate() { return { applied: [] }; }
  async query() { return { rows: [] }; }
  async backup(target: string) { return { file: `mock-${target}.dump`, bytes: 0 }; }
}
export class MockAccountingAdapter implements AccountingAdapter {
  readonly provider = 'mock:accounting'; readonly mode = 'MOCK' as const;
  async createInvoice() { return { invoiceId: id('inv'), status: 'DRAFT' as const }; }
}
export class MockDeploymentAdapter implements DeploymentAdapter {
  readonly provider = 'mock:deployment'; readonly mode = 'MOCK' as const;
  async create(p: string) { return { projectId: `mock-${p}` }; }
  async deploy(p: string) { const d = id('dpl'); return { deploymentId: d, url: `https://${p}-${d}.mock.invalid` }; }
  async rollback(_p: string, to: string) { return { deploymentId: to }; }
}
export class MockAutomationAdapter implements AutomationAdapter {
  readonly provider = 'mock:automation'; readonly mode = 'MOCK' as const;
  async createWorkflow() { return { workflowId: id('wf') }; }
  async updateWorkflow(wid: string) { return { workflowId: wid, version: 2 }; }
  async testWorkflow() { return { executionId: id('exec'), status: 'success' as const }; }
}
export class MockStorageAdapter implements StorageAdapter {
  readonly provider = 'mock:storage'; readonly mode = 'MOCK' as const;
  async createBucket(name: string) { return { bucket: name }; }
}
export class MockRepositoryAdapter implements RepositoryAdapter {
  readonly provider = 'mock:repository'; readonly mode = 'MOCK' as const;
  async createRepository(name: string) { return { url: `https://git.mock.invalid/${name}` }; }
  async commit() { return { sha: id('sha') }; }
}
export class MockInventoryAdapter implements InventoryAdapter {
  readonly provider = 'mock:inventory'; readonly mode = 'MOCK' as const;
  onHand = new Map<string, number>();
  async recordMovement(_o: string, m: { sku: string; warehouse: string; quantity: number }) {
    const k = `${m.sku}@${m.warehouse}`; const v = (this.onHand.get(k) ?? 0) + m.quantity; this.onHand.set(k, v);
    return { movementId: id('mv'), onHand: v };
  }
}
export class MockReportAdapter implements ReportAdapter {
  readonly provider = 'mock:report'; readonly mode = 'MOCK' as const;
  async generate(_o: string, r: { kind: string; data: unknown }) { return { reportId: id('rpt'), text: `[MOCK ${r.kind}] ${JSON.stringify(r.data)}` }; }
}

export function mockAdapters(): Required<AdapterSet> & { messaging: MockMessagingAdapter; crm: MockCRMAdapter; email: MockEmailAdapter; llm: MockLLMAdapter } {
  return {
    crm: new MockCRMAdapter(), database: new MockDatabaseAdapter(), messaging: new MockMessagingAdapter(), email: new MockEmailAdapter(),
    accounting: new MockAccountingAdapter(), deployment: new MockDeploymentAdapter(), automation: new MockAutomationAdapter(),
    storage: new MockStorageAdapter(), llm: new MockLLMAdapter(), repository: new MockRepositoryAdapter(), inventory: new MockInventoryAdapter(),
    report: new MockReportAdapter(),
  };
}
