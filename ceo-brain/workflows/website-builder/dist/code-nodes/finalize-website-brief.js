var WB_VERSION = 'website-builder-2.0.0';
var WB_SCHEMA_VERSION = '2.0';
var WB_MODES = ['sme', 'medical'];
var WB_SITE_TYPES = ['business_website', 'landing_page', 'online_store', 'web_app', 'portal', 'other'];
var WB_GOALS = ['leads', 'bookings', 'sales', 'information', 'support', 'other'];
var WB_CATEGORIES = ['professional_services', 'beauty', 'property', 'technology', 'consulting', 'retail', 'education', 'home_services', 'b2b', 'local_business', 'food_beverage', 'logistics', 'healthcare', 'other'];
var WB_MISSING = ['business_name', 'industry', 'audience', 'primary_goal', 'pages', 'features', 'integrations', 'style', 'existing_domain', 'logo_and_brand', 'content', 'examples', 'timeline', 'decision_maker', 'competitors', 'existing_website', 'brand_personality', 'doctor_profiles', 'treatments', 'clinic_locations', 'credentials'];
var WB_MAX_PROMPT = 3400;
var WB_LOVABLE_BASE = 'https://lovable.dev/#prompt=';
var WB_ANTI_GENERIC = [
  'dark navy background with a purple/blue gradient',
  'random glowing orbs or blurred colour blobs',
  'generic frosted-glass cards',
  'irrelevant stock photography',
  'one huge generic headline over a hero that says nothing specific',
  'three identical feature boxes in a row',
  'generic SaaS landing-page layout',
  'the same font pairing as every other AI site'
];
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
  var m = text.match(/\b(?:[Ww]e are|[Ww]e're|[Ii] run|[Ii] own|[Mm]y company is|[Oo]ur company is|company called|clinic called|[Oo]ur clinic is|[Ii]'m from)\s+([A-Z][\w&'.\- ]{2,60}?(?:Pte\.? Ltd\.?|Ltd\.?|LLP|Inc\.?|Co\.?|Clinic|Dental|Medical)?)(?=[,.\n]| and | with | that )/);
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
    if (!brief.build_prompt || brief.build_prompt.length > WB_MAX_PROMPT || brief.build_prompt.indexOf('Never use:') === -1) brief.build_prompt = wbBuildPrompt(brief, input);
  }
  if (!fallbackUsed && brief.business_name && !input.company_name) {
    var saidLower = wbText(input).toLowerCase();
    if (saidLower.indexOf(brief.business_name.toLowerCase().replace(/\s+(pte\.?\s*ltd\.?|ltd\.?|llp|inc\.?)$/i, '')) === -1) {
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
// ---- n8n glue ----
const ctx = $('Build Website Brief Prompt').first().json;
const inp = ($input.first() && $input.first().json) || {};
let rawText = null, error = null, model = ctx.config.model, usage = null;
if (inp.error) error = 'model_error: ' + String(inp.error.message || inp.error.description || JSON.stringify(inp.error)).slice(0, 300);
else {
  model = inp.model || model;
  usage = inp.usage || null;
  if (typeof inp.text === 'string' && inp.text.trim()) rawText = inp.text;
  else if (Array.isArray(inp.content)) rawText = inp.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('\n');
  else if (typeof inp.output === 'string') rawText = inp.output;
  if (!rawText) error = 'empty_model_output';
}
const fin = finalizeBrief({ raw_text: rawText, error, input: ctx.input });
const b = fin.brief;
const finishedAt = new Date().toISOString();
const latencyMs = Math.max(0, new Date(finishedAt).getTime() - new Date(ctx.started_at).getTime());
const who = (ctx.input.contact_name || 'lead') + (b.business_name ? ' @ ' + b.business_name : (ctx.input.company_name ? ' @ ' + ctx.input.company_name : ''));
const task = {
  task_id: 'task_web_' + String(ctx.input.lead_id).replace(/[^a-z0-9_]/gi, '').slice(0, 60),
  task_type: 'website_build',
  title: 'APPROVAL: build ' + (b.mode === 'medical' ? 'MEDICAL ' : '') + b.site_type.replace(/_/g, ' ') + ' for ' + who,
  description: 'Mode: ' + b.mode + ' (' + b.industry_category + ') · Goal: ' + b.primary_goal + ' · Pages: ' + b.pages.map((p) => p.name).join(', ') + (b.integrations.length ? ' · Integrations: ' + b.integrations.join(', ') : '') + ' · Missing: ' + (b.missing_information.join(', ') || 'none'),
  status: 'open',
  assigned_to: 'human',
  requires_approval: true,
  approval_reason: 'website_build_requires_owner_approval'
};
const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const li = (arr) => arr.length ? '<ul>' + arr.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '<i>none</i>';
const emailHtml = '<h2>' + esc(task.title) + '</h2>'
  + '<p><b>Lead:</b> ' + esc(ctx.input.contact_name || '-') + ' · ' + esc(ctx.input.email || ctx.input.phone || '-') + ' · via ' + esc(ctx.input.channel) + (ctx.input.test_mode ? ' · <b>TEST</b>' : '') + '</p>'
  + '<p><b>Mode:</b> ' + esc(b.mode === 'medical' ? 'MEDICAL / DOCTOR (stricter content, privacy and compliance rules)' : 'SME') + ' &nbsp; <b>Category:</b> ' + esc(b.industry_category) + ' &nbsp; <b>Site type:</b> ' + esc(b.site_type) + ' &nbsp; <b>Goal:</b> ' + esc(b.primary_goal) + ' &nbsp; <b>Industry:</b> ' + esc(b.industry || '-') + ' &nbsp; <b>Audience:</b> ' + esc(b.audience || '-') + '</p>'
  + '<p><b>Design direction:</b></p>' + li(['Brand personality: ' + b.design_direction.brand_personality, 'Typography: ' + b.design_direction.typography, 'Layout: ' + b.design_direction.layout, 'Imagery: ' + b.design_direction.imagery, 'Motion: ' + b.design_direction.motion, 'Palette: ' + b.design_direction.palette])
  + '<p><b>Pages:</b></p>' + li(b.pages.map((p) => p.name + (p.purpose ? ' — ' + p.purpose : '')))
  + '<p><b>Features:</b></p>' + li(b.features) + '<p><b>Integrations:</b></p>' + li(b.integrations)
  + (b.verification_required.length ? '<p><b>The clinic must verify before patients see it:</b></p>' + li(b.verification_required) : '')
  + '<p><b>Still missing:</b> ' + esc(b.missing_information.join(', ') || 'nothing') + '</p>'
  + '<p><b>John should ask next:</b></p>' + li(b.questions_for_customer)
  + '<p><b>What the customer said:</b><br>' + esc(ctx.input.message) + '</p>'
  + '<p><a href="' + fin.lovable_url + '" style="background:#0a7d3c;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px">OPEN IN LOVABLE (prompt prefilled — press Send there to build)</a></p>'
  + '<p style="color:#555">Nothing has been built. Clicking the button opens Lovable with the prompt below prefilled in your own workspace; pressing Send there is the approval and uses your Lovable credits. Ignore this email to decline.</p>'
  + '<details><summary>Build prompt</summary><pre style="white-space:pre-wrap;font-family:inherit">' + esc(fin.build_prompt) + '</pre></details>'
  + '<details><summary>QA checklist (before the customer sees the mock-up)</summary>' + li(b.qa_checklist) + '</details>'
  + '<p style="color:#888">' + esc(fin.provider) + (fin.fallback_used ? ' (fallback: ' + esc(fin.fallback_reason) + ')' : '') + ' · confidence ' + esc(b.confidence) + ' · ' + esc(b.reasoning) + '<br>lead ' + esc(ctx.input.lead_id) + ' · task ' + esc(task.task_id) + ' · execution ' + esc(ctx.execution_id) + (ctx.input.source_execution_id ? ' (from ' + esc(ctx.input.source_execution_id) + ')' : '') + '</p>';
return [{ json: {
  input: ctx.input, config: ctx.config, execution_id: ctx.execution_id, workflow_id: ctx.workflow_id,
  brief: b, provider: fin.provider, model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason, validation_errors: fin.validation_errors,
  build_prompt: fin.build_prompt, lovable_url: fin.lovable_url, task, usage,
  run_id: 'run_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36),
  started_at: ctx.started_at, finished_at: finishedAt, latency_ms: latencyMs,
  email_subject: (ctx.input.test_mode ? '[TEST] ' : '') + 'CEO Brain: website brief ready — ' + who,
  email_html: emailHtml
} }];
