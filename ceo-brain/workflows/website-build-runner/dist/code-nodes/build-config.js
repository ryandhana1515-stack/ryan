// Normalizes the Website Builder's hand-off and fixes the run configuration. No secrets here.
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
  config: { record_url: "https://ryan1515.app.n8n.cloud/webhook/ceo-brain/website-built", lovable_workspace_id: "zjVuSnHzhPWFroVpa2KX", image_model_path: 'bytedance/seedream/v4/text-to-image', image_resolution: '2K', kling_model: 'kling-v3', max_image_polls: 4, max_build_polls: 6 },
  started_at: new Date().toISOString(), execution_id: String($execution.id), workflow_id: String($workflow.id)
} }];
