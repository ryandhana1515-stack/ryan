#!/usr/bin/env node
// Generates the Code nodes of "CEO Brain — WhatsApp Inbound" (3IhIJ5IYsB7wQQSg) from agents/whatsapp-inbound/inbound.js.
// The other nodes of that workflow (webhooks, data-table reads/writes, Outbound Sender call) are plain n8n nodes:
//   Extract WhatsApp Message → Is a Text Message? ─ yes → Prepare Message
//                                                 └ no → Is a Voice Message? → Get Voice Note Link → Download Voice Note →
//                                                        Name Voice File → Transcribe Voice Note (OpenAI, language "en":
//                                                        auto-detect turned English voice notes into Malay, 2026-09-29) → Prepare Message
//   Prepare Message → Find Lead by Phone (newest row first) → Check New Chat →
//   New Chat? ─ yes → Save New Chat Lead (ceo_leads insert) → Confirm New Chat (Outbound Sender)
//             └ no  → Get Recent Conversation → Build Lead Payload → POST to Lead Intake
//
//   node workflows/whatsapp-inbound/build.js   -> dist/code-nodes/{prepare-message,name-voice-file,check-new-chat,build-lead-payload}.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(__dirname, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function inline(file) {
  return read(file).replace(/\/\/ ---- Node module wrapper[\s\S]*$/m, '').split('\n').filter((l) => !/^\s*module\.exports\s*=/.test(l) && !/^\s*\/\//.test(l) && l.trim() !== '').join('\n');
}
const src = inline('agents/whatsapp-inbound/inbound.js');

const codePrepare = `${src}
// ---- n8n glue ----
// Text branch: the input is the extracted message. Voice branch: the input is the transcription ({ text }).
const wa = $('Extract WhatsApp Message').first().json;
const inp = ($input.first() && $input.first().json) || {};
return [{ json: waMessageFrom(wa, inp.text) }];
`;

// WhatsApp media links carry no file name; the transcriber needs one with an audio extension.
const codeNameVoice = `return $input.all().map((item) => {
  if (item.binary && item.binary.data) {
    item.binary.data.fileName = 'voice-note.ogg';
    item.binary.data.fileExtension = 'ogg';
    if (!/^audio\\//.test(String(item.binary.data.mimeType || ''))) item.binary.data.mimeType = 'audio/ogg';
  }
  return item;
});
`;

const codeCheckNewChat = `${src}
// ---- n8n glue ----
const wa = $('Prepare Message').first().json;
const leadRow = ($('Find Lead by Phone').first() && $('Find Lead by Phone').first().json) || {};
const newChat = waIsNewChat(wa.text);
return [{ json: { new_chat: newChat, phone: wa.phone, new_lead: newChat ? waNewChatLead({ tenant_id: leadRow.tenant_id, phone: wa.phone, name: wa.name }) : null, reply: WA_NEW_CHAT_REPLY } }];
`;

const codeBuildPayload = `${src}
// ---- n8n glue ----
const wa = $('Prepare Message').first().json;
const leadRow = ($('Find Lead by Phone').first() && $('Find Lead by Phone').first().json) || {};
const rows = $input.all().map((i) => i.json);
return [{ json: waBuildPayload({ wa, leadRow, rows }) }];
`;

fs.mkdirSync(path.join(DIST, 'code-nodes'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'code-nodes', 'prepare-message.js'), codePrepare);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'name-voice-file.js'), codeNameVoice);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'check-new-chat.js'), codeCheckNewChat);
fs.writeFileSync(path.join(DIST, 'code-nodes', 'build-lead-payload.js'), codeBuildPayload);
console.log('whatsapp-inbound: 4 code nodes written to ' + path.relative(ROOT, DIST));
