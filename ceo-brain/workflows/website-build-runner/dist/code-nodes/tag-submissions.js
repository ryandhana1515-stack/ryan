// Pairs each submission response with its shot and normalizes {provider, id, status_url}.
const shots = $('Image Shots').all().map((i) => i.json);
const out = [];
const items = $input.all();
for (let n = 0; n < items.length; n++) {
  const r = items[n].json || {};
  let shot = null;
  try { const p = items[n].pairedItem; const idx = Array.isArray(p) ? p[0].item : (p && typeof p === 'object' ? p.item : p); if (typeof idx === 'number') shot = shots[idx] || null; } catch (e) { shot = null; }
  if (!shot) shot = shots[Math.min(n, shots.length - 1)] || { key: 'shot' + n, aspect_ratio: '16:9' };
  let provider = 'higgsfield', id = null, statusUrl = null, error = null;
  if (r.request_id) { id = String(r.request_id); statusUrl = String(r.status_url || ('https://api.higgsfield.ai/requests/' + id + '/status')); }
  else if (r.data && r.data.task_id) { provider = 'kling'; id = String(r.data.task_id); statusUrl = 'https://api-singapore.klingai.com/v1/images/generations/' + id; }
  else error = String((r.error && (r.error.message || r.error.description)) || r.message || r.detail || 'submit_failed').slice(0, 200);
  out.push({ json: { key: shot.key, aspect_ratio: shot.aspect_ratio, provider, id, status_url: statusUrl, error, url: null } });
}
return out;
