#!/usr/bin/env node
// Generates the n8n workflow that hosts the public "Chat with John" page (the @n8n/chat widget
// pointed at the John Chat Console). The same widget is in embed-snippet.html for FusionTech.com.sg.
//   node website-chat/build.js -> dist/website-chat.sdk.ts
const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, 'dist');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const j = (v) => JSON.stringify(v);
const sdk = `import { workflow, node, trigger, sticky } from '@n8n/workflow-sdk';

const page = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: { name: 'Chat Page', parameters: { httpMethod: 'GET', path: 'ceo-brain/chat', responseMode: 'responseNode', options: {} }, position: [0, 300] },
  output: [{ headers: {}, params: {}, query: {}, body: {} }]
});

const serve = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Serve HTML', parameters: { respondWith: 'text', responseBody: ${j(html)}, options: { responseCode: 200, responseHeaders: { entries: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }] } } }, position: [220, 300] },
  output: [{}]
});

const note = sticky(${j('## CEO Brain — Chat with John (public page)\nGET /webhook/ceo-brain/chat serves the @n8n/chat widget pointed at the John Chat Console. The same widget is in ryan/ceo-brain/website-chat/embed-snippet.html for FusionTech.com.sg.\n\nSource: ryan/ceo-brain/website-chat/build.js — do not hand-edit.')}, [page, serve], { color: 4 });

export default workflow('ceo-brain-website-chat', 'CEO Brain — Chat with John (public page)')
  .add(page)
  .to(serve)
  .add(note);
`;
fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'website-chat.sdk.ts'), sdk);
console.log('built website-chat/dist/website-chat.sdk.ts', sdk.length, 'chars');
