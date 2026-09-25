// CEO Brain — John Chat Console. A hosted n8n chat page where Ryan (or anyone with the link) can
// talk to John exactly as a prospect would. Every message goes through the real Lead Intake
// workflow (POST /webhook/ceo-brain/lead) in test_mode, so John's replies, statuses, approval
// emails and Website Builder hand-offs are real, but nothing is ever sent to a customer.
// Conversation memory: previous turns are loaded from the ceo_messages table by lead id.
import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

const LEAD_WEBHOOK = 'https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead';
const MESSAGES_TABLE = { __rl: true, mode: 'id', value: 'eImH5AdVZEOW0t31', cachedResultName: 'ceo_messages' };
const TASKS_TABLE = { __rl: true, mode: 'id', value: 'sPnRGXe4VYDJLJHr', cachedResultName: 'ceo_tasks' };

const chat = trigger({
  type: '@n8n/n8n-nodes-langchain.chatTrigger',
  version: 1.5,
  config: {
    name: 'John Chat (hosted)',
    parameters: {
      public: true,
      mode: 'hostedChat',
      authentication: 'none',
      initialMessages: "Hi, I'm John from FusionTech AI. Tell me about your business and what you'd like to automate, or the website you have in mind.",
      options: {
        title: 'John — FusionTech AI',
        subtitle: 'AI sales consultant · test console (nothing is sent to real customers)',
        inputPlaceholder: 'Type as if you were a prospect…',
        responseMode: 'lastNode',
        loadPreviousSession: 'notSupported',
        showWelcomeScreen: false
      }
    },
    position: [0, 300]
  },
  output: [{ sessionId: 'abc123', action: 'sendMessage', chatInput: 'Hi, I run a logistics company and want a website' }]
});

const buildPayload = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Lead Payload',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const inp = $input.first().json || {};
const sessionId = String(inp.sessionId || ('anon' + Date.now().toString(36)));
const short = sessionId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 24) || 'anon';
const text = String(inp.chatInput || '').trim();
// Visitors on the public "Chat with John" page / FusionTech.com.sg widget are REAL leads (metadata.source
// = website_widget); the hosted console and Training Room sessions stay in test mode.
const realVisitor = !!(inp.metadata && inp.metadata.source === 'website_widget');
return [{ json: {
  session_id: sessionId,
  real_visitor: realVisitor,
  lead_id: 'lead_chat_' + short,
  text,
  payload: {
    tenant_id: 'fusiontech',
    lead_id: 'lead_chat_' + short,
    external_ids: { chat_session: sessionId },
    source: 'website',
    channel: 'web_chat',
    message: text,
    test_mode: !realVisitor,
    ai_mode: 'live'
  }
} }];`
    },
    position: [220, 300]
  },
  output: [{ session_id: 'abc123', lead_id: 'lead_chat_abc123', text: 'Hi', payload: { tenant_id: 'fusiontech', lead_id: 'lead_chat_abc123', message: 'Hi', test_mode: true } }]
});

const loadHistory = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Load Previous Turns',
    alwaysOutputData: true,
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: MESSAGES_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'lead_id', condition: 'eq', keyValue: expr("{{ $('Build Lead Payload').item.json.lead_id }}") }] },
      returnAll: true,
      orderBy: true,
      orderByColumn: 'ts',
      orderByDirection: 'ASC'
    },
    position: [440, 300]
  },
  output: [{ id: 1, lead_id: 'lead_chat_abc123', direction: 'inbound', content: 'Hi', status: 'received', ts: '2026-01-01T00:00:00.000Z' }]
});

const composeRequest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Compose Lead Request',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const base = $('Build Lead Payload').first().json;
const rows = $input.all().map((i) => i.json).filter((r) => r && r.content && r.lead_id === base.lead_id);
rows.sort((a, b) => String(a.ts || '').localeCompare(String(b.ts || '')));
const history = rows.slice(-20).map((r) => ({ role: r.direction === 'outbound' ? 'agent' : 'customer', content: String(r.content).slice(0, 4000), ts: r.ts || null }));
const payload = Object.assign({}, base.payload, { conversation_history: history });
return [{ json: { payload, turns_loaded: history.length } }];`
    },
    position: [660, 300]
  },
  output: [{ payload: { tenant_id: 'fusiontech', message: 'Hi', conversation_history: [] }, turns_loaded: 0 }]
});

const askJohn = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Ask John (Lead Intake)',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: LEAD_WEBHOOK,
      authentication: 'none',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.payload) }}'),
      options: { timeout: 120000, response: { response: { responseFormat: 'json', neverError: true } } }
    },
    position: [880, 300]
  },
  output: [{ ok: true, lead_id: 'lead_chat_abc123', result: { lead_status: 'QUALIFYING', lead_temperature: 'warm', next_action: 'ask_qualifying_questions', recommended_reply: 'Thanks…', human_review_required: false, escalation_reasons: [] }, delivery: { mode: 'test_mode_no_send' }, handoffs: [], ai: { provider: 'anthropic', fallback_used: false } }]
});

const loadWebsiteTask = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Load Website Task',
    alwaysOutputData: true,
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: TASKS_TABLE,
      matchType: 'allConditions',
      filters: { conditions: [
        { keyName: 'lead_id', condition: 'eq', keyValue: expr("{{ $('Build Lead Payload').item.json.lead_id }}") },
        { keyName: 'task_type', condition: 'eq', keyValue: 'website_build' }
      ] },
      returnAll: false,
      limit: 1
    },
    position: [1100, 300]
  },
  output: [{ id: 1, lead_id: 'lead_chat_abc123', task_type: 'website_build', status: 'built', payload_json: '{"preview_url":"https://id-preview--x.lovable.app"}' }]
});

const formatReply = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Format John Reply',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const r = $('Ask John (Lead Intake)').first().json || {};
const base = $('Build Lead Payload').first().json;
const taskRows = $input.all().map((i) => i.json).filter((t) => t && t.task_type === 'website_build' && t.lead_id === base.lead_id);
let mockup = '';
if (taskRows.length) {
  const t = taskRows[0];
  let payload = {}; try { payload = JSON.parse(t.payload_json || '{}'); } catch (e) { payload = {}; }
  if (t.status === 'built' && payload.preview_url) mockup = '\\n\\nYour mock-up is ready: ' + payload.preview_url + '\\nIt is a first draft to react to; tell me what you would change.';
  else if (t.status === 'building') mockup = '\\n\\n(Your mock-up is being built right now; I will send the link as soon as it is ready.)';
}
if (!r.ok) {
  const why = Array.isArray(r.errors) ? r.errors.join(', ') : (r.error && (r.error.message || r.error)) || 'no response';
  return [{ json: { output: 'John could not process that message (' + String(why) + '). Please try again.' } }];
}
const res = r.result || {};
let text = String(res.recommended_reply || '').trim();
if (!text) {
  if (res.intent === 'spam') text = '(John classified this as spam and stays silent.)';
  else text = '(John held this for Ryan instead of replying: ' + ((res.escalation_reasons || []).join(', ') || 'human review') + '. Ryan gets an approval email.)';
}
const bits = [res.lead_status, res.lead_temperature, res.next_action];
if (r.delivery && r.delivery.mode) bits.push(r.delivery.mode);
if (Array.isArray(r.handoffs) && r.handoffs.length) bits.push('handoff → ' + r.handoffs.join(', '));
if (r.ai) bits.push((r.ai.provider || '') + (r.ai.fallback_used ? ' fallback' : ''));
const meta = base.real_visitor ? '' : '\\n\\n— console · ' + bits.filter(Boolean).join(' · ');
return [{ json: { output: text + mockup + meta } }];`
    },
    position: [1320, 300]
  },
  output: [{ output: 'Thanks…\n\n— console · QUALIFYING · warm · ask_qualifying_questions' }]
});

const note = sticky('## CEO Brain — John Chat Console\nHosted chat page to test John as a prospect. Each message → real Lead Intake (test_mode, nothing sent to customers) → John\'s reply + a one-line console status. Previous turns are reloaded from ceo_messages by lead id, so multi-turn conversations work.\n\nWebsite / mock-up requests: John collects the details, the Website Builder + Build Runner build the mock-up automatically, and the preview link shows up in this chat and goes to the customer\'s WhatsApp/email. Visitors from the public page (metadata.source = website_widget) are real leads.\n\nSource of truth: repo ryan/ceo-brain/workflows/john-chat-console/workflow.sdk.ts', [chat, buildPayload, loadHistory], { color: 4 });

export default workflow('ceo-brain-john-chat-console', 'CEO Brain — John Chat Console')
  .add(chat)
  .to(buildPayload)
  .to(loadHistory)
  .to(composeRequest)
  .to(askJohn)
  .to(loadWebsiteTask)
  .to(formatReply)
  .add(note)
  .group('1. Session & memory', [buildPayload, loadHistory, composeRequest], { description: 'Builds the test lead payload from the chat session and reloads previous turns from ceo_messages.' })
  .group('2. Ask John', [askJohn, loadWebsiteTask, formatReply], { description: 'Calls the live Lead Intake webhook, checks whether this lead\'s mock-up is built, and formats John\'s reply (+ console status line in test sessions).' });
