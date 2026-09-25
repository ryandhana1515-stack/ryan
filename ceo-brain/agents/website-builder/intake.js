// Website intake — the short conversation John runs before a mock-up is built.
// Ryan's rule (2026-09-25): a customer who wants a mock-up is asked for the details, and once John
// has them the build starts automatically; nobody approves anything. This module decides "enough
// details?" from the customer's own words and tells John what to ask next. Pure functions, no I/O.
// Depends on the detection helpers in brief.js (inlined before this file inside n8n Code nodes).

var WI_VERSION = 'website-intake-1.0.0';
var WI_WEBSITE_RE = /\b(website|web ?site|landing page|web ?app|online store|e-?commerce (site|store|website)|web portal|customer portal|homepage|web ?page|mock-?up|mockup)\b/i;
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
  // The website topic is live when the CURRENT message asks for a site / mock-up, or when John already
  // started the intake in an earlier turn (a passing "maybe a website later" in old history does not count).
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
    reply = greet + 'perfect, I have what I need for ' + businessName + '. Our website team is ' + WI_STARTED_MARK + ' now; I will send the link to ' + to + ' in about 10 to 15 minutes. If you have a logo, brand colours or photos you want used, send them here and we will work them in.';
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

// ---- Node module wrapper (stripped when inlined into n8n) ----
if (typeof module !== 'undefined') {
  var _b = require('./brief.js');
  wbDetectMode = _b.wbDetectMode; wbDetectCategory = _b.wbDetectCategory; wbGuessBusinessName = _b.wbGuessBusinessName; wbDetectSiteType = _b.wbDetectSiteType; wbDetectGoal = _b.wbDetectGoal;
  module.exports = { WI_VERSION: WI_VERSION, WI_STARTED_MARK: WI_STARTED_MARK, wbIntake: wbIntake, wbIntakeInProgress: wbIntakeInProgress, wbBuildAlreadyStarted: wbBuildAlreadyStarted, wiCustomerText: wiCustomerText };
}
