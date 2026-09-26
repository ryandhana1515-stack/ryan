// Website Builder Agent v2 — FusionTech's premium website production system (SME mode + Medical mode).
// Pure functions, no n8n globals. Same contract as the Sales agent: deterministic fallback that
// produces the SAME schema as the LLM, a validator, design intelligence, a QA checklist and the
// Lovable build-prompt builder. Inlined into the n8n Code nodes by workflows/website-builder/build.js.
// Keep it dependency-free and ES5-compatible (n8n Code node sandbox).
var WB_VERSION = 'website-builder-2.2.0';
var WB_SCHEMA_VERSION = '2.0';
var WB_MODES = ['sme', 'medical'];
var WB_SITE_TYPES = ['business_website', 'landing_page', 'online_store', 'web_app', 'portal', 'other'];
var WB_GOALS = ['leads', 'bookings', 'sales', 'information', 'support', 'other'];
var WB_CATEGORIES = ['professional_services', 'beauty', 'property', 'technology', 'consulting', 'retail', 'education', 'home_services', 'b2b', 'local_business', 'food_beverage', 'logistics', 'healthcare', 'automotive', 'other'];
var WB_MISSING = ['business_name', 'industry', 'audience', 'primary_goal', 'pages', 'features', 'integrations', 'style', 'existing_domain', 'logo_and_brand', 'content', 'examples', 'timeline', 'decision_maker', 'competitors', 'existing_website', 'brand_personality', 'doctor_profiles', 'treatments', 'clinic_locations', 'credentials'];
var WB_MAX_PROMPT = 5200;
var WB_LOVABLE_BASE = 'https://lovable.dev/#prompt=';

// The look every generic AI site has. Every build prompt forbids it and every QA pass checks for it.
var WB_ANTI_GENERIC = [
  'the default navy-to-purple SaaS gradient with nothing behind it',
  'flat black or dark grey boxes and empty dark panels instead of photography',
  'random glowing orbs or blurred colour blobs',
  'generic frosted-glass cards',
  'irrelevant stock photography',
  'one huge generic headline over a hero that says nothing specific',
  'three identical feature boxes in a row',
  'generic SaaS landing-page layout',
  'the same font pairing as every other AI site'
];
// Ryan's standard (2026-09-25): a mock-up must look cinematic and alive, never a set of boxes.
var WB_CINEMATIC = [
  'Photo-led: a full-bleed cinematic photograph (or looping video still) in the hero and at the top of every major section; the imagery carries the page.',
  'Colour with depth: rich colour pulled from the imagery, cinematic gradient overlays (dark-to-transparent, brand-tinted) for legibility and mood; never a flat single-colour block.',
  'Large, confident display typography over the imagery; short lines; generous spacing.',
  'Motion: slow ken-burns or parallax on hero imagery, staggered reveal on scroll, hover lift and image zoom on cards, smooth anchor scrolling.',
  'Every section has a visual: photo, product/vehicle shot, showroom, team or detail; text-only sections are not allowed except legal.',
  'Placeholders for the customer\'s own photos are labelled, but the mock-up itself ships with the generated photography so it already looks finished.'
];

// Design intelligence: a defensible visual direction per business category. The model may refine
// these from the customer's words; the fallback uses them as-is. Nothing here is a fact about the customer.
var WB_DESIGN = {
  professional_services: { personality: 'credible, precise, calm', typography: 'a refined serif for headings with a neutral grotesque for body (e.g. Fraunces + Inter)', layout: 'editorial: generous whitespace, asymmetric two-column sections, a quiet hero with one sentence and one action', imagery: 'real office, people at work, documents and process; no handshake stock photos', motion: 'subtle reveal on scroll, nothing decorative', palette: 'ink and paper neutrals with one deep accent (forest, oxblood or navy used as text, not as a gradient)' },
  beauty: { personality: 'luxurious, warm, sensory', typography: 'high-contrast display serif for headings (e.g. Cormorant / Playfair) with a light sans body', layout: 'image-led with full-bleed photography, thin rules, treatments as an elegant menu', imagery: 'skin, texture, light, the actual salon/clinic; muted, warm grading', motion: 'slow crossfades and soft parallax on hero imagery', palette: 'warm neutrals (sand, cream, blush) with one dark accent' },
  property: { personality: 'premium, trustworthy, aspirational', typography: 'wide geometric sans for headings (e.g. Manrope / DM Sans) with tabular numerals for prices and sizes', layout: 'listing grid with strong photography, map-first search, agent profile block', imagery: 'real listings and neighbourhoods, wide architectural shots', motion: 'image galleries and hover lift on listing cards only', palette: 'charcoal and off-white with a single warm metallic accent' },
  technology: { personality: 'clear, confident, modern', typography: 'clean grotesque throughout (e.g. Inter / Geist), monospace for technical detail', layout: 'product-first: a real product visual in the hero, then how it works step by step', imagery: 'product screenshots and diagrams, not abstract 3D shapes', motion: 'purposeful: a product walkthrough or animated diagram', palette: 'light, mostly white with one saturated accent and dark type; no gradients' },
  consulting: { personality: 'authoritative, thoughtful, human', typography: 'serif headings with a humanist sans body', layout: 'long-form editorial with pull quotes, case studies as narratives, a clear engagement process', imagery: 'the consultants themselves, whiteboards, client sites', motion: 'minimal', palette: 'deep neutral (graphite or navy as text) on warm white with a restrained accent' },
  retail: { personality: 'vibrant, friendly, product-obsessed', typography: 'bold sans headings with a readable body, clear price typography', layout: 'merchandised: featured collections, product grid, promotions as a strip not a popup', imagery: 'the actual products on clean backgrounds plus lifestyle context', motion: 'product hover states and quick-view', palette: 'derived from the products/brand; high contrast for prices and buttons' },
  education: { personality: 'encouraging, structured, credible', typography: 'friendly rounded sans for headings with a highly legible body', layout: 'programmes as clear cards with outcomes, schedule and enrolment steps', imagery: 'real classrooms, students, instructors', motion: 'light', palette: 'one confident primary colour with plenty of white and dark type' },
  home_services: { personality: 'dependable, local, straightforward', typography: 'sturdy sans headings, large tap targets, phone number always visible', layout: 'mobile-first: what we do, service area, proof, call/WhatsApp buttons pinned', imagery: 'the crew, the vans, before/after work photos', motion: 'none beyond feedback states', palette: 'one strong brand colour, dark text, white background' },
  b2b: { personality: 'competent, specific, results-focused', typography: 'neutral sans with strong hierarchy and tabular numerals', layout: 'problem → solution → proof → process; capability pages per service line', imagery: 'facilities, equipment, team, real outputs', motion: 'restrained', palette: 'industrial neutrals with one signal colour' },
  local_business: { personality: 'welcoming, genuine, nearby', typography: 'warm sans, larger body text', layout: 'single clear path: what, where, when, how to contact; map and hours above the fold on mobile', imagery: 'the actual shop, owners, products', motion: 'none needed', palette: 'drawn from the shop front or logo' },
  food_beverage: { personality: 'appetising, lively, textured', typography: 'characterful display face for headings with a simple body', layout: 'menu-first, photography-heavy, reservations/orders one tap away', imagery: 'the food and the room, shot warm', motion: 'gentle image reveals', palette: 'rich, from the cuisine (deep greens, terracotta, cream)' },
  logistics: { personality: 'reliable, fast, transparent', typography: 'condensed sans headings, tabular numerals for tracking numbers and times', layout: 'action-first: quote and tracking forms in the hero, coverage map, process timeline', imagery: 'fleet, warehouse, real operations', motion: 'a tracking-timeline animation, otherwise minimal', palette: 'dark text on white with one high-visibility accent' },
  automotive: { personality: 'cinematic, premium, exhilarating', typography: 'wide geometric display sans for headings (e.g. Manrope / Sora) with a clean grotesque body (e.g. Inter), tabular numerals for specs', layout: 'film-like: full-bleed hero of the car with a cinematic gradient overlay and one action (Book a test drive); model showcase with large imagery and horizontal scroll; showroom and service sections with photography; team; booking; WhatsApp bar on mobile', imagery: 'cinematic photography of the actual models and showroom (dusk light, wet asphalt reflections, studio rim light); generated hero and section imagery until the dealership supplies its own; no clip-art cars', motion: 'ken-burns on the hero, parallax on section imagery, staggered reveal, hover zoom on model cards', palette: 'deep charcoal into midnight blue gradients with a warm metallic (champagne / brushed steel) accent and bright white type; colour comes from the photography, never flat black panels' },
  healthcare: { personality: 'clinical, calm, reassuring', typography: 'clean humanist sans (e.g. Source Sans / Nunito Sans) with excellent legibility, larger body size', layout: 'patient-first: doctors, treatments, locations and appointment booking within one scroll; information architecture over decoration', imagery: 'the real clinic, real practitioners (with consent), clean interiors; no stock models in white coats', motion: 'minimal; never on medical content', palette: 'soft neutrals with one calm accent (teal, sage or deep blue as text/buttons); high contrast for readability' },
  other: { personality: 'clear, credible, specific to the business', typography: 'a deliberate pairing chosen for the brand, not a default', layout: 'intentional hierarchy: one message, one action per section', imagery: 'the actual business only', motion: 'only where it helps', palette: 'chosen from the brand or business, never a default gradient' }
};

var WB_QA_BASE = ['Desktop and mobile responsiveness (375px, 768px, 1280px)', 'Navigation: every link works, active states, no dead menu items', 'Spacing and rhythm consistent across sections', 'Typography hierarchy: one display face, one body face, sizes on a scale', 'Colour contrast meets WCAG AA for text and buttons', 'Accessibility basics: alt text, focus states, labelled form fields, semantic headings', 'No broken links or images', 'Forms submit to the placeholder endpoint and show a success state', 'Primary call to action visible above the fold on mobile', 'Image quality and relevance (no irrelevant stock photos)', 'Copy accuracy: every fact traces to the customer or is a labelled [PLACEHOLDER]', 'Performance: images sized/compressed, no layout shift', 'SEO fundamentals: title, description, one H1 per page, sitemap', 'Metadata and social preview set', 'Contact details present (or placeholders) in header/footer', 'Brand consistency across pages', 'Visual hierarchy: the eye lands on the one thing that matters', 'Animations purposeful and not distracting', 'No prices, guarantees, awards, testimonials or client logos that the customer did not supply', 'No placeholder content left unlabelled', 'None of the generic AI patterns (' + WB_ANTI_GENERIC.slice(0, 3).join('; ') + ', …)'];
var WB_QA_MEDICAL = ['Medical content verification: every credential, specialty, treatment and outcome statement marked [VERIFY WITH CLINIC] until confirmed', 'No fabricated success rates, testimonials, certifications or treatment outcomes', 'Appropriate medical disclaimer on treatment pages (information, not diagnosis)', 'Privacy notice for patient information and forms', 'Advertising and claims flagged for jurisdiction-specific compliance review before publishing', 'Doctor profiles show only supplied credentials and registration details'];
var WB_MEDICAL_CONTENT_RULES = ['Never fabricate doctor qualifications, medical claims, success rates, testimonials, certifications or treatment outcomes.', 'Mark every missing medical fact [VERIFY WITH CLINIC]; the customer verifies before anything is shown to patients.', 'Include an information-only medical disclaimer and a privacy notice for patient forms.', 'Advertising claims must pass a jurisdiction-specific compliance review before publishing.', 'Language: reassuring and plain; no fear-based or superlative claims.'];
var WB_SME_CONTENT_RULES = ['Every fact not given by the customer is a clearly marked [PLACEHOLDER].', 'No invented testimonials, awards, prices, client logos or delivery dates.', 'Copy is specific to this business: name the audience, the service and the outcome in their words.'];

function wbStr(v, max) {
  if (v === undefined || v === null) return null;
  var s = String(v).replace(/\s+/g, ' ').trim();
  if (!s) return null;
  return max && s.length > max ? s.slice(0, max) : s;
}
function wbStrArr(v, max) {
  if (!Array.isArray(v)) return [];
  var out = [];
  for (var i = 0; i < v.length && out.length < (max || 20); i++) { var s = wbStr(v[i], 240); if (s && out.indexOf(s) === -1) out.push(s); }
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

var WB_MEDICAL_RE = /\b(doctor|doctors|dr\.?|clinic|clinics|dental|dentist|orthodont|aesthetic (clinic|practice)|medical|physician|specialist|surgeon|surgery|healthcare|health care|hospital|physio(therapy)?|chiropract|tcm|traditional chinese medicine|dermatolog|paediatric|pediatric|gynae|gynec|cardiolog|oncolog|ophthalmolog|optometr|patients?)\b/i;
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
  ['logistics', /\b(logistic|delivery|deliveries|courier|freight|shipping|shipment|parcel|warehouse|driver|fleet|last.mile)\b/i],
  ['home_services', /\b(plumb|electric(ian|al)|aircon|air-con|renovat|contractor|cleaning|pest|handyman|mover|moving|landscap|roofing|painter)\b/i],
  ['education', /\b(tuition|tutor|school|academy|course|training centre|enrichment|students?|learning|kindergarten|preschool)\b/i],
  ['retail', /\b(retail|shop|store|boutique|products?|merchandise|e-?commerce|online store)\b/i],
  ['technology', /\b(software|saas|app\b|platform|startup|tech|it services|cybersecurity|cloud)\b/i],
  ['consulting', /\b(consult(ing|ant|ancy)|advisory|advisor|strategy firm)\b/i],
  ['professional_services', /\b(law firm|lawyer|legal|accountant|accounting firm|audit|tax|architect|engineering firm|insurance|financial advis|corporate secretar)\b/i],
  ['b2b', /\b(manufactur|factory|wholesale|supplier|distributor|industrial|b2b|oem|fabricat|precision)\b/i]
];
function wbDetectCategory(text, industry) {
  var t = String(text || '') + ' ' + String(industry || '');
  for (var i = 0; i < WB_CATEGORY_RULES.length; i++) if (WB_CATEGORY_RULES[i][1].test(t)) return WB_CATEGORY_RULES[i][0];
  return /\b(local|neighbourhood|neighborhood|heartland)\b/i.test(t) ? 'local_business' : 'other';
}

function wbDetectSiteType(text) {
  if (/online store|e-?commerce|sell (products )?online|shop online|webshop|checkout/i.test(text)) return 'online_store';
  if (/landing page/i.test(text)) return 'landing_page';
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
var WB_INTEGRATIONS = [
  [/whatsapp/i, 'WhatsApp click-to-chat'],
  [/book(ing)?|appointment|calendar|schedul/i, 'Appointment booking / calendar'],
  [/paynow|stripe|payment|pay online|checkout/i, 'Online payments'],
  [/\bcrm\b|hubspot|salesforce|pipedrive/i, 'CRM lead sync'],
  [/google maps|location|directions|outlet|clinic/i, 'Google Maps'],
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
function wbDefaultPages(siteType, goal, mode) {
  if (mode === 'medical') {
    var med = [{ name: 'Home', purpose: 'Who the clinic is, the reassurance a patient needs, book an appointment' }, { name: 'Our Doctors', purpose: 'Doctor profiles: name, specialty, credentials [VERIFY WITH CLINIC], languages' }, { name: 'Treatments & Services', purpose: 'One section per treatment: what it is, who it is for, what to expect' }, { name: 'Clinic & Locations', purpose: 'Addresses, opening hours, map, parking, accessibility' }, { name: 'Book an Appointment', purpose: 'Booking form or link; phone and WhatsApp alternatives' }, { name: 'Patient Information & FAQ', purpose: 'First visit, fees policy placeholder, insurance, privacy notice, disclaimers' }, { name: 'Contact', purpose: 'Contact details and enquiry form' }];
    if (siteType === 'portal' || siteType === 'web_app') med.splice(5, 0, { name: 'Patient Portal (login)', purpose: 'Appointments and documents for registered patients' });
    return med;
  }
  if (siteType === 'landing_page') return [{ name: 'Landing page', purpose: 'Single page: one specific promise, proof, how it works, one call to action' }];
  if (siteType === 'online_store') return [{ name: 'Home', purpose: 'Featured collections and the reason to buy here' }, { name: 'Shop', purpose: 'Product catalogue with categories and filters' }, { name: 'Product', purpose: 'Product detail, real photos, add to cart' }, { name: 'Cart & Checkout', purpose: 'Purchase flow' }, { name: 'About', purpose: 'Brand story in the owner\'s words' }, { name: 'Contact', purpose: 'Contact details and enquiry form' }];
  if (siteType === 'web_app' || siteType === 'portal') return [{ name: 'Home', purpose: 'What the service does, for whom, and how to start' }, { name: 'Login / Sign up', purpose: 'Customer accounts' }, { name: 'Dashboard', purpose: 'Main customer workspace' }, { name: 'Contact', purpose: 'Support and enquiries' }];
  var pages = [{ name: 'Home', purpose: 'Who you are, who you serve, the one thing a visitor should do' }, { name: 'Services', purpose: 'One section per service with outcome and process' }, { name: 'About', purpose: 'The real story, team, credentials the customer supplies' }, { name: 'Contact', purpose: 'Enquiry form, WhatsApp, map, opening hours' }];
  if (goal === 'bookings') pages.splice(3, 0, { name: 'Book', purpose: 'Appointment booking' });
  if (goal === 'leads') pages.splice(3, 0, { name: 'Get a Quote', purpose: 'Structured quote request form' });
  return pages;
}
function wbGuessBusinessName(input, text) {
  if (input.company_name) return wbStr(input.company_name, 160);
  var m = text.match(/\b(?:[Ww]e are|[Ww]e're|[Ii] run|[Ii] own|[Mm]y company is|[Oo]ur company is|company called|clinic called|[Oo]ur clinic is|[Ii]'m from|[Ii] am from|[Ii]'m [A-Z][a-z]+ from|[Ii] am [A-Z][a-z]+ from|calling from|[Tt]his is [A-Z][a-z]+ from)\s+([A-Z][\w&'.\- ]{2,60}?(?:Pte\.? Ltd\.?|Ltd\.?|LLP|Inc\.?|Co\.?|Clinic|Dental|Medical|Motors|Group|Agency|Studio)?)(?=[,.\n]| and | with | that | in | based |; )/);
  return m ? wbStr(m[1], 160) : null;
}
function wbDesignFor(category) { return WB_DESIGN[category] || WB_DESIGN.other; }
function wbQaChecklist(mode) { return mode === 'medical' ? WB_QA_BASE.concat(WB_QA_MEDICAL) : WB_QA_BASE.slice(); }
function wbContentRules(mode) { return mode === 'medical' ? WB_SME_CONTENT_RULES.concat(WB_MEDICAL_CONTENT_RULES) : WB_SME_CONTENT_RULES.slice(); }
function wbVerificationFor(mode, brief) {
  if (mode !== 'medical') return [];
  return ['Doctor names, qualifications and registration numbers', 'Specialties and treatments actually offered', 'Clinic addresses, opening hours and contact details', 'Any statement about outcomes, safety or success', 'Testimonials, certifications and affiliations', 'Fees and insurance information (never shown until confirmed)'];
}

/** Deterministic brief when the model is unavailable or returns garbage. Never invents facts. */
function wbFallbackBrief(input) {
  input = input || {};
  var text = wbText(input);
  var ex = (input.extracted && typeof input.extracted === 'object') ? input.extracted : {};
  var industry = wbStr(input.industry || ex.industry, 80);
  var mode = wbDetectMode(text, industry);
  var category = wbDetectCategory(text, industry);
  var siteType = wbDetectSiteType(text);
  var goal = wbDetectGoal(text, mode);
  var integrations = wbDetectIntegrations(text);
  if (mode === 'medical' && integrations.indexOf('Appointment booking / calendar') === -1) integrations.unshift('Appointment booking / calendar');
  var businessName = wbGuessBusinessName(input, text);
  var pages = wbDefaultPages(siteType, goal, mode);
  var d = wbDesignFor(category);
  var features = [];
  if (goal === 'leads') features.push('Enquiry form that emails the owner');
  if (goal === 'bookings') features.push('Booking form with date and time');
  if (goal === 'sales') features.push('Product catalogue');
  if (mode === 'medical') features.push('Doctor profile cards', 'Treatment pages with information-only disclaimer', 'Privacy notice');
  features.push('Mobile-first responsive layout', 'Basic SEO (titles, descriptions, sitemap)');
  var missing = ['audience', 'style', 'existing_domain', 'logo_and_brand', 'content', 'examples', 'timeline', 'competitors', 'existing_website'];
  if (!businessName) missing.unshift('business_name');
  if (!industry) missing.unshift('industry');
  if (mode === 'medical') missing.push('doctor_profiles', 'treatments', 'clinic_locations', 'credentials');
  if (ex.decision_maker !== true && ex.decision_maker !== false) missing.push('decision_maker');
  var questions = [];
  if (!businessName) questions.push('What is the name of your ' + (mode === 'medical' ? 'clinic' : 'business') + ', and do you already have a domain or website?');
  if (mode === 'medical') questions.push('Which doctors and treatments should the site feature, and at which clinic locations?');
  else questions.push('Who is the website mainly for, and what should a visitor do first (enquire, book, buy)?');
  questions.push('Do you have a logo, brand colours, photos of your own, and any websites you admire?');
  var brief = {
    schema_version: WB_SCHEMA_VERSION,
    mode: mode,
    industry_category: category,
    site_type: siteType,
    business_name: businessName,
    industry: industry,
    audience: null,
    primary_goal: goal,
    design_direction: { brand_personality: d.personality, typography: d.typography, layout: d.layout, imagery: d.imagery, motion: d.motion, palette: d.palette, avoid: WB_ANTI_GENERIC.slice() },
    pages: pages,
    features: features,
    integrations: integrations,
    style: { tone: null, colours: null, references: [] },
    existing_assets: { domain: null, logo: null, brand_colours: null, content: null },
    content_rules: wbContentRules(mode),
    verification_required: wbVerificationFor(mode),
    qa_checklist: wbQaChecklist(mode),
    content_notes: wbStr(input.message, 600),
    questions_for_customer: questions.slice(0, 3),
    missing_information: missing,
    build_prompt: '',
    confidence: 0.35,
    reasoning: 'Deterministic fallback brief (' + WB_VERSION + '): mode, category, site type, goal and integrations inferred from the customer\'s own words; design direction is the standard for this category; pages and features are proposals, not customer statements.'
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
  var mode = WB_MODES.indexOf(b.mode) !== -1 ? b.mode : 'sme';
  var category = WB_CATEGORIES.indexOf(b.industry_category) !== -1 ? b.industry_category : (mode === 'medical' ? 'healthcare' : 'other');
  var dd = (b.design_direction && typeof b.design_direction === 'object') ? b.design_direction : {};
  var d = wbDesignFor(category);
  var conf = Number(b.confidence);
  return {
    schema_version: WB_SCHEMA_VERSION,
    mode: mode,
    industry_category: category,
    site_type: WB_SITE_TYPES.indexOf(b.site_type) !== -1 ? b.site_type : 'other',
    business_name: wbStr(b.business_name, 160),
    industry: wbStr(b.industry, 80),
    audience: wbStr(b.audience, 300),
    primary_goal: WB_GOALS.indexOf(b.primary_goal) !== -1 ? b.primary_goal : 'other',
    design_direction: {
      brand_personality: wbStr(dd.brand_personality, 160) || d.personality,
      typography: wbStr(dd.typography, 240) || d.typography,
      layout: wbStr(dd.layout, 300) || d.layout,
      imagery: wbStr(dd.imagery, 240) || d.imagery,
      motion: wbStr(dd.motion, 200) || d.motion,
      palette: wbStr(dd.palette, 200) || d.palette,
      avoid: WB_ANTI_GENERIC.slice()
    },
    pages: pages,
    features: wbStrArr(b.features, 20),
    integrations: wbStrArr(b.integrations, 15),
    style: { tone: wbStr(style.tone, 120), colours: wbStr(style.colours, 120), references: wbStrArr(style.references, 5) },
    existing_assets: { domain: wbBoolOrNull(assets.domain), logo: wbBoolOrNull(assets.logo), brand_colours: wbBoolOrNull(assets.brand_colours), content: wbBoolOrNull(assets.content) },
    content_rules: wbContentRules(mode),
    verification_required: wbVerificationFor(mode).concat(wbStrArr(b.verification_required, 10)).filter(function (x, i, a) { return a.indexOf(x) === i; }),
    qa_checklist: wbQaChecklist(mode),
    content_notes: wbStr(b.content_notes, 1200),
    questions_for_customer: wbStrArr(b.questions_for_customer, 3),
    missing_information: wbStrArr(b.missing_information, 24).filter(function (m) { return WB_MISSING.indexOf(m) !== -1; }),
    build_prompt: typeof b.build_prompt === 'string' ? b.build_prompt.trim() : '',
    confidence: isNaN(conf) ? 0 : Math.max(0, Math.min(1, conf)),
    reasoning: wbStr(b.reasoning, 800) || ''
  };
}

function wbValidate(b) {
  var errs = [];
  if (!b || typeof b !== 'object') return ['not_an_object'];
  if (b.schema_version !== WB_SCHEMA_VERSION) errs.push('schema_version');
  if (WB_MODES.indexOf(b.mode) === -1) errs.push('mode');
  if (WB_CATEGORIES.indexOf(b.industry_category) === -1) errs.push('industry_category');
  if (WB_SITE_TYPES.indexOf(b.site_type) === -1) errs.push('site_type');
  if (WB_GOALS.indexOf(b.primary_goal) === -1) errs.push('primary_goal');
  if (!b.design_direction || typeof b.design_direction !== 'object' || !b.design_direction.brand_personality) errs.push('design_direction');
  if (!Array.isArray(b.pages) || b.pages.length < 1) errs.push('pages_empty');
  if (!Array.isArray(b.features)) errs.push('features');
  if (!Array.isArray(b.integrations)) errs.push('integrations');
  if (!Array.isArray(b.missing_information)) errs.push('missing_information');
  if (!Array.isArray(b.qa_checklist) || b.qa_checklist.length < 5) errs.push('qa_checklist');
  if (!Array.isArray(b.questions_for_customer) || b.questions_for_customer.length > 3) errs.push('questions_for_customer');
  if (typeof b.confidence !== 'number' || b.confidence < 0 || b.confidence > 1) errs.push('confidence');
  if (typeof b.build_prompt !== 'string') errs.push('build_prompt');
  return errs;
}

/** Self-contained prompt for Lovable (Build-with-URL). Facts only from the brief; placeholders are labelled; the generic AI look is forbidden. */
function wbBuildPrompt(brief, input) {
  input = input || {};
  var med = brief.mode === 'medical';
  var name = brief.business_name || (med ? '[PLACEHOLDER: clinic name]' : '[PLACEHOLDER: business name]');
  var industry = brief.industry || brief.industry_category.replace(/_/g, ' ');
  var d = brief.design_direction;
  var lines = [];
  lines.push('Build a premium ' + brief.site_type.replace(/_/g, ' ') + ' for ' + name + ' (' + industry + ', Singapore). It must look like an agency-grade site produced by a brand strategist, UX/UI designer, copywriter, art director and front-end engineer — never an AI template.');
  lines.push('Primary goal: ' + brief.primary_goal + (brief.audience ? '. Audience: ' + brief.audience : '') + '.');
  lines.push('Brand personality: ' + d.brand_personality + '. Typography: ' + d.typography + '. Layout: ' + d.layout + '. Imagery: ' + d.imagery + '. Motion: ' + d.motion + '. Palette: ' + d.palette + '.');
  lines.push('Look and feel (mandatory): ' + WB_CINEMATIC.join(' '));
  lines.push('Never use: ' + WB_ANTI_GENERIC.join('; ') + '.');
  lines.push('Pages: ' + brief.pages.map(function (p) { return p.name + (p.purpose ? ' (' + p.purpose + ')' : ''); }).join('; ') + '.');
  if (brief.features.length) lines.push('Features: ' + brief.features.join('; ') + '.');
  if (brief.integrations.length) lines.push('Integrations (build the UI + stub endpoints, no real keys): ' + brief.integrations.join('; ') + '.');
  var st = [];
  if (brief.style.tone) st.push('tone ' + brief.style.tone);
  if (brief.style.colours) st.push('brand colours ' + brief.style.colours);
  if (brief.style.references.length) st.push('customer likes ' + brief.style.references.join(', '));
  if (st.length) lines.push('Customer style notes: ' + st.join(', ') + '.');
  if (brief.content_notes) lines.push('What the customer said: "' + brief.content_notes.slice(0, 260) + '"');
  lines.push('Content rules: ' + brief.content_rules.join(' '));
  lines.push('Engineering: React + Tailwind; mobile-first; semantic HTML; WCAG AA contrast; fast (sized images, no layout shift); SEO meta tags and one H1 per page; forms post to a placeholder webhook and show a success state; WhatsApp click-to-chat if listed; footer with contact placeholders.' + (med ? ' Add an information-only medical disclaimer and a privacy notice.' : ''));
  var prompt = lines.join('\n');
  if (prompt.length > WB_MAX_PROMPT) prompt = prompt.slice(0, WB_MAX_PROMPT - 1) + '…';
  return prompt;
}
/** Photography the mock-up ships with: 3 cinematic shots per site, generated by the build runner (Higgsfield / Kling). No text, logos or plates in the images. */
function wbImageShots(brief, input) {
  input = input || {};
  var said = wbText(input);
  var brand = (said.match(/\b(bmw|mercedes(?:-benz)?|audi|toyota|honda|tesla|porsche|lexus|hyundai|kia|mazda|volvo|nissan)\b/i) || [null])[0];
  var cat = brief.industry_category;
  var industry = brief.industry || cat.replace(/_/g, ' ');
  var name = brief.business_name || industry;
  var base = ', Singapore, photorealistic, cinematic lighting, shallow depth of field, editorial photography, 35mm, no text, no logos, no watermarks, no license plates';
  var shots;
  if (cat === 'automotive') {
    var car = brand ? brand.toUpperCase() : 'premium car';
    shots = [
      { key: 'hero', aspect_ratio: '16:9', prompt: 'Cinematic wide shot of a new ' + car + ' in a glass showroom at dusk, city lights reflecting on wet asphalt outside, dramatic rim lighting on the bodywork, deep charcoal and midnight blue tones with warm metallic highlights' + base },
      { key: 'section', aspect_ratio: '16:9', prompt: 'Low-angle three-quarter view of a ' + car + ' driving through Singapore at blue hour, motion blur on the road, headlights on, cinematic colour grade' + base },
      { key: 'detail', aspect_ratio: '3:2', prompt: 'Close-up detail of a ' + car + ' interior, leather and stitching, ambient cabin lighting, premium showroom mood' + base }
    ];
  } else if (brief.mode === 'medical') {
    shots = [
      { key: 'hero', aspect_ratio: '16:9', prompt: 'Calm modern clinic reception with warm natural light, soft neutrals with one sage accent, plants, clean lines, empty of people' + base },
      { key: 'section', aspect_ratio: '16:9', prompt: 'Bright treatment room in a modern Singapore clinic, clean equipment, soft daylight, reassuring atmosphere, no people' + base },
      { key: 'detail', aspect_ratio: '3:2', prompt: 'Close-up of a clinician\'s hands in a modern clinic setting, gloves, soft light, professional and calm, face not visible' + base }
    ];
  } else {
    var d = brief.design_direction;
    shots = [
      { key: 'hero', aspect_ratio: '16:9', prompt: 'Cinematic wide establishing shot for a ' + industry + ' business (' + name + '): ' + d.imagery + '; mood ' + d.brand_personality + '; palette ' + d.palette + base },
      { key: 'section', aspect_ratio: '16:9', prompt: 'Environmental photograph showing the work of a ' + industry + ' business in Singapore, people at work seen from behind or at distance, natural light, ' + d.brand_personality + base },
      { key: 'detail', aspect_ratio: '3:2', prompt: 'Close-up detail shot related to ' + industry + ' (tools, product, texture or space), shallow depth of field, ' + d.palette + base }
    ];
  }
  return shots;
}
/** Two variations per mock-up (Ryan, ADR-2 2026-09-26). A = cinematic scroll film site (Higgsfield, premium), B = photo-led (Lovable). */
var WB_VARIATIONS = [
  { key: 'cinematic_scroll', label: 'Cinematic scroll film site', tier: 'premium', tool: 'higgsfield_website_builder', template: 'scroll-scrub', description: 'A generated cinematic film of the business (about 15 seconds, one continuous take) that plays as the visitor scrolls; the site sections are revealed inside the film. Our premium option.' },
  { key: 'photo_led', label: 'Photo-led site', tier: 'standard', tool: 'lovable', template: null, description: 'Full-bleed generated photography with cinematic gradient overlays, rich colour and motion; forms and booking flows.' }
];
/** Scenes for variation A single-take film (no text, no logos; the business own world). */
function wbFilmBrief(brief, input) {
  var shots = wbImageShots(brief, input);
  var hero = shots[0] ? shots[0].prompt : '';
  var section = shots[1] ? shots[1].prompt : '';
  var detail = shots[2] ? shots[2].prompt : '';
  return {
    duration_seconds: 15,
    mode: 'single-shot',
    scenes: [
      { at: '0-5s', scene: hero, section: 'hero: the one message and one action' },
      { at: '5-10s', scene: section, section: brief.mode === 'medical' ? 'doctors and treatments' : 'what we offer / models or services' },
      { at: '10-15s', scene: detail, section: brief.primary_goal === 'bookings' ? 'book' : 'enquire / contact' }
    ],
    rules: ['no text, logos, plates or faces in the film', 'the camera moves through the real world of this business', 'tone: ' + brief.design_direction.brand_personality, 'palette: ' + brief.design_direction.palette]
  };
}
/** The build starts automatically when the brief names the business and what the site is for (Ryan, 2026-09-25: no approvals). */
function wbReadyToBuild(brief) {
  var missing = [];
  if (!brief.business_name) missing.push('business_name');
  if (!brief.industry && brief.industry_category === 'other') missing.push('industry');
  if (brief.site_type === 'other') missing.push('site_type');
  return { ready: missing.length === 0, missing: missing };
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
  else {
    // Mode guard: medical language in the customer's words always forces medical mode (stricter rules), never the reverse.
    var said = wbText(input);
    if (brief.mode !== 'medical' && wbDetectMode(said, input.industry) === 'medical') {
      brief.mode = 'medical';
      brief.industry_category = 'healthcare';
      brief.content_rules = wbContentRules('medical');
      brief.verification_required = wbVerificationFor('medical');
      brief.qa_checklist = wbQaChecklist('medical');
      brief.reasoning = (brief.reasoning ? brief.reasoning + ' ' : '') + '[guardrail] medical mode enforced from the customer\'s words.';
      brief.build_prompt = '';
    }
    // The build prompt must carry the design direction and the anti-generic rules; regenerate if the model's is thin or too long.
    if (!brief.build_prompt || brief.build_prompt.length > WB_MAX_PROMPT || brief.build_prompt.indexOf('Never use:') === -1) brief.build_prompt = wbBuildPrompt(brief, input);
  }
  // Facts guard: the model may propose pages/features, but must not invent a business name the customer never gave.
  if (!fallbackUsed && brief.business_name && !input.company_name) {
    var saidLower = wbText(input).toLowerCase();
    if (saidLower.indexOf(brief.business_name.toLowerCase().replace(/\s+(pte\.?\s*ltd\.?|ltd\.?|llp|inc\.?)$/i, '')) === -1) {
      brief.business_name = null;
      if (brief.missing_information.indexOf('business_name') === -1) brief.missing_information.unshift('business_name');
      brief.reasoning = (brief.reasoning ? brief.reasoning + ' ' : '') + '[guardrail] business_name removed: not present in the customer\'s words.';
      brief.build_prompt = wbBuildPrompt(brief, input);
    }
  }
  var readiness = wbReadyToBuild(brief);
  return {
    brief: brief,
    ready_to_build: readiness.ready,
    missing_for_build: readiness.missing,
    image_shots: wbImageShots(brief, input),
    variations: WB_VARIATIONS.map(function (v) { return { key: v.key, label: v.label, tier: v.tier, tool: v.tool, template: v.template, description: v.description }; }),
    film_brief: wbFilmBrief(brief, input),
    provider: fallbackUsed ? 'fallback' : 'anthropic',
    fallback_used: fallbackUsed,
    fallback_reason: fallbackReason,
    validation_errors: validationErrors,
    build_prompt: brief.build_prompt,
    lovable_url: wbLovableUrl(brief.build_prompt)
  };
}

// ---- Node module wrapper (stripped by build.js) ----
module.exports = { WB_VERSION, WB_SCHEMA_VERSION, WB_MODES, WB_SITE_TYPES, WB_GOALS, WB_CATEGORIES, WB_MISSING, WB_ANTI_GENERIC, WB_CINEMATIC, WB_DESIGN, wbText, wbDetectMode, wbDetectCategory, wbGuessBusinessName, wbDetectSiteType, wbDetectGoal, wbImageShots, wbReadyToBuild, WB_VARIATIONS, wbFilmBrief, wbDesignFor, wbQaChecklist, wbContentRules, wbFallbackBrief, wbCoerce, wbValidate, wbBuildPrompt, wbLovableUrl, wbParseJson, finalizeBrief };
