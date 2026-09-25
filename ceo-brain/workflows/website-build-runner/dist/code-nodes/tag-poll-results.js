// Normalizes a poll response to {key, provider, url, done, error}.
const plan = $('Poll Jobs').all().map((i) => i.json);
const out = [];
const items = $input.all();
for (let n = 0; n < items.length; n++) {
  const r = items[n].json || {};
  let job = null;
  try { const p = items[n].pairedItem; const idx = Array.isArray(p) ? p[0].item : (p && typeof p === 'object' ? p.item : p); if (typeof idx === 'number') job = plan[idx] || null; } catch (e) { job = null; }
  if (!job) job = plan[Math.min(n, plan.length - 1)] || { key: 'shot' + n, provider: 'unknown' };
  let url = null, done = false, error = null;
  if (job.skip) { done = true; }
  else if (job.provider === 'higgsfield') {
    const st = String(r.status || '');
    if (st === 'completed') { url = (Array.isArray(r.images) && r.images[0] && r.images[0].url) || null; done = !!url; if (!url) { error = 'completed_without_image'; done = true; } }
    else if (st === 'failed' || st === 'nsfw' || st === 'canceled') { done = true; error = st; }
    else if (r.error) { done = false; error = String(r.error.message || r.error).slice(0, 120); }
  } else if (job.provider === 'kling') {
    const d = r.data || {};
    const st = String(d.task_status || '');
    if (st === 'succeed') { url = (d.task_result && Array.isArray(d.task_result.images) && d.task_result.images[0] && d.task_result.images[0].url) || null; done = true; if (!url) error = 'succeed_without_image'; }
    else if (st === 'failed') { done = true; error = String(d.task_status_msg || 'failed').slice(0, 120); }
    else if (r.error) { error = String(r.error.message || r.error).slice(0, 120); }
  }
  out.push({ json: { key: job.key, provider: job.provider, id: job.id, url, done, error } });
}
return out;
