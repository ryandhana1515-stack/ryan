// CEO Brain — Trainer API. The backend of Ryan's training dashboard.
// POST https://ryan1515.app.n8n.cloud/webhook/ceo-brain/trainer  { pin, action, agent, text, session }
//   action "list"     → agents registry (vault Knowledge/agents.json) + master brain note
//   action "playbook" → the agent's playbook note (live from the vault)
//   action "train"    → append "- <date> (dashboard) — <text>" under "## Lessons learned" of the agent's playbook (GitHub commit → Obsidian)
//   action "chat"     → talk to the agent: John via the chat console (test mode); Website Builder via a test brief
// The PIN lives in the "Trainer Config" node in n8n (change it there; never in the repo or the page).
import { workflow, node, trigger, sticky, ifElse, expr } from '@n8n/workflow-sdk';

const OWNER = { __rl: true, mode: 'name', value: 'ryandhana1515-stack' };
const REPO = { __rl: true, mode: 'name', value: 'ryan' };
const GITHUB_CRED = { githubOAuth2Api: { id: 'lZqYskCh7zVfXsc7', name: 'GitHub account' } };
const COMMITTER = { committer: { name: 'Zaphiel (n8n)', email: 'ryandhana1515@gmail.com' } };

const hook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Trainer Webhook',
    parameters: { httpMethod: 'POST', path: 'ceo-brain/trainer', responseMode: 'responseNode', options: { allowedOrigins: '*' } },
    position: [0, 300]
  },
  output: [{ body: { pin: 'x', action: 'list', agent: 'john', text: '', session: 's1' } }]
});

const config = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Trainer Config',
    parameters: { mode: 'manual', includeOtherFields: true, assignments: { assignments: [
      { id: 'pin', name: 'pin', value: 'fusiontech-trainer', type: 'string' },
      { id: 'chat', name: 'chat_url', value: 'https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat', type: 'string' },
      { id: 'reg', name: 'registry_path', value: 'zaphiel/vault/Knowledge/agents.json', type: 'string' },
      { id: 'brain', name: 'brain_path', value: 'zaphiel/vault/FusionTech AI — Master Company Brain.md', type: 'string' },
      { id: 'notify', name: 'notify_email', value: 'ryandhana1515@gmail.com', type: 'string' }
    ] } },
    position: [220, 300]
  },
  output: [{ pin: 'x', chat_url: 'https://…/chat', registry_path: 'zaphiel/vault/Knowledge/agents.json', brain_path: 'zaphiel/vault/FusionTech AI — Master Company Brain.md', notify_email: 'owner@example.com' }]
});

const parse = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Request',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `const cfg = $('Trainer Config').first().json;
const raw = $input.first().json || {};
const b = (raw.body && typeof raw.body === 'object') ? raw.body : raw;
const s = (v, max) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max || 2000));
const action = ['list', 'playbook', 'train', 'chat'].indexOf(s(b.action, 20)) !== -1 ? s(b.action, 20) : '';
const ok = s(b.pin, 100) !== '' && s(b.pin, 100) === String(cfg.pin) && action !== '';
return [{ json: { ok, error: ok ? '' : (action ? 'wrong_pin' : 'unknown_action'), action, agent_id: s(b.agent, 60).toLowerCase(), text: s(b.text, 4000), session: s(b.session, 80).replace(/[^a-z0-9_-]/gi, '') || ('dash' + Date.now().toString(36)), chat_url: cfg.chat_url, registry_path: cfg.registry_path, brain_path: cfg.brain_path, notify_email: cfg.notify_email } }];` },
    position: [440, 300]
  },
  output: [{ ok: true, error: '', action: 'list', agent_id: 'john', text: '', session: 's1', chat_url: 'https://…/chat', registry_path: 'zaphiel/vault/Knowledge/agents.json', brain_path: 'x.md', notify_email: 'o@example.com' }]
});

const authorized = ifElse({
  version: 2.3,
  config: { name: 'Authorized?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'ok', leftValue: expr('{{ $json.ok }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [660, 300] }
});

const respondDenied = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond 401', parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify({ ok: false, error: $('Parse Request').item.json.error }) }}"), options: { responseCode: 401 } }, position: [880, 520] },
  output: [{ ok: false }]
});

const loadRegistry = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Load Agents Registry', onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: OWNER, repository: REPO, filePath: expr("{{ $('Parse Request').item.json.registry_path }}"), asBinaryProperty: false, additionalParameters: {} }, credentials: GITHUB_CRED, position: [880, 300] },
  output: [{ content: 'e30=', encoding: 'base64', sha: 'x' }]
});

const resolve = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Resolve Agent',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `const req = $('Parse Request').first().json;
const got = ($input.first() && $input.first().json) || {};
const decode = (b64) => { try { return Buffer.from(String(b64).replace(/\\n/g, ''), 'base64').toString('utf8'); } catch (e) { return ''; } };
let registry = { agents: [] };
try { registry = JSON.parse(decode(got.content)) || registry; } catch (e) {}
const agents = Array.isArray(registry.agents) ? registry.agents : [];
const agent = agents.find((a) => a && a.id === req.agent_id) || null;
const needsAgent = req.action !== 'list';
return [{ json: Object.assign({}, req, {
  agents,
  agent,
  agent_ok: !needsAgent || !!agent,
  playbook_path: agent ? agent.playbook : '',
  is_list: req.action === 'list',
  is_playbook: req.action === 'playbook' && !!agent,
  is_train: req.action === 'train' && !!agent && req.text.length > 2,
  is_chat_john: req.action === 'chat' && !!agent && agent.chat === 'john' && req.text.length > 0,
  is_chat_wb: req.action === 'chat' && !!agent && agent.chat === 'website-builder' && req.text.length > 0
}) }];` },
    position: [1100, 300]
  },
  output: [{ ok: true, action: 'list', agents: [], agent: null, agent_ok: true, playbook_path: '', is_list: true, is_playbook: false, is_train: false, is_chat_john: false, is_chat_wb: false, text: '', session: 's1', chat_url: 'https://…/chat', brain_path: 'x.md', notify_email: 'o@example.com' }]
});

const isList = ifElse({ version: 2.3, config: { name: 'List?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'l', leftValue: expr('{{ $json.is_list }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [1320, 300] } });

const loadBrain = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Load Master Brain', onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: OWNER, repository: REPO, filePath: expr("{{ $('Resolve Agent').item.json.brain_path }}"), asBinaryProperty: false, additionalParameters: {} }, credentials: GITHUB_CRED, position: [1540, 100] },
  output: [{ content: 'IyBC', encoding: 'base64', sha: 'x' }]
});

const decodeBrain = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Decode Brain', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `const got = ($input.first() && $input.first().json) || {};
let brain = ''; try { if (got.content && !got.error) brain = Buffer.from(String(got.content).replace(/\\n/g, ''), 'base64').toString('utf8'); } catch (e) {}
return [{ json: { ok: true, agents: $('Resolve Agent').first().json.agents, brain } }];` }, position: [1760, 100] },
  output: [{ ok: true, agents: [], brain: '# Brain' }]
});

const respondList = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond List', parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json) }}'), options: { responseCode: 200 } }, position: [1980, 100] },
  output: [{ ok: true }]
});

const isPlaybook = ifElse({ version: 2.3, config: { name: 'Playbook?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'p', leftValue: expr("{{ $('Resolve Agent').item.json.is_playbook }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [1540, 300] } });

const loadPlaybook = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Load Playbook', onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: OWNER, repository: REPO, filePath: expr("{{ $('Resolve Agent').item.json.playbook_path }}"), asBinaryProperty: false, additionalParameters: {} }, credentials: GITHUB_CRED, position: [1760, 300] },
  output: [{ content: 'IyBC', encoding: 'base64', sha: 'x' }]
});

const decodePlaybook = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Decode Playbook', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `const got = ($input.first() && $input.first().json) || {};
let playbook = ''; try { if (got.content && !got.error) playbook = Buffer.from(String(got.content).replace(/\\n/g, ''), 'base64').toString('utf8'); } catch (e) {}
return [{ json: { ok: true, agent: $('Resolve Agent').first().json.agent, playbook } }];` }, position: [1980, 300] },
  output: [{ ok: true, agent: { id: 'john' }, playbook: '# John' }]
});

const respondPlaybook = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond Playbook', parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json) }}'), options: { responseCode: 200 } }, position: [2200, 300] },
  output: [{ ok: true }]
});

const isTrain = ifElse({ version: 2.3, config: { name: 'Train?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 't', leftValue: expr("{{ $('Resolve Agent').item.json.is_train }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [1760, 500] } });

const loadPlaybookForTrain = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Load Playbook (train)', onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: OWNER, repository: REPO, filePath: expr("{{ $('Resolve Agent').item.json.playbook_path }}"), asBinaryProperty: false, additionalParameters: {} }, credentials: GITHUB_CRED, position: [1980, 500] },
  output: [{ content: 'IyBC', encoding: 'base64', sha: 'x' }]
});

const appendTraining = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Append Training',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `const r = $('Resolve Agent').first().json;
const got = ($input.first() && $input.first().json) || {};
const decode = (b64) => { try { return Buffer.from(String(b64).replace(/\\n/g, ''), 'base64').toString('utf8'); } catch (e) { return ''; } };
let c = got && got.content && !got.error ? decode(got.content) : '';
if (!c) c = '---\\ntags: [zaphiel, knowledge, live]\\n---\\n# ' + r.agent.name + ' — playbook\\n';
const day = new Date().toISOString().slice(0, 10);
const line = '- ' + day + ' (dashboard) — ' + r.text.replace(/\\s+/g, ' ').trim();
const marker = '## Lessons learned';
c = c.replace(/\\s+$/, '');
if (c.indexOf(marker) === -1) c += '\\n\\n' + marker;
// insert the line right after the marker heading (newest first)
const i = c.indexOf(marker) + marker.length;
c = c.slice(0, i) + '\\n' + line + c.slice(i);
c = c.replace(/\\n- \\(add here after reviewing previews\\)/, '');
return [{ json: { path: r.playbook_path, content: c + '\\n', commit: 'vault: training for ' + r.agent.name + ' (dashboard)', line, playbook: c + '\\n' } }];` },
    position: [2200, 500]
  },
  output: [{ path: 'x.md', content: '# x', commit: 'vault: training', line: '- …', playbook: '# x' }]
});

const savePlaybook = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Save Playbook', onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'edit', owner: OWNER, repository: REPO, filePath: expr("{{ $('Append Training').item.json.path }}"), binaryData: false, fileContent: expr("{{ $('Append Training').item.json.content }}"), commitMessage: expr("{{ $('Append Training').item.json.commit }}"), additionalParameters: COMMITTER }, credentials: GITHUB_CRED, position: [2420, 500] },
  output: [{ commit: { sha: 'x' } }]
});

const respondTrained = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond Trained', parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify({ ok: !$json.error, saved: !$json.error, line: $('Append Training').item.json.line, playbook: $('Append Training').item.json.playbook, error: $json.error ? String($json.error.message || $json.error) : '' }) }}"), options: { responseCode: 200 } }, position: [2640, 500] },
  output: [{ ok: true }]
});

const isChatJohn = ifElse({ version: 2.3, config: { name: 'Chat with John?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'j', leftValue: expr("{{ $('Resolve Agent').item.json.is_chat_john }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [1980, 700] } });

const askJohn = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Ask John (chat console)',
    onError: 'continueRegularOutput',
    parameters: { method: 'POST', url: expr("{{ $('Resolve Agent').item.json.chat_url }}"), authentication: 'none', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: expr("{{ JSON.stringify({ action: 'sendMessage', sessionId: 'dash_' + $('Resolve Agent').item.json.session, chatInput: $('Resolve Agent').item.json.text }) }}"), options: { timeout: 120000, response: { response: { responseFormat: 'json', neverError: true } } } },
    position: [2200, 700]
  },
  output: [{ output: 'Hi…' }]
});

const respondJohn = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond John', parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify({ ok: true, agent: 'john', reply: $json.output || $json.text || ($json.error ? 'John could not answer: ' + String($json.error.message || $json.error) : JSON.stringify($json)) }) }}"), options: { responseCode: 200 } }, position: [2420, 700] },
  output: [{ ok: true }]
});

const isChatWb = ifElse({ version: 2.3, config: { name: 'Chat with Website Builder?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'w', leftValue: expr("{{ $('Resolve Agent').item.json.is_chat_wb }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [2200, 900] } });

const runWebsiteBuilder = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Run Website Builder (test brief)',
    onError: 'continueRegularOutput',
    parameters: {
      mode: 'once', source: 'database',
      workflowId: { __rl: true, mode: 'id', value: 'hSTRGnHVsu6tMOmH', cachedResultName: 'CEO Brain — Website Builder' },
      workflowInputs: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: 'fusiontech',
          lead_id: expr("{{ 'lead_dash_' + $('Resolve Agent').item.json.session }}"),
          contact_name: 'Dashboard tester', company_name: '', industry: '', email: '', phone: '', channel: 'web_chat',
          message: expr("{{ $('Resolve Agent').item.json.text }}"),
          conversation_json: '[]',
          sales_summary: expr("{{ $('Resolve Agent').item.json.text }}"),
          extracted_json: '{}',
          test_mode: true,
          notify_email: expr("{{ $('Resolve Agent').item.json.notify_email }}"),
          source_execution_id: 'dashboard'
        },
        matchingColumns: [],
        schema: [{ id: 'tenant_id', displayName: 'tenant_id', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'lead_id', displayName: 'lead_id', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'contact_name', displayName: 'contact_name', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'company_name', displayName: 'company_name', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'industry', displayName: 'industry', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'email', displayName: 'email', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'phone', displayName: 'phone', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'channel', displayName: 'channel', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'message', displayName: 'message', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'conversation_json', displayName: 'conversation_json', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'sales_summary', displayName: 'sales_summary', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'extracted_json', displayName: 'extracted_json', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'test_mode', displayName: 'test_mode', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'boolean' }, { id: 'notify_email', displayName: 'notify_email', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }, { id: 'source_execution_id', displayName: 'source_execution_id', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }],
        attemptToConvertTypes: false, convertFieldsToString: true
      },
      options: { waitForSubWorkflow: true }
    },
    position: [2420, 900]
  },
  output: [{ id: 'gmail' }]
});

const getBriefTask = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Get Brief Task', alwaysOutputData: true, onError: 'continueRegularOutput', parameters: { resource: 'row', operation: 'get', dataTableId: { __rl: true, mode: 'id', value: 'sPnRGXe4VYDJLJHr', cachedResultName: 'ceo_tasks' }, matchType: 'allConditions', filters: { conditions: [{ keyName: 'task_id', condition: 'eq', keyValue: expr("{{ 'task_web_lead_dash_' + $('Resolve Agent').item.json.session }}") }] }, returnAll: false, limit: 1 }, position: [2640, 900] },
  output: [{ task_id: 'task_web_lead_dash_s1', payload_json: '{}' }]
});

const summarizeBrief = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Summarize Brief', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: `const row = ($input.first() && $input.first().json) || {};
let p = {}; try { p = JSON.parse(row.payload_json || '{}') || {}; } catch (e) {}
const b = p.brief || {};
const reply = b.site_type
  ? ('Brief ready: ' + String(b.site_type).replace(/_/g, ' ') + ' for ' + (b.business_name || '[business name unknown]') + '. Goal: ' + b.primary_goal + '. Pages: ' + (b.pages || []).map((x) => x.name).join(', ') + '. Integrations: ' + ((b.integrations || []).join(', ') || 'none') + '. Still missing: ' + ((b.missing_information || []).join(', ') || 'nothing') + '. I would ask next: ' + ((b.questions_for_customer || []).join(' ') || '-'))
  : 'The Website Builder did not produce a brief (check the n8n executions).';
return [{ json: { ok: !!b.site_type, agent: 'website-builder', reply, brief: b, lovable_url: p.lovable_url || '', build_prompt: b.build_prompt || '' } }];` }, position: [2860, 900] },
  output: [{ ok: true, agent: 'website-builder', reply: 'Brief ready', brief: {}, lovable_url: '', build_prompt: '' }]
});

const respondWb = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond Website Builder', parameters: { respondWith: 'json', responseBody: expr('{{ JSON.stringify($json) }}'), options: { responseCode: 200 } }, position: [3080, 900] },
  output: [{ ok: true }]
});

const respondUnknown = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond 400', parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify({ ok: false, error: $('Resolve Agent').item.json.agent_ok ? 'nothing_to_do' : 'unknown_agent' }) }}"), options: { responseCode: 400 } }, position: [2420, 1100] },
  output: [{ ok: false }]
});

const note = sticky('## CEO Brain — Trainer API\nBackend of Ryan\'s training dashboard. POST /webhook/ceo-brain/trainer {pin, action, agent, text, session}.\n\nlist → agents registry (vault Knowledge/agents.json) + master brain · playbook → the agent\'s live playbook note · train → appends a dated line under "## Lessons learned" of that note (GitHub commit → Obsidian; the agent follows it on its next message) · chat → John via the chat console (test mode) or a test brief from the Website Builder.\n\nThe PIN lives in the Trainer Config node. Change it there; never in the repo or the page.', [hook, config, parse, authorized], { color: 4 });

export default workflow('ceo-brain-trainer-api', 'CEO Brain — Trainer API')
  .add(hook)
  .to(config)
  .to(parse)
  .to(authorized
    .onTrue(loadRegistry.to(resolve).to(isList
      .onTrue(loadBrain.to(decodeBrain).to(respondList))
      .onFalse(isPlaybook
        .onTrue(loadPlaybook.to(decodePlaybook).to(respondPlaybook))
        .onFalse(isTrain
          .onTrue(loadPlaybookForTrain.to(appendTraining).to(savePlaybook).to(respondTrained))
          .onFalse(isChatJohn
            .onTrue(askJohn.to(respondJohn))
            .onFalse(isChatWb
              .onTrue(runWebsiteBuilder.to(getBriefTask).to(summarizeBrief).to(respondWb))
              .onFalse(respondUnknown)))))))
    .onFalse(respondDenied))
  .add(note);
