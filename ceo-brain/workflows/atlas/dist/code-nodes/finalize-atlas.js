var AT_VERSION = 'atlas-n8n-1.0.0';
var AT_LABELS = ['CLIENT-PROVIDED', 'VERIFIED', 'INFERENCE', 'UNKNOWN'];
var AT_EXPLICIT = /\b(crm|edg|pipeline|automat\w*|workflow|integrat\w*|dashboard|erp|ai agents?|operating system|lead management|follow[- ]?up system)\b/i;
function atStr(v, max) {
  if (v === undefined || v === null) return '';
  var s = String(v).replace(/\s+/g, ' ').trim();
  return max && s.length > max ? s.slice(0, max) : s;
}
function atArr(v) { return Array.isArray(v) ? v.map(function (x) { return atStr(x, 200); }).filter(Boolean) : []; }
function atSlug(name) {
  var s = String(name || '').toLowerCase().replace(/\b(pte\.?|ltd\.?|llp|inc\.?|co\.?)\b/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, 60).replace(/-+$/, '') || 'unnamed-company';
}
function atParse(v, dflt) {
  if (v && typeof v === 'object') return v;
  try { var o = JSON.parse(v || ''); return o === null || o === undefined ? dflt : o; } catch (e) { return dflt; }
}
/** Should John wake ATLAS for this lead? Needs a named company, a systems need (not only a website) and at least one fact about how they work today. */
function atNeeded(o) {
  o = o || {};
  var ex = (o.extracted && typeof o.extracted === 'object') ? o.extracted : {};
  var company = atStr(o.company_name || ex.company_name, 160);
  if (!company) return false;
  var wants = atArr(ex.desired_automation).filter(function (w) { return w !== 'website_build'; });
  var said = [o.message || '', o.history_text || ''].join('\n');
  var systemsNeed = wants.length > 0 || AT_EXPLICIT.test(said);
  if (!systemsNeed) return false;
  var knowsToday = !!(atStr(ex.problem) || atStr(ex.current_follow_up_process) || atArr(ex.current_tools).length || atArr(ex.accounting_or_erp).length);
  return knowsToday;
}
function atInput(inp) {
  inp = inp || {};
  var ex = atParse(inp.extracted_json, {}) || {};
  var conv = atParse(inp.conversation_json, []) || [];
  var company = atStr(inp.company_name || ex.company_name, 160);
  var test = inp.test_mode === true || inp.test_mode === 'true';
  var slug = atSlug(company);
  var base = 'zaphiel/vault/80_Clients/' + (test ? '_Test/' : '') + slug + '/edg/';
  return {
    tenant_id: atStr(inp.tenant_id, 60) || 'fusiontech', lead_id: atStr(inp.lead_id, 120), contact_name: atStr(inp.contact_name, 120),
    company_name: company, industry: atStr(inp.industry || ex.industry, 120), email: atStr(inp.email, 200), phone: atStr(inp.phone, 40),
    channel: atStr(inp.channel, 30), message: atStr(inp.message, 4000), conversation: Array.isArray(conv) ? conv.slice(-30) : [],
    sales_summary: atStr(inp.sales_summary, 2000), extracted: ex, test_mode: test, notify_email: atStr(inp.notify_email, 200),
    source_execution_id: atStr(inp.source_execution_id, 40), slug: slug, base_path: base
  };
}
function atItem(value, label) { return { value: value, label: AT_LABELS.indexOf(label) !== -1 ? label : 'UNKNOWN' }; }
function atFact(v) { var has = Array.isArray(v) ? v.length > 0 : (v !== null && v !== undefined && String(v).trim() !== ''); return has ? atItem(v, 'CLIENT-PROVIDED') : atItem(null, 'UNKNOWN'); }
/** Structured company model from what John collected. Everything the customer said is CLIENT-PROVIDED; the rest is UNKNOWN. No inference is presented as fact. */
function atCompanyModel(input) {
  var ex = input.extracted || {};
  return {
    schema: 'atlas.company_model.v1', generated_by: AT_VERSION, mode: 'DESIGN', checkpoint: 1,
    company: { name: atFact(input.company_name), industry: atFact(input.industry || ex.industry), size_people: atFact(ex.company_size), location: atItem(null, 'UNKNOWN'), website: atItem(null, 'UNKNOWN') },
    contact: { name: atFact(input.contact_name), email: atFact(input.email), phone: atFact(input.phone), decision_maker: atFact(ex.decision_maker) },
    acquisition: { lead_sources: atFact(atArr(ex.lead_sources)), monthly_lead_volume: atItem(null, 'UNKNOWN'), attribution: atItem(null, 'UNKNOWN') },
    sales: { follow_up_process: atFact(ex.current_follow_up_process), pipeline_stages: atItem(null, 'UNKNOWN'), salespeople: atItem(null, 'UNKNOWN') },
    tools: { current_tools: atFact(atArr(ex.current_tools)), accounting_or_erp: atFact(atArr(ex.accounting_or_erp)), uses_whatsapp: atFact(ex.uses_whatsapp), uses_email: atFact(ex.uses_email) },
    problems: { stated_problem: atFact(ex.problem) },
    goals: { desired_automation: atFact(atArr(ex.desired_automation)), desired_outcome: atFact(ex.desired_outcome), timeline: atFact(ex.timeline), budget: atFact(ex.budget) },
    operations: { delivery: atItem(null, 'UNKNOWN'), payments: atItem(null, 'UNKNOWN'), customer_service: atItem(null, 'UNKNOWN'), reporting: atItem(null, 'UNKNOWN') }
  };
}
var AT_QUESTION_BANK = [
  ['current_tools', 'Which system do you use today to keep track of customers and leads (a CRM, Excel/Google Sheets, WhatsApp only)?'],
  ['lead_sources', 'Where do most of your enquiries come from, and roughly how many do you get in a normal month?'],
  ['current_follow_up_process', 'When a new enquiry comes in, who replies first, and how do you make sure nobody is forgotten?'],
  ['uses_whatsapp', 'Do customers message you on a normal WhatsApp app, WhatsApp Business, or through a platform like respond.io?'],
  ['sales', 'What happens between the first message and a paying customer: quotation, site visit, appointment, deposit?'],
  ['company_size', 'How many people in your team would use the system (sales, customer service, admin, management)?'],
  ['accounting_or_erp', 'Which accounting or invoicing software do you use (for example Xero or QuickBooks)?'],
  ['reporting', 'What would you like to see every morning as the owner: new leads, follow-ups due, sales by person, revenue?'],
  ['problem', 'What is the one thing that goes wrong most often today: slow replies, forgotten follow-ups, lost quotations, double data entry?']
];
function atQuestions(input) {
  var ex = input.extracted || {};
  var missing = {
    current_tools: !atArr(ex.current_tools).length, lead_sources: !atArr(ex.lead_sources).length, current_follow_up_process: !atStr(ex.current_follow_up_process),
    uses_whatsapp: ex.uses_whatsapp !== true && ex.uses_whatsapp !== false, sales: true, company_size: ex.company_size === null || ex.company_size === undefined,
    accounting_or_erp: !atArr(ex.accounting_or_erp).length, reporting: true, problem: !atStr(ex.problem)
  };
  return AT_QUESTION_BANK.filter(function (q) { return missing[q[0]]; }).map(function (q) { return q[1]; }).slice(0, 8);
}
function atMermaidLabel(s) { return String(s || '').replace(/["[\]{}()<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) || 'UNKNOWN'; }
function atCurrentStateMd(input) {
  var ex = input.extracted || {};
  var sources = atArr(ex.lead_sources); var tools = atArr(ex.current_tools);
  var follow = atStr(ex.current_follow_up_process);
  var lines = ['```mermaid', 'flowchart LR'];
  lines.push('  S["Lead sources: ' + atMermaidLabel(sources.join(', ') || 'UNKNOWN') + '"] --> R["First reply: ' + atMermaidLabel(follow || 'UNKNOWN') + '"]');
  lines.push('  R --> T["Kept in: ' + atMermaidLabel(tools.join(', ') || 'UNKNOWN') + '"]');
  lines.push('  T --> O["Quote / booking / payment: UNKNOWN"]');
  lines.push('  O --> M["Owner visibility: UNKNOWN"]');
  lines.push('```');
  return lines.join('\n') + '\n\n## What we know (CLIENT-PROVIDED)\n' +
    '- Lead sources: ' + (sources.join(', ') || 'UNKNOWN') + '\n' +
    '- How enquiries are followed up: ' + (follow || 'UNKNOWN') + '\n' +
    '- Tools in use: ' + (tools.join(', ') || 'UNKNOWN') + '\n' +
    '- Accounting / ERP: ' + (atArr(ex.accounting_or_erp).join(', ') || 'UNKNOWN') + '\n' +
    '- WhatsApp: ' + (ex.uses_whatsapp === true ? 'used' : (ex.uses_whatsapp === false ? 'not used' : 'UNKNOWN')) + '\n\n' +
    'Everything marked UNKNOWN is an open question for John (see 15_questions_open). Nothing here is inferred.';
}
function atProblemMapMd(input) {
  var ex = input.extracted || {};
  var p = atStr(ex.problem);
  return '## Stated by the customer (CLIENT-PROVIDED)\n' + (p ? '- "' + p + '"\n' : '- No problem stated yet (UNKNOWN).\n') +
    (atArr(ex.desired_automation).length ? '\n## What they want automated (CLIENT-PROVIDED)\n' + atArr(ex.desired_automation).map(function (w) { return '- ' + w.replace(/_/g, ' '); }).join('\n') + '\n' : '') +
    '\n## To confirm with the customer\nManual work, duplicate data, missed leads, slow replies, follow-up gaps, isolated systems and reporting gaps are checked in discovery; impact is estimated only with numbers the client gives.';
}
function atReportToJohnMd(input, questions, summary) {
  return '## In plain words\n' + (summary || ('ATLAS has started the systems picture for ' + (input.company_name || 'this company') + '. It only knows what the customer told John so far, so the next step is a few questions.')) +
    '\n\n## Please ask the customer (one or two at a time, in your own words)\n' + questions.map(function (q, i) { return (i + 1) + '. ' + q; }).join('\n') +
    '\n\n## Build status\nDESIGN mode, checkpoint 1 (understanding). Nothing has been built or connected. Ryan reviews before any architecture is proposed.';
}
/** Deterministic checkpoint-1 pack, used when the model is unavailable. */
function atFallbackPack(input) {
  var questions = atQuestions(input);
  return {
    company_model: atCompanyModel(input),
    current_state_md: atCurrentStateMd(input),
    problem_map_md: atProblemMapMd(input),
    questions_open: questions,
    report_to_john_md: atReportToJohnMd(input, questions, null),
    summary_for_ryan: 'Checkpoint 1 for ' + (input.company_name || input.lead_id) + ' built from John\'s facts only (model unavailable). ' + questions.length + ' questions open.'
  };
}
function atParseJson(text) {
  if (typeof text !== 'string') return null;
  var t = text.trim(); var fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i); if (fence) t = fence[1].trim();
  if (t.charAt(0) !== '{') { var i = t.indexOf('{'), k = t.lastIndexOf('}'); if (i === -1 || k < i) return null; t = t.slice(i, k + 1); }
  try { return JSON.parse(t); } catch (e) { return null; }
}
/** Model output → checkpoint-1 pack. Missing parts are filled from the fallback so a file is never empty; questions always stay a list. */
function atCoerce(o, input) {
  var fb = atFallbackPack(input);
  o = (o && typeof o === 'object') ? o : {};
  var md = function (v, d) { return typeof v === 'string' && v.trim().length > 20 ? v.trim().slice(0, 20000) : d; };
  var qs = Array.isArray(o.questions_open) ? o.questions_open.map(function (q) { return atStr(q, 300); }).filter(Boolean).slice(0, 10) : [];
  if (!qs.length) qs = fb.questions_open;
  return {
    company_model: (o.company_model && typeof o.company_model === 'object') ? o.company_model : fb.company_model,
    current_state_md: md(o.current_state_md, fb.current_state_md),
    problem_map_md: md(o.problem_map_md, fb.problem_map_md),
    questions_open: qs,
    report_to_john_md: md(o.report_to_john_md, atReportToJohnMd(input, qs, null)),
    summary_for_ryan: atStr(o.summary_for_ryan, 800) || fb.summary_for_ryan
  };
}
function atHeader(title, input, provider) {
  return '---\ntype: edg_output\nagent: atlas\nmode: DESIGN\ncheckpoint: 1\nclient: "' + (input.company_name || '').replace(/"/g, "'") + '"\nlead_id: ' + input.lead_id + '\nprovider: ' + provider + '\ngenerated: ' + new Date().toISOString() + '\ntest_mode: ' + input.test_mode + '\n---\n# ' + title + ' — ' + (input.company_name || input.lead_id) + '\n\n';
}
function atFiles(pack, input, provider) {
  var b = input.base_path;
  return [
    { path: b + '00_company_model.json', content: JSON.stringify(pack.company_model, null, 2) + '\n' },
    { path: b + '01_current_state.md', content: atHeader('Current state', input, provider) + pack.current_state_md + '\n' },
    { path: b + '02_problem_map.md', content: atHeader('Problem map', input, provider) + pack.problem_map_md + '\n' },
    { path: b + '14_report_to_john.md', content: atHeader('Report to John', input, provider) + pack.report_to_john_md + '\n' },
    { path: b + '15_questions_open.md', content: atHeader('Open questions', input, provider) + pack.questions_open.map(function (q, i) { return (i + 1) + '. ' + q; }).join('\n') + '\n' }
  ];
}
/** finalize({ raw_text, error, input }) → everything the workflow writes. */
function atFinalize(opts) {
  opts = opts || {};
  var input = opts.input || {};
  var reason = null, pack = null;
  if (opts.error) reason = String(opts.error);
  else { var parsed = atParseJson(opts.raw_text); if (!parsed) reason = 'model_output_not_json'; else pack = atCoerce(parsed, input); }
  var fallback = !pack;
  if (fallback) pack = atFallbackPack(input);
  var provider = fallback ? 'rules' : 'anthropic';
  var files = atFiles(pack, input, provider);
  var name = input.company_name || input.lead_id;
  var taskId = 'task_edg_' + String(input.lead_id).replace(/[^a-z0-9_]/gi, '').slice(0, 60);
  return {
    pack: pack, files: files, provider: provider, fallback_used: fallback, fallback_reason: reason,
    task: { task_id: taskId, task_type: 'edg_design', title: 'ATLAS checkpoint 1: confirm understanding of ' + name, description: pack.summary_for_ryan + ' Files: ' + input.base_path, status: 'open', assigned_to: 'human', requires_approval: true, approval_reason: 'atlas_checkpoint_1_confirm_understanding' },
    event: { type: 'edg.checkpoint_1', source: 'atlas', tenant_id: input.tenant_id, lead_id: input.lead_id, entity_type: 'lead', entity_id: input.lead_id, severity: 'medium', summary: 'ATLAS checkpoint 1 ready for ' + name + ' — ' + pack.questions_open.length + ' questions for John', payload: { base_path: input.base_path, questions_for_john: pack.questions_open, provider: provider }, test_mode: input.test_mode, correlation_id: 'lead:' + input.lead_id },
    email_subject: (input.test_mode ? '[TEST] ' : '') + 'ATLAS: checkpoint 1 ready — ' + name
  };
}
// ---- n8n glue ----
const prep = $('Check Existing Design').first().json;
const pre = $('Compose ATLAS Prompt').first().json;
const input = prep.input;
const inp = ($input.first() && $input.first().json) || {};
let rawText = null, error = null, model = "claude-sonnet-4-6";
if (inp.error) error = 'model_error: ' + String(inp.error.message || inp.error.description || JSON.stringify(inp.error)).slice(0, 300);
else {
  model = inp.model || model;
  if (typeof inp.text === 'string' && inp.text.trim()) rawText = inp.text;
  else if (Array.isArray(inp.content)) rawText = inp.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('\n');
  else if (typeof inp.output === 'string') rawText = inp.output;
  if (!rawText) error = 'empty_model_output';
}
const fin = atFinalize({ raw_text: rawText, error, input });
const now = new Date().toISOString();
const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const repoBase = 'https://github.com/ryandhana1515-stack/ryan/tree/HEAD/' + input.base_path.split('/').map(encodeURIComponent).join('/');
const email_html = '<h2>ATLAS checkpoint 1 — ' + esc(input.company_name) + '</h2>'
  + '<p>' + esc(fin.pack.summary_for_ryan) + '</p>'
  + '<p><b>Questions for John to ask:</b></p><ol>' + fin.pack.questions_open.map((q) => '<li>' + esc(q) + '</li>').join('') + '</ol>'
  + '<p>Files in your vault: <code>' + esc(input.base_path.replace(/^zaphiel\/vault\//, '')) + '</code> (<a href="' + repoBase + '">open on GitHub</a>). Confirm the understanding in the Approval Inbox, then ask Zaphiel to continue ATLAS to checkpoint 2 (architecture).</p>'
  + '<p style="color:#888">' + esc(fin.provider) + (fin.fallback_used ? ' (fallback: ' + esc(fin.fallback_reason) + ')' : '') + ' · agent file: ' + esc(pre.agent_file_source) + ' · lead ' + esc(input.lead_id) + (input.test_mode ? ' · TEST' : '') + '</p>';
return [{ json: {
  input, pack: fin.pack, files: fin.files, provider: fin.provider, model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason,
  task: fin.task, event: fin.event, email_subject: fin.email_subject, email_html, agent_file_source: pre.agent_file_source,
  run_id: 'run_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36), started_at: prep.started_at, finished_at: now,
  latency_ms: Math.max(0, new Date(now).getTime() - new Date(prep.started_at).getTime())
} }];
