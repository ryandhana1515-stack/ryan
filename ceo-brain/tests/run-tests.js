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
const codeOf = (f) => fs.readFileSync(path.join(distDir, f), 'utf8');

function runCodeNode(file, inputItems, nodeOutputs) {
  const $input = { first: () => inputItems[0], all: () => inputItems };
  const $ = (name) => { if (!nodeOutputs[name]) throw new Error('simulation: node "' + name + '" has no output'); return { first: () => ({ json: nodeOutputs[name] }), item: { json: nodeOutputs[name] } }; };
  const ctx = { $input, $, $execution: { id: 'sim-exec' }, $workflow: { id: 'sim-wf' }, JSON, Math, Date, Number, String, Array, Object, parseInt, parseFloat, isNaN, RegExp, console };
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

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (process.env.SHOW_RESULT && mockRun) console.log('\nFINAL STRUCTURED RESULT (mock mode, John Tan):\n' + JSON.stringify(mockRun.fin.response, null, 2));
process.exit(failed ? 1 : 0);
