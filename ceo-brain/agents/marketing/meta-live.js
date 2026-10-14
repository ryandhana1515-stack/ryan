// Marketing autopilot — the Meta side of the n8n "Marketing — Ad Actions" workflow (2026-10-13).
// Pure functions only: the workflow's Code nodes are generated from this file + autopilot.js by
// ceo-brain/workflows/marketing-ad-actions/build.js. Meta returns budgets in minor units (cents); everything here
// converts with currency_offset (100 for SGD/USD) so the guard works in dollars, like the caps in the vault note.
//
// Two modes (one per execution, body of the "Ad Action In" webhook):
//   { mode: 'state', ad_account_id: 'act_123', currency_offset: 100 }                 -> read-only, campaign level
//   { settings, action: { key, type, ad_id, budget_id, from, to, why }, ad_account_id, currency_offset: 100 }
// The state output is exactly the `live` input of apAdPlan: { account_daily_total, ads: { <campaign id>: {...} } }.

var ML_VERSION = 'mk-meta-live-1.0.0';
var ML_ACTIONS = ['pause_ad', 'set_daily_budget'];
var ML_FIELDS = { campaigns: 'id,name,effective_status,daily_budget', adsets: 'id,campaign_id,effective_status,daily_budget', pause_ad: 'id,account_id,status,effective_status', set_daily_budget: 'id,account_id,daily_budget,effective_status' };

function mlNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function mlStr(v) { return v === null || v === undefined ? '' : String(v); }
function mlR2(v) { return Math.round(v * 100) / 100; }

/** Normalise the webhook body (n8n puts it under .body; a manual run may pass it flat). */
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
  var action = { key: mlStr(a.key), type: mlStr(a.type), ad_id: mlStr(a.ad_id), budget_id: mlStr(a.budget_id), from: mlNum(a.from), to: mlNum(a.to), why: mlStr(a.why).slice(0, 500),
    auto: a.auto === true, proposal: a.proposal && typeof a.proposal === 'object' ? a.proposal : null };
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

/** Error text of a Graph response or n8n error item; '' when it is fine. */
function mlErr(resp) {
  if (!resp || typeof resp !== 'object') return 'no response from Meta';
  var e = resp.error;
  if (e) return mlStr(typeof e === 'string' ? e : (e.message || e.description || JSON.stringify(e))).slice(0, 300);
  return '';
}

/** Campaign-level picture of the ad account + the total of ACTIVE daily budgets (in currency units). */
function mlState(campaignsResp, adsetsResp, offset) {
  var off = mlNum(offset) > 0 ? mlNum(offset) : 100;
  var ce = mlErr(campaignsResp), ae = mlErr(adsetsResp);
  if (ce || !Array.isArray(campaignsResp.data)) return { ok: false, reason: 'campaigns could not be read: ' + (ce || 'unexpected response') };
  if (ae || !Array.isArray(adsetsResp.data)) return { ok: false, reason: 'ad sets could not be read: ' + (ae || 'unexpected response') };
  if ((campaignsResp.paging && campaignsResp.paging.next) || (adsetsResp.paging && adsetsResp.paging.next)) return { ok: false, reason: 'more campaigns or ad sets than one page (500); the daily total would be incomplete, so nothing is trusted' };
  var camps = campaignsResp.data, sets = adsetsResp.data;
  var cbo = {}, ads = {}, total = 0;
  camps.forEach(function (c) { if (c && mlNum(c.daily_budget) > 0) cbo[mlStr(c.id)] = true; });
  camps.forEach(function (c) {
    if (!c || !c.id) return;
    var id = mlStr(c.id), status = c.effective_status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED', budgetId = null, daily = null;
    if (cbo[id]) { budgetId = id; daily = mlR2(mlNum(c.daily_budget) / off); if (status === 'ACTIVE') total += daily; }
    else {
      var own = sets.filter(function (s) { return s && mlStr(s.campaign_id) === id && s.effective_status === 'ACTIVE' && mlNum(s.daily_budget) > 0; });
      if (own.length === 1) { budgetId = mlStr(own[0].id); daily = mlR2(mlNum(own[0].daily_budget) / off); }
    }
    ads[id] = { name: mlStr(c.name), status: status, budget_id: budgetId, daily_budget: daily };
  });
  sets.forEach(function (s) {
    if (!s || s.effective_status !== 'ACTIVE' || !(mlNum(s.daily_budget) > 0) || cbo[mlStr(s.campaign_id)]) return;
    total += mlNum(s.daily_budget) / off;
  });
  return { ok: true, account_daily_total: mlR2(total), ads: ads, campaigns: camps.length, adsets: sets.length };
}

/** The guard's liveNow { status, daily_budget, account_daily_total } from the fresh reads, or { error }. */
function mlLiveNow(req, objResp, state) {
  var e = mlErr(objResp);
  if (e) return { error: 'live read failed: ' + e };
  if (!objResp.id) return { error: 'live read failed: Meta returned no object' };
  if (!objResp.account_id || 'act_' + mlStr(objResp.account_id) !== req.ad_account_id) return { error: 'the object is not in ad account ' + req.ad_account_id };
  if (req.action.type === 'set_daily_budget' && !(state && state.ok)) return { error: 'account budgets unreadable: ' + ((state && state.reason) || 'unknown') };
  var d = mlNum(objResp.daily_budget);
  return { now: {
    status: objResp.effective_status ? (objResp.effective_status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED') : null,
    effective_status: objResp.effective_status || null,
    daily_budget: d === null ? null : mlR2(d / req.currency_offset),
    account_daily_total: state && state.ok ? state.account_daily_total : null
  } };
}

/** The one Graph write: POST /{id} with status=PAUSED or daily_budget=<minor units>. */
function mlApply(req) {
  if (req.action.type === 'pause_ad') return { id: req.target_id, param: 'status', value: 'PAUSED' };
  return { id: req.target_id, param: 'daily_budget', value: String(Math.round(mlNum(req.action.to) * req.currency_offset)) };
}

/** Compare the read-back with what was written. done | failed (failed never blocks a later retry). */
function mlConfirm(req, apply, applyResp, readResp) {
  var e = mlErr(applyResp);
  if (e) return { status: 'failed', reason: 'Meta refused the change: ' + e, read_back: null };
  var re = mlErr(readResp);
  if (re || !readResp.id) return { status: 'failed', reason: 'change sent but the read-back failed: ' + (re || 'no object'), read_back: null };
  var d = mlNum(readResp.daily_budget);
  var rb = { status: readResp.status || null, effective_status: readResp.effective_status || null, daily_budget: d === null ? null : mlR2(d / req.currency_offset) };
  if (req.action.type === 'pause_ad') return readResp.status === 'PAUSED' ? { status: 'done', reason: 'paused', read_back: rb } : { status: 'failed', reason: 'still ' + mlStr(readResp.status) + ' after the pause', read_back: rb };
  return d !== null && d === mlNum(apply && apply.value) ? { status: 'done', reason: 'daily budget is now ' + rb.daily_budget, read_back: rb } : { status: 'failed', reason: 'daily budget reads ' + rb.daily_budget + ', expected ' + req.action.to, read_back: rb };
}

function mlSgDate(iso) { var t = Date.parse(iso); return new Date((isNaN(t) ? Date.now() : t) + 8 * 3600000).toISOString().slice(0, 10); }

/** One ledger row. A refusal gets its own key and kind 'ad_refused', so it never blocks or cools down a later valid action. */
function mlLedgerRow(req, status, result, nowIso) {
  var refused = status === 'refused';
  var key = req.action.key || 'nokey';
  return {
    key: refused ? key + '|refused|' + nowIso : key,
    brand: mlStr(req.settings && req.settings.brand), date: mlSgDate(nowIso), kind: refused ? 'ad_refused' : 'ad',
    object_id: req.target_id || mlStr(req.action.ad_id || req.action.budget_id), tool: 'meta', credits: 0,
    detail: JSON.stringify(req.action), status: status, result: mlStr(result).slice(0, 1000), ts: nowIso
  };
}

// ---- Node module wrapper ----
if (typeof module !== 'undefined') {
  module.exports = { ML_VERSION: ML_VERSION, ML_FIELDS: ML_FIELDS, mlRequest: mlRequest, mlErr: mlErr, mlState: mlState, mlLiveNow: mlLiveNow, mlApply: mlApply, mlConfirm: mlConfirm, mlSgDate: mlSgDate, mlLedgerRow: mlLedgerRow };
}
