import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const src = (p: string) => fileURLToPath(new URL(`./packages/${p}/src/index.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: { '@edg/core': src('core'), '@edg/db': src('db'), '@edg/events': src('events'), '@edg/crm': src('crm') },
  },
  test: {
    include: ['packages/*/test/**/*.test.ts', 'apps/*/test/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 20000,
  },
});
