// Turns the Lead Intake hand-off into the Website Builder's user prompt. Facts only; nothing is invented here.
const USER_PROMPT_TEMPLATE = "Prepare the website build brief for this prospect.\n\nTenant: {{tenant_id}}\nLead id: {{lead_id}}\nNow (UTC): {{now}}\n\nContact details as given:\n- Name: {{contact_name}}\n- Company: {{company_name}}\n- Industry: {{industry}}\n- Email: {{email}}\n- Phone: {{phone}}\n\nSales consultant's summary of the lead:\n{{sales_summary}}\n\nFacts the sales consultant extracted (JSON, null = unknown):\n{{extracted_json}}\n\nConversation with the customer (oldest first; the last customer message is the current one):\n{{conversation}}\n\nCurrent customer message:\n\"\"\"\n{{message}}\n\"\"\"\n\nReturn the JSON object now.\n";
const inp = $input.first().json || {};
const str = (v) => (v === undefined || v === null || v === '' ? null : String(v));
let conversation = [];
try { conversation = JSON.parse(inp.conversation_json || '[]'); } catch (e) { conversation = []; }
if (!Array.isArray(conversation)) conversation = [];
let extracted = {};
try { extracted = JSON.parse(inp.extracted_json || '{}'); } catch (e) { extracted = {}; }
if (!extracted || typeof extracted !== 'object') extracted = {};
const testMode = inp.test_mode === true || inp.test_mode === 'true';
const now = new Date().toISOString();
const input = {
  tenant_id: str(inp.tenant_id) || 'fusiontech',
  lead_id: str(inp.lead_id) || ('lead_unknown_' + Date.now().toString(36)),
  contact_name: str(inp.contact_name), company_name: str(inp.company_name), industry: str(inp.industry) || str(extracted.industry),
  email: str(inp.email), phone: str(inp.phone), channel: str(inp.channel) || 'unknown',
  message: str(inp.message) || '', conversation, sales_summary: str(inp.sales_summary) || '', extracted,
  test_mode: testMode, notify_email: str(inp.notify_email) || "ryandhana1515@gmail.com", source_execution_id: str(inp.source_execution_id)
};
const convoText = conversation.map((m) => '- [' + (m.role || 'customer') + (m.ts ? ' ' + m.ts : '') + '] ' + m.content).join('\n') || '(none)';
const vars = {
  tenant_id: input.tenant_id, lead_id: input.lead_id, now, contact_name: input.contact_name || 'not given', company_name: input.company_name || 'not given',
  industry: input.industry || 'not given', email: input.email || 'not given', phone: input.phone || 'not given',
  sales_summary: input.sales_summary || '(none)', extracted_json: JSON.stringify(extracted), conversation: convoText, message: input.message || '(no message)'
};
const user_prompt = USER_PROMPT_TEMPLATE.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
return [{ json: { input, user_prompt, started_at: now, config: { model: "claude-sonnet-4-6", agent: "website-builder", agent_version: "2.0.2" }, execution_id: String($execution.id), workflow_id: String($workflow.id) } }];
