#!/usr/bin/env node
// Generates the n8n Workflow-SDK source for "CEO Brain — Discovery Console": the hosted chat where a
// business owner (or Ryan, testing) talks to the Company Discovery & Onboarding Agent. Every turn:
// load the map → brain + playbook live from the vault → Claude → validate/merge/fallback → save the
// map (ceo_company_maps) → write the Company Map note (+ proposal draft when complete) into the vault → reply.
//
//   node workflows/discovery-console/build.js   -> dist/discovery-console.sdk.ts + dist/code-nodes/*.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const j = (v) => JSON.stringify(v);

const TABLES_JSON = JSON.parse(read('database/n8n-data-tables.json'));
const TABLES = TABLES_JSON.tables;
const GITHUB = TABLES_JSON.github;
const manifest = JSON.parse(read('agents/company-discovery/agent.json'));
const VAULT = manifest.vault_sources;
const mapSchema = JSON.stringify(JSON.parse(read('schemas/company-map.schema.json')));
const outSchema = JSON.stringify(JSON.parse(read('schemas/company-discovery-output.schema.json')));
const systemBody = read('prompts/company-discovery.system.md').replace('{{MAP_SCHEMA}}', mapSchema).replace('{{OUTPUT_SCHEMA}}', outSchema);
const userPrompt = read('prompts/company-discovery.user.md');
const NOTIFY = 'ryandhana1515@gmail.com';

function inline(file) {
  return read(file).split('\n').filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*\/\//.test(l) && l.trim() !== '').join('\n');
}
const dsSrc = inline('agents/company-discovery/discovery.js');
const prSrc = inline('agents/proposal/draft.js');

const codeContext = `// Session → map id + test flag. Test sessions (Ryan's console / dashboard) write under Discovery/Test.
const inp = $input.first().json || {};
const sessionId = String(inp.sessionId || ('anon' + Date.now().toString(36)));
const short = sessionId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 28) || 'anon';
const text = String(inp.chatInput || '').trim();
const testMode = /^(dash_|test_|mcp)/i.test(sessionId) || /^dash/i.test(short) || inp.test_mode === true;
return [{ json: { session_id: sessionId, map_id: 'map_' + short, text, test_mode: testMode, tenant_id: 'fusiontech', started_at: new Date().toISOString() } }];
`;

const codeCompose = `// Composes the Discovery Agent's prompts AT RUN TIME. The map so far comes from ceo_company_maps (already
// coerced by the Finalize node); the company brain and the discovery playbook are read live from Ryan's vault (GitHub).
const DS_TOPICS = ${j(require('../../agents/company-discovery/discovery.js').DS_TOPICS)};
function hasAny(obj) { if (!obj || typeof obj !== 'object') return false; for (const k in obj) { const v = obj[k]; if (Array.isArray(v) ? v.length : (v !== null && v !== undefined)) return true; } return false; }
function openTopics(map) {
  const m = map || {};
  const st = { company: hasAny(m.company_profile), customers: hasAny(m.customers), sales: hasAny(m.sales_process), marketing: hasAny(m.marketing), communication: Array.isArray(m.communication_channels) && m.communication_channels.length > 0, software: Array.isArray(m.current_software) && m.current_software.length > 0, operations: hasAny(m.operations_process), customer_service: hasAny(m.customer_service), finance: hasAny(m.finance_process), hr_team: hasAny(m.people_roles), management: hasAny(m.management), automation: hasAny(m.automation) || (Array.isArray(m.automation_opportunities) && m.automation_opportunities.length > 0), data_sources: Array.isArray(m.data_sources) && m.data_sources.length > 0 };
  return DS_TOPICS.filter((t) => !st[t]);
}
const STATIC_BODY = ${j(systemBody)};
const USER_PROMPT_TEMPLATE = ${j(userPrompt)};
function vaultText(nodeName) {
  try {
    const j = $(nodeName).first().json || {};
    if (j && j.content && !j.error) {
      const raw = String(j.content).replace(/\\n/g, '');
      const txt = Buffer.from(raw, 'base64').toString('utf8');
      return txt.replace(/^---[\\s\\S]*?---\\n/, '').trim() || null;
    }
  } catch (e) {}
  return null;
}
const ctx = $('Build Discovery Context').first().json;
const rows = $('Load Company Map').all().map((i) => i.json).filter((r) => r && r.map_id === ctx.map_id);
const row = rows[0] || null;
let map = null; try { map = row && row.map_json ? JSON.parse(row.map_json) : null; } catch (e) { map = null; }
let conversation = []; try { conversation = row && row.conversation_json ? JSON.parse(row.conversation_json) : []; } catch (e) { conversation = []; }
if (!Array.isArray(conversation)) conversation = [];
if (!map || typeof map !== 'object') map = {};
const turns = Number(row && row.turns) || 0;
const brain = vaultText('Load Brain from Vault');
const playbook = vaultText('Load Discovery Playbook');
const system = (brain ? '# FusionTech AI — company knowledge (live from Ryan\\'s vault; authoritative)\\n\\n' + brain + '\\n\\n' : '')
  + (playbook ? '# Discovery playbook (live from the vault — follow it; newest lessons win)\\n\\n' + playbook + '\\n\\n' : '')
  + STATIC_BODY;
const brainSource = (brain || playbook) ? 'vault:' + [brain ? 'brain' : null, playbook ? 'playbook' : null].filter(Boolean).join('+') : 'compiled_fallback';
const open = openTopics(map);
const convoText = conversation.slice(-16).map((m) => '- [' + (m.role || 'owner') + (m.ts ? ' ' + m.ts : '') + '] ' + String(m.content || '').slice(0, 1500)).join('\\n') || '(first message)';
const vars = { map_id: ctx.map_id, now: ctx.started_at, turn: String(turns + 1), contact_name: (row && row.contact_name) || 'not given', map_json: JSON.stringify(map), open_topics: open.join(', ') || 'none — wrap up', conversation: convoText, message: ctx.text || '(empty)' };
const user_prompt = USER_PROMPT_TEMPLATE.replace(/\\{\\{(\\w+)\\}\\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
return [{ json: { system_prompt: system, user_prompt, brain_source: brainSource, map, conversation, turns, row_exists: !!row, contact_name: (row && row.contact_name) || null, company_name: (row && row.company_name) || null, created_at: (row && row.created_at) || ctx.started_at, config: { model: ${j(manifest.model)}, agent: ${j(manifest.id)}, agent_version: ${j(manifest.version)} } } }];
`;

const codeFinalize = `${dsSrc}
${prSrc}
// ---- n8n glue ----
const ctx = $('Build Discovery Context').first().json;
const pre = $('Compose Discovery Prompt').first().json;
const inp = ($input.first() && $input.first().json) || {};
let rawText = null, error = null, model = pre.config.model;
if (inp.error) error = 'model_error: ' + String(inp.error.message || inp.error.description || JSON.stringify(inp.error)).slice(0, 300);
else {
  model = inp.model || model;
  if (typeof inp.text === 'string' && inp.text.trim()) rawText = inp.text;
  else if (Array.isArray(inp.content)) rawText = inp.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('\\n');
  else if (typeof inp.output === 'string') rawText = inp.output;
  if (!rawText) error = 'empty_model_output';
}
const historyText = (pre.conversation || []).map((m) => m.content).join('\\n');
const fin = finalizeDiscoveryTurn({ raw_text: rawText, error, input: { map: pre.map, message: ctx.text, turns: pre.turns, history_text: historyText, contact_name: pre.contact_name } });
const now = new Date().toISOString();
const conversation = (pre.conversation || []).concat([{ role: 'owner', content: ctx.text, ts: now }, { role: 'agent', content: fin.turn.reply, ts: now }]).slice(-60);
const companyName = fin.map.company_profile.company_name || pre.company_name || null;
const safe = (t) => String(t || '').replace(/[\\\\/:*?"<>|#^\\[\\]]/g, '-').replace(/\\s+/g, ' ').trim();
const vaultPath = 'zaphiel/vault/Discovery/' + (ctx.test_mode ? 'Test/' : '') + ctx.map_id + '.md';
const proposalMd = fin.discovery_complete ? draftProposal(fin.map, { company_name: companyName, contact_name: pre.contact_name, date: now.slice(0, 10) }) : '';
const note = dsRenderMapNote({ map: fin.map, map_id: ctx.map_id, contact_name: pre.contact_name, ts: now, test_mode: ctx.test_mode, discovery_complete: fin.discovery_complete, proposal_md: proposalMd });
const status = fin.discovery_complete ? 'complete' : 'in_progress';
const meta = ' · ' + Math.round(fin.coverage * 100) + '% mapped' + (fin.next_topics.length ? ' · next: ' + fin.next_topics.slice(0, 2).join(', ') : '') + ' · ' + fin.provider + (fin.fallback_used ? ' fallback' : '') + (fin.discovery_complete ? ' · Company Map + proposal draft written to the vault' : '');
return [{ json: {
  map_id: ctx.map_id, session_id: ctx.session_id, tenant_id: ctx.tenant_id, test_mode: ctx.test_mode,
  company_name: companyName, contact_name: pre.contact_name, status, coverage: fin.coverage, turns: pre.turns + 1,
  map_json: JSON.stringify(fin.map), conversation_json: JSON.stringify(conversation), proposal_md: proposalMd,
  vault_path: vaultPath, note, commit: 'vault: company map ' + (companyName || ctx.map_id) + (fin.discovery_complete ? ' (complete + proposal draft)' : ' (' + Math.round(fin.coverage * 100) + '%)'),
  provider: fin.provider, model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason, guardrails: fin.guardrails, brain_source: pre.brain_source,
  row_exists: pre.row_exists, created_at: pre.created_at, updated_at: now, discovery_complete: fin.discovery_complete,
  reply: fin.turn.reply, output: fin.turn.reply + '\\n\\n— discovery' + meta,
  task: fin.discovery_complete ? { task_id: 'task_proposal_' + ctx.map_id.replace(/[^a-z0-9_]/gi, '').slice(0, 60), title: 'REVIEW: proposal draft for ' + (companyName || ctx.map_id), description: 'Discovery complete (' + Math.round(fin.coverage * 100) + '%). Company Map + proposal draft (no pricing) in ' + vaultPath + '. Review, price and approve before anything is sent.' } : null,
  run_id: 'run_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36), started_at: ctx.started_at, finished_at: now, latency_ms: Math.max(0, new Date(now).getTime() - new Date(ctx.started_at).getTime())
} }];
`;

const col = (id, type) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type, canBeUsedToMatch: true });
const schemaFor = (cols) => cols.map(([id, type]) => col(id, type));
const table = (name) => ({ __rl: true, mode: 'id', value: TABLES[name].id, cachedResultName: name });
const mapCols = [['tenant_id','string'],['map_id','string'],['session_id','string'],['company_name','string'],['contact_name','string'],['status','string'],['coverage','number'],['turns','number'],['map_json','string'],['conversation_json','string'],['proposal_md','string'],['vault_path','string'],['provider','string'],['test_mode','boolean'],['created_at','string'],['updated_at','string']];
const runCols = [['tenant_id','string'],['run_id','string'],['agent','string'],['agent_version','string'],['lead_id','string'],['workflow_id','string'],['execution_id','string'],['model','string'],['provider','string'],['input_ref','string'],['output_json','string'],['success','boolean'],['error','string'],['latency_ms','number'],['test_mode','boolean'],['started_at','string'],['finished_at','string']];
const taskCols = [['tenant_id','string'],['task_id','string'],['lead_id','string'],['task_type','string'],['title','string'],['description','string'],['due_at','string'],['status','string'],['assigned_to','string'],['requires_approval','boolean'],['approval_reason','string'],['payload_json','string'],['created_by','string'],['ts','string']];
const F = "$('Finalize Discovery Turn').item.json";
const gh = (name, params, position, onError) => `node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: ${j(name)}, onError: ${j(onError || 'continueRegularOutput')}, parameters: { authentication: 'oAuth2', resource: 'file', owner: { __rl: true, mode: 'name', value: ${j(GITHUB.owner)} }, repository: { __rl: true, mode: 'name', value: ${j(GITHUB.repo)} }, ${params} }, credentials: { githubOAuth2Api: { id: ${j(GITHUB.credential_id)}, name: ${j(GITHUB.credential_name)} } }, position: ${j(position)} },
  output: [{ content: 'IyBX', sha: 'x' }]
})`;

const sdk = `import { workflow, node, trigger, sticky, ifElse, expr } from '@n8n/workflow-sdk';

const chat = trigger({
  type: '@n8n/n8n-nodes-langchain.chatTrigger',
  version: 1.5,
  config: {
    name: 'Discovery Chat (hosted)',
    parameters: {
      public: true,
      mode: 'hostedChat',
      authentication: 'none',
      initialMessages: "Hello, I'm the FusionTech discovery consultant. Tell me about your company — what do you sell, and roughly how many people work there?",
      options: { title: 'FusionTech AI — Company Discovery', subtitle: 'A conversation, not a form. We find where your information already lives.', inputPlaceholder: 'Tell me about your business…', responseMode: 'lastNode', loadPreviousSession: 'notSupported', showWelcomeScreen: false }
    },
    position: [0, 300]
  },
  output: [{ sessionId: 'abc123', action: 'sendMessage', chatInput: 'We are a logistics company with 15 drivers' }]
});

const context = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Build Discovery Context', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeContext)} }, position: [220, 300] },
  output: [{ session_id: 'abc123', map_id: 'map_abc123', text: 'We are a logistics company', test_mode: false, tenant_id: 'fusiontech', started_at: '2026-01-01T00:00:00.000Z' }]
});

const loadMap = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Load Company Map',
    alwaysOutputData: true,
    onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'get', dataTableId: ${j(table('ceo_company_maps'))}, matchType: 'allConditions', filters: { conditions: [{ keyName: 'map_id', condition: 'eq', keyValue: expr("{{ $('Build Discovery Context').item.json.map_id }}") }] }, returnAll: false, limit: 1 },
    position: [440, 300]
  },
  output: [{ id: 1, map_id: 'map_abc123', map_json: '{}', conversation_json: '[]', turns: 0 }]
});

const loadBrain = ${gh('Load Brain from Vault', `operation: 'get', filePath: ${j(VAULT.brain)}, asBinaryProperty: false, additionalParameters: {}`, [660, 300])};

const loadPlaybook = ${gh('Load Discovery Playbook', `operation: 'get', filePath: ${j(VAULT.playbook)}, asBinaryProperty: false, additionalParameters: {}`, [880, 300])};

const compose = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Compose Discovery Prompt', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeCompose)} }, position: [1100, 300] },
  output: [{ system_prompt: 'You are…', user_prompt: 'Discovery…', brain_source: 'vault:brain+playbook', map: {}, conversation: [], turns: 0, row_exists: false, contact_name: null, company_name: null, created_at: '2026-01-01T00:00:00.000Z', config: { model: ${j(manifest.model)}, agent: 'company-discovery', agent_version: '1.0.0' } }]
});

const claude = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'Discovery Agent (Claude)',
    onError: 'continueErrorOutput',
    parameters: {
      resource: 'text', operation: 'message',
      modelId: { __rl: true, mode: 'list', value: ${j(manifest.model)}, cachedResultName: ${j(manifest.model_display_name)} },
      messages: { values: [{ role: 'user', content: expr("{{ $('Compose Discovery Prompt').item.json.user_prompt }}") }] },
      simplify: true,
      options: { system: expr("{{ $('Compose Discovery Prompt').first().json.system_prompt }}"), maxTokens: ${manifest.max_tokens}, temperature: ${manifest.temperature}, includeMergedResponse: true }
    },
    position: [1320, 300]
  },
  output: [{ text: '{"schema_version":"1.0","reply":"Thanks"}', model: ${j(manifest.model)} }]
});

const finalize = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Finalize Discovery Turn', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeFinalize)} }, position: [1600, 300] },
  output: [{ map_id: 'map_abc123', session_id: 'abc123', tenant_id: 'fusiontech', test_mode: false, company_name: null, contact_name: null, status: 'in_progress', coverage: 0.2, turns: 1, map_json: '{}', conversation_json: '[]', proposal_md: '', vault_path: 'zaphiel/vault/Discovery/map_abc123.md', note: '# x', commit: 'vault: company map', provider: 'anthropic', model: 'm', fallback_used: false, fallback_reason: null, guardrails: [], brain_source: 'vault', row_exists: false, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z', discovery_complete: false, reply: 'Thanks', output: 'Thanks', task: null, run_id: 'run_x', started_at: '2026-01-01T00:00:00.000Z', finished_at: '2026-01-01T00:00:01.000Z', latency_ms: 1000 }]
});

const saveMap = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Save Company Map',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row', operation: 'upsert', dataTableId: ${j(table('ceo_company_maps'))}, matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'map_id', condition: 'eq', keyValue: expr("{{ ${F}.map_id }}") }] },
      columns: { mappingMode: 'defineBelow', value: {
        tenant_id: expr("{{ ${F}.tenant_id }}"), map_id: expr("{{ ${F}.map_id }}"), session_id: expr("{{ ${F}.session_id }}"), company_name: expr("{{ ${F}.company_name ?? '' }}"), contact_name: expr("{{ ${F}.contact_name ?? '' }}"),
        status: expr("{{ ${F}.status }}"), coverage: expr("{{ ${F}.coverage }}"), turns: expr("{{ ${F}.turns }}"), map_json: expr("{{ ${F}.map_json }}"), conversation_json: expr("{{ ${F}.conversation_json }}"), proposal_md: expr("{{ ${F}.proposal_md }}"),
        vault_path: expr("{{ ${F}.vault_path }}"), provider: expr("{{ ${F}.provider }}"), test_mode: expr("{{ ${F}.test_mode }}"), created_at: expr("{{ ${F}.created_at }}"), updated_at: expr("{{ ${F}.updated_at }}")
      }, matchingColumns: [], schema: ${j(schemaFor(mapCols))} }
    },
    position: [1820, 300]
  },
  output: [{ id: 1 }]
});

const logRun = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Agent Run',
    onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'insert', dataTableId: ${j(table('ceo_agent_runs'))}, columns: { mappingMode: 'defineBelow', value: {
      tenant_id: expr("{{ ${F}.tenant_id }}"), run_id: expr("{{ ${F}.run_id }}"), agent: 'company-discovery', agent_version: ${j(manifest.version)}, lead_id: expr("{{ ${F}.map_id }}"), workflow_id: expr("{{ $workflow.id }}"), execution_id: expr("{{ $execution.id }}"), model: expr("{{ ${F}.model }}"), provider: expr("{{ ${F}.provider }}"), input_ref: expr("{{ 'chat_session:' + ${F}.session_id }}"), output_json: expr("{{ JSON.stringify({ coverage: ${F}.coverage, status: ${F}.status, reply: ${F}.reply, guardrails: ${F}.guardrails, brain_source: ${F}.brain_source }) }}"), success: true, error: expr("{{ ${F}.fallback_used ? String(${F}.fallback_reason) : '' }}"), latency_ms: expr("{{ ${F}.latency_ms }}"), test_mode: expr("{{ ${F}.test_mode }}"), started_at: expr("{{ ${F}.started_at }}"), finished_at: expr("{{ ${F}.finished_at }}")
    }, schema: ${j(schemaFor(runCols))} } },
    position: [2040, 300]
  },
  output: [{ id: 1 }]
});

const getNote = ${gh('Get Map Note', `operation: 'get', filePath: expr("{{ ${F}.vault_path }}"), asBinaryProperty: false, additionalParameters: {}`, [2260, 300])};

const noteExists = ifElse({ version: 2.3, config: { name: 'Note Exists?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'e', leftValue: expr('{{ !!$json.sha && !$json.error }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [2480, 300] } });

const editNote = ${gh('Update Map Note', `operation: 'edit', filePath: expr("{{ ${F}.vault_path }}"), binaryData: false, fileContent: expr("{{ ${F}.note }}"), commitMessage: expr("{{ ${F}.commit }}"), additionalParameters: { committer: { name: 'Zaphiel (n8n)', email: ${j(NOTIFY)} } }`, [2700, 200])};

const createNote = ${gh('Create Map Note', `operation: 'create', filePath: expr("{{ ${F}.vault_path }}"), binaryData: false, fileContent: expr("{{ ${F}.note }}"), commitMessage: expr("{{ ${F}.commit }}"), additionalParameters: { committer: { name: 'Zaphiel (n8n)', email: ${j(NOTIFY)} } }`, [2700, 420])};

const isComplete = ifElse({ version: 2.3, config: { name: 'Discovery Complete?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'c', leftValue: expr("{{ ${F}.discovery_complete }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [2920, 300] } });

const proposalTask = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Upsert Proposal Review Task',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row', operation: 'upsert', dataTableId: ${j(table('ceo_tasks'))}, matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'task_id', condition: 'eq', keyValue: expr("{{ ${F}.task.task_id }}") }] },
      columns: { mappingMode: 'defineBelow', value: {
        tenant_id: expr("{{ ${F}.tenant_id }}"), task_id: expr("{{ ${F}.task.task_id }}"), lead_id: expr("{{ ${F}.map_id }}"), task_type: 'proposal_draft', title: expr("{{ ${F}.task.title }}"), description: expr("{{ ${F}.task.description }}"), due_at: '', status: 'open', assigned_to: 'human', requires_approval: true, approval_reason: 'proposal_and_pricing_require_human_approval', payload_json: expr("{{ JSON.stringify({ vault_path: ${F}.vault_path, coverage: ${F}.coverage, company_name: ${F}.company_name }) }}"), created_by: 'agent:company-discovery', ts: expr("{{ ${F}.finished_at }}")
      }, matchingColumns: [], schema: ${j(schemaFor(taskCols))} }
    },
    position: [3140, 200]
  },
  output: [{ id: 1 }]
});

const emailOwner = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Email Owner (proposal draft ready)',
    onError: 'continueRegularOutput',
    parameters: { resource: 'message', operation: 'send', sendTo: ${j(NOTIFY)}, subject: expr("{{ (${F}.test_mode ? '[TEST] ' : '') + 'CEO Brain: discovery complete — ' + (${F}.company_name || ${F}.map_id) }}"), emailType: 'html', message: expr("{{ '<h2>Company Map + proposal draft ready</h2><p><b>' + (${F}.company_name || ${F}.map_id) + '</b> · coverage ' + Math.round(${F}.coverage * 100) + '% · ' + ${F}.turns + ' turns · ' + ${F}.provider + '</p><p>Open in Obsidian: <code>' + ${F}.vault_path + '</code> (also on GitHub). The proposal draft has NO pricing: review, price and approve before anything is sent to the customer.</p><details><summary>Proposal draft</summary><pre style=\\"white-space:pre-wrap;font-family:inherit\\">' + String(${F}.proposal_md).replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</pre></details>' }}"), options: { appendAttribution: false, senderName: 'CEO Brain' } },
    position: [3360, 200]
  },
  output: [{ id: 'gmail_x' }]
});

const reply = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Reply to Owner', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "const f = $('Finalize Discovery Turn').first().json;\\nreturn [{ json: { output: f.output } }];" }, position: [3580, 300] },
  output: [{ output: 'Thanks…' }]
});

const note = sticky(${j('## CEO Brain — Discovery Console (Company Discovery & Onboarding Agent)\nHosted chat where a business owner talks to the discovery consultant. Every turn: load the Company Map so far (ceo_company_maps) → brain + discovery playbook live from the vault → Claude → validate, merge, guardrails, rules fallback → save map + agent run → write the Client Digital Company Map note into the vault (Discovery/; tests under Discovery/Test) → when complete: proposal DRAFT (no pricing) + review task + email Ryan → reply.\n\nSource of truth: ryan/ceo-brain/workflows/discovery-console/build.js. Do not hand-edit Code nodes.')}, [chat, context, loadMap, loadBrain, loadPlaybook], { color: 4 });

export default workflow('ceo-brain-discovery-console', 'CEO Brain — Discovery Console')
  .add(chat)
  .to(context)
  .to(loadMap)
  .to(loadBrain)
  .to(loadPlaybook)
  .to(compose)
  .to(claude.to(finalize))
  .add(claude.onError(finalize))
  .add(finalize)
  .to(saveMap)
  .to(logRun)
  .to(getNote)
  .to(noteExists
    .onTrue(editNote.to(isComplete))
    .onFalse(createNote.to(isComplete)))
  .add(isComplete
    .onTrue(proposalTask.to(emailOwner).to(reply))
    .onFalse(reply))
  .add(note);
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'discovery-console.sdk.ts'), sdk);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'build-discovery-context.js'), codeContext);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'compose-discovery-prompt.js'), codeCompose);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'finalize-discovery-turn.js'), codeFinalize);
fs.writeFileSync(path.join(DIST, 'system-prompt.compiled.md'), systemBody);
console.log('built', path.relative(ROOT, path.join(DIST, 'discovery-console.sdk.ts')), sdk.length, 'chars');
