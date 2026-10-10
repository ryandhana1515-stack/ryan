var AT_VERSION = 'atlas-n8n-1.0.0';
function atStr(v, max) {
  if (v === undefined || v === null) return '';
  var s = String(v).replace(/\s+/g, ' ').trim();
  return max && s.length > max ? s.slice(0, max) : s;
}
function atArr(v) { return Array.isArray(v) ? v.map(function (x) { return atStr(x, 200); }).filter(Boolean) : []; }
var AT_EDG_URL = 'https://fusion-edg-core-api.vercel.app';
var AT_INDUSTRY = [
  ['renovation', /\b(renovat\w*|interior|contractor|construction|builder|carpentry|id firm|home improvement)\b/i],
  ['clinic', /\b(clinic|dental|dentist|medical|aesthetic|physio\w*|doctor|chiropract\w*|tcm|healthcare)\b/i],
  ['property', /\b(property|real estate|realtor|condo|hdb agent|property agent)\b/i],
  ['education', /\b(tuition|education|school|academy|enrichment|course|training centre|training center)\b/i],
  ['beauty', /\b(salon|spa|beauty|hair|nail|lash|facial|massage)\b/i],
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
  var stockSaid = /\b(stock|inventory|spare parts?|parts (in|for) (the|our) vans?|warehouse|store ?room|purchase orders?|reorder\w*|run(s|ning)? out of (stock|parts|materials|items))\b/i.test(text + ' ' + wants);
  var hasErp = /\b(sap|netsuite|odoo|dynamics|erp|unleashed|cin7|tradegecko|zoho inventory)\b/i.test(acc);
  var stock = stockSaid && !hasErp;
  why.stock = stock ? 'CLIENT-PROVIDED: mentioned stock, parts or suppliers' : stockSaid ? 'mentioned stock, but they already use ' + (acc.match(/\b(sap|netsuite|odoo|dynamics|erp|unleashed|cin7|tradegecko|zoho inventory)\b/i) || ['an inventory system'])[0] + ': integrate, do not rebuild' : 'not mentioned';
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
  if (stock) { confirm.push('Stock items they keep (code, name, unit), where stock is kept (store, vans) and their suppliers'); confirm.push('When to reorder each item and how many, and what each item costs'); confirm.push('Spending limit above which a second person approves a purchase order'); }
  if (ex.uses_whatsapp !== false) confirm.push('Their WhatsApp Business number and Meta business verification (for the live system)');
  var email = atStr(input.notify_email, 200);
  var team = atAiTeam(input, ind, { whatsapp: ex.uses_whatsapp !== false, quotes: quotes, invoices: invoices, appointments: appt }, text);
  return {
    schema: 'edg.spec.v2', generated_by: AT_VERSION, generated_at: new Date().toISOString(),
    company: { name: input.company_name || 'Unnamed company', slug: (input.test_mode ? 'test-' : '') + input.slug, industry: atStr(input.industry || ex.industry, 120) || ind, timezone: 'Asia/Singapore', currency: 'SGD' },
    modules: { lead_capture: true, follow_ups: true, whatsapp: ex.uses_whatsapp !== false, quotes: quotes, invoices: invoices, appointments: appt, accounting: accounting, calendar: calendar, ceo_brief: true, stock: stock },
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
var AT_BOOL_MODULES = ['lead_capture', 'follow_ups', 'whatsapp', 'quotes', 'invoices', 'appointments', 'ceo_brief', 'stock', 'hr'];
function atSpecKey(spec) {
  if (!spec || typeof spec !== 'object') return '';
  var c = JSON.parse(JSON.stringify(spec)); delete c.generated_at; delete c.generated_by;
  return JSON.stringify(c);
}
function atUnionBy(a, b, key) {
  var out = (Array.isArray(a) ? a : []).slice(); var seen = {};
  out.forEach(function (x) { seen[String(key(x)).toLowerCase()] = true; });
  (Array.isArray(b) ? b : []).forEach(function (x) { var k = String(key(x)).toLowerCase(); if (!seen[k]) { seen[k] = true; out.push(x); } });
  return out;
}
/** New plan + saved plan: modules stay on, a known accounting/calendar system is kept, the customer's own team size wins
 *  over a placeholder, services/products/AI team are unions. The company (name, slug) never changes after the first design. */
function atMergeSpec(prev, next) {
  if (!prev || typeof prev !== 'object' || !prev.modules || !prev.company) return next;
  var out = JSON.parse(JSON.stringify(next));
  out.company = prev.company;
  out.source = Object.assign({}, next.source || {}, { design_path: (prev.source && prev.source.design_path) || (next.source && next.source.design_path) });
  var pm = prev.modules, nm = next.modules || {};
  AT_BOOL_MODULES.forEach(function (k) { if (pm[k] === true) out.modules[k] = true; });
  ['accounting', 'calendar'].forEach(function (k) { if ((!nm[k] || nm[k] === 'unknown') && pm[k] && pm[k] !== 'unknown') out.modules[k] = pm[k]; });
  out.why = Object.assign({}, prev.why || {}, next.why || {});
  Object.keys(prev.why || {}).forEach(function (k) { if (out.why[k] === 'not mentioned' && prev.why[k] !== 'not mentioned') out.why[k] = prev.why[k]; });
  var nTeam = String((next.why || {}).team || ''), pTeam = String((prev.why || {}).team || '');
  if (!/^CLIENT-PROVIDED/.test(nTeam) && /^CLIENT-PROVIDED/.test(pTeam)) { out.team = prev.team; out.why.team = pTeam; }
  if (out.modules.appointments) out.services = atUnionBy(next.services, prev.services, function (x) { return x && x.name; }).slice(0, 20);
  out.catalog = atUnionBy(next.catalog, prev.catalog, function (x) { return x && x.sku; }).slice(0, 100);
  out.agents = atUnionBy(next.agents, prev.agents, function (x) { return x && x.key; }).slice(0, 5);
  out.automations = atUnionBy(next.automations, prev.automations, function (x) { return x && x.key; }).slice(0, 30);
  out.knowledge = atUnionBy(next.knowledge, prev.knowledge, function (x) { return x && x.title; }).slice(0, 50);
  out.problems = atUnionBy(next.problems, prev.problems, function (x) { return x && x.problem; }).slice(0, 15);
  var known = out.modules.accounting && out.modules.accounting !== 'unknown';
  out.to_confirm = atUnionBy(next.to_confirm, prev.to_confirm, function (x) { return x; }).filter(function (t) { return !(known && /accounting software/i.test(t)); }).slice(0, 30);
  return out;
}
/** One update round: the saved plan (raw JSON text from the vault) + John's latest facts → whether to save a new plan. */
function atUpdateRound(opts) {
  opts = opts || {};
  var input = opts.input || {};
  var prev = null;
  try { prev = opts.prev_text ? JSON.parse(opts.prev_text) : null; } catch (e) { prev = null; }
  var basePath = atStr(opts.base_path, 300) || input.base_path;
  var useInput = Object.assign({}, input, { base_path: basePath });
  var merged = atMergeSpec(prev, atEdgSpec(useInput));
  var changed = !prev || atSpecKey(merged) !== atSpecKey(prev);
  var name = (merged.company && merged.company.name) || input.company_name || input.lead_id;
  return {
    changed: changed, reason: !prev ? 'no saved plan could be read' : changed ? 'new facts from the customer' : 'nothing new',
    path: basePath + '16_edg_spec.json', content: JSON.stringify(merged, null, 2) + '\n', base_path: basePath,
    commit: 'vault: ATLAS updated the plan for ' + name + ' (customer answers)', company_name: name, slug: merged.company && merged.company.slug,
    modules: merged.modules, team: merged.team, to_confirm: merged.to_confirm
  };
}
function atUpdateUrl() { return AT_EDG_URL + '/atlas/update'; }
/** John asks ATLAS's questions himself (Ryan, 2026-09-26). Reads the questions from ATLAS's edg_design task rows and
 *  returns the first one John has not asked yet in this conversation, skipping anything a reply guardrail would block. */
// ---- n8n glue: saved plan (GitHub) + John's latest facts → save a new plan only when something changed ----
const prep = $('Check Existing Design').first().json;
const g = ($input.first() && $input.first().json) || {};
let prevText = null;
try { if (g.content && !g.error) prevText = Buffer.from(String(g.content).replace(/\n/g, ''), 'base64').toString('utf8'); } catch (e) { prevText = null; }
const u = atUpdateRound({ input: prep.input, prev_text: prevText, base_path: prep.existing_base_path });
return [{ json: Object.assign({ tenant_id: prep.input.tenant_id, lead_id: prep.input.lead_id, test_mode: prep.input.test_mode, file_exists: !!prevText, update_url: atUpdateUrl(), ts: new Date().toISOString() }, u) }];
