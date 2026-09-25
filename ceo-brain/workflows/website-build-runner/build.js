#!/usr/bin/env node
// Generates the n8n Workflow-SDK source for "CEO Brain — Website Build Runner": the teammate the
// Website Builder calls once John has the customer's details. It generates the site's photography
// (Higgsfield API, Kling API as fallback), builds the mock-up in Lovable through n8n's MCP Client node
// (Lovable OAuth credential, authorized once in n8n), waits for the build, and reports the preview to
// the Website Build Record, which hands the link to John / the customer. Nobody approves anything
// (Ryan, 2026-09-25). Nothing is published to a live domain.
//
//   node workflows/website-build-runner/build.js  -> dist/website-build-runner.sdk.ts + dist/code-nodes/*.js
//
// Credentials live only in n8n: "Higgsfield API" (header Authorization: Key <id>:<secret>),
// "Kling API" (header Authorization: Bearer <api key>), "Lovable MCP (OAuth2)".

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const TABLES_JSON = JSON.parse(read('database/n8n-data-tables.json'));
const LOVABLE = TABLES_JSON.lovable || { workspace_id: '', mcp_endpoint: 'https://mcp.lovable.dev' };
const RECORD_URL = 'https://ryan1515.app.n8n.cloud/webhook/ceo-brain/website-built';
const j = (v) => JSON.stringify(v);

// ---------------------------------------------------------------- Code nodes
const codeConfig = `// Normalizes the Website Builder's hand-off and fixes the run configuration. No secrets here.
const inp = $input.first().json || {};
const str = (v) => (v === undefined || v === null ? '' : String(v));
let shots = [];
try { shots = JSON.parse(inp.image_shots_json || '[]'); } catch (e) { shots = []; }
if (!Array.isArray(shots)) shots = [];
shots = shots.slice(0, 3).map((s, i) => ({ idx: i, key: str(s && s.key) || ('shot' + i), prompt: str(s && s.prompt).slice(0, 1500), aspect_ratio: str(s && s.aspect_ratio) || '16:9' })).filter((s) => s.prompt);
if (!shots.length) shots = [{ idx: 0, key: 'hero', prompt: 'Cinematic wide establishing photograph for a premium ' + (str(inp.industry_category) || 'business') + ' website in Singapore, dusk light, rich colour, photorealistic, no text, no logos', aspect_ratio: '16:9' }];
return [{ json: {
  task_id: str(inp.task_id), lead_id: str(inp.lead_id), tenant_id: str(inp.tenant_id) || 'fusiontech',
  business_name: str(inp.business_name), industry_category: str(inp.industry_category) || 'other', mode: str(inp.mode) || 'sme',
  build_prompt: str(inp.build_prompt), contact_name: str(inp.contact_name), notify_email: str(inp.notify_email),
  test_mode: inp.test_mode === true || inp.test_mode === 'true', source_execution_id: str(inp.source_execution_id),
  shots,
  config: { record_url: ${j(RECORD_URL)}, lovable_workspace_id: ${j(LOVABLE.workspace_id || '')}, image_model_path: 'bytedance/seedream/v4/text-to-image', image_resolution: '2K', kling_model: 'kling-v3', max_image_polls: 4, max_build_polls: 6 },
  started_at: new Date().toISOString(), execution_id: String($execution.id), workflow_id: String($workflow.id)
} }];
`;

const codeShots = `// One item per photograph to generate (Higgsfield first; failures fall over to Kling).
const c = $('Build Config').first().json;
return c.shots.map((s) => ({ json: { idx: s.idx, key: s.key, prompt: s.prompt, aspect_ratio: s.aspect_ratio, resolution: c.config.image_resolution, provider: 'higgsfield' } }));
`;

const codeKlingPrep = `// Shots Higgsfield refused (no credential, 4xx/5xx) are retried on Kling.
const shots = $('Image Shots').all().map((i) => i.json);
return $input.all().map((item, n) => {
  let shot = null;
  try { shot = $('Image Shots').item ? $('Image Shots').item.json : null; } catch (e) { shot = null; }
  if (!shot) shot = shots[Math.min(n, shots.length - 1)] || {};
  return { json: { idx: shot.idx, key: shot.key, prompt: shot.prompt, aspect_ratio: shot.aspect_ratio, provider: 'kling', higgsfield_error: String((item.json && item.json.error && (item.json.error.message || item.json.error.description)) || 'higgsfield_submit_failed').slice(0, 200) } };
});
`;

const codeTag = `// Pairs each submission response with its shot and normalizes {provider, id, status_url}.
const shots = $('Image Shots').all().map((i) => i.json);
const out = [];
const items = $input.all();
for (let n = 0; n < items.length; n++) {
  const r = items[n].json || {};
  let shot = null;
  try { const p = items[n].pairedItem; const idx = Array.isArray(p) ? p[0].item : (p && typeof p === 'object' ? p.item : p); if (typeof idx === 'number') shot = shots[idx] || null; } catch (e) { shot = null; }
  if (!shot) shot = shots[Math.min(n, shots.length - 1)] || { key: 'shot' + n, aspect_ratio: '16:9' };
  let provider = 'higgsfield', id = null, statusUrl = null, error = null;
  if (r.request_id) { id = String(r.request_id); statusUrl = String(r.status_url || ('https://api.higgsfield.ai/requests/' + id + '/status')); }
  else if (r.data && r.data.task_id) { provider = 'kling'; id = String(r.data.task_id); statusUrl = 'https://api-singapore.klingai.com/v1/images/generations/' + id; }
  else error = String((r.error && (r.error.message || r.error.description)) || r.message || r.detail || 'submit_failed').slice(0, 200);
  out.push({ json: { key: shot.key, aspect_ratio: shot.aspect_ratio, provider, id, status_url: statusUrl, error, url: null } });
}
return out;
`;

const codeCollectSubs = `const jobs = $input.all().map((i) => i.json);
return [{ json: { jobs, submitted: jobs.filter((x) => x.id).length, failed: jobs.filter((x) => !x.id).map((x) => x.key + ':' + x.error) } }];
`;

const codePollPlan = `// Every round polls every submitted job (cheap, stateless). Round 1 runs ~60s after submission.
const s = $('Collect Submissions').first().json;
const jobs = (s.jobs || []).filter((x) => x.id);
if (!jobs.length) return [{ json: { key: 'none', provider: 'none', id: null, status_url: '', skip: true } }];
return jobs.map((x) => ({ json: x }));
`;

const codeTagPoll = `// Normalizes a poll response to {key, provider, url, done, error}.
const plan = $('Poll Jobs').all().map((i) => i.json);
const out = [];
const items = $input.all();
for (let n = 0; n < items.length; n++) {
  const r = items[n].json || {};
  let job = null;
  try { const p = items[n].pairedItem; const idx = Array.isArray(p) ? p[0].item : (p && typeof p === 'object' ? p.item : p); if (typeof idx === 'number') job = plan[idx] || null; } catch (e) { job = null; }
  if (!job) job = plan[Math.min(n, plan.length - 1)] || { key: 'shot' + n, provider: 'unknown' };
  let url = null, done = false, error = null;
  if (job.skip) { done = true; }
  else if (job.provider === 'higgsfield') {
    const st = String(r.status || '');
    if (st === 'completed') { url = (Array.isArray(r.images) && r.images[0] && r.images[0].url) || null; done = !!url; if (!url) { error = 'completed_without_image'; done = true; } }
    else if (st === 'failed' || st === 'nsfw' || st === 'canceled') { done = true; error = st; }
    else if (r.error) { done = false; error = String(r.error.message || r.error).slice(0, 120); }
  } else if (job.provider === 'kling') {
    const d = r.data || {};
    const st = String(d.task_status || '');
    if (st === 'succeed') { url = (d.task_result && Array.isArray(d.task_result.images) && d.task_result.images[0] && d.task_result.images[0].url) || null; done = true; if (!url) error = 'succeed_without_image'; }
    else if (st === 'failed') { done = true; error = String(d.task_status_msg || 'failed').slice(0, 120); }
    else if (r.error) { error = String(r.error.message || r.error).slice(0, 120); }
  }
  out.push({ json: { key: job.key, provider: job.provider, id: job.id, url, done, error } });
}
return out;
`;

const codeCollectImages = `// Aggregates one round of polling. done = every job terminal, or the poll budget is spent.
const c = $('Build Config').first().json;
const rows = $input.all().map((i) => i.json);
const polls = ($runIndex || 0) + 1;
const images = {};
const list = [];
let pending = 0;
for (const r of rows) { if (r.url) { images[r.key] = r.url; list.push({ key: r.key, url: r.url }); } else if (!r.done) pending++; }
const done = pending === 0 || polls >= c.config.max_image_polls;
return [{ json: { images, image_list: list, pending, polls, done, image_count: list.length } }];
`;

const codeCompose = `// Final Lovable message: the Website Builder's cinematic brief + the photography generated for this customer.
const c = $('Build Config').first().json;
const im = $('Collect Images').first().json || { image_list: [] };
const roles = { hero: 'HERO — full-bleed hero background with a cinematic gradient overlay and the headline over it', section: 'SECTION — full-width image opening the first major section (parallax)', detail: 'DETAIL — split section or feature card image' };
let prompt = c.build_prompt;
if (im.image_list && im.image_list.length) {
  prompt += '\\n\\nPhotography generated for this customer (use as real content, not placeholders; load by URL):\\n' + im.image_list.map((x) => '- ' + (roles[x.key] || x.key.toUpperCase()) + ': ' + x.url).join('\\n');
  prompt += '\\nIf an image fails to load, keep the layout and use a rich brand-tinted gradient with the same mood.';
} else {
  prompt += '\\n\\nNo photography could be generated in time: use rich, cinematic brand-tinted gradients and large typographic compositions in the hero and section openers (never flat black panels), with clearly labelled image slots for the customer\\'s photos.';
}
prompt += '\\n\\nBuild the complete site now with real copy for ' + (c.business_name || 'the business') + '. Do not ask questions; make sensible assumptions and label placeholders.';
const args = { initial_message: prompt };
if (c.config.lovable_workspace_id) args.workspace_id = c.config.lovable_workspace_id;
return [{ json: { lovable_args: args, lovable_prompt: prompt, image_count: im.image_list ? im.image_list.length : 0 } }];
`;

const codeParseCreate = `// Reads the MCP tool result (shape varies) and finds the Lovable project id + URLs.
const raw = $input.first().json || {};
const text = JSON.stringify(raw);
const m = text.match(/"project_?[iI]d"\\s*:\\s*"([0-9a-f-]{36})"/) || text.match(/lovable\\.dev\\/projects\\/([0-9a-f-]{36})/) || text.match(/id-preview--([0-9a-f-]{36})/);
const id = m ? m[1] : null;
const prev = text.match(/https:\\/\\/id-preview--[0-9a-f-]{36}\\.lovable\\.app/);
const edit = text.match(/https:\\/\\/lovable\\.dev\\/projects\\/[0-9a-f-]{36}/);
const err = !id ? String((raw.error && (raw.error.message || raw.error.description)) || (text.match(/"error"\\s*:\\s*"([^"]{1,200})"/) || [null, 'lovable_create_failed'])[1]).slice(0, 300) : null;
return [{ json: { project_id: id, preview_url: prev ? prev[0] : (id ? 'https://id-preview--' + id + '.lovable.app' : null), editor_url: edit ? edit[0] : (id ? 'https://lovable.dev/projects/' + id : null), create_error: err, create_raw: text.slice(0, 1500) } }];
`;

const codeAssess = `// Is the Lovable agent finished? (agentFinished true, or the poll budget is spent → report anyway; the preview URL is live.)
const c = $('Build Config').first().json;
const p = $('Parse Create Result').first().json;
const raw = $input.first().json || {};
const text = JSON.stringify(raw);
const finished = /"agentFinished"\\s*:\\s*true/.test(text) || /agentFinished['"]?\\s*[:=]\\s*true/.test(text);
const failed = /"status"\\s*:\\s*"failed"/.test(text);
const polls = ($runIndex || 0) + 1;
const gaveUp = polls >= c.config.max_build_polls;
const done = finished || failed || gaveUp;
return [{ json: { project_id: p.project_id, preview_url: p.preview_url, editor_url: p.editor_url, finished, failed, polls, gave_up: gaveUp, done, status: failed ? 'build_failed' : 'built', notes: finished ? 'Lovable agent finished after ' + polls + ' poll(s).' : (failed ? 'Lovable reported a failed build.' : 'Lovable still finishing after ' + polls + ' polls; preview URL is live and updates as it completes.') } }];
`;

const codeReportPayload = `// One shape for the Website Build Record whether the build succeeded or failed.
const c = $('Build Config').first().json;
const im = (() => { try { return $('Collect Images').first().json; } catch (e) { return { image_list: [] }; } })();
const r = $input.first().json || {};
const status = r.status === 'build_failed' || r.create_error ? 'build_failed' : 'built';
const notes = [status === 'built' ? (r.notes || 'built') : ('Build failed: ' + (r.create_error || r.notes || 'unknown')), 'photos: ' + ((im.image_list || []).length) + ' generated', c.test_mode ? 'test session' : 'real lead'].join(' · ');
return [{ json: { task_id: c.task_id, lead_id: c.lead_id, status, project_id: r.project_id || '', preview_url: r.preview_url || '', editor_url: r.editor_url || '', notes: notes.slice(0, 900), actor: 'agent:website-build-runner', source_execution_id: c.execution_id } }];
`;

// ---------------------------------------------------------------- SDK source
const inputs = [['tenant_id','string'],['task_id','string'],['lead_id','string'],['business_name','string'],['industry_category','string'],['mode','string'],['build_prompt','string'],['image_shots_json','string'],['contact_name','string'],['notify_email','string'],['test_mode','boolean'],['source_execution_id','string']];
const IF = (name, left, op, right, pos) => `ifElse({
  version: 2.3,
  config: {
    name: ${j(name)},
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'c1', leftValue: expr(${j(left)}), rightValue: ${j(right)}, operator: ${j(op)} }],
        combinator: 'and'
      }
    },
    position: ${j(pos)}
  }
})`;
const code = (name, src, pos, output) => `node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: ${j(name)}, parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: ${j(src)} }, position: ${j(pos)} },
  output: ${j(output)}
})`;

const sdk = `import { workflow, node, trigger, sticky, expr, ifElse, merge, newCredential } from '@n8n/workflow-sdk';

const whenCalled = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.2,
  config: {
    name: 'When Called by Website Builder',
    parameters: { inputSource: 'workflowInputs', workflowInputs: { values: ${j(inputs.map(([name, type]) => ({ name, type })))} } },
    position: [0, 400]
  },
  output: [{ tenant_id: 'fusiontech', task_id: 'task_web_lead_x', lead_id: 'lead_x', business_name: 'Prestige Motors', industry_category: 'automotive', mode: 'sme', build_prompt: 'Build a premium business website…', image_shots_json: '[{"key":"hero","prompt":"…","aspect_ratio":"16:9"}]', contact_name: 'Daniel', notify_email: 'owner@example.com', test_mode: true, source_execution_id: '1' }]
});

const buildConfig = ${code('Build Config', codeConfig, [220, 400], [{ task_id: 'task_web_lead_x', lead_id: 'lead_x', build_prompt: 'Build…', shots: [{ idx: 0, key: 'hero', prompt: '…', aspect_ratio: '16:9' }], config: { record_url: RECORD_URL, max_image_polls: 4, max_build_polls: 6, image_resolution: '2K' }, test_mode: true }])};
const imageShots = ${code('Image Shots', codeShots, [440, 400], [{ idx: 0, key: 'hero', prompt: '…', aspect_ratio: '16:9', resolution: '2K', provider: 'higgsfield' }])};

const hfSubmit = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Higgsfield: Submit Image',
    onError: 'continueErrorOutput',
    parameters: {
      method: 'POST',
      url: expr("{{ 'https://api.higgsfield.ai/' + $('Build Config').first().json.config.image_model_path }}"),
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify({ prompt: $json.prompt, aspect_ratio: $json.aspect_ratio, resolution: $json.resolution }) }}'),
      options: { timeout: 60000, response: { response: { responseFormat: 'json' } } }
    },
    credentials: { httpHeaderAuth: newCredential('Higgsfield API') },
    position: [660, 300]
  },
  output: [{ status: 'queued', request_id: 'd7e6c0f3-6699-4f6c-bb45-2ad7fd9158ff', status_url: 'https://api.higgsfield.ai/requests/x/status' }]
});

const klingPrep = ${code('Kling Fallback Shots', codeKlingPrep, [880, 520], [{ idx: 0, key: 'hero', prompt: '…', aspect_ratio: '16:9', provider: 'kling' }])};

const klingSubmit = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Kling: Submit Image',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: 'https://api-singapore.klingai.com/v1/images/generations',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr("{{ JSON.stringify({ model_name: $('Build Config').first().json.config.kling_model, prompt: $json.prompt, aspect_ratio: $json.aspect_ratio, resolution: '2k', n: 1 }) }}"),
      options: { timeout: 60000, response: { response: { responseFormat: 'json' } } }
    },
    credentials: { httpHeaderAuth: newCredential('Kling API') },
    position: [1100, 520]
  },
  output: [{ code: 0, data: { task_id: '123', task_status: 'submitted' } }]
});

const allSubmissions = merge({
  version: 3.2,
  config: { name: 'All Submissions', parameters: { mode: 'append' }, position: [1320, 400] }
});

const tagSubmission = ${code('Tag Submissions', codeTag, [1540, 400], [{ key: 'hero', provider: 'higgsfield', id: 'x', status_url: 'https://api.higgsfield.ai/requests/x/status', error: null, url: null }])};
const collectSubs = ${code('Collect Submissions', codeCollectSubs, [1760, 400], [{ jobs: [{ key: 'hero', provider: 'higgsfield', id: 'x', status_url: 'https://…' }], submitted: 1, failed: [] }])};

const waitImages = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: { name: 'Wait for Images', parameters: { resume: 'timeInterval', amount: 60, unit: 'seconds' }, position: [1980, 400] },
  output: [{ jobs: [] }]
});

const pollJobs = ${code('Poll Jobs', codePollPlan, [2200, 400], [{ key: 'hero', provider: 'higgsfield', id: 'x', status_url: 'https://api.higgsfield.ai/requests/x/status' }])};

const isHiggsfield = ${IF('Higgsfield Job?', '{{ $json.provider }}', { type: 'string', operation: 'equals' }, 'higgsfield', [2420, 400])};

const hfPoll = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Higgsfield: Poll',
    onError: 'continueRegularOutput',
    parameters: { method: 'GET', url: expr('{{ $json.status_url }}'), authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth', options: { timeout: 30000, response: { response: { responseFormat: 'json' } } } },
    credentials: { httpHeaderAuth: newCredential('Higgsfield API') },
    position: [2640, 300]
  },
  output: [{ status: 'completed', request_id: 'x', images: [{ url: 'https://cdn.example.com/hero.jpg' }] }]
});

const klingPoll = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Kling: Poll',
    onError: 'continueRegularOutput',
    parameters: { method: 'GET', url: expr('{{ $json.status_url }}'), authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth', options: { timeout: 30000, response: { response: { responseFormat: 'json' } } } },
    credentials: { httpHeaderAuth: newCredential('Kling API') },
    position: [2640, 520]
  },
  output: [{ code: 0, data: { task_id: '123', task_status: 'succeed', task_result: { images: [{ index: 0, url: 'https://…/img.png' }] } } }]
});

const pollResults = merge({
  version: 3.2,
  config: { name: 'Poll Results', parameters: { mode: 'append' }, position: [2860, 400] }
});

const tagPoll = ${code('Tag Poll Results', codeTagPoll, [3080, 400], [{ key: 'hero', provider: 'higgsfield', id: 'x', url: 'https://cdn.example.com/hero.jpg', done: true, error: null }])};
const collectImages = ${code('Collect Images', codeCollectImages, [3300, 400], [{ images: { hero: 'https://cdn.example.com/hero.jpg' }, image_list: [{ key: 'hero', url: 'https://cdn.example.com/hero.jpg' }], pending: 0, polls: 1, done: true, image_count: 1 }])};

const imagesReady = ${IF('Images Ready?', '{{ $json.done }}', { type: 'boolean', operation: 'true', singleValue: true }, true, [3520, 400])};

const composeLovable = ${code('Compose Lovable Prompt', codeCompose, [3740, 300], [{ lovable_args: { initial_message: 'Build…' }, lovable_prompt: 'Build…', image_count: 1 }])};

const lovableCreate = node({
  type: '@n8n/n8n-nodes-langchain.mcpClient',
  version: 1.1,
  config: {
    name: 'Lovable: Create Project',
    onError: 'continueErrorOutput',
    parameters: {
      serverTransport: 'httpStreamable',
      endpointUrl: ${j(LOVABLE.mcp_endpoint || 'https://mcp.lovable.dev')},
      authentication: 'mcpOAuth2Api',
      tool: { __rl: true, mode: 'id', value: 'create_project' },
      inputMode: 'json',
      jsonInput: expr('{{ JSON.stringify($json.lovable_args) }}'),
      options: { timeout: 120000 }
    },
    credentials: { mcpOAuth2Api: newCredential('Lovable MCP (OAuth2)') },
    position: [3960, 300]
  },
  output: [{ result: { content: [{ type: 'text', text: '{"projectId":"e650eee1-4666-475f-95dc-0686284264fc","preview_url":"https://id-preview--e650eee1-4666-475f-95dc-0686284264fc.lovable.app"}' }] } }]
});

const parseCreate = ${code('Parse Create Result', codeParseCreate, [4180, 300], [{ project_id: 'e650eee1-4666-475f-95dc-0686284264fc', preview_url: 'https://id-preview--e650eee1-4666-475f-95dc-0686284264fc.lovable.app', editor_url: 'https://lovable.dev/projects/e650eee1-4666-475f-95dc-0686284264fc', create_error: null }])};

const createOk = ${IF('Project Created?', '{{ $json.project_id }}', { type: 'string', operation: 'notEmpty', singleValue: true }, '', [4400, 300])};

const waitLovable = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: { name: 'Wait for Lovable', parameters: { resume: 'timeInterval', amount: 3, unit: 'minutes' }, position: [4620, 200] },
  output: [{ project_id: 'x' }]
});

const lovableGet = node({
  type: '@n8n/n8n-nodes-langchain.mcpClient',
  version: 1.1,
  config: {
    name: 'Lovable: Get Project',
    onError: 'continueRegularOutput',
    parameters: {
      serverTransport: 'httpStreamable',
      endpointUrl: ${j(LOVABLE.mcp_endpoint || 'https://mcp.lovable.dev')},
      authentication: 'mcpOAuth2Api',
      tool: { __rl: true, mode: 'id', value: 'get_project' },
      inputMode: 'json',
      jsonInput: expr("{{ JSON.stringify({ project_id: $('Parse Create Result').first().json.project_id }) }}"),
      options: { timeout: 60000 }
    },
    credentials: { mcpOAuth2Api: newCredential('Lovable MCP (OAuth2)') },
    position: [4840, 200]
  },
  output: [{ result: { content: [{ type: 'text', text: '{"status":"completed","project":{"agentFinished":true}}' }] } }]
});

const assess = ${code('Assess Build', codeAssess, [5060, 200], [{ project_id: 'x', preview_url: 'https://id-preview--x.lovable.app', editor_url: 'https://lovable.dev/projects/x', finished: true, failed: false, polls: 1, gave_up: false, done: true, status: 'built', notes: 'Lovable agent finished after 1 poll(s).' }])};

const buildDone = ${IF('Build Done?', '{{ $json.done }}', { type: 'boolean', operation: 'true', singleValue: true }, true, [5280, 200])};

const reportPayload = ${code('Report Payload', codeReportPayload, [5500, 400], [{ task_id: 'task_web_lead_x', lead_id: 'lead_x', status: 'built', project_id: 'x', preview_url: 'https://id-preview--x.lovable.app', editor_url: 'https://lovable.dev/projects/x', notes: 'built', actor: 'agent:website-build-runner' }])};

const report = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Report to Website Build Record',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: ${j(RECORD_URL)},
      authentication: 'none',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json) }}'),
      options: { timeout: 60000, response: { response: { responseFormat: 'json', neverError: true } } }
    },
    position: [5720, 400]
  },
  output: [{ ok: true, task_id: 'task_web_lead_x', status: 'built' }]
});

const note = sticky(${j('## CEO Brain — Website Build Runner\nCalled by the Website Builder once John has the customer\'s details (Ryan, 2026-09-25: mock-ups build automatically, nobody approves).\n\n1. Photography: 3 cinematic shots via the Higgsfield API (Kling API as fallback), polled until ready.\n2. Build: Lovable MCP (OAuth credential authorized once in n8n) create_project with the cinematic brief + the photos; polled until the agent finishes.\n3. Report: POST /webhook/ceo-brain/website-built → task built → John / Outbound Sender send the preview link; owner copy.\n\nCredentials (n8n only): Higgsfield API (header Authorization: Key <id>:<secret>), Kling API (Authorization: Bearer <key>), Lovable MCP (OAuth2).\nSource of truth: repo ryan/ceo-brain/workflows/website-build-runner/build.js — do not hand-edit Code nodes.')}, [whenCalled, buildConfig, imageShots], { color: 4 });

export default workflow('ceo-brain-website-build-runner', 'CEO Brain — Website Build Runner')
  .add(whenCalled)
  .to(buildConfig)
  .to(imageShots)
  .to(hfSubmit.to(allSubmissions.input(0)))
  .add(hfSubmit.onError(klingPrep.to(klingSubmit.to(allSubmissions.input(1)))))
  .add(allSubmissions)
  .to(tagSubmission)
  .to(collectSubs)
  .to(waitImages)
  .to(pollJobs)
  .to(isHiggsfield
    .onTrue(hfPoll.to(pollResults.input(0)))
    .onFalse(klingPoll.to(pollResults.input(1))))
  .add(pollResults)
  .to(tagPoll)
  .to(collectImages)
  .to(imagesReady
    .onTrue(composeLovable.to(lovableCreate.to(parseCreate.to(createOk
      .onTrue(waitLovable.to(lovableGet.to(assess.to(buildDone
        .onTrue(reportPayload.to(report))
        .onFalse(waitLovable)))))
      .onFalse(reportPayload)))))
    .onFalse(waitImages))
  .add(lovableCreate.onError(parseCreate))
  .add(note);
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'website-build-runner.sdk.ts'), sdk);
const codes = { 'build-config.js': codeConfig, 'image-shots.js': codeShots, 'kling-fallback-shots.js': codeKlingPrep, 'tag-submissions.js': codeTag, 'collect-submissions.js': codeCollectSubs, 'poll-jobs.js': codePollPlan, 'tag-poll-results.js': codeTagPoll, 'collect-images.js': codeCollectImages, 'compose-lovable-prompt.js': codeCompose, 'parse-create-result.js': codeParseCreate, 'assess-build.js': codeAssess, 'report-payload.js': codeReportPayload };
for (const [f, c] of Object.entries(codes)) fs.writeFileSync(path.join(DIST, 'code-nodes', f), c);
fs.writeFileSync(path.join(DIST, 'expected-params.json'), JSON.stringify({ record_url: RECORD_URL, lovable: LOVABLE, credentials: ['Higgsfield API (httpHeaderAuth)', 'Kling API (httpHeaderAuth)', 'Lovable MCP (OAuth2)'], workflow_id: TABLES_JSON.workflows.website_build_runner || null }, null, 2));
console.log('built', path.join(DIST, 'website-build-runner.sdk.ts'), sdk.length, 'chars');
