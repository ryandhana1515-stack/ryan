#!/usr/bin/env node
// Generates the n8n Workflow-SDK source for "CEO Brain — CEO Orchestrator" (Agent #0).
// Two triggers into one chain:
//   POST /webhook/ceo-brain/event  {type, source, lead_id, task_id, summary, severity, correlation_id, payload, test_mode}
//   Schedule 7 * * * * (every hour)
// event/tick → read ceo_tasks + ceo_leads + ceo_agent_runs → Orchestrate (route event, open exception/approval tasks,
// compute the unresolved-issues list, render the Management view) → [event: audit + JSON response] → upsert new tasks →
// rewrite zaphiel/vault/00_CEO_Brain/Management view.md when it changed → email the owner on failures → log the run.
//
//   node workflows/ceo-orchestrator/build.js   -> dist/ceo-orchestrator.sdk.ts + dist/code-nodes/*.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const j = (v) => JSON.stringify(v);

const TABLES_JSON = JSON.parse(read('database/n8n-data-tables.json'));
const TABLES = TABLES_JSON.tables;
const GITHUB = TABLES_JSON.github;
const manifest = JSON.parse(read('agents/ceo-orchestrator/agent.json'));
const NOTIFY = manifest.notify_email;
const VAULT_VIEW = manifest.vault_view;

function inline(file) {
  return read(file).split('\n').filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*if \(typeof module/.test(l) && !/^\s*\/\//.test(l) && l.trim() !== '').join('\n');
}
const ocSrc = inline('agents/ceo-orchestrator/orchestrator.js');

const codeNormalize = `// Which trigger fired? A webhook item carries headers+body; the schedule item does not.
const inp = ($input.first() && $input.first().json) || {};
const isEvent = inp.headers !== undefined && inp.body !== undefined;
const body = (isEvent && inp.body && typeof inp.body === 'object') ? inp.body : {};
return [{ json: { mode: isEvent ? 'event' : 'tick', body, received_at: new Date().toISOString() } }];
`;

const codeOrchestrate = `${ocSrc}
// ---- n8n glue ----
const ctx = $('Normalize Event').first().json;
const tasks = $('Get Tasks').all().map((i) => i.json);
const leads = $('Get Leads').all().map((i) => i.json);
const runs = $('Get Agent Runs').all().map((i) => i.json);
const now = Date.now();
let ev = null, act = { tasks: [], notify: null, audit: null, decision: null };
if (ctx.mode === 'event') { ev = ocNormalizeEvent(ctx.body, now); act = ocEventActions(ev); }
const merged = tasks.filter((t) => t && t.task_id && !act.tasks.some((n) => n.task_id === t.task_id)).concat(act.tasks);
const comp = ocComputeIssues({ tasks: merged, leads, runs, now });
const view = ocRenderView(comp);
const finished = new Date().toISOString();
return [{ json: {
  mode: ctx.mode, event: ev, decision: act.decision, tasks: act.tasks, has_tasks: act.tasks.length > 0,
  notify: act.notify, has_notify: !!act.notify, audit: act.audit,
  issues: comp.issues, stats: comp.stats, view, vault_path: ${j(VAULT_VIEW)},
  commit: 'vault: management view (' + comp.stats.issues_total + ' unresolved, ' + comp.stats.issues_high + ' high)',
  response: { ok: true, version: OC_VERSION, mode: ctx.mode, event_id: ev ? ev.event_id : null, type: ev ? ev.type : 'tick', decision: act.decision, issues_total: comp.stats.issues_total, issues_high: comp.stats.issues_high },
  run_id: 'run_' + now.toString(36) + Math.floor(Math.random() * 0xffffff).toString(36), started_at: ctx.received_at, finished_at: finished,
  latency_ms: Math.max(0, new Date(finished).getTime() - new Date(ctx.received_at).getTime()), test_mode: !!(ev && ev.test_mode)
} }];
`;

const codeSplitTasks = `// One item per task the Orchestrator wants to open/reopen (only reached when has_tasks is true).
return $('Orchestrate').first().json.tasks.map((t) => ({ json: t }));
`;

const codePrepareView = `// Compare the vault note with the new view (ignoring the timestamp lines) so we only commit when something changed.
const o = $('Orchestrate').first().json;
const g = ($input.first() && $input.first().json) || {};
const exists = !!g.sha && !g.error;
let old = '';
if (exists && g.content) { try { old = Buffer.from(String(g.content).replace(/\\n/g, ''), 'base64').toString('utf8'); } catch (e) { old = ''; } }
const norm = (s) => String(s || '').split('\\n').filter((l) => !/^updated:/.test(l) && !/^# Management view/.test(l)).join('\\n').trim();
const changed = !exists || norm(old) !== norm(o.view);
return [{ json: { exists, changed, sha: g.sha || null } }];
`;

const col = (id, type) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type, canBeUsedToMatch: true });
const schemaFor = (cols) => cols.map(([id, type]) => col(id, type));
const table = (name) => ({ __rl: true, mode: 'id', value: TABLES[name].id, cachedResultName: name });
const taskCols = [['tenant_id','string'],['task_id','string'],['lead_id','string'],['task_type','string'],['title','string'],['description','string'],['due_at','string'],['status','string'],['assigned_to','string'],['requires_approval','boolean'],['approval_reason','string'],['payload_json','string'],['created_by','string'],['ts','string']];
const auditCols = [['tenant_id','string'],['entity_type','string'],['entity_id','string'],['action','string'],['old_value','string'],['new_value','string'],['actor','string'],['execution_id','string'],['reason','string'],['ts','string']];
const runCols = [['tenant_id','string'],['run_id','string'],['agent','string'],['agent_version','string'],['lead_id','string'],['workflow_id','string'],['execution_id','string'],['model','string'],['provider','string'],['input_ref','string'],['output_json','string'],['success','boolean'],['error','string'],['latency_ms','number'],['test_mode','boolean'],['started_at','string'],['finished_at','string']];
const O = "$('Orchestrate').first().json";
const gh = (name, params, position, onError) => `node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: ${j(name)}, executeOnce: true, onError: ${j(onError || 'continueRegularOutput')}, parameters: { authentication: 'oAuth2', resource: 'file', owner: { __rl: true, mode: 'name', value: ${j(GITHUB.owner)} }, repository: { __rl: true, mode: 'name', value: ${j(GITHUB.repo)} }, ${params} }, credentials: { githubOAuth2Api: { id: ${j(GITHUB.credential_id)}, name: ${j(GITHUB.credential_name)} } }, position: ${j(position)} },
  output: [{ content: 'IyBX', sha: 'x' }]
})`;
const getRows = (name, tableName, position) => `node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: ${j(name)}, executeOnce: true, alwaysOutputData: true, onError: 'continueRegularOutput', parameters: { resource: 'row', operation: 'get', dataTableId: ${j(table(tableName))}, matchType: 'anyCondition', filters: { conditions: [] }, returnAll: true }, position: ${j(position)} },
  output: [{ id: 1 }]
})`;
const boolIf = (name, left, position) => `ifElse({ version: 2.3, config: { name: ${j(name)}, parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'c', leftValue: expr(${j('{{ ' + left + ' }}')}), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: ${j(position)} } })`;

const sdk = `import { workflow, node, trigger, sticky, ifElse, expr } from '@n8n/workflow-sdk';

const eventHook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: { name: 'Event Webhook', parameters: { httpMethod: 'POST', path: 'ceo-brain/event', responseMode: 'responseNode', options: {} }, position: [0, 200] },
  output: [{ headers: {}, params: {}, query: {}, body: { type: 'website.build_failed', source: 'website-build-runner', lead_id: 'lead_x', task_id: 'task_x', summary: 'Lovable timed out', test_mode: true } }]
});

const hourly = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.4,
  config: { name: 'Every Hour', parameters: { rule: { interval: [{ field: 'cronExpression', expression: '7 * * * *' }] } }, position: [0, 420] },
  output: [{ timestamp: '2026-01-01T00:07:00.000Z' }]
});

const normalize = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Normalize Event', executeOnce: true, parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeNormalize)} }, position: [240, 300] },
  output: [{ mode: 'event', body: { type: 'website.build_failed' }, received_at: '2026-01-01T00:00:00.000Z' }]
});

const getTasks = ${getRows('Get Tasks', 'ceo_tasks', [460, 300])};
const getLeads = ${getRows('Get Leads', 'ceo_leads', [680, 300])};
const getRuns = ${getRows('Get Agent Runs', 'ceo_agent_runs', [900, 300])};

const orchestrate = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Orchestrate', executeOnce: true, parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeOrchestrate)} }, position: [1120, 300] },
  output: [{ mode: 'event', event: { type: 'website.build_failed' }, decision: { agent: 'human', action: 'exception_task' }, tasks: [], has_tasks: false, notify: null, has_notify: false, audit: { action: 'event_website_build_failed' }, issues: [], stats: { issues_total: 0, issues_high: 0 }, view: '# Management view', vault_path: ${j(VAULT_VIEW)}, commit: 'vault: management view', response: { ok: true }, run_id: 'run_x', started_at: '2026-01-01T00:00:00.000Z', finished_at: '2026-01-01T00:00:01.000Z', latency_ms: 1000, test_mode: false }]
});

const isEvent = ifElse({ version: 2.3, config: { name: 'Event Mode?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'e', leftValue: expr("{{ ${O}.mode }}"), rightValue: 'event', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } }, position: [1340, 300] } });

const auditEvent = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Audit Event',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'insert', dataTableId: ${j(table('ceo_audit_logs'))}, columns: { mappingMode: 'defineBelow', value: {
      tenant_id: expr("{{ ${O}.audit.tenant_id }}"), entity_type: expr("{{ ${O}.audit.entity_type }}"), entity_id: expr("{{ ${O}.audit.entity_id }}"), action: expr("{{ ${O}.audit.action }}"), old_value: '', new_value: expr("{{ ${O}.audit.new_value }}"), actor: 'agent:ceo-orchestrator', execution_id: expr("{{ $execution.id }}"), reason: expr("{{ ${O}.audit.reason }}"), ts: expr("{{ ${O}.audit.ts }}")
    }, schema: ${j(schemaFor(auditCols))} } },
    position: [1560, 200]
  },
  output: [{ id: 1 }]
});

const respondEvent = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: { name: 'Respond Event', parameters: { respondWith: 'json', responseBody: expr("{{ JSON.stringify(${O}.response) }}"), options: { responseCode: 200 } }, position: [1780, 200] },
  output: [{ ok: true }]
});

const hasTasks = ${boolIf('Has Tasks?', O + '.has_tasks', [2000, 300])};

const splitTasks = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Split Tasks', executeOnce: true, parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeSplitTasks)} }, position: [2220, 200] },
  output: [{ task_id: 'task_exc_x', task_type: 'exception', status: 'open' }]
});

const upsertTask = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Upsert Task',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row', operation: 'upsert', dataTableId: ${j(table('ceo_tasks'))}, matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'task_id', condition: 'eq', keyValue: expr('{{ $json.task_id }}') }] },
      columns: { mappingMode: 'defineBelow', value: {
        tenant_id: expr('{{ $json.tenant_id }}'), task_id: expr('{{ $json.task_id }}'), lead_id: expr('{{ $json.lead_id }}'), task_type: expr('{{ $json.task_type }}'), title: expr('{{ $json.title }}'), description: expr('{{ $json.description }}'), due_at: expr('{{ $json.due_at }}'), status: expr('{{ $json.status }}'), assigned_to: expr('{{ $json.assigned_to }}'), requires_approval: expr('{{ $json.requires_approval }}'), approval_reason: expr('{{ $json.approval_reason }}'), payload_json: expr('{{ $json.payload_json }}'), created_by: expr('{{ $json.created_by }}'), ts: expr('{{ $json.ts }}')
      }, matchingColumns: [], schema: ${j(schemaFor(taskCols))} }
    },
    position: [2440, 200]
  },
  output: [{ id: 1 }]
});

const getView = ${gh('Get Management View', `operation: 'get', filePath: ${j(VAULT_VIEW)}, asBinaryProperty: false, additionalParameters: {}`, [2660, 300])};

const prepareView = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Prepare View Write', executeOnce: true, parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codePrepareView)} }, position: [2880, 300] },
  output: [{ exists: true, changed: true, sha: 'x' }]
});

const viewChanged = ${boolIf('View Changed?', '$json.changed', [3100, 300])};
const noteExists = ${boolIf('Note Exists?', "$('Prepare View Write').first().json.exists", [3320, 200])};

const editView = ${gh('Update Management View', `operation: 'edit', filePath: ${j(VAULT_VIEW)}, binaryData: false, fileContent: expr("{{ ${O}.view }}"), commitMessage: expr("{{ ${O}.commit }}"), additionalParameters: { committer: { name: 'Zaphiel (n8n)', email: ${j(NOTIFY)} } }`, [3540, 100])};
const createView = ${gh('Create Management View', `operation: 'create', filePath: ${j(VAULT_VIEW)}, binaryData: false, fileContent: expr("{{ ${O}.view }}"), commitMessage: expr("{{ ${O}.commit }}"), additionalParameters: { committer: { name: 'Zaphiel (n8n)', email: ${j(NOTIFY)} } }`, [3540, 300])};

const shouldNotify = ${boolIf('Notify Owner?', O + '.has_notify', [3760, 300])};

const emailOwner = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Email Owner (exception)',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: { resource: 'message', operation: 'send', sendTo: ${j(NOTIFY)}, subject: expr("{{ ${O}.notify.subject }}"), emailType: 'html', message: expr("{{ ${O}.notify.html }}"), options: { appendAttribution: false, senderName: 'CEO Brain' } },
    position: [3980, 200]
  },
  output: [{ id: 'gmail_x' }]
});

const logRun = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Orchestrator Run',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'insert', dataTableId: ${j(table('ceo_agent_runs'))}, columns: { mappingMode: 'defineBelow', value: {
      tenant_id: 'fusiontech', run_id: expr("{{ ${O}.run_id }}"), agent: 'ceo-orchestrator', agent_version: ${j(manifest.version)}, lead_id: expr("{{ (${O}.event && ${O}.event.lead_id) || '' }}"), workflow_id: expr("{{ $workflow.id }}"), execution_id: expr("{{ $execution.id }}"), model: 'rules', provider: 'rules', input_ref: expr("{{ ${O}.event ? 'event:' + ${O}.event.type + ':' + ${O}.event.event_id : 'tick' }}"), output_json: expr("{{ JSON.stringify({ decision: ${O}.decision, issues_total: ${O}.stats.issues_total, issues_high: ${O}.stats.issues_high, tasks: ${O}.tasks.map(t => t.task_id), notified: ${O}.has_notify, view_changed: $('Prepare View Write').first().json.changed }) }}"), success: true, error: 'baseline', latency_ms: expr("{{ ${O}.latency_ms }}"), test_mode: expr("{{ ${O}.test_mode }}"), started_at: expr("{{ ${O}.started_at }}"), finished_at: expr("{{ ${O}.finished_at }}")
    }, schema: ${j(schemaFor(runCols))} } },
    position: [4200, 300]
  },
  output: [{ id: 1 }]
});

const note = sticky(${j('## CEO Brain — CEO Orchestrator (Agent #0)\nPOST /webhook/ceo-brain/event {type, source, lead_id, task_id, summary, severity, correlation_id, payload, test_mode} — or every hour.\n\nRoutes the event by the routing table (agents/ceo-orchestrator/orchestrator.js), opens exception / review tasks for humans, computes the unresolved-issues list from ceo_tasks + ceo_leads + ceo_agent_runs, rewrites zaphiel/vault/00_CEO_Brain/Management view.md when it changed, emails Ryan on failures (never in test_mode), logs audit + run. Never contacts a customer, never moves money. The inbox to act on it: /webhook/ceo-brain/inbox.\n\nSource of truth: ryan/ceo-brain/workflows/ceo-orchestrator/build.js. Do not hand-edit Code nodes.')}, [eventHook, hourly, normalize, getTasks], { color: 4 });

export default workflow('ceo-brain-ceo-orchestrator', 'CEO Brain — CEO Orchestrator')
  .add(eventHook)
  .to(normalize)
  .add(hourly)
  .to(normalize)
  .add(normalize)
  .to(getTasks)
  .to(getLeads)
  .to(getRuns)
  .to(orchestrate)
  .to(isEvent
    .onTrue(auditEvent.to(respondEvent).to(hasTasks))
    .onFalse(hasTasks))
  .add(hasTasks
    .onTrue(splitTasks.to(upsertTask).to(getView))
    .onFalse(getView))
  .add(getView)
  .to(prepareView)
  .to(viewChanged
    .onTrue(noteExists
      .onTrue(editView.to(shouldNotify))
      .onFalse(createView.to(shouldNotify)))
    .onFalse(shouldNotify))
  .add(shouldNotify
    .onTrue(emailOwner.to(logRun))
    .onFalse(logRun))
  .add(note);
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'ceo-orchestrator.sdk.ts'), sdk);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'normalize-event.js'), codeNormalize);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'orchestrate.js'), codeOrchestrate);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'split-tasks.js'), codeSplitTasks);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'prepare-view-write.js'), codePrepareView);
console.log('built', path.relative(ROOT, path.join(DIST, 'ceo-orchestrator.sdk.ts')), sdk.length, 'chars');
