// Merge the incoming lead with whatever we already know about it and build the prompt.
const USER_PROMPT_TEMPLATE = "Qualify this inbound lead.\n\nTenant: {{tenant_id}}\nLead id: {{lead_id}}\nPrevious status: {{previous_status}}\nReceived via: {{lead_source}} (reply channel: {{channel}})\nNow (UTC): {{now}}\n\nContact details as given:\n- Name: {{contact_name}}\n- Phone: {{phone}}\n- Email: {{email}}\n- Company: {{company_name}}\n- Industry: {{industry}}\n\nOriginal message:\n\"\"\"\n{{message}}\n\"\"\"\n\nConversation history (oldest first, may be empty):\n{{conversation_history}}\n\nReturn the JSON object now.\n";
const norm = $('Validate & Normalize Lead').first().json;
const existing = ($input.first() && $input.first().json) || {};
const isNew = !(existing && existing.lead_key);
const lead = norm.lead;
if (!isNew) {
  if (existing.lead_id) lead.lead_id = existing.lead_id;
  const keep = ['contact_name', 'email', 'phone', 'company_name', 'industry'];
  for (const k of keep) if (!lead[k] && existing[k]) lead[k] = existing[k];
}
const previousStatus = isNew ? 'NEW' : (existing.status || 'NEW');
const now = new Date().toISOString();
const history = (lead.conversation_history || []).map((m) => '- [' + m.role + (m.ts ? ' ' + m.ts : '') + '] ' + m.content).join('\n') || '(none)';
const vars = {
  tenant_id: lead.tenant_id, lead_id: lead.lead_id, previous_status: previousStatus, lead_source: lead.lead_source,
  channel: lead.channel, now: now, contact_name: lead.contact_name || 'not given', phone: lead.phone || 'not given',
  email: lead.email || 'not given', company_name: lead.company_name || 'not given', industry: lead.industry || 'not given',
  message: lead.message || '(no message)', conversation_history: history
};
const userPrompt = USER_PROMPT_TEMPLATE.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
return [{ json: { lead, is_new: isNew, previous_status: previousStatus, existing_row_id: existing.id || null, now, user_prompt: userPrompt, config: norm.config, execution_id: norm.execution_id, workflow_id: norm.workflow_id } }];
