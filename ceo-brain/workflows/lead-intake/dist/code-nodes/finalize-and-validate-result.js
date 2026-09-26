var CB_OUTPUT_SCHEMA = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://ceo-brain.local/schemas/sales-qualification-output.schema.json","title":"SalesQualificationResult","description":"Production schema for Agent #1 (Sales Qualification). The model must return exactly this object. Unknown facts are null and listed in missing_information. Never invent values.","type":"object","additionalProperties":false,"required":["schema_version","lead_status","intent","lead_temperature","summary","extracted","missing_information","recommended_reply","questions_to_ask","next_action","follow_up_at","human_review_required","escalation_reasons","confidence","reasoning"],"properties":{"schema_version":{"type":"string","const":"1.0"},"lead_status":{"type":"string","enum":["NEW","CONTACTED","QUALIFYING","QUALIFIED","HOT","PROPOSAL_REQUIRED","HUMAN_REVIEW","WON","LOST","FOLLOW_UP"],"description":"Recommended status. WON/LOST are rejected from the AI and converted to HUMAN_REVIEW."},"intent":{"type":"string","enum":["ai_automation_enquiry","pricing_enquiry","support_request","partnership","vendor_or_job_pitch","spam","unclear"]},"lead_temperature":{"type":"string","enum":["cold","warm","hot"]},"summary":{"type":"string","maxLength":600},"extracted":{"type":"object","additionalProperties":false,"required":["company_name","contact_name","industry","company_size","problem","current_tools","lead_sources","current_follow_up_process","uses_whatsapp","uses_email","accounting_or_erp","desired_automation","users_needed","desired_outcome","budget","timeline","decision_maker"],"properties":{"company_name":{"type":["string","null"]},"contact_name":{"type":["string","null"]},"industry":{"type":["string","null"]},"company_size":{"type":["integer","null"],"description":"Head-count if stated (e.g. '25 agents' -> 25)"},"problem":{"type":["string","null"],"description":"The repetitive/manual work that hurts today"},"current_tools":{"type":"array","items":{"type":"string"}},"lead_sources":{"type":"array","items":{"type":"string"}},"current_follow_up_process":{"type":["string","null"]},"uses_whatsapp":{"type":["boolean","null"]},"uses_email":{"type":["boolean","null"]},"accounting_or_erp":{"type":"array","items":{"type":"string"}},"desired_automation":{"type":"array","items":{"type":"string"}},"users_needed":{"type":["integer","null"]},"desired_outcome":{"type":["string","null"]},"budget":{"type":["string","null"]},"timeline":{"type":["string","null"]},"decision_maker":{"type":["boolean","null"]}}},"missing_information":{"type":"array","items":{"type":"string","enum":["company_name","contact_name","industry","company_size","problem","current_tools","lead_sources","current_follow_up_process","uses_whatsapp","uses_email","accounting_or_erp","desired_automation","users_needed","desired_outcome","budget","timeline","decision_maker","contact_phone","contact_email"]}},"recommended_reply":{"type":"string","maxLength":1500,"description":"Customer-facing draft. Max 3 questions. No prices, no guarantees, no contracts."},"questions_to_ask":{"type":"array","maxItems":3,"items":{"type":"string"}},"next_action":{"type":"string","enum":["send_reply","ask_qualifying_questions","book_discovery_call","request_proposal_approval","human_review","schedule_follow_up","close_lost","no_action"]},"follow_up_at":{"type":["string","null"],"format":"date-time"},"human_review_required":{"type":"boolean"},"escalation_reasons":{"type":"array","items":{"type":"string"}},"confidence":{"type":"number","minimum":0,"maximum":1},"reasoning":{"type":"string","maxLength":800}}};
var CB_LEAD_STATUS = {"$comment":"Lead lifecycle statuses and the transitions the system may recommend. WON and LOST are human-only.","statuses":["NEW","CONTACTED","QUALIFYING","QUALIFIED","HOT","PROPOSAL_REQUIRED","HUMAN_REVIEW","WON","LOST","FOLLOW_UP"],"ai_may_set":["CONTACTED","QUALIFYING","QUALIFIED","HOT","PROPOSAL_REQUIRED","HUMAN_REVIEW","FOLLOW_UP"],"human_only":["WON","LOST"],"transitions":{"NEW":["CONTACTED","QUALIFYING","QUALIFIED","HOT","PROPOSAL_REQUIRED","HUMAN_REVIEW","FOLLOW_UP","LOST"],"CONTACTED":["QUALIFYING","QUALIFIED","HOT","PROPOSAL_REQUIRED","HUMAN_REVIEW","FOLLOW_UP","LOST"],"QUALIFYING":["QUALIFYING","QUALIFIED","HOT","PROPOSAL_REQUIRED","HUMAN_REVIEW","FOLLOW_UP","LOST"],"QUALIFIED":["QUALIFIED","HOT","PROPOSAL_REQUIRED","HUMAN_REVIEW","FOLLOW_UP","WON","LOST"],"HOT":["HOT","QUALIFIED","PROPOSAL_REQUIRED","HUMAN_REVIEW","FOLLOW_UP","WON","LOST"],"PROPOSAL_REQUIRED":["PROPOSAL_REQUIRED","HUMAN_REVIEW","FOLLOW_UP","HOT","WON","LOST"],"HUMAN_REVIEW":["HUMAN_REVIEW","QUALIFYING","QUALIFIED","HOT","PROPOSAL_REQUIRED","FOLLOW_UP","WON","LOST"],"FOLLOW_UP":["FOLLOW_UP","CONTACTED","QUALIFYING","QUALIFIED","HOT","PROPOSAL_REQUIRED","HUMAN_REVIEW","LOST"],"WON":["WON"],"LOST":["LOST","FOLLOW_UP"]}};
var PP_VERSION = 'postprocess-v1';
var PP_FORBIDDEN_REPLY = [
  [/(s?\$|\b(sgd|usd|rm))\s?\d/i, 'reply_contains_price'],
  [/\b\d+\s?%\s?(off|discount)/i, 'reply_contains_discount'],
  [/\b(guarantee[ds]?|guaranteed|100%)\b/i, 'reply_contains_guarantee'],
  [/\b(refund|money back|chargeback)/i, 'reply_mentions_refund'],
  [/\b(contract|agreement|terms and conditions|sign (here|now|the))\b/i, 'reply_mentions_contract'],
  [/\b(we will deploy|go live on|deployed by|launch(ed)? on)\b/i, 'reply_commits_to_deployment_date'],
  [/\b(password|api key|token|credential)s?\b/i, 'reply_mentions_credentials']
];
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
  var allowed = CB_LEAD_STATUS.transitions[prev] || CB_LEAD_STATUS.transitions.NEW;
  var to = result.lead_status;
  if (allowed.indexOf(to) === -1) { notes.push('transition_rejected:' + prev + '->' + to); to = prev === 'WON' || prev === 'LOST' ? prev : 'HUMAN_REVIEW'; result.lead_status = to; result.human_review_required = true; if (result.escalation_reasons.indexOf('invalid_status_transition') === -1) result.escalation_reasons.push('invalid_status_transition'); }
  var statusChange = { from: prev, to: to, changed: prev !== to };
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
function wbStr(v, max) {
  if (v === undefined || v === null) return null;
  var s = String(v).replace(/\s+/g, ' ').trim();
  if (!s) return null;
  return max && s.length > max ? s.slice(0, max) : s;
}
var WB_MEDICAL_RE = /\b(doctor|doctors|dr\.?|clinic|clinics|dental|dentist|orthodont\w*|aesthetic (clinic|practice)|medical|physician|specialist|surgeon|surgery|healthcare|health care|hospital|physio(therapy)?|chiropract\w*|tcm|traditional chinese medicine|dermatolog\w*|paediatric\w*|pediatric\w*|gynae\w*|gynec\w*|cardiolog\w*|oncolog\w*|ophthalmolog\w*|optometr\w*|patients?)\b/i;
function wbDetectMode(text, industry) {
  var t = String(text || '') + ' ' + String(industry || '');
  return WB_MEDICAL_RE.test(t) ? 'medical' : 'sme';
}
var WB_CATEGORY_RULES = [
  ['healthcare', WB_MEDICAL_RE],
  ['automotive', /\b(dealership|car dealer|showroom|automotive|vehicles?|test drive|bmw|mercedes|toyota|honda|audi|tesla|motors?|car workshop|auto)\b/i],
  ['beauty', /\b(salon|spa|beauty|nail|lash|brow|facial|hair(dress|cut|style)|barber|massage|wellness|aesthetic)\b/i],
  ['property', /\b(property|real estate|realtor|condo|hdb|landed|listing|tenant|landlord|rental)\b/i],
  ['food_beverage', /\b(restaurant|cafe|café|bakery|catering|hawker|bar\b|bistro|kitchen|food|menu|f&b)\b/i],
  ['logistics', /\b(logistic\w*|delivery|deliveries|courier|freight|shipping|shipment|parcel|warehouse|driver|fleet|last.mile)\b/i],
  ['construction', /\b(construction|builders?|building contractor|main contractor|general contractor|civil (engineering|works)|design (and|&) build|site works|scaffold\w*|excavat\w*|piling|steel structure|structural works|a&a works|fit-?out)\b/i],
  ['home_services', /\b(plumb\w*|electric(ian|al)s?|aircon|air-con|renovat\w*|contractors?|cleaning|pest|handyman|movers?|moving|landscap\w*|roofing|roofers?|painters?)\b/i],
  ['education', /\b(tuition|tutor|school|academy|course|training centre|enrichment|students?|learning|kindergarten|preschool)\b/i],
  ['retail', /\b(retail|shop|store|boutique|products?|merchandise|e-?commerce|online store)\b/i],
  ['technology', /\b(software|saas|app\b|platform|startup|tech|it services|cybersecurity|cloud)\b/i],
  ['consulting', /\b(consult(ing|ants?|ancy)|advisory|advisor|strategy firm)\b/i],
  ['professional_services', /\b(law firm|lawyer|legal|accountant|accounting firm|audit|tax|architect|engineering firm|insurance|financial advis\w*|corporate secretar\w*)\b/i],
  ['b2b', /\b(manufactur\w*|factory|wholesale\w*|suppliers?|distributors?|industrial|b2b|oem|fabricat\w*|precision)\b/i]
];
function wbDetectCategory(text, industry) {
  var t = String(text || '') + ' ' + String(industry || '');
  for (var i = 0; i < WB_CATEGORY_RULES.length; i++) if (WB_CATEGORY_RULES[i][1].test(t)) return WB_CATEGORY_RULES[i][0];
  return /\b(local|neighbourhood|neighborhood|heartland)\b/i.test(t) ? 'local_business' : 'other';
}
function wbDetectSiteType(text) {
  if (/online store|e-?commerce|sell (products )?online|shop online|webshop|checkout/i.test(text)) return 'online_store';
  if (/landing page|\bfunnels?\b|squeeze page|opt-?in page|sales page|lead magnet/i.test(text)) return 'landing_page';
  if (/customer portal|client portal|patient portal|\bportal\b/i.test(text)) return 'portal';
  if (/web ?app|dashboard|log ?in|track(ing)? (shipments|orders|deliver)|booking system|online system/i.test(text)) return 'web_app';
  if (/web ?site|homepage|web ?page/i.test(text)) return 'business_website';
  return 'other';
}
function wbDetectGoal(text, mode) {
  if (mode === 'medical' && /book|appointment|consult/i.test(text)) return 'bookings';
  if (/book(ing)?|appointment|reserv/i.test(text)) return 'bookings';
  if (/sell|order|checkout|online store|e-?commerce/i.test(text)) return 'sales';
  if (/enquir|inquir|lead|quote|quotation|contact us|whatsapp|request/i.test(text)) return 'leads';
  if (/support|faq|help ?desk/i.test(text)) return 'support';
  if (/information|about us|showcase|portfolio|brochure/i.test(text)) return 'information';
  return mode === 'medical' ? 'bookings' : 'leads';
}
function wbGuessBusinessName(input, text) {
  if (input.company_name) return wbStr(input.company_name, 160);
  var m = text.match(/\b(?:[Ww]e are|[Ww]e're|[Ii] run|[Ii] own|[Mm]y company is|[Oo]ur company is|company called|clinic called|[Oo]ur clinic is|[Ii]'m from|[Ii] am from|[Ii]'m [A-Z][a-z]+ from|[Ii] am [A-Z][a-z]+ from|calling from|[Tt]his is [A-Z][a-z]+ from)\s+([A-Z][\w&'.\- ]{2,60}?(?:Pte\.? Ltd\.?|Ltd\.?|LLP|Inc\.?|Co\.?|Clinic|Dental|Medical|Motors|Group|Agency|Studio)?)(?=[,.\n]| and | with | that | in | based |; )/);
  return m ? wbStr(m[1], 160) : null;
}
var WI_VERSION = 'website-intake-1.1.0';
var WI_WEBSITE_RE = /\b(website|web ?site|landing page|(sales |lead |marketing )?funnels?|sales page|web ?app|online store|e-?commerce (site|store|website)|web portal|customer portal|homepage|web ?page|mock-?up|mockup)\b/i;
var WI_PURPOSE_RE = /\b(book|booking|bookings|appointment|appointments|test drive|reserv\w*|sell|selling|order|orders|checkout|shop online|enquir\w*|inquir\w*|quote|quotes|quotation|contact us|whatsapp|showcase|portfolio|brochure|browse|catalogue|catalog|menu|sign ?up|register|apply|download|learn about|information about|about us|our services|services page|pages?)\b/i;
var WI_EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
var WI_PHONE_RE = /(?:\+65[\s-]?)?(?:[689]\d{3}[\s-]?\d{4})\b/;
var WI_STARTED_MARK = 'building your first mock-up';
function wiClean(v, max) {
  if (v === undefined || v === null) return null;
  var s = String(v).replace(/\s+/g, ' ').trim();
  return s ? (max ? s.slice(0, max) : s) : null;
}
function wiCustomerText(history, message) {
  var parts = [];
  var h = Array.isArray(history) ? history : [];
  for (var i = 0; i < h.length; i++) if (h[i] && h[i].role !== 'agent' && h[i].content) parts.push(String(h[i].content));
  if (message) parts.push(String(message));
  return parts.join('\n');
}
function wiAgentText(history) {
  var parts = [];
  var h = Array.isArray(history) ? history : [];
  for (var i = 0; i < h.length; i++) if (h[i] && h[i].role === 'agent' && h[i].content) parts.push(String(h[i].content));
  return parts.join('\n');
}
/**
 * wbIntake({ text | history+message, company_name, industry, contact_name, phone, email, channel, extracted })
 *  -> { topic, ready, missing, questions, reply, details, email, phone }
 */
function wbIntake(o) {
  o = o || {};
  var text = typeof o.text === 'string' ? o.text : wiCustomerText(o.history, o.message);
  var ex = (o.extracted && typeof o.extracted === 'object') ? o.extracted : {};
  var topic = typeof o.text === 'string' ? WI_WEBSITE_RE.test(text) : (WI_WEBSITE_RE.test(String(o.message || '')) || wbIntakeInProgress(o.history));
  var mode = wbDetectMode(text, o.industry || ex.industry);
  var category = wbDetectCategory(text, o.industry || ex.industry);
  var businessName = wiClean(o.company_name, 160) || wiClean(ex.company_name, 160) || wbGuessBusinessName({}, text);
  var industry = wiClean(o.industry, 80) || wiClean(ex.industry, 80) || (category !== 'other' ? category.replace(/_/g, ' ') : null);
  var siteType = wbDetectSiteType(text);
  var purposeKnown = WI_PURPOSE_RE.test(text) && siteType !== 'other';
  var goal = wbDetectGoal(text, mode);
  var emailInText = (text.match(WI_EMAIL_RE) || [null])[0];
  var phoneInText = (text.match(WI_PHONE_RE) || [null])[0];
  var email = wiClean(o.email) || (emailInText ? emailInText.toLowerCase() : null);
  var phone = wiClean(o.phone) || (phoneInText ? phoneInText.replace(/[\s-]/g, '') : null);
  if (phone && !/^\+/.test(phone)) phone = '+65' + phone.replace(/^65/, '');
  var contactKnown = !!(email || phone || o.channel === 'whatsapp');
  var missing = [];
  if (!businessName) missing.push('business_name');
  if (!industry) missing.push('industry');
  if (!purposeKnown) missing.push('site_purpose');
  if (!contactKnown) missing.push('contact');
  var noun = mode === 'medical' ? 'clinic' : 'business';
  var q = {
    business_name: 'What is the name of your ' + noun + '?',
    industry: 'What does the ' + noun + ' do, and who are your customers?',
    site_purpose: 'What should visitors be able to do on the site (enquire, book, buy, browse), and which pages do you need?',
    contact: 'Which WhatsApp number or email should I send the mock-up link to?'
  };
  var questions = [];
  for (var i = 0; i < missing.length && questions.length < 3; i++) questions.push(q[missing[i]]);
  var ready = topic && missing.length === 0;
  var first = wiClean(o.contact_name) ? String(o.contact_name).trim().split(' ')[0] : null;
  var greet = first ? 'Hi ' + first + ', ' : 'Hi, ';
  var reply;
  if (!topic) reply = '';
  else if (ready) {
    var to = phone ? phone : (email ? email : 'this chat');
    reply = greet + 'perfect, I have what I need for ' + businessName + '. Our website team is ' + WI_STARTED_MARK + ' now, in two versions for you to compare: a photo-led site and a cinematic scroll film site (our premium option). I will send both links to ' + to + ' in about 10 to 15 minutes. If you have a logo, brand colours or photos you want used, send them here and we will work them in.';
  } else {
    reply = greet + 'happy to get a first mock-up built for you' + (businessName ? ' at ' + businessName : '') + '. ' + (questions.length === 1 ? 'One thing I need: ' : 'A few quick details so it is right the first time: ') + questions.join(' ');
  }
  return {
    version: WI_VERSION, topic: topic, ready: ready, missing: missing, questions: questions,
    reply: reply.replace(/\s+/g, ' ').trim(),
    details: { business_name: businessName, industry: industry, site_type: siteType, goal: goal, category: category, mode: mode },
    email: email, phone: phone
  };
}
/** True when John already asked the intake questions in an earlier turn. */
function wbIntakeInProgress(history) {
  return wiAgentText(history).toLowerCase().indexOf('first mock-up built for you') !== -1;
}
/** True when John already told this customer the build has started (marker in an agent turn). */
function wbBuildAlreadyStarted(history) {
  return wiAgentText(history).toLowerCase().indexOf(WI_STARTED_MARK) !== -1;
}
// ---- n8n glue ----
function cbMakeId(prefix) { return prefix + '_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36); }
const ctx = $('Resolve Lead Identity').first().json;
const inp = ($input.first() && $input.first().json) || {};
const rulesNode = $('Rule-Based Qualification (baseline / fallback)').first().json;
const rulesResult = rulesNode.result;
let provider = 'anthropic', model = ctx.config.model, rawText = null, result = null, error = null, usage = null, fallbackReason = null;
if (inp.source === 'rules') { provider = 'rules'; model = inp.model; result = inp.result; fallbackReason = inp.reason; }
else if (inp.error) { error = 'model_error: ' + String(inp.error.message || inp.error.description || JSON.stringify(inp.error)).slice(0, 300); }
else {
  model = inp.model || model;
  usage = inp.usage || null;
  if (typeof inp.text === 'string' && inp.text.trim()) rawText = inp.text;
  else if (Array.isArray(inp.content)) rawText = inp.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('\n');
  else if (typeof inp.output === 'string') rawText = inp.output;
  else if (typeof inp === 'string') rawText = inp;
  if (!rawText) error = 'empty_model_output';
}
const fin = finalizeResult({ lead: ctx.lead, previous_status: ctx.previous_status, now: new Date().toISOString(), provider, model, raw_text: rawText, result, error, rules_result: rulesResult });
if (provider === 'rules' && !fin.fallback_reason) fin.fallback_reason = fallbackReason;
const finishedAt = new Date().toISOString();
const latencyMs = Math.max(0, new Date(finishedAt).getTime() - new Date(ctx.now).getTime());
const r = fin.result;
const approvalNeeded = r.human_review_required || r.next_action === 'request_proposal_approval';
const sendChannel = ctx.lead.channel === 'email' ? 'email' : (ctx.lead.channel === 'whatsapp' ? 'whatsapp' : null);
const sendTo = sendChannel === 'email' ? ctx.lead.email : (sendChannel === 'whatsapp' ? ctx.lead.phone : null);
const autoSend = !approvalNeeded && ctx.config.auto_send_low_risk === true && !ctx.lead.test_mode && !!sendChannel && !!sendTo && !!r.recommended_reply;
// Website intake + hand-off (Ryan, 2026-09-25: zero approvals). When the customer asks for a site or a
// mock-up, John collects the four details; once he has them the Website Builder is called and builds.
const notPitch = r.intent !== 'spam' && r.intent !== 'vendor_or_job_pitch';
const histAll = Array.isArray(ctx.lead.conversation_history) ? ctx.lead.conversation_history : [];
const intake = wbIntake({ history: histAll, message: ctx.lead.message, company_name: ctx.lead.company_name || r.extracted.company_name, industry: ctx.lead.industry || r.extracted.industry, contact_name: ctx.lead.contact_name || r.extracted.contact_name, phone: ctx.lead.phone, email: ctx.lead.email, channel: ctx.lead.channel, extracted: r.extracted });
const buildStarted = wbBuildAlreadyStarted(histAll);
const websiteTopic = notPitch && intake.topic;
const websiteRequested = websiteTopic && intake.ready && !buildStarted;
if (websiteTopic && !buildStarted && !approvalNeeded && r.recommended_reply) r.recommended_reply = intake.reply;
const contactFound = { email: intake.email || null, phone: intake.phone || null };
const handoffs = websiteRequested ? ['website-builder'] : [];
const followUpTask = {
  task_id: cbMakeId('task'),
  task_type: approvalNeeded ? 'approval' : (r.next_action === 'book_discovery_call' ? 'call' : 'follow_up'),
  title: (approvalNeeded ? 'APPROVAL: ' : 'Follow up: ') + (ctx.lead.contact_name || 'lead') + (ctx.lead.company_name ? ' @ ' + ctx.lead.company_name : '') + ' — ' + r.next_action.replace(/_/g, ' '),
  description: r.summary + (r.escalation_reasons.length ? ' | Escalation: ' + r.escalation_reasons.join(', ') : ''),
  due_at: r.follow_up_at,
  status: 'open',
  assigned_to: approvalNeeded ? 'human' : 'sales-agent',
  requires_approval: approvalNeeded,
  approval_reason: r.escalation_reasons.join(', ')
};
const response = {
  ok: true,
  lead_id: ctx.lead.lead_id,
  tenant_id: ctx.lead.tenant_id,
  is_new_lead: ctx.is_new,
  test_mode: ctx.lead.test_mode,
  ai: { provider: fin.provider, model: fin.model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason, validation_errors: fin.validation_errors, latency_ms: latencyMs, usage },
  delivery: { auto_send: autoSend, channel: sendChannel, to: sendTo ? sendTo.replace(/(.{3}).+(.{2})/, '$1***$2') : null, mode: autoSend ? 'auto_send_low_risk' : (approvalNeeded ? 'awaiting_human_approval' : (ctx.lead.test_mode ? 'test_mode_no_send' : 'draft_only')) },
  status_change: fin.status_change,
  result: r,
  follow_up_task: followUpTask,
  audit: fin.audit,
  handoffs,
  website_intake: { topic: websiteTopic, ready: intake.ready, missing: intake.missing, build_started: buildStarted },
  execution_id: ctx.execution_id
};
return [{ json: {
  lead: ctx.lead, is_new: ctx.is_new, previous_status: ctx.previous_status, config: ctx.config,
  execution_id: ctx.execution_id, workflow_id: ctx.workflow_id,
  provider: fin.provider, model: fin.model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason,
  validation_errors: fin.validation_errors, status_change: fin.status_change, audit: fin.audit,
  result: r, run_id: cbMakeId('run'), message_id: cbMakeId('msg'), task: followUpTask,
  usage, started_at: ctx.now, finished_at: finishedAt, latency_ms: latencyMs,
  approval_needed: approvalNeeded, auto_send: autoSend, send_channel: sendChannel, send_to: sendTo,
  send_subject: 'Re: your enquiry to FusionTech AI', website_requested: websiteRequested, handoffs, response,
  website_intake: { topic: websiteTopic, ready: intake.ready, missing: intake.missing, build_started: buildStarted, details: intake.details }, contact_found: contactFound
} }];
