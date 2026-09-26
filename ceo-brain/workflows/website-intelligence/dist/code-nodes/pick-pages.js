var WR_VERSION = 'website-intelligence-1.0.0';
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
// ---- n8n glue: read the homepage, pick up to 3 internal pages worth fetching (Rule 5) ----
const id = $('Identify Company').first().json;
const page = wrFetchedPage($input.first(), id.homepage_url);
let urls = [];
if (page.ok) { const parsed = wrHtmlToText(page.html, id.homepage_url); urls = wrPickPages(parsed.links, 3); }
if (!urls.length) return [{ json: { url: '', skip: true, homepage_ok: page.ok } }];
return urls.map((u) => ({ json: { url: u, skip: false, homepage_ok: page.ok } }));
