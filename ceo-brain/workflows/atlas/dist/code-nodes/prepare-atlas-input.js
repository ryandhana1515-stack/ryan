function atStr(v, max) {
  if (v === undefined || v === null) return '';
  var s = String(v).replace(/\s+/g, ' ').trim();
  return max && s.length > max ? s.slice(0, max) : s;
}
function atSlug(name) {
  var s = String(name || '').toLowerCase().replace(/\b(pte\.?|ltd\.?|llp|inc\.?|co\.?)\b/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, 60).replace(/-+$/, '') || 'unnamed-company';
}
function atParse(v, dflt) {
  if (v && typeof v === 'object') return v;
  try { var o = JSON.parse(v || ''); return o === null || o === undefined ? dflt : o; } catch (e) { return dflt; }
}
/** Should John wake ATLAS for this lead? Needs a named company, a systems need (not only a website) and at least one fact about how they work today. */
function atInput(inp) {
  inp = inp || {};
  var ex = atParse(inp.extracted_json, {}) || {};
  var conv = atParse(inp.conversation_json, []) || [];
  var company = atStr(inp.company_name || ex.company_name, 160);
  var test = inp.test_mode === true || inp.test_mode === 'true';
  var slug = atSlug(company);
  var base = 'zaphiel/vault/80_Clients/' + (test ? '_Test/' : '') + slug + '/edg/';
  return {
    tenant_id: atStr(inp.tenant_id, 60) || 'fusiontech', lead_id: atStr(inp.lead_id, 120), contact_name: atStr(inp.contact_name, 120),
    company_name: company, industry: atStr(inp.industry || ex.industry, 120), email: atStr(inp.email, 200), phone: atStr(inp.phone, 40),
    channel: atStr(inp.channel, 30), message: atStr(inp.message, 4000), conversation: Array.isArray(conv) ? conv.slice(-30) : [],
    sales_summary: atStr(inp.sales_summary, 2000), extracted: ex, test_mode: test, notify_email: atStr(inp.notify_email, 200),
    source_execution_id: atStr(inp.source_execution_id, 40), slug: slug, base_path: base
  };
}
// ---- n8n glue: normalise John's hand-off ----
const input = atInput(($input.first() && $input.first().json) || {});
return [{ json: { input, started_at: new Date().toISOString() } }];
