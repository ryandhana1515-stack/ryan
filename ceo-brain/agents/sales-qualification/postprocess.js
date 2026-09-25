// Finalizes an agent result: parses raw LLM text, validates it against the
// output schema, applies non-negotiable guardrails, validates the status
// transition, and computes follow_up_at. Pure functions, no I/O, no require().
// Expects two globals to be defined before this file when inlined into n8n:
//   CB_OUTPUT_SCHEMA  (schemas/sales-qualification-output.schema.json)
//   CB_LEAD_STATUS    (schemas/lead-status.json)
// tests/ and build.js inject them; see the bottom of this file for the
// module wrapper that loads them in Node.

var PP_VERSION = 'postprocess-v1';

// Reply-side guardrail: things the AI must never commit to in customer text.
var PP_FORBIDDEN_REPLY = [
  [/(s?\$|\b(sgd|usd|rm))\s?\d/i, 'reply_contains_price'],
  [/\b\d+\s?%\s?(off|discount)/i, 'reply_contains_discount'],
  [/\b(guarantee[ds]?|guaranteed|100%)\b/i, 'reply_contains_guarantee'],
  [/\b(refund|money back|chargeback)/i, 'reply_mentions_refund'],
  [/\b(contract|agreement|terms and conditions|sign (here|now|the))\b/i, 'reply_mentions_contract'],
  [/\b(we will deploy|go live on|deployed by|launch(ed)? on)\b/i, 'reply_commits_to_deployment_date'],
  [/\b(password|api key|token|credential)s?\b/i, 'reply_mentions_credentials']
];
// Message-side guardrail: customer asks that need a human before any commitment.
var PP_ESCALATE_ON_MESSAGE = [
  [/\b(refund|chargeback|money back)\b/i, 'customer_requests_refund'],
  [/\b(contract|agreement|nda|sign)\b/i, 'customer_mentions_contract'],
  [/\b(lawyer|legal|sue\b|lawsuit|complain(t)? to)/i, 'customer_mentions_legal'],
  [/\b(final price|best price|fixed price|lock(ed)? in|confirm the price)\b/i, 'customer_requests_price_commitment'],
  [/\b(delete my (data|account)|gdpr|pdpa)\b/i, 'customer_data_request'],
  [/\b(pay(ment)?|invoice|deposit|bank transfer|paynow)\b/i, 'customer_mentions_payment']
];

var PP_FOLLOW_UP_HOURS = { HOT: 4, PROPOSAL_REQUIRED: 8, HUMAN_REVIEW: 2, QUALIFIED: 24, QUALIFYING: 48, CONTACTED: 48, NEW: 24, FOLLOW_UP: 72, WON: null, LOST: null };

function ppStripFences(text) {
  var s = String(text || '').trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  var a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a !== -1 && b > a) s = s.slice(a, b + 1);
  return s;
}

function ppParse(text) {
  try { return { ok: true, value: JSON.parse(ppStripFences(text)) }; }
  catch (e) { return { ok: false, error: 'invalid_json: ' + (e && e.message ? e.message : String(e)) }; }
}

function ppType(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
  return typeof v;
}
function ppTypeOk(v, t) {
  var types = Array.isArray(t) ? t : [t];
  var actual = ppType(v);
  for (var i = 0; i < types.length; i++) {
    if (types[i] === actual) return true;
    if (types[i] === 'number' && actual === 'integer') return true;
  }
  return false;
}

// Minimal JSON-schema checker covering what the output schema uses:
// type, enum, const, required, properties, additionalProperties, items, maxLength, maxItems, minimum, maximum.
function ppValidate(schema, value, path, errors) {
  path = path || '$'; errors = errors || [];
  if (schema.const !== undefined && value !== schema.const) errors.push(path + ' must equal ' + JSON.stringify(schema.const));
  if (schema.type && !ppTypeOk(value, schema.type)) { errors.push(path + ' expected ' + JSON.stringify(schema.type) + ' got ' + ppType(value)); return errors; }
  if (schema.enum && schema.enum.indexOf(value) === -1) errors.push(path + ' not in enum: ' + JSON.stringify(value));
  if (typeof value === 'string' && schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(path + ' longer than ' + schema.maxLength);
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(path + ' below minimum');
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(path + ' above maximum');
  }
  if (Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(path + ' has more than ' + schema.maxItems + ' items');
    if (schema.items) for (var i = 0; i < value.length; i++) ppValidate(schema.items, value[i], path + '[' + i + ']', errors);
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    var props = schema.properties || {};
    if (schema.required) for (var r = 0; r < schema.required.length; r++) if (!(schema.required[r] in value)) errors.push(path + ' missing required ' + schema.required[r]);
    for (var k in value) {
      if (props[k]) ppValidate(props[k], value[k], path + '.' + k, errors);
      else if (schema.additionalProperties === false) errors.push(path + ' unexpected property ' + k);
    }
  }
  return errors;
}

// Gentle coercion of common LLM slips before strict validation.
function ppCoerce(o) {
  if (!o || typeof o !== 'object') return o;
  o.schema_version = '1.0';
  if (typeof o.lead_status === 'string') o.lead_status = o.lead_status.toUpperCase().trim();
  if (typeof o.intent === 'string') o.intent = o.intent.toLowerCase().trim();
  if (typeof o.lead_temperature === 'string') o.lead_temperature = o.lead_temperature.toLowerCase().trim();
  if (typeof o.next_action === 'string') o.next_action = o.next_action.toLowerCase().trim();
  if (typeof o.human_review_required === 'string') o.human_review_required = o.human_review_required === 'true';
  if (typeof o.confidence === 'string') o.confidence = parseFloat(o.confidence);
  if (o.follow_up_at === '' || o.follow_up_at === 'null') o.follow_up_at = null;
  if (o.recommended_reply === null) o.recommended_reply = '';
  if (o.reasoning === null) o.reasoning = '';
  if (o.summary === null) o.summary = '';
  if (!Array.isArray(o.questions_to_ask)) o.questions_to_ask = [];
  if (!Array.isArray(o.escalation_reasons)) o.escalation_reasons = [];
  if (!Array.isArray(o.missing_information)) o.missing_information = [];
  if (o.extracted && typeof o.extracted === 'object') {
    var e = o.extracted;
    var arrays = ['current_tools', 'lead_sources', 'accounting_or_erp', 'desired_automation'];
    for (var a = 0; a < arrays.length; a++) if (!Array.isArray(e[arrays[a]])) e[arrays[a]] = e[arrays[a]] ? [String(e[arrays[a]])] : [];
    var ints = ['company_size', 'users_needed'];
    for (var n = 0; n < ints.length; n++) {
      if (typeof e[ints[n]] === 'string') { var p = parseInt(e[ints[n]].replace(/\D/g, ''), 10); e[ints[n]] = isNaN(p) ? null : p; }
      if (typeof e[ints[n]] === 'number' && !Number.isInteger(e[ints[n]])) e[ints[n]] = Math.round(e[ints[n]]);
    }
    var bools = ['uses_whatsapp', 'uses_email', 'decision_maker'];
    for (var b = 0; b < bools.length; b++) if (typeof e[bools[b]] === 'string') e[bools[b]] = e[bools[b]] === 'true' ? true : e[bools[b]] === 'false' ? false : null;
    var strs = ['company_name', 'contact_name', 'industry', 'problem', 'current_follow_up_process', 'desired_outcome', 'budget', 'timeline'];
    for (var s = 0; s < strs.length; s++) if (e[strs[s]] === '' || e[strs[s]] === 'unknown' || e[strs[s]] === 'null' || e[strs[s]] === undefined) e[strs[s]] = null;
    var required = CB_OUTPUT_SCHEMA.properties.extracted.required;
    for (var q = 0; q < required.length; q++) if (!(required[q] in e)) e[required[q]] = arrays.indexOf(required[q]) !== -1 ? [] : null;
  }
  return o;
}

function ppAddHours(iso, hours) {
  var d = new Date(iso); d.setTime(d.getTime() + hours * 3600 * 1000); return d.toISOString();
}

/**
 * finalizeResult(input) -> { result, provider, model, valid, fallback_used, fallback_reason, validation_errors, status_change, audit }
 * input: {
 *   lead, previous_status, now (ISO),
 *   provider ('anthropic'|'rules'|...), model,
 *   raw_text (LLM text) | result (already-structured object),
 *   rules_result (SalesQualificationResult from rules.js, used as fallback)
 * }
 */
function finalizeResult(input) {
  input = input || {};
  var lead = input.lead || {};
  var now = input.now || new Date().toISOString();
  var prev = input.previous_status || 'NEW';
  var provider = input.provider || 'unknown';
  var model = input.model || 'unknown';
  var notes = [];
  var validationErrors = [];
  var fallbackUsed = false;
  var fallbackReason = null;
  var result = null;

  if (input.result && typeof input.result === 'object') result = input.result;
  else if (input.raw_text) {
    var parsed = ppParse(input.raw_text);
    if (parsed.ok) result = parsed.value; else fallbackReason = parsed.error;
  } else fallbackReason = input.error || 'no_model_output';

  if (result) {
    result = ppCoerce(result);
    validationErrors = ppValidate(CB_OUTPUT_SCHEMA, result);
    if (validationErrors.length) { fallbackReason = 'schema_validation_failed'; result = null; }
  }
  if (!result) {
    if (!input.rules_result) return { result: null, valid: false, provider: provider, model: model, fallback_used: false, fallback_reason: fallbackReason, validation_errors: validationErrors, status_change: null, audit: ['no_result_and_no_fallback'] };
    result = JSON.parse(JSON.stringify(input.rules_result));
    fallbackUsed = true; provider = 'rules'; model = 'rules-v1';
    notes.push('fallback_to_rules:' + fallbackReason);
  }

  // ---- Guardrails (non-negotiable, applied to every provider) ----
  var reasons = result.escalation_reasons.slice();
  function esc(r) { if (reasons.indexOf(r) === -1) reasons.push(r); }
  for (var i = 0; i < PP_FORBIDDEN_REPLY.length; i++) if (PP_FORBIDDEN_REPLY[i][0].test(result.recommended_reply)) esc(PP_FORBIDDEN_REPLY[i][1]);
  var msgText = [lead.message || ''].concat((lead.conversation_history || []).filter(function (m) { return m.role === 'customer'; }).map(function (m) { return m.content; })).join('\n');
  for (var j = 0; j < PP_ESCALATE_ON_MESSAGE.length; j++) if (PP_ESCALATE_ON_MESSAGE[j][0].test(msgText)) esc(PP_ESCALATE_ON_MESSAGE[j][1]);
  if (CB_LEAD_STATUS.human_only.indexOf(result.lead_status) !== -1) { esc('ai_attempted_' + result.lead_status.toLowerCase() + '_status'); result.lead_status = 'HUMAN_REVIEW'; }
  if (result.lead_status === 'PROPOSAL_REQUIRED') esc('proposal_or_pricing_requires_approval');
  if (result.next_action === 'request_proposal_approval') esc('proposal_or_pricing_requires_approval');
  if (result.next_action === 'close_lost' && result.intent !== 'spam') esc('close_lost_requires_human_confirmation');
  if (result.confidence < 0.4) esc('low_confidence');
  if (result.questions_to_ask.length > 3) result.questions_to_ask = result.questions_to_ask.slice(0, 3);
  var replyBlocked = false;
  for (var g = 0; g < PP_FORBIDDEN_REPLY.length; g++) if (reasons.indexOf(PP_FORBIDDEN_REPLY[g][1]) !== -1) replyBlocked = true;
  if (replyBlocked) { notes.push('reply_withheld_by_guardrail'); result.recommended_reply = ''; }
  result.escalation_reasons = reasons;
  if (reasons.length) { result.human_review_required = true; if (result.lead_status !== 'PROPOSAL_REQUIRED') result.lead_status = 'HUMAN_REVIEW'; if (result.next_action !== 'request_proposal_approval' && result.next_action !== 'close_lost') result.next_action = 'human_review'; }
  if (lead.test_mode) notes.push('test_mode:no_customer_contact');

  // ---- Status transition audit ----
  var allowed = CB_LEAD_STATUS.transitions[prev] || CB_LEAD_STATUS.transitions.NEW;
  var to = result.lead_status;
  if (allowed.indexOf(to) === -1) { notes.push('transition_rejected:' + prev + '->' + to); to = prev === 'WON' || prev === 'LOST' ? prev : 'HUMAN_REVIEW'; result.lead_status = to; result.human_review_required = true; if (result.escalation_reasons.indexOf('invalid_status_transition') === -1) result.escalation_reasons.push('invalid_status_transition'); }
  var statusChange = { from: prev, to: to, changed: prev !== to };

  // ---- Follow-up scheduling ----
  if (!result.follow_up_at) {
    var h = PP_FOLLOW_UP_HOURS[to];
    result.follow_up_at = (h === null || h === undefined) ? null : ppAddHours(now, h);
  } else {
    var d = new Date(result.follow_up_at);
    if (isNaN(d.getTime())) { notes.push('follow_up_at_invalid_replaced'); result.follow_up_at = ppAddHours(now, PP_FOLLOW_UP_HOURS[to] || 24); }
    else result.follow_up_at = d.toISOString();
  }

  return { result: result, valid: true, provider: provider, model: model, fallback_used: fallbackUsed, fallback_reason: fallbackReason, validation_errors: validationErrors, status_change: statusChange, audit: notes, postprocess_version: PP_VERSION };
}

// ---- Node module wrapper (stripped by build.js when inlined into n8n) ----
if (typeof module !== 'undefined' && typeof require === 'function' && typeof CB_OUTPUT_SCHEMA === 'undefined') {
  global.CB_OUTPUT_SCHEMA = require('../../schemas/sales-qualification-output.schema.json');
  global.CB_LEAD_STATUS = require('../../schemas/lead-status.json');
}
module.exports = { finalizeResult: finalizeResult, ppParse: ppParse, ppValidate: ppValidate, ppCoerce: ppCoerce, PP_VERSION: PP_VERSION };
