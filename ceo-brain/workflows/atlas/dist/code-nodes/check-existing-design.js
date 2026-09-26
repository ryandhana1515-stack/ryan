// Once per lead: if ATLAS already opened a checkpoint for this lead, stop here.
const prep = $('Prepare ATLAS Input').first().json;
const rows = $input.all().map((i) => i.json).filter((r) => r && r.task_type === 'edg_design' && r.lead_id === prep.input.lead_id);
return [{ json: Object.assign({}, prep, { already: rows.length > 0, existing_status: rows.length ? rows[0].status : null }) }];
