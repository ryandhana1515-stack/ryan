var WR_VERSION = 'website-intelligence-1.1.0';
var WR_SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'youtube.com', 'x.com', 'twitter.com'];
var WR_DIRECTORY_HOSTS = ['google.com', 'maps.google', 'yelp.com', 'tripadvisor', 'wikipedia.org', 'yellowpages', 'sgpbusiness', 'recordowl', 'streetdirectory', 'carousell', 'shopee', 'lazada', 'glassdoor', 'indeed', 'bing.com', 'duckduckgo', 'reddit.com', 'hardwarezone', 'mycareersfuture', 'acra.gov.sg', 'trustpilot', 'sgcarmart'];
var WR_INSTRUCTION = 'WEBSITE CREATOR INSTRUCTION\n\nUsing the verified business intelligence above, create a premium, modern, mobile-responsive, conversion-focused website mock-up specifically for this company.\n\nDo NOT create a generic informational website.\n\nThe design and copy structure must be based on:\n\n* the company\'s actual business\n* its target customers\n* its services/products\n* its conversion objective\n* customer buying motivations\n* trust requirements\n* customer objections\n* the company\'s brand\n* the research supplied in this brief\n\nThe website must make the visitor understand:\n\n1. What this company does.\n2. Who it helps.\n3. Why the visitor should care.\n4. Why the company can be trusted.\n5. What action the visitor should take next.\n\nBuild the FUNNEL_PLAN as well (landing page, qualifying form or quiz, thank-you or booking page, follow-up), follow the CONVERSION_STRATEGY section by section, and keep the page FLAT as the MOTION_3D_DIRECTION says (no scroll animation, parallax, 3D or video backgrounds). For medical clients follow the MEDICAL_VISUAL_DIRECTION exactly as a still photograph: photorealistic, medically accurate anatomy, never cartoon.\n\nCreate strong conversion paths through the appropriate combination of:\n\n* CTA buttons\n* WhatsApp\n* forms\n* appointments\n* quotations\n* consultation requests\n* calls\n* purchases\n\nDo not fabricate company facts.\n\nUse clearly marked placeholders for unavailable content.\n\nOnce the mock-up is completed, DO NOT send it to the customer.\n\nReturn the completed website/mock-up URL and a short internal summary to:\n\nJOHN — FUSION AI SALES AGENT';
var WR_MED_SPECIALTY = [
  ['cardiology', /\b(cardi\w*|heart|vascular|arter\w*|vein clinic|cholesterol|hypertension)\b/i, 'a photorealistic, medically accurate human heart beating in slow motion, coronary arteries and veins on its surface, blood visibly flowing through the vessels, cinematic macro lighting on a deep clinical background'],
  ['dental', /\b(dental|dentist\w*|orthodont\w*|teeth|tooth|implants?|braces|invisalign|root canal)\b/i, 'photorealistic macro of healthy human teeth and gums, enamel texture and light, a dental implant seating into the jawbone in a clean cross-section, calm clinical lighting'],
  ['orthopaedic', /\b(orthop\w*|spine|spinal|joint|knee|hip|shoulder|sports (medicine|injur\w*)|physio\w*|chiropract\w*|musculoskeletal)\b/i, 'a photorealistic, medically accurate human spine and knee joint in motion, bones, cartilage, ligaments and muscle fibres moving together, soft studio lighting'],
  ['ophthalmology', /\b(ophthalm\w*|eye|eyes|lasik|cataract|retina\w*|optometr\w*|myopia)\b/i, 'a photorealistic macro of the human eye, iris and cornea in fine detail, light travelling through the lens and focusing on the retina'],
  ['dermatology', /\b(dermatolog\w*|skin|aesthetic\w*|acne|pigment\w*|laser)\b/i, 'a photorealistic cross-section of healthy skin layers, collagen and elastin fibres renewing, then a macro of clear, glowing skin'],
  ['neurology', /\b(neuro\w*|brain|stroke|migraine|epilep\w*)\b/i, 'a photorealistic human brain with neural pathways lighting up as signals travel between neurons'],
  ['respiratory', /\b(respirat\w*|lung|lungs|asthma|pulmon\w*|sleep apnoea|sleep apnea)\b/i, 'photorealistic human lungs breathing, the airways branching and filling with air in slow motion'],
  ['gastro', /\b(gastro\w*|liver|colorectal|digestive|endoscop\w*|colonoscop\w*)\b/i, 'a photorealistic, medically accurate view of the digestive system, the stomach and intestines with gentle movement, clean clinical lighting'],
  ['fertility', /\b(fertility|ivf|obstetric\w*|gynae\w*|gynec\w*|pregnan\w*|women'?s health)\b/i, 'a tasteful, photorealistic microscopic view of healthy cells dividing, soft warm light, calm and reassuring'],
  ['oncology', /\b(oncolog\w*|cancer|tumou?r)\b/i, 'a photorealistic microscopic view of healthy cells, calm and hopeful lighting, no disease imagery'],
  ['urology', /\b(urolog\w*|kidney|kidneys|renal|prostate)\b/i, 'photorealistic human kidneys with blood vessels, filtering in slow motion, clean clinical lighting']
];
function wrSpecialty(text) { for (var i = 0; i < WR_MED_SPECIALTY.length; i++) if (WR_MED_SPECIALTY[i][1].test(text)) return { key: WR_MED_SPECIALTY[i][0], visual: WR_MED_SPECIALTY[i][2] }; return null; }
function wrIsMedical(text) { return /\b(doctor|doctors|clinic|clinics|dental|dentist|medical|physician|specialist|surgeon|surgery|healthcare|hospital|physio\w*|patients?|cardi\w*|orthop\w*|ophthalm\w*|dermatolog\w*|neuro\w*|gastro\w*|oncolog\w*|urolog\w*|fertility|ivf)\b/i.test(text); }
/** Industry -> a 3D / scroll-motion concept that shows THIS business (generated as video, scroll-scrubbed in the page). */
var WR_MOTION = [
  [/construct\w*|builder|contractor|renovat\w*|interior|architect\w*/i, 'scroll-driven 3D build-up: the structure assembles floor by floor as the visitor scrolls, ending on the finished project at golden hour'],
  [/car|auto|motor|dealer|vehicle/i, 'the car rotates in 3D as the visitor scrolls, lights sweeping across the bodywork, then a slow drive-by'],
  [/property|real estate|realtor|condo/i, '3D architectural fly-through of the property, from the street into the living space, sunlight moving across the rooms'],
  [/restaurant|cafe|f&b|food|bakery|catering/i, 'slow-motion 3D of the signature dish being assembled ingredient by ingredient, steam and texture in macro'],
  [/logistic|delivery|courier|freight|warehouse/i, 'a 3D map of Singapore with parcels and vehicles moving along live routes as the visitor scrolls'],
  [/salon|spa|beauty|wellness|nail|hair/i, 'slow-motion macro of textures and treatment rituals, soft light moving across skin and product'],
  [/software|saas|tech|app|platform/i, 'the product interface floating in 3D, panels separating to show how each part works as the visitor scrolls'],
  [/school|tuition|academy|education|course/i, 'a 3D journey from a confused student to confident results, pages and ideas unfolding as the visitor scrolls'],
  [/retail|shop|store|brand|product|e-?commerce/i, 'the hero product rotating in 3D with exploded-view details revealing materials and features on scroll']
];
var WR_FLAT = 'Flat, fast page (Ryan, 2026-09-27): no scroll animations, no parallax, no 3D, no scroll film and no video backgrounds; only simple hover and focus states. The page sells through the offer, the headline, proof, answered objections and the repeated call to action.';
function wrMotionFor(industry, text) {
  return WR_FLAT; // Ryan, 2026-09-27: one flat, high-converting site; no scroll or 3D motion.
}
/** The funnel to build (landing page -> qualify -> convert -> follow-up), shaped by the primary conversion. */
function wrFunnelFor(conv, industry, text) {
  var t = String(text || '').toLowerCase();
  var asked = /\bfunnels?\b|landing page|sales page|lead magnet|opt-?in|squeeze/.test(t);
  var p = conv.primary;
  var offer = /BOOK/.test(p) ? 'a first consultation or appointment [CLIENT TO CONFIRM the exact offer]' : (p === 'BUY NOW' ? 'the hero product or bundle [CLIENT TO CONFIRM]' : (p === 'GET QUOTE' ? 'a free, no-obligation quote or site assessment [CLIENT TO CONFIRM]' : 'a free consultation [CLIENT TO CONFIRM]'));
  var steps;
  if (p === 'BUY NOW') steps = ['1. Traffic (ads, social, search) lands on one product page with a single offer: ' + offer, '2. Product page: outcome headline, 3D/hero visual, benefits, proof placeholders, objections answered, one Buy button repeated', '3. Checkout (cart + payment stub) with trust reassurance next to the button', '4. Thank-you page with order next steps and one relevant add-on offer', '5. Follow-up: order confirmation, review request and re-order reminder by WhatsApp/email (CRM)'];
  else steps = ['1. Traffic (ads, social, search, WhatsApp link) lands on a focused landing page with one offer: ' + offer, '2. Landing page: specific outcome headline for ' + (industry || 'the customer') + ', proof stack placeholders, how it works in 3 steps, objections answered, one CTA repeated after every section, no top navigation to leak attention', '3. Qualifying form or short quiz (max 5 fields: name, WhatsApp, what they need, when, PDPA consent) or a WhatsApp click-to-chat', '4. Thank-you page: confirms what happens next, ' + (/BOOK/.test(p) ? 'offers a calendar to book the slot now' : 'offers WhatsApp to speed things up') + ', with a short video or photo of the team', '5. Follow-up: John (WhatsApp/email) replies instantly, reminders and a follow-up sequence until booked; every lead lands in the CRM with its source'];
  return { type: /BOOK/.test(p) ? 'booking funnel' : (p === 'BUY NOW' ? 'sales funnel' : (p === 'GET QUOTE' ? 'quote funnel' : 'lead-generation funnel')), build_as: asked ? 'the main deliverable (the customer asked for a funnel)' : 'an extra /offer landing page next to the main site, for ads', offer: offer, steps: steps };
}
var WR_CONVERSION_STRATEGY = [
  'Hero: an outcome headline written for this customer\'s buyer (what they get, for whom), a one-line proof point placeholder and ONE primary CTA',
  'One primary CTA repeated after every section; a sticky CTA bar with WhatsApp on mobile',
  'Proof stack near the top and again before the final CTA: reviews, results, logos, credentials, photos [CLIENT TO PROVIDE]',
  'Objection handling: FAQ answering the top buying objections for this business, in the buyer\'s words',
  'Risk reducers: no-obligation first step, reply-time promise only if the client confirms it, clear next steps after the form',
  'Short forms (max 5 fields) with PDPA consent; thank-you page that tells the visitor exactly what happens next',
  'Speed and focus: fast images, no auto-carousels, landing pages without top navigation, every section earns its place',
  'Tracking: GA4 / Meta pixel events on cta_click, whatsapp_click, form_submit, booking_complete so the funnel can be optimised'
];
var WR_VARIATIONS = 'ONE VERSION (Ryan, 2026-09-27): build ONE flat, high-converting website from this brief (photography generated by Kling, built on Lovable, published to a public link). No scroll animation, parallax, 3D or scroll film. No prices anywhere; John sends the link.';
function wrStr(v, max) { if (v === undefined || v === null) return ''; var s = String(v).replace(/\s+/g, ' ').trim(); return max && s.length > max ? s.slice(0, max) : s; }
function wrArr(v, max) { if (!v) return []; if (!Array.isArray(v)) v = [v]; return v.map(function (x) { return typeof x === 'string' ? wrStr(x, 300) : (x && typeof x === 'object' ? wrStr(x.fact || x.text || x.name || JSON.stringify(x), 300) : wrStr(x, 300)); }).filter(Boolean).slice(0, max || 20); }
function wrHost(url) { var m = /^(?:https?:\/\/)?(?:www\.)?([^\/?#:]+)/i.exec(String(url || '').trim()); return m ? m[1].toLowerCase() : ''; }
function wrUrl(u) { u = wrStr(u, 300); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; return u.replace(/[)\].,;]+$/, ''); }
function wrFindUrls(text) {
  var out = [], re = /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|sg|co|net|org|io|asia|shop|store|clinic|dental|my|au|uk|biz|info)(?:\.[a-z]{2})?(?:\/[^\s"'<>)]*)?)/gi, m;
  text = String(text || '');
  while ((m = re.exec(text)) !== null) { var u = m[1]; if (/@/.test(text.slice(Math.max(0, m.index - 1), m.index + 1))) continue; if (out.indexOf(u) === -1) out.push(u); }
  return out;
}
function wrIsSocial(host) { return WR_SOCIAL_HOSTS.some(function (h) { return host === h || host.endsWith('.' + h); }); }
function wrIsDirectory(host) { return WR_DIRECTORY_HOSTS.some(function (h) { return host.indexOf(h) !== -1; }); }
function wrTokens(s) { return wrStr(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(function (t) { return t.length > 2 && ['pte', 'ltd', 'llp', 'the', 'and', 'singapore', 'company', 'co', 'inc', 'llc', 'sdn', 'bhd'].indexOf(t) === -1; }); }
/** John's hand-off → normalized input (same fields as the Website Builder + the website John or the customer mentioned). */
var WR_BRIEF_KEYS = ['company_name', 'company_url', 'industry', 'location', 'business_summary', 'verified_facts', 'client_provided_facts', 'unverified_information', 'products', 'services', 'target_customers', 'customer_problems', 'customer_desires', 'customer_objections', 'company_differentiators', 'trust_signals', 'competitive_context', 'website_objective', 'primary_conversion', 'secondary_conversions', 'primary_cta', 'secondary_cta', 'recommended_sitemap', 'homepage_conversion_flow', 'funnel_plan', 'conversion_strategy', 'motion_3d_direction', 'medical_visual_direction', 'page_requirements', 'copy_direction', 'brand_direction', 'visual_direction', 'media_requirements', 'trust_sections', 'testimonial_requirements', 'case_study_requirements', 'faq_direction', 'form_requirements', 'whatsapp_requirements', 'booking_requirements', 'ecommerce_requirements', 'crm_opportunities', 'automation_opportunities', 'seo_direction', 'analytics_requirements', 'mobile_requirements', 'accessibility_requirements', 'compliance_considerations', 'placeholders_required', 'do_not_invent', 'questions_for_john', 'identity_confidence', 'reasoning'];
var WR_LIST_KEYS = ['verified_facts', 'client_provided_facts', 'unverified_information', 'products', 'services', 'target_customers', 'customer_problems', 'customer_desires', 'customer_objections', 'company_differentiators', 'trust_signals', 'competitive_context', 'secondary_conversions', 'recommended_sitemap', 'homepage_conversion_flow', 'funnel_plan', 'conversion_strategy', 'page_requirements', 'media_requirements', 'trust_sections', 'form_requirements', 'crm_opportunities', 'automation_opportunities', 'analytics_requirements', 'mobile_requirements', 'accessibility_requirements', 'compliance_considerations', 'placeholders_required', 'do_not_invent', 'questions_for_john'];
function wrConversionFor(industry, signals) {
  var s = (industry || '').toLowerCase();
  if (/clinic|dental|aesthetic|medical|doctor|physio|tcm|wellness|spa|salon|beauty|barber/.test(s)) return { primary: 'BOOK APPOINTMENT', secondary: ['WHATSAPP', 'CALL NOW'], cta: 'Book an appointment', cta2: 'WhatsApp us' };
  if (/property|real estate|agent|realtor/.test(s)) return { primary: 'REQUEST PROPERTY VIEWING', secondary: ['BOOK CONSULTATION', 'WHATSAPP'], cta: 'Request a viewing', cta2: 'Talk to us on WhatsApp' };
  if (/construction|renovation|contractor|interior|landscap|roofing|plumb|electric|aircon|cleaning|moving|logistic|printing|signage/.test(s)) return { primary: 'GET QUOTE', secondary: ['WHATSAPP', 'CALL NOW'], cta: 'Get a quote', cta2: 'WhatsApp us' };
  if (/car|auto|motor|dealer|vehicle|bike/.test(s)) return { primary: 'BOOK TEST DRIVE', secondary: ['WHATSAPP', 'VISIT SHOWROOM'], cta: 'Book a test drive', cta2: 'Chat on WhatsApp' };
  if (/shop|store|retail|e-?commerce|brand|product|fashion|food|bakery|cafe|restaurant|f&b/.test(s)) return { primary: /restaurant|cafe|f&b/.test(s) ? 'RESERVE A TABLE' : 'BUY NOW', secondary: ['WHATSAPP', 'VIEW PRODUCTS'], cta: /restaurant|cafe|f&b/.test(s) ? 'Reserve a table' : 'Shop now', cta2: 'Ask on WhatsApp' };
  if (/insurance|financial|wealth|advis|account|law|legal|consult|agency|marketing|software|saas|it |tech/.test(s)) return { primary: 'BOOK CONSULTATION', secondary: ['REQUEST CALLBACK', 'WHATSAPP'], cta: 'Book a consultation', cta2: 'Request a callback' };
  if (/school|tuition|training|course|education|academy/.test(s)) return { primary: 'BOOK TRIAL CLASS', secondary: ['WHATSAPP', 'CALL NOW'], cta: 'Book a trial class', cta2: 'WhatsApp us' };
  return { primary: signals && signals.shop ? 'BUY NOW' : 'GET QUOTE', secondary: ['WHATSAPP', 'CALL NOW'], cta: signals && signals.shop ? 'Shop now' : 'Get a quote', cta2: 'WhatsApp us' };
}
/** Deterministic brief when the model is unavailable: John's facts + what research verified; nothing invented. */
function wrFallbackBrief(input, digest) {
  var conv = wrConversionFor(input.industry, digest.site.signals);
  var name = input.company_name || '[CLIENT TO PROVIDE company name]';
  var verified = digest.facts.filter(function (f) { return /^VERIFIED/.test(f.label); }).map(function (f) { return f.fact; });
  var provided = digest.facts.filter(function (f) { return f.label === 'JOHN_OR_CUSTOMER_PROVIDED_FACT'; }).map(function (f) { return f.fact; });
  var third = digest.facts.filter(function (f) { return f.label === 'THIRD_PARTY_PUBLIC_INFORMATION'; }).map(function (f) { return f.fact; });
  var svc = input.industry ? [input.industry + ' services — [CLIENT TO PROVIDE the exact service list]'] : ['[CLIENT TO PROVIDE services]'];
  var questions = [];
  if (digest.identity.confidence === 'low') questions.push('Which website or social page is ' + name + '\'s official one? (' + digest.identity.reason + ')');
  if (!input.industry) questions.push('What does ' + name + ' sell or do, exactly?');
  var said = (input.message + ' ' + input.sales_summary + ' ' + JSON.stringify(input.extracted || {})).toLowerCase();
  if (!/book|appointment|quote|quotation|buy|order|checkout|whatsapp|enquir|inquir|consult|reserv|test drive|viewing|callback/.test(said)) questions.push('What is the number-one action a visitor should take (quote, booking, WhatsApp, purchase)?');
  var said2 = [input.message, input.sales_summary, JSON.stringify(input.extracted || {})].concat((input.conversation || []).map(function (m) { return m && m.content; })).join(' ');
  var funnel = wrFunnelFor(conv, input.industry, said2);
  var medText = String(input.industry || '') + ' ' + said2 + ' ' + (digest.site.title || '') + ' ' + (digest.site.description || '');
  var spec = wrIsMedical(medText) ? wrSpecialty(medText) : null;
  return {
    funnel_plan: ['Funnel type: ' + funnel.type + ' — build it as ' + funnel.build_as, 'Offer: ' + funnel.offer].concat(funnel.steps),
    conversion_strategy: WR_CONVERSION_STRATEGY.slice(),
    motion_3d_direction: wrMotionFor(input.industry, said2),
    medical_visual_direction: wrIsMedical(medText) ? ((spec ? 'Specialty: ' + spec.key + '. Hero and section visuals: ' + spec.visual + '. ' : 'Specialty: general practice. Use the real clinic and team (with consent), no anatomy renders. ') + 'Photorealistic and medically accurate, educational in tone, never cartoon or low-poly 3D, no gore, no before/after images, no outcome claims (MOH advertising rules).') : '',
    company_name: name, company_url: digest.identity.confidence !== 'low' ? digest.identity.website : '', industry: input.industry || '[CLIENT TO PROVIDE]', location: input.location,
    business_summary: name + (input.industry ? ' is a ' + input.industry + ' business' : '') + ' in ' + input.location + '.' + (input.sales_summary ? ' John: ' + input.sales_summary : '') + (digest.site.description ? ' Site says: ' + digest.site.description : ''),
    verified_facts: verified, client_provided_facts: provided, unverified_information: third.concat(digest.unknown),
    products: [], services: svc, target_customers: ['[CLIENT TO PROVIDE] — inferred from the industry: customers in ' + input.location + ' looking for ' + (input.industry || 'this service')],
    customer_problems: ['Cannot tell quickly what the company does and whether it is trustworthy (INFERENCE)'], customer_desires: ['A clear offer, proof, and one obvious next step (INFERENCE)'], customer_objections: ['Price unclear', 'Is this company legitimate?', 'How fast can they respond?'],
    company_differentiators: ['[CLIENT TO PROVIDE]'], trust_signals: ['[CLIENT TO PROVIDE] testimonials, certifications, project photos'],
    competitive_context: digest.competitors.map(function (c) { return c.name + ' (' + c.url + ')'; }),
    website_objective: 'Turn visitors into ' + conv.primary.toLowerCase() + ' requests', primary_conversion: conv.primary, secondary_conversions: conv.secondary, primary_cta: conv.cta, secondary_cta: conv.cta2,
    recommended_sitemap: ['Home', 'Services', 'About', 'Projects / Proof [CLIENT TO PROVIDE]', 'FAQ', 'Contact'],
    homepage_conversion_flow: ['Hero: what we do + for whom + primary CTA', 'Customer problem', 'Solution / services', 'Why choose us', 'Proof [CLIENT TO PROVIDE]', 'FAQ / objections', 'Final CTA + form / WhatsApp'],
    page_requirements: ['Every page: primary CTA above the fold, WhatsApp button, mobile-first'],
    copy_direction: 'Plain, specific, outcome-led; speak to ' + (input.industry || 'the customer') + ' buyers in ' + input.location + '; no hype, no invented claims.',
    brand_direction: '[CLIENT TO PROVIDE brand colours/logo]' + (digest.site.title ? '; current site title: ' + digest.site.title : ''), visual_direction: 'Premium, photo-led, category-appropriate; no generic AI look.',
    media_requirements: ['Hero photography of the real business [CLIENT TO PROVIDE or generated placeholders]'], trust_sections: ['Testimonials [CLIENT TO PROVIDE]', 'Credentials [CLIENT TO PROVIDE]'],
    testimonial_requirements: '[CLIENT TESTIMONIALS TO BE ADDED]', case_study_requirements: '[PROJECT IMAGES TO BE PROVIDED]', faq_direction: 'Answer the top buying questions and objections for ' + (input.industry || 'this service'),
    form_requirements: ['Qualifying fields for a ' + conv.primary.toLowerCase() + ' (name, preferred contact, what they need, when)', 'PDPA consent checkbox + privacy policy link'],
    whatsapp_requirements: 'Click-to-chat button on every page (number [CLIENT TO PROVIDE])', booking_requirements: conv.primary.indexOf('BOOK') === 0 ? 'Booking request form or calendar link' : 'not required for v1', ecommerce_requirements: conv.primary === 'BUY NOW' ? 'Product catalogue + checkout (Stripe/PayNow)' : 'not required',
    crm_opportunities: ['Every form/WhatsApp lead into the CRM with source'], automation_opportunities: ['Instant acknowledgement + follow-up task', 'Review request after the job'],
    seo_direction: (input.industry || 'service') + ' ' + input.location + ' — local intent pages; titles and H1s per page', analytics_requirements: ['GA4 events: cta_click, whatsapp_click, form_submit' + (conv.primary.indexOf('BOOK') === 0 ? ', booking_complete' : '')],
    mobile_requirements: ['Sticky CTA / WhatsApp on mobile', 'Thumb-friendly buttons', 'Fast images'], accessibility_requirements: ['Readable contrast, alt text, keyboard-friendly forms'],
    compliance_considerations: /clinic|dental|aesthetic|medical|doctor/i.test(input.industry) ? ['Healthcare advertising rules (MOH) — flag claims for human review'] : (/property|real estate/i.test(input.industry) ? ['CEA advertising rules for property agents'] : (/insurance|financial|wealth/i.test(input.industry) ? ['MAS promotion rules'] : ['PDPA consent on forms'])),
    placeholders_required: digest.unknown, do_not_invent: ['testimonials', 'awards', 'certifications', 'customer counts', 'years operating', 'revenue', 'results', 'prices', 'addresses', 'team members'],
    questions_for_john: questions.slice(0, 3), identity_confidence: digest.identity.confidence,
    reasoning: 'Deterministic brief (model unavailable): built from John\'s facts, ' + digest.site.pages_read.length + ' page(s) read, ' + digest.competitors.length + ' competitor(s) found.'
  };
}
function wrCoerceBrief(raw, fallback) {
  var b = {}; raw = (raw && typeof raw === 'object') ? raw : {};
  WR_BRIEF_KEYS.forEach(function (k) {
    var v = raw[k];
    if (WR_LIST_KEYS.indexOf(k) !== -1) { v = wrArr(v, 25); if (!v.length && fallback[k] && k !== 'questions_for_john') v = fallback[k]; b[k] = v; }
    else if (k === 'identity_confidence') b[k] = ['high', 'medium', 'low'].indexOf(v) !== -1 ? v : fallback.identity_confidence;
    else b[k] = wrStr(v, k === 'business_summary' || k === 'reasoning' ? 1200 : 600) || fallback[k] || '';
  });
  return b;
}
function wrParseJson(text) {
  if (typeof text !== 'string') return null;
  var w0 = text.indexOf('{'), w1 = text.lastIndexOf('}'); if (w0 !== -1 && w1 > w0) { try { return JSON.parse(text.slice(w0, w1 + 1)); } catch (e) {} }
  var t = text.trim(); var m = /```(?:json)?\s*([\s\S]*?)```/i.exec(t); if (m) t = m[1].trim();
  var a = t.indexOf('{'), z = t.lastIndexOf('}'); if (a === -1 || z === -1) return null;
  try { return JSON.parse(t.slice(a, z + 1)); } catch (e) { return null; }
}
/** The WEBSITE_CREATOR_BRIEF as text, in Ryan's order, ending with the variations rule and the creator instruction. */
function wrBriefText(brief, digest) {
  var line = function (k, v) { return k + ':\n' + (Array.isArray(v) ? (v.length ? v.map(function (x) { return '- ' + x; }).join('\n') : '- (none)') : (v || '(none)')) + '\n'; };
  var order = WR_BRIEF_KEYS.filter(function (k) { return ['questions_for_john', 'identity_confidence', 'reasoning'].indexOf(k) === -1; });
  return 'STATUS:\nREADY_FOR_WEBSITE_CREATOR\n\nWEBSITE_CREATOR_BRIEF\n\n' + order.map(function (k) { return line(k.toUpperCase(), brief[k]); }).join('\n') + '\nIDENTITY_CONFIDENCE: ' + brief.identity_confidence + ' (' + digest.identity.reason + ')\nSOURCES: ' + (digest.site.pages_read.concat(digest.reviews.map(function (r) { return r.source; })).join(', ') || 'John\'s hand-off only') + '\n\n' + WR_VARIATIONS + '\n\n' + WR_INSTRUCTION;
}
/** Model output (or error) → validated brief + status + text for the Website Creator. Never blocks a mock-up (Rule 12). */
function wrFinalize(o) {
  var input = o.input, digest = o.digest;
  var fallback = wrFallbackBrief(input, digest);
  var provider = 'anthropic', fallbackUsed = false, reason = null, parsed = null;
  if (o.error) { fallbackUsed = true; reason = wrStr(o.error, 200); }
  else { parsed = wrParseJson(o.raw_text); if (!parsed) { fallbackUsed = true; reason = 'model_output_not_json'; } }
  if (fallbackUsed) provider = 'rules';
  var brief = wrCoerceBrief(parsed || fallback, fallback);
  if (!parsed) brief = fallback;
  if (fallback.medical_visual_direction && !/photoreal/i.test(brief.medical_visual_direction || '')) brief.medical_visual_direction = fallback.medical_visual_direction;
  brief.motion_3d_direction = fallback.motion_3d_direction; // always flat (Ryan, 2026-09-27)
  if (digest.identity.confidence === 'low') { brief.company_url = ''; brief.identity_confidence = 'low'; if (!brief.questions_for_john.length) brief.questions_for_john = fallback.questions_for_john; }
  var status = input.company_name ? 'READY_FOR_WEBSITE_CREATOR' : 'MORE_INFORMATION_REQUIRED';
  var text = status === 'READY_FOR_WEBSITE_CREATOR' ? wrBriefText(brief, digest) : 'STATUS:\nMORE_INFORMATION_REQUIRED\n\nQUESTIONS_FOR_JOHN:\n- What is the company name?\n\nWHY_REQUIRED:\nNo company could be identified from the hand-off.';
  return { status: status, brief: brief, brief_text: text, questions_for_john: brief.questions_for_john, provider: provider, fallback_used: fallbackUsed, fallback_reason: reason, identity_confidence: brief.identity_confidence, needs_john: brief.questions_for_john.length > 0 };
}
/** What Google could not tell us goes back to John, who asks the customer at once (Ryan, 2026-09-27): at most two
 *  questions, in John's voice, while the mock-up is already being built with placeholders. Never asks what the
 *  customer already said; never on test leads. Returns { send, channel, to, text, questions, message_id }. */
function wrCustomerAsk(o) {
  o = o || {};
  var input = o.input || {};
  var qs = wrArr(o.questions, 5).filter(function (q) { return q && q.length > 8; });
  var said = String([input.message || ''].concat((input.conversation || []).map(function (m) { return m && m.content; })).join('\n')).toLowerCase();
  qs = qs.filter(function (q) { return said.indexOf(q.toLowerCase().slice(0, 40)) === -1; }).slice(0, 2);
  qs = qs.map(function (q) {
    return q.replace(/\bdoes the (customer|client|owner) have\b/gi, 'do you have').replace(/\bis the (customer|client|owner)\b/gi, 'are you')
      .replace(/\bthe (customer|client|owner)'s\b/gi, 'your').replace(/\bthe (customer|client|owner)\b/gi, 'you')
      .replace(/\b(this|the) business\b/gi, 'your business');
  });
  var channel = input.channel === 'whatsapp' ? 'whatsapp' : (input.channel === 'email' ? 'email' : null);
  var to = channel === 'whatsapp' ? wrStr(input.phone, 40) : (channel === 'email' ? wrStr(input.email, 160) : '');
  var first = wrStr(input.contact_name, 60).split(' ')[0];
  var biz = wrStr(input.company_name, 80);
  var text = '';
  if (qs.length) {
    text = (first ? 'Hi ' + first + ', ' : 'Hi, ') + 'while our team builds your ' + (biz ? biz + ' ' : '') + 'mock-up, ' +
      (qs.length === 1 ? 'one quick detail we could not find online: ' + qs[0] : 'two quick details we could not find online: 1) ' + qs[0] + ' 2) ' + qs[1]) +
      ' If you are not sure, no problem, we will use clear placeholders you can change later.';
  }
  var send = !!(o.needs_john && qs.length && !input.test_mode && channel && to);
  return { send: send, channel: channel || '', to: to || '', text: text, questions: qs, message_id: 'msg_wi_' + String(input.lead_id || 'x').replace(/[^a-z0-9_]/gi, '').slice(0, 60) + '_' + Date.now().toString(36) };
}
// ---- n8n glue ----
const d = $('Digest Research').first().json;
const pre = $('Compose Research Prompt').first().json;
const input = d.input;
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
const fin = wrFinalize({ raw_text: rawText, error, input, digest: d.digest });
const now = new Date().toISOString();
const started = d.started_at || now;
const researchSlim = { version: d.digest.version, identity: d.identity, facts: d.digest.facts, site: { website: d.digest.site.website, pages_read: d.digest.site.pages_read, pages_failed: d.digest.site.pages_failed, title: d.digest.site.title, description: d.digest.site.description, signals: d.digest.site.signals }, competitors: d.digest.competitors, reviews: d.digest.reviews, unknown: d.digest.unknown, search_items: d.digest.search_items, search_errors: d.digest.search_errors , brief: fin.brief };
const eventType = fin.status !== 'READY_FOR_WEBSITE_CREATOR' || fin.needs_john ? 'website.info_needed' : 'website.research';
return [{ json: {
  input, status: fin.status, ready: fin.status === 'READY_FOR_WEBSITE_CREATOR', needs_john: fin.needs_john, questions_for_john: fin.questions_for_john,
  ask_customer: wrCustomerAsk({ input, questions: fin.questions_for_john, needs_john: fin.needs_john }),
  brief: fin.brief, brief_text: fin.brief_text, research_json: JSON.stringify(researchSlim), identity_confidence: fin.identity_confidence,
  provider: fin.provider, model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason, role_source: pre.role_source, config: pre.config,
  event: { type: eventType, source: 'website-intelligence', tenant_id: input.tenant_id, lead_id: input.lead_id, entity_type: 'lead', entity_id: input.lead_id, severity: eventType === 'website.info_needed' ? 'medium' : 'info', summary: (fin.status === 'READY_FOR_WEBSITE_CREATOR' ? 'Research brief ready for ' + (input.company_name || input.lead_id) + ' (' + fin.identity_confidence + ' identity)' : 'Website Intelligence needs information for ' + input.lead_id) + (fin.questions_for_john.length ? ' — questions for John: ' + fin.questions_for_john.join(' | ') : ''), payload: { questions_for_john: fin.questions_for_john, identity_confidence: fin.identity_confidence, website: d.identity.website, pages_read: researchSlim.site.pages_read, provider: fin.provider }, test_mode: input.test_mode, correlation_id: 'lead:' + input.lead_id },
  run_id: 'run_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36), started_at: started, finished_at: now, latency_ms: Math.max(0, new Date(now).getTime() - new Date(started).getTime()),
  execution_id: String($execution.id), workflow_id: String($workflow.id)
} }];
