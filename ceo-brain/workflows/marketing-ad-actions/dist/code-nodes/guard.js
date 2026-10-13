var AP_VERSION = 'mk-autopilot-1.0.0';
var AP_MAX_RAISE_PCT = 20;                     // Ryan's ceiling: a budget rises at most 20% a day
var AP_CONF_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3 };
var AP_NETWORKS = ['facebook', 'instagram', 'tiktok', 'gbp', 'linkedin', 'youtube', 'threads', 'pinterest'];
function apNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function apStr(v) { return v === null || v === undefined ? '' : String(v); }
function apR2(v) { return Math.round(v * 100) / 100; }
function apArr(v) { return Array.isArray(v) ? v : []; }
function apSettings(raw) {
  raw = raw || {};
  var mode = ['live', 'dry_run', 'off'].indexOf(raw.mode) >= 0 ? raw.mode : 'dry_run';
  var posts = raw.posts || {}, ads = raw.ads || {}, credits = raw.credits || {}, approved = raw.approved || {};
  var monthly = credits.monthly || {};
  var s = {
    version: AP_VERSION, brand: apStr(raw.brand) || null, metricool_brand_id: apNum(raw.metricool_brand_id), mode: mode,
    currency: apStr(raw.currency) || 'SGD',
    posts: {
      auto: posts.auto === true, max_per_day: Math.max(0, Math.min(5, apNum(posts.max_per_day) === null ? 1 : apNum(posts.max_per_day))),
      networks: apArr(posts.networks).map(function (n) { return apStr(n).toLowerCase(); }).filter(function (n) { return AP_NETWORKS.indexOf(n) >= 0; })
    },
    ads: {
      auto: ads.auto === true, platform: apStr(ads.platform) || 'meta', ad_account_id: apStr(ads.ad_account_id) || null, max_daily_spend: apNum(ads.max_daily_spend),
      max_raise_pct: Math.max(0, Math.min(AP_MAX_RAISE_PCT, apNum(ads.max_raise_pct) === null ? AP_MAX_RAISE_PCT : apNum(ads.max_raise_pct))),
      min_confidence: AP_CONF_RANK[ads.min_confidence] ? ads.min_confidence : 'HIGH',
      raise_cooldown_days: Math.max(1, apNum(ads.raise_cooldown_days) === null ? 3 : apNum(ads.raise_cooldown_days)),
      keep_one_active: ads.keep_one_active !== false
    },
    credits: { auto: credits.auto === true, monthly: { kling: apNum(monthly.kling), higgsfield: apNum(monthly.higgsfield) } },
    approved: { claims: apArr(approved.claims).map(apStr).filter(Boolean), prices: apArr(approved.prices).map(apStr).filter(Boolean) },
    report: { email: apStr((raw.report || {}).email) || null }
  };
  var off = [];
  if (mode === 'off') off.push('Autopilot is switched off for this brand.');
  if (!s.posts.auto) off.push('Posts: automatic posting is off in the settings.');
  else if (!s.approved.claims.length) off.push('Posts: no approved facts yet, so nothing can be posted (Ryan confirms the facts once).');
  else if (!s.posts.networks.length) off.push('Posts: no networks chosen.');
  if (!s.ads.auto) off.push('Ads: automatic changes are off in the settings.');
  else if (!(s.ads.max_daily_spend > 0)) off.push('Ads: no maximum daily spend set, so no ad is changed (Ryan sets the cap once).');
  if (!s.credits.auto) off.push('Credits: automatic generation is off in the settings.');
  else ['kling', 'higgsfield'].forEach(function (t) { if (!(s.credits.monthly[t] > 0)) off.push('Credits: no monthly ' + t + ' budget set, so nothing is generated on ' + t + '.'); });
  s.enabled = {
    posts: mode !== 'off' && s.posts.auto && s.approved.claims.length > 0 && s.posts.networks.length > 0,
    ads: mode !== 'off' && s.ads.auto && s.ads.max_daily_spend > 0,
    credits: mode !== 'off' && s.credits.auto && (s.credits.monthly.kling > 0 || s.credits.monthly.higgsfield > 0)
  };
  s.off_reasons = off;
  return s;
}
function apKey(brand, date, type, id) { return [apStr(brand), apStr(date), type, apStr(id)].join('|'); }
function apHasKey(ledger, key) { return apArr(ledger).some(function (r) { return r && r.key === key && r.status !== 'failed'; }); }
function apGuardAdAction(action, liveNow, settings, ledger) {
  var s = settings && settings.enabled ? settings : apSettings(settings);
  action = action || {}; liveNow = liveNow || {};
  if (s.mode !== 'live') return { ok: false, reason: 'mode is ' + s.mode };
  if (!s.enabled.ads) return { ok: false, reason: 'ads autopilot is off (no cap or switched off)' };
  if (!action.key) return { ok: false, reason: 'no idempotency key' };
  if (apHasKey(ledger, action.key)) return { ok: false, reason: 'already done (same key)' };
  if (action.type === 'pause_ad') {
    if (!action.ad_id) return { ok: false, reason: 'no ad id' };
    if (liveNow.status && liveNow.status !== 'ACTIVE') return { ok: false, reason: 'ad is not active any more' };
    return { ok: true, reason: 'pause allowed' };
  }
  if (action.type === 'set_daily_budget') {
    var from = apNum(action.from), to = apNum(action.to), cur = apNum(liveNow.daily_budget), total = apNum(liveNow.account_daily_total);
    if (from === null || to === null || cur === null || total === null) return { ok: false, reason: 'budget numbers missing' };
    if (Math.abs(cur - from) > 0.011) return { ok: false, reason: 'budget changed since the plan (' + cur + ' now, planned from ' + from + ')' };
    if (to <= 0) return { ok: false, reason: 'budget must stay above zero' };
    if (to > from && to > apR2(from * (1 + s.ads.max_raise_pct / 100)) + 0.011) return { ok: false, reason: 'raise above ' + s.ads.max_raise_pct + '%' };
    if (apR2(total - cur + to) > s.ads.max_daily_spend + 0.011) return { ok: false, reason: 'would exceed the maximum daily spend of ' + s.ads.max_daily_spend };
    return { ok: true, reason: 'budget change allowed' };
  }
  return { ok: false, reason: 'action type not allowed: ' + apStr(action.type) };
}
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
function mlApply(req) {
  if (req.action.type === 'pause_ad') return { id: req.target_id, param: 'status', value: 'PAUSED' };
  return { id: req.target_id, param: 'daily_budget', value: String(Math.round(mlNum(req.action.to) * req.currency_offset)) };
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
