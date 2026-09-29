// Every *.html file in the kit root is a page (index.html, services.html, contact.html ...).
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const input = Object.fromEntries(
  readdirSync(root).filter(f => f.endsWith('.html')).map(f => [f.replace(/\.html$/, ''), resolve(root, f)])
);

export default defineConfig({
  build: { outDir: 'dist', assetsInlineLimit: 0, rollupOptions: { input } },
});
