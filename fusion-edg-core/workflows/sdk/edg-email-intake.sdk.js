import { workflow, node, trigger, expr, newCredential } from '@n8n/workflow-sdk';

const start = trigger({
  type: 'n8n-nodes-base.emailReadImap',
  version: 2.2,
  config: { name: 'New Email', parameters: { mailbox: 'INBOX', postProcessAction: 'nothing', format: 'simple', options: { trackLastMessageId: true } }, credentials: { imap: newCredential('Client enquiries mailbox (IMAP)') }, position: [0, 300] }
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
    name: "Send Email to EDG",
    retryOnFail: true, maxTries: 3, waitBetweenTries: 2000,
    onError: 'continueErrorOutput',
    parameters: {
      method: 'POST',
      url: expr("{{ $('EDG Config').item.json.edg_api_url }}/api/o/{{ $('EDG Config').item.json.org }}/email-intake"),
      authentication: 'genericCredentialType', genericAuthType: 'httpTemplatedCustomAuth',
      sendHeaders: true, headerParameters: { parameters: [{ name: 'X-Correlation-Id', value: expr('{{ $execution.id }}') }] },
      sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: expr("{{ JSON.stringify({ from: $('New Email').item.json.from, subject: $('New Email').item.json.subject, text: $('New Email').item.json.textPlain, message_id: $('New Email').item.json.metadata && $('New Email').item.json.metadata['message-id'] }) }}"),
      options: { timeout: 20000 }
    },
    credentials: { httpTemplatedCustomAuth: newCredential('EDG API key (X-EDG-Key)') },
    position: [440, 300]
  }
});

const failed = node({
  type: 'n8n-nodes-base.stopAndError',
  version: 1,
  config: { name: 'Fail Loudly', parameters: { errorMessage: "EDG email intake failed after retries. The email stays unread in the mailbox; EDG dedupes by message id, so the next poll or a manual re-run is safe." }, position: [660, 420] }
});

export default workflow("edg-email-intake", "EDG — Email Intake (IMAP → EDG API)")
  .add(start).to(config).to(callApi)
  .add(callApi.onError(failed));
