// Once per lead: if ATLAS already designed for this lead, the run becomes an update round (no new design).
const prep = $('Prepare ATLAS Input').first().json;
const rows = $input.all().map((i) => i.json).filter((r) => r && r.task_type === 'edg_design' && r.lead_id === prep.input.lead_id);
let basePath = null;
try { basePath = rows.length ? (JSON.parse(rows[0].payload_json || '{}').base_path || null) : null; } catch (e) { basePath = null; }
return [{ json: Object.assign({}, prep, { already: rows.length > 0, existing_status: rows.length ? rows[0].status : null, existing_base_path: basePath || prep.input.base_path }) }];
