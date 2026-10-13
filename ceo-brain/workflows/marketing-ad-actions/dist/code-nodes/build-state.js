var ML_VERSION = 'mk-meta-live-1.0.0';
var ML_ACTIONS = ['pause_ad', 'set_daily_budget'];
var ML_FIELDS = { campaigns: 'id,name,effective_status,daily_budget', adsets: 'id,campaign_id,effective_status,daily_budget', pause_ad: 'id,account_id,status,effective_status', set_daily_budget: 'id,account_id,daily_budget,effective_status' };
function mlNum(v) { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
function mlStr(v) { return v === null || v === undefined ? '' : String(v); }
function mlR2(v) { return Math.round(v * 100) / 100; }
function mlErr(resp) {
  if (!resp || typeof resp !== 'object') return 'no response from Meta';
  var e = resp.error;
  if (e) return mlStr(typeof e === 'string' ? e : (e.message || e.description || JSON.stringify(e))).slice(0, 300);
  return '';
}
function mlState(campaignsResp, adsetsResp, offset) {
  var off = mlNum(offset) > 0 ? mlNum(offset) : 100;
  var ce = mlErr(campaignsResp), ae = mlErr(adsetsResp);
  if (ce || !Array.isArray(campaignsResp.data)) return { ok: false, reason: 'campaigns could not be read: ' + (ce || 'unexpected response') };
  if (ae || !Array.isArray(adsetsResp.data)) return { ok: false, reason: 'ad sets could not be read: ' + (ae || 'unexpected response') };
  if ((campaignsResp.paging && campaignsResp.paging.next) || (adsetsResp.paging && adsetsResp.paging.next)) return { ok: false, reason: 'more campaigns or ad sets than one page (500); the daily total would be incomplete, so nothing is trusted' };
  var camps = campaignsResp.data, sets = adsetsResp.data;
  var cbo = {}, ads = {}, total = 0;
  camps.forEach(function (c) { if (c && mlNum(c.daily_budget) > 0) cbo[mlStr(c.id)] = true; });
  camps.forEach(function (c) {
    if (!c || !c.id) return;
    var id = mlStr(c.id), status = c.effective_status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED', budgetId = null, daily = null;
    if (cbo[id]) { budgetId = id; daily = mlR2(mlNum(c.daily_budget) / off); if (status === 'ACTIVE') total += daily; }
    else {
      var own = sets.filter(function (s) { return s && mlStr(s.campaign_id) === id && s.effective_status === 'ACTIVE' && mlNum(s.daily_budget) > 0; });
      if (own.length === 1) { budgetId = mlStr(own[0].id); daily = mlR2(mlNum(own[0].daily_budget) / off); }
    }
    ads[id] = { name: mlStr(c.name), status: status, budget_id: budgetId, daily_budget: daily };
  });
  sets.forEach(function (s) {
    if (!s || s.effective_status !== 'ACTIVE' || !(mlNum(s.daily_budget) > 0) || cbo[mlStr(s.campaign_id)]) return;
    total += mlNum(s.daily_budget) / off;
  });
  return { ok: true, account_daily_total: mlR2(total), ads: ads, campaigns: camps.length, adsets: sets.length };
}
// ---- n8n glue: read-only state for the daily routine (no writes, no ledger rows) ----
const req = $('Read Request').first().json;
if (!req.valid) return [{ json: { ok: false, mode: 'state', reason: 'bad request: ' + req.problems.join('; ') } }];
const st = mlState($('Read Campaigns (Meta)').first().json, $('Read Ad Sets (Meta)').first().json, req.currency_offset);
if (!st.ok) return [{ json: { ok: false, mode: 'state', reason: st.reason } }];
return [{ json: { ok: true, mode: 'state', ad_account_id: req.ad_account_id, currency_offset: req.currency_offset, account_daily_total: st.account_daily_total, ads: st.ads, campaigns: st.campaigns, adsets: st.adsets, read_at: new Date().toISOString(), version: "mk-meta-live-1.0.0" } }];
