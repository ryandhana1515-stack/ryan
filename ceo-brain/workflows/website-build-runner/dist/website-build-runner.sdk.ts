import { workflow, node, trigger, sticky, expr, ifElse, merge, newCredential } from '@n8n/workflow-sdk';

const whenCalled = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.2,
  config: {
    name: 'When Called by Website Builder',
    parameters: { inputSource: 'workflowInputs', workflowInputs: { values: [{"name":"tenant_id","type":"string"},{"name":"task_id","type":"string"},{"name":"lead_id","type":"string"},{"name":"business_name","type":"string"},{"name":"industry_category","type":"string"},{"name":"mode","type":"string"},{"name":"build_prompt","type":"string"},{"name":"image_shots_json","type":"string"},{"name":"contact_name","type":"string"},{"name":"notify_email","type":"string"},{"name":"test_mode","type":"boolean"},{"name":"source_execution_id","type":"string"}] } },
    position: [0, 400]
  },
  output: [{ tenant_id: 'fusiontech', task_id: 'task_web_lead_x', lead_id: 'lead_x', business_name: 'Prestige Motors', industry_category: 'automotive', mode: 'sme', build_prompt: 'Build a premium business website…', image_shots_json: '[{"key":"hero","prompt":"…","aspect_ratio":"16:9"}]', contact_name: 'Daniel', notify_email: 'owner@example.com', test_mode: true, source_execution_id: '1' }]
});

const buildConfig = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Build Config", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Normalizes the Website Builder's hand-off and fixes the run configuration. No secrets here.\nconst inp = $input.first().json || {};\nconst str = (v) => (v === undefined || v === null ? '' : String(v));\nlet shots = [];\ntry { shots = JSON.parse(inp.image_shots_json || '[]'); } catch (e) { shots = []; }\nif (!Array.isArray(shots)) shots = [];\nshots = shots.slice(0, 3).map((s, i) => ({ idx: i, key: str(s && s.key) || ('shot' + i), prompt: str(s && s.prompt).slice(0, 1500), aspect_ratio: str(s && s.aspect_ratio) || '16:9' })).filter((s) => s.prompt);\nif (!shots.length) shots = [{ idx: 0, key: 'hero', prompt: 'Cinematic wide establishing photograph for a premium ' + (str(inp.industry_category) || 'business') + ' website in Singapore, dusk light, rich colour, photorealistic, no text, no logos', aspect_ratio: '16:9' }];\nreturn [{ json: {\n  task_id: str(inp.task_id), lead_id: str(inp.lead_id), tenant_id: str(inp.tenant_id) || 'fusiontech',\n  business_name: str(inp.business_name), industry_category: str(inp.industry_category) || 'other', mode: str(inp.mode) || 'sme',\n  build_prompt: str(inp.build_prompt), contact_name: str(inp.contact_name), notify_email: str(inp.notify_email),\n  test_mode: inp.test_mode === true || inp.test_mode === 'true', source_execution_id: str(inp.source_execution_id),\n  shots,\n  config: { record_url: \"https://ryan1515.app.n8n.cloud/webhook/ceo-brain/website-built\", lovable_workspace_id: \"zjVuSnHzhPWFroVpa2KX\", image_model_path: 'bytedance/seedream/v4/text-to-image', image_resolution: '2K', kling_model: 'kling-v3', max_image_polls: 4, max_build_polls: 6 },\n  started_at: new Date().toISOString(), execution_id: String($execution.id), workflow_id: String($workflow.id)\n} }];\n" }, position: [220,400] },
  output: [{"task_id":"task_web_lead_x","lead_id":"lead_x","build_prompt":"Build…","shots":[{"idx":0,"key":"hero","prompt":"…","aspect_ratio":"16:9"}],"config":{"record_url":"https://ryan1515.app.n8n.cloud/webhook/ceo-brain/website-built","max_image_polls":4,"max_build_polls":6,"image_resolution":"2K"},"test_mode":true}]
});
const imageShots = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Image Shots", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// One item per photograph to generate (Higgsfield first; failures fall over to Kling).\nconst c = $('Build Config').first().json;\nreturn c.shots.map((s) => ({ json: { idx: s.idx, key: s.key, prompt: s.prompt, aspect_ratio: s.aspect_ratio, resolution: c.config.image_resolution, provider: 'higgsfield' } }));\n" }, position: [440,400] },
  output: [{"idx":0,"key":"hero","prompt":"…","aspect_ratio":"16:9","resolution":"2K","provider":"higgsfield"}]
});

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

const klingPrep = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Kling Fallback Shots", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Shots Higgsfield refused (no credential, 4xx/5xx) are retried on Kling.\nconst shots = $('Image Shots').all().map((i) => i.json);\nreturn $input.all().map((item, n) => {\n  let shot = null;\n  try { shot = $('Image Shots').item ? $('Image Shots').item.json : null; } catch (e) { shot = null; }\n  if (!shot) shot = shots[Math.min(n, shots.length - 1)] || {};\n  return { json: { idx: shot.idx, key: shot.key, prompt: shot.prompt, aspect_ratio: shot.aspect_ratio, provider: 'kling', higgsfield_error: String((item.json && item.json.error && (item.json.error.message || item.json.error.description)) || 'higgsfield_submit_failed').slice(0, 200) } };\n});\n" }, position: [880,520] },
  output: [{"idx":0,"key":"hero","prompt":"…","aspect_ratio":"16:9","provider":"kling"}]
});

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

const tagSubmission = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Tag Submissions", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Pairs each submission response with its shot and normalizes {provider, id, status_url}.\nconst shots = $('Image Shots').all().map((i) => i.json);\nconst out = [];\nconst items = $input.all();\nfor (let n = 0; n < items.length; n++) {\n  const r = items[n].json || {};\n  let shot = null;\n  try { const p = items[n].pairedItem; const idx = Array.isArray(p) ? p[0].item : (p && typeof p === 'object' ? p.item : p); if (typeof idx === 'number') shot = shots[idx] || null; } catch (e) { shot = null; }\n  if (!shot) shot = shots[Math.min(n, shots.length - 1)] || { key: 'shot' + n, aspect_ratio: '16:9' };\n  let provider = 'higgsfield', id = null, statusUrl = null, error = null;\n  if (r.request_id) { id = String(r.request_id); statusUrl = String(r.status_url || ('https://api.higgsfield.ai/requests/' + id + '/status')); }\n  else if (r.data && r.data.task_id) { provider = 'kling'; id = String(r.data.task_id); statusUrl = 'https://api-singapore.klingai.com/v1/images/generations/' + id; }\n  else error = String((r.error && (r.error.message || r.error.description)) || r.message || r.detail || 'submit_failed').slice(0, 200);\n  out.push({ json: { key: shot.key, aspect_ratio: shot.aspect_ratio, provider, id, status_url: statusUrl, error, url: null } });\n}\nreturn out;\n" }, position: [1540,400] },
  output: [{"key":"hero","provider":"higgsfield","id":"x","status_url":"https://api.higgsfield.ai/requests/x/status","error":null,"url":null}]
});
const collectSubs = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Collect Submissions", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "const jobs = $input.all().map((i) => i.json);\nreturn [{ json: { jobs, submitted: jobs.filter((x) => x.id).length, failed: jobs.filter((x) => !x.id).map((x) => x.key + ':' + x.error) } }];\n" }, position: [1760,400] },
  output: [{"jobs":[{"key":"hero","provider":"higgsfield","id":"x","status_url":"https://…"}],"submitted":1,"failed":[]}]
});

const waitImages = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: { name: 'Wait for Images', parameters: { resume: 'timeInterval', amount: 60, unit: 'seconds' }, position: [1980, 400] },
  output: [{ jobs: [] }]
});

const pollJobs = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Poll Jobs", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Every round polls every submitted job (cheap, stateless). Round 1 runs ~60s after submission.\nconst s = $('Collect Submissions').first().json;\nconst jobs = (s.jobs || []).filter((x) => x.id);\nif (!jobs.length) return [{ json: { key: 'none', provider: 'none', id: null, status_url: '', skip: true } }];\nreturn jobs.map((x) => ({ json: x }));\n" }, position: [2200,400] },
  output: [{"key":"hero","provider":"higgsfield","id":"x","status_url":"https://api.higgsfield.ai/requests/x/status"}]
});

const isHiggsfield = ifElse({
  version: 2.3,
  config: {
    name: "Higgsfield Job?",
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'c1', leftValue: expr("{{ $json.provider }}"), rightValue: "higgsfield", operator: {"type":"string","operation":"equals"} }],
        combinator: 'and'
      }
    },
    position: [2420,400]
  }
});

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

const tagPoll = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Tag Poll Results", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Normalizes a poll response to {key, provider, url, done, error}.\nconst plan = $('Poll Jobs').all().map((i) => i.json);\nconst out = [];\nconst items = $input.all();\nfor (let n = 0; n < items.length; n++) {\n  const r = items[n].json || {};\n  let job = null;\n  try { const p = items[n].pairedItem; const idx = Array.isArray(p) ? p[0].item : (p && typeof p === 'object' ? p.item : p); if (typeof idx === 'number') job = plan[idx] || null; } catch (e) { job = null; }\n  if (!job) job = plan[Math.min(n, plan.length - 1)] || { key: 'shot' + n, provider: 'unknown' };\n  let url = null, done = false, error = null;\n  if (job.skip) { done = true; }\n  else if (job.provider === 'higgsfield') {\n    const st = String(r.status || '');\n    if (st === 'completed') { url = (Array.isArray(r.images) && r.images[0] && r.images[0].url) || null; done = !!url; if (!url) { error = 'completed_without_image'; done = true; } }\n    else if (st === 'failed' || st === 'nsfw' || st === 'canceled') { done = true; error = st; }\n    else if (r.error) { done = false; error = String(r.error.message || r.error).slice(0, 120); }\n  } else if (job.provider === 'kling') {\n    const d = r.data || {};\n    const st = String(d.task_status || '');\n    if (st === 'succeed') { url = (d.task_result && Array.isArray(d.task_result.images) && d.task_result.images[0] && d.task_result.images[0].url) || null; done = true; if (!url) error = 'succeed_without_image'; }\n    else if (st === 'failed') { done = true; error = String(d.task_status_msg || 'failed').slice(0, 120); }\n    else if (r.error) { error = String(r.error.message || r.error).slice(0, 120); }\n  }\n  out.push({ json: { key: job.key, provider: job.provider, id: job.id, url, done, error } });\n}\nreturn out;\n" }, position: [3080,400] },
  output: [{"key":"hero","provider":"higgsfield","id":"x","url":"https://cdn.example.com/hero.jpg","done":true,"error":null}]
});
const collectImages = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Collect Images", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Aggregates one round of polling. done = every job terminal, or the poll budget is spent.\nconst c = $('Build Config').first().json;\nconst rows = $input.all().map((i) => i.json);\nconst polls = ($runIndex || 0) + 1;\nconst images = {};\nconst list = [];\nlet pending = 0;\nfor (const r of rows) { if (r.url) { images[r.key] = r.url; list.push({ key: r.key, url: r.url }); } else if (!r.done) pending++; }\nconst done = pending === 0 || polls >= c.config.max_image_polls;\nreturn [{ json: { images, image_list: list, pending, polls, done, image_count: list.length } }];\n" }, position: [3300,400] },
  output: [{"images":{"hero":"https://cdn.example.com/hero.jpg"},"image_list":[{"key":"hero","url":"https://cdn.example.com/hero.jpg"}],"pending":0,"polls":1,"done":true,"image_count":1}]
});

const imagesReady = ifElse({
  version: 2.3,
  config: {
    name: "Images Ready?",
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'c1', leftValue: expr("{{ $json.done }}"), rightValue: true, operator: {"type":"boolean","operation":"true","singleValue":true} }],
        combinator: 'and'
      }
    },
    position: [3520,400]
  }
});

const composeLovable = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Compose Lovable Prompt", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Final Lovable message: the Website Builder's cinematic brief + the photography generated for this customer.\nconst c = $('Build Config').first().json;\nconst im = $('Collect Images').first().json || { image_list: [] };\nconst roles = { hero: 'HERO — full-bleed hero background with a cinematic gradient overlay and the headline over it', section: 'SECTION — full-width image opening the first major section (parallax)', detail: 'DETAIL — split section or feature card image' };\nlet prompt = c.build_prompt;\nif (im.image_list && im.image_list.length) {\n  prompt += '\\n\\nPhotography generated for this customer (use as real content, not placeholders; load by URL):\\n' + im.image_list.map((x) => '- ' + (roles[x.key] || x.key.toUpperCase()) + ': ' + x.url).join('\\n');\n  prompt += '\\nIf an image fails to load, keep the layout and use a rich brand-tinted gradient with the same mood.';\n} else {\n  prompt += '\\n\\nNo photography could be generated in time: use rich, cinematic brand-tinted gradients and large typographic compositions in the hero and section openers (never flat black panels), with clearly labelled image slots for the customer\\'s photos.';\n}\nprompt += '\\n\\nBuild the complete site now with real copy for ' + (c.business_name || 'the business') + '. Do not ask questions; make sensible assumptions and label placeholders.';\nconst args = { initial_message: prompt };\nif (c.config.lovable_workspace_id) args.workspace_id = c.config.lovable_workspace_id;\nreturn [{ json: { lovable_args: args, lovable_prompt: prompt, image_count: im.image_list ? im.image_list.length : 0 } }];\n" }, position: [3740,300] },
  output: [{"lovable_args":{"initial_message":"Build…"},"lovable_prompt":"Build…","image_count":1}]
});

const lovableCreate = node({
  type: '@n8n/n8n-nodes-langchain.mcpClient',
  version: 1.1,
  config: {
    name: 'Lovable: Create Project',
    onError: 'continueErrorOutput',
    parameters: {
      serverTransport: 'httpStreamable',
      endpointUrl: "https://mcp.lovable.dev",
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

const parseCreate = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Parse Create Result", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Reads the MCP tool result (shape varies) and finds the Lovable project id + URLs.\nconst raw = $input.first().json || {};\nconst text = JSON.stringify(raw);\nconst m = text.match(/\"project_?[iI]d\"\\s*:\\s*\"([0-9a-f-]{36})\"/) || text.match(/lovable\\.dev\\/projects\\/([0-9a-f-]{36})/) || text.match(/id-preview--([0-9a-f-]{36})/);\nconst id = m ? m[1] : null;\nconst prev = text.match(/https:\\/\\/id-preview--[0-9a-f-]{36}\\.lovable\\.app/);\nconst edit = text.match(/https:\\/\\/lovable\\.dev\\/projects\\/[0-9a-f-]{36}/);\nconst err = !id ? String((raw.error && (raw.error.message || raw.error.description)) || (text.match(/\"error\"\\s*:\\s*\"([^\"]{1,200})\"/) || [null, 'lovable_create_failed'])[1]).slice(0, 300) : null;\nreturn [{ json: { project_id: id, preview_url: prev ? prev[0] : (id ? 'https://id-preview--' + id + '.lovable.app' : null), editor_url: edit ? edit[0] : (id ? 'https://lovable.dev/projects/' + id : null), create_error: err, create_raw: text.slice(0, 1500) } }];\n" }, position: [4180,300] },
  output: [{"project_id":"e650eee1-4666-475f-95dc-0686284264fc","preview_url":"https://id-preview--e650eee1-4666-475f-95dc-0686284264fc.lovable.app","editor_url":"https://lovable.dev/projects/e650eee1-4666-475f-95dc-0686284264fc","create_error":null}]
});

const createOk = ifElse({
  version: 2.3,
  config: {
    name: "Project Created?",
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'c1', leftValue: expr("{{ $json.project_id }}"), rightValue: "", operator: {"type":"string","operation":"notEmpty","singleValue":true} }],
        combinator: 'and'
      }
    },
    position: [4400,300]
  }
});

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
      endpointUrl: "https://mcp.lovable.dev",
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

const assess = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Assess Build", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Is the Lovable agent finished? (agentFinished true, or the poll budget is spent → report anyway; the preview URL is live.)\nconst c = $('Build Config').first().json;\nconst p = $('Parse Create Result').first().json;\nconst raw = $input.first().json || {};\nconst text = JSON.stringify(raw);\nconst finished = /\"agentFinished\"\\s*:\\s*true/.test(text) || /agentFinished['\"]?\\s*[:=]\\s*true/.test(text);\nconst failed = /\"status\"\\s*:\\s*\"failed\"/.test(text);\nconst polls = ($runIndex || 0) + 1;\nconst gaveUp = polls >= c.config.max_build_polls;\nconst done = finished || failed || gaveUp;\nreturn [{ json: { project_id: p.project_id, preview_url: p.preview_url, editor_url: p.editor_url, finished, failed, polls, gave_up: gaveUp, done, status: failed ? 'build_failed' : 'built', notes: finished ? 'Lovable agent finished after ' + polls + ' poll(s).' : (failed ? 'Lovable reported a failed build.' : 'Lovable still finishing after ' + polls + ' polls; preview URL is live and updates as it completes.') } }];\n" }, position: [5060,200] },
  output: [{"project_id":"x","preview_url":"https://id-preview--x.lovable.app","editor_url":"https://lovable.dev/projects/x","finished":true,"failed":false,"polls":1,"gave_up":false,"done":true,"status":"built","notes":"Lovable agent finished after 1 poll(s)."}]
});

const buildDone = ifElse({
  version: 2.3,
  config: {
    name: "Build Done?",
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'c1', leftValue: expr("{{ $json.done }}"), rightValue: true, operator: {"type":"boolean","operation":"true","singleValue":true} }],
        combinator: 'and'
      }
    },
    position: [5280,200]
  }
});

const reportPayload = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: "Report Payload", parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// One shape for the Website Build Record whether the build succeeded or failed.\nconst c = $('Build Config').first().json;\nconst im = (() => { try { return $('Collect Images').first().json; } catch (e) { return { image_list: [] }; } })();\nconst r = $input.first().json || {};\nconst status = r.status === 'build_failed' || r.create_error ? 'build_failed' : 'built';\nconst notes = [status === 'built' ? (r.notes || 'built') : ('Build failed: ' + (r.create_error || r.notes || 'unknown')), 'photos: ' + ((im.image_list || []).length) + ' generated', c.test_mode ? 'test session' : 'real lead'].join(' · ');\nreturn [{ json: { task_id: c.task_id, lead_id: c.lead_id, status, project_id: r.project_id || '', preview_url: r.preview_url || '', editor_url: r.editor_url || '', notes: notes.slice(0, 900), actor: 'agent:website-build-runner', source_execution_id: c.execution_id } }];\n" }, position: [5500,400] },
  output: [{"task_id":"task_web_lead_x","lead_id":"lead_x","status":"built","project_id":"x","preview_url":"https://id-preview--x.lovable.app","editor_url":"https://lovable.dev/projects/x","notes":"built","actor":"agent:website-build-runner"}]
});

const report = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Report to Website Build Record',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: "https://ryan1515.app.n8n.cloud/webhook/ceo-brain/website-built",
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

const note = sticky("## CEO Brain — Website Build Runner\nCalled by the Website Builder once John has the customer's details (Ryan, 2026-09-25: mock-ups build automatically, nobody approves).\n\n1. Photography: 3 cinematic shots via the Higgsfield API (Kling API as fallback), polled until ready.\n2. Build: Lovable MCP (OAuth credential authorized once in n8n) create_project with the cinematic brief + the photos; polled until the agent finishes.\n3. Report: POST /webhook/ceo-brain/website-built → task built → John / Outbound Sender send the preview link; owner copy.\n\nCredentials (n8n only): Higgsfield API (header Authorization: Key <id>:<secret>), Kling API (Authorization: Bearer <key>), Lovable MCP (OAuth2).\nSource of truth: repo ryan/ceo-brain/workflows/website-build-runner/build.js — do not hand-edit Code nodes.", [whenCalled, buildConfig, imageShots], { color: 4 });

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
