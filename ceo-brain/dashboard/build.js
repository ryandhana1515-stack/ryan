#!/usr/bin/env node
// Wraps dashboard/index.html into an n8n workflow that serves it at GET /webhook/ceo-brain/dashboard.
// Deploy: node dashboard/build.js → dist/dashboard.sdk.ts → n8n validate_workflow + create/update.
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const j = (v) => JSON.stringify(v);
const sdk = `import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

const page = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Dashboard Page',
    parameters: { httpMethod: 'GET', path: 'ceo-brain/dashboard', responseMode: 'responseNode', options: {} },
    position: [0, 300]
  },
  output: [{ headers: {}, query: {} }]
});

const serve = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Serve HTML',
    parameters: { respondWith: 'text', responseBody: ${j(html)}, options: { responseCode: 200, responseHeaders: { entries: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }] } } },
    position: [220, 300]
  },
  output: [{ ok: true }]
});

const note = sticky(${j('## CEO Brain — Training Dashboard (page)\nServes Ryan\'s training room at GET /webhook/ceo-brain/dashboard. The page talks to the Trainer API (POST /webhook/ceo-brain/trainer). Source of truth: repo ryan/ceo-brain/dashboard/index.html — rebuild with node dashboard/build.js and redeploy; never edit the HTML here.')}, [page, serve], { color: 4 });

export default workflow('ceo-brain-training-dashboard', 'CEO Brain — Training Dashboard')
  .add(page)
  .to(serve)
  .add(note);
`;
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'dashboard.sdk.ts'), sdk);
console.log('built dashboard/dist/dashboard.sdk.ts', sdk.length, 'chars; html', html.length, 'chars');
