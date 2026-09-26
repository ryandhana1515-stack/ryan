import { workflow, node, trigger, sticky, ifElse, expr } from '@n8n/workflow-sdk';

const leadWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Lead Webhook',
    parameters: { httpMethod: 'POST', path: 'ceo-brain/lead', responseMode: 'responseNode', options: {} },
    position: [0, 300]
  },
  output: [{ body: { name: 'John Tan', company: 'ABC Property Pte Ltd', source: 'facebook', message: 'Hi, I run a property agency with 25 agents.', test_mode: true } }]
});

const workflowConfig = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Workflow Config',
    parameters: {
      mode: 'manual',
      includeOtherFields: true,
      assignments: { assignments: [
        { id: 'cfg-model', name: 'model', value: "claude-sonnet-4-6", type: 'string' },
        { id: 'cfg-notify', name: 'notify_email', value: "ryandhana1515@gmail.com", type: 'string' },
        { id: 'cfg-tenant', name: 'default_tenant', value: "fusiontech", type: 'string' },
        { id: 'cfg-aimode', name: 'default_ai_mode', value: 'live', type: 'string' },
        { id: 'cfg-autosend', name: 'auto_send_low_risk', value: "true", type: 'string' },
        { id: 'cfg-agent', name: 'agent', value: "sales-qualification", type: 'string' },
        { id: 'cfg-agentv', name: 'agent_version', value: "1.1.0", type: 'string' }
      ] }
    },
    position: [220, 300]
  },
  output: [{ model: "claude-sonnet-4-6", notify_email: "ryandhana1515@gmail.com", default_tenant: "fusiontech", default_ai_mode: 'live', auto_send_low_risk: 'true', agent: "sales-qualification", agent_version: "1.1.0", body: {} }]
});

const normalizeLeadNode = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Validate & Normalize Lead',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "var CB_DEFAULT_TENANT = 'biogreen';\nvar CB_DEFAULT_COUNTRY_CODE = '65'; // Singapore; 8-digit local numbers get this prefix\nvar CB_MAX_MESSAGE_LEN = 4000;\nvar CB_MAX_HISTORY = 20;\nfunction cbStr(v, max) {\n  if (v === undefined || v === null) return null;\n  var s = String(v).replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]/g, '').replace(/\\s+/g, ' ').trim();\n  if (!s) return null;\n  if (max && s.length > max) s = s.slice(0, max);\n  return s;\n}\nfunction cbMessage(v) {\n  if (v === undefined || v === null) return null;\n  var s = String(v).replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]/g, '').replace(/\\r\\n/g, '\\n').replace(/[ \\t]+/g, ' ').trim();\n  if (!s) return null;\n  if (s.length > CB_MAX_MESSAGE_LEN) s = s.slice(0, CB_MAX_MESSAGE_LEN);\n  return s;\n}\nfunction cbEmail(v) {\n  var s = cbStr(v, 254);\n  if (!s) return { value: null, valid: true };\n  s = s.toLowerCase();\n  var ok = /^[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$/.test(s);\n  return { value: ok ? s : null, valid: ok, raw: s };\n}\nfunction cbPhone(v) {\n  var s = cbStr(v, 40);\n  if (!s) return { value: null, valid: true };\n  var plus = s.charAt(0) === '+';\n  var digits = s.replace(/\\D/g, '');\n  if (digits.length < 7 || digits.length > 15) return { value: null, valid: false, raw: s };\n  if (!plus && digits.length === 8 && /^[3689]/.test(digits)) digits = CB_DEFAULT_COUNTRY_CODE + digits;\n  if (!plus && digits.length === 10 && digits.indexOf('65') === 0) { /* already country-coded SG */ }\n  return { value: '+' + digits, valid: true, raw: s };\n}\nfunction cbSlug(s) {\n  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || null;\n}\nfunction cbHash(str) {\n  var h = 5381;\n  for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;\n  return (h >>> 0).toString(36);\n}\nfunction cbId(prefix, nowMs, seed) {\n  var rnd = Math.floor(Math.random() * 0xffffff).toString(36);\n  return prefix + '_' + nowMs.toString(36) + rnd + (seed ? '_' + cbHash(seed) : '');\n}\nfunction cbHistory(v) {\n  if (!Array.isArray(v)) return [];\n  var out = [];\n  for (var i = 0; i < v.length && out.length < CB_MAX_HISTORY; i++) {\n    var m = v[i] || {};\n    var role = cbStr(m.role, 20);\n    var content = cbMessage(m.content);\n    if (!content) continue;\n    role = (role || 'customer').toLowerCase();\n    if (['customer', 'agent', 'human'].indexOf(role) === -1) role = role === 'assistant' || role === 'ai' ? 'agent' : 'customer';\n    out.push({ role: role, content: content, ts: cbStr(m.ts, 40) });\n  }\n  return out;\n}\nvar CB_SOURCES = ['facebook', 'instagram', 'tiktok', 'website', 'whatsapp', 'email', 'referral', 'manual', 'test', 'linkedin', 'google', 'phone', 'other'];\nvar CB_CHANNELS = ['whatsapp', 'email', 'messenger', 'instagram_dm', 'tiktok_dm', 'web_chat', 'phone', 'sms', 'unknown'];\nfunction cbSource(v) {\n  var s = cbSlug(cbStr(v, 40));\n  if (!s) return 'unknown';\n  if (s.indexOf('facebook') === 0 || s === 'fb' || s === 'meta') return 'facebook';\n  if (s.indexOf('instagram') === 0 || s === 'ig') return 'instagram';\n  if (s.indexOf('tiktok') === 0) return 'tiktok';\n  if (s.indexOf('web') === 0 || s === 'site' || s === 'landing_page') return 'website';\n  if (s.indexOf('whatsapp') === 0 || s === 'wa') return 'whatsapp';\n  return CB_SOURCES.indexOf(s) !== -1 ? s : 'other';\n}\nfunction cbChannel(v, source) {\n  var s = cbSlug(cbStr(v, 40));\n  if (s && CB_CHANNELS.indexOf(s) !== -1) return s;\n  if (s === 'whatsapp_business') return 'whatsapp';\n  if (s === 'ig' || s === 'instagram') return 'instagram_dm';\n  if (s === 'facebook' || s === 'fb') return 'messenger';\n  if (source === 'whatsapp') return 'whatsapp';\n  if (source === 'email') return 'email';\n  if (source === 'facebook') return 'messenger';\n  if (source === 'instagram') return 'instagram_dm';\n  return 'unknown';\n}\n/**\n * normalizeLead(raw, opts) -> { ok, errors, warnings, lead }\n * raw  : the JSON body an adapter POSTed (see schemas/lead-input.schema.json)\n * opts : { nowMs, defaultTenant, defaultAiMode }\n */\nfunction normalizeLead(raw, opts) {\n  opts = opts || {};\n  raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};\n  var nowMs = typeof opts.nowMs === 'number' ? opts.nowMs : Date.now();\n  var errors = [];\n  var warnings = [];\n  var tenant = cbSlug(cbStr(raw.tenant_id, 60)) || opts.defaultTenant || CB_DEFAULT_TENANT;\n  var name = cbStr(raw.name || raw.contact_name || raw.full_name, 120);\n  var email = cbEmail(raw.email);\n  var phone = cbPhone(raw.phone || raw.mobile || raw.whatsapp);\n  var company = cbStr(raw.company || raw.company_name, 160);\n  var industry = cbStr(raw.industry, 80);\n  var source = cbSource(raw.source || raw.lead_source);\n  var channel = cbChannel(raw.channel, source);\n  var message = cbMessage(raw.message || raw.text || raw.enquiry);\n  var history = cbHistory(raw.conversation_history || raw.history);\n  var testMode = raw.test_mode === true || raw.test_mode === 'true' || source === 'test';\n  var aiMode = String(raw.ai_mode || opts.defaultAiMode || 'live').toLowerCase() === 'mock' ? 'mock' : 'live';\n  var extIds = {};\n  if (raw.external_ids && typeof raw.external_ids === 'object') {\n    for (var k in raw.external_ids) {\n      var kv = cbStr(raw.external_ids[k], 120);\n      if (kv) extIds[cbSlug(k)] = kv;\n    }\n  }\n  if (!email.valid) warnings.push('email_invalid_ignored:' + email.raw);\n  if (!phone.valid) warnings.push('phone_invalid_ignored:' + phone.raw);\n  var hasContactPoint = !!(email.value || phone.value || Object.keys(extIds).length);\n  if (!message && history.length === 0) errors.push('message_required');\n  if (!hasContactPoint && !name) errors.push('contact_point_or_name_required');\n  if (!hasContactPoint) warnings.push('no_contact_point');\n  var identity = email.value || phone.value || (Object.keys(extIds).length ? JSON.stringify(extIds) : null) || (name ? 'name:' + name.toLowerCase() : null);\n  var leadKey = identity ? tenant + ':' + cbHash(identity) : null;\n  var leadId = cbStr(raw.lead_id, 80) || cbId('lead', nowMs, leadKey || 'anon');\n  var lead = {\n    tenant_id: tenant,\n    lead_id: leadId,\n    lead_key: leadKey,\n    contact_name: name,\n    email: email.value,\n    phone: phone.value,\n    company_name: company,\n    industry: industry,\n    lead_source: source,\n    channel: channel,\n    message: message || (history.length ? history[history.length - 1].content : null),\n    conversation_history: history,\n    external_ids: extIds,\n    test_mode: testMode,\n    ai_mode: aiMode,\n    received_at: new Date(nowMs).toISOString()\n  };\n  return { ok: errors.length === 0, errors: errors, warnings: warnings, lead: lead };\n}\n// ---- n8n glue ----\nconst cfg = $('Workflow Config').first().json;\nconst raw = $input.first().json || {};\nconst body = (raw.body && typeof raw.body === 'object') ? raw.body : raw;\nconst res = normalizeLead(body, { defaultTenant: cfg.default_tenant, defaultAiMode: cfg.default_ai_mode });\nreturn [{ json: { ok: res.ok, errors: res.errors, warnings: res.warnings, lead: res.lead, config: { model: cfg.model, notify_email: cfg.notify_email, agent: cfg.agent, agent_version: cfg.agent_version, auto_send_low_risk: String(cfg.auto_send_low_risk) === 'true' }, execution_id: String($execution.id), workflow_id: String($workflow.id) } }];\n" },
    position: [440, 300]
  },
  output: [{ ok: true, errors: [], warnings: [], lead: { tenant_id: 'biogreen', lead_id: 'lead_x', lead_key: 'biogreen:abc', contact_name: 'John Tan', email: null, phone: '+6591234567', company_name: 'ABC Property Pte Ltd', industry: null, lead_source: 'facebook', channel: 'messenger', message: 'Hi', conversation_history: [], external_ids: {}, test_mode: true, ai_mode: 'live', received_at: '2026-01-01T00:00:00.000Z' }, config: { model: 'claude-sonnet-4-6', notify_email: 'owner@example.com', agent: 'sales-qualification', agent_version: '1.0.0' }, execution_id: '1', workflow_id: 'w' }]
});

const isLeadValid = ifElse({
  version: 2.3,
  config: {
    name: 'Is Lead Valid?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'valid', leftValue: expr('{{ $json.ok }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      }
    },
    position: [660, 300]
  }
});

const respondInvalid = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond 400 Invalid Lead',
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ JSON.stringify({ ok: false, errors: $json.errors, warnings: $json.warnings }) }}'),
      options: { responseCode: 400 }
    },
    position: [900, 520]
  },
  output: [{ ok: false, errors: ['message_required'] }]
});

const findExistingLead = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Find Existing Lead',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: {"__rl":true,"mode":"id","value":"R78LlzNLIpVoy802","cachedResultName":"ceo_leads"},
      matchType: 'anyCondition',
      filters: { conditions: [{ keyName: 'lead_key', condition: 'eq', keyValue: expr('{{ $json.lead.lead_key }}') }] },
      returnAll: false,
      limit: 1
    },
    position: [900, 300]
  },
  output: [{}]
});

const resolveLead = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Resolve Lead Identity',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Merge the incoming lead with whatever we already know about it and build the prompt.\nconst USER_PROMPT_TEMPLATE = \"Qualify this inbound lead.\\n\\nTenant: {{tenant_id}}\\nLead id: {{lead_id}}\\nPrevious status: {{previous_status}}\\nReceived via: {{lead_source}} (reply channel: {{channel}})\\nNow (UTC): {{now}}\\n\\nContact details as given:\\n- Name: {{contact_name}}\\n- Phone: {{phone}}\\n- Email: {{email}}\\n- Company: {{company_name}}\\n- Industry: {{industry}}\\n\\nOriginal message:\\n\\\"\\\"\\\"\\n{{message}}\\n\\\"\\\"\\\"\\n\\nConversation history (oldest first, may be empty):\\n{{conversation_history}}\\n\\nReturn the JSON object now.\\n\";\nconst norm = $('Validate & Normalize Lead').first().json;\nconst existing = ($input.first() && $input.first().json) || {};\nconst isNew = !(existing && existing.lead_key);\nconst lead = norm.lead;\nif (!isNew) {\n  if (existing.lead_id) lead.lead_id = existing.lead_id;\n  const keep = ['contact_name', 'email', 'phone', 'company_name', 'industry'];\n  for (const k of keep) if (!lead[k] && existing[k]) lead[k] = existing[k];\n}\nconst previousStatus = isNew ? 'NEW' : (existing.status || 'NEW');\nconst now = new Date().toISOString();\nconst history = (lead.conversation_history || []).map((m) => '- [' + m.role + (m.ts ? ' ' + m.ts : '') + '] ' + m.content).join('\\n') || '(none)';\nconst vars = {\n  tenant_id: lead.tenant_id, lead_id: lead.lead_id, previous_status: previousStatus, lead_source: lead.lead_source,\n  channel: lead.channel, now: now, contact_name: lead.contact_name || 'not given', phone: lead.phone || 'not given',\n  email: lead.email || 'not given', company_name: lead.company_name || 'not given', industry: lead.industry || 'not given',\n  message: lead.message || '(no message)', conversation_history: history\n};\nconst userPrompt = USER_PROMPT_TEMPLATE.replace(/\\{\\{(\\w+)\\}\\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));\nreturn [{ json: { lead, is_new: isNew, previous_status: previousStatus, existing_row_id: existing.id || null, now, user_prompt: userPrompt, config: norm.config, execution_id: norm.execution_id, workflow_id: norm.workflow_id } }];\n" },
    position: [1120, 300]
  },
  output: [{ lead: { tenant_id: 'biogreen', lead_id: 'lead_x', lead_key: 'biogreen:abc', contact_name: 'John Tan', email: null, phone: '+6591234567', company_name: 'ABC Property Pte Ltd', industry: null, lead_source: 'facebook', channel: 'messenger', message: 'Hi', conversation_history: [], external_ids: {}, test_mode: true, ai_mode: 'live', received_at: '2026-01-01T00:00:00.000Z' }, is_new: true, previous_status: 'NEW', existing_row_id: null, now: '2026-01-01T00:00:00.000Z', user_prompt: 'Qualify this inbound lead...', config: { model: 'claude-sonnet-4-6', notify_email: 'owner@example.com', agent: 'sales-qualification', agent_version: '1.0.0' }, execution_id: '1', workflow_id: 'w' }]
});

const saveLead = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Save Lead (upsert)',
    parameters: {
      resource: 'row',
      operation: 'upsert',
      dataTableId: {"__rl":true,"mode":"id","value":"R78LlzNLIpVoy802","cachedResultName":"ceo_leads"},
      matchType: 'anyCondition',
      filters: { conditions: [{ keyName: 'lead_key', condition: 'eq', keyValue: expr('{{ $json.lead.lead_key }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr('{{ $json.lead.tenant_id }}'),
          lead_id: expr('{{ $json.lead.lead_id }}'),
          lead_key: expr('{{ $json.lead.lead_key }}'),
          status: expr('{{ $json.previous_status }}'),
          contact_name: expr('{{ $json.lead.contact_name ?? "" }}'),
          email: expr('{{ $json.lead.email ?? "" }}'),
          phone: expr('{{ $json.lead.phone ?? "" }}'),
          company_name: expr('{{ $json.lead.company_name ?? "" }}'),
          industry: expr('{{ $json.lead.industry ?? "" }}'),
          lead_source: expr('{{ $json.lead.lead_source }}'),
          channel: expr('{{ $json.lead.channel }}'),
          last_message: expr('{{ $json.lead.message ?? "" }}'),
          test_mode: expr('{{ $json.lead.test_mode }}'),
          updated_by: 'lead-intake',
          last_contact_at: expr('{{ $json.now }}')
        },
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_id","displayName":"lead_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_key","displayName":"lead_key","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"status","displayName":"status","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_temperature","displayName":"lead_temperature","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"contact_name","displayName":"contact_name","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"email","displayName":"email","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"phone","displayName":"phone","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"company_name","displayName":"company_name","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"industry","displayName":"industry","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_source","displayName":"lead_source","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"channel","displayName":"channel","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"intent","displayName":"intent","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"summary","displayName":"summary","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"missing_information","displayName":"missing_information","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"next_action","displayName":"next_action","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"follow_up_at","displayName":"follow_up_at","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"human_review_required","displayName":"human_review_required","required":false,"defaultMatch":false,"display":true,"type":"boolean","canBeUsedToMatch":true},{"id":"last_message","displayName":"last_message","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"extracted_json","displayName":"extracted_json","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"test_mode","displayName":"test_mode","required":false,"defaultMatch":false,"display":true,"type":"boolean","canBeUsedToMatch":true},{"id":"updated_by","displayName":"updated_by","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"last_contact_at","displayName":"last_contact_at","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true}]
      }
    },
    position: [1340, 300]
  },
  output: [{ id: 1, tenant_id: 'biogreen', lead_id: 'lead_x', status: 'NEW' }]
});

const logInbound = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Inbound Message',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: {"__rl":true,"mode":"id","value":"eImH5AdVZEOW0t31","cachedResultName":"ceo_messages"},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ $('Resolve Lead Identity').item.json.lead.tenant_id }}"),
          lead_id: expr("{{ $('Resolve Lead Identity').item.json.lead.lead_id }}"),
          message_id: expr("{{ 'msg_' + $('Resolve Lead Identity').item.json.execution_id + '_in' }}"),
          direction: 'inbound',
          channel: expr("{{ $('Resolve Lead Identity').item.json.lead.channel }}"),
          sender: expr("{{ $('Resolve Lead Identity').item.json.lead.contact_name ?? $('Resolve Lead Identity').item.json.lead.phone ?? $('Resolve Lead Identity').item.json.lead.email ?? 'unknown' }}"),
          content: expr("{{ $('Resolve Lead Identity').item.json.lead.message ?? '' }}"),
          status: 'received',
          execution_id: expr("{{ $('Resolve Lead Identity').item.json.execution_id }}"),
          created_by: expr("{{ 'adapter:' + $('Resolve Lead Identity').item.json.lead.lead_source }}"),
          ts: expr("{{ $('Resolve Lead Identity').item.json.now }}")
        },
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_id","displayName":"lead_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"message_id","displayName":"message_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"direction","displayName":"direction","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"channel","displayName":"channel","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"sender","displayName":"sender","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"content","displayName":"content","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"status","displayName":"status","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"execution_id","displayName":"execution_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"created_by","displayName":"created_by","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"ts","displayName":"ts","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true}]
      }
    },
    position: [1560, 300]
  },
  output: [{ id: 1, direction: 'inbound' }]
});

const useLiveAi = ifElse({
  version: 2.3,
  config: {
    name: 'Use Live AI?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'aimode', leftValue: expr("{{ $('Resolve Lead Identity').item.json.lead.ai_mode }}"), rightValue: 'live', operator: { type: 'string', operation: 'equals' } }],
        combinator: 'and'
      }
    },
    position: [2000, 300]
  }
});

const loadBrain = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Load Brain from Vault',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: { __rl: true, mode: 'name', value: "ryandhana1515-stack" }, repository: { __rl: true, mode: 'name', value: "ryan" }, filePath: "zaphiel/vault/FusionTech AI — Master Company Brain.md", asBinaryProperty: false, additionalParameters: {} },
    credentials: { githubOAuth2Api: { id: "lZqYskCh7zVfXsc7", name: "GitHub account" } },
    position: [2200, 100]
  },
  output: [{ content: 'LS0t', encoding: 'base64', sha: 'x', path: "zaphiel/vault/FusionTech AI — Master Company Brain.md" }]
});

const loadPlaybook = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Load Sales Playbook',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: { __rl: true, mode: 'name', value: "ryandhana1515-stack" }, repository: { __rl: true, mode: 'name', value: "ryan" }, filePath: "zaphiel/vault/Knowledge/John — Sales playbook.md", asBinaryProperty: false, additionalParameters: {} },
    credentials: { githubOAuth2Api: { id: "lZqYskCh7zVfXsc7", name: "GitHub account" } },
    position: [2420, 100]
  },
  output: [{ content: 'LS0t', encoding: 'base64', sha: 'x', path: "zaphiel/vault/Knowledge/John — Sales playbook.md" }]
});

const composePrompt = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Compose System Prompt',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "// Composes John's system prompt AT RUN TIME: the static parts are compiled from the repo, the company\n// knowledge and the sales playbook are read live from Ryan's Obsidian vault (GitHub). If the vault\n// cannot be read, the compiled copy is used so a lead is never dropped.\nconst STATIC_HEAD = \"# Company you represent (derived from zaphiel/knowledge/fusiontech-master-brain.md v1.0)\\n\\nYou are John, the AI sales consultant of **FusionTech AI** (Fusion AI), an AI software and\\nautomation company based in Singapore. Website: FusionTech.com.sg. Vision: \\\"Singapore to the\\nWorld.\\\" Positioning: \\\"AI Automation for a Smarter Tomorrow.\\\" Themes: Automate, Innovate, Scale,\\nTogether.\\n\\nWhat we sell: NOT \\\"an AI chatbot\\\", and we are not a generic marketing agency. We build a customized AI\\nworkforce and company operating system (our flagship concept is the CEO Brain): we connect the\\nsoftware a company already uses (WhatsApp, email, spreadsheets, CRM, accounting, Facebook,\\nInstagram, TikTok, website, calendar) through n8n workflows and specialized AI agents so that\\nleads are never forgotten, follow-ups are consistent, knowledge is centralized and the CEO can\\nsee what is happening. Existing systems can stay; we connect them.\\n\\nCore message to prospects: your people should not waste hours moving information between\\nsystems, chasing routine follow-ups and searching for information. We build AI agents around\\nyour actual workflow.\\n\\nHow we engage: diagnose first, architect second, build third, test, deploy, improve. We\\nusually start with ONE high-value workflow (for example lead capture + AI qualification +\\nWhatsApp follow-up + CRM + appointment booking + CEO reporting), prove it works, then expand\\ninto customer service, marketing, admin, operations, finance support, projects and reporting.\\n\\nCommercial rules you must respect: never quote prices or packages (a human prepares every\\nproposal); third-party software/API costs are always separate from FusionTech implementation\\nand support fees; never promise guaranteed financial outcomes.\\n\\nDiscovery you are working towards (progressively, never all at once): company, industry,\\nlocation, size, salespeople and customer-service headcount, what they sell, where leads come\\nfrom and monthly volume, how leads are handled and followed up today, CRM / ERP / accounting\\nsoftware, WhatsApp and email usage, calendar, website, marketing and social platforms, existing\\ndatabases or automation, biggest operational problems, most repetitive tasks, where leads or\\ncustomers are lost, what management cannot see, what they want automated, desired outcome,\\ntimeline, decision makers, and budget when appropriate.\\n\\nWebsites and web apps: we DO build websites, landing pages, online stores, web apps and customer\\nportals, and they are part of what makes us different: every site is designed to look premium and\\ncinematic (photo-led, rich colour, motion), never a template. When a prospect wants a website or a\\nmock-up: welcome it, then collect, progressively and never all at once (max three questions per\\nreply), the four things the build needs: the business name, what the business does and for whom,\\nwhat visitors must be able to do on the site (enquire, book, buy, browse) and the pages they want,\\nand the WhatsApp number or email to send the mock-up link to. Once those are known, our Website\\nBuilder agent builds a first mock-up automatically (no approval step) and you send the customer the\\npreview link, usually within 10 to 15 minutes. Nothing goes live on a domain until FusionTech and\\nthe customer agree. Never promise a delivery date or a price.\\n\\nConversation openers: a plain greeting gets a warm one-line introduction of FusionTech and one\\nquestion about their business. \\\"What do you do?\\\" gets a short, concrete answer (AI workforce\\nconnected to WhatsApp, email, CRM, accounting, social and the website; premium websites and web\\napps; a first mock-up to react to) and one question. Never escalate a greeting or a general\\nquestion to a human.\";\nconst STATIC_BODY = \"You are the Sales Qualification Agent for an AI-automation consultancy. You behave like a senior, professional AI automation consultant speaking with a prospective client. You are precise, warm, and never pushy.\\n\\n# Your job\\nRead one inbound lead (contact details, original message, and any conversation history) and produce ONE JSON object that follows the schema given below. You do two things at once:\\n1. Understand what the prospect wants and extract every business fact they actually stated.\\n2. Draft the next reply that moves the conversation forward by asking the most important missing questions - progressively, never all at once.\\n\\n# What you are trying to learn (in priority order)\\n1. What company does the prospect operate, and in which industry?\\n2. What repetitive work is currently manual?\\n3. Where are their leads coming from?\\n4. How are leads currently followed up?\\n5. What CRM or software are they using?\\n6. Are they using WhatsApp?\\n7. Are they using email?\\n8. What accounting / ERP / other systems are involved?\\n9. What should AI automate for them?\\n10. How many employees or users need the system?\\n11. What result does the customer want?\\n12. What is the implementation timeline?\\n13. What information is still missing?\\n\\nIf the prospect wants a website, landing page, online store, web app, portal or a mock-up: record \\\"website_build\\\" in extracted.desired_automation and run the website intake described in the company context (business name, what the business does, what the site must do and its pages, where to send the link; max three questions per reply). When all four are known, say the team is building the first mock-up now and the link follows in 10 to 15 minutes. Do not say a human must approve the build; nothing needs approval before a mock-up.\\n\\n# Hard rules\\n- NEVER fabricate. If a fact was not stated, set it to null (or an empty array) and add its field name to missing_information. \\\"25 agents\\\" means company_size = 25; \\\"a team\\\" alone means null.\\n- Do not infer budget, timeline, tools or decision-maker status from tone. Only from words.\\n- Ask at most THREE questions in recommended_reply, chosen from the highest-priority missing items. Put the same questions in questions_to_ask.\\n- recommended_reply is written to the customer in the language they wrote in, first person plural (\\\"we\\\"), under 120 words, no bullet lists, no emoji, no hype. Acknowledge what they said in one sentence before asking.\\n- NEVER quote or promise a price, discount, delivery date, guarantee, refund, contract term, or a specific technical commitment. If the customer asks for any of these, keep the reply neutral (\\\"we will come back to you with a tailored proposal\\\") AND set human_review_required = true with the reason in escalation_reasons.\\n- NEVER set lead_status to WON or LOST. Those are human decisions.\\n- Set lead_status = PROPOSAL_REQUIRED only when the problem, desired automation, and company size are all known and the prospect is asking for a proposal or pricing. A proposal always requires human approval, so also set human_review_required = true.\\n- Set lead_status = HUMAN_REVIEW when the message is ambiguous, hostile, legal, involves refunds/contracts/money, or you are below 0.4 confidence.\\n- intent = spam for irrelevant or automated content; then lead_temperature = cold, next_action = close_lost, human_review_required = false, and recommended_reply = \\\"\\\".\\n- lead_temperature: hot = clear pain + clear desired automation + (size OR timeline OR budget) known and the prospect is the decision maker or likely is; warm = clear pain or clear desired automation; cold = neither, or spam.\\n- next_action: ask_qualifying_questions while key items are missing; book_discovery_call when temperature is hot and the basics are known; request_proposal_approval when lead_status = PROPOSAL_REQUIRED; human_review when human_review_required; schedule_follow_up when the prospect asked to be contacted later; close_lost only for spam or an explicit \\\"not interested\\\"; send_reply when nothing needs asking.\\n- follow_up_at: ISO-8601 UTC timestamp, or null to let the system compute it from the status.\\n- confidence is your honest probability (0-1) that lead_status and intent are right.\\n- reasoning is 1-3 sentences for the human reviewer. Do not repeat the summary.\\n\\n# Output\\nReturn ONLY the JSON object. No prose, no markdown fences, no comments. It must validate against this JSON schema:\\n\\n{\\\"$schema\\\":\\\"https://json-schema.org/draft/2020-12/schema\\\",\\\"$id\\\":\\\"https://ceo-brain.local/schemas/sales-qualification-output.schema.json\\\",\\\"title\\\":\\\"SalesQualificationResult\\\",\\\"description\\\":\\\"Production schema for Agent #1 (Sales Qualification). The model must return exactly this object. Unknown facts are null and listed in missing_information. Never invent values.\\\",\\\"type\\\":\\\"object\\\",\\\"additionalProperties\\\":false,\\\"required\\\":[\\\"schema_version\\\",\\\"lead_status\\\",\\\"intent\\\",\\\"lead_temperature\\\",\\\"summary\\\",\\\"extracted\\\",\\\"missing_information\\\",\\\"recommended_reply\\\",\\\"questions_to_ask\\\",\\\"next_action\\\",\\\"follow_up_at\\\",\\\"human_review_required\\\",\\\"escalation_reasons\\\",\\\"confidence\\\",\\\"reasoning\\\"],\\\"properties\\\":{\\\"schema_version\\\":{\\\"type\\\":\\\"string\\\",\\\"const\\\":\\\"1.0\\\"},\\\"lead_status\\\":{\\\"type\\\":\\\"string\\\",\\\"enum\\\":[\\\"NEW\\\",\\\"CONTACTED\\\",\\\"QUALIFYING\\\",\\\"QUALIFIED\\\",\\\"HOT\\\",\\\"PROPOSAL_REQUIRED\\\",\\\"HUMAN_REVIEW\\\",\\\"WON\\\",\\\"LOST\\\",\\\"FOLLOW_UP\\\"],\\\"description\\\":\\\"Recommended status. WON/LOST are rejected from the AI and converted to HUMAN_REVIEW.\\\"},\\\"intent\\\":{\\\"type\\\":\\\"string\\\",\\\"enum\\\":[\\\"ai_automation_enquiry\\\",\\\"pricing_enquiry\\\",\\\"support_request\\\",\\\"partnership\\\",\\\"vendor_or_job_pitch\\\",\\\"spam\\\",\\\"unclear\\\"]},\\\"lead_temperature\\\":{\\\"type\\\":\\\"string\\\",\\\"enum\\\":[\\\"cold\\\",\\\"warm\\\",\\\"hot\\\"]},\\\"summary\\\":{\\\"type\\\":\\\"string\\\",\\\"maxLength\\\":600},\\\"extracted\\\":{\\\"type\\\":\\\"object\\\",\\\"additionalProperties\\\":false,\\\"required\\\":[\\\"company_name\\\",\\\"contact_name\\\",\\\"industry\\\",\\\"company_size\\\",\\\"problem\\\",\\\"current_tools\\\",\\\"lead_sources\\\",\\\"current_follow_up_process\\\",\\\"uses_whatsapp\\\",\\\"uses_email\\\",\\\"accounting_or_erp\\\",\\\"desired_automation\\\",\\\"users_needed\\\",\\\"desired_outcome\\\",\\\"budget\\\",\\\"timeline\\\",\\\"decision_maker\\\"],\\\"properties\\\":{\\\"company_name\\\":{\\\"type\\\":[\\\"string\\\",\\\"null\\\"]},\\\"contact_name\\\":{\\\"type\\\":[\\\"string\\\",\\\"null\\\"]},\\\"industry\\\":{\\\"type\\\":[\\\"string\\\",\\\"null\\\"]},\\\"company_size\\\":{\\\"type\\\":[\\\"integer\\\",\\\"null\\\"],\\\"description\\\":\\\"Head-count if stated (e.g. '25 agents' -> 25)\\\"},\\\"problem\\\":{\\\"type\\\":[\\\"string\\\",\\\"null\\\"],\\\"description\\\":\\\"The repetitive/manual work that hurts today\\\"},\\\"current_tools\\\":{\\\"type\\\":\\\"array\\\",\\\"items\\\":{\\\"type\\\":\\\"string\\\"}},\\\"lead_sources\\\":{\\\"type\\\":\\\"array\\\",\\\"items\\\":{\\\"type\\\":\\\"string\\\"}},\\\"current_follow_up_process\\\":{\\\"type\\\":[\\\"string\\\",\\\"null\\\"]},\\\"uses_whatsapp\\\":{\\\"type\\\":[\\\"boolean\\\",\\\"null\\\"]},\\\"uses_email\\\":{\\\"type\\\":[\\\"boolean\\\",\\\"null\\\"]},\\\"accounting_or_erp\\\":{\\\"type\\\":\\\"array\\\",\\\"items\\\":{\\\"type\\\":\\\"string\\\"}},\\\"desired_automation\\\":{\\\"type\\\":\\\"array\\\",\\\"items\\\":{\\\"type\\\":\\\"string\\\"}},\\\"users_needed\\\":{\\\"type\\\":[\\\"integer\\\",\\\"null\\\"]},\\\"desired_outcome\\\":{\\\"type\\\":[\\\"string\\\",\\\"null\\\"]},\\\"budget\\\":{\\\"type\\\":[\\\"string\\\",\\\"null\\\"]},\\\"timeline\\\":{\\\"type\\\":[\\\"string\\\",\\\"null\\\"]},\\\"decision_maker\\\":{\\\"type\\\":[\\\"boolean\\\",\\\"null\\\"]}}},\\\"missing_information\\\":{\\\"type\\\":\\\"array\\\",\\\"items\\\":{\\\"type\\\":\\\"string\\\",\\\"enum\\\":[\\\"company_name\\\",\\\"contact_name\\\",\\\"industry\\\",\\\"company_size\\\",\\\"problem\\\",\\\"current_tools\\\",\\\"lead_sources\\\",\\\"current_follow_up_process\\\",\\\"uses_whatsapp\\\",\\\"uses_email\\\",\\\"accounting_or_erp\\\",\\\"desired_automation\\\",\\\"users_needed\\\",\\\"desired_outcome\\\",\\\"budget\\\",\\\"timeline\\\",\\\"decision_maker\\\",\\\"contact_phone\\\",\\\"contact_email\\\"]}},\\\"recommended_reply\\\":{\\\"type\\\":\\\"string\\\",\\\"maxLength\\\":1500,\\\"description\\\":\\\"Customer-facing draft. Max 3 questions. No prices, no guarantees, no contracts.\\\"},\\\"questions_to_ask\\\":{\\\"type\\\":\\\"array\\\",\\\"maxItems\\\":3,\\\"items\\\":{\\\"type\\\":\\\"string\\\"}},\\\"next_action\\\":{\\\"type\\\":\\\"string\\\",\\\"enum\\\":[\\\"send_reply\\\",\\\"ask_qualifying_questions\\\",\\\"book_discovery_call\\\",\\\"request_proposal_approval\\\",\\\"human_review\\\",\\\"schedule_follow_up\\\",\\\"close_lost\\\",\\\"no_action\\\"]},\\\"follow_up_at\\\":{\\\"type\\\":[\\\"string\\\",\\\"null\\\"],\\\"format\\\":\\\"date-time\\\"},\\\"human_review_required\\\":{\\\"type\\\":\\\"boolean\\\"},\\\"escalation_reasons\\\":{\\\"type\\\":\\\"array\\\",\\\"items\\\":{\\\"type\\\":\\\"string\\\"}},\\\"confidence\\\":{\\\"type\\\":\\\"number\\\",\\\"minimum\\\":0,\\\"maximum\\\":1},\\\"reasoning\\\":{\\\"type\\\":\\\"string\\\",\\\"maxLength\\\":800}}}\\n\";\nfunction vaultText(nodeName) {\n  try {\n    const j = $(nodeName).first().json || {};\n    if (j && j.content && !j.error) {\n      const raw = String(j.content).replace(/\\n/g, '');\n      const txt = (typeof Buffer !== 'undefined') ? Buffer.from(raw, 'base64').toString('utf8') : decodeURIComponent(escape(atob(raw)));\n      return txt.replace(/^---[\\s\\S]*?---\\n/, '').trim() || null;\n    }\n  } catch (e) {}\n  return null;\n}\nconst brain = vaultText('Load Brain from Vault');\nconst playbook = vaultText('Load Sales Playbook');\nlet system, source;\nif (brain) {\n  system = STATIC_HEAD + '\\n\\n# Company knowledge (live from Ryan\\'s vault — authoritative; newest statements win)\\n\\n' + brain\n    + (playbook ? '\\n\\n# Sales playbook (live from the vault — follow it)\\n\\n' + playbook : '')\n    + '\\n\\n' + STATIC_BODY;\n  source = playbook ? 'vault:brain+playbook' : 'vault:brain';\n} else {\n  system = STATIC_HEAD + '\\n\\n' + STATIC_BODY;\n  source = 'compiled_fallback';\n}\nreturn [{ json: { system_prompt: system, brain_source: source, brain_chars: brain ? brain.length : 0, playbook_chars: playbook ? playbook.length : 0 } }];\n" },
    position: [2640, 100]
  },
  output: [{ system_prompt: 'You are John...', brain_source: 'vault:brain+playbook', brain_chars: 17000, playbook_chars: 2000 }]
});

const claudeAgent = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'Sales Qualification Agent (Claude)',
    onError: 'continueErrorOutput',
    parameters: {
      resource: 'text',
      operation: 'message',
      modelId: { __rl: true, mode: 'list', value: "claude-sonnet-4-6", cachedResultName: "Claude Sonnet 4.6" },
      messages: { values: [{ role: 'user', content: expr("{{ $('Resolve Lead Identity').item.json.user_prompt }}") }] },
      simplify: true,
      options: {
        system: expr("{{ $('Compose System Prompt').first().json.system_prompt }}"),
        maxTokens: 2500,
        temperature: 0.1,
        includeMergedResponse: true
      }
    },
    position: [2860, 100]
  },
  output: [{ text: '{"schema_version":"1.0","lead_status":"QUALIFYING"}', model: 'claude-sonnet-4-6', usage: { input_tokens: 1, output_tokens: 1 } }]
});

const rulesEngine = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Rule-Based Qualification (baseline / fallback)',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "var RB_VERSION = 'rules-v2';\nvar RB_GREETING = /^\\s*(hi|hello|hey|yo|hai|halo|good (morning|afternoon|evening)|hi there|hello there|hey there)[\\s!.,?]*(john|there)?[\\s!.,?]*$/i;\nvar RB_ABOUT = /(what (do|does|can) (you|u|fusiontech|fusion tech|your company|your team)( guys)? (do|offer|build|help|make)|what is (fusiontech|fusion tech|this|the ceo brain)|tell me (more )?about (you|yourself|fusiontech|fusion tech|your (company|services))|what can you (do|help|build)|how (can|do) you help|what (kind|type|sort)s? of websites?|what (websites?|services?|products?) (do|can) you|what are your services|what do you (offer|sell|build|specialise in|specialize in)|what.?s your problem|how does (it|this) work|what should i do|help me)/i;\nvar RB_ABOUT_REPLY = 'FusionTech AI builds an AI workforce around the way your business already works. We connect what you use today (WhatsApp, email, spreadsheets, CRM, accounting, Facebook, Instagram, TikTok, your website and calendar) so every enquiry gets answered and followed up, bookings and quotes happen without chasing, and you can see what is going on. We also build the websites and web apps that sit in front of it: business websites, landing pages, online stores, booking sites, customer portals and web apps, all designed to look premium and cinematic, and you get a first mock-up to react to before anything is decided.';\nvar RB_GREETING_REPLY = 'I am John from FusionTech AI. We build AI agents and automation around how your business already runs, plus the websites and web apps that go with it. What kind of business do you run, and what would you like to take off your plate?';\nvar RB_INDUSTRY = [\n  [/property|real estate|realtor|agency with .*agents|condo|hdb|landed/i, 'real_estate'],\n  [/clinic|dental|aesthetic|medical|doctor|physio|tcm/i, 'healthcare'],\n  [/restaurant|cafe|f&b|food|catering|bakery/i, 'food_and_beverage'],\n  [/e-?commerce|shopify|online store|lazada|shopee|tiktok shop/i, 'ecommerce'],\n  [/law firm|legal|lawyer/i, 'legal'],\n  [/accounting|bookkeeping|tax|audit firm/i, 'accounting'],\n  [/renovation|contractor|interior|construction/i, 'construction'],\n  [/tuition|school|education|academy|training/i, 'education'],\n  [/insurance|financial advis|wealth/i, 'financial_services'],\n  [/logistics|freight|delivery|warehouse/i, 'logistics'],\n  [/salon|spa|beauty|gym|fitness/i, 'wellness_and_beauty'],\n  [/saas|software|startup|tech company/i, 'technology']\n];\nvar RB_TOOLS = [\n  [/hubspot/i, 'HubSpot'], [/salesforce/i, 'Salesforce'], [/zoho/i, 'Zoho'], [/pipedrive/i, 'Pipedrive'],\n  [/respond\\.?io/i, 'respond.io'], [/excel|spreadsheet|google sheets?/i, 'Spreadsheets'],\n  [/notion/i, 'Notion'], [/airtable/i, 'Airtable'], [/xero/i, 'Xero'], [/quickbooks/i, 'QuickBooks'],\n  [/sap\\b/i, 'SAP'], [/odoo/i, 'Odoo'], [/shopify/i, 'Shopify'], [/wordpress/i, 'WordPress'],\n  [/gmail|outlook/i, 'Email client'], [/calendly/i, 'Calendly'], [/zapier|make\\.com/i, 'Zapier/Make']\n];\nvar RB_ERP = [[/xero/i, 'Xero'], [/quickbooks/i, 'QuickBooks'], [/sap\\b/i, 'SAP'], [/odoo/i, 'Odoo'], [/netsuite/i, 'NetSuite'], [/myob/i, 'MYOB']];\nvar RB_SOURCES = [\n  [/facebook|fb ads?|meta ads?/i, 'facebook'], [/instagram|ig\\b/i, 'instagram'], [/tiktok/i, 'tiktok'],\n  [/google ads?|seo|search/i, 'google'], [/website|landing page|web form/i, 'website'],\n  [/referral|word of mouth|recommend/i, 'referral'], [/linkedin/i, 'linkedin'], [/propertyguru|99\\.co/i, 'property_portal'],\n  [/walk[- ]?in/i, 'walk_in'], [/cold call|telemarket/i, 'outbound_calls']\n];\nvar RB_AUTOMATION = [\n  [/\\b(website|web ?site|landing page|web ?app|online store|e-?commerce (site|store|website)|web portal|customer portal|homepage|web ?page)\\b/i, 'website_build'],\n  [/whatsapp.*(reply|respond|answer|chat)|(reply|respond|answer).*whatsapp/i, 'whatsapp_auto_reply'],\n  [/book(ing)? (an? )?appointment|schedule (a )?(call|meeting|viewing)|appointment/i, 'appointment_booking'],\n  [/follow[- ]?up/i, 'lead_follow_up'],\n  [/qualif/i, 'lead_qualification'],\n  [/quote|quotation|proposal/i, 'quote_generation'],\n  [/invoice|billing|payment reminder/i, 'invoicing'],\n  [/customer (service|support)|faq|enquir/i, 'customer_support'],\n  [/email/i, 'email_automation'],\n  [/crm|pipeline/i, 'crm_sync'],\n  [/content|social media post/i, 'content_generation'],\n  [/report|dashboard/i, 'reporting']\n];\nvar RB_SIZE = /(\\d{1,5})\\s*(agents?|staff|employees?|people|users?|pax|team members?|salespeople|reps?|advisers?|advisors?|drivers?|technicians?|consultants?)/i;\nvar RB_BUDGET = /(budget[^.\\n]{0,40}?(\\$|sgd|usd|rm|k\\b)[\\s\\d,\\.k]*|\\b(s?\\$|sgd|usd)\\s?\\d[\\d,\\.]*\\s*(k|per month|\\/month|monthly)?)/i;\nvar RB_TIMELINE = /(asap|urgent|immediately|this (week|month|quarter)|next (week|month|quarter)|within \\d+ (days?|weeks?|months?)|by (end of )?(q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\\d+\\s*(weeks?|months?) time)/i;\nvar RB_DECISION = /\\b(i run|i own|my (company|business|agency|firm|clinic)|i am the (owner|founder|director|ceo|md)|i'm the (owner|founder|director|ceo|md)|founder|director|owner|ceo\\b)/i;\nvar RB_NOT_DECISION = /\\b(my boss|my manager|i need to check with|on behalf of|i work for)/i;\nvar RB_SPAM = /(seo services|backlinks|guest post|crypto|forex signals|loan approval|casino|lottery|unsubscribe|click here|http[s]?:\\/\\/[^\\s]+\\.(xyz|top|club)\\b)/i;\nvar RB_PRICING = /(how much|price|pricing|cost|quote|quotation|rates?)\\b/i;\nvar RB_SUPPORT = /(not working|broken|bug|error|issue with|help me fix|cancel my)/i;\nvar RB_PARTNER = /(partner(ship)?|reseller|white[- ]label|collaborat)/i;\nvar RB_VENDOR = /(we offer|our services|hire me|freelancer available|job application|resume|cv attached)/i;\nvar RB_NOT_INTERESTED = /(not interested|stop contacting|remove me|do not contact)/i;\nvar RB_CALL_LATER = /(call me (back )?(later|tomorrow|next week)|contact me (later|next)|get back to me (in|next))/i;\nvar RB_RISKY = /\\b(refund|chargeback|lawyer|legal action|sue|contract|guarantee|discount|cheapest|deposit|pay(ment)? terms|money back|complain|complaint|angry|scam)\\b/i;\nfunction rbMatchAll(text, table) {\n  var out = [];\n  for (var i = 0; i < table.length; i++) if (table[i][0].test(text) && out.indexOf(table[i][1]) === -1) out.push(table[i][1]);\n  return out;\n}\nfunction rbFirst(text, table) {\n  for (var i = 0; i < table.length; i++) if (table[i][0].test(text)) return table[i][1];\n  return null;\n}\nfunction rbHumanize(s) { return String(s).replace(/_/g, ' '); }\nvar RB_QUESTIONS = {\n  problem: 'Which part of your day-to-day work is the most repetitive or manual right now?',\n  lead_sources: 'Where do most of your enquiries come from today (Facebook, Instagram, website, referrals)?',\n  current_follow_up_process: 'How are new enquiries followed up at the moment, and by whom?',\n  current_tools: 'Which CRM or software do you use to track customers today?',\n  uses_whatsapp: 'Do your customers mostly reach you on WhatsApp, email, or another channel?',\n  desired_automation: 'If one task could run itself tomorrow, which one would you pick first?',\n  company_size: 'Roughly how many people on your team would use the system?',\n  desired_outcome: 'What result would make this a clear win for you in three months?',\n  timeline: 'When would you like to have this running?',\n  accounting_or_erp: 'Which accounting or back-office systems would this need to connect to?',\n  budget: 'Do you have a rough budget range in mind so we can propose the right scope?',\n  decision_maker: 'Will you be the one deciding on this, or is anyone else involved?',\n  industry: 'What kind of business do you run?',\n  company_name: 'What is the name of your company?',\n  contact_email: 'What is the best email address to send a summary to?',\n  contact_phone: 'What is the best number to reach you on WhatsApp?'\n};\nvar RB_QUESTION_PRIORITY = ['problem', 'lead_sources', 'current_follow_up_process', 'current_tools', 'uses_whatsapp', 'desired_automation', 'company_size', 'desired_outcome', 'timeline', 'accounting_or_erp', 'decision_maker', 'budget'];\n/**\n * classifyWithRules(lead) -> SalesQualificationResult (schema 1.0)\n * lead: the normalized lead object from normalize.js\n */\nfunction classifyWithRules(lead) {\n  lead = lead || {};\n  var histText = (lead.conversation_history || []).map(function (m) { return m.content; }).join('\\n');\n  var text = [lead.message || '', histText, lead.company_name || '', lead.industry || ''].join('\\n');\n  var msg = lead.message || '';\n  var extracted = {\n    company_name: lead.company_name || null,\n    contact_name: lead.contact_name || null,\n    industry: lead.industry || rbFirst(text, RB_INDUSTRY),\n    company_size: null,\n    problem: null,\n    current_tools: rbMatchAll(text, RB_TOOLS),\n    lead_sources: rbMatchAll(text, RB_SOURCES),\n    current_follow_up_process: null,\n    uses_whatsapp: /whatsapp/i.test(text) ? true : null,\n    uses_email: /\\bemail/i.test(text) ? true : null,\n    accounting_or_erp: rbMatchAll(text, RB_ERP),\n    desired_automation: rbMatchAll(text, RB_AUTOMATION),\n    users_needed: null,\n    desired_outcome: null,\n    budget: null,\n    timeline: null,\n    decision_maker: null\n  };\n  if (lead.lead_source && lead.lead_source !== 'unknown' && lead.lead_source !== 'other' && lead.lead_source !== 'test' && lead.lead_source !== 'manual' && extracted.lead_sources.indexOf(lead.lead_source) === -1) extracted.lead_sources.push(lead.lead_source);\n  var sizeM = text.match(RB_SIZE);\n  if (sizeM) { extracted.company_size = parseInt(sizeM[1], 10); extracted.users_needed = extracted.company_size; }\n  var budM = text.match(RB_BUDGET); if (budM) extracted.budget = budM[0].trim();\n  var tlM = text.match(RB_TIMELINE); if (tlM) extracted.timeline = tlM[0].trim();\n  if (RB_NOT_DECISION.test(text)) extracted.decision_maker = false; else if (RB_DECISION.test(text)) extracted.decision_maker = true;\n  var sentences = msg.split(/(?<=[.!?])\\s+/);\n  for (var i = 0; i < sentences.length; i++) {\n    if (/(don't|do not|doesn't|not|never|slow|miss|lost|manual|forget|too many|overwhelm|no time|late|struggl|waste)/i.test(sentences[i])) { extracted.problem = sentences[i].trim(); break; }\n  }\n  for (var j = 0; j < sentences.length; j++) {\n    if (/(i want|we want|i need|we need|looking for|would like|goal|so that)/i.test(sentences[j])) { extracted.desired_outcome = sentences[j].trim(); break; }\n  }\n  if (/(follow[- ]?up).*(manual|whatsapp|call|excel|nobody|don't|do not)/i.test(text)) extracted.current_follow_up_process = 'manual (as described by prospect)';\n  var isGreeting = RB_GREETING.test(msg);\n  var isAbout = RB_ABOUT.test(msg);\n  var intent = 'unclear';\n  if (RB_SPAM.test(text) || RB_VENDOR.test(text)) intent = RB_VENDOR.test(text) && !RB_SPAM.test(text) ? 'vendor_or_job_pitch' : 'spam';\n  else if (RB_PARTNER.test(text)) intent = 'partnership';\n  else if (RB_SUPPORT.test(text)) intent = 'support_request';\n  else if (extracted.desired_automation.length || /\\b(ai|automat|chatbot|bot)\\b/i.test(text)) intent = 'ai_automation_enquiry';\n  else if (isAbout) intent = 'ai_automation_enquiry';\n  else if (RB_PRICING.test(text)) intent = 'pricing_enquiry';\n  if (intent === 'unclear' && RB_PRICING.test(text)) intent = 'pricing_enquiry';\n  var missing = [];\n  var fields = ['company_name', 'contact_name', 'industry', 'company_size', 'problem', 'current_tools', 'lead_sources', 'current_follow_up_process', 'uses_whatsapp', 'uses_email', 'accounting_or_erp', 'desired_automation', 'users_needed', 'desired_outcome', 'budget', 'timeline', 'decision_maker'];\n  for (var f = 0; f < fields.length; f++) {\n    var v = extracted[fields[f]];\n    if (v === null || (Array.isArray(v) && v.length === 0)) missing.push(fields[f]);\n  }\n  if (!lead.phone) missing.push('contact_phone');\n  if (!lead.email) missing.push('contact_email');\n  var hasPain = !!extracted.problem;\n  var hasWant = extracted.desired_automation.length > 0;\n  var hasScale = extracted.company_size !== null || extracted.timeline !== null || extracted.budget !== null;\n  var temperature = 'cold';\n  if (hasPain && hasWant && hasScale && extracted.decision_maker !== false) temperature = 'hot';\n  else if (hasPain || hasWant) temperature = 'warm';\n  if (intent === 'spam' || intent === 'vendor_or_job_pitch') temperature = 'cold';\n  var escalation = [];\n  var riskM = msg.match(RB_RISKY);\n  if (riskM) escalation.push('customer_mentions_' + riskM[0].toLowerCase().replace(/\\s+/g, '_'));\n  if (intent === 'unclear' && temperature === 'cold' && !RB_NOT_INTERESTED.test(text) && !isGreeting && !isAbout) escalation.push('intent_unclear');\n  if (intent === 'support_request') escalation.push('existing_customer_support_request');\n  if (intent === 'partnership') escalation.push('partnership_requires_human');\n  var humanReview = escalation.length > 0;\n  var status = 'QUALIFYING';\n  var nextAction = 'ask_qualifying_questions';\n  var keyKnown = hasPain && hasWant && extracted.company_size !== null;\n  if (intent === 'spam' || intent === 'vendor_or_job_pitch') { status = 'LOST_CANDIDATE'; }\n  if (RB_NOT_INTERESTED.test(text)) { status = 'LOST_CANDIDATE'; }\n  if (status === 'LOST_CANDIDATE') { status = 'HUMAN_REVIEW'; nextAction = 'close_lost'; humanReview = true; escalation.push('close_lost_requires_human_confirmation'); }\n  else if (humanReview) { status = 'HUMAN_REVIEW'; nextAction = 'human_review'; }\n  else if (keyKnown && (RB_PRICING.test(text) || /proposal/i.test(text))) { status = 'PROPOSAL_REQUIRED'; nextAction = 'request_proposal_approval'; humanReview = true; escalation.push('proposal_or_pricing_requires_approval'); }\n  else if (temperature === 'hot') { status = 'HOT'; nextAction = 'book_discovery_call'; }\n  else if (keyKnown) { status = 'QUALIFIED'; nextAction = 'ask_qualifying_questions'; }\n  else if (RB_CALL_LATER.test(text)) { status = 'FOLLOW_UP'; nextAction = 'schedule_follow_up'; }\n  var questions = [];\n  for (var q = 0; q < RB_QUESTION_PRIORITY.length && questions.length < 3; q++) {\n    var key = RB_QUESTION_PRIORITY[q];\n    if (missing.indexOf(key) !== -1 && RB_QUESTIONS[key]) questions.push(RB_QUESTIONS[key]);\n  }\n  if (questions.length < 3 && missing.indexOf('contact_phone') !== -1 && missing.indexOf('contact_email') !== -1) questions.push(RB_QUESTIONS.contact_phone);\n  if (questions.length < 2 && missing.indexOf('contact_email') !== -1 && questions.indexOf(RB_QUESTIONS.contact_phone) === -1) questions.push(RB_QUESTIONS.contact_email);\n  var greet = lead.contact_name ? 'Hi ' + lead.contact_name.split(' ')[0] + ', ' : 'Hi, ';\n  var ack = '';\n  if (extracted.company_size !== null && extracted.industry) ack = 'thanks for reaching out. A ' + rbHumanize(extracted.industry) + ' business with ' + extracted.company_size + ' people' + (extracted.desired_automation.length ? ' looking at ' + rbHumanize(extracted.desired_automation[0]) : '') + ' is exactly the kind of setup we work on. ';\n  else if (extracted.desired_automation.length) ack = 'thanks for reaching out about ' + rbHumanize(extracted.desired_automation[0]) + '. ';\n  else ack = 'thanks for getting in touch. ';\n  var reply = '';\n  if (intent === 'spam') reply = '';\n  else if (nextAction === 'close_lost') reply = '';\n  else if (status === 'HUMAN_REVIEW') reply = greet + ack + 'A member of our team will review your message personally and come back to you shortly.';\n  else if (status === 'PROPOSAL_REQUIRED') reply = greet + ack + 'We will prepare a tailored proposal and come back to you with the details. ' + (questions.length ? 'To scope it correctly: ' + questions.slice(0, 2).join(' ') : '');\n  else if (status === 'HOT') reply = greet + ack + 'The fastest way forward is a short discovery call to map your current process. ' + (questions.length ? 'Before that, two quick questions: ' + questions.slice(0, 2).join(' ') : 'When would suit you this week?');\n  else reply = greet + ack + 'To point you in the right direction, a few quick questions: ' + questions.join(' ');\n  if (intent !== 'spam' && status !== 'HUMAN_REVIEW' && status !== 'PROPOSAL_REQUIRED') {\n    if (isAbout) reply = greet + RB_ABOUT_REPLY + ' ' + (questions.length ? questions[0] : 'What kind of business do you run?');\n    else if (isGreeting) reply = greet.replace(/, $/, '! ').replace(/^Hi, $/, 'Hi! ') + RB_GREETING_REPLY;\n  }\n  reply = reply.replace(/\\s+/g, ' ').trim();\n  var summary = (extracted.contact_name || 'Prospect') + (extracted.company_name ? ' from ' + extracted.company_name : '') + (extracted.industry ? ' (' + rbHumanize(extracted.industry) + ')' : '') + (extracted.company_size !== null ? ', ' + extracted.company_size + ' people' : '') + '. ' + (extracted.problem ? 'Pain: ' + extracted.problem + ' ' : '') + (extracted.desired_automation.length ? 'Wants: ' + extracted.desired_automation.map(rbHumanize).join(', ') + '.' : 'Desired automation not stated.');\n  var confidence = 0.35;\n  if (intent !== 'unclear') confidence += 0.2;\n  if (hasPain) confidence += 0.1;\n  if (hasWant) confidence += 0.1;\n  if (extracted.company_size !== null) confidence += 0.05;\n  if (intent === 'spam') confidence = 0.6;\n  if (isGreeting || isAbout) confidence = Math.max(confidence, 0.6); // handled openers, never 'low confidence'\n  confidence = Math.min(0.9, Math.round(confidence * 100) / 100);\n  return {\n    schema_version: '1.0',\n    lead_status: status,\n    intent: intent,\n    lead_temperature: temperature,\n    summary: summary.trim().slice(0, 600),\n    extracted: extracted,\n    missing_information: missing,\n    recommended_reply: reply.slice(0, 1500),\n    questions_to_ask: questions,\n    next_action: nextAction,\n    follow_up_at: null,\n    human_review_required: humanReview,\n    escalation_reasons: escalation,\n    confidence: confidence,\n    reasoning: 'Deterministic rule engine (' + RB_VERSION + '): intent from keyword patterns, temperature from pain+want+scale, status from qualification completeness. Not an LLM judgement.'\n  };\n}\n// ---- n8n glue ----\nconst ctx = $('Resolve Lead Identity').first().json;\nreturn [{ json: { source: 'rules', provider: 'rules', model: RB_VERSION, reason: ctx.lead.ai_mode === 'mock' ? 'mock_mode' : 'baseline', result: classifyWithRules(ctx.lead) } }];\n" },
    position: [1780, 300]
  },
  output: [{ source: 'rules', provider: 'rules', model: 'rules-v1', reason: 'baseline', result: { schema_version: '1.0', lead_status: 'QUALIFYING', intent: 'ai_automation_enquiry', lead_temperature: 'warm', summary: 's', extracted: {}, missing_information: [], recommended_reply: 'Hi', questions_to_ask: [], next_action: 'ask_qualifying_questions', follow_up_at: null, human_review_required: false, escalation_reasons: [], confidence: 0.6, reasoning: 'r' } }]
});

const finalize = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Finalize & Validate Result',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: "var CB_OUTPUT_SCHEMA = {\"$schema\":\"https://json-schema.org/draft/2020-12/schema\",\"$id\":\"https://ceo-brain.local/schemas/sales-qualification-output.schema.json\",\"title\":\"SalesQualificationResult\",\"description\":\"Production schema for Agent #1 (Sales Qualification). The model must return exactly this object. Unknown facts are null and listed in missing_information. Never invent values.\",\"type\":\"object\",\"additionalProperties\":false,\"required\":[\"schema_version\",\"lead_status\",\"intent\",\"lead_temperature\",\"summary\",\"extracted\",\"missing_information\",\"recommended_reply\",\"questions_to_ask\",\"next_action\",\"follow_up_at\",\"human_review_required\",\"escalation_reasons\",\"confidence\",\"reasoning\"],\"properties\":{\"schema_version\":{\"type\":\"string\",\"const\":\"1.0\"},\"lead_status\":{\"type\":\"string\",\"enum\":[\"NEW\",\"CONTACTED\",\"QUALIFYING\",\"QUALIFIED\",\"HOT\",\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"WON\",\"LOST\",\"FOLLOW_UP\"],\"description\":\"Recommended status. WON/LOST are rejected from the AI and converted to HUMAN_REVIEW.\"},\"intent\":{\"type\":\"string\",\"enum\":[\"ai_automation_enquiry\",\"pricing_enquiry\",\"support_request\",\"partnership\",\"vendor_or_job_pitch\",\"spam\",\"unclear\"]},\"lead_temperature\":{\"type\":\"string\",\"enum\":[\"cold\",\"warm\",\"hot\"]},\"summary\":{\"type\":\"string\",\"maxLength\":600},\"extracted\":{\"type\":\"object\",\"additionalProperties\":false,\"required\":[\"company_name\",\"contact_name\",\"industry\",\"company_size\",\"problem\",\"current_tools\",\"lead_sources\",\"current_follow_up_process\",\"uses_whatsapp\",\"uses_email\",\"accounting_or_erp\",\"desired_automation\",\"users_needed\",\"desired_outcome\",\"budget\",\"timeline\",\"decision_maker\"],\"properties\":{\"company_name\":{\"type\":[\"string\",\"null\"]},\"contact_name\":{\"type\":[\"string\",\"null\"]},\"industry\":{\"type\":[\"string\",\"null\"]},\"company_size\":{\"type\":[\"integer\",\"null\"],\"description\":\"Head-count if stated (e.g. '25 agents' -> 25)\"},\"problem\":{\"type\":[\"string\",\"null\"],\"description\":\"The repetitive/manual work that hurts today\"},\"current_tools\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"lead_sources\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"current_follow_up_process\":{\"type\":[\"string\",\"null\"]},\"uses_whatsapp\":{\"type\":[\"boolean\",\"null\"]},\"uses_email\":{\"type\":[\"boolean\",\"null\"]},\"accounting_or_erp\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"desired_automation\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"users_needed\":{\"type\":[\"integer\",\"null\"]},\"desired_outcome\":{\"type\":[\"string\",\"null\"]},\"budget\":{\"type\":[\"string\",\"null\"]},\"timeline\":{\"type\":[\"string\",\"null\"]},\"decision_maker\":{\"type\":[\"boolean\",\"null\"]}}},\"missing_information\":{\"type\":\"array\",\"items\":{\"type\":\"string\",\"enum\":[\"company_name\",\"contact_name\",\"industry\",\"company_size\",\"problem\",\"current_tools\",\"lead_sources\",\"current_follow_up_process\",\"uses_whatsapp\",\"uses_email\",\"accounting_or_erp\",\"desired_automation\",\"users_needed\",\"desired_outcome\",\"budget\",\"timeline\",\"decision_maker\",\"contact_phone\",\"contact_email\"]}},\"recommended_reply\":{\"type\":\"string\",\"maxLength\":1500,\"description\":\"Customer-facing draft. Max 3 questions. No prices, no guarantees, no contracts.\"},\"questions_to_ask\":{\"type\":\"array\",\"maxItems\":3,\"items\":{\"type\":\"string\"}},\"next_action\":{\"type\":\"string\",\"enum\":[\"send_reply\",\"ask_qualifying_questions\",\"book_discovery_call\",\"request_proposal_approval\",\"human_review\",\"schedule_follow_up\",\"close_lost\",\"no_action\"]},\"follow_up_at\":{\"type\":[\"string\",\"null\"],\"format\":\"date-time\"},\"human_review_required\":{\"type\":\"boolean\"},\"escalation_reasons\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"confidence\":{\"type\":\"number\",\"minimum\":0,\"maximum\":1},\"reasoning\":{\"type\":\"string\",\"maxLength\":800}}};\nvar CB_LEAD_STATUS = {\"$comment\":\"Lead lifecycle statuses and the transitions the system may recommend. WON and LOST are human-only.\",\"statuses\":[\"NEW\",\"CONTACTED\",\"QUALIFYING\",\"QUALIFIED\",\"HOT\",\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"WON\",\"LOST\",\"FOLLOW_UP\"],\"ai_may_set\":[\"CONTACTED\",\"QUALIFYING\",\"QUALIFIED\",\"HOT\",\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"FOLLOW_UP\"],\"human_only\":[\"WON\",\"LOST\"],\"transitions\":{\"NEW\":[\"CONTACTED\",\"QUALIFYING\",\"QUALIFIED\",\"HOT\",\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"FOLLOW_UP\",\"LOST\"],\"CONTACTED\":[\"QUALIFYING\",\"QUALIFIED\",\"HOT\",\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"FOLLOW_UP\",\"LOST\"],\"QUALIFYING\":[\"QUALIFYING\",\"QUALIFIED\",\"HOT\",\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"FOLLOW_UP\",\"LOST\"],\"QUALIFIED\":[\"QUALIFIED\",\"HOT\",\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"FOLLOW_UP\",\"WON\",\"LOST\"],\"HOT\":[\"HOT\",\"QUALIFIED\",\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"FOLLOW_UP\",\"WON\",\"LOST\"],\"PROPOSAL_REQUIRED\":[\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"FOLLOW_UP\",\"HOT\",\"WON\",\"LOST\"],\"HUMAN_REVIEW\":[\"HUMAN_REVIEW\",\"QUALIFYING\",\"QUALIFIED\",\"HOT\",\"PROPOSAL_REQUIRED\",\"FOLLOW_UP\",\"WON\",\"LOST\"],\"FOLLOW_UP\":[\"FOLLOW_UP\",\"CONTACTED\",\"QUALIFYING\",\"QUALIFIED\",\"HOT\",\"PROPOSAL_REQUIRED\",\"HUMAN_REVIEW\",\"LOST\"],\"WON\":[\"WON\"],\"LOST\":[\"LOST\",\"FOLLOW_UP\"]}};\nvar PP_VERSION = 'postprocess-v1';\nvar PP_FORBIDDEN_REPLY = [\n  [/(s?\\$|\\b(sgd|usd|rm))\\s?\\d/i, 'reply_contains_price'],\n  [/\\b\\d+\\s?%\\s?(off|discount)/i, 'reply_contains_discount'],\n  [/\\b(guarantee[ds]?|guaranteed|100%)\\b/i, 'reply_contains_guarantee'],\n  [/\\b(refund|money back|chargeback)/i, 'reply_mentions_refund'],\n  [/\\b(contract|agreement|terms and conditions|sign (here|now|the))\\b/i, 'reply_mentions_contract'],\n  [/\\b(we will deploy|go live on|deployed by|launch(ed)? on)\\b/i, 'reply_commits_to_deployment_date'],\n  [/\\b(password|api key|token|credential)s?\\b/i, 'reply_mentions_credentials']\n];\nvar PP_ESCALATE_ON_MESSAGE = [\n  [/\\b(refund|chargeback|money back)\\b/i, 'customer_requests_refund'],\n  [/\\b(contract|agreement|nda|sign)\\b/i, 'customer_mentions_contract'],\n  [/\\b(lawyer|legal|sue\\b|lawsuit|complain(t)? to)/i, 'customer_mentions_legal'],\n  [/\\b(final price|best price|fixed price|lock(ed)? in|confirm the price)\\b/i, 'customer_requests_price_commitment'],\n  [/\\b(delete my (data|account)|gdpr|pdpa)\\b/i, 'customer_data_request'],\n  [/\\b(pay(ment)?|invoice|deposit|bank transfer|paynow)\\b/i, 'customer_mentions_payment']\n];\nvar PP_FOLLOW_UP_HOURS = { HOT: 4, PROPOSAL_REQUIRED: 8, HUMAN_REVIEW: 2, QUALIFIED: 24, QUALIFYING: 48, CONTACTED: 48, NEW: 24, FOLLOW_UP: 72, WON: null, LOST: null };\nfunction ppStripFences(text) {\n  var s = String(text || '').trim();\n  s = s.replace(/^```(?:json)?\\s*/i, '').replace(/\\s*```$/i, '').trim();\n  var a = s.indexOf('{'), b = s.lastIndexOf('}');\n  if (a !== -1 && b > a) s = s.slice(a, b + 1);\n  return s;\n}\nfunction ppParse(text) {\n  try { return { ok: true, value: JSON.parse(ppStripFences(text)) }; }\n  catch (e) { return { ok: false, error: 'invalid_json: ' + (e && e.message ? e.message : String(e)) }; }\n}\nfunction ppType(v) {\n  if (v === null) return 'null';\n  if (Array.isArray(v)) return 'array';\n  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';\n  return typeof v;\n}\nfunction ppTypeOk(v, t) {\n  var types = Array.isArray(t) ? t : [t];\n  var actual = ppType(v);\n  for (var i = 0; i < types.length; i++) {\n    if (types[i] === actual) return true;\n    if (types[i] === 'number' && actual === 'integer') return true;\n  }\n  return false;\n}\nfunction ppValidate(schema, value, path, errors) {\n  path = path || '$'; errors = errors || [];\n  if (schema.const !== undefined && value !== schema.const) errors.push(path + ' must equal ' + JSON.stringify(schema.const));\n  if (schema.type && !ppTypeOk(value, schema.type)) { errors.push(path + ' expected ' + JSON.stringify(schema.type) + ' got ' + ppType(value)); return errors; }\n  if (schema.enum && schema.enum.indexOf(value) === -1) errors.push(path + ' not in enum: ' + JSON.stringify(value));\n  if (typeof value === 'string' && schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(path + ' longer than ' + schema.maxLength);\n  if (typeof value === 'number') {\n    if (schema.minimum !== undefined && value < schema.minimum) errors.push(path + ' below minimum');\n    if (schema.maximum !== undefined && value > schema.maximum) errors.push(path + ' above maximum');\n  }\n  if (Array.isArray(value)) {\n    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(path + ' has more than ' + schema.maxItems + ' items');\n    if (schema.items) for (var i = 0; i < value.length; i++) ppValidate(schema.items, value[i], path + '[' + i + ']', errors);\n  }\n  if (value && typeof value === 'object' && !Array.isArray(value)) {\n    var props = schema.properties || {};\n    if (schema.required) for (var r = 0; r < schema.required.length; r++) if (!(schema.required[r] in value)) errors.push(path + ' missing required ' + schema.required[r]);\n    for (var k in value) {\n      if (props[k]) ppValidate(props[k], value[k], path + '.' + k, errors);\n      else if (schema.additionalProperties === false) errors.push(path + ' unexpected property ' + k);\n    }\n  }\n  return errors;\n}\nfunction ppCoerce(o) {\n  if (!o || typeof o !== 'object') return o;\n  o.schema_version = '1.0';\n  if (typeof o.lead_status === 'string') o.lead_status = o.lead_status.toUpperCase().trim();\n  if (typeof o.intent === 'string') o.intent = o.intent.toLowerCase().trim();\n  if (typeof o.lead_temperature === 'string') o.lead_temperature = o.lead_temperature.toLowerCase().trim();\n  if (typeof o.next_action === 'string') o.next_action = o.next_action.toLowerCase().trim();\n  if (typeof o.human_review_required === 'string') o.human_review_required = o.human_review_required === 'true';\n  if (typeof o.confidence === 'string') o.confidence = parseFloat(o.confidence);\n  if (o.follow_up_at === '' || o.follow_up_at === 'null') o.follow_up_at = null;\n  if (o.recommended_reply === null) o.recommended_reply = '';\n  if (o.reasoning === null) o.reasoning = '';\n  if (o.summary === null) o.summary = '';\n  if (!Array.isArray(o.questions_to_ask)) o.questions_to_ask = [];\n  if (!Array.isArray(o.escalation_reasons)) o.escalation_reasons = [];\n  if (!Array.isArray(o.missing_information)) o.missing_information = [];\n  if (o.extracted && typeof o.extracted === 'object') {\n    var e = o.extracted;\n    var arrays = ['current_tools', 'lead_sources', 'accounting_or_erp', 'desired_automation'];\n    for (var a = 0; a < arrays.length; a++) if (!Array.isArray(e[arrays[a]])) e[arrays[a]] = e[arrays[a]] ? [String(e[arrays[a]])] : [];\n    var ints = ['company_size', 'users_needed'];\n    for (var n = 0; n < ints.length; n++) {\n      if (typeof e[ints[n]] === 'string') { var p = parseInt(e[ints[n]].replace(/\\D/g, ''), 10); e[ints[n]] = isNaN(p) ? null : p; }\n      if (typeof e[ints[n]] === 'number' && !Number.isInteger(e[ints[n]])) e[ints[n]] = Math.round(e[ints[n]]);\n    }\n    var bools = ['uses_whatsapp', 'uses_email', 'decision_maker'];\n    for (var b = 0; b < bools.length; b++) if (typeof e[bools[b]] === 'string') e[bools[b]] = e[bools[b]] === 'true' ? true : e[bools[b]] === 'false' ? false : null;\n    var strs = ['company_name', 'contact_name', 'industry', 'problem', 'current_follow_up_process', 'desired_outcome', 'budget', 'timeline'];\n    for (var s = 0; s < strs.length; s++) if (e[strs[s]] === '' || e[strs[s]] === 'unknown' || e[strs[s]] === 'null' || e[strs[s]] === undefined) e[strs[s]] = null;\n    var required = CB_OUTPUT_SCHEMA.properties.extracted.required;\n    for (var q = 0; q < required.length; q++) if (!(required[q] in e)) e[required[q]] = arrays.indexOf(required[q]) !== -1 ? [] : null;\n  }\n  return o;\n}\nfunction ppAddHours(iso, hours) {\n  var d = new Date(iso); d.setTime(d.getTime() + hours * 3600 * 1000); return d.toISOString();\n}\n/**\n * finalizeResult(input) -> { result, provider, model, valid, fallback_used, fallback_reason, validation_errors, status_change, audit }\n * input: {\n *   lead, previous_status, now (ISO),\n *   provider ('anthropic'|'rules'|...), model,\n *   raw_text (LLM text) | result (already-structured object),\n *   rules_result (SalesQualificationResult from rules.js, used as fallback)\n * }\n */\nfunction finalizeResult(input) {\n  input = input || {};\n  var lead = input.lead || {};\n  var now = input.now || new Date().toISOString();\n  var prev = input.previous_status || 'NEW';\n  var provider = input.provider || 'unknown';\n  var model = input.model || 'unknown';\n  var notes = [];\n  var validationErrors = [];\n  var fallbackUsed = false;\n  var fallbackReason = null;\n  var result = null;\n  if (input.result && typeof input.result === 'object') result = input.result;\n  else if (input.raw_text) {\n    var parsed = ppParse(input.raw_text);\n    if (parsed.ok) result = parsed.value; else fallbackReason = parsed.error;\n  } else fallbackReason = input.error || 'no_model_output';\n  if (result) {\n    result = ppCoerce(result);\n    validationErrors = ppValidate(CB_OUTPUT_SCHEMA, result);\n    if (validationErrors.length) { fallbackReason = 'schema_validation_failed'; result = null; }\n  }\n  if (!result) {\n    if (!input.rules_result) return { result: null, valid: false, provider: provider, model: model, fallback_used: false, fallback_reason: fallbackReason, validation_errors: validationErrors, status_change: null, audit: ['no_result_and_no_fallback'] };\n    result = JSON.parse(JSON.stringify(input.rules_result));\n    fallbackUsed = true; provider = 'rules'; model = 'rules-v1';\n    notes.push('fallback_to_rules:' + fallbackReason);\n  }\n  var reasons = result.escalation_reasons.slice();\n  function esc(r) { if (reasons.indexOf(r) === -1) reasons.push(r); }\n  for (var i = 0; i < PP_FORBIDDEN_REPLY.length; i++) if (PP_FORBIDDEN_REPLY[i][0].test(result.recommended_reply)) esc(PP_FORBIDDEN_REPLY[i][1]);\n  var msgText = [lead.message || ''].concat((lead.conversation_history || []).filter(function (m) { return m.role === 'customer'; }).map(function (m) { return m.content; })).join('\\n');\n  for (var j = 0; j < PP_ESCALATE_ON_MESSAGE.length; j++) if (PP_ESCALATE_ON_MESSAGE[j][0].test(msgText)) esc(PP_ESCALATE_ON_MESSAGE[j][1]);\n  if (CB_LEAD_STATUS.human_only.indexOf(result.lead_status) !== -1) { esc('ai_attempted_' + result.lead_status.toLowerCase() + '_status'); result.lead_status = 'HUMAN_REVIEW'; }\n  if (result.lead_status === 'PROPOSAL_REQUIRED') esc('proposal_or_pricing_requires_approval');\n  if (result.next_action === 'request_proposal_approval') esc('proposal_or_pricing_requires_approval');\n  if (result.next_action === 'close_lost' && result.intent !== 'spam') esc('close_lost_requires_human_confirmation');\n  if (result.confidence < 0.4) esc('low_confidence');\n  if (result.questions_to_ask.length > 3) result.questions_to_ask = result.questions_to_ask.slice(0, 3);\n  var replyBlocked = false;\n  for (var g = 0; g < PP_FORBIDDEN_REPLY.length; g++) if (reasons.indexOf(PP_FORBIDDEN_REPLY[g][1]) !== -1) replyBlocked = true;\n  if (replyBlocked) { notes.push('reply_withheld_by_guardrail'); result.recommended_reply = ''; }\n  result.escalation_reasons = reasons;\n  if (reasons.length) { result.human_review_required = true; if (result.lead_status !== 'PROPOSAL_REQUIRED') result.lead_status = 'HUMAN_REVIEW'; if (result.next_action !== 'request_proposal_approval' && result.next_action !== 'close_lost') result.next_action = 'human_review'; }\n  if (lead.test_mode) notes.push('test_mode:no_customer_contact');\n  var allowed = CB_LEAD_STATUS.transitions[prev] || CB_LEAD_STATUS.transitions.NEW;\n  var to = result.lead_status;\n  if (allowed.indexOf(to) === -1) { notes.push('transition_rejected:' + prev + '->' + to); to = prev === 'WON' || prev === 'LOST' ? prev : 'HUMAN_REVIEW'; result.lead_status = to; result.human_review_required = true; if (result.escalation_reasons.indexOf('invalid_status_transition') === -1) result.escalation_reasons.push('invalid_status_transition'); }\n  var statusChange = { from: prev, to: to, changed: prev !== to };\n  if (!result.follow_up_at) {\n    var h = PP_FOLLOW_UP_HOURS[to];\n    result.follow_up_at = (h === null || h === undefined) ? null : ppAddHours(now, h);\n  } else {\n    var d = new Date(result.follow_up_at);\n    if (isNaN(d.getTime())) { notes.push('follow_up_at_invalid_replaced'); result.follow_up_at = ppAddHours(now, PP_FOLLOW_UP_HOURS[to] || 24); }\n    else result.follow_up_at = d.toISOString();\n  }\n  return { result: result, valid: true, provider: provider, model: model, fallback_used: fallbackUsed, fallback_reason: fallbackReason, validation_errors: validationErrors, status_change: statusChange, audit: notes, postprocess_version: PP_VERSION };\n}\nfunction wbStr(v, max) {\n  if (v === undefined || v === null) return null;\n  var s = String(v).replace(/\\s+/g, ' ').trim();\n  if (!s) return null;\n  return max && s.length > max ? s.slice(0, max) : s;\n}\nvar WB_MEDICAL_RE = /\\b(doctor|doctors|dr\\.?|clinic|clinics|dental|dentist|orthodont|aesthetic (clinic|practice)|medical|physician|specialist|surgeon|surgery|healthcare|health care|hospital|physio(therapy)?|chiropract|tcm|traditional chinese medicine|dermatolog|paediatric|pediatric|gynae|gynec|cardiolog|oncolog|ophthalmolog|optometr|patients?)\\b/i;\nfunction wbDetectMode(text, industry) {\n  var t = String(text || '') + ' ' + String(industry || '');\n  return WB_MEDICAL_RE.test(t) ? 'medical' : 'sme';\n}\nvar WB_CATEGORY_RULES = [\n  ['healthcare', WB_MEDICAL_RE],\n  ['automotive', /\\b(dealership|car dealer|showroom|automotive|vehicles?|test drive|bmw|mercedes|toyota|honda|audi|tesla|motors?|car workshop|auto)\\b/i],\n  ['beauty', /\\b(salon|spa|beauty|nail|lash|brow|facial|hair(dress|cut|style)|barber|massage|wellness|aesthetic)\\b/i],\n  ['property', /\\b(property|real estate|realtor|condo|hdb|landed|listing|tenant|landlord|rental)\\b/i],\n  ['food_beverage', /\\b(restaurant|cafe|café|bakery|catering|hawker|bar\\b|bistro|kitchen|food|menu|f&b)\\b/i],\n  ['logistics', /\\b(logistic|delivery|deliveries|courier|freight|shipping|shipment|parcel|warehouse|driver|fleet|last.mile)\\b/i],\n  ['home_services', /\\b(plumb|electric(ian|al)|aircon|air-con|renovat|contractor|cleaning|pest|handyman|mover|moving|landscap|roofing|painter)\\b/i],\n  ['education', /\\b(tuition|tutor|school|academy|course|training centre|enrichment|students?|learning|kindergarten|preschool)\\b/i],\n  ['retail', /\\b(retail|shop|store|boutique|products?|merchandise|e-?commerce|online store)\\b/i],\n  ['technology', /\\b(software|saas|app\\b|platform|startup|tech|it services|cybersecurity|cloud)\\b/i],\n  ['consulting', /\\b(consult(ing|ant|ancy)|advisory|advisor|strategy firm)\\b/i],\n  ['professional_services', /\\b(law firm|lawyer|legal|accountant|accounting firm|audit|tax|architect|engineering firm|insurance|financial advis|corporate secretar)\\b/i],\n  ['b2b', /\\b(manufactur|factory|wholesale|supplier|distributor|industrial|b2b|oem|fabricat|precision)\\b/i]\n];\nfunction wbDetectCategory(text, industry) {\n  var t = String(text || '') + ' ' + String(industry || '');\n  for (var i = 0; i < WB_CATEGORY_RULES.length; i++) if (WB_CATEGORY_RULES[i][1].test(t)) return WB_CATEGORY_RULES[i][0];\n  return /\\b(local|neighbourhood|neighborhood|heartland)\\b/i.test(t) ? 'local_business' : 'other';\n}\nfunction wbDetectSiteType(text) {\n  if (/online store|e-?commerce|sell (products )?online|shop online|webshop|checkout/i.test(text)) return 'online_store';\n  if (/landing page/i.test(text)) return 'landing_page';\n  if (/customer portal|client portal|patient portal|\\bportal\\b/i.test(text)) return 'portal';\n  if (/web ?app|dashboard|log ?in|track(ing)? (shipments|orders|deliver)|booking system|online system/i.test(text)) return 'web_app';\n  if (/web ?site|homepage|web ?page/i.test(text)) return 'business_website';\n  return 'other';\n}\nfunction wbDetectGoal(text, mode) {\n  if (mode === 'medical' && /book|appointment|consult/i.test(text)) return 'bookings';\n  if (/book(ing)?|appointment|reserv/i.test(text)) return 'bookings';\n  if (/sell|order|checkout|online store|e-?commerce/i.test(text)) return 'sales';\n  if (/enquir|inquir|lead|quote|quotation|contact us|whatsapp|request/i.test(text)) return 'leads';\n  if (/support|faq|help ?desk/i.test(text)) return 'support';\n  if (/information|about us|showcase|portfolio|brochure/i.test(text)) return 'information';\n  return mode === 'medical' ? 'bookings' : 'leads';\n}\nfunction wbGuessBusinessName(input, text) {\n  if (input.company_name) return wbStr(input.company_name, 160);\n  var m = text.match(/\\b(?:[Ww]e are|[Ww]e're|[Ii] run|[Ii] own|[Mm]y company is|[Oo]ur company is|company called|clinic called|[Oo]ur clinic is|[Ii]'m from|[Ii] am from|[Ii]'m [A-Z][a-z]+ from|[Ii] am [A-Z][a-z]+ from|calling from|[Tt]his is [A-Z][a-z]+ from)\\s+([A-Z][\\w&'.\\- ]{2,60}?(?:Pte\\.? Ltd\\.?|Ltd\\.?|LLP|Inc\\.?|Co\\.?|Clinic|Dental|Medical|Motors|Group|Agency|Studio)?)(?=[,.\\n]| and | with | that | in | based |; )/);\n  return m ? wbStr(m[1], 160) : null;\n}\nvar WI_VERSION = 'website-intake-1.1.0';\nvar WI_WEBSITE_RE = /\\b(website|web ?site|landing page|web ?app|online store|e-?commerce (site|store|website)|web portal|customer portal|homepage|web ?page|mock-?up|mockup)\\b/i;\nvar WI_PURPOSE_RE = /\\b(book|booking|bookings|appointment|appointments|test drive|reserv\\w*|sell|selling|order|orders|checkout|shop online|enquir\\w*|inquir\\w*|quote|quotes|quotation|contact us|whatsapp|showcase|portfolio|brochure|browse|catalogue|catalog|menu|sign ?up|register|apply|download|learn about|information about|about us|our services|services page|pages?)\\b/i;\nvar WI_EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i;\nvar WI_PHONE_RE = /(?:\\+65[\\s-]?)?(?:[689]\\d{3}[\\s-]?\\d{4})\\b/;\nvar WI_STARTED_MARK = 'building your first mock-up';\nfunction wiClean(v, max) {\n  if (v === undefined || v === null) return null;\n  var s = String(v).replace(/\\s+/g, ' ').trim();\n  return s ? (max ? s.slice(0, max) : s) : null;\n}\nfunction wiCustomerText(history, message) {\n  var parts = [];\n  var h = Array.isArray(history) ? history : [];\n  for (var i = 0; i < h.length; i++) if (h[i] && h[i].role !== 'agent' && h[i].content) parts.push(String(h[i].content));\n  if (message) parts.push(String(message));\n  return parts.join('\\n');\n}\nfunction wiAgentText(history) {\n  var parts = [];\n  var h = Array.isArray(history) ? history : [];\n  for (var i = 0; i < h.length; i++) if (h[i] && h[i].role === 'agent' && h[i].content) parts.push(String(h[i].content));\n  return parts.join('\\n');\n}\n/**\n * wbIntake({ text | history+message, company_name, industry, contact_name, phone, email, channel, extracted })\n *  -> { topic, ready, missing, questions, reply, details, email, phone }\n */\nfunction wbIntake(o) {\n  o = o || {};\n  var text = typeof o.text === 'string' ? o.text : wiCustomerText(o.history, o.message);\n  var ex = (o.extracted && typeof o.extracted === 'object') ? o.extracted : {};\n  var topic = typeof o.text === 'string' ? WI_WEBSITE_RE.test(text) : (WI_WEBSITE_RE.test(String(o.message || '')) || wbIntakeInProgress(o.history));\n  var mode = wbDetectMode(text, o.industry || ex.industry);\n  var category = wbDetectCategory(text, o.industry || ex.industry);\n  var businessName = wiClean(o.company_name, 160) || wiClean(ex.company_name, 160) || wbGuessBusinessName({}, text);\n  var industry = wiClean(o.industry, 80) || wiClean(ex.industry, 80) || (category !== 'other' ? category.replace(/_/g, ' ') : null);\n  var siteType = wbDetectSiteType(text);\n  var purposeKnown = WI_PURPOSE_RE.test(text) && siteType !== 'other';\n  var goal = wbDetectGoal(text, mode);\n  var emailInText = (text.match(WI_EMAIL_RE) || [null])[0];\n  var phoneInText = (text.match(WI_PHONE_RE) || [null])[0];\n  var email = wiClean(o.email) || (emailInText ? emailInText.toLowerCase() : null);\n  var phone = wiClean(o.phone) || (phoneInText ? phoneInText.replace(/[\\s-]/g, '') : null);\n  if (phone && !/^\\+/.test(phone)) phone = '+65' + phone.replace(/^65/, '');\n  var contactKnown = !!(email || phone || o.channel === 'whatsapp');\n  var missing = [];\n  if (!businessName) missing.push('business_name');\n  if (!industry) missing.push('industry');\n  if (!purposeKnown) missing.push('site_purpose');\n  if (!contactKnown) missing.push('contact');\n  var noun = mode === 'medical' ? 'clinic' : 'business';\n  var q = {\n    business_name: 'What is the name of your ' + noun + '?',\n    industry: 'What does the ' + noun + ' do, and who are your customers?',\n    site_purpose: 'What should visitors be able to do on the site (enquire, book, buy, browse), and which pages do you need?',\n    contact: 'Which WhatsApp number or email should I send the mock-up link to?'\n  };\n  var questions = [];\n  for (var i = 0; i < missing.length && questions.length < 3; i++) questions.push(q[missing[i]]);\n  var ready = topic && missing.length === 0;\n  var first = wiClean(o.contact_name) ? String(o.contact_name).trim().split(' ')[0] : null;\n  var greet = first ? 'Hi ' + first + ', ' : 'Hi, ';\n  var reply;\n  if (!topic) reply = '';\n  else if (ready) {\n    var to = phone ? phone : (email ? email : 'this chat');\n    reply = greet + 'perfect, I have what I need for ' + businessName + '. Our website team is ' + WI_STARTED_MARK + ' now, in two versions for you to compare: a photo-led site and a cinematic scroll film site (our premium option). I will send both links to ' + to + ' in about 10 to 15 minutes. If you have a logo, brand colours or photos you want used, send them here and we will work them in.';\n  } else {\n    reply = greet + 'happy to get a first mock-up built for you' + (businessName ? ' at ' + businessName : '') + '. ' + (questions.length === 1 ? 'One thing I need: ' : 'A few quick details so it is right the first time: ') + questions.join(' ');\n  }\n  return {\n    version: WI_VERSION, topic: topic, ready: ready, missing: missing, questions: questions,\n    reply: reply.replace(/\\s+/g, ' ').trim(),\n    details: { business_name: businessName, industry: industry, site_type: siteType, goal: goal, category: category, mode: mode },\n    email: email, phone: phone\n  };\n}\n/** True when John already asked the intake questions in an earlier turn. */\nfunction wbIntakeInProgress(history) {\n  return wiAgentText(history).toLowerCase().indexOf('first mock-up built for you') !== -1;\n}\n/** True when John already told this customer the build has started (marker in an agent turn). */\nfunction wbBuildAlreadyStarted(history) {\n  return wiAgentText(history).toLowerCase().indexOf(WI_STARTED_MARK) !== -1;\n}\n// ---- n8n glue ----\nfunction cbMakeId(prefix) { return prefix + '_' + Date.now().toString(36) + Math.floor(Math.random() * 0xffffff).toString(36); }\nconst ctx = $('Resolve Lead Identity').first().json;\nconst inp = ($input.first() && $input.first().json) || {};\nconst rulesNode = $('Rule-Based Qualification (baseline / fallback)').first().json;\nconst rulesResult = rulesNode.result;\nlet provider = 'anthropic', model = ctx.config.model, rawText = null, result = null, error = null, usage = null, fallbackReason = null;\nif (inp.source === 'rules') { provider = 'rules'; model = inp.model; result = inp.result; fallbackReason = inp.reason; }\nelse if (inp.error) { error = 'model_error: ' + String(inp.error.message || inp.error.description || JSON.stringify(inp.error)).slice(0, 300); }\nelse {\n  model = inp.model || model;\n  usage = inp.usage || null;\n  if (typeof inp.text === 'string' && inp.text.trim()) rawText = inp.text;\n  else if (Array.isArray(inp.content)) rawText = inp.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('\\n');\n  else if (typeof inp.output === 'string') rawText = inp.output;\n  else if (typeof inp === 'string') rawText = inp;\n  if (!rawText) error = 'empty_model_output';\n}\nconst fin = finalizeResult({ lead: ctx.lead, previous_status: ctx.previous_status, now: new Date().toISOString(), provider, model, raw_text: rawText, result, error, rules_result: rulesResult });\nif (provider === 'rules' && !fin.fallback_reason) fin.fallback_reason = fallbackReason;\nconst finishedAt = new Date().toISOString();\nconst latencyMs = Math.max(0, new Date(finishedAt).getTime() - new Date(ctx.now).getTime());\nconst r = fin.result;\nconst approvalNeeded = r.human_review_required || r.next_action === 'request_proposal_approval';\nconst sendChannel = ctx.lead.channel === 'email' ? 'email' : (ctx.lead.channel === 'whatsapp' ? 'whatsapp' : null);\nconst sendTo = sendChannel === 'email' ? ctx.lead.email : (sendChannel === 'whatsapp' ? ctx.lead.phone : null);\nconst autoSend = !approvalNeeded && ctx.config.auto_send_low_risk === true && !ctx.lead.test_mode && !!sendChannel && !!sendTo && !!r.recommended_reply;\n// Website intake + hand-off (Ryan, 2026-09-25: zero approvals). When the customer asks for a site or a\n// mock-up, John collects the four details; once he has them the Website Builder is called and builds.\nconst notPitch = r.intent !== 'spam' && r.intent !== 'vendor_or_job_pitch';\nconst histAll = Array.isArray(ctx.lead.conversation_history) ? ctx.lead.conversation_history : [];\nconst intake = wbIntake({ history: histAll, message: ctx.lead.message, company_name: ctx.lead.company_name || r.extracted.company_name, industry: ctx.lead.industry || r.extracted.industry, contact_name: ctx.lead.contact_name || r.extracted.contact_name, phone: ctx.lead.phone, email: ctx.lead.email, channel: ctx.lead.channel, extracted: r.extracted });\nconst buildStarted = wbBuildAlreadyStarted(histAll);\nconst websiteTopic = notPitch && intake.topic;\nconst websiteRequested = websiteTopic && intake.ready && !buildStarted;\nif (websiteTopic && !buildStarted && !approvalNeeded && r.recommended_reply) r.recommended_reply = intake.reply;\nconst contactFound = { email: intake.email || null, phone: intake.phone || null };\nconst handoffs = websiteRequested ? ['website-builder'] : [];\nconst followUpTask = {\n  task_id: cbMakeId('task'),\n  task_type: approvalNeeded ? 'approval' : (r.next_action === 'book_discovery_call' ? 'call' : 'follow_up'),\n  title: (approvalNeeded ? 'APPROVAL: ' : 'Follow up: ') + (ctx.lead.contact_name || 'lead') + (ctx.lead.company_name ? ' @ ' + ctx.lead.company_name : '') + ' — ' + r.next_action.replace(/_/g, ' '),\n  description: r.summary + (r.escalation_reasons.length ? ' | Escalation: ' + r.escalation_reasons.join(', ') : ''),\n  due_at: r.follow_up_at,\n  status: 'open',\n  assigned_to: approvalNeeded ? 'human' : 'sales-agent',\n  requires_approval: approvalNeeded,\n  approval_reason: r.escalation_reasons.join(', ')\n};\nconst response = {\n  ok: true,\n  lead_id: ctx.lead.lead_id,\n  tenant_id: ctx.lead.tenant_id,\n  is_new_lead: ctx.is_new,\n  test_mode: ctx.lead.test_mode,\n  ai: { provider: fin.provider, model: fin.model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason, validation_errors: fin.validation_errors, latency_ms: latencyMs, usage },\n  delivery: { auto_send: autoSend, channel: sendChannel, to: sendTo ? sendTo.replace(/(.{3}).+(.{2})/, '$1***$2') : null, mode: autoSend ? 'auto_send_low_risk' : (approvalNeeded ? 'awaiting_human_approval' : (ctx.lead.test_mode ? 'test_mode_no_send' : 'draft_only')) },\n  status_change: fin.status_change,\n  result: r,\n  follow_up_task: followUpTask,\n  audit: fin.audit,\n  handoffs,\n  website_intake: { topic: websiteTopic, ready: intake.ready, missing: intake.missing, build_started: buildStarted },\n  execution_id: ctx.execution_id\n};\nreturn [{ json: {\n  lead: ctx.lead, is_new: ctx.is_new, previous_status: ctx.previous_status, config: ctx.config,\n  execution_id: ctx.execution_id, workflow_id: ctx.workflow_id,\n  provider: fin.provider, model: fin.model, fallback_used: fin.fallback_used, fallback_reason: fin.fallback_reason,\n  validation_errors: fin.validation_errors, status_change: fin.status_change, audit: fin.audit,\n  result: r, run_id: cbMakeId('run'), message_id: cbMakeId('msg'), task: followUpTask,\n  usage, started_at: ctx.now, finished_at: finishedAt, latency_ms: latencyMs,\n  approval_needed: approvalNeeded, auto_send: autoSend, send_channel: sendChannel, send_to: sendTo,\n  send_subject: 'Re: your enquiry to FusionTech AI', website_requested: websiteRequested, handoffs, response,\n  website_intake: { topic: websiteTopic, ready: intake.ready, missing: intake.missing, build_started: buildStarted, details: intake.details }, contact_found: contactFound\n} }];\n" },
    position: [2300, 300]
  },
  output: [{ lead: { tenant_id: 'biogreen', lead_id: 'lead_x', lead_key: 'biogreen:abc', channel: 'messenger', contact_name: 'John Tan', test_mode: true, message: 'Hi' }, is_new: true, previous_status: 'NEW', config: { model: 'claude-sonnet-4-6', notify_email: 'owner@example.com', agent: 'sales-qualification', agent_version: '1.0.0' }, execution_id: '1', workflow_id: 'w', provider: 'anthropic', model: 'claude-sonnet-4-6', fallback_used: false, fallback_reason: null, validation_errors: [], status_change: { from: 'NEW', to: 'QUALIFYING', changed: true }, audit: [], result: { schema_version: '1.0', lead_status: 'QUALIFYING', intent: 'ai_automation_enquiry', lead_temperature: 'warm', summary: 's', extracted: {}, missing_information: [], recommended_reply: 'Hi', questions_to_ask: [], next_action: 'ask_qualifying_questions', follow_up_at: '2026-01-02T00:00:00.000Z', human_review_required: false, escalation_reasons: [], confidence: 0.8, reasoning: 'r' }, run_id: 'run_x', message_id: 'msg_x', task: { task_id: 'task_x', task_type: 'follow_up', title: 't', description: 'd', due_at: '2026-01-02T00:00:00.000Z', status: 'open', assigned_to: 'sales-agent', requires_approval: false, approval_reason: '' }, usage: null, started_at: '2026-01-01T00:00:00.000Z', finished_at: '2026-01-01T00:00:01.000Z', latency_ms: 1000, approval_needed: false, response: { ok: true } }]
});

const updateLeadStatus = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Update Lead Status',
    parameters: {
      resource: 'row',
      operation: 'update',
      dataTableId: {"__rl":true,"mode":"id","value":"R78LlzNLIpVoy802","cachedResultName":"ceo_leads"},
      matchType: 'anyCondition',
      filters: { conditions: [{ keyName: 'lead_key', condition: 'eq', keyValue: expr('{{ $json.lead.lead_key }}') }] },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          status: expr('{{ $json.result.lead_status }}'),
          lead_temperature: expr('{{ $json.result.lead_temperature }}'),
          intent: expr('{{ $json.result.intent }}'),
          summary: expr('{{ $json.result.summary }}'),
          missing_information: expr('{{ JSON.stringify($json.result.missing_information) }}'),
          next_action: expr('{{ $json.result.next_action }}'),
          follow_up_at: expr('{{ $json.result.follow_up_at ?? "" }}'),
          human_review_required: expr('{{ $json.result.human_review_required }}'),
          extracted_json: expr('{{ JSON.stringify($json.result.extracted) }}'),
          company_name: expr("{{ $json.lead.company_name || $json.result.extracted.company_name || ($json.website_intake && $json.website_intake.details ? $json.website_intake.details.business_name : '') || '' }}"),
          industry: expr("{{ $json.lead.industry || $json.result.extracted.industry || ($json.website_intake && $json.website_intake.details ? $json.website_intake.details.industry : '') || '' }}"),
          email: expr('{{ $json.lead.email || $json.contact_found.email || "" }}'),
          phone: expr('{{ $json.lead.phone || $json.contact_found.phone || "" }}'),
          updated_by: expr('{{ "agent:" + $json.config.agent + "@" + $json.provider }}'),
          last_contact_at: expr('{{ $json.finished_at }}')
        },
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_id","displayName":"lead_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_key","displayName":"lead_key","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"status","displayName":"status","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_temperature","displayName":"lead_temperature","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"contact_name","displayName":"contact_name","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"email","displayName":"email","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"phone","displayName":"phone","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"company_name","displayName":"company_name","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"industry","displayName":"industry","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_source","displayName":"lead_source","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"channel","displayName":"channel","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"intent","displayName":"intent","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"summary","displayName":"summary","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"missing_information","displayName":"missing_information","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"next_action","displayName":"next_action","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"follow_up_at","displayName":"follow_up_at","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"human_review_required","displayName":"human_review_required","required":false,"defaultMatch":false,"display":true,"type":"boolean","canBeUsedToMatch":true},{"id":"last_message","displayName":"last_message","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"extracted_json","displayName":"extracted_json","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"test_mode","displayName":"test_mode","required":false,"defaultMatch":false,"display":true,"type":"boolean","canBeUsedToMatch":true},{"id":"updated_by","displayName":"updated_by","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"last_contact_at","displayName":"last_contact_at","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true}]
      }
    },
    position: [3100, 300]
  },
  output: [{ id: 1, status: 'QUALIFYING' }]
});

const logAgentRun = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Agent Run',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: {"__rl":true,"mode":"id","value":"zoxuUjbgzs6iLIaU","cachedResultName":"ceo_agent_runs"},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ $('Finalize & Validate Result').item.json.lead.tenant_id }}"),
          run_id: expr("{{ $('Finalize & Validate Result').item.json.run_id }}"),
          agent: expr("{{ $('Finalize & Validate Result').item.json.config.agent }}"),
          agent_version: expr("{{ $('Finalize & Validate Result').item.json.config.agent_version }}"),
          lead_id: expr("{{ $('Finalize & Validate Result').item.json.lead.lead_id }}"),
          workflow_id: expr("{{ $('Finalize & Validate Result').item.json.workflow_id }}"),
          execution_id: expr("{{ $('Finalize & Validate Result').item.json.execution_id }}"),
          model: expr("{{ $('Finalize & Validate Result').item.json.model }}"),
          provider: expr("{{ $('Finalize & Validate Result').item.json.provider }}"),
          input_ref: expr("{{ 'ceo_messages:msg_' + $('Finalize & Validate Result').item.json.execution_id + '_in' }}"),
          output_json: expr("{{ JSON.stringify({ result: $('Finalize & Validate Result').item.json.result, status_change: $('Finalize & Validate Result').item.json.status_change, audit: $('Finalize & Validate Result').item.json.audit, validation_errors: $('Finalize & Validate Result').item.json.validation_errors, usage: $('Finalize & Validate Result').item.json.usage }) }}"),
          success: expr("{{ $('Finalize & Validate Result').item.json.validation_errors.length === 0 || $('Finalize & Validate Result').item.json.fallback_used }}"),
          error: expr("{{ $('Finalize & Validate Result').item.json.fallback_used ? ($('Finalize & Validate Result').item.json.fallback_reason ?? '') : '' }}"),
          latency_ms: expr("{{ $('Finalize & Validate Result').item.json.latency_ms }}"),
          test_mode: expr("{{ $('Finalize & Validate Result').item.json.lead.test_mode }}"),
          started_at: expr("{{ $('Finalize & Validate Result').item.json.started_at }}"),
          finished_at: expr("{{ $('Finalize & Validate Result').item.json.finished_at }}")
        },
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"run_id","displayName":"run_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"agent","displayName":"agent","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"agent_version","displayName":"agent_version","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_id","displayName":"lead_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"workflow_id","displayName":"workflow_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"execution_id","displayName":"execution_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"model","displayName":"model","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"provider","displayName":"provider","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"input_ref","displayName":"input_ref","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"output_json","displayName":"output_json","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"success","displayName":"success","required":false,"defaultMatch":false,"display":true,"type":"boolean","canBeUsedToMatch":true},{"id":"error","displayName":"error","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"latency_ms","displayName":"latency_ms","required":false,"defaultMatch":false,"display":true,"type":"number","canBeUsedToMatch":true},{"id":"test_mode","displayName":"test_mode","required":false,"defaultMatch":false,"display":true,"type":"boolean","canBeUsedToMatch":true},{"id":"started_at","displayName":"started_at","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"finished_at","displayName":"finished_at","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true}]
      }
    },
    position: [3320, 300]
  },
  output: [{ id: 1, run_id: 'run_x' }]
});

const logAudit = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Audit Trail',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: {"__rl":true,"mode":"id","value":"zjeuGe9AEgJS5MKg","cachedResultName":"ceo_audit_logs"},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ $('Finalize & Validate Result').item.json.lead.tenant_id }}"),
          entity_type: 'lead',
          entity_id: expr("{{ $('Finalize & Validate Result').item.json.lead.lead_id }}"),
          action: expr("{{ $('Finalize & Validate Result').item.json.status_change.changed ? 'status_changed' : 'status_confirmed' }}"),
          old_value: expr("{{ $('Finalize & Validate Result').item.json.status_change.from }}"),
          new_value: expr("{{ $('Finalize & Validate Result').item.json.status_change.to }}"),
          actor: expr("{{ 'agent:' + $('Finalize & Validate Result').item.json.config.agent + '@' + $('Finalize & Validate Result').item.json.provider }}"),
          execution_id: expr("{{ $('Finalize & Validate Result').item.json.execution_id }}"),
          reason: expr("{{ [$('Finalize & Validate Result').item.json.result.reasoning].concat($('Finalize & Validate Result').item.json.audit).join(' | ') }}"),
          ts: expr("{{ $('Finalize & Validate Result').item.json.finished_at }}")
        },
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"entity_type","displayName":"entity_type","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"entity_id","displayName":"entity_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"action","displayName":"action","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"old_value","displayName":"old_value","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"new_value","displayName":"new_value","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"actor","displayName":"actor","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"execution_id","displayName":"execution_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"reason","displayName":"reason","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"ts","displayName":"ts","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true}]
      }
    },
    position: [3540, 300]
  },
  output: [{ id: 1, action: 'status_changed' }]
});

const saveDraftReply = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Save Draft Reply',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: {"__rl":true,"mode":"id","value":"eImH5AdVZEOW0t31","cachedResultName":"ceo_messages"},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ $('Finalize & Validate Result').item.json.lead.tenant_id }}"),
          lead_id: expr("{{ $('Finalize & Validate Result').item.json.lead.lead_id }}"),
          message_id: expr("{{ $('Finalize & Validate Result').item.json.message_id }}"),
          direction: 'outbound',
          channel: expr("{{ $('Finalize & Validate Result').item.json.lead.channel }}"),
          sender: expr("{{ 'agent:' + $('Finalize & Validate Result').item.json.config.agent }}"),
          content: expr("{{ $('Finalize & Validate Result').item.json.result.recommended_reply }}"),
          status: expr("{{ $('Finalize & Validate Result').item.json.result.recommended_reply ? ($('Finalize & Validate Result').item.json.approval_needed ? 'draft_pending_approval' : 'draft') : 'withheld' }}"),
          execution_id: expr("{{ $('Finalize & Validate Result').item.json.execution_id }}"),
          created_by: expr("{{ 'agent:' + $('Finalize & Validate Result').item.json.config.agent + '@' + $('Finalize & Validate Result').item.json.provider }}"),
          ts: expr("{{ $('Finalize & Validate Result').item.json.finished_at }}")
        },
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_id","displayName":"lead_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"message_id","displayName":"message_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"direction","displayName":"direction","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"channel","displayName":"channel","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"sender","displayName":"sender","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"content","displayName":"content","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"status","displayName":"status","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"execution_id","displayName":"execution_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"created_by","displayName":"created_by","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"ts","displayName":"ts","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true}]
      }
    },
    position: [3760, 300]
  },
  output: [{ id: 2, direction: 'outbound', status: 'draft' }]
});

const createTask = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Create Follow-up Task',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: {"__rl":true,"mode":"id","value":"sPnRGXe4VYDJLJHr","cachedResultName":"ceo_tasks"},
      columns: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ $('Finalize & Validate Result').item.json.lead.tenant_id }}"),
          task_id: expr("{{ $('Finalize & Validate Result').item.json.task.task_id }}"),
          lead_id: expr("{{ $('Finalize & Validate Result').item.json.lead.lead_id }}"),
          task_type: expr("{{ $('Finalize & Validate Result').item.json.task.task_type }}"),
          title: expr("{{ $('Finalize & Validate Result').item.json.task.title }}"),
          description: expr("{{ $('Finalize & Validate Result').item.json.task.description }}"),
          due_at: expr("{{ $('Finalize & Validate Result').item.json.task.due_at ?? '' }}"),
          status: expr("{{ $('Finalize & Validate Result').item.json.task.status }}"),
          assigned_to: expr("{{ $('Finalize & Validate Result').item.json.task.assigned_to }}"),
          requires_approval: expr("{{ $('Finalize & Validate Result').item.json.task.requires_approval }}"),
          approval_reason: expr("{{ $('Finalize & Validate Result').item.json.task.approval_reason }}"),
          payload_json: expr("{{ JSON.stringify({ next_action: $('Finalize & Validate Result').item.json.result.next_action, recommended_reply: $('Finalize & Validate Result').item.json.result.recommended_reply, questions_to_ask: $('Finalize & Validate Result').item.json.result.questions_to_ask, channel: $('Finalize & Validate Result').item.json.lead.channel }) }}"),
          created_by: expr("{{ 'agent:' + $('Finalize & Validate Result').item.json.config.agent }}"),
          ts: expr("{{ $('Finalize & Validate Result').item.json.finished_at }}")
        },
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"task_id","displayName":"task_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"lead_id","displayName":"lead_id","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"task_type","displayName":"task_type","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"title","displayName":"title","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"description","displayName":"description","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"due_at","displayName":"due_at","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"status","displayName":"status","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"assigned_to","displayName":"assigned_to","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"requires_approval","displayName":"requires_approval","required":false,"defaultMatch":false,"display":true,"type":"boolean","canBeUsedToMatch":true},{"id":"approval_reason","displayName":"approval_reason","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"payload_json","displayName":"payload_json","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"created_by","displayName":"created_by","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true},{"id":"ts","displayName":"ts","required":false,"defaultMatch":false,"display":true,"type":"string","canBeUsedToMatch":true}]
      }
    },
    position: [3980, 300]
  },
  output: [{ id: 1, task_id: 'task_x' }]
});

const writeVault = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Write to Vault (Vault Writer)',
    onError: 'continueRegularOutput',
    parameters: {
      mode: 'once',
      source: 'database',
      workflowId: { __rl: true, mode: 'id', value: "tVvSWjOubwBNLi88", cachedResultName: 'CEO Brain — Vault Writer' },
      workflowInputs: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ $('Finalize & Validate Result').item.json.lead.tenant_id }}"),
          lead_id: expr("{{ $('Finalize & Validate Result').item.json.lead.lead_id }}"),
          contact_name: expr("{{ $('Finalize & Validate Result').item.json.lead.contact_name ?? '' }}"),
          company_name: expr("{{ $('Finalize & Validate Result').item.json.lead.company_name ?? $('Finalize & Validate Result').item.json.result.extracted.company_name ?? '' }}"),
          industry: expr("{{ $('Finalize & Validate Result').item.json.lead.industry ?? $('Finalize & Validate Result').item.json.result.extracted.industry ?? '' }}"),
          channel: expr("{{ $('Finalize & Validate Result').item.json.lead.channel }}"),
          lead_source: expr("{{ $('Finalize & Validate Result').item.json.lead.lead_source }}"),
          status: expr("{{ $('Finalize & Validate Result').item.json.status_change.to }}"),
          temperature: expr("{{ $('Finalize & Validate Result').item.json.result.lead_temperature }}"),
          intent: expr("{{ $('Finalize & Validate Result').item.json.result.intent }}"),
          summary: expr("{{ $('Finalize & Validate Result').item.json.result.summary }}"),
          extracted_json: expr("{{ JSON.stringify($('Finalize & Validate Result').item.json.result.extracted) }}"),
          message: expr("{{ $('Finalize & Validate Result').item.json.lead.message ?? '' }}"),
          reply: expr("{{ $('Finalize & Validate Result').item.json.result.recommended_reply ?? '' }}"),
          next_action: expr("{{ $('Finalize & Validate Result').item.json.result.next_action }}"),
          handoffs_json: expr("{{ JSON.stringify($('Finalize & Validate Result').item.json.handoffs ?? []) }}"),
          provider: expr("{{ $('Finalize & Validate Result').item.json.provider }}"),
          execution_id: expr("{{ $('Finalize & Validate Result').item.json.execution_id }}"),
          ts: expr("{{ $('Finalize & Validate Result').item.json.finished_at }}"),
          test_mode: expr("{{ $('Finalize & Validate Result').item.json.lead.test_mode }}")
        },
        matchingColumns: [],
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"lead_id","displayName":"lead_id","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"contact_name","displayName":"contact_name","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"company_name","displayName":"company_name","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"industry","displayName":"industry","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"channel","displayName":"channel","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"lead_source","displayName":"lead_source","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"status","displayName":"status","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"temperature","displayName":"temperature","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"intent","displayName":"intent","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"summary","displayName":"summary","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"extracted_json","displayName":"extracted_json","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"message","displayName":"message","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"reply","displayName":"reply","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"next_action","displayName":"next_action","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"handoffs_json","displayName":"handoffs_json","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"provider","displayName":"provider","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"execution_id","displayName":"execution_id","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"ts","displayName":"ts","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"test_mode","displayName":"test_mode","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"boolean"}],
        attemptToConvertTypes: false,
        convertFieldsToString: true
      },
      options: { waitForSubWorkflow: false }
    },
    position: [4200, 300]
  },
  output: [{ ok: true }]
});

const websiteGate = ifElse({
  version: 2.3,
  config: {
    name: 'Website Requested?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'website', leftValue: expr("{{ $('Finalize & Validate Result').item.json.website_requested }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      }
    },
    position: [4420, 300]
  }
});

const callWebsiteBuilder = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Hand Off to Website Intelligence',
    onError: 'continueRegularOutput',
    parameters: {
      mode: 'once',
      source: 'database',
      workflowId: { __rl: true, mode: 'id', value: "5VWP3tMK3MZysi7w", cachedResultName: "CEO Brain — Website Intelligence" },
      workflowInputs: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ $('Finalize & Validate Result').item.json.lead.tenant_id }}"),
          lead_id: expr("{{ $('Finalize & Validate Result').item.json.lead.lead_id }}"),
          contact_name: expr("{{ $('Finalize & Validate Result').item.json.lead.contact_name ?? '' }}"),
          company_name: expr("{{ $('Finalize & Validate Result').item.json.lead.company_name || $('Finalize & Validate Result').item.json.website_intake.details.business_name || '' }}"),
          industry: expr("{{ $('Finalize & Validate Result').item.json.lead.industry || $('Finalize & Validate Result').item.json.result.extracted.industry || $('Finalize & Validate Result').item.json.website_intake.details.industry || '' }}"),
          email: expr("{{ $('Finalize & Validate Result').item.json.lead.email || $('Finalize & Validate Result').item.json.contact_found.email || '' }}"),
          phone: expr("{{ $('Finalize & Validate Result').item.json.lead.phone || $('Finalize & Validate Result').item.json.contact_found.phone || '' }}"),
          channel: expr("{{ $('Finalize & Validate Result').item.json.lead.channel }}"),
          message: expr("{{ $('Finalize & Validate Result').item.json.lead.message ?? '' }}"),
          conversation_json: expr("{{ JSON.stringify($('Finalize & Validate Result').item.json.lead.conversation_history ?? []) }}"),
          sales_summary: expr("{{ $('Finalize & Validate Result').item.json.result.summary }}"),
          extracted_json: expr("{{ JSON.stringify($('Finalize & Validate Result').item.json.result.extracted) }}"),
          test_mode: expr("{{ $('Finalize & Validate Result').item.json.lead.test_mode }}"),
          notify_email: expr("{{ $('Finalize & Validate Result').item.json.config.notify_email }}"),
          source_execution_id: expr("{{ $('Finalize & Validate Result').item.json.execution_id }}")
        },
        matchingColumns: [],
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"lead_id","displayName":"lead_id","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"contact_name","displayName":"contact_name","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"company_name","displayName":"company_name","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"industry","displayName":"industry","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"email","displayName":"email","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"phone","displayName":"phone","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"channel","displayName":"channel","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"message","displayName":"message","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"conversation_json","displayName":"conversation_json","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"sales_summary","displayName":"sales_summary","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"extracted_json","displayName":"extracted_json","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"test_mode","displayName":"test_mode","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"boolean"},{"id":"notify_email","displayName":"notify_email","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"source_execution_id","displayName":"source_execution_id","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"}],
        attemptToConvertTypes: false,
        convertFieldsToString: true
      },
      options: { waitForSubWorkflow: false }
    },
    position: [4640, 520]
  },
  output: [{ ok: true }]
});

const autoSendGate = ifElse({
  version: 2.3,
  config: {
    name: 'Auto-send Low-risk Reply?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'autosend', leftValue: expr("{{ $('Finalize & Validate Result').item.json.auto_send }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      }
    },
    position: [4860, 300]
  }
});

const sendReplyNow = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Send Reply Now (Outbound Sender)',
    onError: 'continueRegularOutput',
    parameters: {
      mode: 'once',
      source: 'database',
      workflowId: { __rl: true, mode: 'id', value: "SAcnNxG1GWPwn3N7", cachedResultName: 'CEO Brain — Outbound Sender' },
      workflowInputs: {
        mappingMode: 'defineBelow',
        value: {
          tenant_id: expr("{{ $('Finalize & Validate Result').item.json.lead.tenant_id }}"),
          lead_id: expr("{{ $('Finalize & Validate Result').item.json.lead.lead_id }}"),
          message_id: expr("{{ $('Finalize & Validate Result').item.json.message_id }}"),
          channel: expr("{{ $('Finalize & Validate Result').item.json.send_channel }}"),
          to: expr("{{ $('Finalize & Validate Result').item.json.send_to }}"),
          text: expr("{{ $('Finalize & Validate Result').item.json.result.recommended_reply }}"),
          subject: expr("{{ $('Finalize & Validate Result').item.json.send_subject }}"),
          test_mode: expr("{{ $('Finalize & Validate Result').item.json.lead.test_mode }}"),
          actor: expr("{{ 'agent:' + $('Finalize & Validate Result').item.json.config.agent + '@' + $('Finalize & Validate Result').item.json.provider }}")
        },
        matchingColumns: [],
        schema: [{"id":"tenant_id","displayName":"tenant_id","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"lead_id","displayName":"lead_id","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"message_id","displayName":"message_id","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"channel","displayName":"channel","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"to","displayName":"to","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"text","displayName":"text","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"subject","displayName":"subject","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"},{"id":"test_mode","displayName":"test_mode","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"boolean"},{"id":"actor","displayName":"actor","required":false,"defaultMatch":false,"display":true,"canBeUsedToMatch":true,"type":"string"}],
        attemptToConvertTypes: false,
        convertFieldsToString: false
      },
      options: { waitForSubWorkflow: true }
    },
    position: [5080, 160]
  },
  output: [{ sent: true, status: 'sent' }]
});

const needsHuman = ifElse({
  version: 2.3,
  config: {
    name: 'Human Review Needed?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [{ id: 'hr', leftValue: expr("{{ $('Finalize & Validate Result').item.json.approval_needed }}"), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and'
      }
    },
    position: [5300, 300]
  }
});

const notifyOwner = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Notify Owner (Gmail)',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'message',
      operation: 'send',
      sendTo: expr("{{ $('Finalize & Validate Result').item.json.config.notify_email }}"),
      subject: expr("{{ ($('Finalize & Validate Result').item.json.lead.test_mode ? '[TEST] ' : '') + 'CEO Brain approval needed: ' + ($('Finalize & Validate Result').item.json.lead.contact_name ?? 'lead') + ($('Finalize & Validate Result').item.json.lead.company_name ? ' @ ' + $('Finalize & Validate Result').item.json.lead.company_name : '') + ' [' + $('Finalize & Validate Result').item.json.result.lead_status + ']' }}"),
      emailType: 'html',
      message: expr("{{ '<h2>' + $('Finalize & Validate Result').item.json.task.title + '</h2>' + '<p><b>Status:</b> ' + $('Finalize & Validate Result').item.json.status_change.from + ' → ' + $('Finalize & Validate Result').item.json.status_change.to + ' &nbsp; <b>Temperature:</b> ' + $('Finalize & Validate Result').item.json.result.lead_temperature + ' &nbsp; <b>Intent:</b> ' + $('Finalize & Validate Result').item.json.result.intent + '</p>' + '<p><b>Why a human:</b> ' + $('Finalize & Validate Result').item.json.result.escalation_reasons.join(', ') + '</p>' + '<p><b>Summary:</b> ' + $('Finalize & Validate Result').item.json.result.summary + '</p>' + '<p><b>Original message:</b><br>' + ($('Finalize & Validate Result').item.json.lead.message ?? '') + '</p>' + '<p><b>Draft reply (NOT sent):</b><br>' + ($('Finalize & Validate Result').item.json.result.recommended_reply || '(withheld by guardrail)') + '</p>' + '<p><b>Missing:</b> ' + $('Finalize & Validate Result').item.json.result.missing_information.join(', ') + '</p>' + '<p><b>Next action:</b> ' + $('Finalize & Validate Result').item.json.result.next_action + ' &nbsp; <b>Follow up by:</b> ' + ($('Finalize & Validate Result').item.json.result.follow_up_at ?? '-') + '</p>' + ($('Finalize & Validate Result').item.json.result.recommended_reply && $('Finalize & Validate Result').item.json.send_channel ? '<p><a href=\"https://ryan1515.app.n8n.cloud/webhook/ceo-brain/approve?decision=approve&message_id=' + $('Finalize & Validate Result').item.json.message_id + '&lead_id=' + $('Finalize & Validate Result').item.json.lead.lead_id + '\" style=\"background:#0a7d3c;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px\">APPROVE &amp; SEND via ' + $('Finalize & Validate Result').item.json.send_channel + '</a> &nbsp; <a href=\"https://ryan1515.app.n8n.cloud/webhook/ceo-brain/approve?decision=reject&message_id=' + $('Finalize & Validate Result').item.json.message_id + '&lead_id=' + $('Finalize & Validate Result').item.json.lead.lead_id + '\" style=\"background:#999;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px\">Reject</a></p>' : '<p><i>No reply can be sent automatically (no draft or no email/WhatsApp channel). Handle manually.</i></p>') + '<p style=\"color:#888\">lead ' + $('Finalize & Validate Result').item.json.lead.lead_id + ' · run ' + $('Finalize & Validate Result').item.json.run_id + ' · ' + $('Finalize & Validate Result').item.json.provider + '/' + $('Finalize & Validate Result').item.json.model + ' · execution ' + $('Finalize & Validate Result').item.json.execution_id + '</p>' }}"),
      options: { appendAttribution: false, senderName: 'CEO Brain' }
    },
    position: [5540, 200]
  },
  output: [{ id: 'gmail-id' }]
});

const respondResult = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond With Result',
    parameters: {
      respondWith: 'json',
      responseBody: expr("{{ JSON.stringify($('Finalize & Validate Result').first().json.response) }}"),
      options: { responseCode: 200 }
    },
    position: [5780, 300]
  },
  output: [{ ok: true }]
});

const noteIntro = sticky("## CEO Brain — Lead Intake (Phase 1)\nPOST /webhook/ceo-brain/lead with {name, phone, email, company, industry, source, channel, message, conversation_history, test_mode, ai_mode}.\n\nFlow: validate → save lead → log message → AI (Claude) or rule engine → validate JSON + guardrails → update status → agent run + audit + draft reply + task → email owner when approval needed → respond.\n\nSource of truth: repo ryan/ceo-brain (workflows/lead-intake/build.js). Edit there, rebuild, redeploy — do not hand-edit Code nodes.", [leadWebhook, workflowConfig, normalizeLeadNode, isLeadValid], { color: 4 });
const noteAi = sticky("## AI qualification\nThe rule engine always runs first (deterministic baseline). ai_mode=live → the company brain + sales playbook are loaded from the Obsidian vault (GitHub) into the prompt, then Claude (n8n managed Anthropic credential). If the model errors or returns invalid JSON, Finalize falls back to the rule-engine result so the lead is never dropped.\nai_mode=mock → rule engine only (no AI credits).\nGuardrails in \"Finalize & Validate Result\": no prices/guarantees/contracts/refunds in replies, WON/LOST are human-only, proposals need approval.", [rulesEngine, useLiveAi, claudeAgent, finalize], { color: 6 });
const noteHuman = sticky("## Human approval gate\nThe AI only DRAFTS. Nothing is sent to the customer in Phase 1. When human_review_required or a proposal is needed, the owner gets an email and a task with requires_approval=true.", [needsHuman, notifyOwner, respondResult], { color: 3 });

export default workflow('ceo-brain-lead-intake', 'CEO Brain — Lead Intake (Phase 1)')
  .add(leadWebhook)
  .to(workflowConfig)
  .to(normalizeLeadNode)
  .to(isLeadValid
    .onTrue(findExistingLead.to(resolveLead).to(saveLead).to(logInbound).to(rulesEngine).to(useLiveAi
      .onTrue(loadBrain.to(loadPlaybook).to(composePrompt).to(claudeAgent.to(finalize)))
      .onFalse(finalize)))
    .onFalse(respondInvalid))
  .add(claudeAgent.onError(finalize))
  .add(finalize)
  .to(updateLeadStatus)
  .to(logAgentRun)
  .to(logAudit)
  .to(saveDraftReply)
  .to(createTask)
  .to(writeVault)
  .to(websiteGate
    .onTrue(callWebsiteBuilder.to(autoSendGate))
    .onFalse(autoSendGate))
  .add(autoSendGate
    .onTrue(sendReplyNow.to(needsHuman))
    .onFalse(needsHuman))
  .add(needsHuman
    .onTrue(notifyOwner.to(respondResult))
    .onFalse(respondResult))
  .add(noteIntro)
  .add(noteAi)
  .add(noteHuman)
  .group('1. Intake & validation', [workflowConfig, normalizeLeadNode, isLeadValid], { description: 'Reads the webhook body, normalizes contact fields, and gates on validity (invalid payloads get an HTTP 400 response).' })
  .group('2. Persist lead + inbound message', [findExistingLead, resolveLead, saveLead, logInbound], { description: 'Looks up the lead by dedupe key, merges known contact facts, upserts the lead row and logs the inbound message.' })
  .group('3. AI qualification', [rulesEngine, useLiveAi, loadBrain, loadPlaybook, composePrompt, claudeAgent, finalize], { description: 'Rule baseline; live: brain + sales playbook loaded from the vault into the prompt, Claude classifies; validation, fallback, guardrails.' })
  .group('4. Persist, deliver & notify', [updateLeadStatus, logAgentRun, logAudit, saveDraftReply, createTask, writeVault, websiteGate, callWebsiteBuilder, autoSendGate, sendReplyNow, needsHuman, notifyOwner, respondResult], { description: 'Status, run, audit, draft, task; vault write; website hand-off; auto-send low-risk replies; approve-link email; respond.' });
