// Decides what happens to this brief (Ryan, 2026-09-25: mock-ups build automatically, nobody approves).
// build          -> the Website Build Runner is started now (one build per lead, daily cap)
// ask_customer   -> details missing; John keeps asking (no build)
// already_built  -> this lead already has a mock-up building/built
// daily_cap      -> too many builds today; owner emailed
const MAX_BUILDS_PER_DAY = 12;
const f = $('Finalize Website Brief').first().json;
const rows = $input.all().map((i) => i.json).filter((r) => r && r.task_type === 'website_build');
const mine = rows.filter((r) => r.lead_id === f.input.lead_id);
const today = new Date().toISOString().slice(0, 10);
const todayBuilds = rows.filter((r) => (r.status === 'building' || r.status === 'built') && String(r.ts || r.updatedAt || '').slice(0, 10) === today).length;
const existing = mine.find((r) => r.status === 'building' || r.status === 'built') || null;
let decision = 'build';
if (existing) decision = 'already_built';
else if (!f.ready_to_build) decision = 'ask_customer';
else if (todayBuilds >= MAX_BUILDS_PER_DAY) decision = 'daily_cap';
const status = decision === 'build' ? 'building' : (decision === 'already_built' ? existing.status : 'open');
const task = Object.assign({}, f.task, {
  status,
  assigned_to: decision === 'build' ? 'website-build-runner' : (decision === 'ask_customer' ? 'sales-agent' : (decision === 'daily_cap' ? 'human' : f.task.assigned_to)),
  requires_approval: false,
  approval_reason: decision === 'build' ? 'auto_build_policy_2026-09-25' : (decision === 'ask_customer' ? 'awaiting_customer_details:' + f.missing_for_build.join(',') : decision)
});
const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const intro = decision === 'build'
  ? '<p style="background:#e8f5ec;padding:10px 14px;border-radius:6px"><b>Building now.</b> The Website Build Runner is generating the photography and building the mock-up in Lovable. John sends the customer the preview link when it is ready; you get a copy.</p>'
  : decision === 'ask_customer'
    ? '<p style="background:#fff6e0;padding:10px 14px;border-radius:6px"><b>Not built yet:</b> John is still collecting ' + esc(f.missing_for_build.join(', ')) + ' from the customer. The build starts on its own once they answer.</p>'
    : decision === 'already_built'
      ? '<p style="background:#eef1f5;padding:10px 14px;border-radius:6px"><b>Already ' + esc(existing.status) + '</b> for this lead (task ' + esc(existing.task_id) + '). No second build.</p>'
      : '<p style="background:#fdecec;padding:10px 14px;border-radius:6px"><b>Daily build cap reached</b> (' + todayBuilds + ' today). This brief waits for you.</p>';
const subject = (f.input.test_mode ? '[TEST] ' : '') + 'CEO Brain: ' + (decision === 'build' ? 'website mock-up building — ' : decision === 'ask_customer' ? 'website brief waiting for details — ' : decision === 'already_built' ? 'website brief (already built) — ' : 'website build cap — ') + (f.brief.business_name || f.input.contact_name || f.input.lead_id);
return [{ json: Object.assign({}, f, { build_decision: decision, decision_reason: decision === 'ask_customer' ? f.missing_for_build.join(',') : decision, existing_task: existing, today_builds: todayBuilds, task, email_subject: subject, email_html: intro + f.email_html, image_shots_json: JSON.stringify(f.image_shots || []) }) }];
