// Marketing OS — the PERMISSION + GUARDRAIL engine for the marketing team.
// v1 (Ryan, 2026-10-13): posts, budget raises and generation were automatic within caps.
// v2 (Ryan's Marketing OS v5 master prompt, 2026-10-14, newest wins): permission levels per brand and action category —
//   OFF • READ_ONLY • APPROVAL_REQUIRED (default) • LIMITED_AUTOMATION (only if the owner sets it).
//   Always approval-required: launches, resumes that spend, scale-ups, budget moves, audience/destination changes, paid
//   generation, anything public. Automatic actions may only REDUCE spend: an auto-pause runs only under a complete,
//   owner-approved pause policy (minimum age and spend, fresh and valid tracking, conversion delay, a qualified-lead/sales
//   check, cool-down and a maximum number of campaigns per day). Everything else becomes a PROPOSAL with an approval code
//   (ceo-brain/agents/marketing/campaign-order.js); the approval binds to the exact payload (same hash as coRehash).
// The agents decide WHAT to suggest; this file decides whether it may be prepared, done automatically, or executed after
// approval. It runs in the daily routine and again inside n8n "Marketing — Ad Actions" right before Meta is called.
//
//   node ceo-brain/agents/marketing/autopilot.js <plan-input.json>    -> JSON plan on stdout
//
// Plan input: { today: 'YYYY-MM-DD' (Singapore), settings: <the brand's autopilot note JSON>,
//   report: <mkDiagnose output> | diagnose_input: <mkDiagnose input>,
//   live: { account_daily_total, tracking_ok, data_age_hours, data_lag_hours,
//           ads: { <id>: { status: 'ACTIVE'|'PAUSED', budget_id, daily_budget, age_days } } },
//   ledger: [ { key, brand, date, kind: 'post'|'ad'|'credits'|'alert', object_id, tool, credits, status, ts } ],
//   posts: [ { network, text, media_urls, media_ai_people, scheduled_for } ],
//   jobs:  [ { tool: 'kling'|'higgsfield', est_credits, purpose } ] }
// A missing cap never means "unlimited": that part is switched off and the reason is given.

var AP_VERSION = 'mk-autopilot-2.0.0';
var AP_MAX_RAISE_PCT = 20;                     // a budget rises at most 20% per approved step
var AP_CONF_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3 };
var AP_NETWORKS = ['facebook', 'instagram', 'tiktok', 'gbp', 'linkedin', 'youtube', 'threads', 'pinterest'];
var AP_MEDIA_REQUIRED = ['instagram', 'tiktok', 'youtube', 'pinterest'];
var AP_TEXT_LIMIT = { instagram: 2200, tiktok: 2200, facebook: 5000, gbp: 1500, linkedin: 3000, threads: 500, youtube: 5000, pinterest: 500 };
var AP_LEVELS = ['OFF', 'READ_ONLY', 'APPROVAL_REQUIRED', 'LIMITED_AUTOMATION'];
var AP_CATEGORIES = ['posts', 'ads_pause', 'ads_budget', 'launch', 'generation', 'audience_destination'];
var AP_AUTO_ALLOWED = ['ads_pause'];           // automatic actions may only reduce spend
var AP_POLICY_KEYS = ['min_age_days', 'min_spend', 'freshness_hours', 'conversion_delay_hours', 'cooldown_hours', 'max_campaigns_per_day'];
// Singapore advertising code (ASAS) + platform policy + Ryan's rules: never in a post or ad.
var AP_BANNED = [
  { re: /\b(best|leading|top[- ]rated|no\.?\s?1|number one|unbeatable|world[- ]class)\b|#1\b/i, why: 'a superlative or "No. 1" claim (needs proof under the ASAS code)' },
  { re: /\b(guarantee[ds]?|100\s?%|risk[- ]free|permanent results?|miracle|cures?d?|painless)\b/i, why: 'a guarantee or promised result' },
  { re: /before\s*(and|&|\/)\s*after|after only/i, why: 'before/after content' },
  { re: /cheaper than|better than|unlike other/i, why: 'a comparison with competitors' },
  { re: /[★⭐]{3,}|\b(testimonial|client says|customer says|said one of our)\b/i, why: 'a testimonial or star rating' },
  { re: /\b(are you|do you feel|feeling)\b[^.?!]{0,40}\b(insecure|embarrassed|ashamed|self-conscious|ugly|unattractive|fat|depressed|lonely)\b|\b(do you (have|suffer from))\b|\byour (thin|sparse|patchy|uneven|bald|ugly|wrinkled|saggy)\b/i, why: 'a personal-attributes statement (Meta policy: never assert or imply a person\'s attributes; say "Brows that suit your face shape" instead)' },
  { re: /\b(sk-[a-z0-9]{8,}|api[_-]?key|password)\b/i, why: 'something that looks like a secret' }
];

function apNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function apStr(v) { return v === null || v === undefined ? '' : String(v); }
function apR2(v) { return Math.round(v * 100) / 100; }
function apArr(v) { return Array.isArray(v) ? v : []; }
function apOpen(level) { return level === 'APPROVAL_REQUIRED' || level === 'LIMITED_AUTOMATION'; }

/** Normalise a brand's settings: permission level per category, caps, approved facts. Gaps switch things off, with reasons. */
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
  // enabled = what may be PREPARED (proposals); auto = what may run without a click.
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

/** Stable JSON + cyrb53, identical to campaign-order.js (coCanon/coHash), so approvals can be checked inside n8n. */
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
/** An action may run on approval only if its proposal is QUEUED, unedited, unexpired and is exactly this action. */
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
function apDaysBetween(a, b) { var x = Date.parse(a + 'T00:00:00Z'), y = Date.parse(b + 'T00:00:00Z'); return isNaN(x) || isNaN(y) ? null : Math.round((y - x) / 86400000); }

function apAgeHours(r, nowIso) { var t = Date.parse(apStr(r && r.ts)); var n = Date.parse(nowIso || '') || Date.now(); return isNaN(t) ? null : (n - t) / 3600000; }

/** Turn the diagnosis into: automatic pauses (only under a complete pause policy), proposals that need approval,
 *  blocked items with reasons, and alerts. Broken tracking or stale data suspends every performance-driven change. */
function apAdPlan(report, live, settings, ledger, today, nowIso) {
  var s = settings && settings.enabled ? settings : apSettings(settings);
  live = live || {}; var liveAds = live.ads || {};
  var out = { actions: [], proposals: [], blocked: [], alerts: [], suspended: false };
  var ads = apArr(report && report.ads);
  if (!ads.length) return out;
  if (!s.enabled.ads) { out.blocked.push({ ad: '*', reason: 'Ad changes are ' + s.permissions.ads_pause + ' / ' + s.permissions.ads_budget + ' for this brand: recommendations only.' }); return out; }
  var pol = s.auto_pause_policy;
  var trackingBroken = live.tracking_ok === false || ads.some(function (a) { return apArr(a.findings).some(function (f) { return f.key === 'tracking_break'; }); });
  var stale = apNum(live.data_age_hours) !== null && pol.freshness_hours !== null && apNum(live.data_age_hours) > pol.freshness_hours;
  if (trackingBroken || stale) {
    out.suspended = true;
    out.alerts.push({ type: trackingBroken ? 'tracking' : 'stale_data', text: trackingBroken ? 'Tracking looks broken (leads stopped while clicks continued, or tracking failed its check). All performance-driven changes are suspended until it is fixed.' : 'The data is ' + live.data_age_hours + ' hours old (limit ' + pol.freshness_hours + '). Performance-driven changes are suspended until fresh data arrives.' });
  }
  var total = apNum(live.account_daily_total);
  if (total !== null && s.ads.max_daily_spend > 0 && total > s.ads.max_daily_spend + 0.005) out.alerts.push({ type: 'over_cap', text: 'Daily budgets add up to ' + apR2(total) + ' ' + s.currency + ', above your maximum of ' + s.ads.max_daily_spend + '. Nothing will be raised; lower a budget or raise the cap.' });
  var minRank = AP_CONF_RANK[s.ads.min_confidence];
  var active = Object.keys(liveAds).filter(function (id) { return liveAds[id] && liveAds[id].status === 'ACTIVE'; });
  var pausedToday = apArr(ledger).filter(function (r) { return r && r.kind === 'ad' && r.date === today && /\|pause_ad\|/.test(apStr(r.key)) && r.status === 'done'; }).length;
  var lastAutoPause = apArr(ledger).filter(function (r) { return r && r.kind === 'ad' && /\|pause_ad\|/.test(apStr(r.key)) && r.status === 'done' && /"auto":true/.test(apStr(r.detail)); })
    .map(function (r) { return apAgeHours(r, nowIso); }).filter(function (h) { return h !== null; }).sort(function (a, b) { return a - b; })[0];
  var pausedNow = {}, raisedBudget = {};
  ads.forEach(function (a) {
    var L = liveAds[a.id];
    if (a.decision === 'FIX TRACKING') { out.alerts.push({ type: 'tracking', ad: a.name, text: (a.name || a.id) + ': leads stopped while clicks continued. Tracking or the WhatsApp/form link is probably broken. Fix it before judging any creative.' }); return; }
    if (!L) { if (a.decision === 'KILL' || a.decision === 'SCALE') out.blocked.push({ ad: a.name || a.id, reason: 'Not found in the live ad account (or live budgets were not read).' }); return; }
    var conf = AP_CONF_RANK[a.confidence] || 0;
    if (a.decision === 'KILL') {
      if (L.status !== 'ACTIVE') return;
      if (conf < minRank) { out.blocked.push({ ad: a.name, reason: 'Kill verdict, but confidence ' + a.confidence + ' is below ' + s.ads.min_confidence + '. Waiting for more data.' }); return; }
      if (!apOpen(s.permissions.ads_pause)) { out.blocked.push({ ad: a.name, reason: 'Recommend pausing; pausing is ' + s.permissions.ads_pause + ' for this brand.' }); return; }
      var zeroLead = apArr(a.findings).some(function (f) { return f.key === 'spend_no_leads'; });
      var stillActive = active.filter(function (id) { return !pausedNow[id]; }).length;
      var last = s.ads.keep_one_active && stillActive <= 1;
      var item = { key: apKey(s.brand, today, 'pause_ad', a.id), type: 'pause_ad', ad_id: a.id, ad: a.name, why: a.why, confidence: a.confidence,
        risks: last ? ['It is the last active ad: pausing stops all advertising.'] : [] };
      if (apHasKey(ledger, item.key)) return;
      var notAuto = [];
      if (!s.auto.ads_pause) notAuto.push('auto-pause is not switched on');
      else {
        if (out.suspended) notAuto.push('tracking/data is not valid');
        if (last && !zeroLead) notAuto.push('it is the last active ad');
        if (!(apNum(L.age_days) >= pol.min_age_days)) notAuto.push('younger than ' + pol.min_age_days + ' days (or age unknown)');
        if (!(apNum(a.totals && a.totals.spend) >= pol.min_spend)) notAuto.push('spend below ' + pol.min_spend);
        if (pol.require_quality_check && !(report && report.crm_connected)) notAuto.push('no qualified-lead/sales check (CRM not connected)');
        if (!(apNum(live.data_lag_hours) >= pol.conversion_delay_hours)) notAuto.push('newest data is inside the ' + pol.conversion_delay_hours + '-hour conversion delay');
        if (lastAutoPause !== undefined && lastAutoPause < pol.cooldown_hours) notAuto.push('cool-down (' + pol.cooldown_hours + ' h) since the last automatic pause');
        if (pausedToday + out.actions.length >= pol.max_campaigns_per_day) notAuto.push('daily maximum of ' + pol.max_campaigns_per_day + ' automatic pauses reached');
      }
      pausedNow[a.id] = true;
      if (!notAuto.length) out.actions.push(Object.assign(item, { auto: true }));
      else out.proposals.push(Object.assign(item, { needs_approval_because: notAuto }));
      return;
    }
    if (a.decision === 'SCALE') {
      if (L.status !== 'ACTIVE') return;
      if (out.suspended) { out.blocked.push({ ad: a.name, reason: 'Winner, but performance changes are suspended until tracking/data is valid.' }); return; }
      if (conf < minRank) { out.blocked.push({ ad: a.name, reason: 'Scale verdict, but confidence ' + a.confidence + ' is below ' + s.ads.min_confidence + '.' }); return; }
      if (!s.enabled.ads_budget) { out.blocked.push({ ad: a.name, reason: apOpen(s.permissions.ads_budget) ? 'Winner, but no maximum daily spend is set, so no increase can be proposed.' : 'Winner; budget changes are ' + s.permissions.ads_budget + ' for this brand.' }); return; }
      if (total === null) { out.blocked.push({ ad: a.name, reason: 'The live daily budget total is unknown.' }); return; }
      var bid = L.budget_id || null, from = apNum(L.daily_budget);
      if (!bid || from === null || from <= 0) { out.blocked.push({ ad: a.name, reason: 'Its daily budget is unknown (lifetime budget, or several ad sets).' }); return; }
      if (raisedBudget[bid]) return;
      var recent = apArr(ledger).filter(function (r) { return r && r.kind === 'ad' && r.object_id === bid && /set_daily_budget/.test(apStr(r.key)) && r.status !== 'failed'; })
        .some(function (r) { var d = apDaysBetween(r.date, today); return d !== null && d < s.ads.raise_cooldown_days; });
      if (recent) { out.blocked.push({ ad: a.name, reason: 'Raised less than ' + s.ads.raise_cooldown_days + ' days ago; waiting so the platform\'s learning is not reset.' }); return; }
      var to = apR2(from * (1 + s.ads.max_raise_pct / 100));
      var room = apR2(s.ads.max_daily_spend - total);
      if (to - from > room) to = apR2(from + Math.max(0, room));
      if (to <= from + 0.004) { out.blocked.push({ ad: a.name, reason: 'Winner, but daily budgets are already at your maximum of ' + s.ads.max_daily_spend + ' ' + s.currency + '.' }); return; }
      var k2 = apKey(s.brand, today, 'set_daily_budget', bid);
      if (apHasKey(ledger, k2)) return;
      raisedBudget[bid] = true; total = apR2(total + (to - from));
      out.proposals.push({ key: k2, type: 'set_daily_budget', budget_id: bid, ad_id: a.id, ad: a.name, from: from, to: to, why: a.why, confidence: a.confidence,
        needs_approval_because: ['budget increases always need approval'], risks: ['A bigger budget can reset learning and raise cost per lead for a few days.'] });
    }
  });
  return out;
}

/** Final check right before Meta is called, with the budget re-read live. Pauses: automatic only under the policy
 *  (action.auto, already checked by apAdPlan) or with an approved proposal. Budget changes: approved proposal only. */
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

function apMonth(date) { return apStr(date).slice(0, 7); }

/** Credits: a job can be PROPOSED only with a price check first and inside the month's budget for that tool. */
function apCreditGuard(job, ledger, settings, today, extraSpent) {
  var s = settings && settings.enabled ? settings : apSettings(settings);
  job = job || {}; var tool = apStr(job.tool).toLowerCase();
  if (!apOpen(s.permissions.generation)) return { ok: false, reason: 'generation is ' + s.permissions.generation };
  var cap = s.credits.monthly[tool];
  if (!(cap > 0)) return { ok: false, reason: 'no monthly ' + (tool || '?') + ' budget set' };
  var est = apNum(job.est_credits);
  if (!(est > 0)) return { ok: false, reason: 'no price check before the job (est_credits missing)' };
  var spent = apArr(ledger).filter(function (r) { return r && r.kind === 'credits' && apStr(r.tool).toLowerCase() === tool && apMonth(r.date) === apMonth(today) && r.status !== 'failed'; })
    .reduce(function (a, r) { return a + (apNum(r.credits) || 0); }, 0) + (apNum(extraSpent) || 0);
  if (spent + est > cap) return { ok: false, reason: 'monthly ' + tool + ' budget: ' + spent + ' of ' + cap + ' used; this job needs ' + est, spent: spent, cap: cap };
  return { ok: true, reason: 'within budget (needs approval)', spent: spent, cap: cap, remaining_after: cap - spent - est };
}

/** Creative QA for posts and ad copy: approved facts and prices only, Singapore ad rules, Meta personal-attributes
 *  policy, media where the network needs it, daily limit per network (ledger rows carry the network in object_id). */
function apPostGuard(post, settings, ledger, today, extraToday) {
  var s = settings && settings.enabled ? settings : apSettings(settings);
  post = post || {}; var problems = [];
  var net = apStr(post.network).toLowerCase(), text = apStr(post.text);
  if (!apOpen(s.permissions.posts)) problems.push('posts are ' + s.permissions.posts + ' for this brand');
  if (!s.approved.claims.length) problems.push('no approved facts for this brand yet');
  if (s.posts.networks.indexOf(net) < 0) problems.push('network "' + net + '" is not switched on for this brand');
  if (AP_MEDIA_REQUIRED.indexOf(net) >= 0 && !apArr(post.media_urls).length) problems.push(net + ' needs a photo or video');
  if (post.media_ai_people === true) problems.push('AI-made people are not allowed (real footage only; never presented as real customers)');
  problems = problems.concat(apCopyProblems(text, s, net));
  var todayCount = apArr(ledger).filter(function (r) { return r && r.kind === 'post' && r.date === today && apStr(r.object_id).toLowerCase() === net && r.status !== 'failed'; }).length + (apNum(extraToday) || 0);
  if (todayCount >= s.posts.max_per_day) problems.push('daily post limit reached on ' + net + ' (' + s.posts.max_per_day + ')');
  return { ok: problems.length === 0, problems: problems };
}

/** The copy checks alone (also used for ad copy in campaign previews). */
function apCopyProblems(text, settings, net) {
  var s = settings && settings.enabled ? settings : apSettings(settings);
  var problems = [];
  text = apStr(text);
  if (text.trim().length < 20) problems.push('the text is too short');
  if (net && AP_TEXT_LIMIT[net] && text.length > AP_TEXT_LIMIT[net]) problems.push('the text is longer than ' + AP_TEXT_LIMIT[net] + ' characters');
  AP_BANNED.forEach(function (b) { if (b.re.test(text)) problems.push('contains ' + b.why); });
  var facts = s.approved.claims.join(' \n ');
  var prices = text.match(/(?:S\$|SGD\s?|\$)\s?\d[\d,]*(?:\.\d{1,2})?/gi) || [];
  prices.forEach(function (p) {
    var n = p.replace(/[^\d.]/g, '');
    var ok = s.approved.prices.some(function (ap) { return ap.replace(/[^\d.]/g, '') === n; });
    if (!ok) problems.push('price ' + p.trim() + ' is not on the approved price list');
  });
  var claimNums = text.match(/\d[\d,.]*\s?\+?\s?(?:%|reviews?|customers?|clients?|years?|stars?|brows|treatments?)/gi) || [];
  claimNums.forEach(function (c) { var n = (c.match(/\d[\d,.]*/) || [''])[0].replace(/,/g, ''); if (n && facts.replace(/,/g, '').indexOf(n) < 0) problems.push('the number in "' + c.trim() + '" is not in the approved facts'); });
  return problems;
}

/** Read the JSON settings block out of a vault note (```json … ```). */
function apParseNote(md) {
  var m = /```json\s*([\s\S]*?)```/.exec(apStr(md));
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return null; }
}

/** The whole daily plan for one brand: automatic pauses (policy only), proposals for everything else, blocked, alerts. */
function apPlan(input) {
  input = input || {};
  var s = apSettings(input.settings), today = apStr(input.today);
  var report = input.report || null;
  if (!report && input.diagnose_input && typeof require === 'function') report = require('./diagnose.js').mkDiagnose(input.diagnose_input);
  var ads = report ? apAdPlan(report, input.live, s, input.ledger, today, input.now) : { actions: [], proposals: [], blocked: [], alerts: [], suspended: false };
  var posted = {}, posts = apArr(input.posts).map(function (p, i) {
    var net = apStr(p.network).toLowerCase(), g = apPostGuard(p, s, input.ledger, today, posted[net] || 0);
    if (g.ok) posted[net] = (posted[net] || 0) + 1;
    return { network: net, scheduled_for: p.scheduled_for || null, ok: g.ok, needs_approval: true, problems: g.problems, key: apKey(s.brand, today, 'post', net + ':' + (p.scheduled_for || i)) };
  });
  var spent = { kling: 0, higgsfield: 0 }, jobs = apArr(input.jobs).map(function (j) {
    var t = apStr(j.tool).toLowerCase(), g = apCreditGuard(j, input.ledger, s, today, spent[t] || 0);
    if (g.ok) spent[t] = (spent[t] || 0) + apNum(j.est_credits);
    return { tool: t, purpose: j.purpose || '', est_credits: apNum(j.est_credits), ok: g.ok, needs_approval: true, reason: g.reason };
  });
  return {
    version: AP_VERSION, brand: s.brand, today: today, mode: s.mode, execute: s.mode === 'live',
    permissions: s.permissions, enabled: s.enabled, auto: s.auto, off_reasons: s.off_reasons,
    ads: ads, posts: posts, jobs: jobs,
    report_summary: report ? { money_leaks: report.money_leaks, working: report.working, demo: report.demo } : null
  };
}

// ---- Node module wrapper ----
if (typeof module !== 'undefined') {
  module.exports = { AP_VERSION: AP_VERSION, AP_MAX_RAISE_PCT: AP_MAX_RAISE_PCT, AP_BANNED: AP_BANNED, AP_LEVELS: AP_LEVELS, AP_CATEGORIES: AP_CATEGORIES,
    apSettings: apSettings, apAdPlan: apAdPlan, apGuardAdAction: apGuardAdAction, apCreditGuard: apCreditGuard, apPostGuard: apPostGuard,
    apCopyProblems: apCopyProblems, apParseNote: apParseNote, apPlan: apPlan, apKey: apKey, apCanon: apCanon, apHash: apHash,
    apProposalHash: apProposalHash, apApprovalValid: apApprovalValid };
  if (require.main === module) {
    var file = process.argv[2];
    if (!file) { console.error('usage: node autopilot.js <plan-input.json>'); process.exit(2); }
    process.stdout.write(JSON.stringify(apPlan(JSON.parse(require('fs').readFileSync(file, 'utf8'))), null, 2) + '\n');
  }
}
