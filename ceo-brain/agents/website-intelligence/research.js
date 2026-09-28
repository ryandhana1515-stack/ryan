/**
 * Website Intelligence & Conversion Strategist (internal agent, ADR-3) — pure functions, no I/O.
 * John's hand-off → search plan → identify the company → read its public pages → digest → prompts →
 * WEBSITE_CREATOR_BRIEF (JSON + text) for the Website Builder. Never talks to the customer; never invents facts.
 * Role prompt (Ryan, verbatim): zaphiel/vault/10_Agents/05a_Website_Intelligence — internal role prompt.md (read live).
 */
var WR_VERSION = 'website-intelligence-1.1.0';
var WR_MAX_DIGEST = 9000;
var WR_MAX_PAGE_TEXT = 3500;
var WR_SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'youtube.com', 'x.com', 'twitter.com'];
var WR_DIRECTORY_HOSTS = ['google.com', 'maps.google', 'yelp.com', 'tripadvisor', 'wikipedia.org', 'yellowpages', 'sgpbusiness', 'recordowl', 'streetdirectory', 'carousell', 'shopee', 'lazada', 'glassdoor', 'indeed', 'bing.com', 'duckduckgo', 'reddit.com', 'hardwarezone', 'mycareersfuture', 'acra.gov.sg', 'trustpilot', 'sgcarmart'];
var WR_PAGE_RE = /(about|service|product|treatment|contact|faq|pricing|price|package|booking|book|project|portfolio|case|testimonial|review|menu|shop|gallery|location|collection|team|doctor|dentist|outlet|branch|clinic|our-work|showroom|store)/i;
var WR_INSTRUCTION = 'WEBSITE CREATOR INSTRUCTION\n\nUsing the verified business intelligence above, create a premium, modern, mobile-responsive, conversion-focused website mock-up specifically for this company.\n\nDo NOT create a generic informational website.\n\nThe design and copy structure must be based on:\n\n* the company\'s actual business\n* its target customers\n* its services/products\n* its conversion objective\n* customer buying motivations\n* trust requirements\n* customer objections\n* the company\'s brand\n* the research supplied in this brief\n\nThe website must make the visitor understand:\n\n1. What this company does.\n2. Who it helps.\n3. Why the visitor should care.\n4. Why the company can be trusted.\n5. What action the visitor should take next.\n\nBuild the FUNNEL_PLAN as well (landing page, qualifying form or quiz, thank-you or booking page, follow-up), follow the CONVERSION_STRATEGY section by section, and build the 3D parallax scroll film the MOTION_3D_DIRECTION describes (a Kling film scrubbed by the scroll, layered depth parallax, sections and CTAs over the film) without weakening the sales structure. For medical clients follow the MEDICAL_VISUAL_DIRECTION exactly: photorealistic, medically accurate anatomy (for example the heart beating with blood flowing through the arteries and vessels), as the opening scene of the scroll film (a Kling video scrubbed by the scroll, the still photo as its poster); never cartoon.\n\nCreate strong conversion paths through the appropriate combination of:\n\n* CTA buttons\n* WhatsApp\n* forms\n* appointments\n* quotations\n* consultation requests\n* calls\n* purchases\n\nDo not fabricate company facts.\n\nUse clearly marked placeholders for unavailable content.\n\nOnce the mock-up is completed, DO NOT send it to the customer.\n\nReturn the completed website/mock-up URL and a short internal summary to:\n\nJOHN — FUSION AI SALES AGENT';
// ---- Sales strategy the creator must build (Ryan, 2026-09-26: funnels, the most high-converting sales sites, 3D, realistic anatomy for doctors) ----
// Medical specialty -> photorealistic, medically accurate anatomy (educational, never cartoon or low-poly 3D).
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
  [/property|properties|real estate|realtor|condo|landed|villa|bungalow|penthouse|apartment|show ?flat|new launch|interior design/i, 'cinematic home walkthrough scrubbed by the scroll: from the street and the facade at golden hour, through the front door, into the living room, kitchen and bedrooms, ending on the view from the balcony; a floor-plan mini-map shows where the visitor is; generated visuals labelled "Artist\'s impression"'],
  [/restaurant|cafe|f&b|food|bakery|catering/i, 'slow-motion 3D of the signature dish being assembled ingredient by ingredient, steam and texture in macro'],
  [/logistic|delivery|courier|freight|warehouse/i, 'a 3D map of Singapore with parcels and vehicles moving along live routes as the visitor scrolls'],
  [/salon|spa|beauty|wellness|nail|hair/i, 'slow-motion macro of textures and treatment rituals, soft light moving across skin and product'],
  [/software|saas|tech|app|platform/i, 'the product interface floating in 3D, panels separating to show how each part works as the visitor scrolls'],
  [/school|tuition|academy|education|course/i, 'a 3D journey from a confused student to confident results, pages and ideas unfolding as the visitor scrolls'],
  [/retail|shop|store|brand|product|e-?commerce/i, 'the hero product rotating in 3D with exploded-view details revealing materials and features on scroll']
];
var WR_PARALLAX = '3D parallax scroll film (Ryan, 2026-09-27): a Kling film of this business is pinned in the hero and scrubbed by the scroll (it plays forward as the visitor scrolls), with layered depth parallax (foreground, subject and background moving at different speeds) and the sections and CTAs revealed over the film; the sales structure stays (one offer, outcome headline, proof, objections answered, the CTA repeated); fast on mobile, with prefers-reduced-motion showing stills.';
function wrMotionFor(industry, text) {
  var t = String(industry || '') + ' ' + String(text || '');
  var concept;
  if (wrIsMedical(t)) { var sp = wrSpecialty(t); concept = sp ? 'photorealistic 3D anatomy scroll film: ' + sp.visual + '; the film scrubs with the scroll and each section (the condition, the treatment, the doctor, book) appears inside it' : 'calm cinematic scroll film through the real clinic: reception, treatment room, the doctor at work (with consent), ending on the booking action'; }
  for (var i = 0; !concept && i < WR_MOTION.length; i++) if (WR_MOTION[i][0].test(t)) concept = WR_MOTION[i][1];
  if (!concept) concept = 'depth-parallax scroll film built from the business\'s own world: foreground, subject and background move at different speeds, sections revealed inside the film';
  return concept + '. ' + WR_PARALLAX;
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
var WR_VARIATIONS = 'ONE VERSION (Ryan, 2026-09-27): build ONE 3D parallax scroll-film website from this brief: the film and photography are generated by Kling, the site is built on Lovable and published to a public link. The high-converting sales structure stays. No prices anywhere; John sends the link.';

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
function wrInput(inp) {
  inp = (inp && typeof inp === 'object') ? inp : {};
  var conversation = []; try { conversation = JSON.parse(inp.conversation_json || '[]'); } catch (e) { conversation = []; }
  if (!Array.isArray(conversation)) conversation = [];
  var extracted = {}; try { extracted = JSON.parse(inp.extracted_json || '{}'); } catch (e) { extracted = {}; }
  if (!extracted || typeof extracted !== 'object') extracted = {};
  var text = [inp.message, inp.sales_summary, extracted.website, extracted.existing_website, extracted.company_website].concat(conversation.map(function (m) { return m && m.content; })).filter(Boolean).join('\n');
  var urls = wrFindUrls(wrStr(inp.website) ? inp.website + '\n' + text : text).filter(function (u) { var h = wrHost(u); return h && !wrIsSocial(h) && !wrIsDirectory(h) && !/fusiontech|n8n\.cloud|lovable|whatsapp|wa\.me/i.test(h); });
  var socials = wrFindUrls(text).filter(function (u) { return wrIsSocial(wrHost(u)); });
  return {
    tenant_id: wrStr(inp.tenant_id) || 'fusiontech', lead_id: wrStr(inp.lead_id) || ('lead_unknown_' + Date.now().toString(36)),
    contact_name: wrStr(inp.contact_name, 120), company_name: wrStr(inp.company_name, 160) || wrStr(extracted.company_name, 160),
    industry: wrStr(inp.industry, 120) || wrStr(extracted.industry, 120), email: wrStr(inp.email, 160), phone: wrStr(inp.phone, 40), channel: wrStr(inp.channel) || 'unknown',
    message: wrStr(inp.message, 2000), conversation: conversation, sales_summary: wrStr(inp.sales_summary, 1500), extracted: extracted,
    location: wrStr(extracted.location || extracted.city || extracted.country, 80) || 'Singapore',
    website: urls.length ? wrUrl(urls[0]) : '', website_source: urls.length ? (wrStr(inp.website) && wrFindUrls(inp.website)[0] === urls[0] ? 'john' : 'customer_words') : '', socials: socials.slice(0, 5),
    test_mode: inp.test_mode === true || inp.test_mode === 'true', notify_email: wrStr(inp.notify_email, 160), source_execution_id: wrStr(inp.source_execution_id, 60)
  };
}

/** The minimum research pass (Rule 4): queries for the company, its reviews, its service and the market. */
function wrQueries(input) {
  var name = input.company_name, loc = input.location || 'Singapore', svc = input.industry || '';
  if (!name) return [];
  var q = [
    { key: 'name', query: name },
    { key: 'name_location', query: name + ' ' + loc },
    { key: 'reviews', query: name + ' reviews' },
    // Wider Google pass (Ryan, 2026-09-27: "search every single thing on Google"): socials, maps listing, competitors.
    { key: 'socials', query: name + ' ' + loc + ' instagram facebook' },
    { key: 'maps', query: name + ' ' + loc + ' address opening hours' },
    // Everything about the company (Ryan, 2026-09-29: "search every single thing about their company"): more socials,
    // press and news, the people behind it, and pages that show its photos.
    { key: 'socials2', query: name + ' ' + loc + ' tiktok linkedin youtube' },
    { key: 'press', query: name + ' ' + loc + ' news press award' },
    { key: 'team', query: name + ' founder owner team' },
    { key: 'photos', query: name + ' ' + loc + ' photos gallery' }
  ];
  if (svc) { q.push({ key: 'name_service', query: name + ' ' + svc }); q.push({ key: 'market', query: svc + ' ' + loc }); q.push({ key: 'buyer_intent', query: 'best ' + svc + ' ' + loc }); q.push({ key: 'competitors', query: 'top ' + svc + ' ' + loc + ' reviews' }); }
  return q;
}

/** Normalizes whatever shape the search node returns into [{query_key, title, url, snippet}]. */
function wrSearchItems(items) {
  var out = [];
  (items || []).forEach(function (it) {
    var j = it && it.json ? it.json : it; if (!j || typeof j !== 'object') return;
    var key = wrStr(j.query_key || j.key || (j.__query && j.__query.key));
    var list = null;
    ['results', 'organic', 'web', 'items', 'data', 'hits'].forEach(function (k) { if (!list && Array.isArray(j[k])) list = j[k]; });
    if (!list && j.results && Array.isArray(j.results.web)) list = j.results.web;
    if (!list && (j.url || j.link)) list = [j];
    (list || []).forEach(function (r) {
      if (!r || typeof r !== 'object') return;
      var url = wrStr(r.url || r.link || r.href, 400); if (!url) return;
      out.push({ query_key: key, title: wrStr(r.title || r.name, 200), url: url, snippet: wrStr(r.snippet || r.description || r.content || r.text, 400) });
    });
  });
  return out;
}

/** Rule 3: which company is this? John's/the customer's URL wins; otherwise the best-matching official site from the name queries. */
function wrIdentify(input, results) {
  var out = { website: '', host: '', confidence: 'low', reason: '', candidates: [], socials: input.socials.slice() };
  if (input.website) { out.website = input.website; out.host = wrHost(input.website); out.confidence = 'high'; out.reason = 'website given by ' + (input.website_source === 'john' ? 'John' : 'the customer'); }
  var toks = wrTokens(input.company_name);
  var scored = {};
  (results || []).forEach(function (r) {
    if (['name', 'name_location', 'name_service', 'socials', 'socials2', 'photos'].indexOf(r.query_key) === -1 && r.query_key) return;
    var host = wrHost(r.url); if (!host) return;
    if (wrIsSocial(host)) { if (out.socials.indexOf(r.url) === -1 && out.socials.length < 5) out.socials.push(r.url); return; }
    if (wrIsDirectory(host)) return;
    var hay = (r.title + ' ' + r.snippet + ' ' + host).toLowerCase();
    var score = toks.reduce(function (s, t) { return s + (hay.indexOf(t) !== -1 ? 1 : 0); }, 0) + (toks.length && host.replace(/[^a-z0-9]/g, '').indexOf(toks.join('')) !== -1 ? 2 : 0);
    if (!scored[host] || scored[host].score < score) scored[host] = { host: host, url: r.url, title: r.title, score: score };
  });
  var cands = Object.keys(scored).map(function (h) { return scored[h]; }).filter(function (c) { return c.score > 0; }).sort(function (a, b) { return b.score - a.score; });
  out.candidates = cands.slice(0, 5);
  if (!out.website) {
    if (cands.length && (cands.length === 1 || cands[0].score > (cands[1] ? cands[1].score : 0))) {
      var top = cands[0]; var strong = top.score >= Math.max(2, toks.length);
      out.website = wrUrl('https://' + top.host); out.host = top.host; out.confidence = strong ? 'medium' : 'low';
      out.reason = strong ? 'search results point to one site matching the name' : 'one weak candidate from search; treat facts as unverified';
    } else if (cands.length > 1) { out.reason = 'several businesses match this name: ' + cands.slice(0, 3).map(function (c) { return c.host; }).join(', '); }
    else out.reason = 'no matching official website found in search';
  }
  return out;
}

// Real photos first (Ryan, 2026-09-29: "only generate the photo if the website intelligence cannot find it … if they
// already show the photos … download from there"). Every image the company's own pages and profiles show is collected
// (CLIENT_REAL); the build worker uses these before generating anything.
var WR_IMG_SKIP = /(favicon|sprite|icons?[\/_\-.]|[\/_\-]icon|pixel|tracking|spacer|blank\.|placeholder|loader|spinner|arrow|badge|flag|emoji|1x1|captcha|gravatar|\.svg(\?|$)|\.gif(\?|$)|data:image)/i;
var WR_MAX_IMAGES = 16;
function wrAbsUrl(u, baseUrl) {
  u = String(u || '').trim().replace(/&amp;/g, '&'); if (!u) return '';
  if (/^\/\//.test(u)) return 'https:' + u;
  if (/^https?:\/\//i.test(u)) return u;
  var base = wrUrl(baseUrl); if (!base) return '';
  var origin = (/^(https?:\/\/[^\/]+)/i.exec(base) || [])[1] || base;
  return /^\//.test(u) ? origin + u : origin + '/' + u.replace(/^\.?\//, '');
}
/** Every photo a page shows: og/twitter images, <img> (src, data-src, srcset largest), CSS backgrounds, JSON-LD images/logo. */
function wrImagesFromHtml(html, baseUrl) {
  html = String(html || ''); var out = [], seen = {};
  var add = function (u, alt, kind) {
    u = wrAbsUrl(u, baseUrl); if (!u || WR_IMG_SKIP.test(u) || !/^https?:\/\//i.test(u)) return;
    var key = u.split('?')[0].toLowerCase(); if (seen[key]) return; seen[key] = true;
    if (/logo/i.test(u + ' ' + (alt || '')) && kind !== 'og') kind = 'logo';
    out.push({ url: u.slice(0, 400), alt: wrStr(alt, 120), kind: kind, page: wrStr(baseUrl, 300) });
  };
  var m, re;
  re = /<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*content=["']([^"']+)["']/gi; while ((m = re.exec(html)) !== null) add(m[1], '', 'og');
  re = /<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/gi; while ((m = re.exec(html)) !== null) add(m[1], '', 'og');
  re = /<img\b[^>]*>/gi;
  while ((m = re.exec(html)) !== null && out.length < 60) {
    var tag = m[0];
    var alt = (/\balt=["']([^"']*)["']/i.exec(tag) || [])[1] || '';
    var srcset = (/\b(?:data-)?srcset=["']([^"']+)["']/i.exec(tag) || [])[1];
    var src = (/\bdata-(?:src|lazy-src|original)=["']([^"']+)["']/i.exec(tag) || [])[1] || (/\bsrc=["']([^"']+)["']/i.exec(tag) || [])[1];
    if (srcset) { var best = srcset.split(',').map(function (x) { var p = x.trim().split(/\s+/); return { u: p[0], w: parseInt(p[1], 10) || 0 }; }).sort(function (a, b) { return b.w - a.w; })[0]; if (best && best.u) src = best.u; }
    var w = parseInt((/\bwidth=["']?(\d+)/i.exec(tag) || [])[1], 10);
    if (src && !(w && w < 160)) add(src, alt, 'img');
  }
  re = /background(?:-image)?\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/gi; while ((m = re.exec(html)) !== null && out.length < 60) add(m[1], '', 'bg');
  wrJsonLd(html).forEach(function (o) { wrArrAny(o.image).forEach(function (x) { add(typeof x === 'object' ? x.url : x, o.name || '', 'jsonld'); }); if (o.logo) add(typeof o.logo === 'object' ? o.logo.url : o.logo, 'logo', 'logo'); });
  return out;
}
function wrArrAny(v) { return v === undefined || v === null ? [] : (Array.isArray(v) ? v : [v]); }
/** JSON-LD blocks (flattened, @graph included). */
function wrJsonLd(html) {
  var out = [], re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, m;
  while ((m = re.exec(String(html || ''))) !== null) {
    try { var j = JSON.parse(m[1].trim()); wrArrAny(j).forEach(function (x) { if (x && x['@graph']) wrArrAny(x['@graph']).forEach(function (g) { out.push(g); }); else if (x) out.push(x); }); } catch (e) {}
  }
  return out.filter(function (o) { return o && typeof o === 'object'; });
}
/** The business's own structured data: address, hours, phone, email, socials, rating (schema.org LocalBusiness/Organization). */
function wrStructured(html) {
  var s = { names: [], addresses: [], hours: [], phones: [], emails: [], socials: [], rating: '' };
  var push = function (arr, v, n) { v = wrStr(v, n || 200); if (v && arr.indexOf(v) === -1 && arr.length < 6) arr.push(v); };
  wrJsonLd(html).forEach(function (o) {
    var t = wrArrAny(o['@type']).join(' ');
    if (!/(Organization|LocalBusiness|Store|Dentist|Physician|MedicalClinic|MedicalBusiness|Restaurant|CafeOrCoffeeShop|AutoDealer|RealEstateAgent|JewelryStore|ClothingStore|FurnitureStore|ElectronicsStore|HealthAndBeautyBusiness|ProfessionalService|HomeAndConstructionBusiness|EducationalOrganization|Hotel|Corporation)/.test(t)) return;
    push(s.names, o.name, 120);
    wrArrAny(o.address).concat(wrArrAny(o.location).map(function (l) { return l && l.address; })).forEach(function (a) { if (!a) return; if (typeof a === 'string') push(s.addresses, a); else push(s.addresses, [a.streetAddress, a.addressLocality, a.postalCode].filter(Boolean).join(', ')); });
    wrArrAny(o.openingHours).forEach(function (h) { push(s.hours, h, 120); });
    wrArrAny(o.openingHoursSpecification).forEach(function (h) { if (h && typeof h === 'object') push(s.hours, wrArrAny(h.dayOfWeek).map(function (d) { return String(d).replace(/^https?:\/\/schema\.org\//, ''); }).join(', ') + ' ' + (h.opens || '') + '–' + (h.closes || ''), 120); });
    push(s.phones, o.telephone, 40); push(s.emails, o.email, 120);
    wrArrAny(o.sameAs).forEach(function (x) { push(s.socials, x, 200); });
    if (o.aggregateRating && o.aggregateRating.ratingValue) s.rating = wrStr(o.aggregateRating.ratingValue + ' from ' + (o.aggregateRating.reviewCount || o.aggregateRating.ratingCount || '?') + ' reviews', 80);
  });
  var html2 = String(html || '');
  var m, re = /href=["'](?:tel:|https?:\/\/wa\.me\/)\+?([0-9 \-]{7,20})/gi; while ((m = re.exec(html2)) !== null) push(s.phones, m[1].replace(/[ \-]/g, ''), 40);
  re = /href=["']mailto:([^"'?]+)/gi; while ((m = re.exec(html2)) !== null) push(s.emails, m[1], 120);
  re = /href=["'](https?:\/\/(?:www\.)?(?:facebook|instagram|linkedin|tiktok|youtube|x|twitter)\.com\/[^"'?#\s]+)/gi; while ((m = re.exec(html2)) !== null) { if (!/sharer|share\?|intent\//i.test(m[1])) push(s.socials, m[1], 200); }
  return s;
}
/** HTML → plain text + structure (title, description, h1s, links, contact signals). */
function wrHtmlToText(html, baseUrl) {
  html = String(html || '');
  var get = function (re) { var m = re.exec(html); return m ? wrStr(m[1].replace(/<[^>]+>/g, ' '), 300) : ''; };
  var title = get(/<title[^>]*>([\s\S]*?)<\/title>/i);
  var description = get(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || get(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
  var h1s = []; var hre = /<h1[^>]*>([\s\S]*?)<\/h1>/gi, m; while ((m = hre.exec(html)) !== null && h1s.length < 5) { var t = wrStr(m[1].replace(/<[^>]+>/g, ' '), 200); if (t) h1s.push(t); }
  var links = []; var lre = /<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi; var base = wrUrl(baseUrl); var host = wrHost(base);
  while ((m = lre.exec(html)) !== null && links.length < 200) {
    var href = m[1].trim(), text = wrStr(m[2].replace(/<[^>]+>/g, ' '), 80);
    if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;
    if (/^\//.test(href)) href = base.replace(/\/+$/, '') + href; else if (!/^https?:\/\//i.test(href)) href = base.replace(/\/+$/, '') + '/' + href.replace(/^\.?\//, '');
    if (wrHost(href) !== host) continue;
    links.push({ url: href.split('?')[0], text: text });
  }
  var body = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<\/(p|div|li|h[1-6]|section|article|tr|br)>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
  var lower = html.toLowerCase();
  return {
    title: title, description: description, h1s: h1s, links: links, text: body.slice(0, WR_MAX_PAGE_TEXT), length: body.length,
    signals: { whatsapp: /wa\.me|whatsapp/i.test(lower), booking: /book(ing)?|appointment|calendly|reserve/i.test(lower), form: /<form/i.test(lower), phone: /tel:/i.test(lower) || /\+65\s?\d{4}\s?\d{4}|\b[689]\d{3}\s?\d{4}\b/.test(body), email: /mailto:/i.test(lower), shop: /add to cart|checkout|shopify|woocommerce/i.test(lower), analytics: /gtag\(|googletagmanager|fbq\(|facebook\.net\/en_us\/fbevents/i.test(lower) },
    phones: (body.match(/(?:\+65[\s-]?)?[689]\d{3}[\s-]?\d{4}\b/g) || []).slice(0, 3), emails: (body.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).slice(0, 3),
    images: wrImagesFromHtml(html, baseUrl), structured: wrStructured(html),
    hours_text: (body.match(/(?:mon|tue|wed|thu|fri|sat|sun|weekdays?|weekends?|daily|public holidays?)[a-z]*[^\n]{0,40}?\d{1,2}(?:[.:]\d{2})?\s*(?:am|pm)?\s*(?:-|–|to)\s*\d{1,2}(?:[.:]\d{2})?\s*(?:am|pm)?/gi) || []).slice(0, 6)
  };
}

/** Up to 3 more pages worth reading (Rule 5). */
function wrPickPages(links, max) {
  var seen = {}, out = [];
  (links || []).forEach(function (l) { if (out.length >= (max || 3)) return; var path = l.url.replace(/^https?:\/\/[^\/]+/i, ''); if (!path || path === '/' || seen[l.url]) return; if (WR_PAGE_RE.test(path) || WR_PAGE_RE.test(l.text)) { seen[l.url] = true; out.push(l.url); } });
  return out;
}

/** Normalizes a fetched page item (any shape) into { url, ok, html }. */
function wrFetchedPage(item, url) {
  var j = item && item.json ? item.json : (item || {});
  if (j && j.error) return { url: url, ok: false, html: '', error: wrStr(j.error.message || j.error, 200) };
  var html = '';
  ['html', 'content', 'text', 'body', 'data', 'markdown'].forEach(function (k) { if (!html && typeof j[k] === 'string' && j[k].length > html.length) html = j[k]; });
  if (!html && j.response && typeof j.response === 'object') ['html', 'content', 'text', 'body'].forEach(function (k) { if (!html && typeof j.response[k] === 'string') html = j.response[k]; });
  if (!html) { var best = ''; Object.keys(j).forEach(function (k) { if (typeof j[k] === 'string' && j[k].length > best.length) best = j[k]; }); if (best.length > 200) html = best; }
  return { url: url || wrStr(j.url, 300), ok: html.length > 0, html: html, status: j.status || j.statusCode || null };
}

/** Everything research found, labelled (Rule 7) and boiled down to a digest the model and the fallback can use. */
function wrDigest(o) {
  var input = o.input, identity = o.identity, results = o.results || [], pages = o.pages || [];
  var facts = [];
  var push = function (fact, label, source) { fact = wrStr(fact, 300); if (fact && !facts.some(function (f) { return f.fact === fact; })) facts.push({ fact: fact, label: label, source: wrStr(source, 200) }); };
  if (input.company_name) push('Company name: ' + input.company_name, 'JOHN_OR_CUSTOMER_PROVIDED_FACT', 'John hand-off');
  if (input.industry) push('Industry: ' + input.industry, 'JOHN_OR_CUSTOMER_PROVIDED_FACT', 'John hand-off');
  if (input.contact_name) push('Contact: ' + input.contact_name, 'JOHN_OR_CUSTOMER_PROVIDED_FACT', 'John hand-off');
  if (input.sales_summary) push('John\'s summary: ' + input.sales_summary, 'JOHN_OR_CUSTOMER_PROVIDED_FACT', 'John hand-off');
  if (input.message) push('Customer said: ' + input.message, 'JOHN_OR_CUSTOMER_PROVIDED_FACT', 'customer message');
  Object.keys(input.extracted || {}).forEach(function (k) { var v = input.extracted[k]; if (v && typeof v !== 'object' && ['company_name', 'industry'].indexOf(k) === -1) push(k.replace(/_/g, ' ') + ': ' + v, 'JOHN_OR_CUSTOMER_PROVIDED_FACT', 'John extracted'); });
  var verifiedLabel = identity.confidence === 'high' ? 'VERIFIED_PUBLIC_FACT' : (identity.confidence === 'medium' ? 'VERIFIED_PUBLIC_FACT (site identified from search; confirm)' : 'THIRD_PARTY_PUBLIC_INFORMATION');
  var site = { website: identity.website, pages_read: [], pages_failed: [], title: '', description: '', h1s: [], services_guess: [], signals: {}, phones: [], emails: [], images: [], logo: '', addresses: [], hours: [], socials: [], rating: '' };
  var pageTexts = [];
  pages.forEach(function (p) {
    if (!p.ok) { site.pages_failed.push(p.url + (p.error ? ' (' + p.error + ')' : '')); return; }
    var parsed = p.parsed || wrHtmlToText(p.html, p.url);
    site.pages_read.push(p.url);
    // Real photos and structured facts from the company's own pages and profiles (Ryan, 2026-09-29).
    var social = wrIsSocial(wrHost(p.url));
    (parsed.images || []).forEach(function (im) {
      if (im.kind === 'logo') { if (!site.logo) site.logo = im.url; return; }
      if (social && im.kind !== 'og') return;
      if (site.images.length < WR_MAX_IMAGES && !site.images.some(function (x) { return x.url === im.url; })) site.images.push({ url: im.url, alt: im.alt, kind: social ? 'social' : im.kind, page: p.url });
    });
    var st = parsed.structured || {};
    (st.addresses || []).forEach(function (x) { if (site.addresses.indexOf(x) === -1) site.addresses.push(x); });
    (st.hours || []).concat(parsed.hours_text || []).forEach(function (x) { x = wrStr(x, 120); if (x && site.hours.indexOf(x) === -1 && site.hours.length < 8) site.hours.push(x); });
    (st.phones || []).forEach(function (x) { if (site.phones.indexOf(x) === -1) site.phones.push(x); });
    (st.emails || []).forEach(function (x) { if (site.emails.indexOf(x) === -1) site.emails.push(x); });
    (st.socials || []).forEach(function (x) { if (site.socials.indexOf(x) === -1 && site.socials.length < 8) site.socials.push(x); });
    if (st.rating && !site.rating) site.rating = st.rating;
    if (social) return;
    if (!site.title && parsed.title) site.title = parsed.title;
    if (!site.description && parsed.description) site.description = parsed.description;
    parsed.h1s.forEach(function (h) { if (site.h1s.indexOf(h) === -1 && site.h1s.length < 8) site.h1s.push(h); });
    Object.keys(parsed.signals).forEach(function (k) { site.signals[k] = site.signals[k] || parsed.signals[k]; });
    parsed.phones.forEach(function (x) { if (site.phones.indexOf(x) === -1) site.phones.push(x); });
    parsed.emails.forEach(function (x) { if (site.emails.indexOf(x) === -1) site.emails.push(x); });
    pageTexts.push('--- ' + p.url + ' ---\n' + parsed.text);
  });
  if (identity.confidence !== 'low' && site.website) {
    push('Official website: ' + site.website, verifiedLabel, site.website);
    if (site.title) push('Site title: ' + site.title, verifiedLabel, site.website);
    if (site.description) push('Site description: ' + site.description, verifiedLabel, site.website);
    site.h1s.slice(0, 4).forEach(function (h) { push('Headline on site: ' + h, verifiedLabel, site.website); });
    if (site.phones.length) push('Public phone: ' + site.phones.join(', '), verifiedLabel, site.website);
    site.addresses.forEach(function (a) { push('Address: ' + a, verifiedLabel, site.website); });
    if (site.hours.length) push('Opening hours: ' + site.hours.join('; '), verifiedLabel, site.website);
    site.socials.forEach(function (x) { push('Official social profile (linked from the website): ' + x, verifiedLabel, site.website); });
    if (site.rating) push('Rating shown in the site\'s own data: ' + site.rating, verifiedLabel, site.website);
    if (site.images.length) push(site.images.length + ' real photos of the business found on its own pages (CLIENT_REAL; see REAL PHOTOS)', verifiedLabel, site.website);
    if (site.emails.length) push('Public email: ' + site.emails.join(', '), verifiedLabel, site.website);
    ['whatsapp', 'booking', 'form', 'shop'].forEach(function (k) { if (site.signals[k]) push('Current site has ' + k + ' (' + (k === 'form' ? 'contact form' : k) + ')', verifiedLabel, site.website); });
    if (site.pages_read.length && !site.signals.analytics) push('No analytics tag detected on the pages read (GA4/Meta pixel)', 'INFERENCE', site.website);
  }
  var host = identity.host;
  var competitors = [], reviews = [], market = [];
  results.forEach(function (r) {
    var h = wrHost(r.url); if (!h) return;
    if ((r.query_key === 'reviews' || r.query_key === 'maps') && (r.snippet || r.title)) { if (reviews.length < 8) reviews.push({ source: r.url, text: wrStr(r.title + ' — ' + r.snippet, 300) }); return; }
    if ((r.query_key === 'market' || r.query_key === 'buyer_intent' || r.query_key === 'competitors') && h !== host && !wrIsSocial(h) && !wrIsDirectory(h)) { if (!competitors.some(function (c) { return wrHost(c.url) === h; }) && competitors.length < 6) competitors.push({ name: r.title, url: r.url, snippet: r.snippet }); return; }
    if ((r.query_key === 'market' || r.query_key === 'buyer_intent' || r.query_key === 'competitors') && wrIsDirectory(h) && market.length < 5) market.push(wrStr(r.title + ' — ' + r.snippet, 200));
  });
  reviews.forEach(function (rv) { push('Public mention: ' + rv.text, 'THIRD_PARTY_PUBLIC_INFORMATION', rv.source); });
  identity.socials.forEach(function (s) { push('Official social profile (found in search): ' + s, 'THIRD_PARTY_PUBLIC_INFORMATION', s); });
  var unknown = [];
  ['testimonials', 'awards or certifications', 'years operating', 'team members', 'pricing'].concat(site.images.length ? [] : ['photos of the business']).forEach(function (k) { unknown.push(k + ' — [CLIENT TO PROVIDE]'); });
  var digestText = ['IDENTITY: ' + (identity.website || 'no official website found') + ' | confidence ' + identity.confidence + ' | ' + identity.reason + (identity.candidates.length > 1 ? ' | other candidates: ' + identity.candidates.slice(1, 4).map(function (c) { return c.host; }).join(', ') : ''),
    'FACT LEDGER:', facts.map(function (f) { return '- [' + f.label + '] ' + f.fact + ' (' + f.source + ')'; }).join('\n'),
    'PAGES READ: ' + (site.pages_read.join(', ') || 'none') + (site.pages_failed.length ? ' | could not read: ' + site.pages_failed.join(', ') : ''),
    'SITE SIGNALS: ' + JSON.stringify(site.signals),
    'COMPETITORS / ALTERNATIVES (from search, for strategy only, never copy): ' + (competitors.map(function (c) { return c.name + ' <' + c.url + '> ' + c.snippet; }).join(' || ') || 'none found'),
    'MARKET SNIPPETS: ' + (market.join(' || ') || 'none'),
    'PUBLIC REVIEWS / MENTIONS: ' + (reviews.map(function (r) { return r.text; }).join(' || ') || 'none found'),
    'REAL PHOTOS FOUND (CLIENT_REAL — the business\'s own photos from its website and profiles; use them before generating anything; pick the best for hero/section/detail): ' + (identity.confidence !== 'low' && site.images.length ? site.images.map(function (im) { return im.url + ' [' + im.kind + (im.alt ? ': ' + im.alt : '') + ']'; }).join(' || ') : 'none found') + (site.logo ? ' | LOGO: ' + site.logo : ''),
    'UNKNOWN (placeholders): ' + unknown.join('; '),
    'PAGE TEXT:', pageTexts.join('\n')].join('\n');
  return { version: WR_VERSION, identity: identity, facts: facts, site: site, competitors: competitors, reviews: reviews, market: market, unknown: unknown, digest_text: digestText.slice(0, WR_MAX_DIGEST) };
}

var WR_BRIEF_KEYS = ['company_name', 'company_url', 'industry', 'location', 'business_summary', 'verified_facts', 'client_provided_facts', 'unverified_information', 'products', 'services', 'target_customers', 'customer_problems', 'customer_desires', 'customer_objections', 'company_differentiators', 'trust_signals', 'competitive_context', 'website_objective', 'primary_conversion', 'secondary_conversions', 'primary_cta', 'secondary_cta', 'recommended_sitemap', 'homepage_conversion_flow', 'funnel_plan', 'conversion_strategy', 'motion_3d_direction', 'medical_visual_direction', 'page_requirements', 'copy_direction', 'brand_direction', 'visual_direction', 'media_requirements', 'trust_sections', 'testimonial_requirements', 'case_study_requirements', 'faq_direction', 'form_requirements', 'whatsapp_requirements', 'booking_requirements', 'ecommerce_requirements', 'crm_opportunities', 'automation_opportunities', 'seo_direction', 'analytics_requirements', 'mobile_requirements', 'accessibility_requirements', 'compliance_considerations', 'placeholders_required', 'do_not_invent', 'real_photos', 'enough_to_build', 'questions_for_john', 'identity_confidence', 'reasoning'];
var WR_LIST_KEYS = ['verified_facts', 'client_provided_facts', 'unverified_information', 'products', 'services', 'target_customers', 'customer_problems', 'customer_desires', 'customer_objections', 'company_differentiators', 'trust_signals', 'competitive_context', 'secondary_conversions', 'recommended_sitemap', 'homepage_conversion_flow', 'funnel_plan', 'conversion_strategy', 'page_requirements', 'media_requirements', 'trust_sections', 'form_requirements', 'crm_opportunities', 'automation_opportunities', 'analytics_requirements', 'mobile_requirements', 'accessibility_requirements', 'compliance_considerations', 'placeholders_required', 'do_not_invent', 'real_photos', 'questions_for_john'];

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
/** The company's own photos as "url | use | alt" lines: the strongest (og/structured) first as the hero, then section,
 *  detail and gallery. Only when the company was identified (never another business's photos). */
function wrRealPhotos(digest) {
  if (!digest || !digest.site || !digest.identity || digest.identity.confidence === 'low') return [];
  var rank = { og: 1, jsonld: 2, img: 3, bg: 4, social: 5 };
  var ims = digest.site.images.slice().sort(function (a, b) { return (rank[a.kind] || 9) - (rank[b.kind] || 9); });
  var uses = ['hero', 'section', 'detail'];
  var out = ims.map(function (im, i) { return im.url + ' | ' + (uses[i] || 'gallery') + (im.alt ? ' | ' + im.alt : ''); });
  if (digest.site.logo) out.push(digest.site.logo + ' | logo');
  return out.slice(0, WR_MAX_IMAGES);
}
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
    medical_visual_direction: wrIsMedical(medText) ? ((spec ? 'Specialty: ' + spec.key + '. Hero and section visuals: ' + spec.visual + '. ' : 'Specialty: general practice. Use the real clinic and team (with consent), no anatomy renders. ') + 'Photorealistic and medically accurate, educational in tone, never cartoon or low-poly 3D. Specialist clinics: Kling makes it as a still photo plus a video from that photo, the opening scene of the scroll film (Ryan, 2026-09-27: the arteries, the heartbeat and the blood vessels). No gore, no before/after images, no outcome claims (MOH advertising rules).') : '',
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
    brand_direction: '[CLIENT TO PROVIDE brand colours/logo]' + (digest.site.title ? '; current site title: ' + digest.site.title : ''), visual_direction: 'Premium, film-led 3D scroll on every screen size, solid brand-colour panels, category-appropriate; no generic AI look.',
    media_requirements: ['Hero photography of the real business [CLIENT TO PROVIDE or generated placeholders]'], trust_sections: ['Testimonials [CLIENT TO PROVIDE]', 'Credentials [CLIENT TO PROVIDE]'],
    testimonial_requirements: '[CLIENT TESTIMONIALS TO BE ADDED]', case_study_requirements: '[PROJECT IMAGES TO BE PROVIDED]', faq_direction: 'Answer the top buying questions and objections for ' + (input.industry || 'this service'),
    form_requirements: ['Qualifying fields for a ' + conv.primary.toLowerCase() + ' (name, preferred contact, what they need, when)', 'PDPA consent checkbox + privacy policy link'],
    whatsapp_requirements: 'Click-to-chat button on every page (number [CLIENT TO PROVIDE])', booking_requirements: conv.primary.indexOf('BOOK') === 0 ? 'Booking request form or calendar link' : 'not required for v1', ecommerce_requirements: conv.primary === 'BUY NOW' ? 'Product catalogue + checkout (Stripe/PayNow)' : 'not required',
    crm_opportunities: ['Every form/WhatsApp lead into the CRM with source'], automation_opportunities: ['Instant acknowledgement + follow-up task', 'Review request after the job'],
    seo_direction: (input.industry || 'service') + ' ' + input.location + ' — local intent pages; titles and H1s per page', analytics_requirements: ['GA4 events: cta_click, whatsapp_click, form_submit' + (conv.primary.indexOf('BOOK') === 0 ? ', booking_complete' : '')],
    mobile_requirements: ['Sticky CTA / WhatsApp on mobile', 'Thumb-friendly buttons', 'Fast images'], accessibility_requirements: ['Readable contrast, alt text, keyboard-friendly forms'],
    compliance_considerations: /clinic|dental|aesthetic|medical|doctor/i.test(input.industry) ? ['Healthcare advertising rules (MOH) — flag claims for human review'] : (/property|real estate/i.test(input.industry) ? ['CEA advertising rules for property agents'] : (/insurance|financial|wealth/i.test(input.industry) ? ['MAS promotion rules'] : ['PDPA consent on forms'])),
    real_photos: wrRealPhotos(digest), placeholders_required: digest.unknown, do_not_invent: ['testimonials', 'awards', 'certifications', 'customer counts', 'years operating', 'revenue', 'results', 'prices', 'addresses', 'team members'],
    enough_to_build: wrEnoughFallback(input, digest), questions_for_john: questions.slice(0, 3), identity_confidence: digest.identity.confidence,
    reasoning: 'Deterministic brief (model unavailable): built from John\'s facts, ' + digest.site.pages_read.length + ' page(s) read, ' + digest.competitors.length + ' competitor(s) found.'
  };
}

function wrCoerceBrief(raw, fallback) {
  var b = {}; raw = (raw && typeof raw === 'object') ? raw : {};
  WR_BRIEF_KEYS.forEach(function (k) {
    var v = raw[k];
    if (WR_LIST_KEYS.indexOf(k) !== -1) { v = wrArr(v, 25); if (!v.length && fallback[k] && k !== 'questions_for_john') v = fallback[k]; b[k] = v; }
    else if (k === 'identity_confidence') b[k] = ['high', 'medium', 'low'].indexOf(v) !== -1 ? v : fallback.identity_confidence;
    else if (k === 'enough_to_build') { var e = String(v === true ? 'yes' : (v === false ? 'no' : (v || ''))).toLowerCase().trim(); b[k] = e === 'yes' || e === 'no' ? e : fallback.enough_to_build; }
    else b[k] = wrStr(v, k === 'business_summary' || k === 'reasoning' ? 1200 : 600) || fallback[k] || '';
  });
  return b;
}

function wrParseJson(text) {
  if (typeof text !== 'string') return null;
  // The whole answer first: a JSON value may itself contain ``` blocks (e.g. a mermaid diagram), which a fence regex cuts short (ATLAS, execution 387).
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

// Enough details before building (Ryan, 2026-09-28: "the website intelligence only asks the website creator to create
// the website when he got all the enough sufficient details"). Enough = what the business does or sells, who its
// customers are and what the site must achieve, from the customer's words or verified research. Otherwise John asks
// the customer for the missing essentials first. At most WR_MAX_INFO_ROUNDS rounds, then build with placeholders.
var WR_ASK_MARK = 'quick detail';
var WR_HOLD_MARK = 'before our team builds your';
var WR_MAX_INFO_ROUNDS = 2;
// Our team designs the look (Ryan, 2026-09-28: "John won't ask the customer how they want it to look … give it the best
// one"). The only design detail a customer must give is for property: the rooms and features for the walkthrough.
var WR_ROOMS_Q = 'Which rooms and features should the walkthrough show? For example how many bedrooms and bathrooms, the living and kitchen areas, and any pool, balcony or view.';
var WR_ROOMS_RE = /\b(\d+\s*(bed|bedroom|br|bhk|room|bath|bathroom)s?|bedrooms?|bathrooms?|studio|living room|kitchen|pool|balcony|garden|rooftop|penthouse|loft|sq\s?ft|sqft|square feet|sqm|floor ?plan|storey|story)\b/i;
/** Property only: true when the customer has described the rooms/features, or left it to us. */
function wrRoomsKnown(input) {
  var said = String([input.message || ''].concat((input.conversation || []).filter(function (m) { return m && m.role !== 'agent'; }).map(function (m) { return m.content; })).join(' '));
  return WR_ROOMS_RE.test(said) || /\b(up to you|you decide|anything is fine|not sure|no preference|just build|go ahead|placeholders?)\b/i.test(said);
}
// Never ask what Google can answer (Ryan, 2026-09-29: "they keep asking for the opening hours and the branch, which is
// already on Google … they only need to ask the things that are not in Google"). Once the business is found online
// (or the customer gave its website), questions about public facts are dropped: our team finds them or uses a
// placeholder. A business we could not find is asked one thing first: its website.
var WR_PUBLIC_Q = /\b(address(es)?|located|locations?|branch(es)?|outlets?|opening hours|operating hours|business hours|hours|opening times?|open on|phone( number)?|contact (number|details)|whatsapp (number|line)|hotline|e-?mail|(current|existing|your|clinic'?s?|company'?s?|business'?s?) web ?site|web ?site (link|url|address)|url|link|domain|services?|treatments?|menu|products?|social media|facebook|instagram|tiktok|google (maps|reviews|listing)|reviews?|ratings?|chas|medisave|insurance|payment methods?)\b/i;
var WR_WEBSITE_Q = /\b(current|existing|your|clinic'?s?|company'?s?|business'?s?) web ?site\b|\bweb ?site (link|url|address)\b|\burl\b|\blink\b|\bdomain\b/i;
var WR_URL_RE = /(https?:\/\/|www\.|\b[a-z0-9][a-z0-9-]*\.(com|sg|net|org|co|biz|info|io|my|com\.sg|org\.sg)\b)/i;
/** True when the customer has given a website address anywhere in the conversation. */
function wrUrlGiven(input) {
  input = input || {};
  var said = [input.message || ''].concat((input.conversation || []).filter(function (m) { return m && m.role !== 'agent'; }).map(function (m) { return m.content; })).join(' ');
  return WR_URL_RE.test(said) || !!input.company_url;
}
/** Drops questions Google can answer once the business is found online; otherwise asks for the website first. */
function wrDropPublicQuestions(questions, o) {
  var qs = wrArr(questions, 10);
  if (o && (o.found_online || o.url_given)) return qs.filter(function (q) { return q === WR_ROOMS_Q || !WR_PUBLIC_Q.test(q); });
  var site = qs.filter(function (q) { return WR_WEBSITE_Q.test(q); });
  return site.length ? [site[0]] : qs;
}
// A question is never asked twice (Ryan, 2026-09-29: "they keep asking repeated questions"): each question is matched
// to its topic, and a topic John or Website Intelligence already asked about is not asked again.
var WR_TOPICS = [
  ['hours', /\b(opening|operating|business) hours|\bhours\b|opening times?|open on/i],
  ['address', /\baddress(es)?|\blocat(ed|ion|ions)\b|\bbranch(es)?\b|\boutlets?\b/i],
  ['website', /\b(current|existing|your|clinic'?s?|company'?s?|business'?s?) web ?site\b|\bweb ?site (link|url|address)\b|\burl\b|\blink\b|\bdomain\b/i],
  ['services', /\bservices?\b|\btreatments?\b|\bmenu\b|\bproducts?\b/i],
  ['booking', /\bbook(ing|ings)?\b|\bappointments?\b|\breservations?\b/i],
  ['phone', /\bphone\b|\bwhatsapp (number|line)\b|\bcontact number\b|\bhotline\b/i],
  ['rooms', /\bbedrooms?\b|\bbathrooms?\b|\brooms\b|\bwalkthrough\b/i],
  ['subsidy', /\bchas\b|\bmedisave\b|\binsurance\b/i]
];
function wrTopicsOf(text) { var t = String(text || ''); return WR_TOPICS.filter(function (x) { return x[1].test(t); }).map(function (x) { return x[0]; }); }
/** Topics already asked in agent messages that contained a question. */
function wrAskedTopics(conversation) {
  var out = [];
  (Array.isArray(conversation) ? conversation : []).forEach(function (m) {
    if (!m || m.role !== 'agent' || String(m.content || '').indexOf('?') === -1) return;
    wrTopicsOf(m.content).forEach(function (t) { if (out.indexOf(t) === -1) out.push(t); });
  });
  return out;
}
/** How many times John has already asked for website details in this conversation. */
function wrInfoRounds(input) {
  var conv = (input && Array.isArray(input.conversation)) ? input.conversation : [];
  return conv.filter(function (m) { var t = m && m.role === 'agent' ? String(m.content || '').toLowerCase() : ''; return t && (t.indexOf(WR_ASK_MARK) !== -1 || t.indexOf('so we get your website right') !== -1); }).length;
}
/** Without the model: enough when the company was identified online, or the customer described the business. */
function wrEnoughFallback(input, digest) {
  if (digest && digest.identity && digest.identity.confidence !== 'low') return 'yes';
  var said = String([input.message || ''].concat((input.conversation || []).filter(function (m) { return m && m.role !== 'agent'; }).map(function (m) { return m.content; })).join(' '));
  return (input.industry && said.replace(/\s+/g, ' ').trim().length >= 60) ? 'yes' : 'no';
}

/** Model output (or error) → validated brief + status + text for the Website Creator. Holds the build (hold: true) until there are enough details, at most WR_MAX_INFO_ROUNDS rounds of questions. */
function wrFinalize(o) {
  var input = o.input, digest = o.digest;
  var fallback = wrFallbackBrief(input, digest);
  var provider = 'anthropic', fallbackUsed = false, reason = null, parsed = null;
  if (o.error) { fallbackUsed = true; reason = wrStr(o.error, 200); }
  else { parsed = wrParseJson(o.raw_text); if (!parsed) { fallbackUsed = true; reason = 'model_output_not_json'; } }
  if (fallbackUsed) provider = 'rules';
  var brief = wrCoerceBrief(parsed || fallback, fallback);
  if (!parsed) brief = fallback;
  // never present the site's facts as verified when identity is low
  // Medical visuals always follow the realism + MOH rules; the conversion plan is never empty.
  if (fallback.medical_visual_direction && !/photoreal/i.test(brief.medical_visual_direction || '')) brief.medical_visual_direction = fallback.medical_visual_direction;
  // The 3D parallax scroll film is always planned (Ryan, 2026-09-27); a model plan without it gets the fallback concept.
  if (!/scroll/i.test(brief.motion_3d_direction || '') || !/parallax/i.test(brief.motion_3d_direction || '')) brief.motion_3d_direction = fallback.motion_3d_direction;
  if (digest.identity.confidence === 'low') { brief.company_url = ''; brief.identity_confidence = 'low'; if (!brief.questions_for_john.length) brief.questions_for_john = fallback.questions_for_john; }
  var status = input.company_name ? 'READY_FOR_WEBSITE_CREATOR' : 'MORE_INFORMATION_REQUIRED';
  var text = status === 'READY_FOR_WEBSITE_CREATOR' ? wrBriefText(brief, digest) : 'STATUS:\nMORE_INFORMATION_REQUIRED\n\nQUESTIONS_FOR_JOHN:\n- What is the company name?\n\nWHY_REQUIRED:\nNo company could be identified from the hand-off.';
  // A customer who says they are not sure, or asks to just build, has given enough (Ryan's rule: never stuck).
  var custSaid = String([input.message || ''].concat((input.conversation || []).filter(function (m) { return m && m.role !== 'agent'; }).slice(-2).map(function (m) { return m.content; })).join(' '));
  if (/\b(not sure|no idea|don'?t know|dont know|just build|go ahead|anything is fine|up to you|placeholder|search (it|for it|them|online)|find (it|them|out)|look (it|them) up|google it|check (it )?online|you (can )?(search|find|check))/i.test(custSaid) && wrInfoRounds(input) > 0) brief.enough_to_build = 'yes';
  // Real photos: only images research actually found on the company's own pages (never invented or from other businesses).
  var found = (digest.site && digest.site.images ? digest.site.images.map(function (im) { return im.url; }) : []).concat(digest.site && digest.site.logo ? [digest.site.logo] : []);
  brief.real_photos = digest.identity.confidence === 'low' ? [] : brief.real_photos.filter(function (l) { return found.indexOf(String(l).split('|')[0].trim()) !== -1; });
  if (!brief.real_photos.length) brief.real_photos = wrRealPhotos(digest);
  // Never ask for photos the research already found.
  if (brief.real_photos.length) brief.questions_for_john = brief.questions_for_john.filter(function (q) { return !/\b(photos?|pictures?|images?|gallery)\b/i.test(q); });
  var rounds = wrInfoRounds(input);
  // Never ask how it should look (we design it); property must describe the rooms for the walkthrough.
  brief.questions_for_john = brief.questions_for_john.filter(function (q) { return !/\b(look and feel|style|colou?rs?|website you like|design preference|brand colou?rs?)\b/i.test(q); });
  // Never ask what Google can answer, and never a topic already asked.
  var asked = wrAskedTopics(input.conversation);
  brief.questions_for_john = wrDropPublicQuestions(brief.questions_for_john, { found_online: digest.identity.confidence !== 'low', url_given: wrUrlGiven(input) })
    .filter(function (q) { var t = wrTopicsOf(q); return t.every(function (x) { return asked.indexOf(x) === -1; }); });
  var isProperty = /\b(property|properties|real estate|realtor|condo|landed|villa|bungalow|penthouse|apartment|show ?flat|new launch|interior design)/i.test(String(input.industry || '') + ' ' + String(brief.industry || '') + ' ' + String(input.message || ''));
  if (status === 'READY_FOR_WEBSITE_CREATOR' && isProperty && !wrRoomsKnown(input) && rounds < WR_MAX_INFO_ROUNDS) {
    if (brief.questions_for_john.indexOf(WR_ROOMS_Q) === -1) brief.questions_for_john = [WR_ROOMS_Q].concat(brief.questions_for_john);
    brief.enough_to_build = 'no';
  }
  if (!brief.questions_for_john.length && brief.enough_to_build === 'no') brief.enough_to_build = 'yes';
  var hold = status === 'READY_FOR_WEBSITE_CREATOR' && brief.enough_to_build === 'no' && rounds < WR_MAX_INFO_ROUNDS && brief.questions_for_john.length > 0;
  return { status: status, brief: brief, brief_text: text, questions_for_john: brief.questions_for_john, provider: provider, fallback_used: fallbackUsed, fallback_reason: reason, identity_confidence: brief.identity_confidence, needs_john: brief.questions_for_john.length > 0, enough: brief.enough_to_build === 'yes', info_rounds: rounds, hold: hold };
}

/** What Google could not tell us goes back to John, who asks the customer at once (Ryan, 2026-09-27): at most two
 *  questions, in John's voice. Only when the build waits for the answers (o.hold): once the mock-up is being built
 *  with placeholders, nothing more is asked (Ryan, 2026-09-29: duplicate and repeated questions). Never asks what the
 *  customer already said; never on test leads. Returns { send, channel, to, text, questions, message_id }. */
function wrCustomerAsk(o) {
  o = o || {};
  var input = o.input || {};
  var qs = wrArr(o.questions, 5).filter(function (q) { return q && q.length > 8; });
  var said = String([input.message || ''].concat((input.conversation || []).map(function (m) { return m && m.content; })).join('\n')).toLowerCase();
  qs = qs.filter(function (q) { return said.indexOf(q.toLowerCase().slice(0, 40)) === -1; }).slice(0, 2);
  // Questions are written for John ("does the customer have a logo?"); John asks the customer, so speak to them.
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
  if (qs.length && o.hold) {
    // The build waits for these answers (Ryan, 2026-09-28).
    text = (first ? 'Hi ' + first + ', ' : 'Hi, ') + WR_HOLD_MARK + ' ' + (biz ? biz + ' ' : '') + 'website, ' +
      (qs.length === 1 ? 'one quick detail so it is right for you: ' + qs[0] : 'two quick details so it is right for you: 1) ' + qs[0] + ' 2) ' + qs[1]) +
      ' If you are not sure, just say so and we will start with clear placeholders you can change later.';
  } else if (qs.length) {
    text = (first ? 'Hi ' + first + ', ' : 'Hi, ') + 'while our team builds your ' + (biz ? biz + ' ' : '') + 'mock-up, ' +
      (qs.length === 1 ? 'one quick detail we could not find online: ' + qs[0] : 'two quick details we could not find online: 1) ' + qs[0] + ' 2) ' + qs[1]) +
      ' If you are not sure, no problem, we will use clear placeholders you can change later.';
  }
  var send = !!(o.hold && o.needs_john && qs.length && !input.test_mode && channel && to);
  return { send: send, channel: channel || '', to: to || '', text: text, questions: qs, message_id: 'msg_wi_' + String(input.lead_id || 'x').replace(/[^a-z0-9_]/gi, '').slice(0, 60) + '_' + Date.now().toString(36) };
}
// ---- Node module wrapper (stripped when inlined into n8n) ----
if (typeof module !== 'undefined') module.exports = { WR_IMG_SKIP: WR_IMG_SKIP, wrAbsUrl: wrAbsUrl, wrImagesFromHtml: wrImagesFromHtml, wrJsonLd: wrJsonLd, wrStructured: wrStructured, wrRealPhotos: wrRealPhotos, WR_PUBLIC_Q: WR_PUBLIC_Q, wrUrlGiven: wrUrlGiven, wrDropPublicQuestions: wrDropPublicQuestions, wrTopicsOf: wrTopicsOf, wrAskedTopics: wrAskedTopics, wrCustomerAsk: wrCustomerAsk, WR_ASK_MARK: WR_ASK_MARK, WR_HOLD_MARK: WR_HOLD_MARK, WR_MAX_INFO_ROUNDS: WR_MAX_INFO_ROUNDS, wrInfoRounds: wrInfoRounds, WR_ROOMS_Q: WR_ROOMS_Q, wrRoomsKnown: wrRoomsKnown, wrEnoughFallback: wrEnoughFallback, WR_VERSION: WR_VERSION, WR_BRIEF_KEYS: WR_BRIEF_KEYS, WR_LIST_KEYS: WR_LIST_KEYS, wrInput: wrInput, wrQueries: wrQueries, wrSearchItems: wrSearchItems, wrIdentify: wrIdentify, wrHtmlToText: wrHtmlToText, wrPickPages: wrPickPages, wrFetchedPage: wrFetchedPage, wrDigest: wrDigest, wrFallbackBrief: wrFallbackBrief, wrCoerceBrief: wrCoerceBrief, wrParseJson: wrParseJson, wrBriefText: wrBriefText, wrFinalize: wrFinalize, wrFindUrls: wrFindUrls, wrHost: wrHost, wrSpecialty: wrSpecialty, wrIsMedical: wrIsMedical, wrMotionFor: wrMotionFor, wrFunnelFor: wrFunnelFor, wrConversionFor: wrConversionFor, WR_CONVERSION_STRATEGY: WR_CONVERSION_STRATEGY };
