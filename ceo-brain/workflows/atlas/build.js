#!/usr/bin/env node
// Generates the n8n Workflow-SDK source for "CEO Brain — ATLAS (EDG & CRM Systems Architect)".
// Called by Lead Intake when John has learned that a named company needs CRM / automation / integrations
// (atNeeded). Once per lead: DESIGN mode up to CHECKPOINT 1. Ryan's agent file `.claude/agents/atlas.md` is read
// live from GitHub and used as the system prompt (+ the n8n runtime addendum) → Claude → finalize (deterministic
// fallback) → approval task for Ryan + run + audit + email + Orchestrator event (edg.checkpoint_1) → the five
// checkpoint-1 files written to 80_Clients/<slug>/edg/ in the vault. Never talks to the customer.
//
//   node workflows/atlas/build.js   -> dist/atlas.sdk.ts + dist/code-nodes/*.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const j = (v) => JSON.stringify(v);

const TABLES_JSON = JSON.parse(read('database/n8n-data-tables.json'));
const TABLES = TABLES_JSON.tables;
const GITHUB = TABLES_JSON.github;
const manifest = JSON.parse(read('agents/atlas/agent.json'));
const runtime = read('prompts/atlas.runtime.md');
const userPrompt = read('prompts/atlas.user.md');
const EVENT_URL = 'https://ryan1515.app.n8n.cloud/webhook/ceo-brain/event';

function inline(file) {
  return read(file).replace(/\/\/ ---- Node module wrapper[\s\S]*$/m, '').split('\n').filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*\/\//.test(l) && l.trim() !== '').join('\n');
}
function pick(file, names) {
  const lines = inline(file).split('\n');
  const blocks = {}; let cur = null;
  for (const l of lines) {
    const m = l.match(/^(?:var|function)\s+([A-Za-z_$][\w$]*)/);
    if (m) { cur = m[1]; blocks[cur] = []; }
    if (cur) blocks[cur].push(l);
  }
  return names.map((n) => { if (!blocks[n]) throw new Error('pick: ' + n + ' not found in ' + file); return blocks[n].join('\n'); }).join('\n');
}
const atlasSrc = inline('agents/atlas/atlas.js');
const atlasPrepSrc = pick('agents/atlas/atlas.js', ['atStr', 'atSlug', 'atParse', 'atInput']);   // the setup step only normalises the hand-off

const codePrepare = `${atlasPrepSrc}
// ---- n8n glue: normalise John's hand-off ----
const input = atInput(($input.first() && $input.first().json) || {});
return [{ json: { input, started_at: new Date().toISOString() } }];
`;

const codeCheck = `// Once per lead: if ATLAS already opened a checkpoint for this lead, stop here.
const prep = $('Prepare ATLAS Input').first().json;
const rows = $input.all().map((i) => i.json).filter((r) => r && r.task_type === 'edg_design' && r.lead_id === prep.input.lead_id);
return [{ json: Object.assign({}, prep, { already: rows.length > 0, existing_status: rows.length ? rows[0].status : null }) }];
`;

const codeCompose = `// System prompt = Ryan's ATLAS agent file (live from GitHub, frontmatter stripped) + the n8n runtime addendum.
const RUNTIME = ${j(runtime)};
const USER_TEMPLATE = ${j(userPrompt)};
let agentFile = null;
try { const g = $('Load ATLAS Agent File').first().json || {}; if (g.content && !g.error) agentFile = Buffer.from(String(g.content).replace(/\\n/g, ''), 'base64').toString('utf8').replace(/^---[\\s\\S]*?---\\n/, '').trim(); } catch (e) { agentFile = null; }
const prep = $('Check Existing Design').first().json;
const input = prep.input;
const system = (agentFile || 'You are ATLAS, FusionTech\\'s EDG & CRM Systems Architect. You work behind John and never talk to the customer.') + '\\n\\n' + RUNTIME;
const convo = (input.conversation || []).slice(-20).map((m) => '- [' + (m.role || 'customer') + '] ' + String(m.content || '').slice(0, 800)).join('\\n') || '(none)';
const vars = { company_name: input.company_name || 'not given', industry: input.industry || 'not given', contact_name: input.contact_name || 'not given', email: input.email || 'not given', phone: input.phone || 'not given', channel: input.channel || 'unknown', lead_id: input.lead_id, tenant_id: input.tenant_id, now: new Date().toISOString(), sales_summary: input.sales_summary || '(none)', extracted_json: JSON.stringify(input.extracted || {}), conversation: convo, message: input.message || '(none)' };
const user_prompt = USER_TEMPLATE.replace(/\\{\\{(\\w+)\\}\\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
return [{ json: { system_prompt: system, user_prompt, agent_file_source: agentFile ? 'github' : 'compiled_fallback' } }];
`;

const codeFinalize = `${atlasSrc}
// ---- n8n glue ----
const prep = $('Check Existing Design').first().json;
const pre = $('Compose ATLAS Prompt').first().json;
const input = prep.input;
const inp = ($input.first() && $input.first().json) || {};
let rawText = null, error = null, model = ${j(manifest.model)};
if (inp.error) error = 'model_error: ' + String(inp.error.message || inp.error.description || JSON.stringify(inp.error)).slice(0, 300);
else {
  model = inp.model || model;
  if (typeof inp.text === 'string' && inp.text.trim()) rawText = inp.text;
  else if (Array.isArray(inp.content)) rawText = inp.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('\\n');
  else if (typeof inp.output === 'string') rawText = inp.output;
  if (!rawText) error = 'empty_model_output';
}
const fin = atFinalize({ raw_text: rawText, error, input });
const now = new Date().toISOString();
const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const repoBase = 'https://github.com/${GITHUB.owner}/${GITHUB.repo}/tree/HEAD/' + input.base_path.split('/').map(encodeURIComponent).join('/');
const email_html = '<h2>ATLAS checkpoint 1 — ' + esc(input.company_name) + '</h2>'
  + '<p>' + esc(fin.pack.summary_for_ryan) + '</p>'
  + '<p><b>Questions for John to ask:</b></p><ol>' + fin.pack.questions_open.map((q) => '<li>' + esc(q) + '</li>').join('') + '</ol>'
  + '<p>Files in your vault: <code>' + esc(input.base_path.replace(/^zaphiel\\/vault\\//, '')) + '</code> (<a href="' + repoBase + '">open on GitHub</a>). Confirm the understanding in the Approval Inbox, then ask Zaphiel to continue ATLAS to checkpoint 2 (architecture).</p>'
  + '<p style="color:#888">' + esc(fin.provider) + (fin.fallback_used ? ' (fallback: ' + esc(fin.fallback_reason) + ')' : '') + ' · agent file: ' + esc(pre.agent_file_source) + ' · lead ' + esc(input.lead_id) + (input.test_mode ? ' · TEST' : '') + '</p>';
return [{ json: {
  input, pack: fin.pack, files: fin.files, provider: fin.provider, model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason,
  task: fin.task, event: fin.event, email_subject: fin.email_subject, email_html, agent_file_source: pre.agent_file_source,
  run_id: 'run_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36), started_at: prep.started_at, finished_at: now,
  latency_ms: Math.max(0, new Date(now).getTime() - new Date(prep.started_at).getTime())
} }];
`;

const codeFiles = `// One item per checkpoint-1 file.
const f = $('Finalize ATLAS').first().json;
return f.files.map((x) => ({ json: { path: x.path, content: x.content, commit: 'vault: ATLAS checkpoint 1 — ' + (f.input.company_name || f.input.lead_id) } }));
`;

const codePair = `// Pair each GitHub lookup with its file: existing file → edit, missing → create.
const files = $('Files to Write').all().map((i) => i.json);
return $input.all().map((it, n) => {
  let idx = n;
  try { const p = it.pairedItem; if (p !== undefined && p !== null) idx = Array.isArray(p) ? (p[0].item ?? n) : (typeof p === 'object' ? (p.item ?? n) : p); } catch (e) { idx = n; }
  const f = files[Math.min(idx, files.length - 1)];
  const g = it.json || {};
  const exists = !!(g.sha && !g.error);
  return { json: Object.assign({}, f, { mode: exists ? 'edit' : 'create' }) };
});
`;

const col = (id, type) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type, canBeUsedToMatch: true });
const schemaFor = (cols) => cols.map(([id, type]) => col(id, type));
const table = (name) => ({ __rl: true, mode: 'id', value: TABLES[name].id, cachedResultName: name });
const taskCols = [['tenant_id','string'],['task_id','string'],['lead_id','string'],['task_type','string'],['title','string'],['description','string'],['due_at','string'],['status','string'],['assigned_to','string'],['requires_approval','boolean'],['approval_reason','string'],['payload_json','string'],['created_by','string'],['ts','string']];
const runCols = [['tenant_id','string'],['run_id','string'],['agent','string'],['agent_version','string'],['lead_id','string'],['workflow_id','string'],['execution_id','string'],['model','string'],['provider','string'],['input_ref','string'],['output_json','string'],['success','boolean'],['error','string'],['latency_ms','number'],['test_mode','boolean'],['started_at','string'],['finished_at','string']];
const auditCols = [['tenant_id','string'],['entity_type','string'],['entity_id','string'],['action','string'],['old_value','string'],['new_value','string'],['actor','string'],['execution_id','string'],['reason','string'],['ts','string']];
const inputs = [['tenant_id','string'],['lead_id','string'],['contact_name','string'],['company_name','string'],['industry','string'],['email','string'],['phone','string'],['channel','string'],['message','string'],['conversation_json','string'],['sales_summary','string'],['extracted_json','string'],['test_mode','boolean'],['notify_email','string'],['source_execution_id','string']];
const F = "$('Finalize ATLAS').first().json";
const OWNER = { __rl: true, mode: 'name', value: GITHUB.owner };
const REPO = { __rl: true, mode: 'name', value: GITHUB.repo };
const GH_CRED = { githubOAuth2Api: { id: GITHUB.credential_id, name: GITHUB.credential_name } };
const COMMITTER = { committer: { name: 'Zaphiel (n8n)', email: manifest.notify_email } };
const code = (name, src, pos, output) => `node({ type: 'n8n-nodes-base.code', version: 2, config: { name: ${j(name)}, parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(src)} }, position: ${j(pos)} }, output: ${j(output)} })`;

const sample = { tenant_id: 'fusiontech', lead_id: 'lead_x', contact_name: 'Ken Tan', company_name: 'Tan Brothers Construction Pte Ltd', industry: 'construction', email: '', phone: '+6591112222', channel: 'whatsapp', message: 'We lose track of quotation follow-ups in Excel', conversation: [], sales_summary: '', extracted: {}, test_mode: true, notify_email: 'owner@example.com', source_execution_id: '1', slug: 'tan-brothers-construction', base_path: 'zaphiel/vault/80_Clients/_Test/tan-brothers-construction/edg/' };

const sdk = `import { workflow, node, trigger, sticky, expr, ifElse } from '@n8n/workflow-sdk';

const whenCalled = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.2,
  config: { name: 'When Called by Lead Intake', parameters: { inputSource: 'workflowInputs', workflowInputs: { values: ${j(inputs.map(([name, type]) => ({ name, type })))} } }, position: [0, 300] },
  output: [{ tenant_id: 'fusiontech', lead_id: 'lead_x', contact_name: 'Ken Tan', company_name: 'Tan Brothers Construction Pte Ltd', industry: 'construction', email: '', phone: '+6591112222', channel: 'whatsapp', message: 'We lose track of quotation follow-ups in Excel', conversation_json: '[]', sales_summary: '', extracted_json: '{}', test_mode: true, notify_email: 'owner@example.com', source_execution_id: '1' }]
});

const prepare = ${code('Prepare ATLAS Input', codePrepare, [220, 300], [{ input: sample, started_at: '2026-01-01T00:00:00.000Z' }])};

const loadTasks = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Load EDG Tasks', alwaysOutputData: true, onError: 'continueRegularOutput', parameters: { resource: 'row', operation: 'get', dataTableId: ${j(table('ceo_tasks'))}, matchType: 'allConditions', filters: { conditions: [{ keyName: 'task_type', condition: 'eq', keyValue: 'edg_design' }, { keyName: 'lead_id', condition: 'eq', keyValue: expr("{{ $('Prepare ATLAS Input').first().json.input.lead_id }}") }] }, returnAll: false, limit: 5 }, position: [440, 300] },
  output: [{}]
});

const check = ${code('Check Existing Design', codeCheck, [660, 300], [{ input: sample, started_at: '2026-01-01T00:00:00.000Z', already: false, existing_status: null }])};

const newDesign = ifElse({
  version: 2.3,
  config: { name: 'New Design?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'new', leftValue: expr('{{ $json.already }}'), rightValue: false, operator: { type: 'boolean', operation: 'false', singleValue: true } }], combinator: 'and' } }, position: [880, 300] }
});

const loadAgent = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Load ATLAS Agent File', executeOnce: true, onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: OWNER_RL, repository: REPO_RL, filePath: ${j(manifest.vault_sources.agent_file)}, asBinaryProperty: false, additionalParameters: {} }, credentials: GH_CRED, position: [1100, 200] },
  output: [{ content: 'LS0t', sha: 'x' }]
});

const compose = ${code('Compose ATLAS Prompt', codeCompose, [1320, 200], [{ system_prompt: 'ATLAS …', user_prompt: 'Company: …', agent_file_source: 'github' }])};

const claude = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'ATLAS (Claude)',
    onError: 'continueErrorOutput',
    parameters: { resource: 'text', operation: 'message', modelId: { __rl: true, mode: 'list', value: ${j(manifest.model)}, cachedResultName: ${j(manifest.model_display_name)} }, messages: { values: [{ role: 'user', content: expr("{{ $('Compose ATLAS Prompt').first().json.user_prompt }}") }] }, simplify: true, options: { system: expr("{{ $('Compose ATLAS Prompt').first().json.system_prompt }}"), maxTokens: ${manifest.max_tokens}, temperature: ${manifest.temperature}, includeMergedResponse: true } },
    position: [1540, 200]
  },
  output: [{ text: '{"questions_open":[]}', model: ${j(manifest.model)} }]
});

const finalize = ${code('Finalize ATLAS', codeFinalize, [1780, 200], [{ input: sample, pack: { questions_open: ['q'], summary_for_ryan: 's' }, files: [{ path: sample.base_path + '15_questions_open.md', content: 'x' }], provider: 'rules', model: manifest.model, fallback_used: true, fallback_reason: 'x', task: { task_id: 'task_edg_lead_x', task_type: 'edg_design', title: 't', description: 'd', status: 'open', assigned_to: 'human', requires_approval: true, approval_reason: 'atlas_checkpoint_1_confirm_understanding' }, event: { type: 'edg.checkpoint_1' }, email_subject: 's', email_html: 'h', agent_file_source: 'github', run_id: 'run_x', started_at: '2026-01-01T00:00:00.000Z', finished_at: '2026-01-01T00:00:05.000Z', latency_ms: 5000 }])};

const upsertTask = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Open Approval Task',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'upsert', dataTableId: ${j(table('ceo_tasks'))}, matchType: 'allConditions', filters: { conditions: [{ keyName: 'lead_id', condition: 'eq', keyValue: expr("{{ ${F}.input.lead_id }}") }, { keyName: 'task_type', condition: 'eq', keyValue: 'edg_design' }] }, columns: { mappingMode: 'defineBelow', value: {
      tenant_id: expr("{{ ${F}.input.tenant_id }}"), task_id: expr("{{ ${F}.task.task_id }}"), lead_id: expr("{{ ${F}.input.lead_id }}"), task_type: 'edg_design', title: expr("{{ ${F}.task.title }}"), description: expr("{{ ${F}.task.description }}"), due_at: '', status: 'open', assigned_to: 'human', requires_approval: true, approval_reason: expr("{{ ${F}.task.approval_reason }}"), payload_json: expr("{{ JSON.stringify({ base_path: ${F}.input.base_path, questions_for_john: ${F}.pack.questions_open, summary_for_ryan: ${F}.pack.summary_for_ryan, provider: ${F}.provider, checkpoint: 1 }) }}"), created_by: 'agent:atlas', ts: expr("{{ ${F}.finished_at }}")
    }, matchingColumns: [], schema: ${j(schemaFor(taskCols))} } },
    position: [2000, 200]
  },
  output: [{ id: 1 }]
});

const logRun = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Agent Run',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'insert', dataTableId: ${j(table('ceo_agent_runs'))}, columns: { mappingMode: 'defineBelow', value: {
      tenant_id: expr("{{ ${F}.input.tenant_id }}"), run_id: expr("{{ ${F}.run_id }}"), agent: 'atlas', agent_version: ${j(manifest.version)}, lead_id: expr("{{ ${F}.input.lead_id }}"), workflow_id: expr("{{ $workflow.id }}"), execution_id: expr("{{ $execution.id }}"), model: expr("{{ ${F}.model }}"), provider: expr("{{ ${F}.provider }}"), input_ref: expr("{{ 'lead_intake_execution:' + (${F}.input.source_execution_id ?? '') }}"), output_json: expr("{{ JSON.stringify({ base_path: ${F}.input.base_path, questions: ${F}.pack.questions_open.length, agent_file: ${F}.agent_file_source }) }}"), success: true, error: expr("{{ ${F}.fallback_used ? String(${F}.fallback_reason) : '' }}"), latency_ms: expr("{{ ${F}.latency_ms }}"), test_mode: expr("{{ ${F}.input.test_mode }}"), started_at: expr("{{ ${F}.started_at }}"), finished_at: expr("{{ ${F}.finished_at }}")
    }, schema: ${j(schemaFor(runCols))} } },
    position: [2220, 200]
  },
  output: [{ id: 1 }]
});

const logAudit = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Audit Trail',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'insert', dataTableId: ${j(table('ceo_audit_logs'))}, columns: { mappingMode: 'defineBelow', value: {
      tenant_id: expr("{{ ${F}.input.tenant_id }}"), entity_type: 'lead', entity_id: expr("{{ ${F}.input.lead_id }}"), action: 'atlas_checkpoint_1', old_value: '', new_value: expr("{{ ${F}.input.base_path }}"), actor: expr("{{ 'agent:atlas@' + ${F}.provider }}"), execution_id: expr("{{ $execution.id }}"), reason: expr("{{ ${F}.pack.summary_for_ryan }}"), ts: expr("{{ ${F}.finished_at }}")
    }, schema: ${j(schemaFor(auditCols))} } },
    position: [2440, 200]
  },
  output: [{ id: 1 }]
});

const emailRyan = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Email Ryan (Gmail)', executeOnce: true, onError: 'continueRegularOutput', parameters: { resource: 'message', operation: 'send', sendTo: expr("{{ ${F}.input.notify_email || '${manifest.notify_email}' }}"), subject: expr("{{ ${F}.email_subject }}"), emailType: 'html', message: expr("{{ ${F}.email_html }}"), options: { appendAttribution: false, senderName: 'CEO Brain' } }, position: [2660, 200] },
  output: [{ id: 'gmail_x' }]
});

const notify = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: { name: 'Tell the Orchestrator', executeOnce: true, onError: 'continueRegularOutput', parameters: { method: 'POST', url: ${j(EVENT_URL)}, sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: expr("{{ JSON.stringify(${F}.event) }}"), options: { timeout: 20000 } }, position: [2880, 200] },
  output: [{ ok: true }]
});

const filesToWrite = ${code('Files to Write', codeFiles, [3100, 200], [{ path: sample.base_path + '15_questions_open.md', content: 'x', commit: 'vault: ATLAS checkpoint 1' }])};

const getFile = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Get Existing File', alwaysOutputData: true, onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: OWNER_RL, repository: REPO_RL, filePath: expr('{{ $json.path }}'), asBinaryProperty: false, additionalParameters: {} }, credentials: GH_CRED, position: [3320, 200] },
  output: [{ sha: 'x' }]
});

const pair = ${code('Create or Edit', codePair, [3540, 200], [{ path: sample.base_path + '15_questions_open.md', content: 'x', commit: 'c', mode: 'create' }])};

const exists = ifElse({
  version: 2.3,
  config: { name: 'File Exists?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'm', leftValue: expr('{{ $json.mode }}'), rightValue: 'edit', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } }, position: [3760, 200] }
});

const editFile = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Update File', onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'edit', owner: OWNER_RL, repository: REPO_RL, filePath: expr('{{ $json.path }}'), binaryData: false, fileContent: expr('{{ $json.content }}'), commitMessage: expr('{{ $json.commit }}'), additionalParameters: COMMITTER_P }, credentials: GH_CRED, position: [3980, 100] },
  output: [{ ok: true }]
});

const createFile = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Create File', onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'create', owner: OWNER_RL, repository: REPO_RL, filePath: expr('{{ $json.path }}'), binaryData: false, fileContent: expr('{{ $json.content }}'), commitMessage: expr('{{ $json.commit }}'), additionalParameters: COMMITTER_P }, credentials: GH_CRED, position: [3980, 300] },
  output: [{ ok: true }]
});

const note = sticky(${j('## CEO Brain — ATLAS (EDG & CRM Systems Architect)\nCalled by Lead Intake when John has learned that a named company needs CRM / automation / integrations (not only a website). Once per lead. Never talks to the customer.\n\nFlow: normalise the hand-off → skip if ATLAS already opened a checkpoint for this lead → Ryan\'s agent file .claude/agents/atlas.md live from GitHub + n8n runtime addendum → Claude (DESIGN mode, CHECKPOINT 1; deterministic fallback from John\'s facts when the model is unavailable) → approval task for Ryan (Approval Inbox) → run + audit → email Ryan → event edg.checkpoint_1 → the five checkpoint-1 files in 80_Clients/<slug>/edg/ (test leads under 80_Clients/_Test/).\n\nCheckpoint 2+ (architecture, build spec), BUILD and AUDIT modes run in Claude Code with the same agent file and all tools, after Ryan confirms. Source of truth: ryan/ceo-brain/workflows/atlas/build.js — do not hand-edit Code nodes.')}, [whenCalled, prepare, loadTasks, check], { color: 4 });

export default workflow('ceo-brain-atlas', 'CEO Brain — ATLAS (EDG & CRM Systems Architect)')
  .add(whenCalled)
  .to(prepare)
  .to(loadTasks)
  .to(check)
  .to(newDesign.onTrue(loadAgent.to(compose).to(claude.to(finalize))))
  .add(claude.onError(finalize))
  .add(finalize)
  .to(upsertTask)
  .to(logRun)
  .to(logAudit)
  .to(emailRyan)
  .to(notify)
  .to(filesToWrite)
  .to(getFile)
  .to(pair)
  .to(exists.onTrue(editFile).onFalse(createFile))
  .add(note);
`.replace(/OWNER_RL/g, j(OWNER)).replace(/REPO_RL/g, j(REPO)).replace(/GH_CRED/g, j(GH_CRED)).replace(/COMMITTER_P/g, j(COMMITTER));

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'atlas.sdk.ts'), sdk);
[['prepare-atlas-input.js', codePrepare], ['check-existing-design.js', codeCheck], ['compose-atlas-prompt.js', codeCompose], ['finalize-atlas.js', codeFinalize], ['files-to-write.js', codeFiles], ['create-or-edit.js', codePair]].forEach(([f, c]) => fs.writeFileSync(path.join(DIST, 'code-nodes', f), c));
console.log('built', path.relative(ROOT, path.join(DIST, 'atlas.sdk.ts')), sdk.length, 'chars');
