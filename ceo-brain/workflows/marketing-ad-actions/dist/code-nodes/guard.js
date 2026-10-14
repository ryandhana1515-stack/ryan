var AP_VERSION = 'mk-autopilot-2.0.0';
var AP_MAX_RAISE_PCT = 20;                     // a budget rises at most 20% per approved step
var AP_CONF_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3 };
var AP_NETWORKS = ['facebook', 'instagram', 'tiktok', 'gbp', 'linkedin', 'youtube', 'threads', 'pinterest'];
var AP_LEVELS = ['OFF', 'READ_ONLY', 'APPROVAL_REQUIRED', 'LIMITED_AUTOMATION'];
var AP_CATEGORIES = ['posts', 'ads_pause', 'ads_budget', 'launch', 'generation', 'audience_destination'];
var AP_AUTO_ALLOWED = ['ads_pause'];           // automatic actions may only reduce spend
var AP_POLICY_KEYS = ['min_age_days', 'min_spend', 'freshness_hours', 'conversion_delay_hours', 'cooldown_hours', 'max_campaigns_per_day'];
function apNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function apStr(v) { return v === null || v === undefined ? '' : String(v); }
function apR2(v) { return Math.round(v * 100) / 100; }
function apArr(v) { return Array.isArray(v) ? v : []; }
function apOpen(level) { return level === 'APPROVAL_REQUIRED' || level === 'LIMITED_AUTOMATION'; }
function apSettings(raw) {
  raw = raw || {};
  var mode = ['live', 'dry_run', 'off'].indexOf(raw.mode) >= 0 ? raw.mode : 'dry_run';
  var posts = raw.posts || {}, ads = raw.ads || {}, credits = raw.credits || {}, approved = raw.approved || {}, perm = raw.permissions || {}, pol = raw.auto_pause_policy || {};
  var monthly = credits.monthly || {};
  var off = [];
  var permissions = {};
  AP_CATEGORIES.forEach(function (c) {
    var v = AP_LEVELS.indexOf(perm[c]) >= 0 ? perm[c] : 'APPROVAL_REQUIRED';
    if (mode === 'off') v = 'OFF';
    if (v === 'LIMITED_AUTOMATION' && AP_AUTO_ALLOWED.indexOf(c) < 0) { v = 'APPROVAL_REQUIRED'; off.push(c + ': cannot be automatic (only spend-reducing pauses can); it needs approval.'); }
    permissions[c] = v;
  });
  var policy = { require_tracking_ok: true, require_quality_check: pol.require_quality_check !== false };
  AP_POLICY_KEYS.forEach(function (k) { policy[k] = apNum(pol[k]); });
  var missing = AP_POLICY_KEYS.filter(function (k) { return policy[k] === null || policy[k] < 0; });
  if (permissions.ads_pause === 'LIMITED_AUTOMATION' && missing.length) { permissions.ads_pause = 'APPROVAL_REQUIRED'; off.push('Auto-pause: the pause policy is incomplete (' + missing.join(', ') + '), so pauses need approval.'); }
  var s = {
    version: AP_VERSION, brand: apStr(raw.brand) || null, metricool_brand_id: apNum(raw.metricool_brand_id), mode: mode,
    currency: apStr(raw.currency) || 'SGD', permissions: permissions, auto_pause_policy: policy,
    posts: {
      max_per_day: Math.max(0, Math.min(5, apNum(posts.max_per_day) === null ? 1 : apNum(posts.max_per_day))),
      networks: apArr(posts.networks).map(function (n) { return apStr(n).toLowerCase(); }).filter(function (n) { return AP_NETWORKS.indexOf(n) >= 0; })
    },
    ads: {
      platform: apStr(ads.platform) || 'meta', ad_account_id: apStr(ads.ad_account_id) || null, max_daily_spend: apNum(ads.max_daily_spend),
      max_raise_pct: Math.max(0, Math.min(AP_MAX_RAISE_PCT, apNum(ads.max_raise_pct) === null ? AP_MAX_RAISE_PCT : apNum(ads.max_raise_pct))),
      min_confidence: AP_CONF_RANK[ads.min_confidence] ? ads.min_confidence : 'HIGH',
      raise_cooldown_days: Math.max(1, apNum(ads.raise_cooldown_days) === null ? 3 : apNum(ads.raise_cooldown_days)),
      keep_one_active: ads.keep_one_active !== false
    },
    credits: { monthly: { kling: apNum(monthly.kling), higgsfield: apNum(monthly.higgsfield) } },
    approved: { claims: apArr(approved.claims).map(apStr).filter(Boolean), prices: apArr(approved.prices).map(apStr).filter(Boolean) },
    report: { email: apStr((raw.report || {}).email) || null }
  };
  if (mode === 'off') off.push('Everything is switched off for this brand.');
  if (!apOpen(permissions.posts)) off.push('Posts: ' + permissions.posts + '.');
  else if (!s.approved.claims.length) off.push('Posts: no approved facts yet, so no post can be prepared (Ryan confirms the facts once).');
  else if (!s.posts.networks.length) off.push('Posts: no networks chosen.');
  if (apOpen(permissions.ads_budget) && !(s.ads.max_daily_spend > 0)) off.push('Ads: no maximum daily spend set, so no budget increase can be proposed (Ryan sets the cap once).');
  if (apOpen(permissions.generation)) ['kling', 'higgsfield'].forEach(function (t) { if (!(s.credits.monthly[t] > 0)) off.push('Credits: no monthly ' + t + ' budget set, so nothing is proposed on ' + t + '.'); });
  s.enabled = {
    posts: apOpen(permissions.posts) && s.approved.claims.length > 0 && s.posts.networks.length > 0,
    ads: apOpen(permissions.ads_pause) || apOpen(permissions.ads_budget),
    ads_budget: apOpen(permissions.ads_budget) && s.ads.max_daily_spend > 0,
    credits: apOpen(permissions.generation) && (s.credits.monthly.kling > 0 || s.credits.monthly.higgsfield > 0)
  };
  s.auto = { ads_pause: mode === 'live' && permissions.ads_pause === 'LIMITED_AUTOMATION' };
  s.off_reasons = off;
  return s;
}
function apCanon(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
  if (Array.isArray(v)) return '[' + v.map(apCanon).join(',') + ']';
  return '{' + Object.keys(v).sort().filter(function (k) { return v[k] !== undefined; }).map(function (k) { return JSON.stringify(k) + ':' + apCanon(v[k]); }).join(',') + '}';
}
function apHash(str) {
  var h1 = 0xdeadbeef, h2 = 0x41c6ce57, s = apStr(str);
  for (var i = 0; i < s.length; i++) { var ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}
function apProposalHash(p) {
  p = p || {};
  return apHash(apCanon({ tenant: apStr(p.tenant), user: apStr(p.user), provider: apStr(p.provider), account: apStr(p.account), action: apStr(p.action),
    targets: apArr(p.targets).map(apStr), expected_state: p.expected_state || null, payload: p.payload || null, cost_impact: p.cost_impact || null }));
}
function apApprovalValid(action, nowIso) {
  var p = action && action.proposal;
  if (!p || typeof p !== 'object') return { ok: false, reason: 'no approved proposal' };
  if (p.status !== 'QUEUED') return { ok: false, reason: 'proposal ' + apStr(p.code) + ' is ' + apStr(p.status) + ', not approved' };
  if (!p.approved_hash || p.approved_hash !== p.payload_hash) return { ok: false, reason: 'approval does not match the proposal' };
  if (apProposalHash(p) !== p.payload_hash) return { ok: false, reason: 'proposal was edited after approval' };
  var now = Date.parse(nowIso || '') || Date.now();
  if (!(Date.parse(p.expires_at) > now)) return { ok: false, reason: 'approval expired' };
  var pl = p.payload || {};
  var same = pl.type === action.type && apStr(pl.ad_id) === apStr(action.ad_id) && apStr(pl.budget_id) === apStr(action.budget_id) &&
    apNum(pl.from) === apNum(action.from) && apNum(pl.to) === apNum(action.to);
  if (!same) return { ok: false, reason: 'the action is not the one that was approved' };
  return { ok: true, reason: 'approved as ' + p.code };
}
function apKey(brand, date, type, id) { return [apStr(brand), apStr(date), type, apStr(id)].join('|'); }
function apHasKey(ledger, key) { return apArr(ledger).some(function (r) { return r && r.key === key && r.status !== 'failed'; }); }
function apGuardAdAction(action, liveNow, settings, ledger, nowIso) {
  var s = settings && settings.enabled ? settings : apSettings(settings);
  action = action || {}; liveNow = liveNow || {};
  if (s.mode !== 'live') return { ok: false, reason: 'mode is ' + s.mode };
  if (!action.key) return { ok: false, reason: 'no idempotency key' };
  if (apHasKey(ledger, action.key)) return { ok: false, reason: 'already done (same key)' };
  if (action.type === 'pause_ad') {
    if (!action.ad_id) return { ok: false, reason: 'no ad id' };
    if (!apOpen(s.permissions.ads_pause)) return { ok: false, reason: 'pausing is ' + s.permissions.ads_pause };
    var autoOk = action.auto === true && s.auto.ads_pause && !action.proposal;
    var appr = autoOk ? { ok: true } : apApprovalValid(action, nowIso);
    if (!appr.ok) return { ok: false, reason: action.auto === true ? 'automatic pausing is not switched on for this brand' : appr.reason };
    if (liveNow.status && liveNow.status !== 'ACTIVE') return { ok: false, reason: 'ad is not active any more' };
    return { ok: true, reason: autoOk ? 'automatic pause allowed by the pause policy' : 'pause approved' };
  }
  if (action.type === 'set_daily_budget') {
    if (!s.enabled.ads_budget) return { ok: false, reason: 'budget changes are off (no cap or not permitted)' };
    var ap = apApprovalValid(action, nowIso);
    if (!ap.ok) return { ok: false, reason: ap.reason };
    var from = apNum(action.from), to = apNum(action.to), cur = apNum(liveNow.daily_budget), total = apNum(liveNow.account_daily_total);
    if (from === null || to === null || cur === null || total === null) return { ok: false, reason: 'budget numbers missing' };
    if (Math.abs(cur - from) > 0.011) return { ok: false, reason: 'budget changed since the plan (' + cur + ' now, planned from ' + from + ')' };
    if (to <= 0) return { ok: false, reason: 'budget must stay above zero' };
    if (to > from && to > apR2(from * (1 + s.ads.max_raise_pct / 100)) + 0.011) return { ok: false, reason: 'raise above ' + s.ads.max_raise_pct + '%' };
    if (apR2(total - cur + to) > s.ads.max_daily_spend + 0.011) return { ok: false, reason: 'would exceed the maximum daily spend of ' + s.ads.max_daily_spend };
    return { ok: true, reason: 'budget change approved and within caps' };
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
else g = apGuardAdAction(req.action, live.now, settings, ledger, now);
const out = { ok: g.ok === true, status: g.ok === true ? 'allowed' : 'refused', reason: g.reason, action: req.action, live: live.now || null, checked_at: now };
if (out.ok) out.apply = mlApply(req);
else { out.read_back = null; out.ledger_row = mlLedgerRow(req, 'refused', g.reason, now); }
return [{ json: out }];
