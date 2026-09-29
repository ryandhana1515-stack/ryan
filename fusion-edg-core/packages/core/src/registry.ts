import type { ExecuteDeps, ToolDefinition } from './types';

/** Public view of a tool: everything except the ability to run it. */
export type ToolDescriptor = Omit<ToolDefinition<any, any>, 'execute'>;

/** Tool functions are kept here, out of reach of callers: only executeTool() can run them. */
const executors = new WeakMap<ToolRegistry, Map<string, ToolDefinition<any, any>['execute']>>();

export class ToolRegistry {
  private defs = new Map<string, ToolDescriptor>();

  constructor() { executors.set(this, new Map()); }

  register<I, O>(def: ToolDefinition<I, O>): this {
    if (this.defs.has(def.name)) throw new Error(`tool already registered: ${def.name}`);
    if (def.idempotent && !def.idempotencyKey) throw new Error(`${def.name}: idempotent tools need an idempotencyKey builder`);
    if ((def.level === 'L4' || def.level === 'L5') && !def.requiresApproval) throw new Error(`${def.name}: ${def.level} tools must require approval`);
    const { execute, ...descriptor } = def;
    this.defs.set(def.name, Object.freeze(descriptor) as ToolDescriptor);
    executors.get(this)!.set(def.name, execute as ToolDefinition<any, any>['execute']);
    return this;
  }

  describe(name: string): ToolDescriptor | undefined { return this.defs.get(name); }
  list(): ToolDescriptor[] { return [...this.defs.values()]; }
}

/** @internal used by executeTool() only. */
export function internalExecutor(reg: ToolRegistry, name: string): ((input: unknown, deps: ExecuteDeps) => Promise<unknown>) | undefined {
  return executors.get(reg)?.get(name);
}
