#!/usr/bin/env node
// Generates the n8n Workflow-SDK source for "CEO Brain — Website Builder" (Agent #2).
// The agent logic (agents/website-builder/brief.js) and prompts are inlined so the repo and n8n
// never drift. Called by Lead Intake's "Hand Off to Website Builder" node (fire-and-forget).
//
//   node workflows/website-builder/build.js   -> dist/website-builder.sdk.ts + dist/code-nodes/*.js
//
// Deploy: validate_workflow -> create_workflow_from_code (first time) or update_workflow (setNodeParameter
// on the two Code nodes' jsCode + the Claude node's system prompt). See workflows/README.md.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const j = (v) => JSON.stringify(v);

const TABLES_JSON = JSON.parse(read('database/n8n-data-tables.json'));
const TABLES = TABLES_JSON.tables;
const manifest = JSON.parse(read('agents/website-builder/agent.json'));
const briefSchema = JSON.stringify(JSON.parse(read('schemas/website-brief.schema.json')));
const companyContext = read('prompts/company-context.md').trim();
const builderBody = read('prompts/website-builder.system.md').replace('{{OUTPUT_SCHEMA}}', briefSchema);
const systemPrompt = companyContext + '\n\n' + builderBody; // compiled fallback (used when the vault cannot be read)
const userPrompt = read('prompts/website-builder.user.md');
const RUNNER_ID = (TABLES_JSON.workflows && TABLES_JSON.workflows.website_build_runner) || 'REPLACE_ME';
const GITHUB = TABLES_JSON.github || { owner: 'ryandhana1515-stack', repo: 'ryan', credential_id: 'lZqYskCh7zVfXsc7', credential_name: 'GitHub account' };
const VAULT = manifest.vault_sources || { playbook: 'zaphiel/vault/Knowledge/Website Builder — playbook.md', design_standard: 'zaphiel/vault/Knowledge/Website design standard.md' };

function inline(file) {
  return read(file)
    .replace(/\/\/ ---- Node module wrapper[\s\S]*$/m, '')
    .split('\n')
    .filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*\/\//.test(l) && l.trim() !== '')
    .join('\n');
}
const briefSrc = inline('agents/website-builder/brief.js');

// ---------------------------------------------------------------- Code nodes
const codePrompt = `// Turns the Lead Intake hand-off into the Website Builder's user prompt. Facts only; nothing is invented here.
const USER_PROMPT_TEMPLATE = ${j(userPrompt)};
const inp = $input.first().json || {};
const str = (v) => (v === undefined || v === null || v === '' ? null : String(v));
let conversation = [];
try { conversation = JSON.parse(inp.conversation_json || '[]'); } catch (e) { conversation = []; }
if (!Array.isArray(conversation)) conversation = [];
let extracted = {};
try { extracted = JSON.parse(inp.extracted_json || '{}'); } catch (e) { extracted = {}; }
if (!extracted || typeof extracted !== 'object') extracted = {};
const testMode = inp.test_mode === true || inp.test_mode === 'true';
const now = new Date().toISOString();
const input = {
  tenant_id: str(inp.tenant_id) || 'fusiontech',
  lead_id: str(inp.lead_id) || ('lead_unknown_' + Date.now().toString(36)),
  contact_name: str(inp.contact_name), company_name: str(inp.company_name), industry: str(inp.industry) || str(extracted.industry),
  email: str(inp.email), phone: str(inp.phone), channel: str(inp.channel) || 'unknown',
  message: str(inp.message) || '', conversation, sales_summary: str(inp.sales_summary) || '', extracted,
  test_mode: testMode, notify_email: str(inp.notify_email) || ${j(manifest.notify_email)}, source_execution_id: str(inp.source_execution_id),
  research_brief: str(inp.research_brief) || '', research_json: str(inp.research_json) || ''
};
const convoText = conversation.map((m) => '- [' + (m.role || 'customer') + (m.ts ? ' ' + m.ts : '') + '] ' + m.content).join('\\n') || '(none)';
const vars = {
  tenant_id: input.tenant_id, lead_id: input.lead_id, now, contact_name: input.contact_name || 'not given', company_name: input.company_name || 'not given',
  industry: input.industry || 'not given', email: input.email || 'not given', phone: input.phone || 'not given',
  sales_summary: input.sales_summary || '(none)', extracted_json: JSON.stringify(extracted), conversation: convoText, message: input.message || '(no message)',
  research_brief: input.research_brief || '(none — no research brief; use John\\'s hand-off only)'
};
const user_prompt = USER_PROMPT_TEMPLATE.replace(/\\{\\{(\\w+)\\}\\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
return [{ json: { input, user_prompt, started_at: now, config: { model: ${j(manifest.model)}, agent: ${j(manifest.id)}, agent_version: ${j(manifest.version)} }, execution_id: String($execution.id), workflow_id: String($workflow.id) } }];
`;

const codeFinalize = `${briefSrc}
// ---- n8n glue ----
const ctx = $('Build Website Brief Prompt').first().json;
const inp = ($input.first() && $input.first().json) || {};
let rawText = null, error = null, model = ctx.config.model, usage = null;
if (inp.error) error = 'model_error: ' + String(inp.error.message || inp.error.description || JSON.stringify(inp.error)).slice(0, 300);
else {
  model = inp.model || model;
  usage = inp.usage || null;
  if (typeof inp.text === 'string' && inp.text.trim()) rawText = inp.text;
  else if (Array.isArray(inp.content)) rawText = inp.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('\\n');
  else if (typeof inp.output === 'string') rawText = inp.output;
  if (!rawText) error = 'empty_model_output';
}
const fin = finalizeBrief({ raw_text: rawText, error, input: ctx.input });
const b = fin.brief;
const finishedAt = new Date().toISOString();
const latencyMs = Math.max(0, new Date(finishedAt).getTime() - new Date(ctx.started_at).getTime());
const who = (ctx.input.contact_name || 'lead') + (b.business_name ? ' @ ' + b.business_name : (ctx.input.company_name ? ' @ ' + ctx.input.company_name : ''));
const task = {
  task_id: 'task_web_' + String(ctx.input.lead_id).replace(/[^a-z0-9_]/gi, '').slice(0, 60),
  task_type: 'website_build',
  title: 'Build ' + (b.mode === 'medical' ? 'MEDICAL ' : '') + b.site_type.replace(/_/g, ' ') + ' for ' + who,
  description: 'Mode: ' + b.mode + ' (' + b.industry_category + ') · Goal: ' + b.primary_goal + ' · Pages: ' + b.pages.map((p) => p.name).join(', ') + (b.integrations.length ? ' · Integrations: ' + b.integrations.join(', ') : '') + ' · Missing: ' + (b.missing_information.join(', ') || 'none'),
  status: 'open',
  assigned_to: 'website-builder',
  requires_approval: false,
  approval_reason: 'auto_build_policy_2026-09-25'
};
const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const li = (arr) => arr.length ? '<ul>' + arr.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '<i>none</i>';
const emailHtml = '<h2>' + esc(task.title) + '</h2>'
  + '<p><b>Lead:</b> ' + esc(ctx.input.contact_name || '-') + ' · ' + esc(ctx.input.email || ctx.input.phone || '-') + ' · via ' + esc(ctx.input.channel) + (ctx.input.test_mode ? ' · <b>TEST</b>' : '') + '</p>'
  + '<p><b>Mode:</b> ' + esc(b.mode === 'medical' ? 'MEDICAL / DOCTOR (stricter content, privacy and compliance rules)' : 'SME') + ' &nbsp; <b>Category:</b> ' + esc(b.industry_category) + ' &nbsp; <b>Site type:</b> ' + esc(b.site_type) + ' &nbsp; <b>Goal:</b> ' + esc(b.primary_goal) + ' &nbsp; <b>Industry:</b> ' + esc(b.industry || '-') + ' &nbsp; <b>Audience:</b> ' + esc(b.audience || '-') + '</p>'
  + '<p><b>Design direction:</b></p>' + li(['Brand personality: ' + b.design_direction.brand_personality, 'Typography: ' + b.design_direction.typography, 'Layout: ' + b.design_direction.layout, 'Imagery: ' + b.design_direction.imagery, 'Motion: ' + b.design_direction.motion, 'Palette: ' + b.design_direction.palette])
  + '<p><b>Pages:</b></p>' + li(b.pages.map((p) => p.name + (p.purpose ? ' — ' + p.purpose : '')))
  + '<p><b>Features:</b></p>' + li(b.features) + '<p><b>Integrations:</b></p>' + li(b.integrations)
  + (b.verification_required.length ? '<p><b>The clinic must verify before patients see it:</b></p>' + li(b.verification_required) : '')
  + '<p><b>Still missing:</b> ' + esc(b.missing_information.join(', ') || 'nothing') + '</p>'
  + '<p><b>John should ask next:</b></p>' + li(b.questions_for_customer)
  + '<p><b>What the customer said:</b><br>' + esc(ctx.input.message) + '</p>'
  + '<p style="color:#555">Mock-ups build automatically (Ryan, 2026-09-25): the Website Build Runner generates the photography, builds in Lovable and the customer gets the preview link from John. You get a copy of the preview when it is ready. Manual alternative: <a href="' + fin.lovable_url + '">open the prompt in Lovable</a>.</p>'
  + '<details><summary>Build prompt</summary><pre style="white-space:pre-wrap;font-family:inherit">' + esc(fin.build_prompt) + '</pre></details>'
  + '<details><summary>QA checklist (before the customer sees the mock-up)</summary>' + li(b.qa_checklist) + '</details>'
  + '<p style="color:#888">' + esc(fin.provider) + (fin.fallback_used ? ' (fallback: ' + esc(fin.fallback_reason) + ')' : '') + ' · confidence ' + esc(b.confidence) + ' · ' + esc(b.reasoning) + '<br>lead ' + esc(ctx.input.lead_id) + ' · task ' + esc(task.task_id) + ' · execution ' + esc(ctx.execution_id) + (ctx.input.source_execution_id ? ' (from ' + esc(ctx.input.source_execution_id) + ')' : '') + '</p>';
return [{ json: {
  input: ctx.input, config: ctx.config, execution_id: ctx.execution_id, workflow_id: ctx.workflow_id,
  brief: b, provider: fin.provider, model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason, validation_errors: fin.validation_errors,
  build_prompt: fin.build_prompt, lovable_url: fin.lovable_url, task, usage,
  ready_to_build: fin.ready_to_build, missing_for_build: fin.missing_for_build, image_shots: fin.image_shots,
  run_id: 'run_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36),
  started_at: ctx.started_at, finished_at: finishedAt, latency_ms: latencyMs,
  email_subject: (ctx.input.test_mode ? '[TEST] ' : '') + 'CEO Brain: website brief ready — ' + who,
  email_html: emailHtml
} }];
`;

const codeCompose = `// Composes the Website Builder's system prompt AT RUN TIME: the company context and the builder rules
// are compiled from the repo; the design standard and the builder playbook are read live from Ryan's
// Obsidian vault (GitHub). If the vault cannot be read, the compiled copy is used so a brief is never dropped.
const STATIC_HEAD = ${j(companyContext)};
const STATIC_BODY = ${j(builderBody)};
function vaultText(nodeName) {
  try {
    const j = $(nodeName).first().json || {};
    if (j && j.content && !j.error) {
      const raw = String(j.content).replace(/\\n/g, '');
      const txt = (typeof Buffer !== 'undefined') ? Buffer.from(raw, 'base64').toString('utf8') : decodeURIComponent(escape(atob(raw)));
      return txt.replace(/^---[\\s\\S]*?---\\n/, '').trim() || null;
    }
  } catch (e) {}
  return null;
}
const standard = vaultText('Load Design Standard');
const playbook = vaultText('Load Website Playbook');
let system, source;
if (standard || playbook) {
  system = STATIC_HEAD
    + (standard ? '\\n\\n# Website design standard (live from Ryan\\'s vault — authoritative; the QA stage enforces it)\\n\\n' + standard : '')
    + (playbook ? '\\n\\n# Website Builder playbook (live from the vault — follow it; newest lessons win)\\n\\n' + playbook : '')
    + '\\n\\n' + STATIC_BODY;
  source = 'vault:' + [standard ? 'standard' : null, playbook ? 'playbook' : null].filter(Boolean).join('+');
} else {
  system = STATIC_HEAD + '\\n\\n' + STATIC_BODY;
  source = 'compiled_fallback';
}
return [{ json: { system_prompt: system, brain_source: source, standard_chars: standard ? standard.length : 0, playbook_chars: playbook ? playbook.length : 0 } }];
`;

const codeDecide = `// Decides what happens to this brief (Ryan, 2026-09-25: mock-ups build automatically, nobody approves).
// build          -> the Website Build Runner is started now (one build per lead, daily cap)
// ask_customer   -> details missing; John keeps asking (no build)
// already_built  -> this lead already has a mock-up building/built
// daily_cap      -> too many builds today; owner emailed
const MAX_BUILDS_PER_DAY = 12;
const f = $('Finalize Website Brief').first().json;
const rows = $input.all().map((i) => i.json).filter((r) => r && r.task_type === 'website_build');
const mine = rows.filter((r) => r.lead_id === f.input.lead_id);
const today = new Date().toISOString().slice(0, 10);
const todayBuilds = rows.filter((r) => (r.status === 'building' || r.status === 'built') && String(r.ts || r.updatedAt || '').slice(0, 10) === today).length;
const existing = mine.find((r) => r.status === 'building' || r.status === 'built') || null;
let decision = 'build';
if (existing) decision = 'already_built';
else if (!f.ready_to_build) decision = 'ask_customer';
else if (todayBuilds >= MAX_BUILDS_PER_DAY) decision = 'daily_cap';
const status = decision === 'build' ? 'building' : (decision === 'already_built' ? existing.status : 'open');
const task = Object.assign({}, f.task, {
  status,
  assigned_to: decision === 'build' ? 'website-build-runner' : (decision === 'ask_customer' ? 'sales-agent' : (decision === 'daily_cap' ? 'human' : f.task.assigned_to)),
  requires_approval: false,
  approval_reason: decision === 'build' ? 'auto_build_policy_2026-09-25' : (decision === 'ask_customer' ? 'awaiting_customer_details:' + f.missing_for_build.join(',') : decision)
});
const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const intro = decision === 'build'
  ? '<p style="background:#e8f5ec;padding:10px 14px;border-radius:6px"><b>Building now.</b> The Website Build Runner is generating the photography and building the mock-up in Lovable. John sends the customer the preview link when it is ready; you get a copy.</p>'
  : decision === 'ask_customer'
    ? '<p style="background:#fff6e0;padding:10px 14px;border-radius:6px"><b>Not built yet:</b> John is still collecting ' + esc(f.missing_for_build.join(', ')) + ' from the customer. The build starts on its own once they answer.</p>'
    : decision === 'already_built'
      ? '<p style="background:#eef1f5;padding:10px 14px;border-radius:6px"><b>Already ' + esc(existing.status) + '</b> for this lead (task ' + esc(existing.task_id) + '). No second build.</p>'
      : '<p style="background:#fdecec;padding:10px 14px;border-radius:6px"><b>Daily build cap reached</b> (' + todayBuilds + ' today). This brief waits for you.</p>';
const subject = (f.input.test_mode ? '[TEST] ' : '') + 'CEO Brain: ' + (decision === 'build' ? 'website mock-up building — ' : decision === 'ask_customer' ? 'website brief waiting for details — ' : decision === 'already_built' ? 'website brief (already built) — ' : 'website build cap — ') + (f.brief.business_name || f.input.contact_name || f.input.lead_id);
return [{ json: Object.assign({}, f, { build_decision: decision, decision_reason: decision === 'ask_customer' ? f.missing_for_build.join(',') : decision, existing_task: existing, today_builds: todayBuilds, task, email_subject: subject, email_html: intro + f.email_html, image_shots_json: JSON.stringify(f.image_shots || []) }) }];
`;

// ---------------------------------------------------------------- SDK source
const F = "$('Decide Build').item.json";
const col = (id, type) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type, canBeUsedToMatch: true });
const schemaFor = (cols) => cols.map(([id, type]) => col(id, type));
const table = (name) => ({ __rl: true, mode: 'id', value: TABLES[name].id, cachedResultName: name });
const runCols = [['tenant_id','string'],['run_id','string'],['agent','string'],['agent_version','string'],['lead_id','string'],['workflow_id','string'],['execution_id','string'],['model','string'],['provider','string'],['input_ref','string'],['output_json','string'],['success','boolean'],['error','string'],['latency_ms','number'],['test_mode','boolean'],['started_at','string'],['finished_at','string']];
const taskCols = [['tenant_id','string'],['task_id','string'],['lead_id','string'],['task_type','string'],['title','string'],['description','string'],['due_at','string'],['status','string'],['assigned_to','string'],['requires_approval','boolean'],['approval_reason','string'],['payload_json','string'],['created_by','string'],['ts','string']];
const auditCols = [['tenant_id','string'],['entity_type','string'],['entity_id','string'],['action','string'],['old_value','string'],['new_value','string'],['actor','string'],['execution_id','string'],['reason','string'],['ts','string']];
const inputs = [['tenant_id','string'],['lead_id','string'],['contact_name','string'],['company_name','string'],['industry','string'],['email','string'],['phone','string'],['channel','string'],['message','string'],['conversation_json','string'],['sales_summary','string'],['extracted_json','string'],['test_mode','boolean'],['notify_email','string'],['source_execution_id','string'],['research_brief','string'],['research_json','string']];

const sdk = `import { workflow, node, trigger, sticky, expr, ifElse } from '@n8n/workflow-sdk';

const whenCalled = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.2,
  config: {
    name: 'When Called by Lead Intake',
    parameters: { inputSource: 'workflowInputs', workflowInputs: { values: ${j(inputs.map(([name, type]) => ({ name, type })))} } },
    position: [0, 300]
  },
  output: [{ tenant_id: 'fusiontech', lead_id: 'lead_x', contact_name: 'Marcus Lim', company_name: 'SwiftMove Logistics', industry: 'logistics', email: 'm@example.com', phone: '', channel: 'email', message: 'I want a website for delivery quotes', conversation_json: '[]', sales_summary: 'Logistics owner wants a quote + tracking website', extracted_json: '{}', test_mode: true, notify_email: 'owner@example.com', source_execution_id: '1' }]
});

const buildPrompt = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Website Brief Prompt',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codePrompt)} },
    position: [220, 300]
  },
  output: [{ input: { tenant_id: 'fusiontech', lead_id: 'lead_x', message: 'I want a website', conversation: [], extracted: {}, test_mode: true, notify_email: 'owner@example.com' }, user_prompt: 'Prepare the website build brief...', started_at: '2026-01-01T00:00:00.000Z', config: { model: ${j(manifest.model)}, agent: 'website-builder', agent_version: '2.0.0' }, execution_id: '1', workflow_id: 'w' }]
});

const loadStandard = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Load Design Standard',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: { __rl: true, mode: 'name', value: ${j(GITHUB.owner)} }, repository: { __rl: true, mode: 'name', value: ${j(GITHUB.repo)} }, filePath: ${j(VAULT.design_standard)}, asBinaryProperty: false, additionalParameters: {} },
    credentials: { githubOAuth2Api: { id: ${j(GITHUB.credential_id)}, name: ${j(GITHUB.credential_name)} } },
    position: [440, 300]
  },
  output: [{ content: 'IyBX', encoding: 'base64', sha: 'x' }]
});

const loadPlaybook = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Load Website Playbook',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: { __rl: true, mode: 'name', value: ${j(GITHUB.owner)} }, repository: { __rl: true, mode: 'name', value: ${j(GITHUB.repo)} }, filePath: ${j(VAULT.playbook)}, asBinaryProperty: false, additionalParameters: {} },
    credentials: { githubOAuth2Api: { id: ${j(GITHUB.credential_id)}, name: ${j(GITHUB.credential_name)} } },
    position: [660, 300]
  },
  output: [{ content: 'IyBX', encoding: 'base64', sha: 'x' }]
});

const composeSystem = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Compose System Prompt',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeCompose)} },
    position: [880, 300]
  },
  output: [{ system_prompt: 'You are the Website Builder Agent…', brain_source: 'vault:standard+playbook', standard_chars: 1, playbook_chars: 1 }]
});

const claudeAgent = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'Website Builder Agent (Claude)',
    onError: 'continueErrorOutput',
    parameters: {
      resource: 'text',
      operation: 'message',
      modelId: { __rl: true, mode: 'list', value: ${j(manifest.model)}, cachedResultName: ${j(manifest.model_display_name)} },
      messages: { values: [{ role: 'user', content: expr("{{ $('Build Website Brief Prompt').item.json.user_prompt }}") }] },
      simplify: true,
      options: {
        system: expr("{{ $('Compose System Prompt').first().json.system_prompt }}"),
        maxTokens: ${manifest.max_tokens},
        temperature: ${manifest.temperature},
        includeMergedResponse: true
      }
    },
    position: [1100, 300]
  },
  output: [{ text: '{"schema_version":"2.0","mode":"sme","site_type":"business_website"}', model: ${j(manifest.model)}, usage: { input_tokens: 1, output_tokens: 1 } }]
});

const finalize = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Finalize Website Brief',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeFinalize)} },
    position: [1380, 300]
  },
  output: [{ input: { tenant_id: 'fusiontech', lead_id: 'lead_x', test_mode: true, notify_email: 'owner@example.com' }, config: { agent: 'website-builder', agent_version: '2.0.0', model: ${j(manifest.model)} }, execution_id: '1', workflow_id: 'w', brief: { mode: 'sme', industry_category: 'other', site_type: 'business_website', primary_goal: 'leads', design_direction: { brand_personality: 'x' }, pages: [], features: [], integrations: [], verification_required: [], qa_checklist: [], missing_information: [] }, provider: 'anthropic', model: ${j(manifest.model)}, fallback_used: false, fallback_reason: null, validation_errors: [], build_prompt: 'Build a...', lovable_url: 'https://lovable.dev/#prompt=Build', task: { task_id: 'task_web_lead_x', task_type: 'website_build', title: 't', description: 'd', status: 'open', assigned_to: 'human', requires_approval: true, approval_reason: 'r' }, usage: null, run_id: 'run_x', started_at: '2026-01-01T00:00:00.000Z', finished_at: '2026-01-01T00:00:01.000Z', latency_ms: 1000, email_subject: 's', email_html: '<p>x</p>' }]
});

const upsertTask = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Upsert Website Build Task',
    parameters: {
      resource: 'row',
      operation: 'upsert',
      dataTableId: ${j(table('ceo_tasks'))},
      matchType: 'allConditions',
      filters: { conditions: [
        { keyName: 'lead_id', condition: 'eq', keyValue: expr("{{ ${F}.input.lead_id }}") },
        { keyName: 'task_type', condition: 'eq', keyValue: 'website_build' }
      ] },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${F}.input.tenant_id }}"),
          task_id: expr("{{ ${F}.task.task_id }}"),
          lead_id: expr("{{ ${F}.input.lead_id }}"),
          task_type: 'website_build',
          title: expr("{{ ${F}.task.title }}"),
          description: expr("{{ ${F}.task.description }}"),
          due_at: '',
          status: expr("{{ ${F}.task.status }}"),
          assigned_to: expr("{{ ${F}.task.assigned_to }}"),
          requires_approval: false,
          approval_reason: expr("{{ ${F}.task.approval_reason }}"),
          payload_json: expr("{{ JSON.stringify({ brief: ${F}.brief, lovable_url: ${F}.lovable_url, provider: ${F}.provider, fallback_used: ${F}.fallback_used, build_decision: ${F}.build_decision, image_shots: ${F}.image_shots }) }}"),
          created_by: expr("{{ 'agent:' + ${F}.config.agent }}"),
          ts: expr("{{ ${F}.finished_at }}")
        },
        matchingColumns: [],
        schema: ${j(schemaFor(taskCols))}
      }
    },
    position: [1840, 300]
  },
  output: [{ id: 1, task_id: 'task_web_lead_x' }]
});

const logRun = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Agent Run',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: ${j(table('ceo_agent_runs'))},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${F}.input.tenant_id }}"),
          run_id: expr("{{ ${F}.run_id }}"),
          agent: expr("{{ ${F}.config.agent }}"),
          agent_version: expr("{{ ${F}.config.agent_version }}"),
          lead_id: expr("{{ ${F}.input.lead_id }}"),
          workflow_id: expr("{{ ${F}.workflow_id }}"),
          execution_id: expr("{{ ${F}.execution_id }}"),
          model: expr("{{ ${F}.model }}"),
          provider: expr("{{ ${F}.provider }}"),
          input_ref: expr("{{ 'lead_intake_execution:' + (${F}.input.source_execution_id ?? '') }}"),
          output_json: expr("{{ JSON.stringify(${F}.brief) }}"),
          success: true,
          error: expr("{{ ${F}.fallback_used ? String(${F}.fallback_reason) : '' }}"),
          latency_ms: expr("{{ ${F}.latency_ms }}"),
          test_mode: expr("{{ ${F}.input.test_mode }}"),
          started_at: expr("{{ ${F}.started_at }}"),
          finished_at: expr("{{ ${F}.finished_at }}")
        },
        schema: ${j(schemaFor(runCols))}
      }
    },
    position: [2060, 300]
  },
  output: [{ id: 1 }]
});

const logAudit = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Audit Trail',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: ${j(table('ceo_audit_logs'))},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${F}.input.tenant_id }}"),
          entity_type: 'task',
          entity_id: expr("{{ ${F}.task.task_id }}"),
          action: expr("{{ 'website_brief_' + ${F}.build_decision }}"),
          old_value: '',
          new_value: expr("{{ ${F}.task.status }}"),
          actor: expr("{{ 'agent:' + ${F}.config.agent + '@' + ${F}.provider }}"),
          execution_id: expr("{{ ${F}.execution_id }}"),
          reason: expr("{{ ${F}.brief.reasoning }}"),
          ts: expr("{{ ${F}.finished_at }}")
        },
        schema: ${j(schemaFor(auditCols))}
      }
    },
    position: [2280, 300]
  },
  output: [{ id: 1 }]
});

const emailOwner = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Email Brief to Owner (Gmail)',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'message',
      operation: 'send',
      sendTo: expr("{{ ${F}.input.notify_email }}"),
      subject: expr("{{ ${F}.email_subject }}"),
      emailType: 'html',
      message: expr("{{ ${F}.email_html }}"),
      options: { appendAttribution: false, senderName: 'CEO Brain' }
    },
    position: [3160, 300]
  },
  output: [{ id: 'gmail_x' }]
});

const loadTasks = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Load Website Build Tasks',
    alwaysOutputData: true,
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: ${j(table('ceo_tasks'))},
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'task_type', condition: 'eq', keyValue: 'website_build' }] },
      returnAll: false,
      limit: 300,
      orderBy: true,
      orderByColumn: 'ts',
      orderByDirection: 'DESC'
    },
    position: [1400, 300]
  },
  output: [{ id: 1, task_id: 'task_web_lead_x', lead_id: 'lead_x', task_type: 'website_build', status: 'built', ts: '2026-01-01T00:00:00.000Z' }]
});

const decideBuild = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Decide Build',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeDecide)} },
    position: [1620, 300]
  },
  output: [{ input: { tenant_id: 'fusiontech', lead_id: 'lead_x', test_mode: true, notify_email: 'owner@example.com', contact_name: 'Marcus' }, config: { agent: 'website-builder', agent_version: '2.1.0', model: ${j(manifest.model)} }, execution_id: '1', workflow_id: 'w', brief: { mode: 'sme', industry_category: 'logistics', site_type: 'business_website', business_name: 'SwiftMove', primary_goal: 'leads', design_direction: { brand_personality: 'x' }, pages: [], features: [], integrations: [], verification_required: [], qa_checklist: [], missing_information: [], reasoning: 'r' }, provider: 'anthropic', model: ${j(manifest.model)}, fallback_used: false, fallback_reason: null, validation_errors: [], build_prompt: 'Build a...', lovable_url: 'https://lovable.dev/#prompt=Build', task: { task_id: 'task_web_lead_x', task_type: 'website_build', title: 't', description: 'd', status: 'building', assigned_to: 'website-build-runner', requires_approval: false, approval_reason: 'auto_build_policy_2026-09-25' }, usage: null, run_id: 'run_x', started_at: '2026-01-01T00:00:00.000Z', finished_at: '2026-01-01T00:00:01.000Z', latency_ms: 1000, email_subject: 's', email_html: '<p>x</p>', build_decision: 'build', decision_reason: 'build', image_shots_json: '[]', image_shots: [], ready_to_build: true, missing_for_build: [] }]
});

const buildGate = ifElse({
  version: 2.3,
  config: {
    name: 'Build Now?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'build', leftValue: expr("{{ ${F}.build_decision }}"), rightValue: 'build', operator: { type: 'string', operation: 'equals' } }],
        combinator: 'and'
      }
    },
    position: [2720, 300]
  }
});

const startRunner = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Start Website Build Runner',
    onError: 'continueRegularOutput',
    parameters: {
      mode: 'once',
      source: 'database',
      workflowId: { __rl: true, mode: 'id', value: ${j(RUNNER_ID)}, cachedResultName: 'CEO Brain — Website Build Runner' },
      workflowInputs: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${F}.input.tenant_id }}"),
          task_id: expr("{{ ${F}.task.task_id }}"),
          lead_id: expr("{{ ${F}.input.lead_id }}"),
          business_name: expr("{{ ${F}.brief.business_name ?? '' }}"),
          industry_category: expr("{{ ${F}.brief.industry_category }}"),
          mode: expr("{{ ${F}.brief.mode }}"),
          build_prompt: expr("{{ ${F}.build_prompt }}"),
          image_shots_json: expr("{{ ${F}.image_shots_json }}"),
          contact_name: expr("{{ ${F}.input.contact_name ?? '' }}"),
          notify_email: expr("{{ ${F}.input.notify_email }}"),
          test_mode: expr("{{ ${F}.input.test_mode }}"),
          source_execution_id: expr("{{ ${F}.execution_id }}")
        },
        matchingColumns: [],
        schema: ${j(schemaFor([['tenant_id','string'],['task_id','string'],['lead_id','string'],['business_name','string'],['industry_category','string'],['mode','string'],['build_prompt','string'],['image_shots_json','string'],['contact_name','string'],['notify_email','string'],['test_mode','boolean'],['source_execution_id','string']]))},
        attemptToConvertTypes: false,
        convertFieldsToString: true
      },
      options: { waitForSubWorkflow: false }
    },
    position: [2940, 200]
  },
  output: [{ ok: true }]
});

const note = sticky(${j('## CEO Brain — Website Builder v2.1 (Agent #2)\nCalled by Lead Intake once John has the customer\'s details. Two modes: SME and Medical.\n\nFlow: build prompt → design standard + playbook live from the vault → Claude (Gateway) → validate + mode guard + fallback → cinematic brief + Lovable prompt + image shot list → Decide Build (auto-build policy: one build per lead, daily cap) → task, run, audit → Start Website Build Runner (Higgsfield/Kling photography → Lovable → Website Build Record → John sends the link) → owner copy.\n\nSource of truth: repo ryan/ceo-brain (workflows/website-builder/build.js). Do not hand-edit Code nodes.')}, [whenCalled, buildPrompt, loadStandard, loadPlaybook, composeSystem], { color: 4 });

export default workflow('ceo-brain-website-builder', 'CEO Brain — Website Builder')
  .add(whenCalled)
  .to(buildPrompt)
  .to(loadStandard)
  .to(loadPlaybook)
  .to(composeSystem)
  .to(claudeAgent.to(finalize))
  .add(claudeAgent.onError(finalize))
  .add(finalize)
  .to(loadTasks)
  .to(decideBuild)
  .to(upsertTask)
  .to(logRun)
  .to(logAudit)
  .to(buildGate
    .onTrue(startRunner.to(emailOwner))
    .onFalse(emailOwner))
  .add(note)
  .group('1. Brief generation', [buildPrompt, loadStandard, loadPlaybook, composeSystem, claudeAgent, finalize], { description: 'Prompt, standard + playbook from the vault, Claude, validate, fallback, Lovable prompt, image shots.' })
  .group('2. Decide & build', [loadTasks, decideBuild, upsertTask, logRun, logAudit, buildGate, startRunner, emailOwner], { description: 'Auto-build policy: one build per lead + daily cap; task, run, audit; start the Website Build Runner; owner copy by email.' });
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'website-builder.sdk.ts'), sdk);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'build-website-brief-prompt.js'), codePrompt);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'finalize-website-brief.js'), codeFinalize);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'compose-system-prompt.js'), codeCompose);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'decide-build.js'), codeDecide);
fs.writeFileSync(path.join(DIST, 'system-prompt.rendered.md'), systemPrompt);
fs.writeFileSync(path.join(DIST, 'expected-params.json'), JSON.stringify({ system_prompt_compiled_fallback: systemPrompt, claude_system_expr: "={{ $('Compose System Prompt').first().json.system_prompt }}", vault_sources: VAULT, model: manifest.model, workflow_id: TABLES_JSON.workflows.website_builder || null }, null, 2));
console.log('built', path.relative(ROOT, path.join(DIST, 'website-builder.sdk.ts')), sdk.length, 'chars');
