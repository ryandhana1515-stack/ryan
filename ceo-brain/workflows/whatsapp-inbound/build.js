#!/usr/bin/env node
// Generates the Code nodes of "CEO Brain — WhatsApp Inbound" (3IhIJ5IYsB7wQQSg) from agents/whatsapp-inbound/inbound.js.
// The other nodes of that workflow (webhooks, data-table reads/writes, Outbound Sender call) are plain n8n nodes:
//   Extract WhatsApp Message → Is a Text Message? → Find Lead by Phone (newest row first) → Check New Chat →
//   New Chat? ─ yes → Save New Chat Lead (ceo_leads insert) → Confirm New Chat (Outbound Sender)
//             └ no  → Get Recent Conversation → Build Lead Payload → POST to Lead Intake
//
//   node workflows/whatsapp-inbound/build.js   -> dist/code-nodes/check-new-chat.js + build-lead-payload.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function inline(file) {
  return read(file).replace(/\/\/ ---- Node module wrapper[\s\S]*$/m, '').split('\n').filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*\/\//.test(l) && l.trim() !== '').join('\n');
}
const src = inline('agents/whatsapp-inbound/inbound.js');

const codeCheckNewChat = `${src}
// ---- n8n glue ----
const wa = $('Extract WhatsApp Message').first().json;
const leadRow = ($('Find Lead by Phone').first() && $('Find Lead by Phone').first().json) || {};
const newChat = waIsNewChat(wa.text);
return [{ json: { new_chat: newChat, phone: wa.phone, new_lead: newChat ? waNewChatLead({ tenant_id: leadRow.tenant_id, phone: wa.phone, name: wa.name }) : null, reply: WA_NEW_CHAT_REPLY } }];
`;

const codeBuildPayload = `${src}
// ---- n8n glue ----
const wa = $('Extract WhatsApp Message').first().json;
const leadRow = ($('Find Lead by Phone').first() && $('Find Lead by Phone').first().json) || {};
const rows = $input.all().map((i) => i.json);
return [{ json: waBuildPayload({ wa, leadRow, rows }) }];
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'code-nodes', 'check-new-chat.js'), codeCheckNewChat);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'build-lead-payload.js'), codeBuildPayload);
console.log('whatsapp-inbound: 2 code nodes written to ' + path.relative(ROOT, DIST));
