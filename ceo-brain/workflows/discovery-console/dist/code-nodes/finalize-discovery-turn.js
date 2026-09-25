var DS_VERSION = 'company-discovery-1.0.0';
var DS_SCHEMA_VERSION = '1.0';
var DS_TOPICS = ['company', 'customers', 'sales', 'marketing', 'communication', 'software', 'operations', 'customer_service', 'finance', 'hr_team', 'management', 'automation', 'data_sources'];
var DS_MODULES = ['ceo_dashboard', 'sales_brain', 'marketing_brain', 'customer_service_brain', 'operations_brain', 'project_brain', 'finance_information_brain', 'admin_brain', 'knowledge_brain', 'reporting_brain'];
var DS_AGENTS = ['company_discovery', 'sales', 'solution_architect', 'website_architect', 'sme_website_builder', 'medical_website_builder', 'customer_service', 'email_admin', 'marketing', 'operations', 'finance_assistant', 'ceo_intelligence'];
var DS_CHANNELS = ['whatsapp', 'whatsapp_business', 'email', 'phone', 'sms', 'website_chat', 'social_dm', 'telegram', 'other'];
var DS_MKT = ['facebook', 'instagram', 'tiktok', 'google', 'youtube', 'website', 'seo', 'email_marketing', 'linkedin', 'referrals', 'events', 'other'];
var DS_SW_CATS = ['crm', 'erp', 'accounting', 'pos', 'booking', 'spreadsheets', 'google_workspace', 'microsoft_365', 'cloud_storage', 'industry_specific', 'internal_app', 'messaging', 'ecommerce', 'other'];
var DS_DATA_CATS = ['customer_records', 'lead_records', 'sales_records', 'product_service_info', 'pricing', 'faqs', 'sops', 'documents', 'templates', 'policies', 'past_quotations', 'contracts', 'marketing_materials', 'website_content', 'email', 'calendars', 'project_info', 'operational_spreadsheets', 'accounting_platform', 'support_info', 'employee_roles'];
var DS_AVAIL = ['AVAILABLE', 'NOT_AVAILABLE', 'UNKNOWN', 'CONNECTION_REQUIRED', 'IMPORT_REQUIRED', 'NOT_REQUIRED'];
var DS_HANDLING = ['CONNECTED_LIVE', 'IMPORTED', 'INDEXED', 'SUMMARIZED', 'LEFT_IN_PLACE'];
var DS_COMPLETE_AT = 0.75;
var DS_MIN_TURNS = 4;
var DS_QUESTIONS = {
  company: 'Tell me about your company. What do you sell, and roughly how many people work there?',
  customers: 'Who buys from you — other businesses or consumers — and what does a typical customer look like?',
  sales: 'Where do your leads come from today, who answers them, and how quickly? Where do you feel leads get lost?',
  marketing: 'How do people find you — Facebook, Instagram, TikTok, Google, referrals? Do you run ads or work with an agency?',
  communication: 'How do customers talk to you day to day — WhatsApp, email, phone, website chat?',
  software: 'What software runs the business today — any CRM, accounting system, POS, booking tool, or mostly spreadsheets and WhatsApp?',
  operations: 'Once a job comes in, who does the work, how are tasks assigned, and where do delays usually happen?',
  customer_service: 'When customers need help, who answers, and what do they ask most often?',
  finance: 'How do quotations, invoices and payment collection work today, and which accounting software do you use?',
  hr_team: 'How is the team organised — departments, who approves what, and are there written procedures?',
  management: 'What do you check every day as the owner, and what information is hardest to get?',
  automation: 'What work does your team repeat every day, what gets copied and pasted, and what gets forgotten?',
  data_sources: 'Where does your customer list live right now — Excel, a CRM, WhatsApp, or nowhere in particular? That is fine either way; we will work with what exists.'
};
function dsStr(v, max) { if (v === undefined || v === null) return null; var s = String(v).replace(/\s+/g, ' ').trim(); if (!s) return null; return max && s.length > max ? s.slice(0, max) : s; }
function dsArr(v, max, allowed) {
  if (!Array.isArray(v)) return [];
  var out = [];
  for (var i = 0; i < v.length && out.length < (max || 30); i++) { var s = dsStr(v[i], 240); if (!s) continue; if (allowed && allowed.indexOf(s) === -1) continue; if (out.indexOf(s) === -1) out.push(s); }
  return out;
}
function dsIntOrNull(v) { var n = parseInt(v, 10); return isNaN(n) || n < 0 ? null : n; }
function dsBoolOrNull(v) { return v === true || v === false ? v : null; }
function dsEmptyMap() {
  return {
    schema_version: DS_SCHEMA_VERSION,
    company_profile: { company_name: null, brand_name: null, industry: null, locations: [], markets: [], products: [], services: [], employees: null, departments: [], management_structure: null },
    customers: { who_buys: null, business_model: null, typical_customer: null, segments: [], journey: null, repeat_customers: null, existing_database: null },
    sales_process: { lead_sources: [], lead_receiver: null, response_time: null, follow_up_owner: null, follow_up_count: null, quotation_process: null, deal_tracking: null, where_leads_lost: null, qualified_lead_definition: null, hot_lead_definition: null },
    marketing: { channels: [], agencies: null, content_production: null, lead_forms: null },
    communication_channels: [],
    current_software: [],
    operations_process: { work_intake: null, who_performs: null, task_assignment: null, deadline_tracking: null, approvals: null, delays: null },
    customer_service: { channels: [], responder: null, common_questions: [], complaints: null, refund_process: null, escalations: null },
    finance_process: { accounting_software: null, invoicing: null, quotations: null, payment_collection: null, expenses: null, outstanding_followup: null },
    people_roles: { departments: [], roles: [], approval_hierarchy: null, task_allocation: null, internal_comms: null, onboarding: null, sops: null },
    management: { daily_checks: [], reports_received: [], hard_to_get_info: [], slow_decisions: [], surprises: [] },
    automation: { repeated_daily: [], copy_paste: [], forgotten: [], too_long: [], customers_repeat_ask: [], wish_automatic: [] },
    data_sources: [],
    pain_points: [], automation_opportunities: [], integration_requirements: [], security_requirements: [], ceo_reporting_requirements: [],
    proposed_modules: [], proposed_agents: []
  };
}
/** Coerce anything map-shaped into a valid map (unknown → null/[]). */
function dsCoerceMap(m) {
  m = (m && typeof m === 'object' && !Array.isArray(m)) ? m : {};
  var e = dsEmptyMap();
  var o = function (k) { return (m[k] && typeof m[k] === 'object' && !Array.isArray(m[k])) ? m[k] : {}; };
  var cp = o('company_profile'), cu = o('customers'), sp = o('sales_process'), mk = o('marketing'), op = o('operations_process'), cs = o('customer_service'), fi = o('finance_process'), pr = o('people_roles'), mg = o('management'), au = o('automation');
  e.company_profile = { company_name: dsStr(cp.company_name, 160), brand_name: dsStr(cp.brand_name, 160), industry: dsStr(cp.industry, 120), locations: dsArr(cp.locations, 20), markets: dsArr(cp.markets, 20), products: dsArr(cp.products, 30), services: dsArr(cp.services, 30), employees: dsIntOrNull(cp.employees), departments: dsArr(cp.departments, 20), management_structure: dsStr(cp.management_structure, 400) };
  e.customers = { who_buys: dsStr(cu.who_buys, 300), business_model: ['B2B', 'B2C', 'both'].indexOf(cu.business_model) !== -1 ? cu.business_model : null, typical_customer: dsStr(cu.typical_customer, 300), segments: dsArr(cu.segments, 15), journey: dsStr(cu.journey, 500), repeat_customers: dsBoolOrNull(cu.repeat_customers), existing_database: dsStr(cu.existing_database, 200) };
  e.sales_process = { lead_sources: dsArr(sp.lead_sources, 15), lead_receiver: dsStr(sp.lead_receiver, 200), response_time: dsStr(sp.response_time, 120), follow_up_owner: dsStr(sp.follow_up_owner, 200), follow_up_count: dsStr(sp.follow_up_count, 120), quotation_process: dsStr(sp.quotation_process, 400), deal_tracking: dsStr(sp.deal_tracking, 300), where_leads_lost: dsStr(sp.where_leads_lost, 400), qualified_lead_definition: dsStr(sp.qualified_lead_definition, 300), hot_lead_definition: dsStr(sp.hot_lead_definition, 300) };
  e.marketing = { channels: dsArr(mk.channels, 12, DS_MKT), agencies: dsStr(mk.agencies, 200), content_production: dsStr(mk.content_production, 300), lead_forms: dsStr(mk.lead_forms, 300) };
  e.communication_channels = dsArr(m.communication_channels, 9, DS_CHANNELS);
  var sw = Array.isArray(m.current_software) ? m.current_software : [];
  for (var i = 0; i < sw.length && e.current_software.length < 25; i++) { var s = sw[i]; if (!s) continue; if (typeof s === 'string') s = { name: s, category: 'other', notes: null }; var nm = dsStr(s.name, 80); if (!nm) continue; if (e.current_software.some(function (x) { return x.name.toLowerCase() === nm.toLowerCase(); })) continue; e.current_software.push({ name: nm, category: DS_SW_CATS.indexOf(s.category) !== -1 ? s.category : 'other', notes: dsStr(s.notes, 200) }); }
  e.operations_process = { work_intake: dsStr(op.work_intake, 400), who_performs: dsStr(op.who_performs, 300), task_assignment: dsStr(op.task_assignment, 300), deadline_tracking: dsStr(op.deadline_tracking, 300), approvals: dsStr(op.approvals, 300), delays: dsStr(op.delays, 400) };
  e.customer_service = { channels: dsArr(cs.channels, 10), responder: dsStr(cs.responder, 200), common_questions: dsArr(cs.common_questions, 20), complaints: dsStr(cs.complaints, 300), refund_process: dsStr(cs.refund_process, 300), escalations: dsStr(cs.escalations, 300) };
  e.finance_process = { accounting_software: dsStr(fi.accounting_software, 120), invoicing: dsStr(fi.invoicing, 300), quotations: dsStr(fi.quotations, 300), payment_collection: dsStr(fi.payment_collection, 300), expenses: dsStr(fi.expenses, 300), outstanding_followup: dsStr(fi.outstanding_followup, 300) };
  e.people_roles = { departments: dsArr(pr.departments, 20), roles: dsArr(pr.roles, 30), approval_hierarchy: dsStr(pr.approval_hierarchy, 300), task_allocation: dsStr(pr.task_allocation, 300), internal_comms: dsStr(pr.internal_comms, 200), onboarding: dsStr(pr.onboarding, 300), sops: dsStr(pr.sops, 300) };
  e.management = { daily_checks: dsArr(mg.daily_checks, 15), reports_received: dsArr(mg.reports_received, 15), hard_to_get_info: dsArr(mg.hard_to_get_info, 15), slow_decisions: dsArr(mg.slow_decisions, 15), surprises: dsArr(mg.surprises, 15) };
  e.automation = { repeated_daily: dsArr(au.repeated_daily, 20), copy_paste: dsArr(au.copy_paste, 20), forgotten: dsArr(au.forgotten, 20), too_long: dsArr(au.too_long, 20), customers_repeat_ask: dsArr(au.customers_repeat_ask, 20), wish_automatic: dsArr(au.wish_automatic, 20) };
  var ds = Array.isArray(m.data_sources) ? m.data_sources : [];
  for (var k = 0; k < ds.length && e.data_sources.length < 25; k++) { var d = ds[k]; if (!d || typeof d !== 'object') continue; if (DS_DATA_CATS.indexOf(d.category) === -1) continue; if (e.data_sources.some(function (x) { return x.category === d.category; })) continue; e.data_sources.push({ category: d.category, availability: DS_AVAIL.indexOf(d.availability) !== -1 ? d.availability : 'UNKNOWN', source_system: dsStr(d.source_system, 120), owner: dsStr(d.owner, 120), format: dsStr(d.format, 80), approx_volume: dsStr(d.approx_volume, 80), sensitivity: ['low', 'medium', 'high'].indexOf(d.sensitivity) !== -1 ? d.sensitivity : null, import_method: dsStr(d.import_method, 200), authorization_required: dsBoolOrNull(d.authorization_required), handling: DS_HANDLING.indexOf(d.handling) !== -1 ? d.handling : null }); }
  e.pain_points = dsArr(m.pain_points, 25); e.automation_opportunities = dsArr(m.automation_opportunities, 25); e.integration_requirements = dsArr(m.integration_requirements, 25); e.security_requirements = dsArr(m.security_requirements, 15); e.ceo_reporting_requirements = dsArr(m.ceo_reporting_requirements, 15);
  e.proposed_modules = dsArr(m.proposed_modules, 10, DS_MODULES); e.proposed_agents = dsArr(m.proposed_agents, 12, DS_AGENTS);
  return e;
}
/** Deep merge of a patch into the map: arrays union (by value / by name / by category), scalars overwrite only when non-null. */
function dsMergeMap(base, patch) {
  var out = dsCoerceMap(base);
  var p = dsCoerceMap(patch);
  function mergeObj(a, b) { for (var k in b) { if (!Object.prototype.hasOwnProperty.call(b, k)) continue; if (Array.isArray(b[k])) { for (var i = 0; i < b[k].length; i++) if (a[k].indexOf(b[k][i]) === -1) a[k].push(b[k][i]); } else if (b[k] !== null && b[k] !== undefined) a[k] = b[k]; } }
  mergeObj(out.company_profile, p.company_profile); mergeObj(out.customers, p.customers); mergeObj(out.sales_process, p.sales_process); mergeObj(out.marketing, p.marketing);
  mergeObj(out.operations_process, p.operations_process); mergeObj(out.customer_service, p.customer_service); mergeObj(out.finance_process, p.finance_process); mergeObj(out.people_roles, p.people_roles); mergeObj(out.management, p.management); mergeObj(out.automation, p.automation);
  var lists = ['communication_channels', 'pain_points', 'automation_opportunities', 'integration_requirements', 'security_requirements', 'ceo_reporting_requirements', 'proposed_modules', 'proposed_agents'];
  for (var l = 0; l < lists.length; l++) for (var j = 0; j < p[lists[l]].length; j++) if (out[lists[l]].indexOf(p[lists[l]][j]) === -1) out[lists[l]].push(p[lists[l]][j]);
  for (var s = 0; s < p.current_software.length; s++) { var ps = p.current_software[s]; var ex = null; for (var t = 0; t < out.current_software.length; t++) if (out.current_software[t].name.toLowerCase() === ps.name.toLowerCase()) ex = out.current_software[t]; if (ex) { if (ps.category !== 'other') ex.category = ps.category; if (ps.notes) ex.notes = ps.notes; } else out.current_software.push(ps); }
  for (var d = 0; d < p.data_sources.length; d++) { var pd = p.data_sources[d]; var exd = null; for (var u = 0; u < out.data_sources.length; u++) if (out.data_sources[u].category === pd.category) exd = out.data_sources[u]; if (exd) { for (var key in pd) if (Object.prototype.hasOwnProperty.call(pd, key) && pd[key] !== null && !(key === 'availability' && pd[key] === 'UNKNOWN')) exd[key] = pd[key]; } else out.data_sources.push(pd); }
  return out;
}
/** Which topics have any content, and the coverage ratio. */
function dsTopicStatus(map) {
  map = dsCoerceMap(map);
  var has = function (obj) { for (var k in obj) { if (!Object.prototype.hasOwnProperty.call(obj, k)) continue; var v = obj[k]; if (Array.isArray(v) ? v.length : (v !== null && v !== undefined)) return true; } return false; };
  var st = {
    company: has(map.company_profile), customers: has(map.customers), sales: has(map.sales_process), marketing: has(map.marketing), communication: map.communication_channels.length > 0,
    software: map.current_software.length > 0, operations: has(map.operations_process), customer_service: has(map.customer_service), finance: has(map.finance_process), hr_team: has(map.people_roles),
    management: has(map.management), automation: has(map.automation) || map.automation_opportunities.length > 0, data_sources: map.data_sources.length > 0
  };
  var n = 0; for (var i = 0; i < DS_TOPICS.length; i++) if (st[DS_TOPICS[i]]) n++;
  return { status: st, covered: n, total: DS_TOPICS.length, coverage: Math.round((n / DS_TOPICS.length) * 100) / 100 };
}
function dsNextTopics(map, max) { var st = dsTopicStatus(map).status; var out = []; for (var i = 0; i < DS_TOPICS.length && out.length < (max || 3); i++) if (!st[DS_TOPICS[i]]) out.push(DS_TOPICS[i]); return out; }
var DS_SOFTWARE = [
  [/\bhubspot\b/i, 'HubSpot', 'crm'], [/\bsalesforce\b/i, 'Salesforce', 'crm'], [/\bpipedrive\b/i, 'Pipedrive', 'crm'], [/\bzoho\b/i, 'Zoho', 'crm'], [/\bmonday\.com|\bmonday\b/i, 'monday.com', 'internal_app'],
  [/\bxero\b/i, 'Xero', 'accounting'], [/\bquickbooks\b/i, 'QuickBooks', 'accounting'], [/\bmyob\b/i, 'MYOB', 'accounting'], [/\bsap\b/i, 'SAP', 'erp'], [/\bnetsuite\b/i, 'NetSuite', 'erp'], [/\bodoo\b/i, 'Odoo', 'erp'],
  [/\bshopify\b/i, 'Shopify', 'ecommerce'], [/\bwoocommerce\b/i, 'WooCommerce', 'ecommerce'], [/\blazada\b|\bshopee\b/i, 'Marketplaces (Lazada/Shopee)', 'ecommerce'],
  [/\bexcel\b|\bspreadsheets?\b/i, 'Excel / spreadsheets', 'spreadsheets'], [/\bgoogle sheets?\b/i, 'Google Sheets', 'spreadsheets'], [/\bgoogle (drive|workspace)\b|\bgmail\b/i, 'Google Workspace', 'google_workspace'], [/\b(microsoft 365|office 365|outlook|onedrive|sharepoint)\b/i, 'Microsoft 365', 'microsoft_365'], [/\bdropbox\b/i, 'Dropbox', 'cloud_storage'],
  [/\bcalendly\b|\bbooking (system|software|app)\b|\bfresha\b|\bsetmore\b/i, 'Booking tool', 'booking'], [/\b(pos|point of sale|square|lightspeed)\b/i, 'POS', 'pos'], [/\bwhatsapp business\b/i, 'WhatsApp Business', 'messaging'], [/\bnotion\b/i, 'Notion', 'internal_app'], [/\btrello\b|\basana\b|\bclickup\b/i, 'Task board (Trello/Asana/ClickUp)', 'internal_app']
];
var DS_LEAD_SOURCES = [[/\bfacebook\b|\bfb\b/i, 'facebook'], [/\binstagram\b|\big\b/i, 'instagram'], [/\btiktok\b/i, 'tiktok'], [/\bgoogle (ads|search)?\b/i, 'google'], [/\byoutube\b/i, 'youtube'], [/\bwebsite\b|\bweb ?site\b/i, 'website'], [/\bseo\b/i, 'seo'], [/\bemail (marketing|blast|newsletter)/i, 'email_marketing'], [/\blinkedin\b/i, 'linkedin'], [/\breferral|word of mouth|recommend/i, 'referrals'], [/\bevent|roadshow|exhibition|trade show/i, 'events']];
var DS_COMMS = [[/\bwhatsapp business\b/i, 'whatsapp_business'], [/\bwhatsapp\b/i, 'whatsapp'], [/\bemail/i, 'email'], [/\bphone|\bcall/i, 'phone'], [/\bsms\b/i, 'sms'], [/live ?chat|website chat/i, 'website_chat'], [/\bdm\b|direct message|instagram message|facebook message/i, 'social_dm'], [/\btelegram\b/i, 'telegram']];
var DS_INDUSTRY = [[/\b(clinic|dental|doctor|medical|aesthetic|healthcare)\b/i, 'healthcare'], [/\b(logistic|courier|delivery|freight)/i, 'logistics'], [/\b(property|real estate|realtor)\b/i, 'real estate'], [/\b(restaurant|cafe|café|f&b|catering|bakery)\b/i, 'food & beverage'], [/\b(salon|spa|beauty|wellness)\b/i, 'beauty & wellness'], [/\b(tuition|school|academy|education|training)\b/i, 'education'], [/\b(renovat|contractor|interior design|plumb|electric)/i, 'home services / construction'], [/\b(law firm|lawyer|accounting firm|accountant|consult)/i, 'professional services'], [/\b(retail|shop|store|e-?commerce|boutique)\b/i, 'retail / e-commerce'], [/\b(manufactur|factory|wholesale|distributor|supplier)/i, 'manufacturing / wholesale'], [/\b(software|saas|tech|it services)\b/i, 'technology'], [/\b(agency|marketing)\b/i, 'marketing agency']];
function dsExtractPatch(text) {
  text = String(text || '');
  var p = dsEmptyMap();
  var m;
  if ((m = text.match(/\b(?:[Ww]e are|[Ii] run|[Ii] own|[Mm]y company is|[Oo]ur company is|company called|[Oo]ur clinic is|[Ww]e're|[Ii]'m from)\s+([A-Z][\w&'.\- ]{2,60}?(?:Pte\.? Ltd\.?|Ltd\.?|LLP|Inc\.?|Co\.?|Clinic|Dental|Medical|Group|Agency|Studio)?)(?=[,.\n]| and | with | that | in | based )/))) p.company_profile.company_name = dsStr(m[1], 160);
  if ((m = text.match(/\b(\d{1,4})\s*(?:people|staff|employees|pax|workers|team members|drivers|agents|dentists|doctors|technicians|sales ?people)\b/i))) p.company_profile.employees = dsIntOrNull(m[1]);
  for (var i = 0; i < DS_INDUSTRY.length; i++) if (DS_INDUSTRY[i][0].test(text)) { p.company_profile.industry = DS_INDUSTRY[i][1]; break; }
  if ((m = text.match(/\b(?:based|located|office|outlets?|clinics?|shops?|branch(?:es)?)\s+(?:in|at)\s+([A-Z][\w' ]{2,40}?)(?=[,.\n]| and | with )/))) p.company_profile.locations.push(dsStr(m[1], 60));
  if (/\b(b2b|other businesses|companies|corporate clients|smes?)\b/i.test(text) && /\b(b2c|consumers|individuals|families|patients|walk-?ins|homeowners)\b/i.test(text)) p.customers.business_model = 'both';
  else if (/\b(b2b|other businesses|corporate clients|companies buy|smes? buy)\b/i.test(text)) p.customers.business_model = 'B2B';
  else if (/\b(b2c|consumers|individuals|families|patients|walk-?ins|homeowners|end customers)\b/i.test(text)) p.customers.business_model = 'B2C';
  for (var s = 0; s < DS_SOFTWARE.length; s++) if (DS_SOFTWARE[s][0].test(text)) p.current_software.push({ name: DS_SOFTWARE[s][1], category: DS_SOFTWARE[s][2], notes: null });
  for (var l = 0; l < DS_LEAD_SOURCES.length; l++) if (DS_LEAD_SOURCES[l][0].test(text) && /\b(lead|enquir|inquir|customers? (come|find)|find us|ads?|advertis|marketing|campaign|post)/i.test(text)) { p.marketing.channels.push(DS_LEAD_SOURCES[l][1]); p.sales_process.lead_sources.push(DS_LEAD_SOURCES[l][1]); }
  for (var c = 0; c < DS_COMMS.length; c++) if (DS_COMMS[c][0].test(text)) { if (DS_COMMS[c][1] === 'whatsapp' && p.communication_channels.indexOf('whatsapp_business') !== -1) continue; p.communication_channels.push(DS_COMMS[c][1]); }
  if (/\b(excel|spreadsheet|google sheets?)\b/i.test(text) && /\b(customer|client|contact)s?\b/i.test(text)) { p.customers.existing_database = 'Spreadsheet'; p.data_sources.push({ category: 'customer_records', availability: 'IMPORT_REQUIRED', source_system: 'Spreadsheet', owner: null, format: 'xlsx/csv', approx_volume: null, sensitivity: 'medium', import_method: 'We import the spreadsheet; no manual clean-up needed first', authorization_required: false, handling: 'IMPORTED' }); }
  else if (/\b(hubspot|salesforce|pipedrive|zoho)\b/i.test(text)) { p.customers.existing_database = 'CRM'; p.data_sources.push({ category: 'customer_records', availability: 'CONNECTION_REQUIRED', source_system: 'CRM', owner: null, format: 'API', approx_volume: null, sensitivity: 'medium', import_method: 'Authorized CRM integration (OAuth)', authorization_required: true, handling: 'CONNECTED_LIVE' }); }
  else if (/\b(everything|all|customers?|contacts?).{0,20}\b(in|on) whatsapp\b/i.test(text)) { p.customers.existing_database = 'WhatsApp'; p.data_sources.push({ category: 'customer_records', availability: 'UNKNOWN', source_system: 'WhatsApp', owner: null, format: 'chats', approx_volume: null, sensitivity: 'high', import_method: 'Determine WhatsApp Business setup first, then what can be connected or migrated', authorization_required: true, handling: null }); }
  else if (/\b(don'?t know|no idea|not sure) where\b/i.test(text)) { p.customers.existing_database = 'Unknown — guided Data Discovery Checklist'; p.data_sources.push({ category: 'customer_records', availability: 'UNKNOWN', source_system: null, owner: null, format: null, approx_volume: null, sensitivity: null, import_method: 'Guided Data Discovery Checklist', authorization_required: null, handling: null }); }
  if (/\b(xero|quickbooks|myob)\b/i.test(text)) { p.finance_process.accounting_software = (text.match(/\b(xero|quickbooks|myob)\b/i) || [''])[0]; p.data_sources.push({ category: 'accounting_platform', availability: 'CONNECTION_REQUIRED', source_system: p.finance_process.accounting_software, owner: null, format: 'API', approx_volume: null, sensitivity: 'high', import_method: 'Authorized accounting integration; only what the approved implementation needs', authorization_required: true, handling: 'CONNECTED_LIVE' }); }
  if (/\bgoogle drive\b/i.test(text)) p.data_sources.push({ category: 'documents', availability: 'CONNECTION_REQUIRED', source_system: 'Google Drive', owner: null, format: 'files', approx_volume: null, sensitivity: 'medium', import_method: 'Google Drive authorization; identify the relevant folders', authorization_required: true, handling: 'INDEXED' });
  var pains = text.match(/(?:problem|issue|pain|frustrat|struggl|lose|lost|forget|forgotten|slow|too long|miss(?:ed|ing)?|no time|manual(?:ly)?|copy(?:ing)? and past(?:e|ing)|repeat(?:ing|edly)?)[^.!?\n]{0,140}/gi) || [];
  for (var q = 0; q < pains.length && p.pain_points.length < 5; q++) { var ps = dsStr(pains[q], 160); if (ps && p.pain_points.indexOf(ps) === -1) p.pain_points.push(ps); }
  if (/\b(lead|enquir|inquir|follow.?up|quote|quotation)/i.test(text)) { p.automation_opportunities.push('Lead capture + AI qualification + follow-up'); p.proposed_modules.push('sales_brain'); p.proposed_agents.push('sales'); }
  if (/\b(customer service|support|complain|faq|repeat(ed)? questions?)/i.test(text)) { p.automation_opportunities.push('24/7 customer service on approved FAQs'); p.proposed_modules.push('customer_service_brain'); p.proposed_agents.push('customer_service'); }
  if (/\b(invoice|payment|outstanding|chase|overdue|accounting)/i.test(text)) { p.automation_opportunities.push('Invoice and outstanding-payment follow-up (information only)'); p.proposed_modules.push('finance_information_brain'); p.proposed_agents.push('finance_assistant'); }
  if (/\b(web ?site|landing page|online store)\b/i.test(text)) { p.automation_opportunities.push('Premium website connected to lead capture'); p.proposed_agents.push(/\b(clinic|dental|doctor|medical|aesthetic)\b/i.test(text) ? 'medical_website_builder' : 'sme_website_builder'); p.proposed_agents.push('website_architect'); }
  if (/\b(report|dashboard|see what|visibility|don'?t know what'?s happening|no overview)/i.test(text)) { p.proposed_modules.push('ceo_dashboard'); p.proposed_modules.push('reporting_brain'); p.proposed_agents.push('ceo_intelligence'); }
  if (/\b(marketing|ads?|content|posting|social media)\b/i.test(text)) { p.proposed_modules.push('marketing_brain'); p.proposed_agents.push('marketing'); }
  if (/\b(schedul|task|deadline|jobs?|operations?|delivery|dispatch)\b/i.test(text)) { p.proposed_modules.push('operations_brain'); p.proposed_agents.push('operations'); }
  return p;
}
function dsReassurance(patch) {
  var db = patch.customers.existing_database || '';
  if (/spreadsheet/i.test(db)) return "That's fine. We can import the spreadsheet as it is — you don't need to organise anything manually first.";
  if (/crm/i.test(db)) return 'Good — we connect to your CRM through an authorized integration, so it stays your system of record.';
  if (/whatsapp/i.test(db)) return "Understood. We'll first check which WhatsApp Business setup you're on and what can be connected or migrated properly.";
  if (/unknown/i.test(db)) return "No problem — most owners don't. We'll walk through a short checklist together to find where things actually live.";
  return '';
}
function dsRecordAnswer(patch, topic, answer) {
  answer = dsStr(answer, 300); if (!answer) return;
  var p = patch;
  if (topic === 'company') { if (!p.company_profile.management_structure && !p.company_profile.company_name && !p.company_profile.industry) p.company_profile.management_structure = answer; }
  else if (topic === 'customers') { if (!p.customers.typical_customer) p.customers.typical_customer = answer; }
  else if (topic === 'sales') { if (!p.sales_process.lead_receiver) p.sales_process.lead_receiver = answer; }
  else if (topic === 'marketing') { if (!p.marketing.content_production && !p.marketing.channels.length) p.marketing.content_production = answer; }
  else if (topic === 'communication') { if (!p.communication_channels.length) p.communication_channels.push('other'); }
  else if (topic === 'software') { if (!p.current_software.length) p.current_software.push({ name: 'As described: ' + answer.slice(0, 70), category: 'other', notes: answer }); }
  else if (topic === 'operations') { if (!p.operations_process.work_intake) p.operations_process.work_intake = answer; }
  else if (topic === 'customer_service') { if (!p.customer_service.responder) p.customer_service.responder = answer; }
  else if (topic === 'finance') { if (!p.finance_process.invoicing) p.finance_process.invoicing = answer; }
  else if (topic === 'hr_team') { if (!p.people_roles.approval_hierarchy) p.people_roles.approval_hierarchy = answer; }
  else if (topic === 'management') { if (!p.management.daily_checks.length) p.management.daily_checks.push(answer); }
  else if (topic === 'automation') { if (!p.automation.repeated_daily.length) p.automation.repeated_daily.push(answer); }
  else if (topic === 'data_sources') { if (!p.data_sources.length) p.data_sources.push({ category: 'customer_records', availability: 'UNKNOWN', source_system: answer.slice(0, 120), owner: null, format: null, approx_volume: null, sensitivity: null, import_method: 'To be confirmed', authorization_required: null, handling: null }); }
}
/** Deterministic turn when the model is unavailable: extract with rules, record the answer under the asked topic, reassure, ask the next one or two topics. */
function dsFallbackTurn(input) {
  input = input || {};
  var base = dsCoerceMap(input.map);
  var patch = dsExtractPatch(input.message);
  if (base.company_profile.industry) patch.company_profile.industry = null;
  if (base.company_profile.company_name) patch.company_profile.company_name = null;
  if (base.customers.business_model) patch.customers.business_model = null;
  var asked = (parseInt(input.turns, 10) || 0) > 0 ? dsNextTopics(base, 2) : [];
  var msg = String(input.message || '');
  if (asked.length && msg.length > 15) {
    var halves = msg.split(/(?<=[.!?])\s+(?=[A-Z])/);
    dsRecordAnswer(patch, asked[0], asked.length > 1 && halves.length > 1 ? halves.slice(0, Math.ceil(halves.length / 2)).join(' ') : msg);
    if (asked.length > 1 && halves.length > 1) dsRecordAnswer(patch, asked[1], halves.slice(Math.ceil(halves.length / 2)).join(' '));
  }
  var merged = dsMergeMap(base, patch);
  var next = dsNextTopics(merged, 2);
  var ts = dsTopicStatus(merged);
  var parts = [];
  var learned = [];
  if (patch.company_profile.company_name) learned.push(patch.company_profile.company_name);
  if (patch.company_profile.industry) learned.push(patch.company_profile.industry);
  if (patch.company_profile.employees !== null) learned.push(patch.company_profile.employees + ' people');
  if (patch.current_software.length) learned.push('using ' + patch.current_software.map(function (s) { return s.name; }).join(', '));
  if (learned.length) parts.push('Thanks — noted: ' + learned.join(', ') + '.');
  else if (input.message) parts.push('Thanks, that helps.');
  var re = dsReassurance(patch); if (re) parts.push(re);
  if (next.length) parts.push(DS_QUESTIONS[next[0]] + (next[1] ? ' Also, ' + DS_QUESTIONS[next[1]].charAt(0).toLowerCase() + DS_QUESTIONS[next[1]].slice(1) : ''));
  else parts.push('I think I have a clear picture of the company now. I will put together your Company Map and a first proposal outline for our team to review.');
  var covered = []; for (var t = 0; t < DS_TOPICS.length; t++) if (ts.status[DS_TOPICS[t]] && !dsTopicStatus(base).status[DS_TOPICS[t]]) covered.push(DS_TOPICS[t]);
  return {
    schema_version: DS_SCHEMA_VERSION,
    reply: parts.join(' ').slice(0, 1500),
    map_patch: patch,
    topics_covered_this_turn: covered,
    next_topics: next,
    data_onboarding_plan: merged.data_sources.map(function (d) { return d.category.replace(/_/g, ' ') + ': ' + (d.handling ? d.handling.replace(/_/g, ' ').toLowerCase() : 'to be determined') + (d.import_method ? ' — ' + d.import_method : ''); }),
    discovery_complete: ts.coverage >= DS_COMPLETE_AT && (parseInt(input.turns, 10) || 0) + 1 >= DS_MIN_TURNS,
    confidence: 0.4,
    reasoning: 'Deterministic fallback turn (' + DS_VERSION + '): facts extracted by rules from the owner\'s own words; questions follow the discovery plan.'
  };
}
function dsCoerceTurn(t) {
  t = (t && typeof t === 'object' && !Array.isArray(t)) ? t : {};
  var conf = Number(t.confidence);
  return {
    schema_version: DS_SCHEMA_VERSION,
    reply: typeof t.reply === 'string' ? t.reply.trim().slice(0, 1500) : '',
    map_patch: dsCoerceMap(t.map_patch),
    topics_covered_this_turn: dsArr(t.topics_covered_this_turn, 13, DS_TOPICS),
    next_topics: dsArr(t.next_topics, 3, DS_TOPICS),
    data_onboarding_plan: dsArr(t.data_onboarding_plan, 20),
    discovery_complete: t.discovery_complete === true,
    confidence: isNaN(conf) ? 0 : Math.max(0, Math.min(1, conf)),
    reasoning: dsStr(t.reasoning, 600) || ''
  };
}
function dsValidateTurn(t) {
  var errs = [];
  if (!t || typeof t !== 'object') return ['not_an_object'];
  if (t.schema_version !== DS_SCHEMA_VERSION) errs.push('schema_version');
  if (typeof t.reply !== 'string' || t.reply.length < 2) errs.push('reply');
  if (!t.map_patch || typeof t.map_patch !== 'object') errs.push('map_patch');
  if (!Array.isArray(t.next_topics) || t.next_topics.length > 3) errs.push('next_topics');
  if (typeof t.confidence !== 'number' || t.confidence < 0 || t.confidence > 1) errs.push('confidence');
  if ((t.reply.match(/\?/g) || []).length > 3) errs.push('too_many_questions');
  return errs;
}
function dsParseJson(text) {
  if (typeof text !== 'string') return null;
  var s = text.trim();
  var fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  if (s.charAt(0) !== '{') { var i = s.indexOf('{'), k = s.lastIndexOf('}'); if (i === -1 || k === -1 || k < i) return null; s = s.slice(i, k + 1); }
  try { return JSON.parse(s); } catch (e) { return null; }
}
var DS_FORBIDDEN = [[/\b(password|passcode|login details|api key|access token)\b/i, 'reply_asks_for_credentials'], [/\b(send|give|share)\b[^.?!]{0,40}\b(all|everything|entire)\b[^.?!]{0,30}\b(data|database|files|records)\b/i, 'reply_asks_for_all_data'], [/(S?\$|SGD|USD)\s?\d|\b\d+\s?(dollars|k\b)/i, 'reply_contains_price'], [/\bguarantee/i, 'reply_contains_guarantee']];
/**
 * finalizeDiscoveryTurn({ raw_text, error, input:{ map, message, contact_name } })
 * -> { turn, map, coverage, topic_status, next_topics, provider, fallback_used, fallback_reason, validation_errors, guardrails }
 */
function finalizeDiscoveryTurn(opts) {
  opts = opts || {};
  var input = opts.input || {};
  var errs = [], reason = null, turn = null;
  if (opts.error) reason = String(opts.error);
  else {
    var parsed = dsParseJson(opts.raw_text);
    if (!parsed) reason = 'model_output_not_json';
    else { turn = dsCoerceTurn(parsed); errs = dsValidateTurn(turn); if (errs.length) { reason = 'schema_invalid: ' + errs.join(','); turn = null; } }
  }
  var fallbackUsed = !turn;
  if (fallbackUsed) turn = dsFallbackTurn(input);
  var guardrails = [];
  for (var g = 0; g < DS_FORBIDDEN.length; g++) if (DS_FORBIDDEN[g][0].test(turn.reply)) guardrails.push(DS_FORBIDDEN[g][1]);
  if (guardrails.length) { var fb = dsFallbackTurn(input); turn.reply = fb.reply; turn.reasoning = (turn.reasoning ? turn.reasoning + ' ' : '') + '[guardrail] reply replaced: ' + guardrails.join(','); }
  var said = String(input.message || '') + '\n' + String(input.history_text || '');
  var cn = turn.map_patch.company_profile.company_name;
  if (!fallbackUsed && cn && said.toLowerCase().indexOf(cn.toLowerCase().replace(/\s+(pte\.?\s*ltd\.?|ltd\.?|llp|inc\.?)$/i, '')) === -1) { turn.map_patch.company_profile.company_name = null; guardrails.push('company_name_not_in_owner_words'); }
  var map = dsMergeMap(input.map, turn.map_patch);
  var ts = dsTopicStatus(map);
  var next = turn.next_topics.length ? turn.next_topics : dsNextTopics(map, 3);
  var turns = parseInt(input.turns, 10) || 0;
  var complete = ts.coverage >= DS_COMPLETE_AT && turns + 1 >= DS_MIN_TURNS && (turn.discovery_complete || fallbackUsed);
  return { turn: turn, map: map, coverage: ts.coverage, topic_status: ts.status, next_topics: next, discovery_complete: complete, provider: fallbackUsed ? 'rules' : 'anthropic', fallback_used: fallbackUsed, fallback_reason: reason, validation_errors: errs, guardrails: guardrails };
}
/** Markdown for the vault note: the Client Digital Company Map. */
function dsRenderMapNote(ctx) {
  ctx = ctx || {};
  var map = dsCoerceMap(ctx.map);
  var ts = dsTopicStatus(map);
  var cp = map.company_profile;
  var title = cp.company_name || ctx.map_id || 'Unknown company';
  var kv = function (label, v) { return '- **' + label + ':** ' + (v === null || v === undefined || (Array.isArray(v) && !v.length) ? '_unknown_' : (Array.isArray(v) ? v.join(', ') : String(v))); };
  var sec = function (h, obj, labels) { var out = ['## ' + h]; for (var i = 0; i < labels.length; i++) out.push(kv(labels[i][1], obj[labels[i][0]])); return out.join('\n'); };
  var fm = ['---', 'type: company-map', 'map_id: ' + (ctx.map_id || ''), 'company: "' + String(title).replace(/"/g, "'") + '"', 'contact: "' + String(ctx.contact_name || '').replace(/"/g, "'") + '"',
    'industry: "' + (cp.industry || '') + '"', 'coverage: ' + ts.coverage, 'status: ' + (ctx.discovery_complete ? 'complete' : 'in_progress'), 'test_mode: ' + (ctx.test_mode ? 'true' : 'false'), 'updated: ' + (ctx.ts || ''), 'tags: [company-map, discovery' + (ctx.test_mode ? ', test' : '') + ']', '---'].join('\n');
  var lines = [
    fm + '\n# ' + title + ' — Client Digital Company Map',
    'Built by the Company Discovery Agent from the owner\'s own words. Everything unknown says _unknown_ — nothing is invented. Coverage: **' + Math.round(ts.coverage * 100) + '%** of the discovery plan (' + ts.covered + '/' + ts.total + ' topics).' + (cp.company_name ? ' Company note: [[Companies/' + cp.company_name.replace(/[\\/:*?"<>|#^\[\]]/g, '-') + '|' + cp.company_name + ']]' : ''), '',
    sec('Company profile', cp, [['company_name', 'Company'], ['brand_name', 'Brand'], ['industry', 'Industry'], ['locations', 'Locations'], ['markets', 'Markets'], ['products', 'Products'], ['services', 'Services'], ['employees', 'Employees'], ['departments', 'Departments'], ['management_structure', 'Management structure']]),
    sec('Customers', map.customers, [['who_buys', 'Who buys'], ['business_model', 'B2B / B2C'], ['typical_customer', 'Typical customer'], ['segments', 'Segments'], ['journey', 'Customer journey'], ['repeat_customers', 'Repeat customers'], ['existing_database', 'Customer list lives in']]),
    sec('Sales process', map.sales_process, [['lead_sources', 'Lead sources'], ['lead_receiver', 'Who receives leads'], ['response_time', 'Response time'], ['follow_up_owner', 'Who follows up'], ['follow_up_count', 'Follow-ups'], ['quotation_process', 'Quotations'], ['deal_tracking', 'Deal tracking'], ['where_leads_lost', 'Where leads are lost'], ['qualified_lead_definition', 'Qualified lead'], ['hot_lead_definition', 'Hot lead']]),
    sec('Marketing', map.marketing, [['channels', 'Channels'], ['agencies', 'Agencies'], ['content_production', 'Content production'], ['lead_forms', 'Lead forms']]),
    '## Communication channels\n' + kv('Channels', map.communication_channels),
    '## Current software\n' + (map.current_software.length ? map.current_software.map(function (s) { return '- **' + s.name + '** (' + s.category.replace(/_/g, ' ') + ')' + (s.notes ? ' — ' + s.notes : ''); }).join('\n') : '- _unknown_'),
    sec('Operations process', map.operations_process, [['work_intake', 'How work comes in'], ['who_performs', 'Who does it'], ['task_assignment', 'Task assignment'], ['deadline_tracking', 'Deadline tracking'], ['approvals', 'Approvals'], ['delays', 'Delays']]),
    sec('Customer service', map.customer_service, [['channels', 'Channels'], ['responder', 'Who responds'], ['common_questions', 'Common questions'], ['complaints', 'Complaints'], ['refund_process', 'Refunds'], ['escalations', 'Escalations']]),
    sec('Finance process', map.finance_process, [['accounting_software', 'Accounting software'], ['invoicing', 'Invoicing'], ['quotations', 'Quotations'], ['payment_collection', 'Payment collection'], ['expenses', 'Expenses'], ['outstanding_followup', 'Outstanding follow-up']]),
    sec('People and roles', map.people_roles, [['departments', 'Departments'], ['roles', 'Roles'], ['approval_hierarchy', 'Approval hierarchy'], ['task_allocation', 'Task allocation'], ['internal_comms', 'Internal comms'], ['onboarding', 'Employee onboarding'], ['sops', 'SOPs']]),
    sec('Management', map.management, [['daily_checks', 'CEO checks daily'], ['reports_received', 'Reports received'], ['hard_to_get_info', 'Hard to get'], ['slow_decisions', 'Slow decisions'], ['surprises', 'Repeated surprises']]),
    sec('Automation signals', map.automation, [['repeated_daily', 'Repeated daily'], ['copy_paste', 'Copy and paste'], ['forgotten', 'Gets forgotten'], ['too_long', 'Takes too long'], ['customers_repeat_ask', 'Customers keep asking'], ['wish_automatic', 'Wish it were automatic']]),
    '## Data sources (discovery checklist)\n' + (map.data_sources.length ? '| Category | Availability | Source | Owner | Format | Volume | Sensitivity | Handling | Import method | Auth |\n|---|---|---|---|---|---|---|---|---|---|\n' + map.data_sources.map(function (d) { return '| ' + [d.category.replace(/_/g, ' '), d.availability, d.source_system || '', d.owner || '', d.format || '', d.approx_volume || '', d.sensitivity || '', d.handling || '', d.import_method || '', d.authorization_required === null ? '' : (d.authorization_required ? 'yes' : 'no')].join(' | ') + ' |'; }).join('\n') : '- _not discussed yet_'),
    '## Pain points\n' + (map.pain_points.length ? map.pain_points.map(function (x) { return '- ' + x; }).join('\n') : '- _unknown_'),
    '## Automation opportunities\n' + (map.automation_opportunities.length ? map.automation_opportunities.map(function (x) { return '- ' + x; }).join('\n') : '- _unknown_'),
    '## Integration requirements\n' + (map.integration_requirements.length ? map.integration_requirements.map(function (x) { return '- ' + x; }).join('\n') : '- _unknown_'),
    '## Security requirements\n' + (map.security_requirements.length ? map.security_requirements.map(function (x) { return '- ' + x; }).join('\n') : '- OAuth where possible, least privilege, every customer isolated, no passwords in chat'),
    '## CEO reporting requirements\n' + (map.ceo_reporting_requirements.length ? map.ceo_reporting_requirements.map(function (x) { return '- ' + x; }).join('\n') : '- _unknown_'),
    '## Proposed CEO Brain\n' + kv('Modules', map.proposed_modules.map(function (m) { return m.replace(/_/g, ' '); })) + '\n' + kv('Agents', map.proposed_agents.map(function (a) { return a.replace(/_/g, ' '); })),
    '## Discovery status\n' + DS_TOPICS.map(function (t) { return '- ' + (ts.status[t] ? '[x]' : '[ ]') + ' ' + t.replace(/_/g, ' '); }).join('\n')
  ];
  if (ctx.proposal_md) lines.push('## Proposal draft (automatic; no pricing — Ryan approves before anything is sent)\n\n' + ctx.proposal_md);
  return lines.join('\n\n') + '\n';
}
var PR_VERSION = 'proposal-draft-1.0.0';
var PR_MODULE_LABELS = { ceo_dashboard: 'CEO Dashboard', sales_brain: 'Sales Brain', marketing_brain: 'Marketing Brain', customer_service_brain: 'Customer Service Brain', operations_brain: 'Operations Brain', project_brain: 'Project Brain', finance_information_brain: 'Finance Information Brain', admin_brain: 'Admin Brain', knowledge_brain: 'Knowledge Brain', reporting_brain: 'Reporting Brain' };
var PR_AGENT_LABELS = { company_discovery: 'Company Discovery Agent', sales: 'Sales Agent (John)', solution_architect: 'Solution Architect Agent', website_architect: 'Website Architect Agent', sme_website_builder: 'SME Website Builder Agent', medical_website_builder: 'Medical / Doctor Website Builder Agent', customer_service: 'Customer Service Agent', email_admin: 'Email / Admin Agent', marketing: 'Marketing Agent', operations: 'Operations Agent', finance_assistant: 'Finance Assistant', ceo_intelligence: 'CEO Intelligence Agent' };
var PR_HANDLING_TEXT = { CONNECTED_LIVE: 'connected live through an authorized integration', IMPORTED: 'imported once (we do the import)', INDEXED: 'indexed so agents can look things up when needed', SUMMARIZED: 'summarized into company knowledge', LEFT_IN_PLACE: 'left where it is (moving it adds nothing)' };
function prList(arr, empty) { return (arr && arr.length) ? arr.map(function (x) { return '- ' + x; }).join('\n') : '- ' + (empty || '_to be confirmed with the customer_'); }
function prUniq(arr) { var o = []; for (var i = 0; i < arr.length; i++) if (o.indexOf(arr[i]) === -1) o.push(arr[i]); return o; }
/** draftProposal(map, opts) -> markdown. opts: { company_name, contact_name, date } */
function draftProposal(map, opts) {
  map = map || {}; opts = opts || {};
  var cp = map.company_profile || {}, cu = map.customers || {}, sp = map.sales_process || {}, fi = map.finance_process || {};
  var name = opts.company_name || cp.company_name || '[Company name to be confirmed]';
  var modules = prUniq((map.proposed_modules || []).slice());
  if (modules.indexOf('ceo_dashboard') === -1) modules.unshift('ceo_dashboard');
  if (modules.indexOf('knowledge_brain') === -1) modules.push('knowledge_brain');
  var agents = prUniq(['company_discovery'].concat(map.proposed_agents || [], ['ceo_intelligence']));
  var software = (map.current_software || []).map(function (s) { return s.name + ' (' + String(s.category).replace(/_/g, ' ') + ')'; });
  var integrations = prUniq((map.integration_requirements || []).concat((map.data_sources || []).filter(function (d) { return d.handling === 'CONNECTED_LIVE'; }).map(function (d) { return (d.source_system || d.category.replace(/_/g, ' ')) + ' — live connection (authorization required)'; })));
  var dataPlan = (map.data_sources || []).map(function (d) { return String(d.category).replace(/_/g, ' ') + ': ' + (PR_HANDLING_TEXT[d.handling] || 'handling to be decided') + (d.source_system ? ' — currently in ' + d.source_system : ''); });
  var problems = prUniq((map.pain_points || []).concat(sp.where_leads_lost ? ['Leads lost: ' + sp.where_leads_lost] : [], (map.management && map.management.hard_to_get_info) || []));
  var automations = prUniq((map.automation_opportunities || []).concat(((map.automation && map.automation.wish_automatic) || []).map(function (w) { return 'Wish: ' + w; })));
  var website = agents.some(function (a) { return /website/.test(a); });
  var medical = agents.indexOf('medical_website_builder') !== -1;
  var phases = [
    'Phase 1 — Discovery sign-off: confirm this Company Map, agree the first high-value workflow, list the integrations to authorize.',
    'Phase 2 — Foundation: customer workspace (isolated tenant), CRM core (companies, contacts, leads, conversations, tasks), data onboarding as planned above.',
    'Phase 3 — First workflow live: ' + (modules.indexOf('sales_brain') !== -1 ? 'lead capture → AI qualification → follow-up → CRM → appointment booking → CEO reporting' : 'the one workflow that removes the biggest pain above') + '; tests, security check, human review, customer UAT.',
    'Phase 4 — Expand: ' + modules.filter(function (m) { return m !== 'ceo_dashboard' && m !== 'sales_brain' && m !== 'knowledge_brain'; }).map(function (m) { return PR_MODULE_LABELS[m]; }).join(', ') + (website ? '; premium website mock-up → QA → review → preview' : '') + '.',
    'Phase 5 — Training, support, optimization.'
  ];
  var lines = [
    '# Proposal draft — ' + name,
    '_Prepared automatically by the CEO Brain from the discovery conversation' + (opts.contact_name ? ' with ' + opts.contact_name : '') + (opts.date ? ' on ' + opts.date : '') + '. Draft for FusionTech review; **not yet sent to the customer; no pricing** (pricing requires human approval)._',
    '## Executive summary',
    name + (cp.industry ? ' (' + cp.industry + ')' : '') + (cp.employees ? ', ' + cp.employees + ' people' : '') + (cu.business_model ? ', ' + cu.business_model : '') + ' wants an AI company operating system that removes repeated manual work, stops leads and follow-ups from being lost, and gives management visibility. Instead of asking the company to reorganise its data first, FusionTech maps where information already lives and connects, imports or organises it as agreed below. The CEO Brain becomes the intelligence layer over the existing systems.',
    '## Current problems', prList(problems),
    '## Current technology', prList(software, '_to be confirmed_'),
    '## Proposed architecture',
    '- One isolated customer workspace (tenant); Company A never sees Company B.\n- CRM / company data layer: companies, contacts, leads, conversations, messages, tasks, appointments, quotations, projects, documents, agent runs, audit logs.\n- Orchestration: n8n workflows; reasoning: Claude models; long-term knowledge: the company knowledge base (Obsidian); live operational data: the CRM/database.\n- Human approval ladder for money, refunds, contracts, final pricing, deletes, permissions and production deployment.',
    '## CEO Brain modules', prList(modules.map(function (m) { return PR_MODULE_LABELS[m] || m; })),
    '## AI agents', prList(agents.map(function (a) { return PR_AGENT_LABELS[a] || a; })),
    '## CRM requirements', prList(prUniq([cu.existing_database ? 'Customer records currently in ' + cu.existing_database : null, (sp.lead_sources || []).length ? 'Lead sources: ' + sp.lead_sources.join(', ') : null, sp.follow_up_owner ? 'Follow-ups today: ' + sp.follow_up_owner : null, 'Pipeline with stages, follow-up tasks and conversation history per contact'].filter(Boolean))),
    '## ERP / operations requirements', prList(prUniq([map.operations_process && map.operations_process.work_intake ? 'Work intake: ' + map.operations_process.work_intake : null, map.operations_process && map.operations_process.delays ? 'Delays: ' + map.operations_process.delays : null, fi.accounting_software ? 'Accounting stays in ' + fi.accounting_software + ' (integration, not replacement)' : null].filter(Boolean)), '_no ERP replacement proposed; integrate the existing tools_'),
    '## Integrations', prList(integrations),
    '## Data onboarding plan (connect, don\'t copy everything)', prList(dataPlan),
    '## Website requirements', website ? prList([medical ? 'Medical / doctor website: doctor profiles, treatments, locations, appointments, patient information, privacy, disclaimers; all medical facts verified by the clinic before publishing' : 'Premium SME website to the FusionTech design standard (no generic AI look); mock-up → QA → review → customer preview', 'Connected to lead capture and WhatsApp']) : '- _not requested in discovery_',
    '## Automations', prList(automations),
    '## Implementation phases', prList(phases),
    '## Customer responsibilities', prList(['Confirm the Company Map and name the owner of each data source', 'Authorize integrations (OAuth) — never share passwords in chat', 'Nominate an approver for pricing, contracts, refunds and publishing', 'Provide brand assets and verify all facts before anything goes live']),
    '## FusionTech responsibilities', prList(['Build, test and deploy the workflows, agents, CRM configuration and interfaces', 'Security check and human review before UAT and production', 'Training and ongoing support; optimization from the CEO Brain\'s own reporting', 'Third-party software/API costs are always separate from FusionTech fees']),
    '## Security considerations', prList(prUniq((map.security_requirements || []).concat(['OAuth where possible; least privilege; secrets only in the secret manager', 'Every customer isolated; important automated actions logged', 'AI never moves money, signs contracts, deletes critical data or deploys to production without approval']))),
    '## Ongoing support requirements', prList(['Monitoring of agent runs and fallbacks', 'Monthly review of the CEO reports and playbook updates', 'Change requests through FusionTech']),
    '## Pricing', '_Requires human approval — prepared by FusionTech separately. No amounts in this draft._'
  ];
  return lines.join('\n\n') + '\n';
}
// ---- n8n glue ----
const ctx = $('Build Discovery Context').first().json;
const pre = $('Compose Discovery Prompt').first().json;
const inp = ($input.first() && $input.first().json) || {};
let rawText = null, error = null, model = pre.config.model;
if (inp.error) error = 'model_error: ' + String(inp.error.message || inp.error.description || JSON.stringify(inp.error)).slice(0, 300);
else {
  model = inp.model || model;
  if (typeof inp.text === 'string' && inp.text.trim()) rawText = inp.text;
  else if (Array.isArray(inp.content)) rawText = inp.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('\n');
  else if (typeof inp.output === 'string') rawText = inp.output;
  if (!rawText) error = 'empty_model_output';
}
const historyText = (pre.conversation || []).map((m) => m.content).join('\n');
const fin = finalizeDiscoveryTurn({ raw_text: rawText, error, input: { map: pre.map, message: ctx.text, turns: pre.turns, history_text: historyText, contact_name: pre.contact_name } });
const now = new Date().toISOString();
const conversation = (pre.conversation || []).concat([{ role: 'owner', content: ctx.text, ts: now }, { role: 'agent', content: fin.turn.reply, ts: now }]).slice(-60);
const companyName = fin.map.company_profile.company_name || pre.company_name || null;
const safe = (t) => String(t || '').replace(/[\\/:*?"<>|#^\[\]]/g, '-').replace(/\s+/g, ' ').trim();
const vaultPath = 'zaphiel/vault/Discovery/' + (ctx.test_mode ? 'Test/' : '') + ctx.map_id + '.md';
const proposalMd = fin.discovery_complete ? draftProposal(fin.map, { company_name: companyName, contact_name: pre.contact_name, date: now.slice(0, 10) }) : '';
const note = dsRenderMapNote({ map: fin.map, map_id: ctx.map_id, contact_name: pre.contact_name, ts: now, test_mode: ctx.test_mode, discovery_complete: fin.discovery_complete, proposal_md: proposalMd });
const status = fin.discovery_complete ? 'complete' : 'in_progress';
const meta = ' · ' + Math.round(fin.coverage * 100) + '% mapped' + (fin.next_topics.length ? ' · next: ' + fin.next_topics.slice(0, 2).join(', ') : '') + ' · ' + fin.provider + (fin.fallback_used ? ' fallback' : '') + (fin.discovery_complete ? ' · Company Map + proposal draft written to the vault' : '');
return [{ json: {
  map_id: ctx.map_id, session_id: ctx.session_id, tenant_id: ctx.tenant_id, test_mode: ctx.test_mode,
  company_name: companyName, contact_name: pre.contact_name, status, coverage: fin.coverage, turns: pre.turns + 1,
  map_json: JSON.stringify(fin.map), conversation_json: JSON.stringify(conversation), proposal_md: proposalMd,
  vault_path: vaultPath, note, commit: 'vault: company map ' + (companyName || ctx.map_id) + (fin.discovery_complete ? ' (complete + proposal draft)' : ' (' + Math.round(fin.coverage * 100) + '%)'),
  provider: fin.provider, model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason, guardrails: fin.guardrails, brain_source: pre.brain_source,
  row_exists: pre.row_exists, created_at: pre.created_at, updated_at: now, discovery_complete: fin.discovery_complete,
  reply: fin.turn.reply, output: fin.turn.reply + '\n\n— discovery' + meta,
  task: fin.discovery_complete ? { task_id: 'task_proposal_' + ctx.map_id.replace(/[^a-z0-9_]/gi, '').slice(0, 60), title: 'REVIEW: proposal draft for ' + (companyName || ctx.map_id), description: 'Discovery complete (' + Math.round(fin.coverage * 100) + '%). Company Map + proposal draft (no pricing) in ' + vaultPath + '. Review, price and approve before anything is sent.' } : null,
  run_id: 'run_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36), started_at: ctx.started_at, finished_at: now, latency_ms: Math.max(0, new Date(now).getTime() - new Date(ctx.started_at).getTime())
} }];
