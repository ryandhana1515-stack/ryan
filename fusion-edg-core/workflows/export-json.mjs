// Compiles every workflows/sdk/*.sdk.js into n8n import JSON (workflows/n8n/<id>.json) with the official
// @n8n/workflow-sdk parser, so the JSON in git is exactly what the SDK source produces. Inactive by design.
//   node workflows/generate.mjs && node workflows/export-json.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseWorkflowCode } from '@n8n/workflow-sdk';

const stableUuid = (s) => {
  const h = createHash('sha1').update(s).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const dir = fileURLToPath(new URL('./', import.meta.url));
mkdirSync(dir + 'n8n', { recursive: true });
for (const f of readdirSync(dir + 'sdk').filter((x) => x.endsWith('.sdk.js')).sort()) {
  const wf = parseWorkflowCode(readFileSync(dir + 'sdk/' + f, 'utf8').replace(/^import .*\n/m, ''));
  const json = typeof wf.toJSON === 'function' ? wf.toJSON() : wf;
  json.active = false;
  const id = f.replace('.sdk.js', '');
  // Stable ids so a re-export only changes when the workflow changes.
  for (const n of json.nodes) {
    n.id = stableUuid(`${id}:${n.name}`);
    if (n.webhookId) n.webhookId = stableUuid(`${id}:${n.name}:webhook`);
  }
  writeFileSync(`${dir}n8n/${id}.json`, JSON.stringify(json, null, 2) + '\n');
  console.log(`${id}: ${json.nodes.length} nodes`);
}
