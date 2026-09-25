// Is the Lovable agent finished? (agentFinished true, or the poll budget is spent → report anyway; the preview URL is live.)
const c = $('Build Config').first().json;
const p = $('Parse Create Result').first().json;
const raw = $input.first().json || {};
const text = JSON.stringify(raw);
const finished = /"agentFinished"\s*:\s*true/.test(text) || /agentFinished['"]?\s*[:=]\s*true/.test(text);
const failed = /"status"\s*:\s*"failed"/.test(text);
const polls = ($runIndex || 0) + 1;
const gaveUp = polls >= c.config.max_build_polls;
const done = finished || failed || gaveUp;
return [{ json: { project_id: p.project_id, preview_url: p.preview_url, editor_url: p.editor_url, finished, failed, polls, gave_up: gaveUp, done, status: failed ? 'build_failed' : 'built', notes: finished ? 'Lovable agent finished after ' + polls + ' poll(s).' : (failed ? 'Lovable reported a failed build.' : 'Lovable still finishing after ' + polls + ' polls; preview URL is live and updates as it completes.') } }];
