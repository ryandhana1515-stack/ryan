/**
 * Server-side authorisation (B9: RLS + server-side authorisation). Checked BEFORE touching the database; RLS is the
 * second line of defence underneath.
 */
export const ACTIONS = {
  'lead.intake': ['system', 'owner', 'admin', 'manager', 'sales', 'agent'],
  'lead.assign': ['system', 'owner', 'admin', 'manager'],
  'lead.dedupeCheck': ['system', 'owner', 'admin', 'manager', 'sales', 'agent'],
  'kpi.read': ['system', 'owner', 'admin', 'manager'],
  'jobs.run': ['system', 'owner', 'admin'],
} as const satisfies Record<string, readonly string[]>;
export type Action = keyof typeof ACTIONS;

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(role: string, action: Action) { super(`role "${role}" may not ${action}`); }
}
export class NotFoundError extends Error { readonly status = 404; }
export class ValidationError extends Error { readonly status = 400; }

export function authorize(role: string, action: Action): void {
  if (!(ACTIONS[action] as readonly string[]).includes(role)) throw new ForbiddenError(role, action);
}
