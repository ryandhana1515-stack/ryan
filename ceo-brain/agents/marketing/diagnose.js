// Marketing Team v4 — the ads diagnosis engine (Ryan's "FUSION AI COMPLETE AI MARKETING TEAM (v4)", section 6 + 9).
// Numbers come from code, words come from AI: this file computes every metric and every verdict. The agents
// (.claude/agents/ads-intelligence.md, marketing-director.md) run it and only explain the result in plain English.
//
//   node ceo-brain/agents/marketing/diagnose.js <input.json>        -> JSON report on stdout
//
// Input (one brand, one period; DEMO data must say demo: true):
//   { brand, currency, demo, period: { from, to }, data_as_of,
//     targets: { cpl, cpql, cpa, roas, ctr_link, cpm, freq_cap, hook_rate, hold_rate, first_reply_minutes, qualified_rate },
//     rules:   { ...overrides of MK_DEFAULT_RULES },
//     ads: [ { id, name, platform, days: [ { date, spend, impressions, reach, clicks, link_clicks, video_3s, thruplays,
//              lp_views, leads, conversations, qualified, appointments, sales, revenue } ] } ],
//     crm: { connected, first_reply_minutes_median, followups_due, followups_on_time } }
// Missing fields stay missing (null): a ratio with a missing or zero denominator is "—", never 0.

var MK_VERSION = 'mk-diagnose-1.0.0';
// Starting heuristics only (section 6.3), configurable per company. Not universal laws.
var MK_DEFAULT_RULES = {
  min_spend_target_multiple: 1.5,   // below this × target CPL spent → NOT ENOUGH DATA YET
  min_impressions: 1000,
  kill_zero_lead_spend_multiple: 2.5,  // spend ≥ this × target CPL with 0 leads → KILL
  kill_cpl_multiple: 1.75,          // CPL > this × target after enough data → KILL
  keep_band: 1.2,                   // CPL within target × this → KEEP
  scale_stable_days: 3,             // CPL at/below target on each of the last N days → SCALE
  scale_step: '+15–25% every 3–4 days (or duplicate into a new ad set)',
  fatigue_ctr_drop: 0.25,           // last third CTR ≥ 25% below first third
  fatigue_freq_rise: 0.3,           // frequency up ≥ 30%
  tracking_zero_days: 2,            // leads 0 for ≥ N days after a healthy average while clicks hold
  tracking_min_avg_leads: 2,
  low_quality_rate: 0.3,            // qualified ÷ leads below this = poor lead quality (if no target)
  hook_rate_floor: 0.25,
  hold_rate_floor: 0.25,
  ctr_floor: 0.008,
  lp_conv_floor: 0.05,              // leads ÷ link clicks below this with good CTR = destination problem
  slow_reply_minutes: 30
};

function mkNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function mkSum(days, k) {
  var any = false, t = 0;
  (days || []).forEach(function (d) { var v = mkNum(d && d[k]); if (v !== null) { any = true; t += v; } });
  return any ? t : null;
}
/** a ÷ b; null ("—") when either side is missing or b is 0. */
function mkDiv(a, b) { return a === null || b === null || b === 0 ? null : a / b; }
function mkRound(v, dp) { if (v === null) return null; var f = Math.pow(10, dp === undefined ? 4 : dp); return Math.round(v * f) / f; }

var MK_FIELDS = ['spend', 'impressions', 'reach', 'clicks', 'link_clicks', 'video_3s', 'thruplays', 'lp_views', 'leads', 'conversations', 'qualified', 'appointments', 'sales', 'revenue'];

/** Totals + every ratio from the totals (never an average of daily ratios). Section 9. */
function mkMetrics(days) {
  var t = {}; MK_FIELDS.forEach(function (k) { t[k] = mkSum(days, k); });
  var m = {
    cpm: mkDiv(t.spend === null ? null : t.spend * 1000, t.impressions),
    frequency: mkDiv(t.impressions, t.reach),
    ctr_link: mkDiv(t.link_clicks, t.impressions),
    cpc: mkDiv(t.spend, t.link_clicks),
    hook_rate: mkDiv(t.video_3s, t.impressions),
    hold_rate: mkDiv(t.thruplays, t.video_3s),
    dest_conv: mkDiv(t.leads, t.link_clicks),
    cpl: mkDiv(t.spend, t.leads),
    qualified_rate: mkDiv(t.qualified, t.leads),
    cpql: mkDiv(t.spend, t.qualified),
    appointment_rate: mkDiv(t.appointments, t.qualified),
    close_rate: mkDiv(t.sales, t.qualified),
    cac: mkDiv(t.spend, t.sales),
    roas: mkDiv(t.revenue, t.spend)
  };
  Object.keys(m).forEach(function (k) { m[k] = mkRound(m[k], 4); });
  return { totals: t, metrics: m };
}

function mkThirds(days) {
  var d = (days || []).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
  var n = Math.max(1, Math.floor(d.length / 3));
  return { first: d.slice(0, n), last: d.slice(d.length - n), all: d };
}

function mkStatus(value, target, better) {
  if (value === null) return { light: 'grey', note: 'no data' };
  if (target === null || target === undefined) return { light: 'grey', note: 'no target (compare with own history)' };
  var ok = better === 'lower' ? value <= target : value >= target;
  var near = better === 'lower' ? value <= target * 1.2 : value >= target * 0.8;
  return { light: ok ? 'green' : near ? 'yellow' : 'red', note: (better === 'lower' ? '≤ ' : '≥ ') + target };
}

/** Diagnose one ad (or campaign) over the period. */
function mkDiagnoseAd(ad, targets, rules, crm) {
  targets = targets || {}; rules = Object.assign({}, MK_DEFAULT_RULES, rules || {}); crm = crm || {};
  var days = (ad.days || []).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
  var all = mkMetrics(days), t = all.totals, m = all.metrics;
  var th = mkThirds(days), f = mkMetrics(th.first).metrics, l = mkMetrics(th.last).metrics;
  var findings = [];
  var add = function (key, stage, observation, hypotheses, verify, action) { findings.push({ key: key, stage: stage, observation: observation, hypotheses: hypotheses, verify: verify, action: action }); };
  var tcpl = mkNum(targets.cpl);
  var spend = t.spend || 0;

  // Minimum data (section 6.3): judge only with enough spend or impressions.
  var enough = (tcpl ? spend >= tcpl * rules.min_spend_target_multiple : false) || (t.impressions || 0) >= rules.min_impressions * 3;

  // Stage 4/5 — spend with zero leads, and broken tracking.
  var leadsByDay = days.map(function (d) { return mkNum(d.leads) || 0; });
  var tail = leadsByDay.slice(-rules.tracking_zero_days);
  var head = leadsByDay.slice(0, Math.max(0, leadsByDay.length - rules.tracking_zero_days));
  var headAvg = head.length ? head.reduce(function (a, b) { return a + b; }, 0) / head.length : 0;
  var clicksHead = mkSum(days.slice(0, head.length), 'link_clicks'), clicksTail = mkSum(days.slice(-tail.length), 'link_clicks');
  var clicksHold = clicksHead !== null && clicksTail !== null && head.length && tail.length
    ? (clicksTail / tail.length) >= 0.7 * (clicksHead / head.length) : false;
  if (tail.length === rules.tracking_zero_days && tail.every(function (x) { return x === 0; }) && headAvg >= rules.tracking_min_avg_leads && clicksHold) {
    add('tracking_break', 4, 'Leads fell to 0 for the last ' + tail.length + ' days (average before: ' + mkRound(headAvg, 1) + '/day) while link clicks held up.',
      ['The form, WhatsApp link or tracking (pixel / Conversions API) may have broken', 'The ad may have been changed to a different destination'],
      ['Open the ad on a phone and complete the form / start the WhatsApp chat', 'Check the pixel/CAPI events and the ad\'s destination'],
      'FIX TRACKING');
  } else if (tcpl && spend >= tcpl * rules.kill_zero_lead_spend_multiple && (t.leads || 0) === 0) {
    add('spend_no_leads', 4, 'Spent ' + mkRound(spend, 2) + ' (≥ ' + rules.kill_zero_lead_spend_multiple + '× target CPL ' + tcpl + ') with 0 leads.',
      ['Tracking, form or destination may be broken', 'Wrong objective, or the ad is limited/rejected', 'The offer may not appeal'],
      ['Check the ad status and events', 'Test the destination end to end'], 'PAUSE');
  }

  // Stage 1 — delivery cost.
  if (mkNum(targets.cpm) && m.cpm !== null && m.cpm > targets.cpm * 1.3) add('high_cpm', 1, 'CPM ' + mkRound(m.cpm, 2) + ' vs target ' + targets.cpm + '.',
    ['The audience may be too narrow', 'Seasonal competition', 'Low relevance of the creative', 'Too many ad sets splitting the budget'],
    ['Check audience size, placements and relevance diagnostics'], 'ADJUST TARGETING / CONSOLIDATE');

  // Creative fatigue — frequency up, CTR down, CPL up across the period.
  var ctrDrop = f.ctr_link && l.ctr_link !== null ? (f.ctr_link - l.ctr_link) / f.ctr_link : null;
  var freqRise = f.frequency && l.frequency !== null ? (l.frequency - f.frequency) / f.frequency : null;
  if (ctrDrop !== null && ctrDrop >= rules.fatigue_ctr_drop && freqRise !== null && freqRise >= rules.fatigue_freq_rise) {
    add('creative_fatigue', 2, 'Link CTR fell ' + Math.round(ctrDrop * 100) + '% from the start to the end of the period while frequency rose ' + Math.round(freqRise * 100) + '%' +
      (f.cpl !== null && l.cpl !== null ? ' and CPL went from ' + mkRound(f.cpl, 2) + ' to ' + mkRound(l.cpl, 2) : '') + '.',
      ['The same people may be seeing this creative too often'], ['Compare frequency and CTR by day; check whether newer ads hold up better'],
      'CREATE REPLACEMENT (new hooks on the winning angle first)');
  }

  // Stage 2 — attention (video).
  var hookT = mkNum(targets.hook_rate) || rules.hook_rate_floor, holdT = mkNum(targets.hold_rate) || rules.hold_rate_floor;
  if (m.hook_rate !== null && (t.impressions || 0) >= rules.min_impressions && m.hook_rate < hookT) {
    add('low_hook', 2, 'Hook rate ' + Math.round(m.hook_rate * 100) + '% (3-second views ÷ impressions) vs ' + Math.round(hookT * 100) + '%.',
      ['The first 1–3 seconds may not stop the scroll (slow intro, logo first, no pattern interrupt)'], ['Compare hooks across ads with the same body'],
      'CREATE REPLACEMENT (new hooks, same body — cheapest test)');
  } else if (m.hold_rate !== null && m.hook_rate !== null && m.hook_rate >= hookT && m.hold_rate < holdT) {
    add('low_hold', 2, 'Good hook (' + Math.round(m.hook_rate * 100) + '%) but hold rate ' + Math.round(m.hold_rate * 100) + '% vs ' + Math.round(holdT * 100) + '%.',
      ['The middle may be slow or the promise in the hook is not paid off'], ['Watch the video at 15 seconds: is the proof/demo shown yet?'],
      'RE-EDIT (faster pacing, proof earlier)');
  }

  // Stage 3/4 — click and destination.
  var ctrT = mkNum(targets.ctr_link) || rules.ctr_floor;
  if (m.ctr_link !== null && (t.impressions || 0) >= rules.min_impressions && m.ctr_link < ctrT && !findings.some(function (x) { return x.key === 'creative_fatigue'; })) {
    add('low_ctr', 3, 'Link CTR ' + mkRound(m.ctr_link * 100, 2) + '% vs ' + mkRound(ctrT * 100, 2) + '%.',
      ['The offer or call to action may be weak or unclear'], ['Compare CTR of ads with different offers/CTAs'], 'NEW TEST (offer / CTA)');
  }
  if (m.ctr_link !== null && m.ctr_link >= ctrT && m.dest_conv !== null && (t.link_clicks || 0) >= 50 && m.dest_conv < rules.lp_conv_floor && !findings.some(function (x) { return x.key === 'tracking_break'; })) {
    add('destination_leak', 4, 'Good CTR (' + mkRound(m.ctr_link * 100, 2) + '%) but only ' + mkRound(m.dest_conv * 100, 1) + '% of clicks become leads.',
      ['The landing page, form or WhatsApp step may lose people (slow page, mismatch with the ad, too many fields, nobody replying)', 'Tracking may undercount'],
      ['Open the destination on mobile; test the form; check reply times'], 'FIX DESTINATION / TRACKING');
  }

  // Stage 6 — lead quality (needs CRM).
  var qT = mkNum(targets.qualified_rate) || rules.low_quality_rate;
  var crmOn = crm.connected === true && t.qualified !== null;
  if (crmOn && m.qualified_rate !== null && (t.leads || 0) >= 10 && m.qualified_rate < qT && (tcpl === null || m.cpl === null || m.cpl <= tcpl * rules.keep_band)) {
    add('cheap_low_quality', 6, 'Leads look cheap (CPL ' + mkRound(m.cpl, 2) + (tcpl ? ' vs target ' + tcpl : '') + ') but only ' + Math.round(m.qualified_rate * 100) + '% are qualified (target ' + Math.round(qT * 100) + '%).',
      ['The form may be too easy', 'The hook may attract the wrong people', 'The campaign may optimise for a shallow event'],
      ['Read 10 recent leads in the CRM: why were they not qualified?'], 'ADD QUALIFYING QUESTIONS / HIGHER-INTENT FORM');
  }

  // Stage 7 — good leads, few sales → follow-up first.
  var slow = mkNum(crm.first_reply_minutes_median), due = mkNum(crm.followups_due), onTime = mkNum(crm.followups_on_time);
  var discipline = mkDiv(onTime, due);
  var replyT = mkNum(targets.first_reply_minutes) || rules.slow_reply_minutes;
  if (crmOn && m.qualified_rate !== null && m.qualified_rate >= qT && (t.qualified || 0) >= 5 && (m.close_rate === null || m.close_rate < 0.15) &&
      ((slow !== null && slow > replyT) || (discipline !== null && discipline < 0.7))) {
    add('slow_follow_up', 7, 'Good leads (' + Math.round(m.qualified_rate * 100) + '% qualified) but few sales (' + (t.sales || 0) + ' from ' + t.qualified + ' qualified)' +
      (slow !== null ? '; median first reply ' + slow + ' min (target ' + replyT + ')' : '') + (discipline !== null ? '; follow-ups on time ' + Math.round(discipline * 100) + '%' : '') + '.',
      ['Sales follow-up may be too slow or stop after the first message'], ['Check reply times and follow-up counts per salesperson in the CRM'],
      'IMPROVE FOLLOW-UP (before spending more on ads)');
  }

  // Decision (section 6.3).
  var decision, why;
  var p1 = findings.some(function (x) { return x.key === 'tracking_break' || x.key === 'spend_no_leads'; });
  var lastN = days.slice(-rules.scale_stable_days);
  var stable = tcpl && lastN.length === rules.scale_stable_days && lastN.every(function (d) { var c = mkDiv(mkNum(d.spend), mkNum(d.leads)); return c !== null && c <= tcpl; });
  if (findings.some(function (x) { return x.key === 'tracking_break'; })) { decision = 'FIX TRACKING'; why = 'leads stopped while clicks continued'; }
  else if (findings.some(function (x) { return x.key === 'spend_no_leads'; })) { decision = 'KILL'; why = 'spend ≥ ' + rules.kill_zero_lead_spend_multiple + '× target CPL with no leads'; }
  else if (!enough) { decision = 'NOT ENOUGH DATA YET'; why = 'needs spend ≥ ' + rules.min_spend_target_multiple + '× target CPL or more impressions'; }
  else if (tcpl && m.cpl !== null && m.cpl > tcpl * rules.kill_cpl_multiple) { decision = 'KILL'; why = 'CPL ' + mkRound(m.cpl, 2) + ' > ' + rules.kill_cpl_multiple + '× target ' + tcpl; }
  else if (findings.some(function (x) { return x.key === 'slow_follow_up'; })) { decision = 'KEEP + IMPROVE FOLLOW-UP'; why = 'the ad brings good leads; sales follow-up is the leak'; }
  else if (findings.some(function (x) { return x.key === 'cheap_low_quality'; })) { decision = 'ITERATE'; why = 'cheap leads but low quality'; }
  else if (findings.some(function (x) { return x.key === 'creative_fatigue'; })) { decision = 'ITERATE'; why = 'winning angle is fatiguing: new hooks before abandoning it'; }
  else if (stable && (!crmOn || m.qualified_rate === null || m.qualified_rate >= qT) && (m.frequency === null || !mkNum(targets.freq_cap) || m.frequency <= targets.freq_cap)) {
    decision = 'SCALE'; why = 'CPL at/below target on each of the last ' + rules.scale_stable_days + ' days; increase ' + rules.scale_step + '; avoid big jumps and frequent edits (learning resets)';
  }
  else if (tcpl && m.cpl !== null && m.cpl <= tcpl * rules.keep_band) { decision = 'KEEP'; why = 'within the target band'; }
  else if (tcpl && m.cpl !== null) { decision = 'ITERATE'; why = 'CPL above target band but not at kill level'; }
  else { decision = 'KEEP'; why = 'no target set: compare with own history'; }

  var scorecard = {
    1: mkStatus(m.cpm, mkNum(targets.cpm), 'lower'),
    2: mkStatus(m.hook_rate, hookT, 'higher'),
    3: mkStatus(m.ctr_link, ctrT, 'higher'),
    4: mkStatus(m.dest_conv, rules.lp_conv_floor, 'higher'),
    5: mkStatus(m.cpl, tcpl, 'lower'),
    6: crmOn ? mkStatus(m.qualified_rate, qT, 'higher') : { light: 'grey', note: 'CRM not connected' },
    7: crmOn ? mkStatus(m.roas, mkNum(targets.roas), 'higher') : { light: 'grey', note: 'CRM not connected' }
  };
  var confidence = !enough ? 'LOW' : (tcpl && spend >= tcpl * 4) || (t.impressions || 0) >= rules.min_impressions * 10 ? 'HIGH' : 'MEDIUM';
  return { id: ad.id, name: ad.name, platform: ad.platform || null, days: days.length, totals: t, metrics: m, scorecard: scorecard,
    findings: findings, decision: decision, why: why, confidence: confidence, approval_needed: /KILL|SCALE|PAUSE/.test(decision) ? 'yes' : 'no',
    discipline: mkRound(discipline, 4) };
}

/** The whole report: per-ad diagnosis + account totals + top money leaks. */
function mkDiagnose(input) {
  input = input || {};
  var ads = (input.ads || []).map(function (a) { return mkDiagnoseAd(a, input.targets, input.rules, input.crm); });
  var allDays = []; (input.ads || []).forEach(function (a) { allDays = allDays.concat(a.days || []); });
  var account = mkMetrics(allDays);
  var leaks = [];
  ads.forEach(function (a) { a.findings.forEach(function (fd) { leaks.push({ ad: a.name, key: fd.key, stage: fd.stage, observation: fd.observation, action: fd.action, spend: a.totals.spend || 0 }); }); });
  leaks.sort(function (x, y) { return x.stage - y.stage || y.spend - x.spend; });
  return {
    version: MK_VERSION, brand: input.brand || null, currency: input.currency || null, demo: input.demo === true,
    period: input.period || null, data_as_of: input.data_as_of || null, source: input.source || (input.demo ? 'DEMO data' : 'not stated'),
    crm_connected: !!(input.crm && input.crm.connected),
    account: account, ads: ads, money_leaks: leaks.slice(0, 3),
    working: ads.filter(function (a) { return a.decision === 'SCALE' || a.decision === 'KEEP'; }).map(function (a) { return a.name + ': ' + a.decision; }),
    labels: { conversions: 'PLATFORM-REPORTED unless crm_connected (then qualified/sales are CRM-CONFIRMED)' }
  };
}

// ---- Node module wrapper ----
if (typeof module !== 'undefined') {
  module.exports = { MK_VERSION: MK_VERSION, MK_DEFAULT_RULES: MK_DEFAULT_RULES, mkMetrics: mkMetrics, mkDiv: mkDiv, mkDiagnoseAd: mkDiagnoseAd, mkDiagnose: mkDiagnose };
  if (require.main === module) {
    var file = process.argv[2];
    if (!file) { console.error('usage: node diagnose.js <input.json>'); process.exit(2); }
    var input = JSON.parse(require('fs').readFileSync(file, 'utf8'));
    process.stdout.write(JSON.stringify(mkDiagnose(input), null, 2) + '\n');
  }
}
