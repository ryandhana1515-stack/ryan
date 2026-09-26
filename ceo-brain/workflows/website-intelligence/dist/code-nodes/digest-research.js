var WR_VERSION = 'website-intelligence-1.0.0';
var WR_MAX_DIGEST = 9000;
var WR_MAX_PAGE_TEXT = 3500;
var WR_SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'youtube.com', 'x.com', 'twitter.com'];
var WR_DIRECTORY_HOSTS = ['google.com', 'maps.google', 'yelp.com', 'tripadvisor', 'wikipedia.org', 'yellowpages', 'sgpbusiness', 'recordowl', 'streetdirectory', 'carousell', 'shopee', 'lazada', 'glassdoor', 'indeed', 'bing.com', 'duckduckgo', 'reddit.com', 'hardwarezone', 'mycareersfuture', 'acra.gov.sg', 'trustpilot', 'sgcarmart'];
var WR_PAGE_RE = /(about|service|product|treatment|contact|faq|pricing|price|package|booking|book|project|portfolio|case|testimonial|review|menu|shop|gallery|location)/i;
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
// ---- n8n glue: assemble every page + result into the labelled digest ----
const id = $('Identify Company').first().json;
const input = id.input;
const pages = [];
const home = wrFetchedPage($('Fetch Homepage').first(), id.homepage_url);
if (id.homepage_url) pages.push(home);
const picks = $('Pick Pages').all().map((i) => i.json);
$input.all().forEach((it, i) => { const p = picks[i] || {}; if (!p.url || p.skip) return; pages.push(wrFetchedPage(it, p.url)); });
const digest = wrDigest({ input, identity: id.identity, results: id.results, pages });
digest.search_items = id.search_items; digest.search_errors = id.search_errors;
return [{ json: { input, identity: id.identity, digest, started_at: id.started_at } }];
