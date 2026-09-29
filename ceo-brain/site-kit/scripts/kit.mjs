// First build step on Vercel: fetch the kit's engine files that the deployment did not include, from the public
// FusionTech repo (default branch), so a mock-up deploy only carries the files written for that customer.
// Files already present (a local build inside the repo, or an engine file shipped on purpose) are left alone.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const REF = process.env.FUSIONTECH_KIT_REF || 'claude/setup-nano-banana-openrouter-u2JAQ';
const BASE = `https://raw.githubusercontent.com/ryandhana1515-stack/ryan/${REF}/ceo-brain/site-kit/`;
const ENGINE = ['scripts/media.mjs', 'src/engine/film.js', 'src/engine/fx.js', 'src/engine/index.js',
  'src/engine/motion.js', 'src/styles/engine.css'];
const root = resolve(import.meta.dirname, '..');

for (const f of ENGINE) {
  const out = join(root, f);
  if (existsSync(out)) continue;
  let res;
  for (let i = 0; i < 3 && !(res && res.ok); i++) {
    try { res = await fetch(BASE + f); } catch { res = null; }
    if (!(res && res.ok)) await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  if (!(res && res.ok)) { console.error(`[kit] could not fetch ${f} (${res ? res.status : 'network'})`); process.exit(1); }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`[kit] ${f}`);
}
