import { workflow, node, trigger, expr, newCredential } from '@n8n/workflow-sdk';

const start = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: { name: 'Schedule', parameters: { rule: { interval: [{"field":"minutes","minutesInterval":15}] } }, position: [0, 300] }
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
    name: "Run Due Follow-ups",
    retryOnFail: true, maxTries: 3, waitBetweenTries: 2000,
    onError: 'continueErrorOutput',
    parameters: {
      method: 'POST',
      url: expr("{{ $('EDG Config').item.json.edg_api_url }}/api/o/{{ $('EDG Config').item.json.org }}/jobs/follow-ups"),
      authentication: 'genericCredentialType', genericAuthType: 'httpTemplatedCustomAuth',
      sendHeaders: true, headerParameters: { parameters: [{ name: 'X-Correlation-Id', value: expr('{{ $execution.id }}') }] },
      sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: expr("{{ JSON.stringify({ triggered_at: $now.toISO() }) }}"),
      options: { timeout: 20000 }
    },
    credentials: { httpTemplatedCustomAuth: newCredential('EDG API key (X-EDG-Key)') },
    position: [440, 300]
  }
});

const failed = node({
  type: 'n8n-nodes-base.stopAndError',
  version: 1,
  config: { name: 'Fail Loudly', parameters: { errorMessage: "EDG follow-up job failed after retries" }, position: [660, 420] }
});

export default workflow("edg-follow-up", "EDG — Follow-up runner (every 15 min)")
  .add(start).to(config).to(callApi)
  .add(callApi.onError(failed));
