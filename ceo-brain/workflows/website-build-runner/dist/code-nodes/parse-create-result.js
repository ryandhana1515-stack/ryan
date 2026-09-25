// Reads the MCP tool result (shape varies) and finds the Lovable project id + URLs.
const raw = $input.first().json || {};
const text = JSON.stringify(raw);
const m = text.match(/"project_?[iI]d"\s*:\s*"([0-9a-f-]{36})"/) || text.match(/lovable\.dev\/projects\/([0-9a-f-]{36})/) || text.match(/id-preview--([0-9a-f-]{36})/);
const id = m ? m[1] : null;
const prev = text.match(/https:\/\/id-preview--[0-9a-f-]{36}\.lovable\.app/);
const edit = text.match(/https:\/\/lovable\.dev\/projects\/[0-9a-f-]{36}/);
const err = !id ? String((raw.error && (raw.error.message || raw.error.description)) || (text.match(/"error"\s*:\s*"([^"]{1,200})"/) || [null, 'lovable_create_failed'])[1]).slice(0, 300) : null;
return [{ json: { project_id: id, preview_url: prev ? prev[0] : (id ? 'https://id-preview--' + id + '.lovable.app' : null), editor_url: edit ? edit[0] : (id ? 'https://lovable.dev/projects/' + id : null), create_error: err, create_raw: text.slice(0, 1500) } }];
