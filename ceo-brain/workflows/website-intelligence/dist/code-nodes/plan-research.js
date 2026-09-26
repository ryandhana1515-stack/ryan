var WR_VERSION = 'website-intelligence-1.0.0';
var WR_SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'youtube.com', 'x.com', 'twitter.com'];
var WR_DIRECTORY_HOSTS = ['google.com', 'maps.google', 'yelp.com', 'tripadvisor', 'wikipedia.org', 'yellowpages', 'sgpbusiness', 'recordowl', 'streetdirectory', 'carousell', 'shopee', 'lazada', 'glassdoor', 'indeed', 'bing.com', 'duckduckgo', 'reddit.com', 'hardwarezone', 'mycareersfuture', 'acra.gov.sg', 'trustpilot', 'sgcarmart'];
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
// ---- n8n glue: one item per search query; the normalized hand-off rides on every item ----
const inp = ($input.first() && $input.first().json) || {};
const input = wrInput(inp);
const queries = wrQueries(input);
const started_at = new Date().toISOString();
if (!queries.length) return [{ json: { query_key: 'none', query: '', input, started_at, no_company: true } }];
return queries.map((q) => ({ json: { query_key: q.key, query: q.query, input, started_at } }));
