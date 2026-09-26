function ocStr(v, max) { if (v === undefined || v === null) return ''; var s = String(v).trim(); return max && s.length > max ? s.slice(0, max) : s; }
function ocInboxAction(body, pin) {
  body = (body && typeof body === 'object') ? body : {};
  var allowed = { close: 'done', recover: 'recovered', reopen: 'open', cancel: 'cancelled' };
  var action = ocStr(body.action, 20).toLowerCase();
  var taskId = ocStr(body.task_id, 120);
  if (!pin || ocStr(body.pin, 80) !== String(pin)) return { ok: false, error: 'wrong_pin', http: 403 };
  if (!allowed[action]) return { ok: false, error: 'unknown_action', http: 400 };
  if (!taskId) return { ok: false, error: 'task_id_required', http: 400 };
  return { ok: true, action: action, task_id: taskId, status: allowed[action], note: ocStr(body.note, 300), ts: new Date().toISOString() };
}
// ---- n8n glue ----
const cfg = $('Inbox Config').first().json;
const inp = ($input.first() && $input.first().json) || {};
const body = (inp.body && typeof inp.body === 'object') ? inp.body : {};
const r = ocInboxAction(body, cfg.pin);
r.execution_id = $execution.id;
return [{ json: r }];
