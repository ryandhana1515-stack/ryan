// Generates the n8n Workflow SDK source for every EDG workflow template into workflows/sdk/.
//   node workflows/generate.mjs
// Design (ADR-0004): n8n is the trigger/schedule layer only. Every workflow calls the EDG API, where the business logic,
// permissions, idempotency and audit live (and are tested). Each template: trigger → config → call EDG API (retries) →
// success / error path. Templates are created INACTIVE; activation per client is a separate, approved step.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('./sdk/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const j = JSON.stringify;

const header = `import { workflow, node, trigger, expr, newCredential } from '@n8n/workflow-sdk';`;

// Per-client values live in one Set node (no secrets: the API key is an n8n credential).
const config = (x) => `const config = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: { name: 'EDG Config', parameters: { mode: 'manual', includeOtherFields: true, assignments: { assignments: [
    { id: 'api', name: 'edg_api_url', value: 'https://edg-api.example.invalid', type: 'string' },
    { id: 'org', name: 'org', value: 'acme-demo', type: 'string' }
  ] } }, position: [${x}, 300] }
});`;

const callApi = (name, path, bodyExpr, x) => `const callApi = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: ${j(name)},
    retryOnFail: true, maxTries: 3, waitBetweenTries: 2000,
    onError: 'continueErrorOutput',
    parameters: {
      method: 'POST',
      url: expr(${j(`{{ $('EDG Config').item.json.edg_api_url }}/api/o/{{ $('EDG Config').item.json.org }}${path}`)}),
      authentication: 'genericCredentialType', genericAuthType: 'httpTemplatedCustomAuth',
      sendHeaders: true, headerParameters: { parameters: [{ name: 'X-Correlation-Id', value: expr('{{ $execution.id }}') }] },
      sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: expr(${j(bodyExpr)}),
      options: { timeout: 20000 }
    },
    credentials: { httpTemplatedCustomAuth: newCredential('EDG API key (X-EDG-Key)') },
    position: [${x}, 300]
  }
});`;

const webhookTrigger = (path) => `const start = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: { name: 'Receive', parameters: { httpMethod: 'POST', path: ${j(path)}, responseMode: 'responseNode', options: {} }, position: [0, 300] }
});`;

const respond = (varName, name, code, bodyExpr, x, y) => `const ${varName} = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: ${j(name)}, parameters: { respondWith: 'json', responseBody: expr(${j(bodyExpr)}), options: { responseCode: ${code} } }, position: [${x}, ${y}] }
});`;

const schedule = (rule) => `const start = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: { name: 'Schedule', parameters: { rule: { interval: [${j(rule)}] } }, position: [0, 300] }
});`;

const stopOnError = (msg, x) => `const failed = node({
  type: 'n8n-nodes-base.stopAndError',
  version: 1,
  config: { name: 'Fail Loudly', parameters: { errorMessage: ${j(msg)} }, position: [${x}, 420] }
});`;

const subTrigger = (inputs) => `const start = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.1,
  config: { name: 'Called by another workflow', parameters: { inputSource: 'workflowInputs', workflowInputs: { values: ${j(inputs.map((n) => ({ name: n, type: 'string' })))} } }, position: [0, 300] }
});`;

const templates = {
  'edg-lead-intake': {
    title: 'EDG — Lead Intake (forward to EDG API)',
    code: [webhookTrigger('edg/lead-intake'), config(220), callApi('Create Lead in EDG', '/leads', '{{ JSON.stringify($(\'Receive\').item.json.body) }}', 440),
      respond('ok', 'Accepted', 200, '{{ JSON.stringify({ ok: true, lead_id: $json.lead_id, duplicate: $json.duplicate }) }}', 660, 200),
      respond('fail', 'EDG Unavailable (sender retries)', 503, '{{ JSON.stringify({ ok: false, retry: true }) }}', 660, 420)].join('\n\n'),
    wire: `.add(start).to(config).to(callApi).to(ok)\n  .add(callApi.onError(fail))`,
  },
  'edg-whatsapp-intake': {
    title: 'EDG — WhatsApp Intake (forward provider webhook)',
    code: [webhookTrigger('edg/whatsapp'), config(220), callApi('Forward to EDG', '/webhooks/whatsapp/forwarded', '{{ JSON.stringify($(\'Receive\').item.json.body) }}', 440),
      respond('ok', 'Ack 200', 200, '{{ JSON.stringify({ ok: true }) }}', 660, 200),
      respond('fail', 'EDG Unavailable (provider retries)', 503, '{{ JSON.stringify({ ok: false }) }}', 660, 420)].join('\n\n'),
    wire: `.add(start).to(config).to(callApi).to(ok)\n  .add(callApi.onError(fail))`,
  },
  'edg-email-intake': {
    title: 'EDG — Email Intake (IMAP → EDG API)',
    code: [`const start = trigger({
  type: 'n8n-nodes-base.emailReadImap',
  version: 2.2,
  config: { name: 'New Email', parameters: { mailbox: 'INBOX', postProcessAction: 'nothing', format: 'simple', options: { trackLastMessageId: true } }, credentials: { imap: newCredential('Client enquiries mailbox (IMAP)') }, position: [0, 300] }
});`, config(220),
      callApi('Send Email to EDG', '/email-intake', '{{ JSON.stringify({ from: $(\'New Email\').item.json.from, subject: $(\'New Email\').item.json.subject, text: $(\'New Email\').item.json.textPlain, message_id: $(\'New Email\').item.json.metadata && $(\'New Email\').item.json.metadata[\'message-id\'] }) }}', 440),
      stopOnError('EDG email intake failed after retries. The email stays unread in the mailbox; EDG dedupes by message id, so the next poll or a manual re-run is safe.', 660)].join('\n\n'),
    wire: `.add(start).to(config).to(callApi)\n  .add(callApi.onError(failed))`,
  },
  'edg-lead-deduplication': {
    title: 'EDG — Lead Deduplication check (sub-workflow)',
    code: [subTrigger(['phone', 'email']), config(220), callApi('Dedupe Check', '/dedupe-check', '{{ JSON.stringify({ phone: $(\'Called by another workflow\').item.json.phone, email: $(\'Called by another workflow\').item.json.email }) }}', 440),
      stopOnError('EDG dedupe check failed', 660)].join('\n\n'),
    wire: `.add(start).to(config).to(callApi)\n  .add(callApi.onError(failed))`,
  },
  'edg-lead-assignment': {
    title: 'EDG — Lead Assignment (sub-workflow, round-robin)',
    code: [subTrigger(['lead_id']), config(220), callApi('Assign Lead', '/leads/assign', '{{ JSON.stringify({ lead_id: $(\'Called by another workflow\').item.json.lead_id }) }}', 440),
      stopOnError('EDG lead assignment failed', 660)].join('\n\n'),
    wire: `.add(start).to(config).to(callApi)\n  .add(callApi.onError(failed))`,
  },
  'edg-follow-up': {
    title: 'EDG — Follow-up runner (every 15 min)',
    code: [schedule({ field: 'minutes', minutesInterval: 15 }), config(220), callApi('Run Due Follow-ups', '/jobs/follow-ups', '{{ JSON.stringify({ triggered_at: $now.toISO() }) }}', 440), stopOnError('EDG follow-up job failed after retries', 660)].join('\n\n'),
    wire: `.add(start).to(config).to(callApi)\n  .add(callApi.onError(failed))`,
  },
  'edg-ceo-daily-brief': {
    title: 'EDG — CEO Daily Brief (weekdays 08:00, set workflow timezone to the client)',
    code: [schedule({ field: 'cronExpression', expression: '0 8 * * 1-5' }), config(220), callApi('Build + Deliver Brief', '/jobs/ceo-brief', '{{ JSON.stringify({ triggered_at: $now.toISO() }) }}', 440), stopOnError('CEO brief job failed after retries', 660)].join('\n\n'),
    wire: `.add(start).to(config).to(callApi)\n  .add(callApi.onError(failed))`,
  },
  'edg-outbox-dispatcher': {
    title: 'EDG — Outbox dispatcher (every minute)',
    code: [schedule({ field: 'minutes', minutesInterval: 1 }), config(220), callApi('Dispatch Events', '/jobs/dispatch-events', '{{ JSON.stringify({ triggered_at: $now.toISO() }) }}', 440), stopOnError('EDG outbox dispatch failed after retries', 660)].join('\n\n'),
    wire: `.add(start).to(config).to(callApi)\n  .add(callApi.onError(failed))`,
  },
};

for (const [id, t] of Object.entries(templates)) {
  const src = `${header}\n\n${t.code}\n\nexport default workflow(${j(id)}, ${j(t.title)})\n  ${t.wire};\n`;
  writeFileSync(OUT + `${id}.sdk.js`, src);
}
writeFileSync(OUT + 'index.json', JSON.stringify(Object.fromEntries(Object.entries(templates).map(([id, t]) => [id, t.title])), null, 2) + '\n');
console.log(`wrote ${Object.keys(templates).length} SDK sources to workflows/sdk/`);
