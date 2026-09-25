// Shots Higgsfield refused (no credential, 4xx/5xx) are retried on Kling.
const shots = $('Image Shots').all().map((i) => i.json);
return $input.all().map((item, n) => {
  let shot = null;
  try { shot = $('Image Shots').item ? $('Image Shots').item.json : null; } catch (e) { shot = null; }
  if (!shot) shot = shots[Math.min(n, shots.length - 1)] || {};
  return { json: { idx: shot.idx, key: shot.key, prompt: shot.prompt, aspect_ratio: shot.aspect_ratio, provider: 'kling', higgsfield_error: String((item.json && item.json.error && (item.json.error.message || item.json.error.description)) || 'higgsfield_submit_failed').slice(0, 200) } };
});
