var ML_VERSION = 'mk-meta-live-1.0.0';
var ML_ACTIONS = ['pause_ad', 'set_daily_budget'];
var ML_FIELDS = { campaigns: 'id,name,effective_status,daily_budget', adsets: 'id,campaign_id,effective_status,daily_budget', pause_ad: 'id,account_id,status,effective_status', set_daily_budget: 'id,account_id,daily_budget,effective_status' };
function mlNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function mlStr(v) { return v === null || v === undefined ? '' : String(v); }
function mlR2(v) { return Math.round(v * 100) / 100; }
function mlRequest(raw) {
  raw = raw || {};
  var b = raw.body && typeof raw.body === 'object' ? raw.body : raw;
  var problems = [];
  var mode = b.mode === 'state' ? 'state' : 'action';
  var acct = mlStr(b.ad_account_id).trim();
  if (/^\d+$/.test(acct)) acct = 'act_' + acct;
  if (!/^act_\d+$/.test(acct)) problems.push('ad_account_id must look like act_123');
  var off = mlNum(b.currency_offset);
  if (off === null) off = 100;
  if (!(off > 0)) problems.push('currency_offset must be a positive number');
  var a = b.action && typeof b.action === 'object' ? b.action : {};
  var action = { key: mlStr(a.key), type: mlStr(a.type), ad_id: mlStr(a.ad_id), budget_id: mlStr(a.budget_id), from: mlNum(a.from), to: mlNum(a.to), why: mlStr(a.why).slice(0, 500) };
  var target = action.type === 'pause_ad' ? action.ad_id : (action.type === 'set_daily_budget' ? action.budget_id : '');
  var settings = b.settings && typeof b.settings === 'object' ? b.settings : null;
  if (mode === 'action') {
    if (!action.key) problems.push('action.key is missing');
    if (ML_ACTIONS.indexOf(action.type) < 0) problems.push('action type not allowed: ' + action.type);
    else if (!/^\d+$/.test(target)) problems.push((action.type === 'pause_ad' ? 'action.ad_id' : 'action.budget_id') + ' must be a numeric Meta id');
    if (!settings) problems.push('settings are missing');
  }
  return {
    version: ML_VERSION, mode: mode, ad_account_id: acct, currency_offset: off, action: action, settings: settings,
    target_id: /^\d+$/.test(target) ? target : '', read_fields: ML_FIELDS[action.type] || ML_FIELDS.pause_ad,
    valid: problems.length === 0, problems: problems
  };
}
function mlErr(resp) {
  if (!resp || typeof resp !== 'object') return 'no response from Meta';
  var e = resp.error;
  if (e) return mlStr(typeof e === 'string' ? e : (e.message || e.description || JSON.stringify(e))).slice(0, 300);
  return '';
}
// ---- n8n glue: normalise the webhook body once; every later node reads this ----
const raw = ($input.first() && $input.first().json) || {};
return [{ json: Object.assign(mlRequest(raw), { received_at: new Date().toISOString() }) }];
