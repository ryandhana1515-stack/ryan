// Pair each GitHub lookup with its file: existing file → edit, missing → create.
const files = $('Files to Write').all().map((i) => i.json);
return $input.all().map((it, n) => {
  let idx = n;
  try { const p = it.pairedItem; if (p !== undefined && p !== null) idx = Array.isArray(p) ? (p[0].item ?? n) : (typeof p === 'object' ? (p.item ?? n) : p); } catch (e) { idx = n; }
  const f = files[Math.min(idx, files.length - 1)];
  const g = it.json || {};
  const exists = !!(g.sha && !g.error);
  return { json: Object.assign({}, f, { mode: exists ? 'edit' : 'create' }) };
});
