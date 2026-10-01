// ATLAS — EDG & CRM Systems Architect, n8n runtime (DESIGN mode, checkpoint 1).
// The full agent is Ryan's file `.claude/agents/atlas.md` (read live by the n8n workflow and used as the
// system prompt). This module holds the pure logic around it: when John should wake ATLAS, the input
// normalisation, the deterministic fallback when the model is unavailable, the model-output coercion and
// the vault files it writes. Never talks to the customer; never touches a live system; stops at checkpoint 1.

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

/** The customer said they do not want systems work (Ryan, 2026-10-01: "I don't want that, I want a website"). */
var AT_SYS = '(?:crms?|edg|erp|automat\\w*|workflows?|systems?|dashboards?|ai agents?|pipelines?)';
var AT_DECLINED = new RegExp("\\b(?:don'?t|do not|didn'?t|did not)\\s+(?:really\\s+)?(?:want|need)\\b[^.?!\\n]{0,30}\\b" + AT_SYS + "\\b"
  + "|\\bno need (?:for )?(?:a |an |the |any )?" + AT_SYS + "\\b|\\bnot interested in\\b[^.?!\\n]{0,30}\\b" + AT_SYS + "\\b|\\bno (?:crm|edg)\\b"
  + "|\\b(?:only|just)\\s+(?:(?:want|need|wanted|needed)\\s+)?(?:a |the |my )?(?:new )?web ?sites?\\b", 'i');
function atDeclinedSystems(text) { return AT_DECLINED.test(String(text || '')); }
/** Did the customer ask for systems work (CRM, automation, integrations, AI agents) themselves? Their latest word on it
 *  counts: "I don't want a CRM" ends it, a later "actually, add a CRM" starts it again. A website request alone is never
 *  systems work (Ryan, 2026-10-01: he asked for a website and got a CRM). */
function atSystemsWanted(o) {
  o = o || {};
  var ex = (o.extracted && typeof o.extracted === 'object') ? o.extracted : {};
  var sentences = [o.history_text || '', o.message || ''].join('\n').split(/(?<=[.!?])\s+|\n+/);
  for (var i = sentences.length - 1; i >= 0; i--) {
    if (atDeclinedSystems(sentences[i])) return false;
    if (AT_EXPLICIT.test(sentences[i])) return true;
  }
  var wants = atArr(ex.desired_automation).filter(function (w) { return w !== 'website_build' && !/web ?site/i.test(String(w)); });
  return wants.length > 0;
}

/** Should John wake ATLAS for this lead? Needs a named company, a systems need the customer asked for (never only a
 *  website: Ryan, 2026-10-01 replaces the 2026-09-27 rule) and at least one fact about how they work today. */
function atNeeded(o) {
  o = o || {};
  var ex = (o.extracted && typeof o.extracted === 'object') ? o.extracted : {};
  var company = atStr(o.company_name || ex.company_name, 160);
  if (!company) return false;
  if (!atSystemsWanted(o)) return false;
  // lead_sources is not counted: it is often filled from the channel, not from the customer's words.
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
  // The whole answer first: a JSON value may itself contain ``` blocks (e.g. a mermaid diagram), which a fence regex cuts short (ATLAS, execution 387).
  var w0 = text.indexOf('{'), w1 = text.lastIndexOf('}'); if (w0 !== -1 && w1 > w0) { try { return JSON.parse(text.slice(w0, w1 + 1)); } catch (e) {} }
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
    { path: b + '15_questions_open.md', content: atHeader('Open questions', input, provider) + pack.questions_open.map(function (q, i) { return (i + 1) + '. ' + q; }).join('\n') + '\n' },
    { path: b + '16_edg_spec.json', content: JSON.stringify(atEdgSpec(input), null, 2) + '\n' }
  ];
}

// ---- EDG build spec (edg.spec.v1): what "Approve & build" creates on the EDG test system ----
// Deterministic from John's facts (never from guesses about prices, tax or people): module switches follow what the
// customer said or what the industry clearly needs; everything the client must still provide goes to to_confirm.
var AT_EDG_URL = 'https://fusion-edg-core-api.vercel.app';
var AT_INDUSTRY = [
  ['renovation', /\b(renovat\w*|interior|contractor|construction|builder|carpentry|id firm|home improvement)\b/i],
  ['clinic', /\b(clinic|dental|dentist|medical|aesthetic|physio\w*|doctor|chiropract\w*|tcm|healthcare)\b/i],
  ['property', /\b(property|real estate|realtor|condo|hdb agent|property agent)\b/i],
  ['education', /\b(tuition|education|school|academy|enrichment|course|training centre|training center)\b/i],
  ['beauty', /\b(salon|spa|beauty|hair|nail|lash|facial|massage)\b/i],
  // Home and trade services: jobs are booked visits done by technicians (Ryan, 2026-09-30: Tan Aircon test).
  ['services', /\b(air-?cons?|aircon\w*|air con|plumb\w*|electricians?|electrical works|cleaning|cleaners?|pest control|handyman|locksmiths?|laundry|movers?|moving company|repairs?|servicing)\b/i]
];
var AT_PIPELINES = {
  renovation: [['new', 'New enquiry', 1], ['contacted', 'Contacted', 24], ['site_visit', 'Site visit', 72], ['quotation', 'Quotation sent', 120], ['negotiation', 'Negotiation', 168]],
  clinic: [['new', 'New enquiry', 1], ['contacted', 'Contacted', 24], ['consultation', 'Consultation booked', 72], ['treatment_plan', 'Treatment plan', 120], ['follow_up', 'Follow-up', 336]],
  property: [['new', 'New enquiry', 1], ['contacted', 'Contacted', 24], ['viewing', 'Viewing', 72], ['offer', 'Offer', 120], ['negotiation', 'Negotiation', 168]],
  education: [['new', 'New enquiry', 1], ['contacted', 'Contacted', 24], ['trial', 'Trial class', 120], ['enrolment', 'Enrolment', 168]],
  beauty: [['new', 'New enquiry', 1], ['contacted', 'Contacted', 24], ['booked', 'Appointment booked', 72], ['returning', 'Returning customer', 720]],
  services: [['new', 'New enquiry', 1], ['contacted', 'Contacted', 24], ['quotation', 'Quotation sent', 72], ['job_booked', 'Job booked', 72], ['job_done', 'Job done', 168]],
  general: [['new', 'New enquiry', 1], ['contacted', 'Contacted', 24], ['qualified', 'Qualified', 72], ['proposal', 'Proposal sent', 120], ['negotiation', 'Negotiation', 168]]
};
var AT_SERVICES = {
  renovation: { name: 'Site visit', duration_minutes: 60, buffer_minutes: 30, location: "At the customer's home" },
  clinic: { name: 'Consultation', duration_minutes: 30, buffer_minutes: 10, location: 'Clinic' },
  property: { name: 'Viewing', duration_minutes: 45, buffer_minutes: 15, location: 'At the property' },
  education: { name: 'Trial class', duration_minutes: 60, buffer_minutes: 15, location: 'Centre' },
  beauty: { name: 'Appointment', duration_minutes: 60, buffer_minutes: 15, location: 'Salon' },
  services: { name: 'Service visit', duration_minutes: 90, buffer_minutes: 30, location: "At the customer's home" },
  general: { name: 'Consultation', duration_minutes: 60, buffer_minutes: 15, location: 'To confirm' }
};
function atCustomerText(input) {
  var ex = input.extracted || {};
  var said = (input.conversation || []).filter(function (m) { return m && m.role !== 'agent'; }).map(function (m) { return String(m.content || ''); });
  return [input.message, input.sales_summary, ex.problem, ex.desired_outcome, ex.current_follow_up_process, atArr(ex.desired_automation).join(' '), atArr(ex.current_tools).join(' ')].concat(said).join('\n');
}
function atIndustryKey(input) {
  var hay = [input.industry, (input.extracted || {}).industry, input.company_name, atCustomerText(input)].join(' ');
  for (var i = 0; i < AT_INDUSTRY.length; i++) if (AT_INDUSTRY[i][1].test(hay)) return AT_INDUSTRY[i][0];
  return 'general';
}
function atEdgSpec(input) {
  var ex = input.extracted || {};
  var text = atCustomerText(input);
  var ind = atIndustryKey(input);
  var wants = atArr(ex.desired_automation).join(' ');
  var why = {};
  var apptSaid = /\b(appointments?|bookings?|book(s|ed|ing)?|consultations?|site visits?|viewings?|trial class|schedul\w+|calendar)\b/i.test(text + ' ' + wants);
  var appt = apptSaid || ind === 'clinic' || ind === 'beauty' || ind === 'services';
  why.appointments = apptSaid ? 'CLIENT-PROVIDED: mentioned bookings/visits' : appt ? 'INFERENCE: ' + ind + ' businesses run on appointments/visits' : 'not mentioned';
  var quotes = /\b(quot\w*|estimates?|proposals?|pricing)\b/i.test(text + ' ' + wants) || ind === 'renovation';
  why.quotes = quotes ? (/\b(quot\w*|estimates?|proposals?)\b/i.test(text) ? 'CLIENT-PROVIDED: mentioned quotations' : 'INFERENCE: renovation work is sold by quotation') : 'not mentioned';
  var invoices = quotes || /\b(invoices?|billing|deposits?|payments?|receipts?)\b/i.test(text);
  var acc = atArr(ex.accounting_or_erp).join(' ') + ' ' + text;
  var accounting = /\bxero\b/i.test(acc) ? 'xero' : /\bquickbooks\b/i.test(acc) ? 'quickbooks' : atArr(ex.accounting_or_erp).length ? 'other' : 'unknown';
  var calendar = /google (calendar|workspace)|\bgmail\b/i.test(text) ? 'google' : 'unknown';
  var m = /\b(\d{1,2})\s*(sales(?:\s*(?:guys|staff|people|team|reps|persons?|agents))?|salespeople|salesmen|agents|consultants|designers|technicians?|techs|installers|cleaners|workers|therapists|stylists|tutors|teachers)\b/i.exec(text);
  var sales = m ? Math.max(1, Math.min(50, parseInt(m[1], 10))) : 2;
  var who = m ? m[2].toLowerCase() : '';
  var label = /^tech/.test(who) ? 'Technician' : /^install/.test(who) ? 'Installer' : /^clean/.test(who) ? 'Cleaner' : /^design/.test(who) ? 'Designer' : /^consult/.test(who) ? 'Consultant'
    : /^therap/.test(who) ? 'Therapist' : /^stylist/.test(who) ? 'Stylist' : /^(tutor|teacher)/.test(who) ? 'Tutor' : /^worker/.test(who) ? 'Staff' : !m && ind === 'services' ? 'Technician' : 'Sales';
  why.team = m ? 'CLIENT-PROVIDED: "' + m[0] + '"' : 'INFERENCE: 2 placeholder people until the client gives the team';
  var confirm = ['Staff names, roles and emails (who gets new leads)', 'Working hours (placeholder Mon–Fri 09:00–18:00)'];
  if (appt) confirm.push('Services customers book and how long each takes');
  if (quotes) confirm.push('Price list: every product/service and its price (the AI only quotes approved prices)');
  if (quotes || invoices) { confirm.push('GST registration and rate (needed before any quote or invoice)'); confirm.push('Payment terms (days) and how long a quote stays valid'); }
  if (accounting === 'unknown') confirm.push('Which accounting software they use (e.g. Xero)');
  if (ex.uses_whatsapp !== false) confirm.push('Their WhatsApp Business number and Meta business verification (for the live system)');
  var email = atStr(input.notify_email, 200);
  var team = atAiTeam(input, ind, { whatsapp: ex.uses_whatsapp !== false, quotes: quotes, invoices: invoices, appointments: appt }, text);
  return {
    schema: 'edg.spec.v2', generated_by: AT_VERSION, generated_at: new Date().toISOString(),
    company: { name: input.company_name || 'Unnamed company', slug: (input.test_mode ? 'test-' : '') + input.slug, industry: atStr(input.industry || ex.industry, 120) || ind, timezone: 'Asia/Singapore', currency: 'SGD' },
    modules: { lead_capture: true, follow_ups: true, whatsapp: ex.uses_whatsapp !== false, quotes: quotes, invoices: invoices, appointments: appt, accounting: accounting, calendar: calendar, ceo_brief: true },
    pipeline: AT_PIPELINES[ind].map(function (s) { return { key: s[0], name: s[1], sla_hours: s[2] }; }),
    team: { sales: sales, managers: 1, support: 0, label: label },
    services: appt ? [AT_SERVICES[ind]] : [],
    working_hours: { weekdays: [1, 2, 3, 4, 5], start: '09:00', end: '18:00' },
    catalog: [],
    reviewer: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? { name: 'Ryan', email: email } : undefined,
    to_confirm: confirm,
    why: why,
    source: { lead_id: input.lead_id, design_path: input.base_path, test_mode: !!input.test_mode },
    problems: team.problems,
    agents: team.agents,
    automations: team.automations,
    knowledge: team.knowledge
  };
}

// ---- The business's AI team (Ryan, 2026-09-30: "build agents for people … it needs to know how to build AI agents,
// workflows, solve people problems"). From what the customer told John: the problems (CLIENT-PROVIDED, in their
// words), the AI assistant that answers their customers, and the workflows that take work off the owner. Only the
// safe catalog of Fusion EDG Core (tools, triggers, conditions, actions); nothing invented about prices or policies.
var AT_AGENT_PURPOSE = {
  services: 'Answer customers on WhatsApp day and night: understand the problem (what is wrong, how many units, the address), offer service visits and book them, and prepare quotations from the price list.',
  renovation: 'Answer homeowners on WhatsApp: understand the project (type of home, rooms, budget range the customer gives), book site visits, and pass design and pricing questions to the team.',
  clinic: 'Answer patients on WhatsApp: book consultations, answer questions about opening hours and services, and pass every medical or symptom question to the clinic team.',
  property: 'Answer buyers and tenants on WhatsApp: understand what they are looking for, book viewings, and pass offers and negotiations to the agent.',
  education: 'Answer parents and students on WhatsApp: explain the classes, book trial classes, and pass fee and schedule exceptions to the team.',
  beauty: 'Answer customers on WhatsApp: explain the treatments, book appointments, and pass anything unusual to the team.',
  general: 'Answer enquiries on WhatsApp: understand what the customer needs, collect their details, book appointments when offered, and pass anything else to the team.'
};
var AT_HANDOVER = {
  services: ['complaints about a past job', 'warranty or refund questions'],
  renovation: ['design or pricing decisions', 'complaints about a past project'],
  clinic: ['any medical, symptom or medication question', 'emergencies (tell them to call emergency services)'],
  property: ['offers, prices or negotiation', 'legal or financing questions'],
  education: ['fee discounts or exceptions', 'complaints'],
  beauty: ['allergies, skin conditions or medical questions', 'complaints'],
  general: ['complaints', 'anything about money or contracts']
};
var AT_PROBLEMS = [
  [/\b(miss(ed|ing)? (appointments?|bookings?|jobs?)|no[- ]?shows?|forget (the )?appointments?)\b/i, 'Appointments are missed', 'Bookings in one calendar per person, and every customer gets a reminder a day before'],
  [/\b(forget|forgot|forgotten|lose customers|lost customers|no follow[- ]?up|nobody follows? up)\b/i, 'Customers are forgotten and lost', 'Every enquiry gets an owner, a next step and a reminder; nothing waits without someone responsible'],
  [/\b(quot\w*)\b/i, 'Quotations take time and are not followed up', 'Quotations from the price list in one tap, and an automatic follow-up when the customer goes quiet'],
  [/\b(notebook|excel|spreadsheet|paper|google sheets?)\b/i, 'Everything is written by hand in different places', 'One system for customers, jobs, quotations and invoices'],
  [/\b(reply|replies|respond|slow|busy|whatsapp)\b/i, 'Replying to every WhatsApp message takes the owner\'s time', 'The AI assistant answers in seconds, day and night, and books the job'],
  [/\b(invoice|payments?|paid|deposit)\b/i, 'Invoices and payments are tracked by hand', 'Invoices from accepted quotations, and payments tracked until paid'],
  [/\b(report|see everything|overview|dashboard|numbers)\b/i, 'The owner cannot see what is happening', 'A morning report with the numbers that matter']
];
function atAiTeam(input, ind, m, text) {
  var name = String(input.company_name || 'the business').replace(/\s*\b(pte\.?|ltd\.?|llp|inc\.?)\b\.?/gi, '').replace(/\s+/g, ' ').trim();
  var problems = [];
  for (var i = 0; i < AT_PROBLEMS.length; i++) {
    if (AT_PROBLEMS[i][1] === 'Replying to every WhatsApp message takes the owner\'s time' && !m.whatsapp) continue;
    if (/Quotations/.test(AT_PROBLEMS[i][1]) && !m.quotes) continue;
    if (/Invoices/.test(AT_PROBLEMS[i][1]) && !m.invoices) continue;
    if (AT_PROBLEMS[i][0].test(text)) problems.push({ problem: AT_PROBLEMS[i][1], solution: AT_PROBLEMS[i][2] });
  }
  var tools = [];
  if (m.appointments) tools.push('find_free_times', 'book_job');
  if (m.quotes) tools.push('prepare_quote');
  tools.push('save_customer_details', 'add_note', 'hand_over_to_person');
  var agents = m.whatsapp ? [{
    key: 'front_desk', name: (name + ' Assistant').slice(0, 80), purpose: AT_AGENT_PURPOSE[ind] || AT_AGENT_PURPOSE.general,
    persona: 'warm, short and professional, like a helpful front-desk person; Singapore customers', channels: ['whatsapp'], tools: tools,
    handover_when: AT_HANDOVER[ind] || AT_HANDOVER.general,
    rules: ['Put the customer\'s address and job details in the booking notes.', 'Ask one question at a time.']
  }] : [];
  var autos = [{ key: 'quiet_new_enquiry', name: 'Call new enquiries that went quiet', trigger: { event: 'lead.created', after_hours: 4 }, conditions: ['customer_has_not_replied', 'lead_still_open'],
    actions: [{ do: 'create_task', title: 'Call {first_name}: no reply since the first message', due_in_hours: 2 }] }];
  if (m.quotes) autos.push({ key: 'quote_follow_up', name: 'Follow up quotations', trigger: { event: 'quote.sent', after_hours: 48 }, conditions: ['customer_has_not_replied', 'quote_still_open'],
    actions: [{ do: 'ai_follow_up', instruction: 'Politely check whether the customer has questions about quotation {quote_number}; offer to book the job. No pressure, no new prices.', fallback_text: 'Hi {first_name}, just checking if you have any questions about quotation {quote_number} from {business}?' },
      { do: 'notify_owner', text: 'Quotation {quote_number} has had no answer for 2 days. The AI assistant followed up.' }] });
  if (m.appointments) {
    autos.push({ key: 'thank_after_job', name: 'Thank the customer after the job', trigger: { event: 'appointment.completed', after_hours: 2 },
      actions: [{ do: 'message_customer', text: 'Hi {first_name}, thank you for choosing {business} today. If anything is not right, just reply here.' }] });
    autos.push({ key: 'no_show_rebook', name: 'Rebook customers who missed their appointment', trigger: { event: 'appointment.no_show', after_hours: 1 },
      actions: [{ do: 'ai_follow_up', instruction: 'The customer missed their {service} today. Kindly offer to book a new time.', fallback_text: 'Hi {first_name}, we missed you today. Would you like to book a new time?' }, { do: 'notify_owner', text: '{first_name} missed their {service}. The AI assistant offered a new time.' }] });
  }
  if (m.invoices) autos.push({ key: 'overdue_invoice_owner', name: 'Tell the owner about overdue invoices', trigger: { event: 'invoice.overdue', after_hours: 0 },
    actions: [{ do: 'notify_owner', text: 'Invoice {invoice_number} is overdue. A reminder draft is ready for you to send.' }] });
  autos.push({ key: 'morning_numbers', name: 'Morning numbers for the owner', trigger: { schedule: { every: 'day', time: '08:00' } }, actions: [{ do: 'owner_summary' }] });
  var knowledge = [];
  var what = atStr(input.industry || (input.extracted || {}).industry, 300);
  if (what) knowledge.push({ title: 'What does ' + name + ' do?', body: what + ' (in the owner\'s words; approve or correct before the AI uses it)', category: 'faq' });
  return { problems: problems, agents: agents, automations: autos, knowledge: knowledge };
}
function atBuildUrl(input) { return AT_EDG_URL + '/atlas/build?path=' + encodeURIComponent(input.base_path + '16_edg_spec.json'); }
function atAutoBuildUrl() { return AT_EDG_URL + '/atlas/auto-build'; }

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
    email_subject: (input.test_mode ? '[TEST] ' : '') + 'ATLAS: design ready, building now — ' + name,
    build_url: atBuildUrl(input)
  };
}

// ---- John-side helpers (inlined into Lead Intake only, not into the ATLAS workflow) ----
/** John asks ATLAS's questions himself (Ryan, 2026-09-26). Reads the questions from ATLAS's edg_design task rows and
 *  returns the first one John has not asked yet in this conversation, skipping anything a reply guardrail would block. */
var AT_UNSAFE_Q = /(s?\$|\b(sgd|usd|rm))\s?\d|\b(price|pricing|cost|discount|guarantee\w*|refund|contract|agreement|password|api key|token|credential)s?\b/i;
function atQuestionsFromRows(rows) {
  // ATLAS's systems questions. Website Intelligence asks its own questions directly (before the build), so John never
  // relays them a second time (Ryan, 2026-09-29: duplicate questions).
  var out = [];
  ['edg_design'].forEach(function (type) {
    (Array.isArray(rows) ? rows : []).forEach(function (r) {
      if (!r || r.task_type !== type) return;
      var p = atParse(r.payload_json, {}) || {};
      atArr(p.questions_for_john).forEach(function (q) { if (out.indexOf(q) === -1) out.push(q); });
    });
  });
  return out;
}
/** True when the question came from ATLAS (its edg_design task), not from Website Intelligence. */
function atIsAtlasQuestion(q, rows) {
  var found = false;
  (Array.isArray(rows) ? rows : []).forEach(function (r) {
    if (!r || r.task_type !== 'edg_design') return;
    var p = atParse(r.payload_json, {}) || {};
    if (atArr(p.questions_for_john).indexOf(q) !== -1) found = true;
  });
  return found;
}
/** How John hands the chat to ATLAS for one question (Ryan, 2026-09-27: "Atlas can talk and then John also can talk"). */
var AT_VOICE = 'ATLAS, our systems architect, would like to know: ';
// Never ask what the customer already told us (Ryan, 2026-09-29: "they asked me for the website link, I already gave
// them"): a question is skipped when the customer's messages already answer its topic.
var AT_ANSWERED = [
  [/\b(web ?site|url|link|domain)\b/i, /(https?:\/\/|www\.|\b[a-z0-9][a-z0-9-]*\.(com|sg|net|org|co|biz|info|io|my)\b)/i],
  [/\bhow many (staff|people|employees)|\bteam size|\bstaff\b/i, /\b\d+\s*(staff|people|employees|workers|of us)\b/i],
  [/\b(branch|branches|outlets?|locations?)\b/i, /\b(\d+|two|three|four|five)\s+(branch|branches|outlets?|locations?|clinics?|shops?|stores?)\b|\bbranch(es)?\b.*\band\b/i]
];
function atAlreadyAnswered(q, history) {
  var said = (Array.isArray(history) ? history : []).filter(function (m) { return m && m.role !== 'agent'; }).map(function (m) { return String(m.content || ''); }).join('\n');
  return AT_ANSWERED.some(function (p) { return p[0].test(q) && p[1].test(said); });
}
/** True when an earlier agent message already asked nearly the same question (Ryan, 2026-09-29: no repeated questions). */
function atAskedBefore(q, history) {
  var words = function (t) { return String(t || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 3; }); };
  var Q = words(q); if (!Q.length) return false;
  return (Array.isArray(history) ? history : []).some(function (m) {
    if (!m || m.role !== 'agent') return false;
    return String(m.content || '').split(/(?<=[.!?])\s+/).some(function (sent) {
      if (!/\?\s*$/.test(sent)) return false;
      var S = words(sent); if (!S.length) return false;
      var inter = Q.filter(function (w, i) { return S.indexOf(w) !== -1 && Q.indexOf(w) === i; }).length;
      var uni = Q.concat(S).filter(function (w, i, a) { return a.indexOf(w) === i; }).length;
      return inter / uni >= 0.5;
    });
  });
}
function atNextQuestion(questions, history) {
  var asked = (Array.isArray(history) ? history : []).filter(function (m) { return m && m.role === 'agent'; })
    .map(function (m) { return String(m.content || '').toLowerCase(); }).join('\n');
  var qs = atArr(questions);
  for (var i = 0; i < qs.length; i++) {
    var q = qs[i].slice(0, 300);
    if (AT_UNSAFE_Q.test(q)) continue;
    if (asked.indexOf(q.toLowerCase()) !== -1) continue;
    if (atAlreadyAnswered(q, history)) continue;
    if (atAskedBefore(q, history)) continue;
    return q;
  }
  return null;
}
/** One question per message (Ryan, 2026-09-29): when ATLAS asks, John's own questions in that reply are dropped. */
function atOneQuestion(reply, question) {
  var parts = String(reply || '').trim().split(/(?<=[.!?])\s+/);
  var kept = parts.filter(function (p) { return !/\?\s*$/.test(p); });
  if (!kept.length) kept = parts.slice(0, 1).map(function (p) { return p.replace(/\?\s*$/, '.'); });
  return kept.join(' ').trim() + ' ' + AT_VOICE + question;
}
/** John's WhatsApp/email message once the system is built (Ryan, 2026-09-30: "he didn't reply me the link … people will be
 *  confused"). The link opens the prospect's "Try your system" page (their AI assistant, their CRM, what runs by itself).
 *  Sent only for a built system with a demo link, on the channel the customer used; no price, no promise. */
function atDemoMessage(input, build) {
  input = input || {}; build = build || {};
  var url = atStr(build.demo_url, 300);
  var ok = (build.status === 'built' || build.status === 'already_built') && /^https:\/\/[^\s]+\/d\/[A-Za-z0-9_-]{40,60}$/.test(url);
  // Never for a customer who asked only for a website or declined systems work (Ryan, 2026-10-01).
  var said = (Array.isArray(input.conversation) ? input.conversation : []).filter(function (m) { return m && m.role !== 'agent'; }).map(function (m) { return String(m.content || ''); }).join('\n');
  if (!atSystemsWanted({ extracted: input.extracted, message: input.message, history_text: said })) ok = false;
  var channel = input.channel === 'whatsapp' ? 'whatsapp' : (input.channel === 'email' ? 'email' : null);
  var to = channel === 'whatsapp' ? atStr(input.phone, 40) : (channel === 'email' ? atStr(input.email, 200) : '');
  var first = atStr(input.contact_name, 60).split(' ')[0];
  var biz = atStr(input.company_name, 80);
  var text = (first ? 'Hi ' + first + ', ' : 'Hi, ') + 'good news: I have set up a working demo of ' + (biz ? biz + '\'s' : 'your') + ' system for you to try:\n\n' + url + '\n\n'
    + 'Tap the link and chat with your new AI assistant as if you were one of your customers. You will see each enquiry land in your CRM, and what now runs by itself every day. '
    + 'It is a safe demo, so nothing is sent to real customers, and it takes about 2 minutes. Tell me what you think!';
  return { send: !!(ok && channel && to), channel: channel, to: to, text: text, message_id: 'msg_atlas_demo_' + atStr(input.lead_id, 80) + '_' + Date.now().toString(36) };
}

// ---- Node module wrapper (stripped when inlined into n8n) ----

if (typeof module !== 'undefined') module.exports = { AT_VERSION: AT_VERSION, AT_LABELS: AT_LABELS, atSlug: atSlug, atNeeded: atNeeded, atSystemsWanted: atSystemsWanted, atDeclinedSystems: atDeclinedSystems, atInput: atInput, atCompanyModel: atCompanyModel, atQuestions: atQuestions, atFallbackPack: atFallbackPack, atParseJson: atParseJson, atCoerce: atCoerce, atFiles: atFiles, atFinalize: atFinalize, atQuestionsFromRows: atQuestionsFromRows, atNextQuestion, atIsAtlasQuestion, AT_VOICE: AT_VOICE, atAlreadyAnswered: atAlreadyAnswered, atAskedBefore: atAskedBefore, atOneQuestion: atOneQuestion, atEdgSpec: atEdgSpec, atAiTeam: atAiTeam, atBuildUrl: atBuildUrl, atAutoBuildUrl: atAutoBuildUrl, atDemoMessage: atDemoMessage, atIndustryKey: atIndustryKey, AT_EDG_URL: AT_EDG_URL };
