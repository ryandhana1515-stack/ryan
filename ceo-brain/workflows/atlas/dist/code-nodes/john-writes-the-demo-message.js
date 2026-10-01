function atStr(v, max) {
  if (v === undefined || v === null) return '';
  var s = String(v).replace(/\s+/g, ' ').trim();
  return max && s.length > max ? s.slice(0, max) : s;
}
function atArr(v) { return Array.isArray(v) ? v.map(function (x) { return atStr(x, 200); }).filter(Boolean) : []; }
var AT_EXPLICIT = /\b(crm|edg|pipeline|automat\w*|workflow|integrat\w*|dashboard|erp|ai agents?|operating system|lead management|follow[- ]?up system)\b/i;
var AT_SYS = '(?:crms?|edg|erp|automat\\w*|workflows?|systems?|dashboards?|ai agents?|pipelines?)';
var AT_DECLINED = new RegExp("\\b(?:don'?t|do not|didn'?t|did not)\\s+(?:really\\s+)?(?:want|need)\\b[^.?!\\n]{0,30}\\b" + AT_SYS + "\\b"
  + "|\\bno need (?:for )?(?:a |an |the |any )?" + AT_SYS + "\\b|\\bnot interested in\\b[^.?!\\n]{0,30}\\b" + AT_SYS + "\\b|\\bno (?:crm|edg)\\b"
  + "|\\b(?:only|just)\\s+(?:(?:want|need|wanted|needed)\\s+)?(?:a |the |my )?(?:new )?web ?sites?\\b", 'i');
function atDeclinedSystems(text) { return AT_DECLINED.test(String(text || '')); }
/** Did the customer ask for systems work (CRM, automation, integrations, AI agents) themselves? Their latest word on it
 *  counts: "I don't want a CRM" ends it, a later "actually, add a CRM" starts it again. A website request alone is never
 *  systems work (Ryan, 2026-10-01: he asked for a website and got a CRM). */
function atSystemsWanted(o) {
  o = o || {};
  var ex = (o.extracted && typeof o.extracted === 'object') ? o.extracted : {};
  var sentences = [o.history_text || '', o.message || ''].join('\n').split(/(?<=[.!?])\s+|\n+/);
  for (var i = sentences.length - 1; i >= 0; i--) {
    if (atDeclinedSystems(sentences[i])) return false;
    if (AT_EXPLICIT.test(sentences[i])) return true;
  }
  var wants = atArr(ex.desired_automation).filter(function (w) { return w !== 'website_build' && !/web ?site/i.test(String(w)); });
  return wants.length > 0;
}
/** Should John wake ATLAS for this lead? Needs a named company, a systems need the customer asked for (never only a
 *  website: Ryan, 2026-10-01 replaces the 2026-09-27 rule) and at least one fact about how they work today. */
function atDemoMessage(input, build) {
  input = input || {}; build = build || {};
  var url = atStr(build.demo_url, 300);
  var ok = (build.status === 'built' || build.status === 'already_built') && /^https:\/\/[^\s]+\/d\/[A-Za-z0-9_-]{40,60}$/.test(url);
  var said = (Array.isArray(input.conversation) ? input.conversation : []).filter(function (m) { return m && m.role !== 'agent'; }).map(function (m) { return String(m.content || ''); }).join('\n');
  if (!atSystemsWanted({ extracted: input.extracted, message: input.message, history_text: said })) ok = false;
  var channel = input.channel === 'whatsapp' ? 'whatsapp' : (input.channel === 'email' ? 'email' : null);
  var to = channel === 'whatsapp' ? atStr(input.phone, 40) : (channel === 'email' ? atStr(input.email, 200) : '');
  var first = atStr(input.contact_name, 60).split(' ')[0];
  var biz = atStr(input.company_name, 80);
  var text = (first ? 'Hi ' + first + ', ' : 'Hi, ') + 'good news: I have set up a working demo of ' + (biz ? biz + '\'s' : 'your') + ' system for you to try:\n\n' + url + '\n\n'
    + 'Tap the link and chat with your new AI assistant as if you were one of your customers. You will see each enquiry land in your CRM, and what now runs by itself every day. '
    + 'It is a safe demo, so nothing is sent to real customers, and it takes about 2 minutes. Tell me what you think!';
  return { send: !!(ok && channel && to), channel: channel, to: to, text: text, message_id: 'msg_atlas_demo_' + atStr(input.lead_id, 80) + '_' + Date.now().toString(36) };
}
// ---- n8n glue: John sends the prospect their "Try your system" link (on the channel they used) ----
const f = $('Finalize ATLAS').first().json;
const b = $('Build on EDG (automatic)').first().json || {};
return [{ json: Object.assign({ tenant_id: f.input.tenant_id, lead_id: f.input.lead_id, test_mode: f.input.test_mode, ts: new Date().toISOString() }, atDemoMessage(f.input, b)) }];
