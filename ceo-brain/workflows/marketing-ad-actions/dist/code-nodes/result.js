// ---- n8n glue: one answer for the routine, whichever path ran ----
const src = $('Confirm').isExecuted ? $('Confirm').first().json : $('Guard').first().json;
const w = ($input.first() && $input.first().json) || {};
return [{ json: { ok: src.ok === true && src.status === 'done', status: src.status, reason: src.reason, read_back: src.read_back || null, key: src.ledger_row ? src.ledger_row.key : null, ledger_written: !w.error, action: src.action || null } }];
