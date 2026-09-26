/**
 * CEO Orchestrator (Agent #0) — pure functions, no I/O.
 * Routes events, keeps the unresolved-issues list, renders the management view and the Approval Inbox.
 * Universal rule: verified context → structured output → permission check → action or approval → audit → result.
 * It owns no data: tasks/leads/runs come from the CEO Brain tables; sensitive actions always go to a human.
 */
var OC_VERSION = 'ceo-orchestrator-1.0.0';
var OC_STALE_HOURS = 48;
var OC_BUILD_STUCK_MINUTES = 45;
var OC_APPROVAL_HIGH_HOURS = 4;
var OC_ACTIVE_LEAD = ['NEW', 'CONTACTED', 'QUALIFYING', 'QUALIFIED', 'HOT'];
var OC_ROUTES = {
  'lead.new': { agent: 'sales-qualification', action: 'note', severity: 'info', notify: false },
  'lead.human_review': { agent: 'human', action: 'ensure_task', severity: 'high', notify: false },
  'discovery.complete': { agent: 'proposal', action: 'note', severity: 'medium', notify: false },
  'website.brief': { agent: 'website-builder', action: 'note', severity: 'info', notify: false },
  'website.building': { agent: 'website-build-runner', action: 'note', severity: 'info', notify: false },
  'website.built': { agent: 'sales-qualification', action: 'note', severity: 'info', notify: false },
  'website.build_failed': { agent: 'human', action: 'exception_task', severity: 'high', notify: true },
  'workflow.failed': { agent: 'human', action: 'exception_task', severity: 'high', notify: true },
  'integration.reauth_needed': { agent: 'human', action: 'exception_task', severity: 'high', notify: true },
  'exception.raised': { agent: 'human', action: 'exception_task', severity: 'high', notify: true },
  'approval.decided': { agent: 'ceo-orchestrator', action: 'note', severity: 'info', notify: false }
};
function ocStr(v, max) { if (v === undefined || v === null) return ''; var s = String(v).trim(); return max && s.length > max ? s.slice(0, max) : s; }
function ocTime(v) { var d = new Date(v); return isNaN(d.getTime()) ? 0 : d.getTime(); }
function ocHash(s) { var h = 0; s = String(s || ''); for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); }
function ocEsc(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function ocAgeH(fromIso, now) { var t = ocTime(fromIso); return t ? Math.max(0, Math.round((now - t) / 3600000)) : null; }

/** Normalizes an inbound event (webhook body). Unknown types are accepted and routed as 'note'. */
function ocNormalizeEvent(body, now) {
  body = (body && typeof body === 'object') ? body : {};
  now = now || Date.now();
  var type = ocStr(body.type || body.event || 'unknown', 60).toLowerCase();
  var route = OC_ROUTES[type] || { agent: 'ceo-orchestrator', action: 'note', severity: ocStr(body.severity, 10) || 'info', notify: false };
  var corr = ocStr(body.correlation_id, 80) || ('corr_' + ocHash(type + (body.lead_id || '') + (body.task_id || '') + now));
  var payload = (body.payload && typeof body.payload === 'object') ? body.payload : {};
  return {
    event_id: ocStr(body.event_id, 80) || ('evt_' + now.toString(36) + '_' + ocHash(corr)),
    tenant_id: ocStr(body.tenant_id, 60) || 'fusiontech',
    type: type, route: route,
    source: ocStr(body.source, 80) || 'unknown',
    correlation_id: corr,
    lead_id: ocStr(body.lead_id, 80) || null,
    task_id: ocStr(body.task_id, 80) || null,
    entity_type: ocStr(body.entity_type, 40) || (body.lead_id ? 'lead' : 'event'),
    entity_id: ocStr(body.entity_id, 80) || ocStr(body.task_id, 80) || ocStr(body.lead_id, 80) || null,
    summary: ocStr(body.summary || body.message, 400) || type,
    severity: ocStr(body.severity, 10) || route.severity,
    test_mode: body.test_mode === true || body.test_mode === 'true',
    payload: payload,
    ts: new Date(now).toISOString()
  };
}

/** What the Orchestrator does with an event: tasks to upsert, owner notification, audit row. Never a customer send, never money. */
function ocEventActions(ev) {
  var tasks = [];
  var notify = null;
  var r = ev.route;
  if (r.action === 'exception_task' || r.action === 'ensure_task') {
    var isExc = r.action === 'exception_task';
    tasks.push({
      tenant_id: ev.tenant_id,
      task_id: (isExc ? 'task_exc_' : 'task_evt_') + ocHash(ev.type + '|' + (ev.entity_id || ev.correlation_id)),
      lead_id: ev.lead_id || '',
      task_type: isExc ? 'exception' : 'approval',
      title: (isExc ? 'EXCEPTION: ' : 'REVIEW: ') + ev.type.replace(/[._]/g, ' ') + (ev.summary && ev.summary !== ev.type ? ' — ' + ocStr(ev.summary, 120) : ''),
      description: ocStr(ev.summary, 600) + (ev.source ? ' | source: ' + ev.source : '') + ' | correlation ' + ev.correlation_id,
      due_at: new Date(ocTime(ev.ts) + 24 * 3600000).toISOString(),
      status: 'open',
      assigned_to: 'human',
      requires_approval: !isExc,
      approval_reason: isExc ? 'exception_needs_recovery' : ev.type,
      payload_json: JSON.stringify({ event_id: ev.event_id, type: ev.type, correlation_id: ev.correlation_id, entity_type: ev.entity_type, entity_id: ev.entity_id, payload: ev.payload, test_mode: ev.test_mode }),
      created_by: 'agent:ceo-orchestrator',
      ts: ev.ts
    });
  }
  if (r.notify && !ev.test_mode) {
    notify = {
      subject: 'CEO Brain: ' + ev.type.replace(/[._]/g, ' ') + (ev.lead_id ? ' — ' + ev.lead_id : ''),
      html: '<h2>' + ocEsc(ev.type) + '</h2><p>' + ocEsc(ev.summary) + '</p><p><b>Source:</b> ' + ocEsc(ev.source) + ' &nbsp; <b>Entity:</b> ' + ocEsc(ev.entity_type) + ' ' + ocEsc(ev.entity_id || '') + ' &nbsp; <b>Correlation:</b> ' + ocEsc(ev.correlation_id) + '</p>' + (tasks.length ? '<p>Task <b>' + ocEsc(tasks[0].task_id) + '</b> is open in the inbox. Nothing was sent to any customer; no money moved.</p>' : '') + '<p style="color:#888">CEO Orchestrator ' + OC_VERSION + ' · ' + ocEsc(ev.ts) + '</p>'
    };
  }
  return {
    tasks: tasks,
    notify: notify,
    audit: { tenant_id: ev.tenant_id, entity_type: ev.entity_type, entity_id: ev.entity_id || ev.event_id, action: 'event_' + ev.type.replace(/[^a-z0-9_]/g, '_'), old_value: '', new_value: r.action + ':' + r.agent, actor: 'agent:ceo-orchestrator', reason: ocStr(ev.summary, 300) + ' | corr ' + ev.correlation_id, ts: ev.ts },
    decision: { agent: r.agent, action: r.action, severity: ev.severity, notify: !!notify, tasks: tasks.map(function (t) { return t.task_id; }) }
  };
}

/** The unresolved-issues list, computed from the tables (test leads excluded, exceptions always in). */
function ocComputeIssues(o) {
  o = o || {};
  var now = o.now || Date.now();
  var tasks = (o.tasks || []).filter(function (t) { return t && t.task_id; });
  var leads = (o.leads || []).filter(function (l) { return l && l.lead_id; });
  var runs = (o.runs || []).filter(function (r) { return r && r.run_id; });
  var testLeads = {};
  leads.forEach(function (l) { if (l.test_mode === true || l.test_mode === 'true') testLeads[l.lead_id] = true; });
  var isTest = function (leadId) { return !!(leadId && testLeads[leadId]); };
  var issues = [];
  var push = function (kind, sev, title, extra) { var it = { issue_id: kind + ':' + (extra.task_id || extra.lead_id || extra.ref || ocHash(title)), kind: kind, severity: sev, title: title }; for (var k in extra) it[k] = extra[k]; issues.push(it); };
  tasks.forEach(function (t) {
    if (isTest(t.lead_id) && t.task_type !== 'exception') return;
    var age = ocAgeH(t.ts || t.createdAt, now);
    if (t.status === 'open' && (t.requires_approval === true || t.requires_approval === 'true')) push('approval_waiting', age !== null && age >= OC_APPROVAL_HIGH_HOURS ? 'high' : 'medium', t.title || 'Approval waiting', { task_id: t.task_id, lead_id: t.lead_id || null, age_h: age, reason: t.approval_reason || '', due_at: t.due_at || null });
    if (t.task_type === 'exception' && t.status === 'open') push('exception_open', 'high', t.title || 'Exception', { task_id: t.task_id, lead_id: t.lead_id || null, age_h: age, reason: t.approval_reason || '' });
    if (t.status === 'open' && t.due_at && ocTime(t.due_at) < now && !(t.requires_approval === true || t.requires_approval === 'true')) push('overdue_follow_up', 'medium', t.title || 'Overdue', { task_id: t.task_id, lead_id: t.lead_id || null, due_at: t.due_at, age_h: ocAgeH(t.due_at, now) });
    if (t.task_type === 'website_build') {
      if (t.status === 'build_failed') push('build_failed', 'high', t.title || 'Website build failed', { task_id: t.task_id, lead_id: t.lead_id || null, age_h: age });
      if (t.status === 'building' && age !== null && (now - ocTime(t.ts || t.createdAt)) > OC_BUILD_STUCK_MINUTES * 60000) push('build_stuck', 'high', t.title || 'Website build stuck', { task_id: t.task_id, lead_id: t.lead_id || null, age_h: age });
    }
  });
  leads.forEach(function (l) {
    if (isTest(l.lead_id)) return;
    if (l.status === 'HUMAN_REVIEW') push('human_review_lead', 'medium', (l.contact_name || 'lead') + (l.company_name ? ' @ ' + l.company_name : '') + ' needs a human', { lead_id: l.lead_id, age_h: ocAgeH(l.last_contact_at || l.updatedAt, now) });
    if (OC_ACTIVE_LEAD.indexOf(l.status) !== -1 && l.last_contact_at && (now - ocTime(l.last_contact_at)) > OC_STALE_HOURS * 3600000) push('stale_lead', 'low', (l.contact_name || 'lead') + (l.company_name ? ' @ ' + l.company_name : '') + ' — no contact for ' + ocAgeH(l.last_contact_at, now) + ' h', { lead_id: l.lead_id, age_h: ocAgeH(l.last_contact_at, now) });
  });
  var dayAgo = now - 24 * 3600000;
  var failedRuns = runs.filter(function (r) { return ocTime(r.started_at) >= dayAgo && (r.success === false || r.success === 'false') ; });
  var fallbackRuns = runs.filter(function (r) { return ocTime(r.started_at) >= dayAgo && r.provider === 'rules' && r.error && r.error !== 'baseline' && r.error !== 'mock_mode'; });
  if (failedRuns.length) push('runs_failed_24h', 'high', failedRuns.length + ' agent run(s) failed in the last 24 h', { ref: 'runs', count: failedRuns.length, agents: failedRuns.map(function (r) { return r.agent; }).filter(function (v, i, a) { return a.indexOf(v) === i; }) });
  if (fallbackRuns.length) push('ai_fallback_24h', 'low', fallbackRuns.length + ' run(s) used the rule fallback (AI unavailable)', { ref: 'fallback', count: fallbackRuns.length, reason: ocStr(fallbackRuns[0].error, 120) });
  var order = { high: 0, medium: 1, low: 2 };
  issues.sort(function (a, b) { return (order[a.severity] - order[b.severity]) || ((b.age_h || 0) - (a.age_h || 0)); });
  var real = leads.filter(function (l) { return !isTest(l.lead_id); });
  var byStatus = {};
  real.forEach(function (l) { byStatus[l.status || 'UNKNOWN'] = (byStatus[l.status || 'UNKNOWN'] || 0) + 1; });
  var stats = {
    now: new Date(now).toISOString(),
    leads_real: real.length, leads_test: Object.keys(testLeads).length, leads_new_24h: real.filter(function (l) { return ocTime(l.createdAt) >= dayAgo; }).length, pipeline: byStatus,
    tasks_open: tasks.filter(function (t) { return t.status === 'open' && !isTest(t.lead_id); }).length,
    approvals_waiting: issues.filter(function (i) { return i.kind === 'approval_waiting'; }).length,
    exceptions_open: issues.filter(function (i) { return i.kind === 'exception_open'; }).length,
    builds: { building: tasks.filter(function (t) { return t.task_type === 'website_build' && t.status === 'building'; }).length, built: tasks.filter(function (t) { return t.task_type === 'website_build' && t.status === 'built'; }).length, failed: tasks.filter(function (t) { return t.task_type === 'website_build' && t.status === 'build_failed'; }).length },
    runs_24h: runs.filter(function (r) { return ocTime(r.started_at) >= dayAgo; }).length, runs_failed_24h: failedRuns.length, runs_fallback_24h: fallbackRuns.length,
    issues_high: issues.filter(function (i) { return i.severity === 'high'; }).length, issues_total: issues.length
  };
  return { issues: issues, stats: stats };
}

/** The management view as a vault note (markdown). */
function ocRenderView(o) {
  var issues = o.issues || [], s = o.stats || {};
  var when = new Date(s.now || Date.now()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  var sec = function (title, kind) { var list = issues.filter(function (i) { return i.kind === kind; }); if (!list.length) return ''; return '\n### ' + title + ' (' + list.length + ')\n' + list.slice(0, 15).map(function (i) { return '- ' + (i.severity === 'high' ? '**' : '') + i.title + (i.severity === 'high' ? '**' : '') + (i.age_h !== null && i.age_h !== undefined ? ' · ' + i.age_h + ' h' : '') + (i.task_id ? ' · `' + i.task_id + '`' : i.lead_id ? ' · `' + i.lead_id + '`' : ''); }).join('\n') + (list.length > 15 ? '\n- … +' + (list.length - 15) + ' more' : '') + '\n'; };
  var pipe = Object.keys(s.pipeline || {}).map(function (k) { return k + ' ' + s.pipeline[k]; }).join(' · ') || 'empty';
  return '---\ntags: [zaphiel, ceo-brain, management-view, live]\nupdated_by: CEO Orchestrator ' + OC_VERSION + '\nupdated: ' + (s.now || '') + '\n---\n# Management view — ' + when + ' SGT\n\n> Written by the [[10_Agents/00_CEO_Orchestrator|CEO Orchestrator]] every hour and after every event. The inbox to act on it: https://ryan1515.app.n8n.cloud/webhook/ceo-brain/inbox\n\n| | |\n|---|---|\n| Real leads (new 24 h) | ' + (s.leads_real || 0) + ' (' + (s.leads_new_24h || 0) + ') |\n| Pipeline | ' + pipe + ' |\n| Open tasks | ' + (s.tasks_open || 0) + ' |\n| Approvals waiting | ' + (s.approvals_waiting || 0) + ' |\n| Exceptions open | ' + (s.exceptions_open || 0) + ' |\n| Website builds | building ' + ((s.builds || {}).building || 0) + ' · built ' + ((s.builds || {}).built || 0) + ' · failed ' + ((s.builds || {}).failed || 0) + ' |\n| Agent runs 24 h | ' + (s.runs_24h || 0) + ' (failed ' + (s.runs_failed_24h || 0) + ', AI fallback ' + (s.runs_fallback_24h || 0) + ') |\n| Test leads excluded | ' + (s.leads_test || 0) + ' |\n\n## Unresolved (' + issues.length + ', ' + (s.issues_high || 0) + ' high)\n' + (issues.length ? '' : '\nNothing unresolved.\n') + sec('Exceptions', 'exception_open') + sec('Approvals waiting', 'approval_waiting') + sec('Website builds failed', 'build_failed') + sec('Website builds stuck', 'build_stuck') + sec('Agent runs failed', 'runs_failed_24h') + sec('Leads needing a human', 'human_review_lead') + sec('Overdue follow-ups', 'overdue_follow_up') + sec('Stale leads', 'stale_lead') + sec('AI fallback', 'ai_fallback_24h');
}

/** The Approval Inbox page (self-contained HTML). approve links reuse the existing Approve Reply gate; other actions POST back with the PIN. */
function ocInboxHtml(o) {
  var issues = o.issues || [], s = o.stats || {}, drafts = o.drafts || {}, approveUrl = o.approve_url || '', actionUrl = o.action_url || '';
  var when = new Date(s.now || Date.now()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  var badge = function (sev) { return '<span class="b ' + sev + '">' + sev + '</span>'; };
  var row = function (i) {
    var acts = '';
    if (i.kind === 'approval_waiting' && i.lead_id && drafts[i.lead_id]) {
      var q = '&message_id=' + encodeURIComponent(drafts[i.lead_id]) + '&lead_id=' + encodeURIComponent(i.lead_id);
      acts = '<a class="btn ok" href="' + ocEsc(approveUrl) + '?decision=approve' + q + '" target="_blank">Approve &amp; send</a> <a class="btn no" href="' + ocEsc(approveUrl) + '?decision=reject' + q + '" target="_blank">Reject</a>';
    } else if (i.task_id) {
      acts = '<button class="btn" data-act="' + (i.kind === 'exception_open' || i.kind === 'build_failed' || i.kind === 'build_stuck' ? 'recover' : 'close') + '" data-task="' + ocEsc(i.task_id) + '">' + (i.kind === 'exception_open' || i.kind === 'build_failed' || i.kind === 'build_stuck' ? 'Mark recovered' : 'Mark done') + '</button>';
    }
    return '<li>' + badge(i.severity) + ' <span class="t">' + ocEsc(i.title) + '</span>' + (i.age_h !== null && i.age_h !== undefined ? ' <span class="m">' + i.age_h + ' h</span>' : '') + (i.reason ? ' <span class="m">' + ocEsc(i.reason) + '</span>' : '') + '<div class="a">' + acts + '</div></li>';
  };
  var sec = function (title, kinds) { var list = issues.filter(function (i) { return kinds.indexOf(i.kind) !== -1; }); return '<section><h2>' + title + ' <span class="n">' + list.length + '</span></h2>' + (list.length ? '<ul>' + list.map(row).join('') + '</ul>' : '<p class="m">nothing</p>') + '</section>'; };
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CEO Brain — Inbox</title>'
    + '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600&family=IBM+Plex+Sans:wght@400;500&display=swap" rel="stylesheet">'
    + '<style>:root{--ink:#141a1f;--paper:#f6f4ef;--mute:#5c6670;--accent:#0a7d3c;--line:#e0dbd0;--hi:#b3261e;--md:#b8860b;--lo:#5c6670}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:"IBM Plex Sans",system-ui,sans-serif}main{max-width:820px;margin:0 auto;padding:40px 20px 80px}h1{font-family:Sora,sans-serif;font-size:1.6rem;margin:0 0 4px}h2{font-family:Sora,sans-serif;font-size:1rem;text-transform:uppercase;letter-spacing:.04em;color:var(--accent);margin:28px 0 8px}.n{background:#fff;border:1px solid var(--line);border-radius:999px;padding:0 8px;font-size:.8rem;color:var(--ink)}.stats{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}.stats div{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 14px;font-size:.9rem}.stats b{display:block;font-family:Sora,sans-serif;font-size:1.3rem}ul{list-style:none;padding:0;margin:0}li{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:8px 0}.t{font-weight:500}.m{color:var(--mute);font-size:.85rem}.b{font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;padding:2px 7px;border-radius:999px;color:#fff;background:var(--lo)}.b.high{background:var(--hi)}.b.medium{background:var(--md)}.a{margin-top:8px;display:flex;gap:8px;flex-wrap:wrap}.btn{border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 12px;font:inherit;font-size:.85rem;cursor:pointer;text-decoration:none;color:var(--ink)}.btn.ok{background:var(--accent);color:#fff;border-color:var(--accent)}.btn.no{color:var(--hi)}#pin{width:160px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;font:inherit}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}#msg{color:var(--mute);font-size:.9rem;min-height:1.2em}</style></head><body><main>'
    + '<div class="top"><div><h1>CEO Brain — Inbox</h1><p class="m">' + when + ' SGT · everything waiting for a human, one place. Refresh for live data.</p></div><div><input id="pin" type="password" placeholder="PIN" autocomplete="off"></div></div>'
    + '<div class="stats"><div><b>' + (s.approvals_waiting || 0) + '</b>approvals</div><div><b>' + (s.exceptions_open || 0) + '</b>exceptions</div><div><b>' + ((s.builds || {}).building || 0) + '</b>building</div><div><b>' + (s.leads_real || 0) + '</b>real leads</div><div><b>' + (s.runs_24h || 0) + '</b>runs 24 h</div></div><p id="msg"></p>'
    + sec('Approvals', ['approval_waiting']) + sec('Exceptions to recover', ['exception_open', 'build_failed', 'build_stuck', 'runs_failed_24h']) + sec('Leads needing a human', ['human_review_lead']) + sec('Overdue follow-ups', ['overdue_follow_up']) + sec('Stale leads', ['stale_lead']) + sec('AI fallback', ['ai_fallback_24h'])
    + '<p class="m">Approve / Reject send the customer reply through the existing approval gate. Mark done / recovered closes the task with an audit row. Nothing here moves money or publishes a website.</p>'
    + '<script>(function(){var pin=document.getElementById("pin");try{pin.value=localStorage.getItem("ceo_inbox_pin")||""}catch(e){}pin.addEventListener("change",function(){try{localStorage.setItem("ceo_inbox_pin",pin.value)}catch(e){}});document.querySelectorAll("button[data-act]").forEach(function(b){b.addEventListener("click",function(){var m=document.getElementById("msg");if(!pin.value){m.textContent="Enter the PIN first.";return}b.disabled=true;m.textContent="Working…";fetch(' + JSON.stringify(actionUrl) + ',{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:pin.value,action:b.dataset.act,task_id:b.dataset.task})}).then(function(r){return r.json()}).then(function(j){m.textContent=j.ok?("Done: "+j.task_id+" → "+j.status):("Not done: "+(j.error||"unknown"));if(j.ok){b.closest("li").style.opacity=.4}else{b.disabled=false}}).catch(function(e){m.textContent="Error: "+e;b.disabled=false})})})})();</script></main></body></html>';
}

/** Validates an inbox action (PIN + allowed action) and returns the task update. */
function ocInboxAction(body, pin) {
  body = (body && typeof body === 'object') ? body : {};
  var allowed = { close: 'done', recover: 'recovered', reopen: 'open', cancel: 'cancelled' };
  var action = ocStr(body.action, 20).toLowerCase();
  var taskId = ocStr(body.task_id, 120);
  if (!pin || ocStr(body.pin, 80) !== String(pin)) return { ok: false, error: 'wrong_pin', http: 403 };
  if (!allowed[action]) return { ok: false, error: 'unknown_action', http: 400 };
  if (!taskId) return { ok: false, error: 'task_id_required', http: 400 };
  return { ok: true, action: action, task_id: taskId, status: allowed[action], note: ocStr(body.note, 300), ts: new Date().toISOString() };
}

// ---- Node module wrapper (stripped when inlined into n8n) ----
if (typeof module !== 'undefined') module.exports = { OC_VERSION: OC_VERSION, OC_ROUTES: OC_ROUTES, ocNormalizeEvent: ocNormalizeEvent, ocEventActions: ocEventActions, ocComputeIssues: ocComputeIssues, ocRenderView: ocRenderView, ocInboxHtml: ocInboxHtml, ocInboxAction: ocInboxAction };
