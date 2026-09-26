// One item per checkpoint-1 file.
const f = $('Finalize ATLAS').first().json;
return f.files.map((x) => ({ json: { path: x.path, content: x.content, commit: 'vault: ATLAS checkpoint 1 — ' + (f.input.company_name || f.input.lead_id) } }));
