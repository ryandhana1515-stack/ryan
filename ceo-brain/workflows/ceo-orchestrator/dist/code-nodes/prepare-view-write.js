// Compare the vault note with the new view (ignoring the timestamp lines) so we only commit when something changed.
const o = $('Orchestrate').first().json;
const g = ($input.first() && $input.first().json) || {};
const exists = !!g.sha && !g.error;
let old = '';
if (exists && g.content) { try { old = Buffer.from(String(g.content).replace(/\n/g, ''), 'base64').toString('utf8'); } catch (e) { old = ''; } }
const norm = (s) => String(s || '').split('\n').filter((l) => !/^updated:/.test(l) && !/^# Management view/.test(l)).join('\n').trim();
const changed = !exists || norm(old) !== norm(o.view);
return [{ json: { exists, changed, sha: g.sha || null } }];
