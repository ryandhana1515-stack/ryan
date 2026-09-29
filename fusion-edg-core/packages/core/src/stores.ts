import { randomUUID } from 'node:crypto';
import type { ActionLevel, Environment } from './types';

/** B11 audit entry. Append-only: stores expose no update or delete. */
export interface AuditEntry {
  id: string;
  organizationId: string;
  actorType: string;
  actorId: string;
  action: string; // tool name or business action
  resource?: string;
  previousState?: unknown;
  newState?: unknown;
  result: 'success' | 'failed' | 'blocked' | 'pending_approval' | 'duplicate' | 'dry_run';
  error?: string;
  level?: ActionLevel;
  environment?: Environment;
  workflow?: string;
  correlationId: string;
  createdAt: string;
}

export interface AuditStore {
  append(e: Omit<AuditEntry, 'id' | 'createdAt'>): Promise<AuditEntry>;
  list(orgId: string): Promise<AuditEntry[]>;
}

export class InMemoryAuditStore implements AuditStore {
  private rows: AuditEntry[] = [];
  async append(e: Omit<AuditEntry, 'id' | 'createdAt'>) {
    const row = Object.freeze({ ...e, id: randomUUID(), createdAt: new Date().toISOString() });
    this.rows.push(row);
    return row;
  }
  async list(orgId: string) { return this.rows.filter((r) => r.organizationId === orgId); }
}

export interface IdempotencyRecord { key: string; organizationId: string; tool: string; result: unknown; createdAt: string }
export interface IdempotencyStore {
  get(orgId: string, key: string): Promise<IdempotencyRecord | undefined>;
  /** Returns false when the key already exists (someone else won the race). */
  put(orgId: string, key: string, tool: string, result: unknown): Promise<boolean>;
}
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private rows = new Map<string, IdempotencyRecord>();
  async get(orgId: string, key: string) { return this.rows.get(`${orgId}|${key}`); }
  async put(orgId: string, key: string, tool: string, result: unknown) {
    const k = `${orgId}|${key}`;
    if (this.rows.has(k)) return false;
    this.rows.set(k, { key, organizationId: orgId, tool, result, createdAt: new Date().toISOString() });
    return true;
  }
}

/** Business event (B11). Written to the outbox by the database layer; in memory here for unit tests. */
export interface BusinessEvent {
  id: string;
  organizationId: string;
  type: string; // lead.created, tool.executed, …
  payload: unknown;
  correlationId: string;
  createdAt: string;
}
export interface EventSink { emit(e: Omit<BusinessEvent, 'id' | 'createdAt'>): Promise<BusinessEvent> }
export class InMemoryEventSink implements EventSink {
  events: BusinessEvent[] = [];
  async emit(e: Omit<BusinessEvent, 'id' | 'createdAt'>) { const row = { ...e, id: randomUUID(), createdAt: new Date().toISOString() }; this.events.push(row); return row; }
}
