#!/usr/bin/env node
// Phase 1 test suite. Runs with plain Node (no dependencies):
//   node tests/run-tests.js
// 1. Unit tests for normalize / rules / postprocess.
// 2. Simulation of the four n8n Code nodes (dist/code-nodes) with stubbed n8n
//    globals, chained exactly like the workflow, in mock mode and in a
//    simulated live-AI mode (using a fenced-JSON model reply fixture).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const fx = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8'));
const { normalizeLead } = require('../agents/sales-qualification/normalize.js');
const { classifyWithRules } = require('../agents/sales-qualification/rules.js');
const { finalizeResult, ppValidate } = require('../agents/sales-qualification/postprocess.js');
const outputSchema = require('../schemas/sales-qualification-output.schema.json');
const statusSpec = require('../schemas/lead-status.json');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}
const validOutput = (r) => { const errs = ppValidate(outputSchema, r); assert.deepStrictEqual(errs, [], 'schema errors: ' + errs.join('; ')); };

console.log('\n[1] normalize');
test('john tan normalizes phone/email/source and dedupes', () => {
  const n = normalizeLead(fx('john-tan.json'), { nowMs: 1 });
  assert.ok(n.ok);
  assert.strictEqual(n.lead.phone, '+6591234567');
  assert.strictEqual(n.lead.email, 'john.tan@abcproperty.sg');
  assert.strictEqual(n.lead.lead_source, 'facebook');
  assert.strictEqual(n.lead.channel, 'whatsapp');
  assert.strictEqual(n.lead.test_mode, true);
  assert.strictEqual(n.lead.ai_mode, 'mock');
  const again = normalizeLead(fx('john-tan.json'), { nowMs: 2 });
  assert.strictEqual(n.lead.lead_key, again.lead.lead_key, 'same contact must produce same lead_key');
});
test('empty payload is rejected with errors', () => {
  const n = normalizeLead(fx('invalid-empty.json'));
  assert.strictEqual(n.ok, false);
  assert.ok(n.errors.includes('message_required'));
  assert.ok(n.errors.includes('contact_point_or_name_required'));
});
test('garbage input does not throw', () => {
  assert.strictEqual(normalizeLead(null).ok, false);
  assert.strictEqual(normalizeLead('x').ok, false);
  const junk = normalizeLead({ message: 'hi', email: 'not-an-email', phone: '12' });
  assert.strictEqual(junk.ok, false, 'no valid contact and no name must be rejected');
  assert.ok(junk.warnings.some((w) => w.startsWith('email_invalid_ignored')));
  assert.strictEqual(normalizeLead({ message: 'hi', name: 'Anon', email: 'not-an-email' }).ok, true);
});
test('tenant id is slugified and defaulted', () => {
  assert.strictEqual(normalizeLead({ message: 'hi', name: 'a', tenant_id: 'Acme Corp!' }).lead.tenant_id, 'acme_corp');
  assert.strictEqual(normalizeLead({ message: 'hi', name: 'a' }, { defaultTenant: 'tenant_x' }).lead.tenant_id, 'tenant_x');
});

console.log('\n[2] rules engine');
test('john tan -> HOT real-estate lead, no fabricated budget/timeline', () => {
  const r = classifyWithRules(normalizeLead(fx('john-tan.json')).lead);
  validOutput(r);
  assert.strictEqual(r.lead_status, 'HOT');
  assert.strictEqual(r.intent, 'ai_automation_enquiry');
  assert.strictEqual(r.extracted.company_size, 25);
  assert.strictEqual(r.extracted.industry, 'real_estate');
  assert.strictEqual(r.extracted.budget, null);
  assert.strictEqual(r.extracted.timeline, null);
  assert.ok(r.missing_information.includes('budget') && r.missing_information.includes('timeline'));
  assert.ok(r.extracted.desired_automation.includes('whatsapp_auto_reply'));
  assert.ok(r.questions_to_ask.length <= 3 && r.questions_to_ask.length > 0);
  assert.strictEqual(r.human_review_required, false);
});
test('refund + lawyer -> HUMAN_REVIEW', () => {
  const r = classifyWithRules(normalizeLead(fx('risky-refund.json')).lead);
  validOutput(r);
  assert.strictEqual(r.lead_status, 'HUMAN_REVIEW');
  assert.strictEqual(r.human_review_required, true);
});
test('spam -> cold, close_lost, empty reply, human confirms', () => {
  const r = classifyWithRules(normalizeLead(fx('spam.json')).lead);
  validOutput(r);
  assert.strictEqual(r.intent, 'spam');
  assert.strictEqual(r.lead_temperature, 'cold');
  assert.strictEqual(r.next_action, 'close_lost');
  assert.strictEqual(r.recommended_reply, '');
});
test('pricing + proposal with full info -> PROPOSAL_REQUIRED needing approval', () => {
  const r = classifyWithRules(normalizeLead(fx('pricing-ready.json')).lead);
  validOutput(r);
  assert.strictEqual(r.lead_status, 'PROPOSAL_REQUIRED');
  assert.strictEqual(r.next_action, 'request_proposal_approval');
  assert.strictEqual(r.human_review_required, true);
  assert.strictEqual(r.extracted.company_size, 12);
  assert.strictEqual(r.extracted.decision_maker, true);
});

console.log('\n[3] postprocess (validation + guardrails)');
const lead = normalizeLead(fx('john-tan.json')).lead;
const rules = classifyWithRules(lead);
const NOW = '2026-09-24T20:00:00.000Z';
test('fenced model JSON is parsed and accepted', () => {
  const raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'ai-raw-fenced.txt'), 'utf8');
  const f = finalizeResult({ lead, previous_status: 'NEW', now: NOW, provider: 'anthropic', model: 'm', raw_text: raw, rules_result: rules });
  assert.strictEqual(f.fallback_used, false);
  assert.strictEqual(f.result.lead_status, 'HOT');
  assert.strictEqual(f.result.follow_up_at, '2026-09-25T00:00:00.000Z', 'HOT follow-up = +4h');
  assert.deepStrictEqual(f.status_change, { from: 'NEW', to: 'HOT', changed: true });
  validOutput(f.result);
});
test('invalid JSON falls back to rules', () => {
  const f = finalizeResult({ lead, previous_status: 'NEW', now: NOW, provider: 'anthropic', model: 'm', raw_text: 'Sorry, I cannot', rules_result: rules });
  assert.strictEqual(f.fallback_used, true);
  assert.strictEqual(f.provider, 'rules');
  assert.ok(f.audit.some((a) => a.startsWith('fallback_to_rules:invalid_json')));
});
test('schema-invalid model output falls back to rules with errors recorded', () => {
  const bad = Object.assign({}, rules, { lead_status: 'BANANA', extracted: Object.assign({}, rules.extracted, { company_size: 'lots' }) });
  const f = finalizeResult({ lead, previous_status: 'NEW', now: NOW, provider: 'anthropic', model: 'm', raw_text: JSON.stringify(bad), rules_result: rules });
  assert.strictEqual(f.fallback_used, true);
  assert.ok(f.validation_errors.some((e) => e.includes('lead_status')));
});
test('AI cannot mark WON; converted to HUMAN_REVIEW', () => {
  const won = Object.assign({}, rules, { lead_status: 'WON' });
  const f = finalizeResult({ lead, previous_status: 'QUALIFIED', now: NOW, provider: 'anthropic', model: 'm', result: won, rules_result: rules });
  assert.strictEqual(f.result.lead_status, 'HUMAN_REVIEW');
  assert.ok(f.result.escalation_reasons.includes('ai_attempted_won_status'));
});
test('reply with a price/guarantee is withheld and escalated', () => {
  const risky = Object.assign({}, rules, { recommended_reply: 'Sure, it costs S$2,500 and results are guaranteed.' });
  const f = finalizeResult({ lead, previous_status: 'NEW', now: NOW, provider: 'anthropic', model: 'm', result: risky, rules_result: rules });
  assert.strictEqual(f.result.recommended_reply, '');
  assert.strictEqual(f.result.human_review_required, true);
  assert.ok(f.result.escalation_reasons.includes('reply_contains_price'));
  assert.ok(f.result.escalation_reasons.includes('reply_contains_guarantee'));
  assert.ok(f.audit.includes('reply_withheld_by_guardrail'));
});
test('customer asking for a contract escalates even if the model missed it', () => {
  const l2 = normalizeLead({ name: 'A', email: 'a@b.co', message: 'Can you send the contract so we can sign today?' }).lead;
  const r2 = classifyWithRules(l2);
  const clean = Object.assign({}, r2, { human_review_required: false, escalation_reasons: [], lead_status: 'QUALIFYING', next_action: 'send_reply' });
  const f = finalizeResult({ lead: l2, previous_status: 'NEW', now: NOW, provider: 'anthropic', model: 'm', result: clean, rules_result: r2 });
  assert.strictEqual(f.result.human_review_required, true);
  assert.ok(f.result.escalation_reasons.includes('customer_mentions_contract'));
});
test('illegal transition (WON -> QUALIFYING) is rejected and audited', () => {
  const f = finalizeResult({ lead, previous_status: 'WON', now: NOW, provider: 'rules', model: 'rules-v1', result: Object.assign({}, rules, { lead_status: 'QUALIFYING' }), rules_result: rules });
  assert.strictEqual(f.result.lead_status, 'WON');
  assert.ok(f.audit.some((a) => a.startsWith('transition_rejected')));
});
test('status spec is internally consistent', () => {
  for (const s of statusSpec.statuses) assert.ok(statusSpec.transitions[s], 'missing transitions for ' + s);
  for (const s of statusSpec.human_only) assert.ok(!statusSpec.ai_may_set.includes(s));
});

console.log('\n[4] n8n Code node simulation (dist/code-nodes)');
const distDir = path.join(ROOT, 'workflows', 'lead-intake', 'dist', 'code-nodes');
if (!fs.existsSync(path.join(distDir, 'finalize-and-validate-result.js'))) require('child_process').execSync('node ' + path.join(ROOT, 'workflows', 'lead-intake', 'build.js'), { stdio: 'inherit' });
const codeOf = (f) => fs.readFileSync(fs.existsSync(path.join(distDir, f)) ? path.join(distDir, f) : path.join(ROOT, f), 'utf8');

function runCodeNode(file, inputItems, nodeOutputs) {
  const $input = { first: () => inputItems[0], all: () => inputItems };
  const $ = (name) => { if (!nodeOutputs[name]) throw new Error('simulation: node "' + name + '" has no output'); return { first: () => ({ json: nodeOutputs[name] }), item: { json: nodeOutputs[name] } }; };
  const ctx = { $input, $, $execution: { id: 'sim-exec' }, $workflow: { id: 'sim-wf' }, JSON, Math, Date, Number, String, Array, Object, parseInt, parseFloat, isNaN, RegExp, console, Buffer };
  const fn = vm.runInNewContext('(function(){\n' + codeOf(file) + '\n})', ctx);
  return fn();
}

function simulate(payload, opts) {
  opts = opts || {};
  const outputs = { 'Workflow Config': { model: 'claude-sonnet-4-6', notify_email: 'owner@example.com', default_tenant: 'biogreen', default_ai_mode: 'live', agent: 'sales-qualification', agent_version: '1.0.0' } };
  const norm = runCodeNode('validate-and-normalize-lead.js', [{ json: { body: payload, headers: {} } }], outputs)[0].json;
  if (!norm.ok) return { norm };
  outputs['Validate & Normalize Lead'] = norm;
  const existing = opts.existing || {};
  const resolved = runCodeNode('resolve-lead-identity.js', [{ json: existing }], outputs)[0].json;
  outputs['Resolve Lead Identity'] = resolved;
  const rulesOut = runCodeNode('rule-based-qualification.js', [{ json: { id: 1 } }], outputs)[0].json;
  outputs['Rule-Based Qualification (baseline / fallback)'] = rulesOut;
  let aiOut;
  if (resolved.lead.ai_mode === 'live' && opts.modelText !== undefined) aiOut = { text: opts.modelText, model: 'claude-sonnet-4-6', usage: { input_tokens: 10, output_tokens: 5 } };
  else if (resolved.lead.ai_mode === 'live' && opts.modelError) aiOut = { error: { message: opts.modelError } };
  else aiOut = rulesOut;
  const fin = runCodeNode('finalize-and-validate-result.js', [{ json: aiOut }], outputs)[0].json;
  return { norm, resolved, aiOut, fin };
}

const outputs = { 'Workflow Config': { model: 'claude-sonnet-4-6' } };
let mockRun;
test('mock mode: John Tan end-to-end through the real node code', () => {
  mockRun = simulate(fx('john-tan.json'));
  assert.ok(mockRun.fin.response.ok);
  assert.strictEqual(mockRun.fin.provider, 'rules');
  assert.strictEqual(mockRun.fin.result.lead_status, 'HOT');
  assert.strictEqual(mockRun.fin.task.task_type, 'call');
  assert.strictEqual(mockRun.fin.approval_needed, false);
  assert.ok(mockRun.resolved.user_prompt.includes('ABC Property Pte Ltd'));
  validOutput(mockRun.fin.result);
});
test('live mode with a fenced model reply is accepted', () => {
  const p = Object.assign({}, fx('john-tan.json'), { ai_mode: 'live' });
  const run = simulate(p, { modelText: fs.readFileSync(path.join(__dirname, 'fixtures', 'ai-raw-fenced.txt'), 'utf8') });
  assert.strictEqual(run.fin.provider, 'anthropic');
  assert.strictEqual(run.fin.fallback_used, false);
  assert.strictEqual(run.fin.result.lead_status, 'HOT');
});
test('live mode model error falls back to rules with the error recorded', () => {
  const p = Object.assign({}, fx('john-tan.json'), { ai_mode: 'live' });
  const run = simulate(p, { modelError: 'Payment required' });
  assert.strictEqual(run.fin.provider, 'rules');
  assert.ok(String(run.fin.fallback_reason).includes('Payment required'));
});
test('returning lead keeps its lead_id and previous status', () => {
  const run = simulate(fx('john-tan.json'), { existing: { id: 7, lead_key: 'x', lead_id: 'lead_existing', status: 'QUALIFIED', email: 'kept@example.com' } });
  assert.strictEqual(run.resolved.lead.lead_id, 'lead_existing');
  assert.strictEqual(run.resolved.previous_status, 'QUALIFIED');
  assert.strictEqual(run.fin.status_change.from, 'QUALIFIED');
});
test('invalid payload stops at validation', () => {
  const run = simulate(fx('invalid-empty.json'));
  assert.strictEqual(run.norm.ok, false);
});
test('refund lead produces an approval task and email trigger', () => {
  const run = simulate(fx('risky-refund.json'));
  assert.strictEqual(run.fin.approval_needed, true);
  assert.strictEqual(run.fin.task.requires_approval, true);
  assert.strictEqual(run.fin.task.task_type, 'approval');
});

test('logistics website lead is handed off to the Website Builder', () => {
  const run = simulate(fx('logistics-website.json'));
  assert.strictEqual(run.fin.website_requested, true);
  assert.strictEqual(JSON.stringify(run.fin.handoffs), '["website-builder"]');
  assert.strictEqual(JSON.stringify(run.fin.response.handoffs), '["website-builder"]');
  assert.ok(run.fin.result.extracted.desired_automation.includes('website_build'), 'rules must tag website_build');
  assert.strictEqual(run.fin.result.extracted.industry, 'logistics');
  assert.strictEqual(run.fin.result.intent !== 'spam', true);
});
test('john tan (no website ask) is not handed to the website chain, but ATLAS wakes (follow-up problem + WhatsApp automation)', () => {
  assert.strictEqual(mockRun.fin.website_requested, false);
  assert.strictEqual(mockRun.fin.edg_requested, true);
  assert.strictEqual(JSON.stringify(mockRun.fin.handoffs), '["atlas"]');
});
test('a returning lead is only handed off when the current message asks for a site', () => {
  const p = Object.assign({}, fx('john-tan.json'), { message: 'Yes we use WhatsApp and Google Sheets', conversation_history: [{ role: 'customer', content: 'we might want a website later' }] });
  const run = simulate(p, { existing: { id: 7, lead_key: 'x', lead_id: 'lead_existing', status: 'QUALIFYING' } });
  assert.strictEqual(run.fin.website_requested, false);
});

test('greeting: John introduces FusionTech, no escalation', () => {
  const run = simulate({ name: 'Visitor', channel: 'web_chat', source: 'website', message: 'hi', test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 's1' } });
  assert.ok(/John from FusionTech AI/.test(run.fin.result.recommended_reply));
  assert.strictEqual(run.fin.result.human_review_required, false);
  assert.strictEqual(run.fin.website_requested, false);
});
test('"what do you do?" gets the FusionTech answer', () => {
  const run = simulate({ name: 'Visitor', channel: 'web_chat', source: 'website', message: 'What do you guys do?', test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 's2' } });
  assert.ok(/AI workforce/.test(run.fin.result.recommended_reply) && /websites/.test(run.fin.result.recommended_reply));
  assert.strictEqual(run.fin.result.human_review_required, false);
});
test('website intake: mock-up ask → John asks for the details, no hand-off yet', () => {
  const run = simulate({ name: 'Daniel', channel: 'web_chat', source: 'website', message: 'Can you give me a mock-up of a website you can build for me?', test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 's3' } });
  assert.strictEqual(run.fin.website_intake.topic, true);
  assert.strictEqual(run.fin.website_intake.ready, false);
  assert.strictEqual(run.fin.website_requested, false);
  assert.ok(/first mock-up built for you/.test(run.fin.result.recommended_reply) && /name of your business/.test(run.fin.result.recommended_reply));
});
test('website intake: details given in later turns → hand-off fires once, contact saved', () => {
  const history = [
    { role: 'customer', content: 'Can you give me a mock-up of a website?' },
    { role: 'agent', content: 'Hi Daniel, happy to get a first mock-up built for you. A few quick details: What is the name of your business? What does the business do? What should visitors be able to do?' }
  ];
  const run = simulate({ name: 'Daniel', channel: 'web_chat', source: 'website', message: 'We are Prestige Motors, a BMW dealership in Singapore. Customers should be able to book a test drive and WhatsApp us. Send it to daniel@prestige.sg', conversation_history: history, test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 's4' } });
  assert.strictEqual(run.fin.website_intake.ready, true);
  assert.strictEqual(run.fin.website_requested, true);
  assert.strictEqual(JSON.stringify(run.fin.handoffs), '["website-builder"]');
  assert.strictEqual(run.fin.contact_found.email, 'daniel@prestige.sg');
  assert.ok(/building your first mock-up/.test(run.fin.result.recommended_reply) && /two versions/.test(run.fin.result.recommended_reply) && /premium option/.test(run.fin.result.recommended_reply));
  const history2 = history.concat([{ role: 'customer', content: 'We are Prestige Motors…' }, { role: 'agent', content: run.fin.result.recommended_reply }]);
  const again = simulate({ name: 'Daniel', channel: 'web_chat', source: 'website', message: 'Great, thanks!', conversation_history: history2, test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 's4' } });
  assert.strictEqual(again.fin.website_requested, false, 'no second build for the same lead');
  assert.strictEqual(again.fin.website_intake.build_started, true);
});
test('compose system prompt: vault notes are injected live, fallback when unreadable', () => {
  const b64 = (t) => Buffer.from(t, 'utf8').toString('base64');
  const withVault = runCodeNode('compose-system-prompt.js', [{ json: {} }], Object.assign({}, outputs, {
    'Load Brain from Vault': { content: b64('---\ntitle: x\n---\n# FUSIONTECH BRAIN\nWe build AI workforces.'), encoding: 'base64' },
    'Load Sales Playbook': { content: b64('---\ntags: [x]\n---\n# Playbook\nAlways ask about WhatsApp.'), encoding: 'base64' }
  }))[0].json;
  assert.strictEqual(withVault.brain_source, 'vault:brain+playbook');
  assert.ok(withVault.system_prompt.includes('We build AI workforces.'));
  assert.ok(withVault.system_prompt.includes('Always ask about WhatsApp.'));
  assert.ok(!withVault.system_prompt.includes('title: x'), 'frontmatter must be stripped');
  assert.ok(withVault.system_prompt.includes('Return ONLY the JSON object'), 'static rules must follow the vault text');
  const noVault = runCodeNode('compose-system-prompt.js', [{ json: {} }], Object.assign({}, outputs, { 'Load Brain from Vault': { error: 'Not Found' }, 'Load Sales Playbook': { error: 'Not Found' } }))[0].json;
  assert.strictEqual(noVault.brain_source, 'compiled_fallback');
  assert.ok(noVault.system_prompt.includes('You are John'));
});

console.log('\n[5] website builder agent (agents/website-builder/brief.js)');
const wb = require('../agents/website-builder/brief.js');
const briefSchema = require('../schemas/website-brief.schema.json');
const wbInput = (fixture) => ({ company_name: fixture.company || null, industry: fixture.industry || null, contact_name: fixture.name, message: fixture.message, conversation: [], sales_summary: '', extracted: {} });
test('fallback brief for the logistics lead validates against the schema', () => {
  const r = wb.finalizeBrief({ error: 'model_error: simulated', input: wbInput(fx('logistics-website.json')) });
  assert.strictEqual(r.fallback_used, true);
  assert.deepStrictEqual(ppValidate(briefSchema, r.brief), []);
  assert.strictEqual(r.brief.business_name, 'SwiftMove Logistics Pte Ltd');
  assert.strictEqual(r.brief.primary_goal, 'leads');
  assert.ok(r.brief.integrations.includes('WhatsApp click-to-chat'));
  assert.ok(r.brief.pages.length >= 3);
  assert.ok(r.build_prompt.length > 200 && r.build_prompt.length <= 5200);
  assert.strictEqual(r.brief.mode, 'sme');
  assert.strictEqual(r.brief.industry_category, 'logistics');
  assert.ok(r.build_prompt.includes('Never use:') && /navy-to-purple SaaS gradient/.test(r.build_prompt) && /Photo-led/.test(r.build_prompt), 'anti-generic + cinematic rules must be in the prompt');
  assert.ok(r.build_prompt.includes('Typography:'), 'design direction must be in the prompt');
  assert.ok(r.brief.qa_checklist.length >= 15 && r.brief.verification_required.length === 0);
  assert.ok(r.lovable_url.startsWith('https://lovable.dev/#prompt='));
  assert.ok(!/\$\s?\d|guarantee/i.test(r.build_prompt), 'no prices or guarantees in the build prompt');
});
test('valid model brief is accepted and a fabricated business name is stripped', () => {
  const good = { schema_version: '2.0', mode: 'sme', industry_category: 'logistics', site_type: 'web_app', business_name: 'SwiftMove Logistics', industry: 'logistics', audience: 'SME shippers', primary_goal: 'leads', design_direction: { brand_personality: 'reliable, fast', typography: 'Archivo + Inter', layout: 'action-first', imagery: 'fleet', motion: 'minimal', palette: 'white + signal orange' }, pages: [{ name: 'Home', purpose: 'x' }, { name: 'Track', purpose: 'y' }], features: ['Quote form'], integrations: ['WhatsApp click-to-chat'], style: { tone: 'clean', colours: null, references: [] }, existing_assets: { domain: null, logo: null, brand_colours: null, content: null }, content_notes: null, questions_for_customer: ['Do you have a domain?'], missing_information: ['existing_domain'], build_prompt: 'Build a web app…', confidence: 0.8, reasoning: 'ok' };
  const r = wb.finalizeBrief({ raw_text: '```json\n' + JSON.stringify(good) + '\n```', input: wbInput(fx('logistics-website.json')) });
  assert.strictEqual(r.fallback_used, false);
  assert.strictEqual(r.brief.business_name, 'SwiftMove Logistics');
  assert.deepStrictEqual(ppValidate(briefSchema, r.brief), []);
  assert.strictEqual(r.brief.design_direction.typography, 'Archivo + Inter', 'model design direction is kept');
  assert.ok(r.build_prompt.includes('Never use:'), 'a thin model prompt is regenerated with the anti-generic rules');
  const fake = Object.assign({}, good, { business_name: 'Acme Freight Kings' });
  const r2 = wb.finalizeBrief({ raw_text: JSON.stringify(fake), input: Object.assign(wbInput(fx('logistics-website.json')), { company_name: null }) });
  assert.strictEqual(r2.brief.business_name, null, 'name the customer never said must be removed');
  assert.ok(r2.brief.missing_information.includes('business_name'));
  assert.ok(r2.brief.build_prompt.includes('[PLACEHOLDER: business name]'));
});
test('invalid model output falls back with the reason recorded', () => {
  const r = wb.finalizeBrief({ raw_text: '{"site_type":"spaceship"}', input: wbInput(fx('logistics-website.json')) });
  assert.strictEqual(r.fallback_used, true);
  assert.ok(String(r.fallback_reason).startsWith('schema_invalid'));
  assert.deepStrictEqual(ppValidate(briefSchema, r.brief), []);
});
test('BMW dealership: business name from "I\'m Daniel from Prestige Motors", automotive direction', () => {
  const input = { company_name: null, industry: null, contact_name: 'Daniel', message: "Hi John, I'm Daniel from Prestige Motors, we are a BMW dealership in Singapore with 12 sales staff. I want a premium website where customers can browse our BMW models, book a test drive, and WhatsApp us.", conversation: [], sales_summary: '', extracted: {} };
  const r = wb.finalizeBrief({ error: 'model_error: simulated', input });
  assert.strictEqual(r.brief.business_name, 'Prestige Motors');
  assert.strictEqual(r.brief.industry_category, 'automotive');
  assert.strictEqual(r.brief.mode, 'sme');
  assert.strictEqual(r.brief.primary_goal, 'bookings');
  assert.ok(/Prestige Motors/.test(r.build_prompt) && /film-like/.test(r.build_prompt));
  assert.strictEqual(r.ready_to_build, true);
  assert.strictEqual(r.image_shots.length, 3);
  assert.ok(/BMW/.test(r.image_shots[0].prompt) && /no text, no logos/.test(r.image_shots[0].prompt));
  assert.strictEqual(r.variations.length, 2); assert.strictEqual(r.variations[0].tier, 'premium'); assert.strictEqual(r.variations[1].tool, 'lovable');
  assert.strictEqual(r.film_brief.scenes.length, 3); assert.ok(!/\$|price/i.test(JSON.stringify(r.variations)));
  assert.deepStrictEqual(ppValidate(briefSchema, r.brief), []);
});
test('dental clinic → medical mode: doctor/treatment pages, verification list, medical QA, no fabricated claims', () => {
  const input = { company_name: null, industry: null, contact_name: 'Dr Tan', message: 'We are a dental clinic in Bishan with 3 dentists. Patients keep calling to book; we want a website where they can book appointments and read about our treatments.', conversation: [], sales_summary: '', extracted: {} };
  const r = wb.finalizeBrief({ error: 'model_error: simulated', input });
  assert.strictEqual(r.brief.mode, 'medical');
  assert.strictEqual(r.brief.industry_category, 'healthcare');
  assert.strictEqual(r.brief.primary_goal, 'bookings');
  assert.deepStrictEqual(ppValidate(briefSchema, r.brief), []);
  const names = r.brief.pages.map((p) => p.name).join('|');
  assert.ok(/Our Doctors/.test(names) && /Treatments/.test(names) && /Book an Appointment/.test(names) && /Patient Information/.test(names));
  assert.ok(r.brief.verification_required.length >= 5);
  assert.ok(r.brief.qa_checklist.some((q) => /Medical content verification/.test(q)));
  assert.ok(r.brief.missing_information.includes('doctor_profiles') && r.brief.missing_information.includes('credentials'));
  assert.ok(/VERIFY WITH CLINIC/.test(r.build_prompt) && /medical disclaimer/.test(r.build_prompt) && /privacy notice/.test(r.build_prompt));
  assert.ok(!/guarantee|\$\s?\d/i.test(r.build_prompt), 'no prices or guarantees');
  assert.ok(/Never fabricate[^.]*success rates/.test(r.build_prompt), 'the only mention of success rates is the prohibition');
  assert.strictEqual(r.brief.design_direction.brand_personality, wb.WB_DESIGN.healthcare.personality);
});
test('model answering sme for a clinic is forced into medical mode by code', () => {
  const said = { company_name: null, industry: null, contact_name: 'Dr Lim', message: 'Our aesthetic clinic wants a new website for patients to book consultations', conversation: [], sales_summary: '', extracted: {} };
  const modelSme = { schema_version: '2.0', mode: 'sme', industry_category: 'beauty', site_type: 'business_website', business_name: null, industry: 'aesthetic clinic', audience: 'patients', primary_goal: 'bookings', design_direction: { brand_personality: 'luxurious', typography: 'Cormorant + Inter', layout: 'image-led', imagery: 'clinic', motion: 'soft', palette: 'sand' }, pages: [{ name: 'Home', purpose: 'x' }], features: [], integrations: [], style: { tone: null, colours: null, references: [] }, existing_assets: { domain: null, logo: null, brand_colours: null, content: null }, content_notes: null, questions_for_customer: [], missing_information: [], build_prompt: 'Build it. Never use: gradients.', confidence: 0.7, reasoning: 'ok' };
  const r = wb.finalizeBrief({ raw_text: JSON.stringify(modelSme), input: said });
  assert.strictEqual(r.fallback_used, false);
  assert.strictEqual(r.brief.mode, 'medical');
  assert.strictEqual(r.brief.industry_category, 'healthcare');
  assert.ok(r.brief.verification_required.length >= 5 && r.brief.qa_checklist.some((q) => /Medical content/.test(q)));
  assert.ok(/VERIFY WITH CLINIC/.test(r.build_prompt), 'prompt regenerated with the medical rules');
  assert.ok(/\[guardrail\] medical mode enforced/.test(r.brief.reasoning));
  assert.deepStrictEqual(ppValidate(briefSchema, r.brief), []);
});
test('website builder Compose System Prompt loads the design standard + playbook live, falls back when the vault is unreadable', () => {
  const b64 = (t) => Buffer.from(t, 'utf8').toString('base64');
  const file = 'workflows/website-builder/dist/code-nodes/compose-system-prompt.js';
  const withVault = runCodeNode(file, [{ json: {} }], { 'Load Design Standard': { content: b64('---\ntitle: x\n---\n# Standard\nRejected on sight: purple gradient.') }, 'Load Website Playbook': { content: b64('# Playbook\nAlways propose a Book page.') } }, ROOT)[0].json;
  assert.strictEqual(withVault.brain_source, 'vault:standard+playbook');
  assert.ok(withVault.system_prompt.includes('Rejected on sight: purple gradient.') && withVault.system_prompt.includes('Always propose a Book page.'));
  assert.ok(!withVault.system_prompt.includes('title: x'), 'frontmatter must be stripped');
  assert.ok(withVault.system_prompt.indexOf('Rejected on sight') < withVault.system_prompt.indexOf('# Output schema'), 'vault text precedes the static rules');
  const noVault = runCodeNode(file, [{ json: {} }], { 'Load Design Standard': { error: 'Not Found' }, 'Load Website Playbook': { error: 'Not Found' } }, ROOT)[0].json;
  assert.strictEqual(noVault.brain_source, 'compiled_fallback');
  assert.ok(noVault.system_prompt.includes('You are the Website Builder Agent'));
});

console.log('\n[6] company discovery agent (agents/company-discovery/discovery.js) + proposal draft');
const ds = require('../agents/company-discovery/discovery.js');
const pr = require('../agents/proposal/draft.js');
const mapSchema = require('../schemas/company-map.schema.json');
const turnSchema = require('../schemas/company-discovery-output.schema.json');
const OWNER_MSG = 'We are SwiftMove Logistics Pte Ltd, a logistics company in Singapore with 15 drivers. Leads come from Facebook and referrals, customers WhatsApp us, our customers are in Excel and we use Xero. We keep forgetting to follow up quotes.';
test('empty map validates; rules turn extracts company, headcount, software, data handling, pain points', () => {
  assert.deepStrictEqual(ppValidate(mapSchema, ds.dsEmptyMap()), []);
  const r = ds.finalizeDiscoveryTurn({ error: 'model_error: simulated', input: { map: null, turns: 0, message: OWNER_MSG } });
  assert.strictEqual(r.provider, 'rules');
  assert.deepStrictEqual(ppValidate(mapSchema, r.map), [], 'merged map must validate');
  assert.deepStrictEqual(ppValidate(turnSchema, Object.assign({}, r.turn, { map_patch: {} })), []);
  assert.strictEqual(r.map.company_profile.company_name, 'SwiftMove Logistics Pte Ltd');
  assert.strictEqual(r.map.company_profile.employees, 15);
  assert.strictEqual(r.map.company_profile.industry, 'logistics');
  assert.ok(r.map.current_software.some((s) => s.name === 'Xero' && s.category === 'accounting'));
  assert.ok(r.map.communication_channels.includes('whatsapp') && r.map.marketing.channels.includes('facebook'));
  const cust = r.map.data_sources.find((d) => d.category === 'customer_records');
  assert.ok(cust && cust.availability === 'IMPORT_REQUIRED' && cust.handling === 'IMPORTED', 'Excel customers → import, not "send us everything"');
  assert.ok(r.map.pain_points.length >= 1);
  assert.ok(/import the spreadsheet/i.test(r.turn.reply), 'reassurance about the spreadsheet');
  assert.ok((r.turn.reply.match(/\?/g) || []).length <= 3, 'at most two or three questions');
  assert.strictEqual(r.discovery_complete, false, 'never complete after one turn');
  assert.ok(r.next_topics.length > 0 && !r.next_topics.includes('company'));
});
test('model turn is merged (arrays union, scalars overwrite), invented company name is stripped, credentials request replaced', () => {
  const first = ds.finalizeDiscoveryTurn({ error: 'x', input: { map: null, turns: 0, message: OWNER_MSG } }).map;
  const good = { schema_version: '1.0', reply: 'Got it — Xero and Excel. Who follows up on quotes today, and how many times?', map_patch: { company_profile: { markets: ['Singapore'], employees: 18 }, current_software: [{ name: 'Xero', category: 'accounting', notes: 'invoices only' }, { name: 'Google Sheets', category: 'spreadsheets', notes: null }], sales_process: { follow_up_owner: 'the owner himself' } }, topics_covered_this_turn: ['sales'], next_topics: ['operations'], data_onboarding_plan: ['customer records: import the spreadsheet'], discovery_complete: false, confidence: 0.8, reasoning: 'ok' };
  const r = ds.finalizeDiscoveryTurn({ raw_text: '```json\n' + JSON.stringify(good) + '\n```', input: { map: first, turns: 1, message: 'I follow up myself, maybe once.' } });
  assert.strictEqual(r.provider, 'anthropic');
  assert.strictEqual(r.map.company_profile.employees, 18, 'scalar overwritten');
  assert.strictEqual(r.map.company_profile.company_name, 'SwiftMove Logistics Pte Ltd', 'earlier fact kept');
  assert.strictEqual(r.map.current_software.length, 3, 'Xero merged, Google Sheets added');
  assert.strictEqual(r.map.current_software.find((s) => s.name === 'Xero').notes, 'invoices only');
  assert.deepStrictEqual(ppValidate(mapSchema, r.map), []);
  const fake = Object.assign({}, good, { map_patch: { company_profile: { company_name: 'Acme Freight Kings' } } });
  const r2 = ds.finalizeDiscoveryTurn({ raw_text: JSON.stringify(fake), input: { map: null, turns: 0, message: 'we move parcels' } });
  assert.strictEqual(r2.map.company_profile.company_name, null);
  assert.ok(r2.guardrails.includes('company_name_not_in_owner_words'));
  const bad = Object.assign({}, good, { reply: 'Please send me your HubSpot password and all your customer data so I can import it.' });
  const r3 = ds.finalizeDiscoveryTurn({ raw_text: JSON.stringify(bad), input: { map: first, turns: 1, message: 'ok' } });
  assert.ok(r3.guardrails.includes('reply_asks_for_credentials'));
  assert.ok(!/password/i.test(r3.turn.reply), 'reply replaced by the safe fallback');
});
test('discovery completes only after enough turns and coverage; note + proposal draft render without prices', () => {
  let map = null;
  const msgs = [OWNER_MSG, 'Customers are mostly SMEs that ship parcels, B2B. Marketing is Facebook ads run by an agency.', 'Jobs come in by WhatsApp, my ops manager assigns drivers in a WhatsApp group, deadlines are tracked on a whiteboard; delays happen when a driver is sick. Support is me answering the phone.', 'I check the whiteboard and the bank every morning. Hardest thing is knowing which quotes are outstanding. Everyone repeats typing the same delivery quote and we forget to chase.'];
  let r = null;
  msgs.forEach((m, i) => { r = ds.finalizeDiscoveryTurn({ error: 'x', input: { map, turns: i, message: m } }); map = r.map; });
  assert.ok(r.coverage >= 0.75, 'coverage ' + r.coverage);
  assert.strictEqual(r.discovery_complete, true);
  const proposal = pr.draftProposal(map, { contact_name: 'Marcus', date: '2026-09-25' });
  assert.ok(/## Executive summary/.test(proposal) && /## Implementation phases/.test(proposal) && /## Pricing/.test(proposal));
  assert.ok(/Requires human approval/.test(proposal) && !/S?\$\s?\d/.test(proposal), 'no amounts');
  assert.ok(/Sales Agent \(John\)/.test(proposal) && /CEO Dashboard/.test(proposal));
  assert.ok(/import the spreadsheet|imported once/i.test(proposal), 'data onboarding plan present');
  const note = ds.dsRenderMapNote({ map, map_id: 'map_test', contact_name: 'Marcus', ts: '2026-09-25T00:00:00.000Z', test_mode: true, discovery_complete: true, proposal_md: proposal });
  assert.ok(note.startsWith('---\ntype: company-map\nmap_id: map_test\n'));
  assert.ok(/\| customer records \| IMPORT_REQUIRED \|/.test(note), 'data source table row');
  assert.ok(/- \[x\] company/.test(note) && /## Proposal draft/.test(note));
});

console.log('\n[9] ceo orchestrator (Agent #0) + approval inbox');
const oc = require('../agents/ceo-orchestrator/orchestrator.js');
const OC_NOW = Date.parse('2026-09-26T04:00:00.000Z');
test('event routing: build failure opens an exception task (idempotent id) and notifies the owner unless test_mode', () => {
  const ev = oc.ocNormalizeEvent({ type: 'website.build_failed', source: 'website-build-runner', lead_id: 'lead_1', task_id: 'task_wb_1', summary: 'Lovable timed out' }, OC_NOW);
  assert.strictEqual(ev.route.action, 'exception_task');
  const a = oc.ocEventActions(ev);
  assert.strictEqual(a.tasks.length, 1);
  assert.strictEqual(a.tasks[0].task_type, 'exception');
  assert.strictEqual(a.tasks[0].assigned_to, 'human');
  assert.ok(a.notify && /build failed/.test(a.notify.subject), 'owner notified');
  assert.ok(/Nothing was sent to any customer/.test(a.notify.html));
  const again = oc.ocEventActions(oc.ocNormalizeEvent({ type: 'website.build_failed', task_id: 'task_wb_1', summary: 'other words' }, OC_NOW + 5000));
  assert.strictEqual(again.tasks[0].task_id, a.tasks[0].task_id, 'same entity → same task id');
  const t = oc.ocEventActions(oc.ocNormalizeEvent({ type: 'website.build_failed', task_id: 'task_wb_1', test_mode: true }, OC_NOW));
  assert.strictEqual(t.notify, null, 'no email in test mode');
  assert.strictEqual(a.audit.action, 'event_website_build_failed');
});
test('event routing: informational events open no task, unknown types are accepted as notes, human_review opens a review task', () => {
  const built = oc.ocEventActions(oc.ocNormalizeEvent({ type: 'website.built', lead_id: 'lead_1' }, OC_NOW));
  assert.deepStrictEqual(built.tasks, []); assert.strictEqual(built.notify, null); assert.strictEqual(built.decision.agent, 'sales-qualification');
  const unknown = oc.ocEventActions(oc.ocNormalizeEvent({ type: 'Something.Odd' }, OC_NOW));
  assert.strictEqual(unknown.decision.action, 'note'); assert.strictEqual(unknown.audit.action, 'event_something_odd');
  const rev = oc.ocEventActions(oc.ocNormalizeEvent({ type: 'lead.human_review', lead_id: 'lead_9', summary: 'asked for a refund' }, OC_NOW));
  assert.strictEqual(rev.tasks[0].task_type, 'approval'); assert.strictEqual(rev.tasks[0].requires_approval, true); assert.strictEqual(rev.notify, null);
  assert.deepStrictEqual(oc.ocEventActions(oc.ocNormalizeEvent(null, OC_NOW)).tasks, [], 'garbage body does not throw');
});
const OC_FIX = {
  now: OC_NOW,
  tasks: [
    { task_id: 'task_a', lead_id: 'lead_real', status: 'open', requires_approval: true, title: 'Approve reply', approval_reason: 'pricing', ts: '2026-09-26T03:30:00.000Z' },
    { task_id: 'task_b', lead_id: 'lead_test', status: 'open', requires_approval: true, title: 'test approval', ts: '2026-09-25T00:00:00.000Z' },
    { task_id: 'task_exc_1', lead_id: 'lead_test', task_type: 'exception', status: 'open', title: 'EXCEPTION: build failed', ts: '2026-09-25T00:00:00.000Z' },
    { task_id: 'task_exc_2', lead_id: '', task_type: 'exception', status: 'recovered', title: 'old', ts: '2026-09-25T00:00:00.000Z' },
    { task_id: 'task_wb_1', lead_id: 'lead_real', task_type: 'website_build', status: 'building', title: 'Build Prestige', ts: '2026-09-26T02:00:00.000Z' },
    { task_id: 'task_wb_2', lead_id: 'lead_real', task_type: 'website_build', status: 'built', title: 'Built', ts: '2026-09-26T02:00:00.000Z' },
    { task_id: 'task_f', lead_id: 'lead_real', status: 'open', requires_approval: false, title: 'Call back', due_at: '2026-09-25T10:00:00.000Z', ts: '2026-09-25T00:00:00.000Z' }
  ],
  leads: [
    { lead_id: 'lead_real', status: 'QUALIFYING', contact_name: 'Marcus', company_name: 'SwiftMove', last_contact_at: '2026-09-23T00:00:00.000Z', createdAt: '2026-09-26T01:00:00.000Z' },
    { lead_id: 'lead_test', status: 'HUMAN_REVIEW', test_mode: true, contact_name: 'Ryan test', last_contact_at: '2026-09-20T00:00:00.000Z' },
    { lead_id: 'lead_hr', status: 'HUMAN_REVIEW', contact_name: 'Dr Lim', company_name: 'Lim Clinic', last_contact_at: '2026-09-26T03:00:00.000Z' }
  ],
  runs: [
    { run_id: 'r1', agent: 'sales-qualification', started_at: '2026-09-26T03:00:00.000Z', success: false, error: 'model_error' },
    { run_id: 'r2', agent: 'website-builder', started_at: '2026-09-26T03:00:00.000Z', success: true, provider: 'rules', error: 'Payment required' },
    { run_id: 'r3', agent: 'x', started_at: '2026-09-20T03:00:00.000Z', success: false, error: 'old' }
  ]
};
test('unresolved issues: test leads excluded (exceptions always in), stuck build, overdue, stale, failed runs, sorted high first', () => {
  const { issues, stats } = oc.ocComputeIssues(OC_FIX);
  const kinds = issues.map((i) => i.kind + ':' + (i.task_id || i.lead_id || i.ref));
  assert.ok(kinds.includes('approval_waiting:task_a') && !kinds.includes('approval_waiting:task_b'), 'test lead approval excluded');
  assert.ok(kinds.includes('exception_open:task_exc_1') && !kinds.includes('exception_open:task_exc_2'), 'exception on test lead still shown; recovered one not');
  assert.ok(kinds.includes('build_stuck:task_wb_1'), 'building for 2 h = stuck');
  assert.ok(kinds.includes('overdue_follow_up:task_f') && kinds.includes('stale_lead:lead_real') && kinds.includes('human_review_lead:lead_hr'));
  assert.ok(!kinds.some((k) => k.endsWith(':lead_test')), 'test lead never listed');
  assert.ok(kinds.includes('runs_failed_24h:runs') && kinds.includes('ai_fallback_24h:fallback'));
  assert.strictEqual(issues[0].severity, 'high'); assert.strictEqual(issues[issues.length - 1].severity, 'low');
  assert.strictEqual(stats.leads_real, 2); assert.strictEqual(stats.leads_test, 1); assert.strictEqual(stats.runs_failed_24h, 1); assert.strictEqual(stats.builds.building, 1);
  assert.deepStrictEqual(oc.ocComputeIssues({}).issues, [], 'empty tables → nothing unresolved');
});
test('management view note and inbox page render from the same issues; inbox links approvals to the Approve Reply gate', () => {
  const comp = oc.ocComputeIssues(OC_FIX);
  const view = oc.ocRenderView(comp);
  assert.ok(view.startsWith('---\ntags: [zaphiel, ceo-brain, management-view, live]'));
  assert.ok(/### Exceptions \(1\)/.test(view) && /### Website builds stuck \(1\)/.test(view) && /\| Approvals waiting \| 1 \|/.test(view));
  const html = oc.ocInboxHtml({ issues: comp.issues, stats: comp.stats, drafts: { lead_real: 'msg_77_out' }, approve_url: 'https://x/approve', action_url: 'https://x/inbox' });
  assert.ok(/https:\/\/x\/approve\?decision=approve&message_id=msg_77_out&lead_id=lead_real/.test(html), 'approve link');
  assert.ok(/data-act="recover" data-task="task_exc_1"/.test(html) && /data-act="close" data-task="task_f"/.test(html));
  assert.ok(!/<script>[^]*\$\(/.test(html) && /"https:\/\/x\/inbox"/.test(html), 'page posts back to the inbox url');
  assert.ok(/&lt;/.test(oc.ocInboxHtml({ issues: [{ kind: 'stale_lead', severity: 'low', title: '<b>x</b>', lead_id: 'l' }], stats: {} })), 'titles are escaped');
});
test('inbox action: PIN required, only close/recover/reopen/cancel, maps to task statuses', () => {
  assert.deepStrictEqual(oc.ocInboxAction({ action: 'close', task_id: 't1', pin: 'nope' }, 'secret').error, 'wrong_pin');
  assert.strictEqual(oc.ocInboxAction({ action: 'close', task_id: 't1', pin: 'secret' }, '').error, 'wrong_pin', 'empty configured pin never matches');
  assert.strictEqual(oc.ocInboxAction({ action: 'delete', task_id: 't1', pin: 'secret' }, 'secret').error, 'unknown_action');
  assert.strictEqual(oc.ocInboxAction({ action: 'close', pin: 'secret' }, 'secret').error, 'task_id_required');
  const ok = oc.ocInboxAction({ action: 'RECOVER', task_id: 'task_exc_1', pin: 'secret', note: 'reran the build' }, 'secret');
  assert.strictEqual(ok.ok, true); assert.strictEqual(ok.status, 'recovered'); assert.strictEqual(ok.note, 'reran the build');
  assert.strictEqual(oc.ocInboxAction({ action: 'close', task_id: 't', pin: 'secret' }, 'secret').status, 'done');
});
test('Orchestrate / Render Inbox / Validate Action code nodes run as deployed (vm simulation)', () => {
  const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const items = (a) => a.map((json) => ({ json }));
  const mk = (store, input) => ({ $: (n) => ({ first: () => ({ json: store[n][0] }), all: () => items(store[n]) }), $input: { first: () => ({ json: input }) }, $execution: { id: '42' }, Buffer, Date, JSON, Math });
  const run = (f, ctx) => vm.runInNewContext('(function(){' + src(f) + '})()', ctx);
  const store = { 'Normalize Event': [{ mode: 'event', body: { type: 'website.build_failed', source: 'runner', lead_id: 'lead_real', task_id: 'task_wb_1', summary: 'timed out', test_mode: true }, received_at: '2026-09-26T04:00:00.000Z' }], 'Get Tasks': items(OC_FIX.tasks).map((i) => i.json), 'Get Leads': OC_FIX.leads, 'Get Agent Runs': OC_FIX.runs, 'Get Pending Drafts': [{ message_id: 'msg_1', lead_id: 'lead_real', status: 'draft_pending_approval', ts: '2026-09-26T03:00:00.000Z' }] };
  const o = run('workflows/ceo-orchestrator/dist/code-nodes/orchestrate.js', mk(store, store['Normalize Event'][0]))[0].json;
  assert.strictEqual(o.mode, 'event'); assert.strictEqual(o.has_tasks, true); assert.strictEqual(o.tasks[0].task_type, 'exception'); assert.strictEqual(o.has_notify, false, 'test_mode → no email');
  assert.ok(o.issues.some((i) => i.task_id === o.tasks[0].task_id), 'new task already in the view');
  assert.ok(o.response.ok && o.audit.action === 'event_website_build_failed' && /^run_/.test(o.run_id));
  const tick = run('workflows/ceo-orchestrator/dist/code-nodes/orchestrate.js', mk(Object.assign({}, store, { 'Normalize Event': [{ mode: 'tick', body: {}, received_at: '2026-09-26T04:00:00.000Z' }] }), {}))[0].json;
  assert.strictEqual(tick.mode, 'tick'); assert.strictEqual(tick.has_tasks, false); assert.strictEqual(tick.event, null); assert.strictEqual(tick.response.type, 'tick');
  const prep = run('workflows/ceo-orchestrator/dist/code-nodes/prepare-view-write.js', mk({ Orchestrate: [o] }, { sha: 'abc', content: Buffer.from(o.view.replace(/^updated:.*$/m, 'updated: 2020').replace(/^# Management view.*$/m, '# Management view — old')).toString('base64') }))[0].json;
  assert.deepStrictEqual({ exists: prep.exists, changed: prep.changed }, { exists: true, changed: false }, 'same content apart from timestamps → no commit');
  assert.strictEqual(run('workflows/ceo-orchestrator/dist/code-nodes/prepare-view-write.js', mk({ Orchestrate: [o] }, {}))[0].json.exists, false);
  const inbox = run('workflows/approval-inbox/dist/code-nodes/render-inbox.js', mk(store, {}))[0].json;
  assert.ok(/decision=approve&message_id=msg_1&lead_id=lead_real/.test(inbox.html) && inbox.drafts === 1);
  const val = run('workflows/approval-inbox/dist/code-nodes/validate-action.js', mk({ 'Inbox Config': [{ pin: 'p1' }] }, { body: { pin: 'p1', action: 'close', task_id: 'task_f' } }))[0].json;
  assert.strictEqual(val.ok, true); assert.strictEqual(val.status, 'done'); assert.strictEqual(val.execution_id, '42');
  assert.strictEqual(run('workflows/approval-inbox/dist/code-nodes/validate-action.js', mk({ 'Inbox Config': [{ pin: 'p1' }] }, { body: { pin: 'zz', action: 'close', task_id: 'task_f' } }))[0].json.http, 403);
});

console.log('\n[10] website intelligence (internal agent, ADR-3)');
const wr = require('../agents/website-intelligence/research.js');
const WR_HANDOFF = { tenant_id: 'fusiontech', lead_id: 'lead_wr', contact_name: 'Marcus', company_name: 'Prestige Motors', industry: 'BMW dealership', message: 'Can you build me a mock-up? Our site is prestigemotors.sg', conversation_json: '[]', extracted_json: '{}', test_mode: true, notify_email: 'o@x.com', source_execution_id: '1' };
const WR_HTML = '<html><head><title>Prestige Motors — BMW Showroom</title><meta name="description" content="BMW showroom in Singapore"></head><body><h1>Drive the new BMW</h1><a href="/about">About us</a><a href="/services">Services</a><a href="/contact">Contact</a><a href="https://wa.me/6591234567">WhatsApp</a><form></form><p>Call +65 9123 4567</p><script>gtag("x")</script></body></html>';
test('hand-off → input, queries, identity: the customer\'s URL wins; without one the best search match is medium; nothing found is low', () => {
  const input = wr.wrInput(WR_HANDOFF);
  assert.strictEqual(input.website, 'https://prestigemotors.sg'); assert.strictEqual(input.website_source, 'customer_words'); assert.strictEqual(input.location, 'Singapore');
  const qs = wr.wrQueries(input).map((q) => q.key);
  assert.deepStrictEqual(qs, ['name', 'name_location', 'reviews', 'name_service', 'market', 'buyer_intent']);
  assert.strictEqual(wr.wrIdentify(input, []).confidence, 'high');
  const noUrl = wr.wrInput(Object.assign({}, WR_HANDOFF, { message: 'mock-up please' }));
  const results = wr.wrSearchItems([{ json: { query_key: 'name', results: [{ title: 'Prestige Motors Singapore | BMW', url: 'https://prestigemotors.sg/', description: 'official' }, { title: 'Prestige Motors | Facebook', url: 'https://www.facebook.com/pm' }, { title: 'Prestige Motors reviews', url: 'https://www.google.com/maps/x' }] } }]);
  const id = wr.wrIdentify(noUrl, results);
  assert.strictEqual(id.confidence, 'medium'); assert.strictEqual(id.host, 'prestigemotors.sg'); assert.ok(id.socials[0].includes('facebook'));
  assert.strictEqual(wr.wrIdentify(noUrl, []).confidence, 'low');
  assert.deepStrictEqual(wr.wrQueries(wr.wrInput({})), [], 'no company → no queries');
});
test('html → text/signals/links; page picking; digest labels facts and never lists a low-confidence site as verified', () => {
  const parsed = wr.wrHtmlToText(WR_HTML, 'https://prestigemotors.sg');
  assert.strictEqual(parsed.title, 'Prestige Motors — BMW Showroom'); assert.deepStrictEqual(parsed.h1s, ['Drive the new BMW']);
  assert.ok(parsed.signals.whatsapp && parsed.signals.form && parsed.signals.phone && parsed.signals.analytics);
  assert.deepStrictEqual(wr.wrPickPages(parsed.links), ['https://prestigemotors.sg/about', 'https://prestigemotors.sg/services', 'https://prestigemotors.sg/contact']);
  assert.ok(!/gtag/.test(parsed.text), 'scripts stripped');
  const input = wr.wrInput(WR_HANDOFF);
  const d = wr.wrDigest({ input, identity: wr.wrIdentify(input, []), results: wr.wrSearchItems([{ json: { query_key: 'market', results: [{ title: 'Performance Motors', url: 'https://performancemotors.com.sg', description: 'BMW dealer' }] } }]), pages: [{ url: 'https://prestigemotors.sg', ok: true, html: WR_HTML }] });
  assert.ok(d.facts.some((f) => f.label === 'VERIFIED_PUBLIC_FACT' && /Official website/.test(f.fact)));
  assert.ok(d.facts.some((f) => f.label === 'JOHN_OR_CUSTOMER_PROVIDED_FACT'));
  assert.strictEqual(d.competitors.length, 1); assert.ok(/CLIENT TO PROVIDE/.test(d.digest_text));
  const low = wr.wrDigest({ input: wr.wrInput({ company_name: 'ABC Renovation' }), identity: { website: 'https://abc.sg', host: 'abc.sg', confidence: 'low', reason: 'weak', candidates: [], socials: [] }, results: [], pages: [{ url: 'https://abc.sg', ok: true, html: WR_HTML }] });
  assert.ok(!low.facts.some((f) => /^VERIFIED/.test(f.label)), 'low identity → no verified site facts');
  assert.ok(wr.wrFetchedPage({ json: { error: { message: 'timeout' } } }, 'https://x').ok === false);
  assert.ok(wr.wrFetchedPage({ json: { content: WR_HTML } }, 'https://x').ok);
});
test('finalize: model JSON is coerced to the brief; fallback when the model fails; text carries the two variations + creator instruction; never delays', () => {
  const input = wr.wrInput(WR_HANDOFF);
  const digest = wr.wrDigest({ input, identity: wr.wrIdentify(input, []), results: [], pages: [{ url: 'https://prestigemotors.sg', ok: true, html: WR_HTML }] });
  const ok = wr.wrFinalize({ raw_text: '```json\n' + JSON.stringify({ company_name: 'Prestige Motors', primary_conversion: 'BOOK TEST DRIVE', services: ['New BMW sales', 'Certified pre-owned'], questions_for_john: [] }) + '\n```', input, digest });
  assert.strictEqual(ok.status, 'READY_FOR_WEBSITE_CREATOR'); assert.strictEqual(ok.provider, 'anthropic'); assert.strictEqual(ok.needs_john, false);
  assert.deepStrictEqual(ok.brief.services, ['New BMW sales', 'Certified pre-owned']); assert.ok(ok.brief.recommended_sitemap.length, 'missing lists filled from the deterministic brief');
  assert.ok(/^STATUS:\nREADY_FOR_WEBSITE_CREATOR/.test(ok.brief_text) && /VARIATIONS REQUIRED/.test(ok.brief_text) && /WEBSITE CREATOR INSTRUCTION/.test(ok.brief_text) && /JOHN — FUSION AI SALES AGENT/.test(ok.brief_text));
  assert.ok(!/\$\s?\d/.test(ok.brief_text), 'no prices');
  const fb = wr.wrFinalize({ error: 'model_error: Payment required', input, digest });
  assert.strictEqual(fb.status, 'READY_FOR_WEBSITE_CREATOR'); assert.strictEqual(fb.provider, 'rules'); assert.strictEqual(fb.brief.primary_conversion, 'BOOK TEST DRIVE'); assert.ok(fb.brief.placeholders_required.length);
  const lowIn = wr.wrInput({ company_name: 'ABC Renovation', industry: 'renovation contractor' });
  const lowD = wr.wrDigest({ input: lowIn, identity: wr.wrIdentify(lowIn, []), results: [], pages: [] });
  const low = wr.wrFinalize({ raw_text: JSON.stringify({ company_url: 'https://abc.sg', identity_confidence: 'high' }), input: lowIn, digest: lowD });
  assert.strictEqual(low.status, 'READY_FOR_WEBSITE_CREATOR', 'Rule 12: still builds'); assert.strictEqual(low.brief.company_url, ''); assert.strictEqual(low.identity_confidence, 'low'); assert.ok(low.needs_john && /official/.test(low.questions_for_john[0]));
  assert.strictEqual(low.brief.primary_conversion, 'GET QUOTE');
  assert.strictEqual(wr.wrFinalize({ error: 'x', input: wr.wrInput({}), digest: wr.wrDigest({ input: wr.wrInput({}), identity: { website: '', host: '', confidence: 'low', reason: 'none', candidates: [], socials: [] }, results: [], pages: [] }) }).status, 'MORE_INFORMATION_REQUIRED');
});
test('Website Intelligence code nodes run as deployed (vm simulation, model down → rules brief → hand-off + info_needed event)', () => {
  const src = (f) => fs.readFileSync(path.join(ROOT, 'workflows/website-intelligence/dist/code-nodes', f), 'utf8');
  const items = (a) => a.map((json, i) => ({ json, pairedItem: { item: i } }));
  const store = {};
  const mk = (input) => ({ $: (n) => ({ first: () => ({ json: store[n][0] }), all: () => items(store[n]) }), $input: { first: () => input[0], all: () => input }, $execution: { id: '7' }, $workflow: { id: 'w' }, Buffer, Date, JSON, Math });
  const run = (f, input) => vm.runInNewContext('(function(){' + src(f) + '})()', mk(input));
  store['Plan Research'] = run('plan-research.js', items([WR_HANDOFF])).map((i) => i.json);
  assert.strictEqual(store['Plan Research'].length, 6);
  store['Identify Company'] = run('identify-company.js', items(store['Plan Research'].map(() => ({ results: [{ title: 'Prestige Motors BMW', url: 'https://prestigemotors.sg/', description: 'x' }] })))).map((i) => i.json);
  assert.strictEqual(store['Identify Company'][0].identity.confidence, 'high'); assert.strictEqual(store['Identify Company'][0].homepage_url, 'https://prestigemotors.sg');
  store['Fetch Homepage'] = [{ html: WR_HTML, status: 200 }];
  store['Pick Pages'] = run('pick-pages.js', items(store['Fetch Homepage'])).map((i) => i.json);
  assert.strictEqual(store['Pick Pages'].length, 3);
  store['Digest Research'] = run('digest-research.js', items(store['Pick Pages'].map(() => ({ content: '<html><title>About</title><body>About Prestige</body></html>' })))).map((i) => i.json);
  assert.strictEqual(store['Digest Research'][0].digest.site.pages_read.length, 4);
  store['Load Role Prompt'] = [{ content: Buffer.from('---\nx: y\n---\n> note\nFUSION AI — WEBSITE INTELLIGENCE AGENT\nRULE 1').toString('base64'), sha: 'a' }];
  store['Compose Research Prompt'] = run('compose-research-prompt.js', items([{}])).map((i) => i.json);
  assert.strictEqual(store['Compose Research Prompt'][0].role_source, 'vault'); assert.ok(/^FUSION AI — WEBSITE INTELLIGENCE AGENT/.test(store['Compose Research Prompt'][0].system_prompt)); assert.ok(/RESEARCH DIGEST/.test(store['Compose Research Prompt'][0].user_prompt));
  const fin = run('finalize-brief.js', items([{ error: { message: 'Payment required' } }]))[0].json;
  assert.strictEqual(fin.ready, true); assert.strictEqual(fin.provider, 'rules'); assert.strictEqual(fin.event.type, 'website.info_needed'); assert.ok(fin.brief_text.length > 2000); assert.ok(JSON.parse(fin.research_json).site.pages_read.length === 4);
  const fin2 = run('finalize-brief.js', items([{ text: JSON.stringify({ company_name: 'Prestige Motors', primary_conversion: 'BOOK TEST DRIVE', questions_for_john: [] }) }]))[0].json;
  assert.strictEqual(fin2.event.type, 'website.research'); assert.strictEqual(fin2.needs_john, false);
});

console.log('\n[11] funnels + construction (Ryan, 2026-09-26: the builder makes funnels and sites for every industry)');
test('"funnel" is a landing-page build; construction is its own industry with its own design direction', () => {
  assert.strictEqual(wb.wbDetectSiteType('I need a sales funnel for my coaching business'), 'landing_page');
  assert.strictEqual(wb.wbDetectSiteType('can you build us a lead funnel'), 'landing_page');
  assert.strictEqual(wb.wbDetectCategory('We are a construction company, main contractor for condos'), 'construction');
  assert.strictEqual(wb.wbDetectCategory('We do design and build for offices'), 'construction');
  assert.strictEqual(wb.wbDetectCategory('I am a plumber'), 'home_services'); assert.strictEqual(wb.wbDetectCategory('we do home renovation'), 'home_services'); assert.strictEqual(wb.wbDetectCategory('a logistics company'), 'logistics');
  assert.ok(wb.WB_CATEGORIES.indexOf('construction') !== -1 && wb.WB_DESIGN.construction && /safety-signal/.test(wb.WB_DESIGN.construction.palette));
  const b = wb.wbFallbackBrief({ company_name: 'Tan Brothers Construction Pte Ltd', message: 'We are Tan Brothers Construction Pte Ltd, a main contractor. We need a funnel so developers can request a quote.' });
  assert.strictEqual(b.site_type, 'landing_page'); assert.strictEqual(b.industry_category, 'construction'); assert.strictEqual(b.primary_goal, 'leads');
  assert.deepStrictEqual(wb.wbValidate(b), []);
  assert.ok(/Barlow Condensed|Archivo/.test(b.build_prompt));
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas/website-brief.schema.json'), 'utf8'));
  assert.ok(schema.properties.industry_category.enum.indexOf('construction') !== -1);
});
test('John hands a funnel request to the website chain, and the rules tag it website_build', () => {
  const r = classifyWithRules({ message: 'Hi, I want a sales funnel for my construction company', contact_name: 'Ken' });
  assert.ok(r.extracted.desired_automation.includes('website_build'));
  const run = simulate({ name: 'Ken', channel: 'web_chat', source: 'website', message: 'Hi, we are Tan Brothers Construction Pte Ltd, a main contractor in Singapore. I want a sales funnel where developers can request a quote. Send it to ken@tanbrothers.sg', test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 's-funnel' } });
  assert.strictEqual(run.fin.website_intake.topic, true);
  assert.strictEqual(run.fin.website_requested, true);
});

console.log('\n[12] John\'s judgement: talking about websites never starts a build (Ryan, 2026-09-26)');
test('capability question → John answers and offers a mock-up; no intake questions, no hand-off', () => {
  const run = simulate({ name: 'Mei', channel: 'web_chat', source: 'website', message: 'What type of websites can you build?', test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 'j1' } });
  assert.strictEqual(run.fin.website_intake.intent, false);
  assert.strictEqual(run.fin.website_requested, false);
  assert.ok(!/name of your business/.test(run.fin.result.recommended_reply), 'must not jump into mock-up questions');
  assert.ok(/landing pages|websites/.test(run.fin.result.recommended_reply), 'answers the question');
  assert.ok(/first mock-up made for your business/.test(run.fin.result.recommended_reply), 'offers, customer decides');
});
test('business details + a website complaint but no request → no build', () => {
  const run = simulate({ name: 'Daniel', channel: 'web_chat', source: 'website', message: 'We are Prestige Motors, a BMW dealership in Singapore. Our website gets no enquiries for test drives. Email me at daniel@prestige.sg', test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 'j2' } });
  assert.strictEqual(run.fin.website_requested, false);
  assert.strictEqual(run.fin.website_intake.intent, false);
});
test('customer says yes to John\'s offer → intake starts; details → build', () => {
  const history = [
    { role: 'customer', content: 'What type of websites can you build?' },
    { role: 'agent', content: 'We build business websites, landing pages and sales funnels. Would you like me to have a first mock-up made for your business, so you can see it before deciding anything?' }
  ];
  const yes = simulate({ name: 'Mei', channel: 'web_chat', source: 'website', message: 'Yes please', conversation_history: history, test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 'j3' } });
  assert.strictEqual(yes.fin.website_intake.intent, true);
  assert.strictEqual(yes.fin.website_requested, false);
  assert.ok(/first mock-up built for you/.test(yes.fin.result.recommended_reply));
  const h2 = history.concat([{ role: 'customer', content: 'Yes please' }, { role: 'agent', content: yes.fin.result.recommended_reply }]);
  const details = simulate({ name: 'Mei', channel: 'web_chat', source: 'website', message: 'We are Sunrise Bakery, a bakery in Tampines. Customers should order cakes online. Send it to mei@sunrise.sg', conversation_history: h2, test_mode: true, ai_mode: 'mock', external_ids: { chat_session: 'j3' } });
  assert.strictEqual(details.fin.website_requested, true);
});
test('wiAsksForBuild: requests vs questions', () => {
  const w = require('../agents/website-builder/intake.js');
  ['Can you build me a website?', 'Can you build a website for my bakery?', 'I want a sales funnel', 'We need a new website', 'Send me a mock-up', 'help me build a landing page'].forEach((m) => assert.strictEqual(w.wiAsksForBuild(m), true, m));
  ['What type of websites can you build?', 'Do you make funnels?', 'Can you build a website?', 'how much is a website?', 'Our website gets no enquiries'].forEach((m) => assert.strictEqual(w.wiAsksForBuild(m), false, m));
});

console.log('\n[13] ATLAS — EDG & CRM Systems Architect (agents/atlas/atlas.js + workflow code nodes)');
const at = require('../agents/atlas/atlas.js');
test('atNeeded: named company + systems need + a fact about today; never for a website-only or anonymous ask', () => {
  assert.strictEqual(at.atNeeded({ company_name: 'ABC Property', extracted: { desired_automation: ['whatsapp_auto_reply'], problem: 'agents do not follow up' } }), true);
  assert.strictEqual(at.atNeeded({ company_name: 'ABC Property', extracted: { desired_automation: ['website_build'], problem: 'no enquiries' } }), false, 'website only');
  assert.strictEqual(at.atNeeded({ company_name: '', extracted: { desired_automation: ['crm_sync'], problem: 'x' } }), false, 'no company');
  assert.strictEqual(at.atNeeded({ company_name: 'ABC', extracted: { desired_automation: ['crm_sync'], lead_sources: ['website'] } }), false, 'nothing known about today');
  assert.strictEqual(at.atNeeded({ company_name: 'ABC', extracted: { current_tools: ['Spreadsheets'] }, message: 'we need a CRM' }), true, 'explicit CRM ask');
});
test('atFinalize fallback: 5 labelled checkpoint-1 files, test leads under _Test, approval task, never VERIFIED', () => {
  const input = at.atInput({ lead_id: 'lead_1', company_name: 'Tan Brothers Construction Pte Ltd', test_mode: true, extracted_json: JSON.stringify({ problem: 'quotations get lost in Excel', current_tools: ['Spreadsheets'], lead_sources: ['whatsapp'], desired_automation: ['quote_generation'] }) });
  assert.strictEqual(input.base_path, 'zaphiel/vault/80_Clients/_Test/tan-brothers-construction/edg/');
  const fin = at.atFinalize({ error: 'Payment required', input });
  assert.strictEqual(fin.provider, 'rules'); assert.strictEqual(fin.files.length, 5);
  assert.deepStrictEqual(fin.files.map((f) => f.path.split('/').pop()), ['00_company_model.json', '01_current_state.md', '02_problem_map.md', '14_report_to_john.md', '15_questions_open.md']);
  const model = JSON.parse(fin.files[0].content);
  assert.strictEqual(model.problems.stated_problem.label, 'CLIENT-PROVIDED'); assert.strictEqual(model.acquisition.monthly_lead_volume.label, 'UNKNOWN');
  assert.ok(!/"VERIFIED"/.test(fin.files[0].content), 'nothing can be VERIFIED without checking');
  assert.ok(/```mermaid/.test(fin.files[1].content));
  assert.ok(fin.pack.questions_open.length >= 3 && fin.pack.questions_open.length <= 8);
  assert.strictEqual(fin.task.requires_approval, true); assert.strictEqual(fin.task.task_type, 'edg_design'); assert.strictEqual(fin.event.type, 'edg.checkpoint_1');
  const real = at.atInput({ lead_id: 'lead_2', company_name: 'ABC Property Pte Ltd', test_mode: false });
  assert.strictEqual(real.base_path, 'zaphiel/vault/80_Clients/abc-property/edg/');
});
test('atFinalize with model JSON: model sections kept, gaps filled, provider anthropic', () => {
  const input = at.atInput({ lead_id: 'lead_3', company_name: 'ABC Property', test_mode: true });
  const fin = at.atFinalize({ raw_text: '```json\n' + JSON.stringify({ current_state_md: 'flowchart of how ABC runs today with enough words', questions_open: ['Which CRM do you use?'], summary_for_ryan: 'ok' }) + '\n```', input });
  assert.strictEqual(fin.provider, 'anthropic'); assert.strictEqual(fin.pack.current_state_md, 'flowchart of how ABC runs today with enough words');
  assert.deepStrictEqual(fin.pack.questions_open, ['Which CRM do you use?']); assert.ok(fin.pack.problem_map_md.length > 20);
});
test('ATLAS code nodes run as deployed (vm): prepare → check → compose (agent file from GitHub) → finalize → files → create/edit', () => {
  require('child_process').execSync('node ' + path.join(ROOT, 'workflows/atlas/build.js'));
  const src = (f) => fs.readFileSync(path.join(ROOT, 'workflows/atlas/dist/code-nodes', f), 'utf8');
  const items = (a) => a.map((json, i) => ({ json, pairedItem: { item: i } }));
  const store = {};
  const mk = (input) => ({ $: (n) => ({ first: () => ({ json: store[n][0] }), all: () => items(store[n]) }), $input: { first: () => input[0], all: () => input }, $execution: { id: '9' }, $workflow: { id: 'w' }, Buffer, Date, JSON, Math });
  const run = (f, input) => vm.runInNewContext('(function(){' + src(f) + '})()', mk(input)).map((i) => i.json);
  store['Prepare ATLAS Input'] = run('prepare-atlas-input.js', items([{ lead_id: 'lead_x', company_name: 'ABC Property Pte Ltd', test_mode: true, extracted_json: JSON.stringify({ problem: "agents don't follow up", desired_automation: ['whatsapp_auto_reply'] }), conversation_json: '[]' }]));
  store['Check Existing Design'] = run('check-existing-design.js', items([{ task_type: 'edg_design', lead_id: 'other' }]));
  assert.strictEqual(store['Check Existing Design'][0].already, false);
  assert.strictEqual(run('check-existing-design.js', items([{ task_type: 'edg_design', lead_id: 'lead_x', status: 'open' }]))[0].already, true, 'once per lead');
  store['Load ATLAS Agent File'] = [{ content: Buffer.from('---\nname: atlas\n---\n# ATLAS — EDG & CRM SYSTEMS ARCHITECT\nYou are ATLAS').toString('base64') }];
  store['Compose ATLAS Prompt'] = run('compose-atlas-prompt.js', items([{}]));
  assert.strictEqual(store['Compose ATLAS Prompt'][0].agent_file_source, 'github');
  assert.ok(/^# ATLAS — EDG & CRM SYSTEMS ARCHITECT/.test(store['Compose ATLAS Prompt'][0].system_prompt) && /CHECKPOINT 1/.test(store['Compose ATLAS Prompt'][0].system_prompt));
  store['Finalize ATLAS'] = run('finalize-atlas.js', items([{ error: { message: 'Payment required' } }]));
  assert.strictEqual(store['Finalize ATLAS'][0].files.length, 5); assert.ok(/ATLAS checkpoint 1/.test(store['Finalize ATLAS'][0].email_html));
  store['Files to Write'] = run('files-to-write.js', items([{}]));
  assert.strictEqual(store['Files to Write'].length, 5);
  const modes = run('create-or-edit.js', items([{ sha: 'abc' }, { error: 'Not Found' }, {}, {}, {}])).map((x) => x.mode);
  assert.deepStrictEqual(modes, ['edit', 'create', 'create', 'create', 'create']);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (process.env.SHOW_RESULT && mockRun) console.log('\nFINAL STRUCTURED RESULT (mock mode, John Tan):\n' + JSON.stringify(mockRun.fin.response, null, 2));
process.exit(failed ? 1 : 0);
