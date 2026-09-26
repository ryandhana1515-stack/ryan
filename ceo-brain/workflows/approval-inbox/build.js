#!/usr/bin/env node
// Generates the n8n Workflow-SDK source for "CEO Brain — Approval Inbox" (the human task inbox).
//   GET  /webhook/ceo-brain/inbox  → reads ceo_tasks + ceo_leads + ceo_agent_runs + pending draft replies →
//                                    renders the inbox page (approvals with Approve/Reject links through the
//                                    existing Approve Reply gate, exceptions to recover, leads needing a human, …)
//   POST /webhook/ceo-brain/inbox  {pin, action close|recover|reopen|cancel, task_id, note}
//                                  → PIN check (Inbox Config node) → update the task status → audit → JSON
//
//   node workflows/approval-inbox/build.js   -> dist/approval-inbox.sdk.ts + dist/code-nodes/*.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const j = (v) => JSON.stringify(v);

const TABLES = JSON.parse(read('database/n8n-data-tables.json')).tables;
const manifest = JSON.parse(read('agents/ceo-orchestrator/agent.json'));
const APPROVE_URL = manifest.approve_url;
const INBOX_URL = manifest.inbox_url;

function inline(file) {
  return read(file).split('\n').filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*if \(typeof module/.test(l) && !/^\s*\/\//.test(l) && l.trim() !== '').join('\n');
}
const ocSrc = inline('agents/ceo-orchestrator/orchestrator.js');
// Only the helpers a node needs (top-level `var`/`function` chunks by name), so the Code node stays small.
function pick(src, names) {
  const chunks = []; let cur = null;
  src.split('\n').forEach((l) => { const m = /^(?:var|function)\s+([A-Za-z0-9_]+)/.exec(l); if (m) { cur = { name: m[1], lines: [] }; chunks.push(cur); } if (cur) cur.lines.push(l); });
  return chunks.filter((c) => names.includes(c.name)).map((c) => c.lines.join('\n')).join('\n');
}
const ocValidateSrc = pick(ocSrc, ['ocStr', 'ocInboxAction']);

const codeRender = `${ocSrc}
// ---- n8n glue ----
const tasks = $('Get Tasks').all().map((i) => i.json);
const leads = $('Get Leads').all().map((i) => i.json);
const runs = $('Get Agent Runs').all().map((i) => i.json);
const msgs = $('Get Pending Drafts').all().map((i) => i.json).filter((m) => m && m.message_id && m.lead_id);
msgs.sort((a, b) => ocTime(a.ts) - ocTime(b.ts));
const drafts = {};
msgs.forEach((m) => { drafts[m.lead_id] = m.message_id; });
const comp = ocComputeIssues({ tasks, leads, runs, now: Date.now() });
const html = ocInboxHtml({ issues: comp.issues, stats: comp.stats, drafts, approve_url: ${j(APPROVE_URL)}, action_url: ${j(INBOX_URL)} });
return [{ json: { html, issues_total: comp.stats.issues_total, drafts: Object.keys(drafts).length } }];
`;

const codeValidate = `${ocValidateSrc}
// ---- n8n glue ----
const cfg = $('Inbox Config').first().json;
const inp = ($input.first() && $input.first().json) || {};
const body = (inp.body && typeof inp.body === 'object') ? inp.body : {};
const r = ocInboxAction(body, cfg.pin);
r.execution_id = $execution.id;
return [{ json: r }];
`;

const col = (id, type) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type, canBeUsedToMatch: true });
const schemaFor = (cols) => cols.map(([id, type]) => col(id, type));
const table = (name) => ({ __rl: true, mode: 'id', value: TABLES[name].id, cachedResultName: name });
const taskCols = [['tenant_id','string'],['task_id','string'],['lead_id','string'],['task_type','string'],['title','string'],['description','string'],['due_at','string'],['status','string'],['assigned_to','string'],['requires_approval','boolean'],['approval_reason','string'],['payload_json','string'],['created_by','string'],['ts','string']];
const auditCols = [['tenant_id','string'],['entity_type','string'],['entity_id','string'],['action','string'],['old_value','string'],['new_value','string'],['actor','string'],['execution_id','string'],['reason','string'],['ts','string']];
const V = "$('Validate Action').first().json";
const getRows = (name, tableName, position, filters) => `node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: ${j(name)}, executeOnce: true, alwaysOutputData: true, onError: 'continueRegularOutput', parameters: { resource: 'row', operation: 'get', dataTableId: ${j(table(tableName))}, matchType: 'allConditions', filters: { conditions: ${filters || '[]'} }, returnAll: true }, position: ${j(position)} },
  output: [{ id: 1 }]
})`;

const sdk = `import { workflow, node, trigger, sticky, ifElse, expr } from '@n8n/workflow-sdk';

const page = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: { name: 'Inbox Page', parameters: { httpMethod: 'GET', path: 'ceo-brain/inbox', responseMode: 'responseNode', options: {} }, position: [0, 200] },
  output: [{ headers: {}, params: {}, query: {}, body: {} }]
});

const getTasks = ${getRows('Get Tasks', 'ceo_tasks', [240, 200])};
const getLeads = ${getRows('Get Leads', 'ceo_leads', [460, 200])};
const getRuns = ${getRows('Get Agent Runs', 'ceo_agent_runs', [680, 200])};
const getDrafts = ${getRows('Get Pending Drafts', 'ceo_messages', [900, 200], "[{ keyName: 'status', condition: 'eq', keyValue: 'draft_pending_approval' }]")};

const render = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Render Inbox', executeOnce: true, parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeRender)} }, position: [1120, 200] },
  output: [{ html: '<!doctype html>', issues_total: 0, drafts: 0 }]
});

const serve = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Serve Inbox', parameters: { respondWith: 'text', responseBody: expr('{{ $json.html }}'), options: { responseCode: 200, responseHeaders: { entries: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }] } } }, position: [1340, 200] },
  output: [{ ok: true }]
});

const action = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: { name: 'Inbox Action', parameters: { httpMethod: 'POST', path: 'ceo-brain/inbox', responseMode: 'responseNode', options: {} }, position: [0, 520] },
  output: [{ headers: {}, params: {}, query: {}, body: { pin: 'x', action: 'close', task_id: 'task_x' } }]
});

const config = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: { name: 'Inbox Config', parameters: { mode: 'manual', includeOtherFields: true, assignments: { assignments: [{ id: 'pin', name: 'pin', value: 'fusiontech-trainer', type: 'string' }] } }, position: [240, 520] },
  output: [{ pin: 'x' }]
});

const validate = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Validate Action', executeOnce: true, parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeValidate)} }, position: [460, 520] },
  output: [{ ok: true, action: 'close', task_id: 'task_x', status: 'done', note: '', ts: '2026-01-01T00:00:00.000Z', execution_id: '1' }]
});

const isOk = ifElse({ version: 2.3, config: { name: 'Action OK?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'ok', leftValue: expr('{{ $json.ok }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [680, 520] } });

const updateTask = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Update Task Status',
    executeOnce: true, alwaysOutputData: true, onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'update', dataTableId: ${j(table('ceo_tasks'))}, matchType: 'allConditions', filters: { conditions: [{ keyName: 'task_id', condition: 'eq', keyValue: expr("{{ ${V}.task_id }}") }] }, columns: { mappingMode: 'defineBelow', value: { status: expr("{{ ${V}.status }}") }, schema: ${j(schemaFor(taskCols))} } },
    position: [900, 420]
  },
  output: [{ id: 1, task_id: 'task_x', status: 'done' }]
});

const auditAction = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Audit Inbox Action',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'insert', dataTableId: ${j(table('ceo_audit_logs'))}, columns: { mappingMode: 'defineBelow', value: {
      tenant_id: expr("{{ $('Update Task Status').first().json.tenant_id || 'fusiontech' }}"), entity_type: 'task', entity_id: expr("{{ ${V}.task_id }}"), action: expr("{{ 'inbox_' + ${V}.action }}"), old_value: '', new_value: expr("{{ ${V}.status }}"), actor: 'human:inbox', execution_id: expr("{{ $execution.id }}"), reason: expr("{{ ${V}.note || ('inbox action ' + ${V}.action) }}"), ts: expr("{{ ${V}.ts }}")
    }, schema: ${j(schemaFor(auditCols))} } },
    position: [1120, 420]
  },
  output: [{ id: 1 }]
});

const respondOk = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond OK', parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify({ ok: true, action: ${V}.action, task_id: ${V}.task_id, status: ${V}.status, matched: !!$('Update Task Status').first().json.id }) }}"), options: { responseCode: 200 } }, position: [1340, 420] },
  output: [{ ok: true }]
});

const respondError = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond Error', parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify({ ok: false, error: $json.error }) }}"), options: { responseCode: expr('{{ $json.http || 400 }}') } }, position: [900, 640] },
  output: [{ ok: false, error: 'wrong_pin' }]
});

const note = sticky(${j('## CEO Brain — Approval Inbox (human task inbox)\nGET /webhook/ceo-brain/inbox — one page with everything waiting for a human: approvals (Approve & send / Reject go through the existing Approve Reply gate), exceptions to recover, leads needing a human, overdue follow-ups, stale leads.\nPOST /webhook/ceo-brain/inbox {pin, action close|recover|reopen|cancel, task_id} — closes/recovers a task with an audit row. The PIN lives ONLY in the "Inbox Config" node (change it there; same PIN as the Trainer Config by default).\n\nSource of truth: ryan/ceo-brain/workflows/approval-inbox/build.js (issue logic shared with the CEO Orchestrator). Do not hand-edit Code nodes.')}, [page, getTasks, action, config], { color: 4 });

export default workflow('ceo-brain-approval-inbox', 'CEO Brain — Approval Inbox')
  .add(page)
  .to(getTasks)
  .to(getLeads)
  .to(getRuns)
  .to(getDrafts)
  .to(render)
  .to(serve)
  .add(action)
  .to(config)
  .to(validate)
  .to(isOk
    .onTrue(updateTask.to(auditAction).to(respondOk))
    .onFalse(respondError))
  .add(note);
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'approval-inbox.sdk.ts'), sdk);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'render-inbox.js'), codeRender);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'validate-action.js'), codeValidate);
console.log('built', path.relative(ROOT, path.join(DIST, 'approval-inbox.sdk.ts')), sdk.length, 'chars');
