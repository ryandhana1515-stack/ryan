// Deterministic rule-based qualification. Used (a) in TEST/mock mode, (b) as the
// fallback when the LLM is unavailable or returns invalid JSON. It produces the
// same schema as the LLM (schemas/sales-qualification-output.schema.json).
// Pure functions, no I/O, no require().

var RB_VERSION = 'rules-v1';

var RB_INDUSTRY = [
  [/property|real estate|realtor|agency with .*agents|condo|hdb|landed/i, 'real_estate'],
  [/clinic|dental|aesthetic|medical|doctor|physio|tcm/i, 'healthcare'],
  [/restaurant|cafe|f&b|food|catering|bakery/i, 'food_and_beverage'],
  [/e-?commerce|shopify|online store|lazada|shopee|tiktok shop/i, 'ecommerce'],
  [/law firm|legal|lawyer/i, 'legal'],
  [/accounting|bookkeeping|tax|audit firm/i, 'accounting'],
  [/renovation|contractor|interior|construction/i, 'construction'],
  [/tuition|school|education|academy|training/i, 'education'],
  [/insurance|financial advis|wealth/i, 'financial_services'],
  [/logistics|freight|delivery|warehouse/i, 'logistics'],
  [/salon|spa|beauty|gym|fitness/i, 'wellness_and_beauty'],
  [/saas|software|startup|tech company/i, 'technology']
];

var RB_TOOLS = [
  [/hubspot/i, 'HubSpot'], [/salesforce/i, 'Salesforce'], [/zoho/i, 'Zoho'], [/pipedrive/i, 'Pipedrive'],
  [/respond\.?io/i, 'respond.io'], [/excel|spreadsheet|google sheets?/i, 'Spreadsheets'],
  [/notion/i, 'Notion'], [/airtable/i, 'Airtable'], [/xero/i, 'Xero'], [/quickbooks/i, 'QuickBooks'],
  [/sap\b/i, 'SAP'], [/odoo/i, 'Odoo'], [/shopify/i, 'Shopify'], [/wordpress/i, 'WordPress'],
  [/gmail|outlook/i, 'Email client'], [/calendly/i, 'Calendly'], [/zapier|make\.com/i, 'Zapier/Make']
];
var RB_ERP = [[/xero/i, 'Xero'], [/quickbooks/i, 'QuickBooks'], [/sap\b/i, 'SAP'], [/odoo/i, 'Odoo'], [/netsuite/i, 'NetSuite'], [/myob/i, 'MYOB']];

var RB_SOURCES = [
  [/facebook|fb ads?|meta ads?/i, 'facebook'], [/instagram|ig\b/i, 'instagram'], [/tiktok/i, 'tiktok'],
  [/google ads?|seo|search/i, 'google'], [/website|landing page|web form/i, 'website'],
  [/referral|word of mouth|recommend/i, 'referral'], [/linkedin/i, 'linkedin'], [/propertyguru|99\.co/i, 'property_portal'],
  [/walk[- ]?in/i, 'walk_in'], [/cold call|telemarket/i, 'outbound_calls']
];

var RB_AUTOMATION = [
  [/\b(website|web ?site|landing page|web ?app|online store|e-?commerce (site|store|website)|web portal|customer portal|homepage|web ?page)\b/i, 'website_build'],
  [/whatsapp.*(reply|respond|answer|chat)|(reply|respond|answer).*whatsapp/i, 'whatsapp_auto_reply'],
  [/book(ing)? (an? )?appointment|schedule (a )?(call|meeting|viewing)|appointment/i, 'appointment_booking'],
  [/follow[- ]?up/i, 'lead_follow_up'],
  [/qualif/i, 'lead_qualification'],
  [/quote|quotation|proposal/i, 'quote_generation'],
  [/invoice|billing|payment reminder/i, 'invoicing'],
  [/customer (service|support)|faq|enquir/i, 'customer_support'],
  [/email/i, 'email_automation'],
  [/crm|pipeline/i, 'crm_sync'],
  [/content|social media post/i, 'content_generation'],
  [/report|dashboard/i, 'reporting']
];

var RB_SIZE = /(\d{1,5})\s*(agents?|staff|employees?|people|users?|pax|team members?|salespeople|reps?|advisers?|advisors?|drivers?|technicians?|consultants?)/i;
var RB_BUDGET = /(budget[^.\n]{0,40}?(\$|sgd|usd|rm|k\b)[\s\d,\.k]*|\b(s?\$|sgd|usd)\s?\d[\d,\.]*\s*(k|per month|\/month|monthly)?)/i;
var RB_TIMELINE = /(asap|urgent|immediately|this (week|month|quarter)|next (week|month|quarter)|within \d+ (days?|weeks?|months?)|by (end of )?(q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d+\s*(weeks?|months?) time)/i;
var RB_DECISION = /\b(i run|i own|my (company|business|agency|firm|clinic)|i am the (owner|founder|director|ceo|md)|i'm the (owner|founder|director|ceo|md)|founder|director|owner|ceo\b)/i;
var RB_NOT_DECISION = /\b(my boss|my manager|i need to check with|on behalf of|i work for)/i;
var RB_SPAM = /(seo services|backlinks|guest post|crypto|forex signals|loan approval|casino|lottery|unsubscribe|click here|http[s]?:\/\/[^\s]+\.(xyz|top|club)\b)/i;
var RB_PRICING = /(how much|price|pricing|cost|quote|quotation|rates?)\b/i;
var RB_SUPPORT = /(not working|broken|bug|error|issue with|help me fix|cancel my)/i;
var RB_PARTNER = /(partner(ship)?|reseller|white[- ]label|collaborat)/i;
var RB_VENDOR = /(we offer|our services|hire me|freelancer available|job application|resume|cv attached)/i;
var RB_NOT_INTERESTED = /(not interested|stop contacting|remove me|do not contact)/i;
var RB_CALL_LATER = /(call me (back )?(later|tomorrow|next week)|contact me (later|next)|get back to me (in|next))/i;
var RB_RISKY = /\b(refund|chargeback|lawyer|legal action|sue|contract|guarantee|discount|cheapest|deposit|pay(ment)? terms|money back|complain|complaint|angry|scam)\b/i;

function rbMatchAll(text, table) {
  var out = [];
  for (var i = 0; i < table.length; i++) if (table[i][0].test(text) && out.indexOf(table[i][1]) === -1) out.push(table[i][1]);
  return out;
}
function rbFirst(text, table) {
  for (var i = 0; i < table.length; i++) if (table[i][0].test(text)) return table[i][1];
  return null;
}
function rbHumanize(s) { return String(s).replace(/_/g, ' '); }

var RB_QUESTIONS = {
  problem: 'Which part of your day-to-day work is the most repetitive or manual right now?',
  lead_sources: 'Where do most of your enquiries come from today (Facebook, Instagram, website, referrals)?',
  current_follow_up_process: 'How are new enquiries followed up at the moment, and by whom?',
  current_tools: 'Which CRM or software do you use to track customers today?',
  uses_whatsapp: 'Do your customers mostly reach you on WhatsApp, email, or another channel?',
  desired_automation: 'If one task could run itself tomorrow, which one would you pick first?',
  company_size: 'Roughly how many people on your team would use the system?',
  desired_outcome: 'What result would make this a clear win for you in three months?',
  timeline: 'When would you like to have this running?',
  accounting_or_erp: 'Which accounting or back-office systems would this need to connect to?',
  budget: 'Do you have a rough budget range in mind so we can propose the right scope?',
  decision_maker: 'Will you be the one deciding on this, or is anyone else involved?',
  industry: 'What kind of business do you run?',
  company_name: 'What is the name of your company?',
  contact_email: 'What is the best email address to send a summary to?',
  contact_phone: 'What is the best number to reach you on WhatsApp?'
};
var RB_QUESTION_PRIORITY = ['problem', 'lead_sources', 'current_follow_up_process', 'current_tools', 'uses_whatsapp', 'desired_automation', 'company_size', 'desired_outcome', 'timeline', 'accounting_or_erp', 'decision_maker', 'budget'];

/**
 * classifyWithRules(lead) -> SalesQualificationResult (schema 1.0)
 * lead: the normalized lead object from normalize.js
 */
function classifyWithRules(lead) {
  lead = lead || {};
  var histText = (lead.conversation_history || []).map(function (m) { return m.content; }).join('\n');
  var text = [lead.message || '', histText, lead.company_name || '', lead.industry || ''].join('\n');
  var msg = lead.message || '';

  var extracted = {
    company_name: lead.company_name || null,
    contact_name: lead.contact_name || null,
    industry: lead.industry || rbFirst(text, RB_INDUSTRY),
    company_size: null,
    problem: null,
    current_tools: rbMatchAll(text, RB_TOOLS),
    lead_sources: rbMatchAll(text, RB_SOURCES),
    current_follow_up_process: null,
    uses_whatsapp: /whatsapp/i.test(text) ? true : null,
    uses_email: /\bemail/i.test(text) ? true : null,
    accounting_or_erp: rbMatchAll(text, RB_ERP),
    desired_automation: rbMatchAll(text, RB_AUTOMATION),
    users_needed: null,
    desired_outcome: null,
    budget: null,
    timeline: null,
    decision_maker: null
  };
  if (lead.lead_source && lead.lead_source !== 'unknown' && lead.lead_source !== 'other' && lead.lead_source !== 'test' && lead.lead_source !== 'manual' && extracted.lead_sources.indexOf(lead.lead_source) === -1) extracted.lead_sources.push(lead.lead_source);

  var sizeM = text.match(RB_SIZE);
  if (sizeM) { extracted.company_size = parseInt(sizeM[1], 10); extracted.users_needed = extracted.company_size; }
  var budM = text.match(RB_BUDGET); if (budM) extracted.budget = budM[0].trim();
  var tlM = text.match(RB_TIMELINE); if (tlM) extracted.timeline = tlM[0].trim();
  if (RB_NOT_DECISION.test(text)) extracted.decision_maker = false; else if (RB_DECISION.test(text)) extracted.decision_maker = true;

  // Problem statement: the sentence containing a pain word
  var sentences = msg.split(/(?<=[.!?])\s+/);
  for (var i = 0; i < sentences.length; i++) {
    if (/(don't|do not|doesn't|not|never|slow|miss|lost|manual|forget|too many|overwhelm|no time|late|struggl|waste)/i.test(sentences[i])) { extracted.problem = sentences[i].trim(); break; }
  }
  for (var j = 0; j < sentences.length; j++) {
    if (/(i want|we want|i need|we need|looking for|would like|goal|so that)/i.test(sentences[j])) { extracted.desired_outcome = sentences[j].trim(); break; }
  }
  if (/(follow[- ]?up).*(manual|whatsapp|call|excel|nobody|don't|do not)/i.test(text)) extracted.current_follow_up_process = 'manual (as described by prospect)';

  // Intent
  var intent = 'unclear';
  if (RB_SPAM.test(text) || RB_VENDOR.test(text)) intent = RB_VENDOR.test(text) && !RB_SPAM.test(text) ? 'vendor_or_job_pitch' : 'spam';
  else if (RB_PARTNER.test(text)) intent = 'partnership';
  else if (RB_SUPPORT.test(text)) intent = 'support_request';
  else if (extracted.desired_automation.length || /\b(ai|automat|chatbot|bot)\b/i.test(text)) intent = 'ai_automation_enquiry';
  else if (RB_PRICING.test(text)) intent = 'pricing_enquiry';
  if (intent === 'unclear' && RB_PRICING.test(text)) intent = 'pricing_enquiry';

  // Missing information
  var missing = [];
  var fields = ['company_name', 'contact_name', 'industry', 'company_size', 'problem', 'current_tools', 'lead_sources', 'current_follow_up_process', 'uses_whatsapp', 'uses_email', 'accounting_or_erp', 'desired_automation', 'users_needed', 'desired_outcome', 'budget', 'timeline', 'decision_maker'];
  for (var f = 0; f < fields.length; f++) {
    var v = extracted[fields[f]];
    if (v === null || (Array.isArray(v) && v.length === 0)) missing.push(fields[f]);
  }
  if (!lead.phone) missing.push('contact_phone');
  if (!lead.email) missing.push('contact_email');

  // Temperature
  var hasPain = !!extracted.problem;
  var hasWant = extracted.desired_automation.length > 0;
  var hasScale = extracted.company_size !== null || extracted.timeline !== null || extracted.budget !== null;
  var temperature = 'cold';
  if (hasPain && hasWant && hasScale && extracted.decision_maker !== false) temperature = 'hot';
  else if (hasPain || hasWant) temperature = 'warm';
  if (intent === 'spam' || intent === 'vendor_or_job_pitch') temperature = 'cold';

  // Escalation
  var escalation = [];
  var riskM = msg.match(RB_RISKY);
  if (riskM) escalation.push('customer_mentions_' + riskM[0].toLowerCase().replace(/\s+/g, '_'));
  if (intent === 'unclear' && temperature === 'cold' && !RB_NOT_INTERESTED.test(text)) escalation.push('intent_unclear');
  if (intent === 'support_request') escalation.push('existing_customer_support_request');
  if (intent === 'partnership') escalation.push('partnership_requires_human');
  var humanReview = escalation.length > 0;

  // Status + next action
  var status = 'QUALIFYING';
  var nextAction = 'ask_qualifying_questions';
  var keyKnown = hasPain && hasWant && extracted.company_size !== null;
  if (intent === 'spam' || intent === 'vendor_or_job_pitch') { status = 'LOST_CANDIDATE'; }
  if (RB_NOT_INTERESTED.test(text)) { status = 'LOST_CANDIDATE'; }
  if (status === 'LOST_CANDIDATE') { status = 'HUMAN_REVIEW'; nextAction = 'close_lost'; humanReview = true; escalation.push('close_lost_requires_human_confirmation'); }
  else if (humanReview) { status = 'HUMAN_REVIEW'; nextAction = 'human_review'; }
  else if (keyKnown && (RB_PRICING.test(text) || /proposal/i.test(text))) { status = 'PROPOSAL_REQUIRED'; nextAction = 'request_proposal_approval'; humanReview = true; escalation.push('proposal_or_pricing_requires_approval'); }
  else if (temperature === 'hot') { status = 'HOT'; nextAction = 'book_discovery_call'; }
  else if (keyKnown) { status = 'QUALIFIED'; nextAction = 'ask_qualifying_questions'; }
  else if (RB_CALL_LATER.test(text)) { status = 'FOLLOW_UP'; nextAction = 'schedule_follow_up'; }

  // Progressive questions (max 3)
  var questions = [];
  for (var q = 0; q < RB_QUESTION_PRIORITY.length && questions.length < 3; q++) {
    var key = RB_QUESTION_PRIORITY[q];
    if (missing.indexOf(key) !== -1 && RB_QUESTIONS[key]) questions.push(RB_QUESTIONS[key]);
  }
  if (questions.length < 3 && missing.indexOf('contact_phone') !== -1 && missing.indexOf('contact_email') !== -1) questions.push(RB_QUESTIONS.contact_phone);
  if (questions.length < 2 && missing.indexOf('contact_email') !== -1 && questions.indexOf(RB_QUESTIONS.contact_phone) === -1) questions.push(RB_QUESTIONS.contact_email);

  // Reply draft
  var greet = lead.contact_name ? 'Hi ' + lead.contact_name.split(' ')[0] + ', ' : 'Hi, ';
  var ack = '';
  if (extracted.company_size !== null && extracted.industry) ack = 'thanks for reaching out. A ' + rbHumanize(extracted.industry) + ' business with ' + extracted.company_size + ' people' + (extracted.desired_automation.length ? ' looking at ' + rbHumanize(extracted.desired_automation[0]) : '') + ' is exactly the kind of setup we work on. ';
  else if (extracted.desired_automation.length) ack = 'thanks for reaching out about ' + rbHumanize(extracted.desired_automation[0]) + '. ';
  else ack = 'thanks for getting in touch. ';
  var reply = '';
  if (intent === 'spam') reply = '';
  else if (nextAction === 'close_lost') reply = '';
  else if (status === 'HUMAN_REVIEW') reply = greet + ack + 'A member of our team will review your message personally and come back to you shortly.';
  else if (status === 'PROPOSAL_REQUIRED') reply = greet + ack + 'We will prepare a tailored proposal and come back to you with the details. ' + (questions.length ? 'To scope it correctly: ' + questions.slice(0, 2).join(' ') : '');
  else if (status === 'HOT') reply = greet + ack + 'The fastest way forward is a short discovery call to map your current process. ' + (questions.length ? 'Before that, two quick questions: ' + questions.slice(0, 2).join(' ') : 'When would suit you this week?');
  else reply = greet + ack + 'To point you in the right direction, a few quick questions: ' + questions.join(' ');
  reply = reply.replace(/\s+/g, ' ').trim();

  var summary = (extracted.contact_name || 'Prospect') + (extracted.company_name ? ' from ' + extracted.company_name : '') + (extracted.industry ? ' (' + rbHumanize(extracted.industry) + ')' : '') + (extracted.company_size !== null ? ', ' + extracted.company_size + ' people' : '') + '. ' + (extracted.problem ? 'Pain: ' + extracted.problem + ' ' : '') + (extracted.desired_automation.length ? 'Wants: ' + extracted.desired_automation.map(rbHumanize).join(', ') + '.' : 'Desired automation not stated.');

  var confidence = 0.35;
  if (intent !== 'unclear') confidence += 0.2;
  if (hasPain) confidence += 0.1;
  if (hasWant) confidence += 0.1;
  if (extracted.company_size !== null) confidence += 0.05;
  if (intent === 'spam') confidence = 0.6;
  confidence = Math.min(0.9, Math.round(confidence * 100) / 100);

  return {
    schema_version: '1.0',
    lead_status: status,
    intent: intent,
    lead_temperature: temperature,
    summary: summary.trim().slice(0, 600),
    extracted: extracted,
    missing_information: missing,
    recommended_reply: reply.slice(0, 1500),
    questions_to_ask: questions,
    next_action: nextAction,
    follow_up_at: null,
    human_review_required: humanReview,
    escalation_reasons: escalation,
    confidence: confidence,
    reasoning: 'Deterministic rule engine (' + RB_VERSION + '): intent from keyword patterns, temperature from pain+want+scale, status from qualification completeness. Not an LLM judgement.'
  };
}

module.exports = { classifyWithRules: classifyWithRules, RB_VERSION: RB_VERSION };
