// One shape for the Website Build Record whether the build succeeded or failed.
const c = $('Build Config').first().json;
const im = (() => { try { return $('Collect Images').first().json; } catch (e) { return { image_list: [] }; } })();
const r = $input.first().json || {};
const status = r.status === 'build_failed' || r.create_error ? 'build_failed' : 'built';
const notes = [status === 'built' ? (r.notes || 'built') : ('Build failed: ' + (r.create_error || r.notes || 'unknown')), 'photos: ' + ((im.image_list || []).length) + ' generated', c.test_mode ? 'test session' : 'real lead'].join(' · ');
return [{ json: { task_id: c.task_id, lead_id: c.lead_id, status, project_id: r.project_id || '', preview_url: r.preview_url || '', editor_url: r.editor_url || '', notes: notes.slice(0, 900), actor: 'agent:website-build-runner', source_execution_id: c.execution_id } }];
