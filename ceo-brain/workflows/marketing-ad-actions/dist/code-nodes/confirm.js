var ML_VERSION = 'mk-meta-live-1.0.0';
var ML_ACTIONS = ['pause_ad', 'set_daily_budget'];
var ML_FIELDS = { campaigns: 'id,name,effective_status,daily_budget', adsets: 'id,campaign_id,effective_status,daily_budget', pause_ad: 'id,account_id,status,effective_status', set_daily_budget: 'id,account_id,daily_budget,effective_status' };
function mlNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function mlStr(v) { return v === null || v === undefined ? '' : String(v); }
function mlR2(v) { return Math.round(v * 100) / 100; }
function mlErr(resp) {
  if (!resp || typeof resp !== 'object') return 'no response from Meta';
  var e = resp.error;
  if (e) return mlStr(typeof e === 'string' ? e : (e.message || e.description || JSON.stringify(e))).slice(0, 300);
  return '';
}
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
// ---- n8n glue: did Meta really take the change? ----
const req = $('Read Request').first().json;
const g = $('Guard').first().json;
const c = mlConfirm(req, g.apply, $('Apply (Meta)').first().json, ($input.first() && $input.first().json) || {});
const now = new Date().toISOString();
const result = c.status === 'done' ? c.reason + ' | read back ' + JSON.stringify(c.read_back) : c.reason;
return [{ json: { ok: c.status === 'done', status: c.status, reason: c.reason, read_back: c.read_back, action: req.action, apply: g.apply, ledger_row: mlLedgerRow(req, c.status, result, now) } }];
