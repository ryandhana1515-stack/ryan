#!/usr/bin/env node
// Generates the n8n Workflow-SDK source for "CEO Brain — Website Intelligence" (internal agent, ADR-3).
// Called by Lead Intake (same inputs the Website Builder takes). Plan queries → web search (Browserbase, n8n gateway
// credits) → identify the company → fetch the homepage + up to 3 pages → digest with a labelled fact ledger → role
// prompt live from the vault → Claude → finalize (deterministic fallback) → run + audit → hand off to the Website
// Builder with research_brief/research_json → tell the Orchestrator (website.research / website.info_needed).
// Never talks to the customer. Never blocks a mock-up (placeholders instead).
//
//   node workflows/website-intelligence/build.js   -> dist/website-intelligence.sdk.ts + dist/code-nodes/*.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const j = (v) => JSON.stringify(v);

const TABLES_JSON = JSON.parse(read('database/n8n-data-tables.json'));
const TABLES = TABLES_JSON.tables;
const GITHUB = TABLES_JSON.github;
const WF = TABLES_JSON.workflows || {};
const manifest = JSON.parse(read('agents/website-intelligence/agent.json'));
const research = require(path.join(ROOT, 'agents/website-intelligence/research.js'));
const NOTIFY = manifest.notify_email;
const BUILDER_ID = WF.website_builder || 'REPLACE_ME';
const EVENT_URL = 'https://ryan1515.app.n8n.cloud/webhook/ceo-brain/event';
const systemAddendum = read('prompts/website-intelligence.system.md').replace('{{BRIEF_KEYS}}', JSON.stringify(Object.fromEntries(research.WR_BRIEF_KEYS.map((k) => [k, research.WR_LIST_KEYS.includes(k) ? [] : (k === 'identity_confidence' ? 'high | medium | low' : '')])), null, 0));
const userPrompt = read('prompts/website-intelligence.user.md');

function inline(file) {
  return read(file).replace(/\/\/ ---- Node module wrapper[\s\S]*$/m, '').split('\n').filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*\/\//.test(l) && l.trim() !== '').join('\n');
}
const fullSrc = inline('agents/website-intelligence/research.js');
function pick(names) {
  const chunks = []; let cur = null;
  fullSrc.split('\n').forEach((l) => { const m = /^(?:var|function)\s+([A-Za-z0-9_]+)/.exec(l); if (m) { cur = { name: m[1], lines: [] }; chunks.push(cur); } if (cur) cur.lines.push(l); });
  const missing = names.filter((n) => !chunks.some((c) => c.name === n)); if (missing.length) throw new Error('pick: missing ' + missing.join(','));
  return chunks.filter((c) => names.includes(c.name)).map((c) => c.lines.join('\n')).join('\n');
}
const HELPERS = ['WR_VERSION', 'WR_SOCIAL_HOSTS', 'WR_DIRECTORY_HOSTS', 'wrStr', 'wrArr', 'wrHost', 'wrUrl', 'wrFindUrls', 'wrIsSocial', 'wrIsDirectory', 'wrTokens'];

const codePlan = `${pick(HELPERS.concat(['wrInput', 'wrQueries']))}
// ---- n8n glue: one item per search query; the normalized hand-off rides on every item ----
const inp = ($input.first() && $input.first().json) || {};
const input = wrInput(inp);
const queries = wrQueries(input);
const started_at = new Date().toISOString();
if (!queries.length) return [{ json: { query_key: 'none', query: '', input, started_at, no_company: true } }];
return queries.map((q) => ({ json: { query_key: q.key, query: q.query, input, started_at } }));
`;

const codeIdentify = `${pick(HELPERS.concat(['wrSearchItems', 'wrIdentify']))}
// ---- n8n glue: pair each search result item with its query, identify the company, choose the homepage ----
const plan = $('Plan Research').all().map((i) => i.json);
const input = plan[0].input;
const raw = $input.all();
const tagged = raw.map((it, i) => {
  let idx = i;
  try { const p = it.pairedItem; if (p !== undefined && p !== null) idx = Array.isArray(p) ? (p[0].item ?? i) : (typeof p === 'object' ? (p.item ?? i) : p); } catch (e) { idx = i; }
  const q = plan[Math.min(idx, plan.length - 1)] || {};
  const json = (it && it.json) || {};
  return { json: Object.assign({}, json, { query_key: json.query_key || q.query_key, __query: q.query }) };
});
const results = wrSearchItems(tagged);
const searchErrors = raw.filter((it) => it && it.json && it.json.error).length;
const identity = wrIdentify(input, results);
return [{ json: { input, identity, results, search_errors: searchErrors, search_items: raw.length, homepage_url: identity.website || '', started_at: plan[0].started_at } }];
`;

const codePickPages = `${pick(HELPERS.concat(['WR_PAGE_RE', 'WR_MAX_PAGE_TEXT', 'wrHtmlToText', 'wrPickPages', 'wrFetchedPage']))}
// ---- n8n glue: read the homepage, pick up to 3 internal pages worth fetching (Rule 5) ----
const id = $('Identify Company').first().json;
const page = wrFetchedPage($input.first(), id.homepage_url);
let urls = [];
if (page.ok) { const parsed = wrHtmlToText(page.html, id.homepage_url); urls = wrPickPages(parsed.links, 3); }
if (!urls.length) return [{ json: { url: '', skip: true, homepage_ok: page.ok } }];
return urls.map((u) => ({ json: { url: u, skip: false, homepage_ok: page.ok } }));
`;

const codeDigest = `${pick(HELPERS.concat(['WR_MAX_DIGEST', 'WR_MAX_PAGE_TEXT', 'WR_PAGE_RE', 'wrHtmlToText', 'wrFetchedPage', 'wrDigest']))}
// ---- n8n glue: assemble every page + result into the labelled digest ----
const id = $('Identify Company').first().json;
const input = id.input;
const pages = [];
const home = wrFetchedPage($('Fetch Homepage').first(), id.homepage_url);
if (id.homepage_url) pages.push(home);
const picks = $('Pick Pages').all().map((i) => i.json);
$input.all().forEach((it, i) => { const p = picks[i] || {}; if (!p.url || p.skip) return; pages.push(wrFetchedPage(it, p.url)); });
const digest = wrDigest({ input, identity: id.identity, results: id.results, pages });
digest.search_items = id.search_items; digest.search_errors = id.search_errors;
return [{ json: { input, identity: id.identity, digest, started_at: id.started_at } }];
`;

const codeCompose = `// Composes the Website Intelligence prompts AT RUN TIME: Ryan's role prompt (live from the vault) + the runtime addendum + the digest.
const ADDENDUM = ${j(systemAddendum)};
const USER_PROMPT_TEMPLATE = ${j(userPrompt)};
function vaultText(nodeName) {
  try { const j = $(nodeName).first().json || {}; if (j && j.content && !j.error) { const txt = Buffer.from(String(j.content).replace(/\\n/g, ''), 'base64').toString('utf8'); return txt.replace(/^---[\\s\\S]*?---\\n/, '').replace(/^>.*$/m, '').trim() || null; } } catch (e) {}
  return null;
}
const d = $('Digest Research').first().json;
const input = d.input;
const role = vaultText('Load Role Prompt');
const system = (role ? role + '\\n\\n' : 'You are the Website Intelligence & Conversion Strategist of FusionTech AI, an internal agent that never talks to the customer.\\n\\n') + ADDENDUM;
const convoText = (input.conversation || []).slice(-20).map((m) => '- [' + (m.role || 'customer') + (m.ts ? ' ' + m.ts : '') + '] ' + String(m.content || '').slice(0, 800)).join('\\n') || '(none)';
const vars = { tenant_id: input.tenant_id, lead_id: input.lead_id, now: new Date().toISOString(), contact_name: input.contact_name || 'not given', company_name: input.company_name || 'not given', industry: input.industry || 'not given', location: input.location || 'Singapore', website: input.website || 'none mentioned', email: input.email || 'not given', phone: input.phone || 'not given', channel: input.channel, sales_summary: input.sales_summary || '(none)', extracted_json: JSON.stringify(input.extracted || {}), conversation: convoText, message: input.message || '(no message)', digest: d.digest.digest_text };
const user_prompt = USER_PROMPT_TEMPLATE.replace(/\\{\\{(\\w+)\\}\\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
return [{ json: { system_prompt: system, user_prompt, role_source: role ? 'vault' : 'compiled_fallback', config: { model: ${j(manifest.model)}, agent: ${j(manifest.id)}, agent_version: ${j(manifest.version)} } } }];
`;

const codeFinalize = `${pick(HELPERS.concat(['WR_INSTRUCTION', 'WR_VARIATIONS', 'WR_BRIEF_KEYS', 'WR_LIST_KEYS', 'wrConversionFor', 'wrFallbackBrief', 'wrCoerceBrief', 'wrParseJson', 'wrBriefText', 'wrFinalize']))}
// ---- n8n glue ----
const d = $('Digest Research').first().json;
const pre = $('Compose Research Prompt').first().json;
const input = d.input;
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
const fin = wrFinalize({ raw_text: rawText, error, input, digest: d.digest });
const now = new Date().toISOString();
const started = d.started_at || now;
const researchSlim = { version: d.digest.version, identity: d.identity, facts: d.digest.facts, site: { website: d.digest.site.website, pages_read: d.digest.site.pages_read, pages_failed: d.digest.site.pages_failed, title: d.digest.site.title, description: d.digest.site.description, signals: d.digest.site.signals }, competitors: d.digest.competitors, reviews: d.digest.reviews, unknown: d.digest.unknown, search_items: d.digest.search_items, search_errors: d.digest.search_errors };
const eventType = fin.status !== 'READY_FOR_WEBSITE_CREATOR' || fin.needs_john ? 'website.info_needed' : 'website.research';
return [{ json: {
  input, status: fin.status, ready: fin.status === 'READY_FOR_WEBSITE_CREATOR', needs_john: fin.needs_john, questions_for_john: fin.questions_for_john,
  brief: fin.brief, brief_text: fin.brief_text, research_json: JSON.stringify(researchSlim), identity_confidence: fin.identity_confidence,
  provider: fin.provider, model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason, role_source: pre.role_source, config: pre.config,
  event: { type: eventType, source: 'website-intelligence', tenant_id: input.tenant_id, lead_id: input.lead_id, entity_type: 'lead', entity_id: input.lead_id, severity: eventType === 'website.info_needed' ? 'medium' : 'info', summary: (fin.status === 'READY_FOR_WEBSITE_CREATOR' ? 'Research brief ready for ' + (input.company_name || input.lead_id) + ' (' + fin.identity_confidence + ' identity)' : 'Website Intelligence needs information for ' + input.lead_id) + (fin.questions_for_john.length ? ' — questions for John: ' + fin.questions_for_john.join(' | ') : ''), payload: { questions_for_john: fin.questions_for_john, identity_confidence: fin.identity_confidence, website: d.identity.website, pages_read: researchSlim.site.pages_read, provider: fin.provider }, test_mode: input.test_mode, correlation_id: 'lead:' + input.lead_id },
  run_id: 'run_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36), started_at: started, finished_at: now, latency_ms: Math.max(0, new Date(now).getTime() - new Date(started).getTime()),
  execution_id: String($execution.id), workflow_id: String($workflow.id)
} }];
`;

const col = (id, type) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type, canBeUsedToMatch: true });
const schemaFor = (cols) => cols.map(([id, type]) => col(id, type));
const table = (name) => ({ __rl: true, mode: 'id', value: TABLES[name].id, cachedResultName: name });
const runCols = [['tenant_id','string'],['run_id','string'],['agent','string'],['agent_version','string'],['lead_id','string'],['workflow_id','string'],['execution_id','string'],['model','string'],['provider','string'],['input_ref','string'],['output_json','string'],['success','boolean'],['error','string'],['latency_ms','number'],['test_mode','boolean'],['started_at','string'],['finished_at','string']];
const auditCols = [['tenant_id','string'],['entity_type','string'],['entity_id','string'],['action','string'],['old_value','string'],['new_value','string'],['actor','string'],['execution_id','string'],['reason','string'],['ts','string']];
const inputs = [['tenant_id','string'],['lead_id','string'],['contact_name','string'],['company_name','string'],['industry','string'],['email','string'],['phone','string'],['channel','string'],['message','string'],['conversation_json','string'],['sales_summary','string'],['extracted_json','string'],['test_mode','boolean'],['notify_email','string'],['source_execution_id','string']];
const builderInputs = inputs.concat([['research_brief','string'],['research_json','string']]);
const F = "$('Finalize Brief').first().json";
const passthrough = Object.fromEntries(inputs.map(([name, type]) => [name, `expr("{{ ${F}.input.${name === 'conversation_json' ? 'conversation' : name === 'extracted_json' ? 'extracted' : name}${name === 'conversation_json' || name === 'extracted_json' ? '' : ''} }}")`]));
passthrough.conversation_json = `expr("{{ JSON.stringify(${F}.input.conversation ?? []) }}")`;
passthrough.extracted_json = `expr("{{ JSON.stringify(${F}.input.extracted ?? {}) }}")`;
passthrough.research_brief = `expr("{{ ${F}.brief_text }}")`;
passthrough.research_json = `expr("{{ ${F}.research_json }}")`;
const passthroughSrc = '{ ' + Object.keys(passthrough).map((k) => `${k}: ${passthrough[k]}`).join(', ') + ' }';

const sdk = `import { workflow, node, trigger, sticky, expr, ifElse } from '@n8n/workflow-sdk';

const whenCalled = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.2,
  config: { name: 'When Called by Lead Intake', parameters: { inputSource: 'workflowInputs', workflowInputs: { values: ${j(inputs.map(([name, type]) => ({ name, type })))} } }, position: [0, 300] },
  output: [{ tenant_id: 'fusiontech', lead_id: 'lead_x', contact_name: 'Marcus Lim', company_name: 'Prestige Motors', industry: 'car dealership', email: 'm@example.com', phone: '', channel: 'whatsapp', message: 'I want a mock-up for prestigemotors.sg', conversation_json: '[]', sales_summary: 'Wants test-drive bookings', extracted_json: '{}', test_mode: true, notify_email: 'owner@example.com', source_execution_id: '1' }]
});

const plan = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Plan Research', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codePlan)} }, position: [220, 300] },
  output: [{ query_key: 'name', query: 'Prestige Motors', input: { company_name: 'Prestige Motors', lead_id: 'lead_x', website: 'https://prestigemotors.sg', location: 'Singapore', industry: 'car dealership', test_mode: true }, started_at: '2026-01-01T00:00:00.000Z' }]
});

const search = node({
  type: 'n8n-nodes-browserbase.browserbase',
  version: 3,
  config: { name: 'Web Search', onError: 'continueRegularOutput', alwaysOutputData: true, parameters: { resource: 'search', operation: 'search', query: expr('{{ $json.query }}'), numResults: 8 }, position: [440, 300] },
  output: [{ results: [{ title: 'Prestige Motors', url: 'https://prestigemotors.sg', description: 'BMW showroom' }] }]
});

const identify = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Identify Company', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeIdentify)} }, position: [660, 300] },
  output: [{ input: { company_name: 'Prestige Motors', lead_id: 'lead_x' }, identity: { website: 'https://prestigemotors.sg', host: 'prestigemotors.sg', confidence: 'high', reason: 'given', candidates: [], socials: [] }, results: [], search_errors: 0, search_items: 6, homepage_url: 'https://prestigemotors.sg', started_at: '2026-01-01T00:00:00.000Z' }]
});

const fetchHome = node({
  type: 'n8n-nodes-browserbase.browserbase',
  version: 3,
  config: { name: 'Fetch Homepage', onError: 'continueRegularOutput', alwaysOutputData: true, parameters: { resource: 'fetch', operation: 'fetch', fetchUrl: expr('{{ $json.homepage_url }}'), fetchOptions: { allowRedirects: true } }, position: [880, 300] },
  output: [{ html: '<html><title>Prestige Motors</title></html>', status: 200 }]
});

const pickPages = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Pick Pages', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codePickPages)} }, position: [1100, 300] },
  output: [{ url: 'https://prestigemotors.sg/about', skip: false, homepage_ok: true }]
});

const fetchPages = node({
  type: 'n8n-nodes-browserbase.browserbase',
  version: 3,
  config: { name: 'Fetch Pages', onError: 'continueRegularOutput', alwaysOutputData: true, parameters: { resource: 'fetch', operation: 'fetch', fetchUrl: expr('{{ $json.url }}'), fetchOptions: { allowRedirects: true } }, position: [1320, 300] },
  output: [{ html: '<html><title>About</title></html>', status: 200 }]
});

const digest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Digest Research', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeDigest)} }, position: [1540, 300] },
  output: [{ input: { company_name: 'Prestige Motors', lead_id: 'lead_x', test_mode: true }, identity: { website: 'https://prestigemotors.sg', confidence: 'high', reason: 'given' }, digest: { version: 'website-intelligence-1.0.0', facts: [], site: { pages_read: [], pages_failed: [], signals: {} }, competitors: [], reviews: [], unknown: [], digest_text: 'IDENTITY: …', search_items: 6, search_errors: 0 }, started_at: '2026-01-01T00:00:00.000Z' }]
});

const loadRole = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: { name: 'Load Role Prompt', executeOnce: true, onError: 'continueRegularOutput', parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: { __rl: true, mode: 'name', value: ${j(GITHUB.owner)} }, repository: { __rl: true, mode: 'name', value: ${j(GITHUB.repo)} }, filePath: ${j(manifest.vault_sources.role_prompt)}, asBinaryProperty: false, additionalParameters: {} }, credentials: { githubOAuth2Api: { id: ${j(GITHUB.credential_id)}, name: ${j(GITHUB.credential_name)} } }, position: [1760, 300] },
  output: [{ content: 'IyBX', sha: 'x' }]
});

const compose = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Compose Research Prompt', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeCompose)} }, position: [1980, 300] },
  output: [{ system_prompt: 'FUSION AI — WEBSITE INTELLIGENCE AGENT …', user_prompt: 'Prepare the WEBSITE_CREATOR_BRIEF …', role_source: 'vault', config: { model: ${j(manifest.model)}, agent: 'website-intelligence', agent_version: '1.0.0' } }]
});

const claude = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'Website Intelligence (Claude)',
    onError: 'continueErrorOutput',
    parameters: { resource: 'text', operation: 'message', modelId: { __rl: true, mode: 'list', value: ${j(manifest.model)}, cachedResultName: ${j(manifest.model_display_name)} }, messages: { values: [{ role: 'user', content: expr("{{ $('Compose Research Prompt').item.json.user_prompt }}") }] }, simplify: true, options: { system: expr("{{ $('Compose Research Prompt').first().json.system_prompt }}"), maxTokens: ${manifest.max_tokens}, temperature: ${manifest.temperature}, includeMergedResponse: true } },
    position: [2200, 300]
  },
  output: [{ text: '{"company_name":"Prestige Motors"}', model: ${j(manifest.model)} }]
});

const finalize = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Finalize Brief', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeFinalize)} }, position: [2480, 300] },
  output: [{ input: { tenant_id: 'fusiontech', lead_id: 'lead_x', contact_name: 'Marcus Lim', company_name: 'Prestige Motors', industry: 'car dealership', email: '', phone: '', channel: 'whatsapp', message: 'x', conversation: [], sales_summary: '', extracted: {}, test_mode: true, notify_email: 'owner@example.com', source_execution_id: '1' }, status: 'READY_FOR_WEBSITE_CREATOR', ready: true, needs_john: false, questions_for_john: [], brief: { company_name: 'Prestige Motors', primary_conversion: 'BOOK TEST DRIVE' }, brief_text: 'STATUS: READY_FOR_WEBSITE_CREATOR …', research_json: '{}', identity_confidence: 'high', provider: 'anthropic', model: ${j(manifest.model)}, fallback_used: false, fallback_reason: null, role_source: 'vault', config: { agent: 'website-intelligence', agent_version: '1.0.0', model: ${j(manifest.model)} }, event: { type: 'website.research', source: 'website-intelligence', lead_id: 'lead_x', summary: 'Research brief ready', payload: {}, test_mode: true }, run_id: 'run_x', started_at: '2026-01-01T00:00:00.000Z', finished_at: '2026-01-01T00:00:09.000Z', latency_ms: 9000, execution_id: '1', workflow_id: 'w' }]
});

const logRun = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Agent Run',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: { resource: 'row', operation: 'insert', dataTableId: ${j(table('ceo_agent_runs'))}, columns: { mappingMode: 'defineBelow', value: {
      tenant_id: expr("{{ ${F}.input.tenant_id }}"), run_id: expr("{{ ${F}.run_id }}"), agent: 'website-intelligence', agent_version: ${j(manifest.version)}, lead_id: expr("{{ ${F}.input.lead_id }}"), workflow_id: expr("{{ $workflow.id }}"), execution_id: expr("{{ $execution.id }}"), model: expr("{{ ${F}.model }}"), provider: expr("{{ ${F}.provider }}"), input_ref: expr("{{ 'lead_intake_execution:' + (${F}.input.source_execution_id ?? '') }}"), output_json: expr("{{ JSON.stringify({ status: ${F}.status, identity_confidence: ${F}.identity_confidence, questions_for_john: ${F}.questions_for_john, primary_conversion: ${F}.brief.primary_conversion, role_source: ${F}.role_source, research: JSON.parse(${F}.research_json) }) }}"), success: true, error: expr("{{ ${F}.fallback_used ? String(${F}.fallback_reason) : '' }}"), latency_ms: expr("{{ ${F}.latency_ms }}"), test_mode: expr("{{ ${F}.input.test_mode }}"), started_at: expr("{{ ${F}.started_at }}"), finished_at: expr("{{ ${F}.finished_at }}")
    }, schema: ${j(schemaFor(runCols))} } },
    position: [2700, 300]
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
      tenant_id: expr("{{ ${F}.input.tenant_id }}"), entity_type: 'lead', entity_id: expr("{{ ${F}.input.lead_id }}"), action: expr("{{ 'website_research_' + ${F}.status.toLowerCase() }}"), old_value: '', new_value: expr("{{ ${F}.identity_confidence + ':' + ${F}.brief.primary_conversion }}"), actor: expr("{{ 'agent:website-intelligence@' + ${F}.provider }}"), execution_id: expr("{{ $execution.id }}"), reason: expr("{{ ${F}.brief.reasoning }}"), ts: expr("{{ ${F}.finished_at }}")
    }, schema: ${j(schemaFor(auditCols))} } },
    position: [2920, 300]
  },
  output: [{ id: 1 }]
});

const readyGate = ifElse({
  version: 2.3,
  config: { name: 'Ready for Creator?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'ready', leftValue: expr("{{ ${F}.ready }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [3140, 300] }
});

const handOff = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Hand Off to Website Builder',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: {
      mode: 'once', source: 'database',
      workflowId: { __rl: true, mode: 'id', value: ${j(BUILDER_ID)}, cachedResultName: 'CEO Brain — Website Builder' },
      workflowInputs: { mappingMode: 'defineBelow', value: ${passthroughSrc}, matchingColumns: [], schema: ${j(builderInputs.map(([id, type]) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type })))}, attemptToConvertTypes: false, convertFieldsToString: true },
      options: { waitForSubWorkflow: false }
    },
    position: [3360, 200]
  },
  output: [{ ok: true }]
});

const notify = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Tell the Orchestrator',
    executeOnce: true, onError: 'continueRegularOutput',
    parameters: { method: 'POST', url: ${j(EVENT_URL)}, sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: expr("{{ JSON.stringify(${F}.event) }}"), options: { timeout: 20000 } },
    position: [3580, 300]
  },
  output: [{ ok: true }]
});

const note = sticky(${j('## CEO Brain — Website Intelligence (internal agent, ADR-3)\nCalled by Lead Intake with John\'s hand-off (same inputs as the Website Builder). Never talks to the customer.\n\nFlow: plan 6 queries → Web Search (Browserbase, n8n gateway credits) → identify the company (John\'s/customer\'s URL wins; else best match; low confidence = no site facts) → fetch homepage + up to 3 pages → digest with a labelled fact ledger (VERIFIED_PUBLIC_FACT / JOHN_OR_CUSTOMER_PROVIDED_FACT / THIRD_PARTY_PUBLIC_INFORMATION / INFERENCE / UNKNOWN) → Ryan\'s role prompt live from the vault → Claude (deterministic fallback when the model is unavailable) → WEBSITE_CREATOR_BRIEF (JSON + text, two variations, placeholders, creator instruction) → run + audit → Hand Off to Website Builder (research_brief, research_json) → event to the Orchestrator (website.research, or website.info_needed with questions for John).\n\nRule 12: a mock-up is never delayed for missing information. Source of truth: ryan/ceo-brain/workflows/website-intelligence/build.js — do not hand-edit Code nodes.')}, [whenCalled, plan, search, identify], { color: 4 });

export default workflow('ceo-brain-website-intelligence', 'CEO Brain — Website Intelligence')
  .add(whenCalled)
  .to(plan)
  .to(search)
  .to(identify)
  .to(fetchHome)
  .to(pickPages)
  .to(fetchPages)
  .to(digest)
  .to(loadRole)
  .to(compose)
  .to(claude.to(finalize))
  .add(claude.onError(finalize))
  .add(finalize)
  .to(logRun)
  .to(logAudit)
  .to(readyGate
    .onTrue(handOff.to(notify))
    .onFalse(notify))
  .add(note);
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'website-intelligence.sdk.ts'), sdk);
[['plan-research.js', codePlan], ['identify-company.js', codeIdentify], ['pick-pages.js', codePickPages], ['digest-research.js', codeDigest], ['compose-research-prompt.js', codeCompose], ['finalize-brief.js', codeFinalize]].forEach(([f, c]) => fs.writeFileSync(path.join(DIST, 'code-nodes', f), c));
fs.writeFileSync(path.join(DIST, 'system-addendum.compiled.md'), systemAddendum);
console.log('built', path.relative(ROOT, path.join(DIST, 'website-intelligence.sdk.ts')), sdk.length, 'chars');
