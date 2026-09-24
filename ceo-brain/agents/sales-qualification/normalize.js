// Lead validation + normalization. Pure functions, no I/O, no require().
// This file is inlined into the n8n "Validate & Normalize Lead" Code node by
// workflows/lead-intake/build.js and is also used directly by tests/.

var CB_DEFAULT_TENANT = 'biogreen';
var CB_DEFAULT_COUNTRY_CODE = '65'; // Singapore; 8-digit local numbers get this prefix
var CB_MAX_MESSAGE_LEN = 4000;
var CB_MAX_HISTORY = 20;

function cbStr(v, max) {
  if (v === undefined || v === null) return null;
  var s = String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  if (max && s.length > max) s = s.slice(0, max);
  return s;
}

function cbMessage(v) {
  if (v === undefined || v === null) return null;
  var s = String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  if (!s) return null;
  if (s.length > CB_MAX_MESSAGE_LEN) s = s.slice(0, CB_MAX_MESSAGE_LEN);
  return s;
}

function cbEmail(v) {
  var s = cbStr(v, 254);
  if (!s) return { value: null, valid: true };
  s = s.toLowerCase();
  var ok = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(s);
  return { value: ok ? s : null, valid: ok, raw: s };
}

function cbPhone(v) {
  var s = cbStr(v, 40);
  if (!s) return { value: null, valid: true };
  var plus = s.charAt(0) === '+';
  var digits = s.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return { value: null, valid: false, raw: s };
  if (!plus && digits.length === 8 && /^[3689]/.test(digits)) digits = CB_DEFAULT_COUNTRY_CODE + digits;
  if (!plus && digits.length === 10 && digits.indexOf('65') === 0) { /* already country-coded SG */ }
  return { value: '+' + digits, valid: true, raw: s };
}

function cbSlug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || null;
}

function cbHash(str) {
  // djb2 - stable, non-cryptographic; only used to build a dedupe key
  var h = 5381;
  for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function cbId(prefix, nowMs, seed) {
  var rnd = Math.floor(Math.random() * 0xffffff).toString(36);
  return prefix + '_' + nowMs.toString(36) + rnd + (seed ? '_' + cbHash(seed) : '');
}

function cbHistory(v) {
  if (!Array.isArray(v)) return [];
  var out = [];
  for (var i = 0; i < v.length && out.length < CB_MAX_HISTORY; i++) {
    var m = v[i] || {};
    var role = cbStr(m.role, 20);
    var content = cbMessage(m.content);
    if (!content) continue;
    role = (role || 'customer').toLowerCase();
    if (['customer', 'agent', 'human'].indexOf(role) === -1) role = role === 'assistant' || role === 'ai' ? 'agent' : 'customer';
    out.push({ role: role, content: content, ts: cbStr(m.ts, 40) });
  }
  return out;
}

var CB_SOURCES = ['facebook', 'instagram', 'tiktok', 'website', 'whatsapp', 'email', 'referral', 'manual', 'test', 'linkedin', 'google', 'phone', 'other'];
var CB_CHANNELS = ['whatsapp', 'email', 'messenger', 'instagram_dm', 'tiktok_dm', 'web_chat', 'phone', 'sms', 'unknown'];

function cbSource(v) {
  var s = cbSlug(cbStr(v, 40));
  if (!s) return 'unknown';
  if (s.indexOf('facebook') === 0 || s === 'fb' || s === 'meta') return 'facebook';
  if (s.indexOf('instagram') === 0 || s === 'ig') return 'instagram';
  if (s.indexOf('tiktok') === 0) return 'tiktok';
  if (s.indexOf('web') === 0 || s === 'site' || s === 'landing_page') return 'website';
  if (s.indexOf('whatsapp') === 0 || s === 'wa') return 'whatsapp';
  return CB_SOURCES.indexOf(s) !== -1 ? s : 'other';
}

function cbChannel(v, source) {
  var s = cbSlug(cbStr(v, 40));
  if (s && CB_CHANNELS.indexOf(s) !== -1) return s;
  if (s === 'whatsapp_business') return 'whatsapp';
  if (s === 'ig' || s === 'instagram') return 'instagram_dm';
  if (s === 'facebook' || s === 'fb') return 'messenger';
  if (source === 'whatsapp') return 'whatsapp';
  if (source === 'email') return 'email';
  if (source === 'facebook') return 'messenger';
  if (source === 'instagram') return 'instagram_dm';
  return 'unknown';
}

/**
 * normalizeLead(raw, opts) -> { ok, errors, warnings, lead }
 * raw  : the JSON body an adapter POSTed (see schemas/lead-input.schema.json)
 * opts : { nowMs, defaultTenant, defaultAiMode }
 */
function normalizeLead(raw, opts) {
  opts = opts || {};
  raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  var nowMs = typeof opts.nowMs === 'number' ? opts.nowMs : Date.now();
  var errors = [];
  var warnings = [];

  var tenant = cbSlug(cbStr(raw.tenant_id, 60)) || opts.defaultTenant || CB_DEFAULT_TENANT;
  var name = cbStr(raw.name || raw.contact_name || raw.full_name, 120);
  var email = cbEmail(raw.email);
  var phone = cbPhone(raw.phone || raw.mobile || raw.whatsapp);
  var company = cbStr(raw.company || raw.company_name, 160);
  var industry = cbStr(raw.industry, 80);
  var source = cbSource(raw.source || raw.lead_source);
  var channel = cbChannel(raw.channel, source);
  var message = cbMessage(raw.message || raw.text || raw.enquiry);
  var history = cbHistory(raw.conversation_history || raw.history);
  var testMode = raw.test_mode === true || raw.test_mode === 'true' || source === 'test';
  var aiMode = String(raw.ai_mode || opts.defaultAiMode || 'live').toLowerCase() === 'mock' ? 'mock' : 'live';
  var extIds = {};
  if (raw.external_ids && typeof raw.external_ids === 'object') {
    for (var k in raw.external_ids) {
      var kv = cbStr(raw.external_ids[k], 120);
      if (kv) extIds[cbSlug(k)] = kv;
    }
  }

  if (!email.valid) warnings.push('email_invalid_ignored:' + email.raw);
  if (!phone.valid) warnings.push('phone_invalid_ignored:' + phone.raw);

  var hasContactPoint = !!(email.value || phone.value || Object.keys(extIds).length);
  if (!message && history.length === 0) errors.push('message_required');
  if (!hasContactPoint && !name) errors.push('contact_point_or_name_required');
  if (!hasContactPoint) warnings.push('no_contact_point');

  // Dedupe key: tenant + strongest identifier available
  var identity = email.value || phone.value || (Object.keys(extIds).length ? JSON.stringify(extIds) : null) || (name ? 'name:' + name.toLowerCase() : null);
  var leadKey = identity ? tenant + ':' + cbHash(identity) : null;
  var leadId = cbStr(raw.lead_id, 80) || cbId('lead', nowMs, leadKey || 'anon');

  var lead = {
    tenant_id: tenant,
    lead_id: leadId,
    lead_key: leadKey,
    contact_name: name,
    email: email.value,
    phone: phone.value,
    company_name: company,
    industry: industry,
    lead_source: source,
    channel: channel,
    message: message || (history.length ? history[history.length - 1].content : null),
    conversation_history: history,
    external_ids: extIds,
    test_mode: testMode,
    ai_mode: aiMode,
    received_at: new Date(nowMs).toISOString()
  };

  return { ok: errors.length === 0, errors: errors, warnings: warnings, lead: lead };
}

module.exports = { normalizeLead: normalizeLead, cbHash: cbHash, cbId: cbId, cbStr: cbStr };
