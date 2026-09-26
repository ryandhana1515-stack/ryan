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
// ---- n8n glue: pair each search result item with its query, identify the company, choose the homepage ----
const plan = $('Plan Research').all().map((i) => i.json);
const input = plan[0].input;
const raw = $input.all();
const tagged = raw.map((it, i) => {
  let idx = i;
  try { const p = it.pairedItem; if (p !== undefined && p !== null) idx = Array.isArray(p) ? (p[0].item ?? i) : (typeof p === 'object' ? (p.item ?? i) : p); } catch (e) { idx = i; }
  const q = plan[Math.min(idx, plan.length - 1)] || {};
  const json = (it && it.json) || {};
  return { json: Object.assign({}, json, { query_key: json.query_key || q.query_key, __query: q.query }) };
});
const results = wrSearchItems(tagged);
const searchErrors = raw.filter((it) => it && it.json && it.json.error).length;
const identity = wrIdentify(input, results);
return [{ json: { input, identity, results, search_errors: searchErrors, search_items: raw.length, homepage_url: identity.website || '', started_at: plan[0].started_at } }];
