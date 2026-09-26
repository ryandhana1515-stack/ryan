/**
 * Website Intelligence & Conversion Strategist (internal agent, ADR-3) — pure functions, no I/O.
 * John's hand-off → search plan → identify the company → read its public pages → digest → prompts →
 * WEBSITE_CREATOR_BRIEF (JSON + text) for the Website Builder. Never talks to the customer; never invents facts.
 * Role prompt (Ryan, verbatim): zaphiel/vault/10_Agents/05a_Website_Intelligence — internal role prompt.md (read live).
 */
var WR_VERSION = 'website-intelligence-1.0.0';
var WR_MAX_DIGEST = 9000;
var WR_MAX_PAGE_TEXT = 3500;
var WR_SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'youtube.com', 'x.com', 'twitter.com'];
var WR_DIRECTORY_HOSTS = ['google.com', 'maps.google', 'yelp.com', 'tripadvisor', 'wikipedia.org', 'yellowpages', 'sgpbusiness', 'recordowl', 'streetdirectory', 'carousell', 'shopee', 'lazada', 'glassdoor', 'indeed', 'bing.com', 'duckduckgo', 'reddit.com', 'hardwarezone', 'mycareersfuture', 'acra.gov.sg', 'trustpilot', 'sgcarmart'];
var WR_PAGE_RE = /(about|service|product|treatment|contact|faq|pricing|price|package|booking|book|project|portfolio|case|testimonial|review|menu|shop|gallery|location)/i;
var WR_INSTRUCTION = 'WEBSITE CREATOR INSTRUCTION\n\nUsing the verified business intelligence above, create a premium, modern, mobile-responsive, conversion-focused website mock-up specifically for this company.\n\nDo NOT create a generic informational website.\n\nThe design and copy structure must be based on:\n\n* the company\'s actual business\n* its target customers\n* its services/products\n* its conversion objective\n* customer buying motivations\n* trust requirements\n* customer objections\n* the company\'s brand\n* the research supplied in this brief\n\nThe website must make the visitor understand:\n\n1. What this company does.\n2. Who it helps.\n3. Why the visitor should care.\n4. Why the company can be trusted.\n5. What action the visitor should take next.\n\nCreate strong conversion paths through the appropriate combination of:\n\n* CTA buttons\n* WhatsApp\n* forms\n* appointments\n* quotations\n* consultation requests\n* calls\n* purchases\n\nDo not fabricate company facts.\n\nUse clearly marked placeholders for unavailable content.\n\nOnce the mock-up is completed, DO NOT send it to the customer.\n\nReturn the completed website/mock-up URL and a short internal summary to:\n\nJOHN — FUSION AI SALES AGENT';
var WR_VARIATIONS = 'VARIATIONS REQUIRED (Ryan, ADR-2): build TWO versions of this mock-up from the same brief — A: a cinematic scroll film site (Higgsfield animated website; the premium option) and B: a photo-led site on Lovable with generated photography (Higgsfield, Kling fallback). Same pages, copy direction, CTAs and placeholders in both. No prices anywhere; John sends both links.';

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
    { key: 'reviews', query: name + ' reviews' }
  ];
  if (svc) { q.push({ key: 'name_service', query: name + ' ' + svc }); q.push({ key: 'market', query: svc + ' ' + loc }); q.push({ key: 'buyer_intent', query: 'best ' + svc + ' ' + loc }); }
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
    if (['name', 'name_location', 'name_service'].indexOf(r.query_key) === -1 && r.query_key) return;
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
    phones: (body.match(/(?:\+65[\s-]?)?[689]\d{3}[\s-]?\d{4}\b/g) || []).slice(0, 3), emails: (body.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).slice(0, 3)
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
  var site = { website: identity.website, pages_read: [], pages_failed: [], title: '', description: '', h1s: [], services_guess: [], signals: {}, phones: [], emails: [] };
  var pageTexts = [];
  pages.forEach(function (p) {
    if (!p.ok) { site.pages_failed.push(p.url + (p.error ? ' (' + p.error + ')' : '')); return; }
    var parsed = p.parsed || wrHtmlToText(p.html, p.url);
    site.pages_read.push(p.url);
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
    if (site.emails.length) push('Public email: ' + site.emails.join(', '), verifiedLabel, site.website);
    ['whatsapp', 'booking', 'form', 'shop'].forEach(function (k) { if (site.signals[k]) push('Current site has ' + k + ' (' + (k === 'form' ? 'contact form' : k) + ')', verifiedLabel, site.website); });
    if (site.pages_read.length && !site.signals.analytics) push('No analytics tag detected on the pages read (GA4/Meta pixel)', 'INFERENCE', site.website);
  }
  var host = identity.host;
  var competitors = [], reviews = [], market = [];
  results.forEach(function (r) {
    var h = wrHost(r.url); if (!h) return;
    if (r.query_key === 'reviews' && (r.snippet || r.title)) { if (reviews.length < 6) reviews.push({ source: r.url, text: wrStr(r.title + ' — ' + r.snippet, 300) }); return; }
    if ((r.query_key === 'market' || r.query_key === 'buyer_intent') && h !== host && !wrIsSocial(h) && !wrIsDirectory(h)) { if (!competitors.some(function (c) { return wrHost(c.url) === h; }) && competitors.length < 5) competitors.push({ name: r.title, url: r.url, snippet: r.snippet }); return; }
    if ((r.query_key === 'market' || r.query_key === 'buyer_intent') && wrIsDirectory(h) && market.length < 4) market.push(wrStr(r.title + ' — ' + r.snippet, 200));
  });
  reviews.forEach(function (rv) { push('Public mention: ' + rv.text, 'THIRD_PARTY_PUBLIC_INFORMATION', rv.source); });
  identity.socials.forEach(function (s) { push('Official social profile (found in search): ' + s, 'THIRD_PARTY_PUBLIC_INFORMATION', s); });
  var unknown = [];
  ['testimonials', 'awards or certifications', 'years operating', 'team members', 'pricing', 'case studies or project photos'].forEach(function (k) { unknown.push(k + ' — [CLIENT TO PROVIDE]'); });
  var digestText = ['IDENTITY: ' + (identity.website || 'no official website found') + ' | confidence ' + identity.confidence + ' | ' + identity.reason + (identity.candidates.length > 1 ? ' | other candidates: ' + identity.candidates.slice(1, 4).map(function (c) { return c.host; }).join(', ') : ''),
    'FACT LEDGER:', facts.map(function (f) { return '- [' + f.label + '] ' + f.fact + ' (' + f.source + ')'; }).join('\n'),
    'PAGES READ: ' + (site.pages_read.join(', ') || 'none') + (site.pages_failed.length ? ' | could not read: ' + site.pages_failed.join(', ') : ''),
    'SITE SIGNALS: ' + JSON.stringify(site.signals),
    'COMPETITORS / ALTERNATIVES (from search, for strategy only, never copy): ' + (competitors.map(function (c) { return c.name + ' <' + c.url + '> ' + c.snippet; }).join(' || ') || 'none found'),
    'MARKET SNIPPETS: ' + (market.join(' || ') || 'none'),
    'PUBLIC REVIEWS / MENTIONS: ' + (reviews.map(function (r) { return r.text; }).join(' || ') || 'none found'),
    'UNKNOWN (placeholders): ' + unknown.join('; '),
    'PAGE TEXT:', pageTexts.join('\n')].join('\n');
  return { version: WR_VERSION, identity: identity, facts: facts, site: site, competitors: competitors, reviews: reviews, market: market, unknown: unknown, digest_text: digestText.slice(0, WR_MAX_DIGEST) };
}

var WR_BRIEF_KEYS = ['company_name', 'company_url', 'industry', 'location', 'business_summary', 'verified_facts', 'client_provided_facts', 'unverified_information', 'products', 'services', 'target_customers', 'customer_problems', 'customer_desires', 'customer_objections', 'company_differentiators', 'trust_signals', 'competitive_context', 'website_objective', 'primary_conversion', 'secondary_conversions', 'primary_cta', 'secondary_cta', 'recommended_sitemap', 'homepage_conversion_flow', 'page_requirements', 'copy_direction', 'brand_direction', 'visual_direction', 'media_requirements', 'trust_sections', 'testimonial_requirements', 'case_study_requirements', 'faq_direction', 'form_requirements', 'whatsapp_requirements', 'booking_requirements', 'ecommerce_requirements', 'crm_opportunities', 'automation_opportunities', 'seo_direction', 'analytics_requirements', 'mobile_requirements', 'accessibility_requirements', 'compliance_considerations', 'placeholders_required', 'do_not_invent', 'questions_for_john', 'identity_confidence', 'reasoning'];
var WR_LIST_KEYS = ['verified_facts', 'client_provided_facts', 'unverified_information', 'products', 'services', 'target_customers', 'customer_problems', 'customer_desires', 'customer_objections', 'company_differentiators', 'trust_signals', 'competitive_context', 'secondary_conversions', 'recommended_sitemap', 'homepage_conversion_flow', 'page_requirements', 'media_requirements', 'trust_sections', 'form_requirements', 'crm_opportunities', 'automation_opportunities', 'analytics_requirements', 'mobile_requirements', 'accessibility_requirements', 'compliance_considerations', 'placeholders_required', 'do_not_invent', 'questions_for_john'];

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
  return {
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
  // never present the site's facts as verified when identity is low
  if (digest.identity.confidence === 'low') { brief.company_url = ''; brief.identity_confidence = 'low'; if (!brief.questions_for_john.length) brief.questions_for_john = fallback.questions_for_john; }
  var status = input.company_name ? 'READY_FOR_WEBSITE_CREATOR' : 'MORE_INFORMATION_REQUIRED';
  var text = status === 'READY_FOR_WEBSITE_CREATOR' ? wrBriefText(brief, digest) : 'STATUS:\nMORE_INFORMATION_REQUIRED\n\nQUESTIONS_FOR_JOHN:\n- What is the company name?\n\nWHY_REQUIRED:\nNo company could be identified from the hand-off.';
  return { status: status, brief: brief, brief_text: text, questions_for_john: brief.questions_for_john, provider: provider, fallback_used: fallbackUsed, fallback_reason: reason, identity_confidence: brief.identity_confidence, needs_john: brief.questions_for_john.length > 0 };
}

// ---- Node module wrapper (stripped when inlined into n8n) ----
if (typeof module !== 'undefined') module.exports = { WR_VERSION: WR_VERSION, WR_BRIEF_KEYS: WR_BRIEF_KEYS, WR_LIST_KEYS: WR_LIST_KEYS, wrInput: wrInput, wrQueries: wrQueries, wrSearchItems: wrSearchItems, wrIdentify: wrIdentify, wrHtmlToText: wrHtmlToText, wrPickPages: wrPickPages, wrFetchedPage: wrFetchedPage, wrDigest: wrDigest, wrFallbackBrief: wrFallbackBrief, wrCoerceBrief: wrCoerceBrief, wrParseJson: wrParseJson, wrBriefText: wrBriefText, wrFinalize: wrFinalize, wrFindUrls: wrFindUrls, wrHost: wrHost };
