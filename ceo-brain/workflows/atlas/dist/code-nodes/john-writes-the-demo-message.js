function atStr(v, max) {
  if (v === undefined || v === null) return '';
  var s = String(v).replace(/\s+/g, ' ').trim();
  return max && s.length > max ? s.slice(0, max) : s;
}
function atDemoMessage(input, build) {
  input = input || {}; build = build || {};
  var url = atStr(build.demo_url, 300);
  var ok = (build.status === 'built' || build.status === 'already_built') && /^https:\/\/[^\s]+\/d\/[A-Za-z0-9_-]{40,60}$/.test(url);
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
