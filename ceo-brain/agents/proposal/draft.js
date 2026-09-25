// Proposal Agent (draft half) — pure function, ES5. Turns a Client Digital Company Map into a proposal
// DRAFT in markdown with the sections FusionTech uses. Never invents facts, never prices anything:
// pricing requires human approval. Inlined into the Discovery Console by workflows/discovery-console/build.js.
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

module.exports = { PR_VERSION, draftProposal };
