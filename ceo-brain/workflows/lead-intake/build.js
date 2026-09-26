#!/usr/bin/env node
// Generates the n8n Workflow-SDK source for the Phase 1 "CEO Brain — Lead Intake"
// workflow. The agent logic (normalize / rules / postprocess) and the prompts
// are inlined from their single source of truth so the repo and n8n never drift.
//
//   node workflows/lead-intake/build.js            -> dist/lead-intake.sdk.ts + dist/code-nodes/*.js
//
// Deploy: the generated SDK code is what gets passed to the n8n MCP
// (validate_workflow -> create_workflow_from_code). See workflows/README.md.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// n8n data tables created for Phase 1 (project uFcEmgtYEFyGauyy on ryan1515.app.n8n.cloud)
const TABLES_JSON = JSON.parse(read('database/n8n-data-tables.json'));
const TABLES = TABLES_JSON.tables;
TABLES.__sender_workflow_id = (TABLES_JSON.workflows && TABLES_JSON.workflows.outbound_sender) || null;
TABLES.__website_builder_workflow_id = (TABLES_JSON.workflows && TABLES_JSON.workflows.website_builder) || null;
// ADR-3: John hands off to the Website Intelligence agent, which researches and then calls the Website Builder.
TABLES.__website_intelligence_workflow_id = (TABLES_JSON.workflows && TABLES_JSON.workflows.website_intelligence) || null;
TABLES.__vault_writer_workflow_id = (TABLES_JSON.workflows && TABLES_JSON.workflows.vault_writer) || null;
const GITHUB = TABLES_JSON.github || { owner: 'ryandhana1515-stack', repo: 'ryan', credential_id: 'lZqYskCh7zVfXsc7', credential_name: 'GitHub account' };
const agentManifest = JSON.parse(read('agents/sales-qualification/agent.json'));
const outputSchema = JSON.stringify(JSON.parse(read('schemas/sales-qualification-output.schema.json')));
const leadStatus = JSON.stringify(JSON.parse(read('schemas/lead-status.json')));
const companyContext = read('prompts/company-context.md').trim();
const salesBody = read('prompts/sales-qualification.system.md').replace('{{OUTPUT_SCHEMA}}', outputSchema.trim());
const systemPrompt = companyContext + '\n\n' + salesBody; // compiled fallback (used when the vault cannot be read)
const VAULT = agentManifest.vault_sources || { brain: 'zaphiel/vault/FusionTech AI — Master Company Brain.md', playbook: 'zaphiel/vault/Knowledge/John — Sales playbook.md' };
const userPrompt = read('prompts/sales-qualification.user.md');

// Strip the Node-only module wrapper lines so the code runs inside the n8n sandbox.
function inline(file) {
  return read(file)
    .replace(/\/\/ ---- Node module wrapper[\s\S]*$/m, '')
    .split('\n')
    .filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*\/\//.test(l) && l.trim() !== '')
    .join('\n');
}

const normalizeSrc = inline('agents/sales-qualification/normalize.js');
const rulesSrc = inline('agents/sales-qualification/rules.js');
const postprocessSrc = inline('agents/sales-qualification/postprocess.js');
// Only the detection helpers the website intake needs (top-level `var`/`function` blocks by name).
function pick(file, names) {
  const src = inline(file);
  const lines = src.split('\n');
  const blocks = {}; let cur = null;
  for (const l of lines) {
    const m = l.match(/^(?:var|function)\s+([A-Za-z_$][\w$]*)/);
    if (m) { cur = m[1]; blocks[cur] = []; }
    if (cur) blocks[cur].push(l);
  }
  return names.map((n) => { if (!blocks[n]) throw new Error('pick: ' + n + ' not found in ' + file); return blocks[n].join('\n'); }).join('\n');
}
const briefSrc = pick('agents/website-builder/brief.js', ['wbStr', 'WB_MEDICAL_RE', 'wbDetectMode', 'WB_CATEGORY_RULES', 'wbDetectCategory', 'wbDetectSiteType', 'wbDetectGoal', 'wbGuessBusinessName']);
const intakeSrc = inline('agents/website-builder/intake.js');    // John's website intake gate

// ---------------------------------------------------------------- Code nodes
const codeNormalize = `${normalizeSrc}
// ---- n8n glue ----
const cfg = $('Workflow Config').first().json;
const raw = $input.first().json || {};
const body = (raw.body && typeof raw.body === 'object') ? raw.body : raw;
const res = normalizeLead(body, { defaultTenant: cfg.default_tenant, defaultAiMode: cfg.default_ai_mode });
return [{ json: { ok: res.ok, errors: res.errors, warnings: res.warnings, lead: res.lead, config: { model: cfg.model, notify_email: cfg.notify_email, agent: cfg.agent, agent_version: cfg.agent_version, auto_send_low_risk: String(cfg.auto_send_low_risk) === 'true' }, execution_id: String($execution.id), workflow_id: String($workflow.id) } }];
`;

const codeResolve = `// Merge the incoming lead with whatever we already know about it and build the prompt.
const USER_PROMPT_TEMPLATE = ${JSON.stringify(userPrompt)};
const norm = $('Validate & Normalize Lead').first().json;
const existing = ($input.first() && $input.first().json) || {};
const isNew = !(existing && existing.lead_key);
const lead = norm.lead;
if (!isNew) {
  if (existing.lead_id) lead.lead_id = existing.lead_id;
  const keep = ['contact_name', 'email', 'phone', 'company_name', 'industry'];
  for (const k of keep) if (!lead[k] && existing[k]) lead[k] = existing[k];
}
const previousStatus = isNew ? 'NEW' : (existing.status || 'NEW');
const now = new Date().toISOString();
const history = (lead.conversation_history || []).map((m) => '- [' + m.role + (m.ts ? ' ' + m.ts : '') + '] ' + m.content).join('\\n') || '(none)';
const vars = {
  tenant_id: lead.tenant_id, lead_id: lead.lead_id, previous_status: previousStatus, lead_source: lead.lead_source,
  channel: lead.channel, now: now, contact_name: lead.contact_name || 'not given', phone: lead.phone || 'not given',
  email: lead.email || 'not given', company_name: lead.company_name || 'not given', industry: lead.industry || 'not given',
  message: lead.message || '(no message)', conversation_history: history
};
const userPrompt = USER_PROMPT_TEMPLATE.replace(/\\{\\{(\\w+)\\}\\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
return [{ json: { lead, is_new: isNew, previous_status: previousStatus, existing_row_id: existing.id || null, now, user_prompt: userPrompt, config: norm.config, execution_id: norm.execution_id, workflow_id: norm.workflow_id } }];
`;

const codeRules = `${rulesSrc}
// ---- n8n glue ----
const ctx = $('Resolve Lead Identity').first().json;
return [{ json: { source: 'rules', provider: 'rules', model: RB_VERSION, reason: ctx.lead.ai_mode === 'mock' ? 'mock_mode' : 'baseline', result: classifyWithRules(ctx.lead) } }];
`;

const codeFinalize = `var CB_OUTPUT_SCHEMA = ${outputSchema.trim()};
var CB_LEAD_STATUS = ${leadStatus.trim()};
${postprocessSrc}
${briefSrc}
${intakeSrc}
// ---- n8n glue ----
function cbMakeId(prefix) { return prefix + '_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36); }
const ctx = $('Resolve Lead Identity').first().json;
const inp = ($input.first() && $input.first().json) || {};
const rulesNode = $('Rule-Based Qualification (baseline / fallback)').first().json;
const rulesResult = rulesNode.result;
let provider = 'anthropic', model = ctx.config.model, rawText = null, result = null, error = null, usage = null, fallbackReason = null;
if (inp.source === 'rules') { provider = 'rules'; model = inp.model; result = inp.result; fallbackReason = inp.reason; }
else if (inp.error) { error = 'model_error: ' + String(inp.error.message || inp.error.description || JSON.stringify(inp.error)).slice(0, 300); }
else {
  model = inp.model || model;
  usage = inp.usage || null;
  if (typeof inp.text === 'string' && inp.text.trim()) rawText = inp.text;
  else if (Array.isArray(inp.content)) rawText = inp.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('\\n');
  else if (typeof inp.output === 'string') rawText = inp.output;
  else if (typeof inp === 'string') rawText = inp;
  if (!rawText) error = 'empty_model_output';
}
const fin = finalizeResult({ lead: ctx.lead, previous_status: ctx.previous_status, now: new Date().toISOString(), provider, model, raw_text: rawText, result, error, rules_result: rulesResult });
if (provider === 'rules' && !fin.fallback_reason) fin.fallback_reason = fallbackReason;
const finishedAt = new Date().toISOString();
const latencyMs = Math.max(0, new Date(finishedAt).getTime() - new Date(ctx.now).getTime());
const r = fin.result;
const approvalNeeded = r.human_review_required || r.next_action === 'request_proposal_approval';
const sendChannel = ctx.lead.channel === 'email' ? 'email' : (ctx.lead.channel === 'whatsapp' ? 'whatsapp' : null);
const sendTo = sendChannel === 'email' ? ctx.lead.email : (sendChannel === 'whatsapp' ? ctx.lead.phone : null);
const autoSend = !approvalNeeded && ctx.config.auto_send_low_risk === true && !ctx.lead.test_mode && !!sendChannel && !!sendTo && !!r.recommended_reply;
// Website intake + hand-off (Ryan, 2026-09-25: zero approvals). When the customer asks for a site or a
// mock-up, John collects the four details; once he has them the Website Builder is called and builds.
const notPitch = r.intent !== 'spam' && r.intent !== 'vendor_or_job_pitch';
const histAll = Array.isArray(ctx.lead.conversation_history) ? ctx.lead.conversation_history : [];
const intake = wbIntake({ history: histAll, message: ctx.lead.message, company_name: ctx.lead.company_name || r.extracted.company_name, industry: ctx.lead.industry || r.extracted.industry, contact_name: ctx.lead.contact_name || r.extracted.contact_name, phone: ctx.lead.phone, email: ctx.lead.email, channel: ctx.lead.channel, extracted: r.extracted });
const buildStarted = wbBuildAlreadyStarted(histAll);
const websiteTopic = notPitch && intake.topic;
const websiteRequested = websiteTopic && intake.ready && !buildStarted;
// John's own answer stands unless the customer asked for a build; then the intake takes over the reply.
if (websiteTopic && intake.intent && !buildStarted && !approvalNeeded && r.recommended_reply) r.recommended_reply = intake.reply;
else if (websiteTopic && !intake.intent && !buildStarted && !approvalNeeded && r.recommended_reply && !/mock-?up made for your business/i.test(r.recommended_reply)) r.recommended_reply = r.recommended_reply.trim() + ' ' + intake.offer;
const contactFound = { email: intake.email || null, phone: intake.phone || null };
const handoffs = websiteRequested ? ['website-builder'] : [];
const followUpTask = {
  task_id: cbMakeId('task'),
  task_type: approvalNeeded ? 'approval' : (r.next_action === 'book_discovery_call' ? 'call' : 'follow_up'),
  title: (approvalNeeded ? 'APPROVAL: ' : 'Follow up: ') + (ctx.lead.contact_name || 'lead') + (ctx.lead.company_name ? ' @ ' + ctx.lead.company_name : '') + ' — ' + r.next_action.replace(/_/g, ' '),
  description: r.summary + (r.escalation_reasons.length ? ' | Escalation: ' + r.escalation_reasons.join(', ') : ''),
  due_at: r.follow_up_at,
  status: 'open',
  assigned_to: approvalNeeded ? 'human' : 'sales-agent',
  requires_approval: approvalNeeded,
  approval_reason: r.escalation_reasons.join(', ')
};
const response = {
  ok: true,
  lead_id: ctx.lead.lead_id,
  tenant_id: ctx.lead.tenant_id,
  is_new_lead: ctx.is_new,
  test_mode: ctx.lead.test_mode,
  ai: { provider: fin.provider, model: fin.model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason, validation_errors: fin.validation_errors, latency_ms: latencyMs, usage },
  delivery: { auto_send: autoSend, channel: sendChannel, to: sendTo ? sendTo.replace(/(.{3}).+(.{2})/, '$1***$2') : null, mode: autoSend ? 'auto_send_low_risk' : (approvalNeeded ? 'awaiting_human_approval' : (ctx.lead.test_mode ? 'test_mode_no_send' : 'draft_only')) },
  status_change: fin.status_change,
  result: r,
  follow_up_task: followUpTask,
  audit: fin.audit,
  handoffs,
  website_intake: { topic: websiteTopic, intent: intake.intent, ready: intake.ready, missing: intake.missing, build_started: buildStarted },
  execution_id: ctx.execution_id
};
return [{ json: {
  lead: ctx.lead, is_new: ctx.is_new, previous_status: ctx.previous_status, config: ctx.config,
  execution_id: ctx.execution_id, workflow_id: ctx.workflow_id,
  provider: fin.provider, model: fin.model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason,
  validation_errors: fin.validation_errors, status_change: fin.status_change, audit: fin.audit,
  result: r, run_id: cbMakeId('run'), message_id: cbMakeId('msg'), task: followUpTask,
  usage, started_at: ctx.now, finished_at: finishedAt, latency_ms: latencyMs,
  approval_needed: approvalNeeded, auto_send: autoSend, send_channel: sendChannel, send_to: sendTo,
  send_subject: 'Re: your enquiry to FusionTech AI', website_requested: websiteRequested, handoffs, response,
  website_intake: { topic: websiteTopic, intent: intake.intent, ready: intake.ready, missing: intake.missing, build_started: buildStarted, details: intake.details }, contact_found: contactFound
} }];
`;

// ---------------------------------------------------------------- SDK source
const j = (v) => JSON.stringify(v);
const codeCompose = `// Composes John's system prompt AT RUN TIME: the static parts are compiled from the repo, the company
// knowledge and the sales playbook are read live from Ryan's Obsidian vault (GitHub). If the vault
// cannot be read, the compiled copy is used so a lead is never dropped.
const STATIC_HEAD = ${j(companyContext)};
const STATIC_BODY = ${j(salesBody)};
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
const brain = vaultText('Load Brain from Vault');
const playbook = vaultText('Load Sales Playbook');
let system, source;
if (brain) {
  system = STATIC_HEAD + '\\n\\n# Company knowledge (live from Ryan\\'s vault — authoritative; newest statements win)\\n\\n' + brain
    + (playbook ? '\\n\\n# Sales playbook (live from the vault — follow it)\\n\\n' + playbook : '')
    + '\\n\\n' + STATIC_BODY;
  source = playbook ? 'vault:brain+playbook' : 'vault:brain';
} else {
  system = STATIC_HEAD + '\\n\\n' + STATIC_BODY;
  source = 'compiled_fallback';
}
return [{ json: { system_prompt: system, brain_source: source, brain_chars: brain ? brain.length : 0, playbook_chars: playbook ? playbook.length : 0 } }];
`;

const col = (id, type) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type, canBeUsedToMatch: true });
const schemaFor = (cols) => cols.map(([id, type]) => col(id, type));
const F = "$('Finalize & Validate Result').item.json";
const R = "$('Resolve Lead Identity').item.json";

const leadCols = [['tenant_id','string'],['lead_id','string'],['lead_key','string'],['status','string'],['lead_temperature','string'],['contact_name','string'],['email','string'],['phone','string'],['company_name','string'],['industry','string'],['lead_source','string'],['channel','string'],['intent','string'],['summary','string'],['missing_information','string'],['next_action','string'],['follow_up_at','string'],['human_review_required','boolean'],['last_message','string'],['extracted_json','string'],['test_mode','boolean'],['updated_by','string'],['last_contact_at','string']];
const msgCols = [['tenant_id','string'],['lead_id','string'],['message_id','string'],['direction','string'],['channel','string'],['sender','string'],['content','string'],['status','string'],['execution_id','string'],['created_by','string'],['ts','string']];
const runCols = [['tenant_id','string'],['run_id','string'],['agent','string'],['agent_version','string'],['lead_id','string'],['workflow_id','string'],['execution_id','string'],['model','string'],['provider','string'],['input_ref','string'],['output_json','string'],['success','boolean'],['error','string'],['latency_ms','number'],['test_mode','boolean'],['started_at','string'],['finished_at','string']];
const taskCols = [['tenant_id','string'],['task_id','string'],['lead_id','string'],['task_type','string'],['title','string'],['description','string'],['due_at','string'],['status','string'],['assigned_to','string'],['requires_approval','boolean'],['approval_reason','string'],['payload_json','string'],['created_by','string'],['ts','string']];
const auditCols = [['tenant_id','string'],['entity_type','string'],['entity_id','string'],['action','string'],['old_value','string'],['new_value','string'],['actor','string'],['execution_id','string'],['reason','string'],['ts','string']];

const table = (name) => ({ __rl: true, mode: 'id', value: TABLES[name].id, cachedResultName: name });

const sdk = `import { workflow, node, trigger, sticky, ifElse, expr } from '@n8n/workflow-sdk';

const leadWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Lead Webhook',
    parameters: { httpMethod: 'POST', path: 'ceo-brain/lead', responseMode: 'responseNode', options: {} },
    position: [0, 300]
  },
  output: [{ body: { name: 'John Tan', company: 'ABC Property Pte Ltd', source: 'facebook', message: 'Hi, I run a property agency with 25 agents.', test_mode: true } }]
});

const workflowConfig = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Workflow Config',
    parameters: {
      mode: 'manual',
      includeOtherFields: true,
      assignments: { assignments: [
        { id: 'cfg-model', name: 'model', value: ${j(agentManifest.model)}, type: 'string' },
        { id: 'cfg-notify', name: 'notify_email', value: ${j(agentManifest.notify_email)}, type: 'string' },
        { id: 'cfg-tenant', name: 'default_tenant', value: ${j(agentManifest.default_tenant)}, type: 'string' },
        { id: 'cfg-aimode', name: 'default_ai_mode', value: 'live', type: 'string' },
        { id: 'cfg-autosend', name: 'auto_send_low_risk', value: ${j(String(agentManifest.auto_send_low_risk))}, type: 'string' },
        { id: 'cfg-agent', name: 'agent', value: ${j(agentManifest.id)}, type: 'string' },
        { id: 'cfg-agentv', name: 'agent_version', value: ${j(agentManifest.version)}, type: 'string' }
      ] }
    },
    position: [220, 300]
  },
  output: [{ model: ${j(agentManifest.model)}, notify_email: ${j(agentManifest.notify_email)}, default_tenant: ${j(agentManifest.default_tenant)}, default_ai_mode: 'live', auto_send_low_risk: 'true', agent: ${j(agentManifest.id)}, agent_version: ${j(agentManifest.version)}, body: {} }]
});

const normalizeLeadNode = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Validate & Normalize Lead',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeNormalize)} },
    position: [440, 300]
  },
  output: [{ ok: true, errors: [], warnings: [], lead: { tenant_id: 'biogreen', lead_id: 'lead_x', lead_key: 'biogreen:abc', contact_name: 'John Tan', email: null, phone: '+6591234567', company_name: 'ABC Property Pte Ltd', industry: null, lead_source: 'facebook', channel: 'messenger', message: 'Hi', conversation_history: [], external_ids: {}, test_mode: true, ai_mode: 'live', received_at: '2026-01-01T00:00:00.000Z' }, config: { model: 'claude-sonnet-4-6', notify_email: 'owner@example.com', agent: 'sales-qualification', agent_version: '1.0.0' }, execution_id: '1', workflow_id: 'w' }]
});

const isLeadValid = ifElse({
  version: 2.3,
  config: {
    name: 'Is Lead Valid?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'valid', leftValue: expr('{{ $json.ok }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      }
    },
    position: [660, 300]
  }
});

const respondInvalid = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond 400 Invalid Lead',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify({ ok: false, errors: $json.errors, warnings: $json.warnings }) }}'),
      options: { responseCode: 400 }
    },
    position: [900, 520]
  },
  output: [{ ok: false, errors: ['message_required'] }]
});

const findExistingLead = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Find Existing Lead',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: ${j(table('ceo_leads'))},
      matchType: 'anyCondition',
      filters: { conditions: [{ keyName: 'lead_key', condition: 'eq', keyValue: expr('{{ $json.lead.lead_key }}') }] },
      returnAll: false,
      limit: 1
    },
    position: [900, 300]
  },
  output: [{}]
});

const resolveLead = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Resolve Lead Identity',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeResolve)} },
    position: [1120, 300]
  },
  output: [{ lead: { tenant_id: 'biogreen', lead_id: 'lead_x', lead_key: 'biogreen:abc', contact_name: 'John Tan', email: null, phone: '+6591234567', company_name: 'ABC Property Pte Ltd', industry: null, lead_source: 'facebook', channel: 'messenger', message: 'Hi', conversation_history: [], external_ids: {}, test_mode: true, ai_mode: 'live', received_at: '2026-01-01T00:00:00.000Z' }, is_new: true, previous_status: 'NEW', existing_row_id: null, now: '2026-01-01T00:00:00.000Z', user_prompt: 'Qualify this inbound lead...', config: { model: 'claude-sonnet-4-6', notify_email: 'owner@example.com', agent: 'sales-qualification', agent_version: '1.0.0' }, execution_id: '1', workflow_id: 'w' }]
});

const saveLead = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Save Lead (upsert)',
    parameters: {
      resource: 'row',
      operation: 'upsert',
      dataTableId: ${j(table('ceo_leads'))},
      matchType: 'anyCondition',
      filters: { conditions: [{ keyName: 'lead_key', condition: 'eq', keyValue: expr('{{ $json.lead.lead_key }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr('{{ $json.lead.tenant_id }}'),
          lead_id: expr('{{ $json.lead.lead_id }}'),
          lead_key: expr('{{ $json.lead.lead_key }}'),
          status: expr('{{ $json.previous_status }}'),
          contact_name: expr('{{ $json.lead.contact_name ?? "" }}'),
          email: expr('{{ $json.lead.email ?? "" }}'),
          phone: expr('{{ $json.lead.phone ?? "" }}'),
          company_name: expr('{{ $json.lead.company_name ?? "" }}'),
          industry: expr('{{ $json.lead.industry ?? "" }}'),
          lead_source: expr('{{ $json.lead.lead_source }}'),
          channel: expr('{{ $json.lead.channel }}'),
          last_message: expr('{{ $json.lead.message ?? "" }}'),
          test_mode: expr('{{ $json.lead.test_mode }}'),
          updated_by: 'lead-intake',
          last_contact_at: expr('{{ $json.now }}')
        },
        schema: ${j(schemaFor(leadCols))}
      }
    },
    position: [1340, 300]
  },
  output: [{ id: 1, tenant_id: 'biogreen', lead_id: 'lead_x', status: 'NEW' }]
});

const logInbound = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Inbound Message',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: ${j(table('ceo_messages'))},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${R}.lead.tenant_id }}"),
          lead_id: expr("{{ ${R}.lead.lead_id }}"),
          message_id: expr("{{ 'msg_' + ${R}.execution_id + '_in' }}"),
          direction: 'inbound',
          channel: expr("{{ ${R}.lead.channel }}"),
          sender: expr("{{ ${R}.lead.contact_name ?? ${R}.lead.phone ?? ${R}.lead.email ?? 'unknown' }}"),
          content: expr("{{ ${R}.lead.message ?? '' }}"),
          status: 'received',
          execution_id: expr("{{ ${R}.execution_id }}"),
          created_by: expr("{{ 'adapter:' + ${R}.lead.lead_source }}"),
          ts: expr("{{ ${R}.now }}")
        },
        schema: ${j(schemaFor(msgCols))}
      }
    },
    position: [1560, 300]
  },
  output: [{ id: 1, direction: 'inbound' }]
});

const useLiveAi = ifElse({
  version: 2.3,
  config: {
    name: 'Use Live AI?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'aimode', leftValue: expr("{{ ${R}.lead.ai_mode }}"), rightValue: 'live', operator: { type: 'string', operation: 'equals' } }],
        combinator: 'and'
      }
    },
    position: [2000, 300]
  }
});

const loadBrain = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Load Brain from Vault',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: { __rl: true, mode: 'name', value: ${j(GITHUB.owner)} }, repository: { __rl: true, mode: 'name', value: ${j(GITHUB.repo)} }, filePath: ${j(VAULT.brain)}, asBinaryProperty: false, additionalParameters: {} },
    credentials: { githubOAuth2Api: { id: ${j(GITHUB.credential_id)}, name: ${j(GITHUB.credential_name)} } },
    position: [2200, 100]
  },
  output: [{ content: 'LS0t', encoding: 'base64', sha: 'x', path: ${j(VAULT.brain)} }]
});

const loadPlaybook = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Load Sales Playbook',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: { __rl: true, mode: 'name', value: ${j(GITHUB.owner)} }, repository: { __rl: true, mode: 'name', value: ${j(GITHUB.repo)} }, filePath: ${j(VAULT.playbook)}, asBinaryProperty: false, additionalParameters: {} },
    credentials: { githubOAuth2Api: { id: ${j(GITHUB.credential_id)}, name: ${j(GITHUB.credential_name)} } },
    position: [2420, 100]
  },
  output: [{ content: 'LS0t', encoding: 'base64', sha: 'x', path: ${j(VAULT.playbook)} }]
});

const composePrompt = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Compose System Prompt',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeCompose)} },
    position: [2640, 100]
  },
  output: [{ system_prompt: 'You are John...', brain_source: 'vault:brain+playbook', brain_chars: 17000, playbook_chars: 2000 }]
});

const claudeAgent = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'Sales Qualification Agent (Claude)',
    onError: 'continueErrorOutput',
    parameters: {
      resource: 'text',
      operation: 'message',
      modelId: { __rl: true, mode: 'list', value: ${j(agentManifest.model)}, cachedResultName: ${j(agentManifest.model_display_name)} },
      messages: { values: [{ role: 'user', content: expr("{{ ${R}.user_prompt }}") }] },
      simplify: true,
      options: {
        system: expr("{{ $('Compose System Prompt').first().json.system_prompt }}"),
        maxTokens: 2500,
        temperature: 0.1,
        includeMergedResponse: true
      }
    },
    position: [2860, 100]
  },
  output: [{ text: '{"schema_version":"1.0","lead_status":"QUALIFYING"}', model: 'claude-sonnet-4-6', usage: { input_tokens: 1, output_tokens: 1 } }]
});

const rulesEngine = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Rule-Based Qualification (baseline / fallback)',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeRules)} },
    position: [1780, 300]
  },
  output: [{ source: 'rules', provider: 'rules', model: 'rules-v1', reason: 'baseline', result: { schema_version: '1.0', lead_status: 'QUALIFYING', intent: 'ai_automation_enquiry', lead_temperature: 'warm', summary: 's', extracted: {}, missing_information: [], recommended_reply: 'Hi', questions_to_ask: [], next_action: 'ask_qualifying_questions', follow_up_at: null, human_review_required: false, escalation_reasons: [], confidence: 0.6, reasoning: 'r' } }]
});

const finalize = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Finalize & Validate Result',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeFinalize)} },
    position: [2300, 300]
  },
  output: [{ lead: { tenant_id: 'biogreen', lead_id: 'lead_x', lead_key: 'biogreen:abc', channel: 'messenger', contact_name: 'John Tan', test_mode: true, message: 'Hi' }, is_new: true, previous_status: 'NEW', config: { model: 'claude-sonnet-4-6', notify_email: 'owner@example.com', agent: 'sales-qualification', agent_version: '1.0.0' }, execution_id: '1', workflow_id: 'w', provider: 'anthropic', model: 'claude-sonnet-4-6', fallback_used: false, fallback_reason: null, validation_errors: [], status_change: { from: 'NEW', to: 'QUALIFYING', changed: true }, audit: [], result: { schema_version: '1.0', lead_status: 'QUALIFYING', intent: 'ai_automation_enquiry', lead_temperature: 'warm', summary: 's', extracted: {}, missing_information: [], recommended_reply: 'Hi', questions_to_ask: [], next_action: 'ask_qualifying_questions', follow_up_at: '2026-01-02T00:00:00.000Z', human_review_required: false, escalation_reasons: [], confidence: 0.8, reasoning: 'r' }, run_id: 'run_x', message_id: 'msg_x', task: { task_id: 'task_x', task_type: 'follow_up', title: 't', description: 'd', due_at: '2026-01-02T00:00:00.000Z', status: 'open', assigned_to: 'sales-agent', requires_approval: false, approval_reason: '' }, usage: null, started_at: '2026-01-01T00:00:00.000Z', finished_at: '2026-01-01T00:00:01.000Z', latency_ms: 1000, approval_needed: false, response: { ok: true } }]
});

const updateLeadStatus = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Update Lead Status',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: ${j(table('ceo_leads'))},
      matchType: 'anyCondition',
      filters: { conditions: [{ keyName: 'lead_key', condition: 'eq', keyValue: expr('{{ $json.lead.lead_key }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          status: expr('{{ $json.result.lead_status }}'),
          lead_temperature: expr('{{ $json.result.lead_temperature }}'),
          intent: expr('{{ $json.result.intent }}'),
          summary: expr('{{ $json.result.summary }}'),
          missing_information: expr('{{ JSON.stringify($json.result.missing_information) }}'),
          next_action: expr('{{ $json.result.next_action }}'),
          follow_up_at: expr('{{ $json.result.follow_up_at ?? "" }}'),
          human_review_required: expr('{{ $json.result.human_review_required }}'),
          extracted_json: expr('{{ JSON.stringify($json.result.extracted) }}'),
          company_name: expr("{{ $json.lead.company_name || $json.result.extracted.company_name || ($json.website_intake && $json.website_intake.details ? $json.website_intake.details.business_name : '') || '' }}"),
          industry: expr("{{ $json.lead.industry || $json.result.extracted.industry || ($json.website_intake && $json.website_intake.details ? $json.website_intake.details.industry : '') || '' }}"),
          email: expr('{{ $json.lead.email || $json.contact_found.email || "" }}'),
          phone: expr('{{ $json.lead.phone || $json.contact_found.phone || "" }}'),
          updated_by: expr('{{ "agent:" + $json.config.agent + "@" + $json.provider }}'),
          last_contact_at: expr('{{ $json.finished_at }}')
        },
        schema: ${j(schemaFor(leadCols))}
      }
    },
    position: [3100, 300]
  },
  output: [{ id: 1, status: 'QUALIFYING' }]
});

const logAgentRun = node({
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
          tenant_id: expr("{{ ${F}.lead.tenant_id }}"),
          run_id: expr("{{ ${F}.run_id }}"),
          agent: expr("{{ ${F}.config.agent }}"),
          agent_version: expr("{{ ${F}.config.agent_version }}"),
          lead_id: expr("{{ ${F}.lead.lead_id }}"),
          workflow_id: expr("{{ ${F}.workflow_id }}"),
          execution_id: expr("{{ ${F}.execution_id }}"),
          model: expr("{{ ${F}.model }}"),
          provider: expr("{{ ${F}.provider }}"),
          input_ref: expr("{{ 'ceo_messages:msg_' + ${F}.execution_id + '_in' }}"),
          output_json: expr("{{ JSON.stringify({ result: ${F}.result, status_change: ${F}.status_change, audit: ${F}.audit, validation_errors: ${F}.validation_errors, usage: ${F}.usage }) }}"),
          success: expr("{{ ${F}.validation_errors.length === 0 || ${F}.fallback_used }}"),
          error: expr("{{ ${F}.fallback_used ? (${F}.fallback_reason ?? '') : '' }}"),
          latency_ms: expr("{{ ${F}.latency_ms }}"),
          test_mode: expr("{{ ${F}.lead.test_mode }}"),
          started_at: expr("{{ ${F}.started_at }}"),
          finished_at: expr("{{ ${F}.finished_at }}")
        },
        schema: ${j(schemaFor(runCols))}
      }
    },
    position: [3320, 300]
  },
  output: [{ id: 1, run_id: 'run_x' }]
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
          tenant_id: expr("{{ ${F}.lead.tenant_id }}"),
          entity_type: 'lead',
          entity_id: expr("{{ ${F}.lead.lead_id }}"),
          action: expr("{{ ${F}.status_change.changed ? 'status_changed' : 'status_confirmed' }}"),
          old_value: expr("{{ ${F}.status_change.from }}"),
          new_value: expr("{{ ${F}.status_change.to }}"),
          actor: expr("{{ 'agent:' + ${F}.config.agent + '@' + ${F}.provider }}"),
          execution_id: expr("{{ ${F}.execution_id }}"),
          reason: expr("{{ [${F}.result.reasoning].concat(${F}.audit).join(' | ') }}"),
          ts: expr("{{ ${F}.finished_at }}")
        },
        schema: ${j(schemaFor(auditCols))}
      }
    },
    position: [3540, 300]
  },
  output: [{ id: 1, action: 'status_changed' }]
});

const saveDraftReply = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Save Draft Reply',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: ${j(table('ceo_messages'))},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${F}.lead.tenant_id }}"),
          lead_id: expr("{{ ${F}.lead.lead_id }}"),
          message_id: expr("{{ ${F}.message_id }}"),
          direction: 'outbound',
          channel: expr("{{ ${F}.lead.channel }}"),
          sender: expr("{{ 'agent:' + ${F}.config.agent }}"),
          content: expr("{{ ${F}.result.recommended_reply }}"),
          status: expr("{{ ${F}.result.recommended_reply ? (${F}.approval_needed ? 'draft_pending_approval' : 'draft') : 'withheld' }}"),
          execution_id: expr("{{ ${F}.execution_id }}"),
          created_by: expr("{{ 'agent:' + ${F}.config.agent + '@' + ${F}.provider }}"),
          ts: expr("{{ ${F}.finished_at }}")
        },
        schema: ${j(schemaFor(msgCols))}
      }
    },
    position: [3760, 300]
  },
  output: [{ id: 2, direction: 'outbound', status: 'draft' }]
});

const createTask = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Create Follow-up Task',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: ${j(table('ceo_tasks'))},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${F}.lead.tenant_id }}"),
          task_id: expr("{{ ${F}.task.task_id }}"),
          lead_id: expr("{{ ${F}.lead.lead_id }}"),
          task_type: expr("{{ ${F}.task.task_type }}"),
          title: expr("{{ ${F}.task.title }}"),
          description: expr("{{ ${F}.task.description }}"),
          due_at: expr("{{ ${F}.task.due_at ?? '' }}"),
          status: expr("{{ ${F}.task.status }}"),
          assigned_to: expr("{{ ${F}.task.assigned_to }}"),
          requires_approval: expr("{{ ${F}.task.requires_approval }}"),
          approval_reason: expr("{{ ${F}.task.approval_reason }}"),
          payload_json: expr("{{ JSON.stringify({ next_action: ${F}.result.next_action, recommended_reply: ${F}.result.recommended_reply, questions_to_ask: ${F}.result.questions_to_ask, channel: ${F}.lead.channel }) }}"),
          created_by: expr("{{ 'agent:' + ${F}.config.agent }}"),
          ts: expr("{{ ${F}.finished_at }}")
        },
        schema: ${j(schemaFor(taskCols))}
      }
    },
    position: [3980, 300]
  },
  output: [{ id: 1, task_id: 'task_x' }]
});

const writeVault = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Write to Vault (Vault Writer)',
    onError: 'continueRegularOutput',
    parameters: {
      mode: 'once',
      source: 'database',
      workflowId: { __rl: true, mode: 'id', value: ${j(TABLES.__vault_writer_workflow_id || 'REPLACE_ME')}, cachedResultName: 'CEO Brain — Vault Writer' },
      workflowInputs: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${F}.lead.tenant_id }}"),
          lead_id: expr("{{ ${F}.lead.lead_id }}"),
          contact_name: expr("{{ ${F}.lead.contact_name ?? '' }}"),
          company_name: expr("{{ ${F}.lead.company_name ?? ${F}.result.extracted.company_name ?? '' }}"),
          industry: expr("{{ ${F}.lead.industry ?? ${F}.result.extracted.industry ?? '' }}"),
          channel: expr("{{ ${F}.lead.channel }}"),
          lead_source: expr("{{ ${F}.lead.lead_source }}"),
          status: expr("{{ ${F}.status_change.to }}"),
          temperature: expr("{{ ${F}.result.lead_temperature }}"),
          intent: expr("{{ ${F}.result.intent }}"),
          summary: expr("{{ ${F}.result.summary }}"),
          extracted_json: expr("{{ JSON.stringify(${F}.result.extracted) }}"),
          message: expr("{{ ${F}.lead.message ?? '' }}"),
          reply: expr("{{ ${F}.result.recommended_reply ?? '' }}"),
          next_action: expr("{{ ${F}.result.next_action }}"),
          handoffs_json: expr("{{ JSON.stringify(${F}.handoffs ?? []) }}"),
          provider: expr("{{ ${F}.provider }}"),
          execution_id: expr("{{ ${F}.execution_id }}"),
          ts: expr("{{ ${F}.finished_at }}"),
          test_mode: expr("{{ ${F}.lead.test_mode }}")
        },
        matchingColumns: [],
        schema: ${j([['tenant_id','string'],['lead_id','string'],['contact_name','string'],['company_name','string'],['industry','string'],['channel','string'],['lead_source','string'],['status','string'],['temperature','string'],['intent','string'],['summary','string'],['extracted_json','string'],['message','string'],['reply','string'],['next_action','string'],['handoffs_json','string'],['provider','string'],['execution_id','string'],['ts','string'],['test_mode','boolean']].map(([id,type]) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type })))},
        attemptToConvertTypes: false,
        convertFieldsToString: true
      },
      options: { waitForSubWorkflow: false }
    },
    position: [4200, 300]
  },
  output: [{ ok: true }]
});

const websiteGate = ifElse({
  version: 2.3,
  config: {
    name: 'Website Requested?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'website', leftValue: expr("{{ ${F}.website_requested }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      }
    },
    position: [4420, 300]
  }
});

const callWebsiteBuilder = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Hand Off to Website Intelligence',
    onError: 'continueRegularOutput',
    parameters: {
      mode: 'once',
      source: 'database',
      workflowId: { __rl: true, mode: 'id', value: ${j(TABLES.__website_intelligence_workflow_id || TABLES.__website_builder_workflow_id || 'REPLACE_ME')}, cachedResultName: ${j(TABLES.__website_intelligence_workflow_id ? 'CEO Brain — Website Intelligence' : 'CEO Brain — Website Builder')} },
      workflowInputs: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${F}.lead.tenant_id }}"),
          lead_id: expr("{{ ${F}.lead.lead_id }}"),
          contact_name: expr("{{ ${F}.lead.contact_name ?? '' }}"),
          company_name: expr("{{ ${F}.lead.company_name || ${F}.website_intake.details.business_name || '' }}"),
          industry: expr("{{ ${F}.lead.industry || ${F}.result.extracted.industry || ${F}.website_intake.details.industry || '' }}"),
          email: expr("{{ ${F}.lead.email || ${F}.contact_found.email || '' }}"),
          phone: expr("{{ ${F}.lead.phone || ${F}.contact_found.phone || '' }}"),
          channel: expr("{{ ${F}.lead.channel }}"),
          message: expr("{{ ${F}.lead.message ?? '' }}"),
          conversation_json: expr("{{ JSON.stringify(${F}.lead.conversation_history ?? []) }}"),
          sales_summary: expr("{{ ${F}.result.summary }}"),
          extracted_json: expr("{{ JSON.stringify(${F}.result.extracted) }}"),
          test_mode: expr("{{ ${F}.lead.test_mode }}"),
          notify_email: expr("{{ ${F}.config.notify_email }}"),
          source_execution_id: expr("{{ ${F}.execution_id }}")
        },
        matchingColumns: [],
        schema: ${j([['tenant_id','string'],['lead_id','string'],['contact_name','string'],['company_name','string'],['industry','string'],['email','string'],['phone','string'],['channel','string'],['message','string'],['conversation_json','string'],['sales_summary','string'],['extracted_json','string'],['test_mode','boolean'],['notify_email','string'],['source_execution_id','string']].map(([id,type]) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type })))},
        attemptToConvertTypes: false,
        convertFieldsToString: true
      },
      options: { waitForSubWorkflow: false }
    },
    position: [4640, 520]
  },
  output: [{ ok: true }]
});

const autoSendGate = ifElse({
  version: 2.3,
  config: {
    name: 'Auto-send Low-risk Reply?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'autosend', leftValue: expr("{{ ${F}.auto_send }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      }
    },
    position: [4860, 300]
  }
});

const sendReplyNow = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Send Reply Now (Outbound Sender)',
    onError: 'continueRegularOutput',
    parameters: {
      mode: 'once',
      source: 'database',
      workflowId: { __rl: true, mode: 'id', value: ${j(TABLES.__sender_workflow_id || 'REPLACE_ME')}, cachedResultName: 'CEO Brain — Outbound Sender' },
      workflowInputs: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ ${F}.lead.tenant_id }}"),
          lead_id: expr("{{ ${F}.lead.lead_id }}"),
          message_id: expr("{{ ${F}.message_id }}"),
          channel: expr("{{ ${F}.send_channel }}"),
          to: expr("{{ ${F}.send_to }}"),
          text: expr("{{ ${F}.result.recommended_reply }}"),
          subject: expr("{{ ${F}.send_subject }}"),
          test_mode: expr("{{ ${F}.lead.test_mode }}"),
          actor: expr("{{ 'agent:' + ${F}.config.agent + '@' + ${F}.provider }}")
        },
        matchingColumns: [],
        schema: ${j([['tenant_id','string'],['lead_id','string'],['message_id','string'],['channel','string'],['to','string'],['text','string'],['subject','string'],['test_mode','boolean'],['actor','string']].map(([id,type]) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type })))},
        attemptToConvertTypes: false,
        convertFieldsToString: false
      },
      options: { waitForSubWorkflow: true }
    },
    position: [5080, 160]
  },
  output: [{ sent: true, status: 'sent' }]
});

const needsHuman = ifElse({
  version: 2.3,
  config: {
    name: 'Human Review Needed?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'hr', leftValue: expr("{{ ${F}.approval_needed }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      }
    },
    position: [5300, 300]
  }
});

const notifyOwner = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Notify Owner (Gmail)',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'message',
      operation: 'send',
      sendTo: expr("{{ ${F}.config.notify_email }}"),
      subject: expr("{{ (${F}.lead.test_mode ? '[TEST] ' : '') + 'CEO Brain approval needed: ' + (${F}.lead.contact_name ?? 'lead') + (${F}.lead.company_name ? ' @ ' + ${F}.lead.company_name : '') + ' [' + ${F}.result.lead_status + ']' }}"),
      emailType: 'html',
      message: expr("{{ '<h2>' + ${F}.task.title + '</h2>' + '<p><b>Status:</b> ' + ${F}.status_change.from + ' → ' + ${F}.status_change.to + ' &nbsp; <b>Temperature:</b> ' + ${F}.result.lead_temperature + ' &nbsp; <b>Intent:</b> ' + ${F}.result.intent + '</p>' + '<p><b>Why a human:</b> ' + ${F}.result.escalation_reasons.join(', ') + '</p>' + '<p><b>Summary:</b> ' + ${F}.result.summary + '</p>' + '<p><b>Original message:</b><br>' + (${F}.lead.message ?? '') + '</p>' + '<p><b>Draft reply (NOT sent):</b><br>' + (${F}.result.recommended_reply || '(withheld by guardrail)') + '</p>' + '<p><b>Missing:</b> ' + ${F}.result.missing_information.join(', ') + '</p>' + '<p><b>Next action:</b> ' + ${F}.result.next_action + ' &nbsp; <b>Follow up by:</b> ' + (${F}.result.follow_up_at ?? '-') + '</p>' + (${F}.result.recommended_reply && ${F}.send_channel ? '<p><a href=\\"${agentManifest.approve_url}?decision=approve&message_id=' + ${F}.message_id + '&lead_id=' + ${F}.lead.lead_id + '\\" style=\\"background:#0a7d3c;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px\\">APPROVE &amp; SEND via ' + ${F}.send_channel + '</a> &nbsp; <a href=\\"${agentManifest.approve_url}?decision=reject&message_id=' + ${F}.message_id + '&lead_id=' + ${F}.lead.lead_id + '\\" style=\\"background:#999;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px\\">Reject</a></p>' : '<p><i>No reply can be sent automatically (no draft or no email/WhatsApp channel). Handle manually.</i></p>') + '<p style=\\"color:#888\\">lead ' + ${F}.lead.lead_id + ' · run ' + ${F}.run_id + ' · ' + ${F}.provider + '/' + ${F}.model + ' · execution ' + ${F}.execution_id + '</p>' }}"),
      options: { appendAttribution: false, senderName: 'CEO Brain' }
    },
    position: [5540, 200]
  },
  output: [{ id: 'gmail-id' }]
});

const respondResult = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond With Result',
    parameters: {
      respondWith: 'json',
      responseBody: expr("{{ JSON.stringify($('Finalize & Validate Result').first().json.response) }}"),
      options: { responseCode: 200 }
    },
    position: [5780, 300]
  },
  output: [{ ok: true }]
});

const noteIntro = sticky(${j('## CEO Brain — Lead Intake (Phase 1)\nPOST /webhook/ceo-brain/lead with {name, phone, email, company, industry, source, channel, message, conversation_history, test_mode, ai_mode}.\n\nFlow: validate → save lead → log message → AI (Claude) or rule engine → validate JSON + guardrails → update status → agent run + audit + draft reply + task → email owner when approval needed → respond.\n\nSource of truth: repo ryan/ceo-brain (workflows/lead-intake/build.js). Edit there, rebuild, redeploy — do not hand-edit Code nodes.')}, [leadWebhook, workflowConfig, normalizeLeadNode, isLeadValid], { color: 4 });
const noteAi = sticky(${j('## AI qualification\nThe rule engine always runs first (deterministic baseline). ai_mode=live → the company brain + sales playbook are loaded from the Obsidian vault (GitHub) into the prompt, then Claude (n8n managed Anthropic credential). If the model errors or returns invalid JSON, Finalize falls back to the rule-engine result so the lead is never dropped.\nai_mode=mock → rule engine only (no AI credits).\nGuardrails in "Finalize & Validate Result": no prices/guarantees/contracts/refunds in replies, WON/LOST are human-only, proposals need approval.')}, [rulesEngine, useLiveAi, claudeAgent, finalize], { color: 6 });
const noteHuman = sticky(${j('## Human approval gate\nThe AI only DRAFTS. Nothing is sent to the customer in Phase 1. When human_review_required or a proposal is needed, the owner gets an email and a task with requires_approval=true.')}, [needsHuman, notifyOwner, respondResult], { color: 3 });

export default workflow('ceo-brain-lead-intake', 'CEO Brain — Lead Intake (Phase 1)')
  .add(leadWebhook)
  .to(workflowConfig)
  .to(normalizeLeadNode)
  .to(isLeadValid
    .onTrue(findExistingLead.to(resolveLead).to(saveLead).to(logInbound).to(rulesEngine).to(useLiveAi
      .onTrue(loadBrain.to(loadPlaybook).to(composePrompt).to(claudeAgent.to(finalize)))
      .onFalse(finalize)))
    .onFalse(respondInvalid))
  .add(claudeAgent.onError(finalize))
  .add(finalize)
  .to(updateLeadStatus)
  .to(logAgentRun)
  .to(logAudit)
  .to(saveDraftReply)
  .to(createTask)
  .to(writeVault)
  .to(websiteGate
    .onTrue(callWebsiteBuilder.to(autoSendGate))
    .onFalse(autoSendGate))
  .add(autoSendGate
    .onTrue(sendReplyNow.to(needsHuman))
    .onFalse(needsHuman))
  .add(needsHuman
    .onTrue(notifyOwner.to(respondResult))
    .onFalse(respondResult))
  .add(noteIntro)
  .add(noteAi)
  .add(noteHuman)
  .group('1. Intake & validation', [workflowConfig, normalizeLeadNode, isLeadValid], { description: 'Reads the webhook body, normalizes contact fields, and gates on validity (invalid payloads get an HTTP 400 response).' })
  .group('2. Persist lead + inbound message', [findExistingLead, resolveLead, saveLead, logInbound], { description: 'Looks up the lead by dedupe key, merges known contact facts, upserts the lead row and logs the inbound message.' })
  .group('3. AI qualification', [rulesEngine, useLiveAi, loadBrain, loadPlaybook, composePrompt, claudeAgent, finalize], { description: 'Rule baseline; live: brain + sales playbook loaded from the vault into the prompt, Claude classifies; validation, fallback, guardrails.' })
  .group('4. Persist, deliver & notify', [updateLeadStatus, logAgentRun, logAudit, saveDraftReply, createTask, writeVault, websiteGate, callWebsiteBuilder, autoSendGate, sendReplyNow, needsHuman, notifyOwner, respondResult], { description: 'Status, run, audit, draft, task; vault write; website hand-off; auto-send low-risk replies; approve-link email; respond.' });
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'lead-intake.sdk.ts'), sdk);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'validate-and-normalize-lead.js'), codeNormalize);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'resolve-lead-identity.js'), codeResolve);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'rule-based-qualification.js'), codeRules);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'finalize-and-validate-result.js'), codeFinalize);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'compose-system-prompt.js'), codeCompose);
fs.writeFileSync(path.join(DIST, 'system-prompt.rendered.md'), systemPrompt);
const sdkStr = (re) => { const m = sdk.match(re); return m ? JSON.parse('"' + m[1] + '"') : null; };
fs.writeFileSync(path.join(DIST, 'expected-params.json'), JSON.stringify({
  workflow_config_assignments: [
    { id: 'cfg-model', name: 'model', value: agentManifest.model, type: 'string' },
    { id: 'cfg-notify', name: 'notify_email', value: agentManifest.notify_email, type: 'string' },
    { id: 'cfg-tenant', name: 'default_tenant', value: agentManifest.default_tenant, type: 'string' },
    { id: 'cfg-aimode', name: 'default_ai_mode', value: 'live', type: 'string' },
    { id: 'cfg-autosend', name: 'auto_send_low_risk', value: String(agentManifest.auto_send_low_risk), type: 'string' },
    { id: 'cfg-agent', name: 'agent', value: agentManifest.id, type: 'string' },
    { id: 'cfg-agentv', name: 'agent_version', value: agentManifest.version, type: 'string' }
  ],
  gmail_message: '=' + sdkStr(/name: 'Notify Owner \(Gmail\)'[\s\S]*?message: expr\("((?:[^"\\]|\\.)*)"\)/),
  gmail_subject: '=' + sdkStr(/name: 'Notify Owner \(Gmail\)'[\s\S]*?subject: expr\("((?:[^"\\]|\\.)*)"\)/),
  system_prompt: systemPrompt,
  sender_workflow_id: TABLES.__sender_workflow_id,
  website_builder_workflow_id: TABLES.__website_builder_workflow_id,
  vault_writer_workflow_id: TABLES.__vault_writer_workflow_id,
  claude_system_expr: "={{ $('Compose System Prompt').first().json.system_prompt }}",
  vault_sources: VAULT
}, null, 2));
console.log('built', path.relative(ROOT, path.join(DIST, 'lead-intake.sdk.ts')), sdk.length, 'chars');
