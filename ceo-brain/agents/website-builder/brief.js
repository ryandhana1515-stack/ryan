// Website Builder Agent (Agent #2 — the "mock-up brief" half of FusionTech's Solution Architect).
// Pure functions, no n8n globals. Same contract as the Sales agent: deterministic fallback that
// produces the SAME schema as the LLM, a validator, and the Lovable build-prompt builder.
// Inlined into the n8n Code nodes by workflows/website-builder/build.js — keep it dependency-free.
var WB_VERSION = 'website-builder-1.0.0';
var WB_SITE_TYPES = ['business_website', 'landing_page', 'online_store', 'web_app', 'portal', 'other'];
var WB_GOALS = ['leads', 'bookings', 'sales', 'information', 'support', 'other'];
var WB_MISSING = ['business_name', 'industry', 'audience', 'primary_goal', 'pages', 'features', 'integrations', 'style', 'existing_domain', 'logo_and_brand', 'content', 'examples', 'timeline', 'decision_maker'];
var WB_MAX_PROMPT = 1800;
var WB_LOVABLE_BASE = 'https://lovable.dev/#prompt=';

function wbStr(v, max) {
  if (v === undefined || v === null) return null;
  var s = String(v).replace(/\s+/g, ' ').trim();
  if (!s) return null;
  return max && s.length > max ? s.slice(0, max) : s;
}
function wbStrArr(v, max) {
  if (!Array.isArray(v)) return [];
  var out = [];
  for (var i = 0; i < v.length && out.length < (max || 20); i++) { var s = wbStr(v[i], 200); if (s && out.indexOf(s) === -1) out.push(s); }
  return out;
}
function wbBoolOrNull(v) { return v === true || v === false ? v : null; }

// Everything the customer actually said, oldest first, plus the sales agent's summary.
function wbText(input) {
  input = input || {};
  var parts = [];
  var conv = Array.isArray(input.conversation) ? input.conversation : [];
  for (var i = 0; i < conv.length; i++) if (conv[i] && conv[i].role === 'customer' && conv[i].content) parts.push(String(conv[i].content));
  if (input.message) parts.push(String(input.message));
  if (input.sales_summary) parts.push(String(input.sales_summary));
  return parts.join('\n');
}

function wbDetectSiteType(text) {
  if (/online store|e-?commerce|sell (products )?online|shop online|webshop|checkout/i.test(text)) return 'online_store';
  if (/landing page/i.test(text)) return 'landing_page';
  if (/customer portal|client portal|\bportal\b/i.test(text)) return 'portal';
  if (/web ?app|dashboard|log ?in|track(ing)? (shipments|orders|deliver)|booking system|online system/i.test(text)) return 'web_app';
  if (/web ?site|homepage|web ?page/i.test(text)) return 'business_website';
  return 'other';
}
function wbDetectGoal(text) {
  if (/book(ing)?|appointment|reserv/i.test(text)) return 'bookings';
  if (/sell|order|checkout|online store|e-?commerce/i.test(text)) return 'sales';
  if (/enquir|inquir|lead|quote|quotation|contact us|whatsapp|request/i.test(text)) return 'leads';
  if (/support|faq|help ?desk/i.test(text)) return 'support';
  if (/information|about us|showcase|portfolio|brochure/i.test(text)) return 'information';
  return 'leads';
}
var WB_INTEGRATIONS = [
  [/whatsapp/i, 'WhatsApp click-to-chat'],
  [/book(ing)?|appointment|calendar|schedul/i, 'Appointment booking / calendar'],
  [/paynow|stripe|payment|pay online|checkout/i, 'Online payments'],
  [/\bcrm\b|hubspot|salesforce|pipedrive/i, 'CRM lead sync'],
  [/google maps|location|directions|outlet/i, 'Google Maps'],
  [/instagram|facebook|tiktok|social/i, 'Social media links'],
  [/track(ing)?|shipment|delivery status/i, 'Order / shipment tracking'],
  [/quote|quotation/i, 'Quote request form'],
  [/email/i, 'Email notifications']
];
function wbDetectIntegrations(text) {
  var out = [];
  for (var i = 0; i < WB_INTEGRATIONS.length; i++) if (WB_INTEGRATIONS[i][0].test(text)) out.push(WB_INTEGRATIONS[i][1]);
  return out;
}
function wbDefaultPages(siteType, goal) {
  if (siteType === 'landing_page') return [{ name: 'Landing page', purpose: 'Single page: hero, benefits, proof, call to action' }];
  if (siteType === 'online_store') return [{ name: 'Home', purpose: 'Featured products and promotions' }, { name: 'Shop', purpose: 'Product catalogue with categories' }, { name: 'Product', purpose: 'Product detail and add to cart' }, { name: 'Cart & Checkout', purpose: 'Purchase flow' }, { name: 'About', purpose: 'Brand story' }, { name: 'Contact', purpose: 'Contact details and enquiry form' }];
  if (siteType === 'web_app' || siteType === 'portal') return [{ name: 'Home', purpose: 'What the service does and how to start' }, { name: 'Login / Sign up', purpose: 'Customer accounts' }, { name: 'Dashboard', purpose: 'Main customer workspace' }, { name: 'Contact', purpose: 'Support and enquiries' }];
  var pages = [{ name: 'Home', purpose: 'Who you are, what you do, primary call to action' }, { name: 'Services', purpose: 'What you offer, one section per service' }, { name: 'About', purpose: 'Company story, team, credentials' }, { name: 'Contact', purpose: 'Enquiry form, WhatsApp, map, opening hours' }];
  if (goal === 'bookings') pages.splice(3, 0, { name: 'Book', purpose: 'Appointment booking' });
  if (goal === 'leads') pages.splice(3, 0, { name: 'Get a Quote', purpose: 'Structured quote request form' });
  return pages;
}
function wbGuessBusinessName(input, text) {
  if (input.company_name) return wbStr(input.company_name, 160);
  var m = text.match(/\b(?:we are|i run|i own|my company is|our company is|company called)\s+([A-Z][\w&'.\- ]{2,60}?(?:Pte\.? Ltd\.?|Ltd\.?|LLP|Inc\.?|Co\.?)?)(?=[,.\n]| and | with | that )/);
  return m ? wbStr(m[1], 160) : null;
}

/** Deterministic brief when the model is unavailable or returns garbage. Never invents facts. */
function wbFallbackBrief(input) {
  input = input || {};
  var text = wbText(input);
  var ex = (input.extracted && typeof input.extracted === 'object') ? input.extracted : {};
  var siteType = wbDetectSiteType(text);
  var goal = wbDetectGoal(text);
  var integrations = wbDetectIntegrations(text);
  var businessName = wbGuessBusinessName(input, text);
  var industry = wbStr(input.industry || ex.industry, 80);
  var pages = wbDefaultPages(siteType, goal);
  var features = [];
  if (goal === 'leads') features.push('Enquiry form that emails the owner');
  if (goal === 'bookings') features.push('Booking form with date and time');
  if (goal === 'sales') features.push('Product catalogue');
  features.push('Mobile-first responsive layout', 'Basic SEO (titles, descriptions, sitemap)');
  var missing = ['audience', 'style', 'existing_domain', 'logo_and_brand', 'content', 'examples', 'timeline'];
  if (!businessName) missing.unshift('business_name');
  if (!industry) missing.unshift('industry');
  if (ex.decision_maker !== true && ex.decision_maker !== false) missing.push('decision_maker');
  var questions = [];
  if (!businessName) questions.push('What is the name of your business, and do you already have a domain?');
  questions.push('Who is the website mainly for, and what should a visitor do first (enquire, book, buy)?');
  questions.push('Do you have a logo, brand colours and any example websites you like?');
  var brief = {
    schema_version: '1.0',
    site_type: siteType,
    business_name: businessName,
    industry: industry,
    audience: null,
    primary_goal: goal,
    pages: pages,
    features: features,
    integrations: integrations,
    style: { tone: null, colours: null, references: [] },
    existing_assets: { domain: null, logo: null, brand_colours: null, content: null },
    content_notes: wbStr(input.message, 600),
    questions_for_customer: questions.slice(0, 3),
    missing_information: missing,
    build_prompt: '',
    confidence: 0.35,
    reasoning: 'Deterministic fallback brief (' + WB_VERSION + '): site type, goal and integrations inferred from the customer\'s own words; pages and features are standard proposals, not customer statements.'
  };
  brief.build_prompt = wbBuildPrompt(brief, input);
  return brief;
}

function wbCoerce(b) {
  b = (b && typeof b === 'object' && !Array.isArray(b)) ? b : {};
  var pages = [];
  if (Array.isArray(b.pages)) for (var i = 0; i < b.pages.length && pages.length < 12; i++) {
    var p = b.pages[i];
    if (typeof p === 'string') { var n = wbStr(p, 60); if (n) pages.push({ name: n, purpose: '' }); }
    else if (p && typeof p === 'object') { var nm = wbStr(p.name, 60); if (nm) pages.push({ name: nm, purpose: wbStr(p.purpose, 200) || '' }); }
  }
  var style = (b.style && typeof b.style === 'object') ? b.style : {};
  var assets = (b.existing_assets && typeof b.existing_assets === 'object') ? b.existing_assets : {};
  var conf = Number(b.confidence);
  return {
    schema_version: '1.0',
    site_type: WB_SITE_TYPES.indexOf(b.site_type) !== -1 ? b.site_type : 'other',
    business_name: wbStr(b.business_name, 160),
    industry: wbStr(b.industry, 80),
    audience: wbStr(b.audience, 300),
    primary_goal: WB_GOALS.indexOf(b.primary_goal) !== -1 ? b.primary_goal : 'other',
    pages: pages,
    features: wbStrArr(b.features, 20),
    integrations: wbStrArr(b.integrations, 15),
    style: { tone: wbStr(style.tone, 120), colours: wbStr(style.colours, 120), references: wbStrArr(style.references, 5) },
    existing_assets: { domain: wbBoolOrNull(assets.domain), logo: wbBoolOrNull(assets.logo), brand_colours: wbBoolOrNull(assets.brand_colours), content: wbBoolOrNull(assets.content) },
    content_notes: wbStr(b.content_notes, 1200),
    questions_for_customer: wbStrArr(b.questions_for_customer, 3),
    missing_information: wbStrArr(b.missing_information, 20).filter(function (m) { return WB_MISSING.indexOf(m) !== -1; }),
    build_prompt: typeof b.build_prompt === 'string' ? b.build_prompt.trim() : '',
    confidence: isNaN(conf) ? 0 : Math.max(0, Math.min(1, conf)),
    reasoning: wbStr(b.reasoning, 800) || ''
  };
}

function wbValidate(b) {
  var errs = [];
  if (!b || typeof b !== 'object') return ['not_an_object'];
  if (b.schema_version !== '1.0') errs.push('schema_version');
  if (WB_SITE_TYPES.indexOf(b.site_type) === -1) errs.push('site_type');
  if (WB_GOALS.indexOf(b.primary_goal) === -1) errs.push('primary_goal');
  if (!Array.isArray(b.pages) || b.pages.length < 1) errs.push('pages_empty');
  if (!Array.isArray(b.features)) errs.push('features');
  if (!Array.isArray(b.integrations)) errs.push('integrations');
  if (!Array.isArray(b.missing_information)) errs.push('missing_information');
  if (!Array.isArray(b.questions_for_customer) || b.questions_for_customer.length > 3) errs.push('questions_for_customer');
  if (typeof b.confidence !== 'number' || b.confidence < 0 || b.confidence > 1) errs.push('confidence');
  if (typeof b.build_prompt !== 'string') errs.push('build_prompt');
  return errs;
}

/** Self-contained prompt for Lovable (Build-with-URL). Facts only from the brief; placeholders are labelled. */
function wbBuildPrompt(brief, input) {
  input = input || {};
  var name = brief.business_name || '[PLACEHOLDER: business name]';
  var industry = brief.industry || '[PLACEHOLDER: industry]';
  var lines = [];
  lines.push('Build a ' + brief.site_type.replace(/_/g, ' ') + ' for ' + name + ' (' + industry + ', Singapore).');
  lines.push('Primary goal: ' + brief.primary_goal + (brief.audience ? '. Audience: ' + brief.audience : '') + '.');
  lines.push('Pages: ' + brief.pages.map(function (p) { return p.name + (p.purpose ? ' (' + p.purpose + ')' : ''); }).join('; ') + '.');
  if (brief.features.length) lines.push('Features: ' + brief.features.join('; ') + '.');
  if (brief.integrations.length) lines.push('Integrations (build the UI + stub endpoints, no real keys): ' + brief.integrations.join('; ') + '.');
  var st = [];
  if (brief.style.tone) st.push('tone ' + brief.style.tone);
  if (brief.style.colours) st.push('colours ' + brief.style.colours);
  if (brief.style.references.length) st.push('inspired by ' + brief.style.references.join(', '));
  lines.push('Style: ' + (st.length ? st.join(', ') : 'clean, modern, trustworthy; choose a professional palette') + '. Mobile-first, fast, accessible.');
  if (brief.content_notes) lines.push('What the customer said: "' + brief.content_notes.slice(0, 300) + '"');
  lines.push('Rules: use React + Tailwind; every fact not given above must be a clearly marked [PLACEHOLDER]; no invented testimonials, awards, prices or client logos; forms post to a placeholder webhook and show a success state; add WhatsApp click-to-chat if WhatsApp is listed; basic SEO meta tags; include a footer with contact details placeholders.');
  var prompt = lines.join('\n');
  if (prompt.length > WB_MAX_PROMPT) prompt = prompt.slice(0, WB_MAX_PROMPT - 1) + '…';
  return prompt;
}
function wbLovableUrl(prompt) { return WB_LOVABLE_BASE + encodeURIComponent(prompt); }

function wbParseJson(text) {
  if (typeof text !== 'string') return null;
  var t = text.trim();
  var fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  if (t.charAt(0) !== '{') { var i = t.indexOf('{'), k = t.lastIndexOf('}'); if (i === -1 || k === -1 || k < i) return null; t = t.slice(i, k + 1); }
  try { return JSON.parse(t); } catch (e) { return null; }
}

/**
 * finalizeBrief({ raw_text, error, input }) -> { brief, provider, fallback_used, fallback_reason, validation_errors, build_prompt, lovable_url }
 */
function finalizeBrief(opts) {
  opts = opts || {};
  var input = opts.input || {};
  var validationErrors = [];
  var fallbackReason = null;
  var brief = null;
  if (opts.error) fallbackReason = String(opts.error);
  else {
    var parsed = wbParseJson(opts.raw_text);
    if (!parsed) fallbackReason = 'model_output_not_json';
    else {
      brief = wbCoerce(parsed);
      validationErrors = wbValidate(brief);
      if (validationErrors.length) { fallbackReason = 'schema_invalid: ' + validationErrors.join(','); brief = null; }
    }
  }
  var fallbackUsed = !brief;
  if (fallbackUsed) brief = wbFallbackBrief(input);
  else if (!brief.build_prompt || brief.build_prompt.length > 2500) brief.build_prompt = wbBuildPrompt(brief, input);
  // Facts guard: the model may propose pages/features, but must not invent a business name the customer never gave.
  if (!fallbackUsed && brief.business_name && !input.company_name) {
    var said = wbText(input).toLowerCase();
    if (said.indexOf(brief.business_name.toLowerCase().replace(/\s+(pte\.?\s*ltd\.?|ltd\.?|llp|inc\.?)$/i, '')) === -1) {
      brief.business_name = null;
      if (brief.missing_information.indexOf('business_name') === -1) brief.missing_information.unshift('business_name');
      brief.reasoning = (brief.reasoning ? brief.reasoning + ' ' : '') + '[guardrail] business_name removed: not present in the customer\'s words.';
      brief.build_prompt = wbBuildPrompt(brief, input);
    }
  }
  return {
    brief: brief,
    provider: fallbackUsed ? 'fallback' : 'anthropic',
    fallback_used: fallbackUsed,
    fallback_reason: fallbackReason,
    validation_errors: validationErrors,
    build_prompt: brief.build_prompt,
    lovable_url: wbLovableUrl(brief.build_prompt)
  };
}

// ---- Node module wrapper (stripped by build.js) ----
module.exports = { WB_VERSION, WB_SITE_TYPES, WB_GOALS, WB_MISSING, wbText, wbFallbackBrief, wbCoerce, wbValidate, wbBuildPrompt, wbLovableUrl, wbParseJson, finalizeBrief };
