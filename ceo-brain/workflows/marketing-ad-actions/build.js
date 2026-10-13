#!/usr/bin/env node
// Generates the n8n Workflow-SDK source for "Marketing — Ad Actions" (marketing autopilot, Ryan 2026-10-13).
// The ONLY place an ad change reaches Meta. A Claude routine decides actions with agents/marketing/autopilot.js;
// this fixed workflow re-reads Meta live and re-checks every action with apGuardAdAction right before the write.
// No AI model ever calls an ad platform directly. Unpublished on purpose (no public URL): the routine runs it through
// the n8n MCP execute_workflow (executionMode "manual", webhookData).
//
//   mode 'state'  -> read-only: campaigns + ad sets -> { ok, account_daily_total, ads: { <campaign id>: {...} } }
//   action        -> ledger + live reads -> Guard -> (allowed) POST to Meta -> read back -> Confirm -> ledger row
//                                                -> (refused) ledger row (own key, kind ad_refused)
//
//   node workflows/marketing-ad-actions/build.js   -> dist/marketing-ad-actions.sdk.ts + dist/code-nodes/*.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const j = (v) => JSON.stringify(v);

const TABLES = JSON.parse(read('database/n8n-data-tables.json')).tables;
const GRAPH_VERSION = 'v25.0';
const META_CRED = 'Meta System User (ads_management)';

function inline(file) {
  return read(file).replace(/\/\/ ---- Node module wrapper[\s\S]*$/m, '').split('\n').filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*\/\//.test(l) && !/^\s*\/\*\*.*\*\/\s*$/.test(l) && l.trim() !== '').join('\n');
}
const fullSrc = inline('agents/marketing/autopilot.js') + '\n' + inline('agents/marketing/meta-live.js');
function pick(names) {
  const chunks = []; let cur = null;
  fullSrc.split('\n').forEach((l) => { const m = /^(?:var|function)\s+([A-Za-z0-9_]+)/.exec(l); if (m) { cur = { name: m[1], lines: [] }; chunks.push(cur); } if (cur) cur.lines.push(l); });
  const missing = names.filter((n) => !chunks.some((c) => c.name === n)); if (missing.length) throw new Error('pick: missing ' + missing.join(','));
  return chunks.filter((c) => names.includes(c.name)).map((c) => c.lines.join('\n')).join('\n');
}
const ML = ['ML_VERSION', 'ML_ACTIONS', 'ML_FIELDS', 'mlNum', 'mlStr', 'mlR2', 'mlErr'];
const AP = ['AP_VERSION', 'AP_MAX_RAISE_PCT', 'AP_CONF_RANK', 'AP_NETWORKS', 'apNum', 'apStr', 'apR2', 'apArr', 'apSettings', 'apKey', 'apHasKey', 'apGuardAdAction'];

const codeRequest = `${pick(ML.concat(['mlRequest']))}
// ---- n8n glue: normalise the webhook body once; every later node reads this ----
const raw = ($input.first() && $input.first().json) || {};
return [{ json: Object.assign(mlRequest(raw), { received_at: new Date().toISOString() }) }];
`;

const codeState = `${pick(ML.concat(['mlState']))}
// ---- n8n glue: read-only state for the daily routine (no writes, no ledger rows) ----
const req = $('Read Request').first().json;
if (!req.valid) return [{ json: { ok: false, mode: 'state', reason: 'bad request: ' + req.problems.join('; ') } }];
const st = mlState($('Read Campaigns (Meta)').first().json, $('Read Ad Sets (Meta)').first().json, req.currency_offset);
if (!st.ok) return [{ json: { ok: false, mode: 'state', reason: st.reason } }];
return [{ json: { ok: true, mode: 'state', ad_account_id: req.ad_account_id, currency_offset: req.currency_offset, account_daily_total: st.account_daily_total, ads: st.ads, campaigns: st.campaigns, adsets: st.adsets, read_at: new Date().toISOString(), version: ${j(require(path.join(ROOT, 'agents/marketing/meta-live.js')).ML_VERSION)} } }];
`;

const codeGuard = `${pick(AP.concat(ML, ['mlState', 'mlLiveNow', 'mlApply', 'mlSgDate', 'mlLedgerRow']))}
// ---- n8n glue: the final check right before Meta, with the budget re-read live ----
const req = $('Read Request').first().json;
const now = new Date().toISOString();
const ledgerItems = $('Read Ledger').all().map((i) => (i && i.json) || {});
const ledgerError = ledgerItems.some((r) => r && r.error);
const ledger = ledgerItems.filter((r) => r && r.key);
const state = mlState($('Read Campaigns (Meta)').first().json, $('Read Ad Sets (Meta)').first().json, req.currency_offset);
const live = req.valid ? mlLiveNow(req, $('Read Live (Meta)').first().json, state) : { error: 'bad request' };
const settings = apSettings(req.settings);
const settingsAccount = settings.ads && settings.ads.ad_account_id ? (/^act_/.test(settings.ads.ad_account_id) ? settings.ads.ad_account_id : 'act_' + settings.ads.ad_account_id) : '';
let g;
if (!req.valid) g = { ok: false, reason: 'bad request: ' + req.problems.join('; ') };
else if (ledgerError) g = { ok: false, reason: 'the ledger could not be read, so a duplicate cannot be ruled out' };
else if (live.error) g = { ok: false, reason: live.error };
else if (settingsAccount && settingsAccount !== req.ad_account_id) g = { ok: false, reason: 'ad account ' + req.ad_account_id + ' is not the one in the brand settings (' + settingsAccount + ')' };
else g = apGuardAdAction(req.action, live.now, settings, ledger);
const out = { ok: g.ok === true, status: g.ok === true ? 'allowed' : 'refused', reason: g.reason, action: req.action, live: live.now || null, checked_at: now };
if (out.ok) out.apply = mlApply(req);
else { out.read_back = null; out.ledger_row = mlLedgerRow(req, 'refused', g.reason, now); }
return [{ json: out }];
`;

const codeConfirm = `${pick(ML.concat(['mlConfirm', 'mlSgDate', 'mlLedgerRow']))}
// ---- n8n glue: did Meta really take the change? ----
const req = $('Read Request').first().json;
const g = $('Guard').first().json;
const c = mlConfirm(req, g.apply, $('Apply (Meta)').first().json, ($input.first() && $input.first().json) || {});
const now = new Date().toISOString();
const result = c.status === 'done' ? c.reason + ' | read back ' + JSON.stringify(c.read_back) : c.reason;
return [{ json: { ok: c.status === 'done', status: c.status, reason: c.reason, read_back: c.read_back, action: req.action, apply: g.apply, ledger_row: mlLedgerRow(req, c.status, result, now) } }];
`;

const codeResult = `// ---- n8n glue: one answer for the routine, whichever path ran ----
const src = $('Confirm').isExecuted ? $('Confirm').first().json : $('Guard').first().json;
const w = ($input.first() && $input.first().json) || {};
return [{ json: { ok: src.ok === true && src.status === 'done', status: src.status, reason: src.reason, read_back: src.read_back || null, key: src.ledger_row ? src.ledger_row.key : null, ledger_written: !w.error, action: src.action || null } }];
`;

const col = (id, type) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type, canBeUsedToMatch: true });
const ledgerCols = [['key', 'string'], ['brand', 'string'], ['date', 'string'], ['kind', 'string'], ['object_id', 'string'], ['tool', 'string'], ['credits', 'number'], ['detail', 'string'], ['status', 'string'], ['result', 'string'], ['ts', 'string']];
const LEDGER = { __rl: true, mode: 'id', value: TABLES.mk_autopilot_ledger.id, cachedResultName: 'mk_autopilot_ledger' };
const R = "$('Read Request').first().json";
const G = "$('Guard').first().json";
const ledgerValue = '{ ' + ledgerCols.map(([c]) => `${c}: expr("{{ $json.ledger_row.${c} }}")`).join(', ') + ' }';

const graph = (name, method, nodeExpr, edge, params, position, extra) => `node({
  type: 'n8n-nodes-base.facebookGraphApi',
  version: 1,
  config: {
    name: ${j(name)},${extra || ''}
    onError: 'continueRegularOutput',
    parameters: { hostUrl: 'graph.facebook.com', httpRequestMethod: ${j(method)}, graphApiVersion: ${j(GRAPH_VERSION)}, node: expr(${j(nodeExpr)}), edge: ${j(edge)}, options: { queryParameters: { parameter: [${params.map(([n, v]) => `{ name: ${n}, value: ${v} }`).join(', ')}] } } },
    credentials: { facebookGraphApi: newCredential(${j(META_CRED)}) },
    position: ${j(position)}
  },`;

const sdk = `import { workflow, node, trigger, sticky, expr, ifElse, newCredential } from '@n8n/workflow-sdk';

const adActionIn = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: { name: 'Ad Action In', parameters: { httpMethod: 'POST', path: 'marketing/ad-action', authentication: 'none', responseMode: 'lastNode', responseData: 'firstEntryJson', options: {} }, position: [0, 300] },
  output: [{ body: { settings: { brand: 'DEMO', mode: 'live', ads: { auto: true, max_daily_spend: 100, max_raise_pct: 20 } }, action: { key: 'DEMO|2026-10-13|set_daily_budget|120000000000001', type: 'set_daily_budget', ad_id: '120000000000001', budget_id: '120000000000001', from: 30, to: 36, why: 'winner' }, ad_account_id: 'act_123', currency_offset: 100 } }]
});

const readRequest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Read Request', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeRequest)} }, position: [220, 300] },
  output: [{ mode: 'action', ad_account_id: 'act_123', currency_offset: 100, action: { key: 'DEMO|2026-10-13|set_daily_budget|120000000000001', type: 'set_daily_budget', ad_id: '120000000000001', budget_id: '120000000000001', from: 30, to: 36, why: 'winner' }, settings: { brand: 'DEMO' }, target_id: '120000000000001', read_fields: 'id,account_id,daily_budget,effective_status', valid: true, problems: [] }]
});

const readCampaigns = ${graph('Read Campaigns (Meta)', 'GET', `{{ ${R}.ad_account_id }}`, 'campaigns', [["'fields'", j('id,name,effective_status,daily_budget')], ["'limit'", "'500'"]], [440, 300], ' executeOnce: true,')}
  output: [{ data: [{ id: '120000000000001', name: 'Brows — leads', effective_status: 'ACTIVE', daily_budget: '3000' }] }]
});

const readAdSets = ${graph('Read Ad Sets (Meta)', 'GET', `{{ ${R}.ad_account_id }}`, 'adsets', [["'fields'", j('id,campaign_id,effective_status,daily_budget')], ["'limit'", "'500'"]], [660, 300], ' executeOnce: true,')}
  output: [{ data: [{ id: '120000000000101', campaign_id: '120000000000001', effective_status: 'ACTIVE' }] }]
});

const routeMode = ifElse({
  version: 2.3,
  config: { name: 'State or Action?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'mode', leftValue: expr("{{ ${R}.mode }}"), rightValue: 'state', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } }, position: [880, 300] }
});

const buildState = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Build State', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeState)} }, position: [1100, 100] },
  output: [{ ok: true, mode: 'state', account_daily_total: 30, ads: { '120000000000001': { name: 'Brows — leads', status: 'ACTIVE', budget_id: '120000000000001', daily_budget: 30 } } }]
});

const readLedger = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Read Ledger', executeOnce: true, alwaysOutputData: true, onError: 'continueRegularOutput', parameters: { resource: 'row', operation: 'get', dataTableId: ${j(LEDGER)}, matchType: 'allConditions', filters: { conditions: [{ keyName: 'key', condition: 'eq', keyValue: expr("{{ ${R}.action.key || '(no key)' }}") }] }, returnAll: true }, position: [1100, 400] },
  output: [{ id: 1, key: 'DEMO|2026-10-12|pause_ad|1', status: 'done' }]
});

const readLive = ${graph('Read Live (Meta)', 'GET', `{{ ${R}.target_id }}`, '', [["'fields'", `expr(${j(`{{ ${R}.read_fields }}`)})`]], [1320, 400], ' executeOnce: true,')}
  output: [{ id: '120000000000001', account_id: '123', daily_budget: '3000', effective_status: 'ACTIVE' }]
});

const guard = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Guard', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeGuard)} }, position: [1540, 400] },
  output: [{ ok: true, status: 'allowed', reason: 'budget change allowed', action: { key: 'k', type: 'set_daily_budget', budget_id: '120000000000001', from: 30, to: 36 }, live: { status: 'ACTIVE', daily_budget: 30, account_daily_total: 30 }, apply: { id: '120000000000001', param: 'daily_budget', value: '3600' }, checked_at: '2026-10-13T00:00:00.000Z' }]
});

const allowed = ifElse({
  version: 2.3,
  config: { name: 'Allowed?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'ok', leftValue: expr('{{ $json.ok }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' } }, position: [1760, 400] }
});

const applyMeta = ${graph('Apply (Meta)', 'POST', `{{ ${G}.apply.id }}`, '', [[`expr(${j(`{{ ${G}.apply.param }}`)})`, `expr(${j(`{{ ${G}.apply.value }}`)})`]], [1980, 300], ' executeOnce: true,')}
  output: [{ success: true }]
});

const readBack = ${graph('Read Back (Meta)', 'GET', `{{ ${G}.apply.id }}`, '', [["'fields'", `expr(${j(`{{ ${R}.read_fields }}`)})`]], [2200, 300], ' executeOnce: true,')}
  output: [{ id: '120000000000001', account_id: '123', daily_budget: '3600', effective_status: 'ACTIVE' }]
});

const confirm = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Confirm', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeConfirm)} }, position: [2420, 300] },
  output: [{ ok: true, status: 'done', reason: 'daily budget is now 36', read_back: { status: null, effective_status: 'ACTIVE', daily_budget: 36 }, ledger_row: { key: 'DEMO|2026-10-13|set_daily_budget|120000000000001', brand: 'DEMO', date: '2026-10-14', kind: 'ad', object_id: '120000000000001', tool: 'meta', credits: 0, detail: '{}', status: 'done', result: 'daily budget is now 36', ts: '2026-10-13T19:00:00.000Z' } }]
});

const writeLedger = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Write Ledger', onError: 'continueRegularOutput', parameters: { resource: 'row', operation: 'insert', dataTableId: ${j(LEDGER)}, columns: { mappingMode: 'defineBelow', value: ${ledgerValue}, schema: ${j(ledgerCols.map(([c, t]) => col(c, t)))} }, options: {} }, position: [2640, 400] },
  output: [{ id: 1, key: 'k', status: 'done' }]
});

const result = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Result', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(codeResult)} }, position: [2860, 400] },
  output: [{ ok: true, status: 'done', reason: 'daily budget is now 36', read_back: { daily_budget: 36 }, key: 'k', ledger_written: true }]
});

const note = sticky(${j('## Marketing — Ad Actions (the only door to Meta)\nThe daily Claude routine decides; this fixed workflow checks and acts. No AI model calls Meta directly.\n\n**State** (`mode: "state"`): reads campaigns + ad sets, returns campaign-level budgets and the ACTIVE daily total. Read-only, no ledger rows.\n\n**Action** (one per run): ledger row for the same key → live object + account budgets from Meta → Guard (`apGuardAdAction` from `agents/marketing/autopilot.js`: live mode, caps, ≤20% raise, budget unchanged since the plan, never above the daily maximum, no duplicate key) → POST to Meta → read back → ledger row (done / failed). Refusals are logged with their own key (`…|refused|<ts>`, kind `ad_refused`) so they never block a later valid action.\n\nKept **unpublished** on purpose (no public URL): run through n8n MCP `execute_workflow` (manual, webhookData). Meta credential: Facebook Graph API with a System User token (ads_management). Source of truth: `ceo-brain/workflows/marketing-ad-actions/build.js` — never hand-edit the Code nodes.')}, [adActionIn, readRequest, readCampaigns, readAdSets], { color: 4 });

export default workflow('marketing-ad-actions', 'Marketing — Ad Actions')
  .add(adActionIn)
  .to(readRequest)
  .to(readCampaigns)
  .to(readAdSets)
  .to(routeMode
    .onTrue(buildState)
    .onFalse(readLedger.to(readLive).to(guard).to(allowed
      .onTrue(applyMeta.to(readBack).to(confirm).to(writeLedger))
      .onFalse(writeLedger))))
  .add(writeLedger)
  .to(result)
  .add(note)
  .group('Read request + Meta', [readRequest, readCampaigns, readAdSets], { description: 'Normalise the body, then read all campaigns and ad sets of the ad account (read-only).' })
  .group('Final check', [readLedger, readLive, guard], { description: 'Same key in the ledger? Live object re-read. apGuardAdAction decides with the live budget.' })
  .group('Apply + confirm', [applyMeta, readBack, confirm], { description: 'The one write to Meta, then read it back and mark done or failed.' })
  .group('Ledger + answer', [writeLedger, result], { description: 'One ledger row (done, failed or refused with its own key) and the answer for the routine.' });
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'marketing-ad-actions.sdk.ts'), sdk);
[['read-request.js', codeRequest], ['build-state.js', codeState], ['guard.js', codeGuard], ['confirm.js', codeConfirm], ['result.js', codeResult]].forEach(([f, c]) => fs.writeFileSync(path.join(DIST, 'code-nodes', f), c));
console.log('built', path.relative(ROOT, path.join(DIST, 'marketing-ad-actions.sdk.ts')), sdk.length, 'chars');
