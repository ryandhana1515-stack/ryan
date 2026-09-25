// Every round polls every submitted job (cheap, stateless). Round 1 runs ~60s after submission.
const s = $('Collect Submissions').first().json;
const jobs = (s.jobs || []).filter((x) => x.id);
if (!jobs.length) return [{ json: { key: 'none', provider: 'none', id: null, status_url: '', skip: true } }];
return jobs.map((x) => ({ json: x }));
