// Session → map id + test flag. Test sessions (Ryan's console / dashboard) write under Discovery/Test.
const inp = $input.first().json || {};
const sessionId = String(inp.sessionId || ('anon' + Date.now().toString(36)));
const short = sessionId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 28) || 'anon';
const text = String(inp.chatInput || '').trim();
const testMode = /^(dash_|test_|mcp)/i.test(sessionId) || /^dash/i.test(short) || inp.test_mode === true;
return [{ json: { session_id: sessionId, map_id: 'map_' + short, text, test_mode: testMode, tenant_id: 'fusiontech', started_at: new Date().toISOString() } }];
