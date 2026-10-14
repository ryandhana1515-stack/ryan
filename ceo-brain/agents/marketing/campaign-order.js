// Marketing OS v5 (Ryan, 2026-10-14) — campaign orders, honest budget maths, proposals and approvals.
// The owner speaks ("Run 5 ads for eyebrow embroidery … $30 a day … keep cost per lead below $10"); the Marketing
// Director turns that into a CAMPAIGN_ORDER (words: AI). Everything numeric or binding happens here (numbers: code):
//   coOrder        — fill defaults from the Brand Brain, list every assumption, at most 3 decision-changing questions
//   coBudgetPlan   — total budget (never per platform unless the owner said so), best-case leads, consolidation
//   coPreviewCard  — the phone-friendly preview with ONE approval code
//   coProposal / coApprove / coPreExecute — approval binds to the exact payload; any edit or expiry voids it
//   coTransition   — job states DRAFT → AWAITING_APPROVAL → QUEUED → RUNNING → PROVIDER_PENDING → VERIFIED/FAILED/PARTIAL
//   coSafetyWord   — "STOP AUTOMATION" vs "PAUSE ALL MANAGED ADS" (different things, always confirmed)
//
//   node ceo-brain/agents/marketing/campaign-order.js <order.json>   -> { order, plan, card } on stdout

var CO_VERSION = 'mk-campaign-order-1.0.0';
// Platform minimums are account- and currency-dependent and change: null = "check in the ad platform" (never invented).
// TikTok's published minimums (USD) are kept as a warning only; recheck before relying on them.
var CO_MIN_DAILY = { meta: null, tiktok: { campaign: 50, ad_group: 20, currency: 'USD', note: 'TikTok published minimums (recheck)' }, google: null };
var CO_META_LEARNING_EVENTS_WEEK = 50;     // Meta's commonly cited learning guideline per ad set per week (recheck)
var CO_CONSOLIDATE_BELOW = 100;            // below this total daily budget: 1 campaign, 1 ad set, 3–5 ads
var CO_APPROVAL_TTL_HOURS = 48;
var CO_CODE_ALPHABET = 'ACDEFGHJKMNPQRTUVWXY3479';   // no 0/O, 1/I/L, 2/Z, 5/S, 6/B, 8 look-alikes
var CO_STATES = { DRAFT: ['AWAITING_APPROVAL'], AWAITING_APPROVAL: ['QUEUED', 'REJECTED', 'EXPIRED', 'CHANGES_REQUESTED'],
  QUEUED: ['RUNNING', 'EXPIRED'], RUNNING: ['PROVIDER_PENDING', 'VERIFIED', 'FAILED', 'PARTIAL'],
  PROVIDER_PENDING: ['VERIFIED', 'FAILED', 'PARTIAL'], VERIFIED: [], FAILED: [], PARTIAL: [], REJECTED: [], EXPIRED: [], CHANGES_REQUESTED: [] };

function coNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function coStr(v) { return v === null || v === undefined ? '' : String(v); }
function coArr(v) { return Array.isArray(v) ? v : (v === null || v === undefined || v === '' ? [] : [v]); }
function coR2(v) { return Math.round(v * 100) / 100; }

/** Stable JSON (sorted keys) so the same proposal always hashes the same. */
function coCanon(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
  if (Array.isArray(v)) return '[' + v.map(coCanon).join(',') + ']';
  return '{' + Object.keys(v).sort().filter(function (k) { return v[k] !== undefined; }).map(function (k) { return JSON.stringify(k) + ':' + coCanon(v[k]); }).join(',') + '}';
}
/** cyrb53: a fast pure-JS 53-bit hash (runs inside n8n Code nodes without crypto). Detects any edit to a proposal. */
function coHash(str) {
  var h1 = 0xdeadbeef, h2 = 0x41c6ce57, s = coStr(str);
  for (var i = 0; i < s.length; i++) { var ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}
function coCode(hash, salt) {
  var n = parseInt(coHash(hash + '|' + coStr(salt)).slice(-10), 16), out = '';
  for (var i = 0; i < 4; i++) { out += CO_CODE_ALPHABET[n % CO_CODE_ALPHABET.length]; n = Math.floor(n / CO_CODE_ALPHABET.length); }
  return out;
}

/** Fill a spoken order from the Brand Brain + defaults. Every filled gap is an assumption; ≤3 questions that change the decision. */
function coOrder(raw, brand) {
  raw = raw || {}; brand = brand || {};
  var assumptions = [], questions = [];
  var platforms = coArr(raw.platforms).map(function (p) { return coStr(p).toLowerCase(); }).filter(Boolean);
  if (!platforms.length) { platforms = ['meta']; assumptions.push('Platform: Meta (Facebook + Instagram), the default for local service leads.'); }
  var budget = coNum(raw.daily_budget);
  var scope = raw.budget_scope === 'per_platform' ? 'per_platform' : 'total';
  var total = budget === null ? null : (scope === 'per_platform' ? budget * platforms.length : budget);
  if (budget !== null && scope === 'total') assumptions.push('S$' + budget + '/day is the TOTAL across all ads and platforms, not per ad or per platform.');
  if (scope === 'per_platform') assumptions.push('You said S$' + budget + ' on EACH platform, so the total is S$' + total + '/day.');
  if (budget === null) questions.push({ key: 'budget', text: 'What is the most you want to spend per day in total?' });
  var ads = coNum(raw.ads) || coNum(raw.angles) || 3;
  if (coNum(raw.ads) === null) assumptions.push(ads + ' ads (one per angle).');
  var angles = coNum(raw.angles) || ads;
  var objective = coStr(raw.objective) || 'leads';
  if (!raw.objective) assumptions.push('Objective: leads.');
  var dest = coStr(raw.destination) || coStr(brand.default_destination);
  if (!dest) questions.push({ key: 'destination', text: 'Should leads go to a WhatsApp chat or an instant form?' });
  else if (!raw.destination) assumptions.push('Destination: ' + dest + ' (from the Brand Brain).');
  var creatives = coStr(raw.creatives);
  if (!creatives) questions.push({ key: 'creatives', text: 'Use your existing photos/videos, or should we generate new ones (cost card first)?' });
  var targetCpl = coNum(raw.target_cpl) || coNum(brand.target_cpl);
  if (!coNum(raw.target_cpl) && targetCpl) assumptions.push('Target cost per lead S$' + targetCpl + ' (from the brand targets).');
  if (!targetCpl && questions.length < 3) questions.push({ key: 'target_cpl', text: 'What cost per lead would you be happy with?' });
  var duration = coNum(raw.duration_days) || 7;
  if (!coNum(raw.duration_days)) assumptions.push('A ' + duration + '-day test, then review.');
  var placements = coStr(raw.placements) || (platforms.indexOf('meta') >= 0 ? 'FB+IG automatic' : 'automatic');
  if (!raw.placements) assumptions.push('Placements: automatic.');
  var aud = raw.audience || {};
  if (!aud.location) assumptions.push('Location: ' + (coStr(brand.country) || 'Singapore') + '.');
  return {
    type: 'CAMPAIGN_ORDER', version: CO_VERSION, brand: coStr(raw.brand) || coStr(brand.name) || null, service: coStr(raw.service) || null,
    country: coStr(raw.country) || coStr(brand.country) || 'SG',
    audience: { gender: coStr(aud.gender) || null, age: coStr(aud.age) || null, location: coStr(aud.location) || coStr(brand.country) || 'Singapore' },
    platforms: platforms, placements: placements, objective: objective, destination: dest || null,
    budget_scope: scope, total_daily_budget: total, currency: coStr(raw.currency) || coStr(brand.currency) || 'SGD',
    ads: ads, angles: angles, target_cpl: targetCpl, duration_days: duration, creatives: creatives || null,
    approval_required: true, assumptions: assumptions, questions: questions.slice(0, 3)
  };
}

/** Honest budget maths and the structure that fits it. */
function coBudgetPlan(order) {
  order = order || {};
  var total = coNum(order.total_daily_budget), cpl = coNum(order.target_cpl), ads = coNum(order.ads) || 1, days = coNum(order.duration_days) || 7;
  var warnings = [], notes = [];
  if (total === null) return { ok: false, reason: 'no daily budget yet', warnings: [], notes: [] };
  var perPlatform = coR2(total / Math.max(1, (order.platforms || []).length || 1));
  var bestLeadsDay = cpl ? total / cpl : null;
  var structure;
  if (total < CO_CONSOLIDATE_BELOW || (bestLeadsDay !== null && bestLeadsDay * 7 < CO_META_LEARNING_EVENTS_WEEK)) {
    structure = { campaigns: (order.platforms || ['meta']).length, ad_sets_per_campaign: 1, ads_per_ad_set: Math.min(Math.max(ads, 1), 5),
      why: 'With S$' + total + '/day the budget must not be split thin: 1 campaign' + ((order.platforms || []).length > 1 ? ' per platform' : '') + ', 1 ad set and ' + Math.min(ads, 5) + ' ads, one per angle.' };
    if (ads > 5) warnings.push('More than 5 ads on this budget spreads it too thin; start with the 5 strongest angles.');
  } else {
    structure = { campaigns: (order.platforms || ['meta']).length, ad_sets_per_campaign: Math.min(ads, Math.floor(total / 30) || 1), ads_per_ad_set: Math.ceil(ads / Math.max(1, Math.min(ads, Math.floor(total / 30) || 1))),
      why: 'The budget can carry separate ad sets of at least about S$30/day each.' };
  }
  if (bestLeadsDay !== null) {
    notes.push('S$' + total + '/day at S$' + cpl + ' per lead means about ' + (Math.round(bestLeadsDay * 10) / 10) + ' leads a day at best; the first days usually cost more while the platform learns.');
    if (bestLeadsDay * 7 < CO_META_LEARNING_EVENTS_WEEK && (order.platforms || []).indexOf('meta') >= 0)
      notes.push('That is about ' + Math.round(bestLeadsDay * 7) + ' leads a week, below the ~' + CO_META_LEARNING_EVENTS_WEEK + ' results a week Meta likes per ad set to finish learning, so expect "learning limited" and keep edits rare.');
  }
  (order.platforms || []).forEach(function (p) {
    var m = CO_MIN_DAILY[p];
    if (m && m.ad_group && perPlatform < m.ad_group) warnings.push(p + ': S$' + perPlatform + '/day may be below the platform minimum (' + m.note + ': ' + m.ad_group + ' ' + m.currency + ' per ad group, ' + m.campaign + ' per campaign).');
    if (m === null || m === undefined) notes.push(p + ': confirm the minimum daily budget for this account in the ad platform before launch.');
  });
  if ((order.platforms || []).indexOf('meta') >= 0) notes.push('Meta can spend somewhat more than the daily budget on a single day while keeping the week near 7× the daily budget (recheck the current rule); a pause also never stops spend at an exact amount because reporting lags.');
  notes.push('After ' + Math.min(days, 7) + ' days keep the 1–2 best angles and replace the rest (one change at a time: angle → hook → format → offer → audience).');
  return {
    ok: true, total_daily_budget: total, currency: order.currency || 'SGD', per_platform: perPlatform,
    test_days: days, test_total_spend: coR2(total * days),
    best_case_leads_per_day: bestLeadsDay === null ? null : Math.round(bestLeadsDay * 10) / 10,
    best_case_leads_test: bestLeadsDay === null ? null : Math.floor(bestLeadsDay * days),
    structure: structure, warnings: warnings, notes: notes
  };
}

/** A proposal binds tenant + account + action + exact payload. The code is derived from its hash. */
function coProposal(p, nowIso, ttlHours) {
  p = p || {};
  var body = { tenant: coStr(p.tenant), user: coStr(p.user), provider: coStr(p.provider), account: coStr(p.account), action: coStr(p.action),
    targets: coArr(p.targets).map(coStr), expected_state: p.expected_state || null, payload: p.payload || null, cost_impact: p.cost_impact || null };
  var hash = coHash(coCanon(body));
  var now = Date.parse(nowIso || '') || Date.now();
  var ttl = coNum(ttlHours) || CO_APPROVAL_TTL_HOURS;
  return Object.assign({}, body, {
    evidence: coArr(p.evidence), rollback: coStr(p.rollback) || null, reason: coStr(p.reason) || null, risks: coArr(p.risks),
    payload_hash: hash, code: coCode(hash, body.tenant), idempotency_key: [body.tenant, body.provider, body.account, hash].join('|'),
    status: 'AWAITING_APPROVAL', created_at: new Date(now).toISOString(), expires_at: new Date(now + ttl * 3600000).toISOString()
  });
}
function coRehash(proposal) {
  var b = proposal || {};
  return coHash(coCanon({ tenant: coStr(b.tenant), user: coStr(b.user), provider: coStr(b.provider), account: coStr(b.account), action: coStr(b.action),
    targets: coArr(b.targets).map(coStr), expected_state: b.expected_state || null, payload: b.payload || null, cost_impact: b.cost_impact || null }));
}

/** "APPROVE A7K2" / "REJECT A7K2" / "CHANGES A7K2 …". Approval only binds to the unedited, unexpired proposal. */
function coApprove(proposal, text, nowIso, approver) {
  var m = /^\s*(approve|reject|request changes|changes)\s+([A-Z0-9]{4})\b/i.exec(coStr(text));
  if (!m) return { ok: false, reason: 'say APPROVE <code>, REJECT <code> or CHANGES <code>' };
  var verb = m[1].toLowerCase(), code = m[2].toUpperCase();
  if (!proposal || proposal.code !== code) return { ok: false, reason: 'no proposal with code ' + code };
  if (proposal.status !== 'AWAITING_APPROVAL') return { ok: false, reason: 'proposal ' + code + ' is ' + proposal.status };
  var now = Date.parse(nowIso || '') || Date.now();
  if (now > Date.parse(proposal.expires_at)) return { ok: false, reason: 'proposal ' + code + ' expired at ' + proposal.expires_at + '; a fresh one is needed', status: 'EXPIRED' };
  if (coRehash(proposal) !== proposal.payload_hash) return { ok: false, reason: 'proposal ' + code + ' was edited after it was prepared; it needs a new approval', status: 'CHANGES_REQUESTED' };
  if (verb === 'reject') return { ok: true, status: 'REJECTED', reason: 'rejected by ' + coStr(approver) };
  if (verb !== 'approve') return { ok: true, status: 'CHANGES_REQUESTED', reason: 'changes requested' };
  return { ok: true, status: 'QUEUED', approved_at: new Date(now).toISOString(), approved_by: coStr(approver) || null, approved_hash: proposal.payload_hash };
}

/** Just before executing: approval still valid, state unchanged, permission and caps still allow it, not done before. */
function coPreExecute(proposal, live, opts) {
  opts = opts || {}; live = live || {};
  if (!proposal || proposal.status !== 'QUEUED') return { ok: false, reason: 'not approved (status ' + coStr(proposal && proposal.status) + ')' };
  if (proposal.approved_hash !== proposal.payload_hash || coRehash(proposal) !== proposal.payload_hash) return { ok: false, reason: 'payload changed after approval' };
  var now = Date.parse(opts.now || '') || Date.now();
  if (now > Date.parse(proposal.expires_at)) return { ok: false, reason: 'approval expired' };
  if (opts.token_expired) return { ok: false, reason: 'the provider connection expired: reconnect (OAuth) before any write', reauth: true };
  if (opts.permission && ['OFF', 'READ_ONLY'].indexOf(opts.permission) >= 0) return { ok: false, reason: 'this action category is ' + opts.permission };
  if (opts.tracking_stale) return { ok: false, reason: 'tracking is stale or broken: performance-driven changes are suspended' };
  var exp = proposal.expected_state || {};
  var diff = Object.keys(exp).filter(function (k) { return coCanon(exp[k]) !== coCanon(live[k]); });
  if (diff.length) return { ok: false, reason: 'the account changed since approval (' + diff.join(', ') + '); prepare a fresh proposal' };
  if ((opts.done_keys || []).indexOf(proposal.idempotency_key) >= 0) return { ok: false, reason: 'already executed (same idempotency key)', duplicate: true };
  if (opts.cap !== undefined && coNum(opts.projected_total) !== null && coNum(opts.projected_total) > coNum(opts.cap)) return { ok: false, reason: 'would exceed the daily cap of ' + opts.cap };
  return { ok: true, reason: 'ready to execute' };
}

function coTransition(job, to) {
  var from = job && job.status;
  if (!CO_STATES[from] || CO_STATES[from].indexOf(to) < 0) return { ok: false, reason: 'cannot go from ' + from + ' to ' + to };
  return { ok: true, job: Object.assign({}, job, { status: to }) };
}

/** The two safety words are different and are always confirmed back. */
function coSafetyWord(text) {
  var t = coStr(text).toUpperCase();
  if (/STOP\s+AUTOMATION/.test(t)) return { word: 'STOP_AUTOMATION', confirm: 'Switching OFF all AI automation (no more automatic changes). Your ads keep running. Reply YES to confirm, or say PAUSE ALL MANAGED ADS if you want the ads stopped too.' };
  if (/PAUSE\s+ALL\s+MANAGED\s+ADS/.test(t)) return { word: 'PAUSE_ALL_MANAGED_ADS', confirm: 'Pausing EVERY ad we manage, then checking each one really shows Paused. Spend can lag a little after a pause. Reply YES to confirm, or say STOP AUTOMATION if you only want the AI to stop changing things.' };
  return null;
}

/** Unfilled facts ("[ASK RYAN …]", "[CLIENT TO PROVIDE]") anywhere in what would be launched. */
function coPlaceholders(v) {
  var found = [];
  (function walk(x) {
    if (typeof x === 'string') { var m = x.match(/\[(ASK RYAN|CLIENT TO PROVIDE|VERIFY)[^\]]*\]/gi); if (m) found = found.concat(m); }
    else if (x && typeof x === 'object') Object.keys(x).forEach(function (k) { walk(x[k]); });
  })(v);
  return found;
}

/** The phone-friendly preview card (one approval code). */
function coPreviewCard(order, plan, proposal, angles) {
  var L = [];
  L.push('📣 ' + (order.brand || 'Brand') + ' — ' + (order.service || 'campaign') + ' · ' + (order.platforms || []).join(' + ').toUpperCase());
  L.push('Budget: S$' + plan.total_daily_budget + '/day TOTAL · ' + plan.test_days + '-day test · max S$' + plan.test_total_spend);
  if (plan.best_case_leads_per_day !== null) L.push('Honest maths: ~' + plan.best_case_leads_per_day + ' leads/day at best at S$' + order.target_cpl + '/lead (first days cost more).');
  L.push('Structure: ' + plan.structure.why);
  L.push('Audience: ' + [order.audience.gender, order.audience.age, order.audience.location].filter(Boolean).join(', ') + ' · ' + order.placements);
  L.push('Destination: ' + (order.destination || '❓ to confirm'));
  (angles || []).forEach(function (a, i) { L.push((i + 1) + '. ' + coStr(a.angle) + ' — "' + coStr(a.hook) + '"'); });
  if (plan.warnings.length) L.push('⚠️ ' + plan.warnings.join(' '));
  if (order.assumptions.length) L.push('Assumed: ' + order.assumptions.join(' '));
  if (order.questions.length) L.push('❓ ' + order.questions.map(function (q) { return q.text; }).join(' '));
  var gaps = coPlaceholders(angles);
  if (!proposal && gaps.length) L.push('No approval code yet: ' + gaps.length + ' fact(s) still needed from you: ' + gaps.join(' · '));
  if (proposal) L.push('Reply APPROVE ' + proposal.code + ' to launch (expires ' + proposal.expires_at.slice(0, 16).replace('T', ' ') + ' UTC) · REJECT ' + proposal.code + ' · CHANGES ' + proposal.code + ' …');
  return L.join('\n');
}

// ---- Node module wrapper ----
if (typeof module !== 'undefined') {
  module.exports = { CO_VERSION: CO_VERSION, CO_MIN_DAILY: CO_MIN_DAILY, CO_STATES: CO_STATES, coCanon: coCanon, coHash: coHash, coCode: coCode,
    coOrder: coOrder, coBudgetPlan: coBudgetPlan, coProposal: coProposal, coRehash: coRehash, coApprove: coApprove, coPreExecute: coPreExecute,
    coTransition: coTransition, coSafetyWord: coSafetyWord, coPreviewCard: coPreviewCard, coPlaceholders: coPlaceholders };
  if (require.main === module) {
    var file = process.argv[2];
    if (!file) { console.error('usage: node campaign-order.js <order.json>'); process.exit(2); }
    var input = JSON.parse(require('fs').readFileSync(file, 'utf8'));
    var order = coOrder(input.order || input, input.brand), plan = coBudgetPlan(order);
    var proposal = order.questions.length || !plan.ok || coPlaceholders(input.angles).length ? null : coProposal({ tenant: input.tenant || order.brand, user: input.user || 'owner', provider: input.provider || 'pending', account: input.account || 'pending', action: 'launch_campaign', payload: { order: order, angles: input.angles || [] }, cost_impact: { daily: plan.total_daily_budget, max_test_spend: plan.test_total_spend } }, input.now);
    process.stdout.write(JSON.stringify({ order: order, plan: plan, proposal: proposal, card: plan.ok ? coPreviewCard(order, plan, proposal, input.angles) : null }, null, 2) + '\n');
  }
}
