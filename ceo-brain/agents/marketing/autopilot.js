// Marketing Team v4 — the AUTOPILOT guardrails (Ryan, 2026-10-13: "I want our agents to be doing all these").
// Ryan chose: posts fully automatic, ad changes automatic within his caps, video/image generation automatic within a
// monthly credit budget. The agents decide WHAT to do; this file decides whether it is ALLOWED. Every action passes
// through here first, in the daily routine (ceo-brain/agents/marketing/ROUTINE.md) and again inside the n8n
// "Marketing — Ad Actions" workflow right before Meta is called (live budget re-read). Numbers come from code.
//
//   node ceo-brain/agents/marketing/autopilot.js <plan-input.json>    -> JSON plan on stdout
//
// Plan input: { today: 'YYYY-MM-DD' (Singapore), settings: <the brand's autopilot note JSON>,
//   report: <mkDiagnose output> | diagnose_input: <mkDiagnose input>,
//   live: { account_daily_total, ads: { <ad id>: { status: 'ACTIVE'|'PAUSED', budget_id, daily_budget } } },
//   ledger: [ { key, brand, date, kind: 'post'|'ad'|'credits'|'alert', object_id, tool, credits, status } ],
//   posts: [ { network, text, media_urls, media_ai_people, scheduled_for } ],
//   jobs:  [ { tool: 'kling'|'higgsfield', est_credits, purpose } ] }
// A missing cap never means "unlimited": it switches that part of the autopilot off and says why.

var AP_VERSION = 'mk-autopilot-1.0.0';
var AP_MAX_RAISE_PCT = 20;                     // Ryan's ceiling: a budget rises at most 20% a day
var AP_CONF_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3 };
var AP_NETWORKS = ['facebook', 'instagram', 'tiktok', 'gbp', 'linkedin', 'youtube', 'threads', 'pinterest'];
var AP_MEDIA_REQUIRED = ['instagram', 'tiktok', 'youtube', 'pinterest'];
var AP_TEXT_LIMIT = { instagram: 2200, tiktok: 2200, facebook: 5000, gbp: 1500, linkedin: 3000, threads: 500, youtube: 5000, pinterest: 500 };
// Singapore advertising code (ASAS) + platform policy + Ryan's rules: never in an automatic post.
var AP_BANNED = [
  { re: /\b(best|leading|top[- ]rated|no\.?\s?1|number one|unbeatable|world[- ]class)\b|#1\b/i, why: 'a superlative or "No. 1" claim (needs proof under the ASAS code)' },
  { re: /\b(guarantee[ds]?|100\s?%|risk[- ]free|permanent results?|miracle|cures?d?|painless)\b/i, why: 'a guarantee or promised result' },
  { re: /before\s*(and|&|\/)\s*after|after only/i, why: 'before/after content' },
  { re: /cheaper than|better than|unlike other/i, why: 'a comparison with competitors' },
  { re: /[★⭐]{3,}|\b(testimonial|client says|customer says|said one of our)\b/i, why: 'a testimonial or star rating' },
  { re: /\b(sk-[a-z0-9]{8,}|api[_-]?key|password)\b/i, why: 'something that looks like a secret' }
];

function apNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function apStr(v) { return v === null || v === undefined ? '' : String(v); }
function apR2(v) { return Math.round(v * 100) / 100; }
function apArr(v) { return Array.isArray(v) ? v : []; }

/** Normalise a brand's autopilot settings. Missing caps switch that part off, with a plain-English reason. */
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
function apDaysBetween(a, b) { var x = Date.parse(a + 'T00:00:00Z'), y = Date.parse(b + 'T00:00:00Z'); return isNaN(x) || isNaN(y) ? null : Math.round((y - x) / 86400000); }

/** Turn the diagnosis into ad actions that fit Ryan's caps. Returns { actions, blocked, alerts }. */
function apAdPlan(report, live, settings, ledger, today) {
  var s = settings && settings.enabled ? settings : apSettings(settings);
  live = live || {}; var liveAds = live.ads || {};
  var out = { actions: [], blocked: [], alerts: [] };
  var ads = apArr(report && report.ads);
  if (!s.enabled.ads) { if (ads.length) out.blocked.push({ ad: '*', reason: s.off_reasons.filter(function (r) { return /^Ads|switched off/.test(r); }).join(' ') || 'Ads autopilot is off.' }); return out; }
  var total = apNum(live.account_daily_total);
  if (total === null) { out.blocked.push({ ad: '*', reason: 'The live daily budget total is unknown, so no ad is changed.' }); return out; }
  if (total > s.ads.max_daily_spend + 0.005) out.alerts.push({ type: 'over_cap', text: 'Daily budgets add up to ' + apR2(total) + ' ' + s.currency + ', above your maximum of ' + s.ads.max_daily_spend + '. Nothing will be raised; lower a budget in Ads Manager or raise the cap.' });
  var minRank = AP_CONF_RANK[s.ads.min_confidence];
  var active = Object.keys(liveAds).filter(function (id) { return liveAds[id] && liveAds[id].status === 'ACTIVE'; });
  var pausedNow = {}, raisedBudget = {};
  ads.forEach(function (a) {
    var L = liveAds[a.id];
    if (!L) { out.blocked.push({ ad: a.name || a.id, reason: 'Not found in the live ad account.' }); return; }
    var conf = AP_CONF_RANK[a.confidence] || 0;
    if (a.decision === 'FIX TRACKING') { out.alerts.push({ type: 'tracking', ad: a.name, text: (a.name || a.id) + ': leads stopped while clicks continued. Tracking or the WhatsApp/form link is probably broken. No budget change until fixed.' }); return; }
    if (a.decision === 'KILL') {
      if (L.status !== 'ACTIVE') return;
      if (conf < minRank) { out.blocked.push({ ad: a.name, reason: 'Kill verdict, but confidence ' + a.confidence + ' is below ' + s.ads.min_confidence + '. Waiting for more data.' }); return; }
      var zeroLead = apArr(a.findings).some(function (f) { return f.key === 'spend_no_leads'; });
      var stillActive = active.filter(function (id) { return !pausedNow[id]; }).length;
      if (s.ads.keep_one_active && stillActive <= 1 && !zeroLead) { out.blocked.push({ ad: a.name, reason: 'It is the last active ad; pausing would stop all advertising. Ryan is told instead.' }); return; }
      var k = apKey(s.brand, today, 'pause_ad', a.id);
      if (apHasKey(ledger, k)) return;
      pausedNow[a.id] = true;
      out.actions.push({ key: k, type: 'pause_ad', ad_id: a.id, ad: a.name, why: a.why, confidence: a.confidence });
      return;
    }
    if (a.decision === 'SCALE') {
      if (L.status !== 'ACTIVE') return;
      if (conf < minRank) { out.blocked.push({ ad: a.name, reason: 'Scale verdict, but confidence ' + a.confidence + ' is below ' + s.ads.min_confidence + '.' }); return; }
      var bid = L.budget_id || a.id, from = apNum(L.daily_budget);
      if (from === null || from <= 0) { out.blocked.push({ ad: a.name, reason: 'Its daily budget is unknown (lifetime budget or campaign budget not read).' }); return; }
      if (raisedBudget[bid]) return;
      var recent = apArr(ledger).filter(function (r) { return r && r.kind === 'ad' && r.object_id === bid && /set_daily_budget/.test(apStr(r.key)) && r.status !== 'failed'; })
        .some(function (r) { var d = apDaysBetween(r.date, today); return d !== null && d < s.ads.raise_cooldown_days; });
      if (recent) { out.blocked.push({ ad: a.name, reason: 'Raised less than ' + s.ads.raise_cooldown_days + ' days ago; waiting so Meta\'s learning is not reset.' }); return; }
      var to = apR2(from * (1 + s.ads.max_raise_pct / 100));
      var room = apR2(s.ads.max_daily_spend - total);
      if (to - from > room) to = apR2(from + Math.max(0, room));
      if (to <= from + 0.004) { out.blocked.push({ ad: a.name, reason: 'Winner, but daily budgets are already at your maximum of ' + s.ads.max_daily_spend + ' ' + s.currency + '.' }); return; }
      var k2 = apKey(s.brand, today, 'set_daily_budget', bid);
      if (apHasKey(ledger, k2)) return;
      raisedBudget[bid] = true; total = apR2(total + (to - from));
      out.actions.push({ key: k2, type: 'set_daily_budget', budget_id: bid, ad_id: a.id, ad: a.name, from: from, to: to, why: a.why, confidence: a.confidence });
    }
  });
  return out;
}

/** Final check right before Meta is called, with the budget re-read live. { ok, reason }. */
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

function apMonth(date) { return apStr(date).slice(0, 7); }

/** Credits: allowed only with a price check first and inside the month's budget for that tool. */
function apCreditGuard(job, ledger, settings, today, extraSpent) {
  var s = settings && settings.enabled ? settings : apSettings(settings);
  job = job || {}; var tool = apStr(job.tool).toLowerCase();
  if (s.mode === 'off' || !s.credits.auto) return { ok: false, reason: 'credit autopilot is off' };
  var cap = s.credits.monthly[tool];
  if (!(cap > 0)) return { ok: false, reason: 'no monthly ' + (tool || '?') + ' budget set' };
  var est = apNum(job.est_credits);
  if (!(est > 0)) return { ok: false, reason: 'no price check before the job (est_credits missing)' };
  var spent = apArr(ledger).filter(function (r) { return r && r.kind === 'credits' && apStr(r.tool).toLowerCase() === tool && apMonth(r.date) === apMonth(today) && r.status !== 'failed'; })
    .reduce(function (a, r) { return a + (apNum(r.credits) || 0); }, 0) + (apNum(extraSpent) || 0);
  if (spent + est > cap) return { ok: false, reason: 'monthly ' + tool + ' budget: ' + spent + ' of ' + cap + ' used; this job needs ' + est, spent: spent, cap: cap };
  return { ok: true, reason: 'within budget', spent: spent, cap: cap, remaining_after: cap - spent - est };
}

/** Posts: approved facts only, Singapore ad rules, media where the network needs it, daily limit per network
 *  (ledger rows for posts carry the network in object_id). */
function apPostGuard(post, settings, ledger, today, extraToday) {
  var s = settings && settings.enabled ? settings : apSettings(settings);
  post = post || {}; var problems = [];
  var net = apStr(post.network).toLowerCase(), text = apStr(post.text);
  if (s.mode === 'off' || !s.posts.auto) problems.push('automatic posting is off');
  if (!s.approved.claims.length) problems.push('no approved facts for this brand yet');
  if (s.posts.networks.indexOf(net) < 0) problems.push('network "' + net + '" is not switched on for this brand');
  if (AP_MEDIA_REQUIRED.indexOf(net) >= 0 && !apArr(post.media_urls).length) problems.push(net + ' needs a photo or video');
  if (post.media_ai_people === true) problems.push('AI-made people are not allowed in automatic posts (real footage only)');
  if (text.trim().length < 20) problems.push('the text is too short');
  if (AP_TEXT_LIMIT[net] && text.length > AP_TEXT_LIMIT[net]) problems.push('the text is longer than ' + AP_TEXT_LIMIT[net] + ' characters');
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
  var todayCount = apArr(ledger).filter(function (r) { return r && r.kind === 'post' && r.date === today && apStr(r.object_id).toLowerCase() === net && r.status !== 'failed'; }).length + (apNum(extraToday) || 0);
  if (todayCount >= s.posts.max_per_day) problems.push('daily post limit reached on ' + net + ' (' + s.posts.max_per_day + ')');
  return { ok: problems.length === 0, problems: problems };
}

/** Read the JSON settings block out of a vault note (```json … ```). */
function apParseNote(md) {
  var m = /```json\s*([\s\S]*?)```/.exec(apStr(md));
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return null; }
}

/** The whole daily plan for one brand. In dry_run nothing is executed: every item is marked would_do. */
function apPlan(input) {
  input = input || {};
  var s = apSettings(input.settings), today = apStr(input.today);
  var report = input.report || null;
  if (!report && input.diagnose_input && typeof require === 'function') report = require('./diagnose.js').mkDiagnose(input.diagnose_input);
  var ads = report ? apAdPlan(report, input.live, s, input.ledger, today) : { actions: [], blocked: [], alerts: [] };
  var posted = {}, posts = apArr(input.posts).map(function (p, i) {
    var net = apStr(p.network).toLowerCase(), g = apPostGuard(p, s, input.ledger, today, posted[net] || 0);
    if (g.ok) posted[net] = (posted[net] || 0) + 1;
    return { network: net, scheduled_for: p.scheduled_for || null, ok: g.ok, problems: g.problems, key: apKey(s.brand, today, 'post', net + ':' + (p.scheduled_for || i)) };
  });
  var spent = { kling: 0, higgsfield: 0 }, jobs = apArr(input.jobs).map(function (j) {
    var t = apStr(j.tool).toLowerCase(), g = apCreditGuard(j, input.ledger, s, today, spent[t] || 0);
    if (g.ok) spent[t] = (spent[t] || 0) + apNum(j.est_credits);
    return { tool: t, purpose: j.purpose || '', est_credits: apNum(j.est_credits), ok: g.ok, reason: g.reason };
  });
  return {
    version: AP_VERSION, brand: s.brand, today: today, mode: s.mode, execute: s.mode === 'live',
    enabled: s.enabled, off_reasons: s.off_reasons,
    ads: ads, posts: posts, jobs: jobs,
    report_summary: report ? { money_leaks: report.money_leaks, working: report.working, demo: report.demo } : null
  };
}

// ---- Node module wrapper ----
if (typeof module !== 'undefined') {
  module.exports = { AP_VERSION: AP_VERSION, AP_MAX_RAISE_PCT: AP_MAX_RAISE_PCT, AP_BANNED: AP_BANNED, apSettings: apSettings, apAdPlan: apAdPlan,
    apGuardAdAction: apGuardAdAction, apCreditGuard: apCreditGuard, apPostGuard: apPostGuard, apParseNote: apParseNote, apPlan: apPlan, apKey: apKey };
  if (require.main === module) {
    var file = process.argv[2];
    if (!file) { console.error('usage: node autopilot.js <plan-input.json>'); process.exit(2); }
    process.stdout.write(JSON.stringify(apPlan(JSON.parse(require('fs').readFileSync(file, 'utf8'))), null, 2) + '\n');
  }
}
