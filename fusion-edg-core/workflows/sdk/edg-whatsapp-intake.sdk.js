import { workflow, node, trigger, expr, newCredential } from '@n8n/workflow-sdk';

const start = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: { name: 'Receive', parameters: { httpMethod: 'POST', path: "edg/whatsapp", responseMode: 'responseNode', options: {} }, position: [0, 300] }
});

const config = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: { name: 'EDG Config', parameters: { mode: 'manual', includeOtherFields: true, assignments: { assignments: [
    { id: 'api', name: 'edg_api_url', value: 'https://edg-api.example.invalid', type: 'string' },
    { id: 'org', name: 'org', value: 'acme-demo', type: 'string' }
  ] } }, position: [220, 300] }
});

const callApi = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: "Forward to EDG",
    retryOnFail: true, maxTries: 3, waitBetweenTries: 2000,
    onError: 'continueErrorOutput',
    parameters: {
      method: 'POST',
      url: expr("{{ $('EDG Config').item.json.edg_api_url }}/api/o/{{ $('EDG Config').item.json.org }}/webhooks/whatsapp/forwarded"),
      authentication: 'genericCredentialType', genericAuthType: 'httpTemplatedCustomAuth',
      sendHeaders: true, headerParameters: { parameters: [{ name: 'X-Correlation-Id', value: expr('{{ $execution.id }}') }] },
      sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: expr("{{ JSON.stringify($('Receive').item.json.body) }}"),
      options: { timeout: 20000 }
    },
    credentials: { httpTemplatedCustomAuth: newCredential('EDG API key (X-EDG-Key)') },
    position: [440, 300]
  }
});

const ok = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: "Ack 200", parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify({ ok: true }) }}"), options: { responseCode: 200 } }, position: [660, 200] }
});

const fail = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: "EDG Unavailable (provider retries)", parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify({ ok: false }) }}"), options: { responseCode: 503 } }, position: [660, 420] }
});

export default workflow("edg-whatsapp-intake", "EDG — WhatsApp Intake (forward provider webhook)")
  .add(start).to(config).to(callApi).to(ok)
  .add(callApi.onError(fail));
