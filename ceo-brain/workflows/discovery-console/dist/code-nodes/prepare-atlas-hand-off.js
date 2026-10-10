var DS_SCHEMA_VERSION = '1.0';
var DS_MODULES = ['ceo_dashboard', 'sales_brain', 'marketing_brain', 'customer_service_brain', 'operations_brain', 'project_brain', 'finance_information_brain', 'admin_brain', 'knowledge_brain', 'reporting_brain'];
var DS_AGENTS = ['company_discovery', 'sales', 'solution_architect', 'website_architect', 'sme_website_builder', 'medical_website_builder', 'customer_service', 'email_admin', 'marketing', 'operations', 'finance_assistant', 'ceo_intelligence'];
var DS_CHANNELS = ['whatsapp', 'whatsapp_business', 'email', 'phone', 'sms', 'website_chat', 'social_dm', 'telegram', 'other'];
var DS_MKT = ['facebook', 'instagram', 'tiktok', 'google', 'youtube', 'website', 'seo', 'email_marketing', 'linkedin', 'referrals', 'events', 'other'];
var DS_SW_CATS = ['crm', 'erp', 'accounting', 'pos', 'booking', 'spreadsheets', 'google_workspace', 'microsoft_365', 'cloud_storage', 'industry_specific', 'internal_app', 'messaging', 'ecommerce', 'other'];
var DS_DATA_CATS = ['customer_records', 'lead_records', 'sales_records', 'product_service_info', 'pricing', 'faqs', 'sops', 'documents', 'templates', 'policies', 'past_quotations', 'contracts', 'marketing_materials', 'website_content', 'email', 'calendars', 'project_info', 'operational_spreadsheets', 'accounting_platform', 'support_info', 'employee_roles'];
var DS_AVAIL = ['AVAILABLE', 'NOT_AVAILABLE', 'UNKNOWN', 'CONNECTION_REQUIRED', 'IMPORT_REQUIRED', 'NOT_REQUIRED'];
var DS_HANDLING = ['CONNECTED_LIVE', 'IMPORTED', 'INDEXED', 'SUMMARIZED', 'LEFT_IN_PLACE'];
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
function dsAtlasHandoff(map, conversation, ctx) {
  map = dsCoerceMap(map); ctx = ctx || {};
  var cp = map.company_profile, fi = map.finance_process, sp = map.sales_process;
  var company = cp.company_name || cp.brand_name;
  if (!company) return null;
  var owner = (Array.isArray(conversation) ? conversation : []).filter(function (m) { return m && m.role !== 'agent'; });
  var sw = map.current_software.map(function (x) { return x.name; });
  var acc = map.current_software.filter(function (x) { return x.category === 'accounting' || x.category === 'erp'; }).map(function (x) { return x.name; });
  if (fi.accounting_software && acc.indexOf(fi.accounting_software) === -1) acc.push(fi.accounting_software);
  var wants = map.automation.wish_automatic.concat(map.automation_opportunities).slice(0, 15);
  var facts = [
    'Company: ' + company + (cp.industry ? ' (' + cp.industry + ')' : ''),
    cp.employees ? 'Team: ' + cp.employees + ' people' + (map.people_roles.roles.length ? ' (' + map.people_roles.roles.join(', ') + ')' : '') : '',
    sw.length ? 'Software today: ' + sw.join(', ') : '',
    map.communication_channels.length ? 'Customers reach them on: ' + map.communication_channels.join(', ') : '',
    sp.lead_sources.length ? 'Leads come from: ' + sp.lead_sources.join(', ') : '',
    sp.quotation_process ? 'Quotations: ' + sp.quotation_process : '',
    map.operations_process.work_intake ? 'How work comes in: ' + map.operations_process.work_intake : '',
    map.pain_points.length ? 'Problems: ' + map.pain_points.join('; ') : '',
    wants.length ? 'They want automated: ' + wants.join('; ') : '',
    cp.services.length ? 'Services: ' + cp.services.join(', ') : ''
  ].filter(Boolean).join('\n');
  var extracted = {
    company_name: company, industry: cp.industry, company_size: cp.employees, current_tools: sw, accounting_or_erp: acc, lead_sources: sp.lead_sources,
    problem: map.pain_points.join('; ') || null, current_follow_up_process: [sp.follow_up_owner, sp.follow_up_count].filter(Boolean).join(', ') || null,
    desired_automation: wants, uses_whatsapp: map.communication_channels.some(function (c) { return /^whatsapp/.test(c); }) ? true : null
  };
  return {
    tenant_id: ctx.tenant_id || 'fusiontech', lead_id: 'disc_' + String(ctx.map_id || '').replace(/[^a-z0-9_]/gi, '').slice(0, 60), contact_name: ctx.contact_name || '',
    company_name: company, industry: cp.industry || '', email: '', phone: '', channel: 'console',
    message: facts.slice(0, 4000),
    conversation_json: JSON.stringify(owner.slice(-30).map(function (m) { return { role: 'customer', content: String(m.content || '').slice(0, 2000) }; })),
    sales_summary: 'From the Discovery Console (Company Map ' + (ctx.map_id || '') + ', ' + Math.round((ctx.coverage || 0) * 100) + '% mapped).',
    extracted_json: JSON.stringify(extracted), test_mode: !!ctx.test_mode, notify_email: ctx.notify_email || '', source_execution_id: String(ctx.execution_id || '')
  };
}
// ---- n8n glue: the finished Company Map → ATLAS's hand-off (null without a company name) ----
const f = $('Finalize Discovery Turn').first().json;
let map = {}, conversation = [];
try { map = JSON.parse(f.map_json || '{}'); } catch (e) { map = {}; }
try { conversation = JSON.parse(f.conversation_json || '[]'); } catch (e) { conversation = []; }
const handoff = f.discovery_complete ? dsAtlasHandoff(map, conversation, { tenant_id: f.tenant_id, map_id: f.map_id, contact_name: f.contact_name, coverage: f.coverage, test_mode: f.test_mode, notify_email: "ryandhana1515@gmail.com", execution_id: $execution.id }) : null;
return [{ json: { ready: !!handoff, handoff } }];
