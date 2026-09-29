import type { ToolDescriptor } from './registry';
import type { AdapterKind, AdapterSet, CapabilityCheck, Environment } from './types';

/**
 * What is actually connected, per organisation and environment. This is DATA recorded when an admin connects an
 * account (OAuth/connect flow) or when a build-time tool was checked. Nothing here is assumed.
 */
export interface Connection {
  adapter: AdapterKind;
  provider: string;
  connected: boolean;
  authorized: boolean;
  scopes: string[];
  /** Features the account's plan/tier supports; a tool may name one in `planFeature`. */
  planFeatures?: string[];
  environments: Environment[];
  /** Set when a human step is outstanding (e.g. "Verify the WhatsApp business number in Meta"). */
  pendingHumanAction?: string;
  /** Provider says the operation is not supported at all. */
  unsupported?: string[];
}

export interface ConnectionStore {
  get(orgId: string, env: Environment, adapter: AdapterKind): Promise<Connection | undefined>;
}

export class InMemoryConnectionStore implements ConnectionStore {
  private rows = new Map<string, Connection>();
  set(orgId: string, env: Environment, c: Connection) { this.rows.set(`${orgId}|${env}|${c.adapter}`, c); }
  async get(orgId: string, env: Environment, adapter: AdapterKind) { return this.rows.get(`${orgId}|${env}|${adapter}`); }
}

/** Human-readable next step per status, specific to the adapter. */
function howToFix(status: CapabilityCheck['status'], adapter: AdapterKind, tool: ToolDescriptor, env: Environment, c?: Connection): string {
  switch (status) {
    case 'CONNECTION_REQUIRED':
      return `Connect a ${adapter} provider for this organisation in ${env} (admin connect flow), then store its credentials as ${envHint(adapter, env)} in the ${env} secret manager.`;
    case 'AUTHORIZATION_REQUIRED':
      return `Re-authorise the ${c?.provider ?? adapter} connection in ${env} (the token is missing or expired).`;
    case 'PERMISSION_DENIED':
      return `Grant the scopes ${tool.requiredScopes.filter((s) => !(c?.scopes ?? []).includes(s)).join(', ')} to the ${c?.provider ?? adapter} connection in ${env}.`;
    case 'PLAN_LIMIT':
      return `Upgrade the ${c?.provider ?? adapter} plan: this action needs a feature the current plan does not include.`;
    case 'NOT_SUPPORTED':
      return tool.allowedEnvironments.includes(env)
        ? `The ${c?.provider ?? adapter} provider does not support ${tool.name}; choose another adapter.`
        : `${tool.name} is not allowed in ${env}. Allowed: ${tool.allowedEnvironments.join(', ')}.`;
    case 'HUMAN_ACTION_REQUIRED':
      return c?.pendingHumanAction ?? 'A human step is outstanding.';
    default:
      return '';
  }
}

function envHint(adapter: AdapterKind, env: Environment): string {
  const names: Partial<Record<AdapterKind, string>> = {
    messaging: 'WHATSAPP_ACCESS_TOKEN', email: 'EMAIL_PROVIDER_API_KEY', llm: 'ANTHROPIC_API_KEY', database: 'DATABASE_URL',
    accounting: 'XERO_CLIENT_ID / XERO_CLIENT_SECRET', deployment: 'VERCEL_TOKEN', automation: 'N8N_API_KEY', crm: 'the CRM provider token',
  };
  return `${names[adapter] ?? 'the provider credentials'} (${env})`;
}

/**
 * B4: checkCapability(tool, org, env). Returns exactly one status. AVAILABLE only when the environment allows the
 * tool, an adapter instance exists, and the recorded connection is connected, authorised, scoped and on a plan that
 * supports it.
 */
export async function checkCapability(
  tool: ToolDescriptor,
  orgId: string,
  env: Environment,
  deps: { connections: ConnectionStore; adapters: AdapterSet; planFeature?: string },
): Promise<CapabilityCheck> {
  const adapter = tool.adapter;
  const out = (status: CapabilityCheck['status'], detail: string, c?: Connection): CapabilityCheck =>
    status === 'AVAILABLE' ? { status, adapter, detail } : { status, adapter, detail, humanAction: howToFix(status, adapter, tool, env, c) };

  if (!tool.allowedEnvironments.includes(env)) return out('NOT_SUPPORTED', `${tool.name} is not allowed in ${env}`);
  const c = await deps.connections.get(orgId, env, adapter);
  const instance = deps.adapters[adapter];
  if (!c || !c.connected || !instance) return out('CONNECTION_REQUIRED', `no connected ${adapter} adapter for this organisation in ${env}`, c);
  if (c.pendingHumanAction) return out('HUMAN_ACTION_REQUIRED', c.pendingHumanAction, c);
  if (!c.authorized) return out('AUTHORIZATION_REQUIRED', `${c.provider} connection is not authorised`, c);
  if (c.unsupported?.includes(tool.name)) return out('NOT_SUPPORTED', `${c.provider} does not support ${tool.name}`, c);
  const missing = tool.requiredScopes.filter((s) => !c.scopes.includes(s));
  if (missing.length) return out('PERMISSION_DENIED', `missing scopes: ${missing.join(', ')}`, c);
  if (deps.planFeature && !(c.planFeatures ?? []).includes(deps.planFeature)) return out('PLAN_LIMIT', `plan lacks ${deps.planFeature}`, c);
  if (instance.mode !== 'LIVE' && env === 'production') return out('NOT_SUPPORTED', `${instance.provider} is a ${instance.mode} adapter and cannot run in production`, c);
  return out('AVAILABLE', `${instance.provider} (${instance.mode})`);
}
