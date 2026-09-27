var WA_DEFAULT_TENANT = 'fusiontech';
var WA_NEW_CHAT_RE = /^\s*(#\s*)?(new\s*chat|reset(\s*chat)?|start\s+(a\s+)?new\s+chat)\s*[.!]*\s*$/i;
var WA_NEW_CHAT_REPLY = 'New chat started. Everything before this is forgotten, so message me as a new customer.';
var WA_VOICE_UNCLEAR = '(The customer sent a voice message, but it could not be heard clearly. Kindly ask them to send it again or type it.)';
/** The message John reads: the typed text, or the transcript of a voice note. Never empty for a voice note. */
function waMessageFrom(wa, transcript) {
  wa = wa || {};
  var isVoice = wa.type === 'audio' || wa.type === 'voice';
  var spoken = isVoice ? String(transcript || '').replace(/\s+/g, ' ').trim() : '';
  return {
    from: wa.from || '', phone: wa.phone || '', name: wa.name || '', wa_message_id: wa.wa_message_id || '', wa_timestamp: wa.wa_timestamp || '',
    type: wa.type || 'text', voice: isVoice, spoken: spoken,
    text: isVoice ? (spoken || WA_VOICE_UNCLEAR) : String(wa.text || '')
  };
}
function waIsNewChat(text) { return WA_NEW_CHAT_RE.test(String(text || '')); }
/** The ceo_leads row that starts a fresh conversation on this number: new lead_key and lead_id, status NEW. */
function waNewChatLead(o) {
  o = o || {};
  var tenant = String(o.tenant_id || WA_DEFAULT_TENANT).replace(/[^A-Za-z0-9_-]/g, '') || WA_DEFAULT_TENANT;
  var digits = String(o.phone || '').replace(/[^0-9]/g, '');
  var ms = Number(o.now_ms) || Date.now();
  var stamp = ms.toString(36);
  return {
    tenant_id: tenant,
    lead_id: 'lead_wa' + digits + '_' + stamp,
    lead_key: tenant + ':wa' + digits + ':' + stamp,
    status: 'NEW',
    contact_name: String(o.name || ''),
    email: '',
    phone: String(o.phone || ''),
    company_name: '',
    industry: '',
    lead_source: 'whatsapp',
    channel: 'whatsapp',
    last_message: '',
    test_mode: false,
    updated_by: 'whatsapp-inbound:new-chat',
    last_contact_at: new Date(ms).toISOString()
  };
}
/** The lead contract POSTed to Lead Intake. `rows` are the lead's recent ceo_messages rows (any order). */
function waBuildPayload(o) {
  var wa = (o && o.wa) || {};
  var leadRow = (o && o.leadRow) || {};
  var rows = ((o && o.rows) || []).filter(function (r) { return r && r.content; });
  rows.sort(function (a, b) { return String(a.ts || a.createdAt || '').localeCompare(String(b.ts || b.createdAt || '')); });
  var history = rows
    .filter(function (r) { return r.direction === 'inbound' || (r.direction === 'outbound' && r.status === 'sent'); })
    .map(function (r) { return { role: r.direction === 'inbound' ? 'customer' : 'agent', content: r.content, ts: r.ts || r.createdAt || null }; })
    .slice(-10);
  var payload = {
    tenant_id: leadRow.tenant_id || WA_DEFAULT_TENANT,
    lead_id: leadRow.lead_id || null,
    name: wa.name || null,
    phone: wa.phone,
    source: 'whatsapp',
    channel: 'whatsapp',
    message: wa.text,
    conversation_history: history,
    external_ids: { wa_id: wa.from, wa_message_id: wa.wa_message_id },
    test_mode: false,
    ai_mode: 'live'
  };
  if (leadRow.lead_key) payload.lead_key = leadRow.lead_key;
  return { payload: payload, history_count: history.length, known_lead: !!leadRow.lead_id };
}
// ---- n8n glue ----
const wa = $('Prepare Message').first().json;
const leadRow = ($('Find Lead by Phone').first() && $('Find Lead by Phone').first().json) || {};
const newChat = waIsNewChat(wa.text);
return [{ json: { new_chat: newChat, phone: wa.phone, new_lead: newChat ? waNewChatLead({ tenant_id: leadRow.tenant_id, phone: wa.phone, name: wa.name }) : null, reply: WA_NEW_CHAT_REPLY } }];
