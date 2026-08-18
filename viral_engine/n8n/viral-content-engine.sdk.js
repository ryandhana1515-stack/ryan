import { workflow, node, trigger, sticky, newCredential, ifElse, switchCase, expr } from '@n8n/workflow-sdk';

const PROMPT_A =
  'You are a short-form video format analyst. You will receive a transcript from a high-performing video. ' +
  'Your job is to extract the STRUCTURAL FORMULA only - never the specific wording, claims, or examples.\n\n' +
  'Output valid JSON only. No preamble, no markdown fences.\n\n' +
  '{\n' +
  '  "topic_category": "",\n' +
  '  "hook_type": "one of: contrarian_claim | curiosity_gap | direct_promise | pattern_interrupt | problem_agitation | result_reveal",\n' +
  '  "hook_word_count": 0,\n' +
  '  "hook_mechanism": "describe WHY it stops the scroll, in structural terms",\n' +
  '  "beat_map": [\n' +
  '    {"beat": 1, "function": "hook", "duration_sec": 0, "purpose": ""},\n' +
  '    {"beat": 2, "function": "context|proof|demo|objection|payoff", "duration_sec": 0, "purpose": ""}\n' +
  '  ],\n' +
  '  "pacing": {"total_sec": 0, "words_per_min": 0, "avg_beat_sec": 0},\n' +
  '  "retention_devices": ["open_loop", "countdown", "visual_reveal"],\n' +
  '  "cta_type": "",\n' +
  '  "cta_position_pct": 0,\n' +
  '  "tone": "",\n' +
  '  "why_it_worked": "2 sentences, structural analysis only",\n' +
  '  "reusable_template": "The abstract skeleton, with [PLACEHOLDERS] where content goes"\n' +
  '}\n\n' +
  'CONSTRAINT: Do not reproduce sentences from the source transcript. Describe function, not content.\n\n' +
  'TRANSCRIPT:\n';

const PROMPT_B_HEAD =
  'You are the scriptwriter for a Singapore-based founder who builds real AI automation systems for SMEs - ' +
  'ERP/CRM, property tech, n8n workflows. He is not a theorist. He ships. His edge is that he runs actual ' +
  'businesses and can show real builds, not recycled AI news.\n\n' +
  'INPUT:\n- format_dna: ';

const PROMPT_B_TAIL =
  '\n\nTASK: Write an ORIGINAL script that follows the structural formula in format_dna but contains entirely ' +
  'new content drawn from my_topic and my_proof_asset.\n\n' +
  'RULES\n' +
  '1. Hook must land in under 3 seconds and under 12 words.\n' +
  '2. Match the beat_map functions and durations, plus or minus 15 percent.\n' +
  '3. Every claim must trace to my_proof_asset. No invented statistics.\n' +
  '4. Spoken register - short sentences, contractions, no corporate filler.\n' +
  '5. Never use: "in today\'s video", "let\'s dive in", "game-changer", "revolutionize", "unlock the power of".\n' +
  '6. One idea per video. Resist adding a second.\n' +
  '7. CTA at the position specified in format_dna. Soft CTA on value posts, hard CTA only 1 in 5 posts.\n' +
  '8. Target length: 45-75 seconds spoken at 165 wpm.\n\n' +
  'OUTPUT JSON only. No preamble, no markdown fences:\n' +
  '{\n' +
  '  "hook": "",\n' +
  '  "script_lines": [\n' +
  '    {"id": 1, "text": "", "duration_sec": 0, "emphasis": "high|normal"}\n' +
  '  ],\n' +
  '  "cta": "",\n' +
  '  "on_screen_text": ["max 5 short overlays"],\n' +
  '  "caption": "with 3-5 hashtags, no hashtag spam",\n' +
  '  "thumbnail_concept": "",\n' +
  '  "estimated_runtime_sec": 0\n' +
  '}';

const PROMPT_C_HEAD =
  'You are a B-roll director. For each script line, specify the visual.\n\n' +
  'INPUT script_lines JSON:\n';

const PROMPT_C_TAIL =
  '\n\nOutput valid JSON only - an array with one object per script line. No preamble, no markdown fences:\n\n' +
  '[\n' +
  '  {\n' +
  '    "line_id": 0,\n' +
  '    "primary_keyword": "3-5 words, literal and searchable on stock sites",\n' +
  '    "fallback_keyword": "broader alternative if primary returns nothing",\n' +
  '    "source_class": "generic_business | tech_abstract | cinematic_hero | impossible | screen_recording",\n' +
  '    "shot_type": "wide | medium | closeup | macro | drone | overhead | POV",\n' +
  '    "motion": "static | slow_push | slow_pull | pan | handheld",\n' +
  '    "duration_sec": 0,\n' +
  '    "kling_prompt": "ONLY if source_class is impossible - full cinematic prompt incl. lighting, lens, camera move, mood"\n' +
  '  }\n' +
  ']\n\n' +
  'RULES\n' +
  '- Never repeat the same primary_keyword twice in one video.\n' +
  '- Alternate shot_type between consecutive lines. Never two wides in a row.\n' +
  '- Visual must be metaphorically or literally tied to the line. No random stock-office-people filler.\n' +
  '- Total B-roll duration must equal total script duration.\n' +
  '- Keep one entry per script line so voiceover pacing stays aligned.';

const PARSE_JSON_HELPER =
  'function extractText(j) {\n' +
  '  if (typeof j.response === "string" && j.response.length) return j.response;\n' +
  '  if (typeof j.text === "string" && j.text.length) return j.text;\n' +
  '  if (Array.isArray(j.content)) return j.content.filter(b => b.type === "text").map(b => b.text).join("");\n' +
  '  if (j.message && Array.isArray(j.message.content)) return j.message.content.filter(b => b.type === "text").map(b => b.text).join("");\n' +
  '  if (typeof j.content === "string") return j.content;\n' +
  '  throw new Error("No text found in model response: " + JSON.stringify(j).slice(0, 300));\n' +
  '}\n' +
  'function parseModelJson(raw) {\n' +
  '  let t = raw.trim();\n' +
  '  t = t.replace(/^```[a-z]*\\n?/, "").replace(/\\n?```$/, "").trim();\n' +
  '  const start = Math.min(...[t.indexOf("{"), t.indexOf("[")].filter(i => i >= 0));\n' +
  '  if (isFinite(start) && start > 0) t = t.slice(start);\n' +
  '  return JSON.parse(t);\n' +
  '}\n';

const referenceIntake = trigger({
  type: 'n8n-nodes-base.formTrigger',
  version: 2.6,
  config: {
    name: 'Reference Intake',
    position: [0, 300],
    parameters: {
      formTitle: 'Viral Content Engine',
      formDescription: 'Paste a competitor video URL and your angle. The engine does the rest.',
      formFields: {
        values: [
          { fieldLabel: 'reference_url', fieldType: 'text', requiredField: true, placeholder: 'https://www.tiktok.com/@creator/video/123' },
          { fieldLabel: 'my_topic', fieldType: 'textarea', requiredField: true, placeholder: 'The topic for YOUR version of this format' },
          { fieldLabel: 'my_proof_asset', fieldType: 'textarea', requiredField: true, placeholder: 'The real build/result/screenshot you can show' }
        ]
      }
    }
  },
  output: [{ reference_url: 'https://www.tiktok.com/@x/video/123', my_topic: 'n8n lead capture automation', my_proof_asset: 'screen recording of live workflow' }]
});

const apifyDownload = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Apify Download Reference',
    position: [220, 300],
    parameters: {
      method: 'POST',
      url: 'https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpQueryAuth',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify({ postURLs: [$json.reference_url], shouldDownloadVideos: true, resultsPerPage: 1 }) }}'),
      options: { timeout: 300000 }
    },
    credentials: { httpQueryAuth: newCredential('Apify Token (query param name: token)') }
  },
  output: [{ videoMeta: { downloadAddr: 'https://cdn.example.com/video.mp4' }, playCount: 100000 }]
});

const fetchMp4 = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch Reference MP4',
    position: [440, 300],
    parameters: {
      method: 'GET',
      url: expr('{{ $json.videoMeta?.downloadAddr || $json.mediaUrls?.[0] || $json.videoUrl }}'),
      options: { timeout: 300000, response: { response: { responseFormat: 'file' } } }
    }
  },
  output: [{ data: 'binary' }]
});

const whisperTranscribe = node({
  type: '@n8n/n8n-nodes-langchain.openAi',
  version: 2.3,
  config: {
    name: 'Whisper Transcribe',
    position: [660, 300],
    parameters: {
      resource: 'audio',
      operation: 'transcribe',
      binaryPropertyName: 'data',
      options: {}
    },
    credentials: { openAiApi: newCredential('OpenAI') }
  },
  output: [{ text: 'Full transcript of the reference video.' }]
});

const agentA = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'Agent A Deconstruct',
    position: [880, 300],
    parameters: {
      resource: 'text',
      operation: 'message',
      modelId: { __rl: true, mode: 'id', value: 'claude-sonnet-4-6' },
      messages: { values: [{ role: 'user', content: expr(PROMPT_A + '{{ $json.text }}') }] },
      simplify: true,
      options: { maxTokens: 8000, includeMergedResponse: true }
    },
    credentials: { anthropicApi: newCredential('Anthropic') }
  },
  output: [{ response: '{"hook_type": "curiosity_gap", "beat_map": []}' }]
});

const parseDna = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Format DNA',
    position: [1100, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        PARSE_JSON_HELPER +
        'const dna = parseModelJson(extractText($input.first().json));\n' +
        'if (!dna.hook_type || !dna.beat_map) throw new Error("format_dna missing hook_type or beat_map");\n' +
        'return [{ json: { format_dna: dna } }];'
    }
  },
  output: [{ format_dna: { hook_type: 'curiosity_gap', beat_map: [], pacing: { total_sec: 45 } } }]
});

const agentB = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'Agent B Script',
    position: [1320, 300],
    parameters: {
      resource: 'text',
      operation: 'message',
      modelId: { __rl: true, mode: 'id', value: 'claude-sonnet-4-6' },
      messages: {
        values: [{
          role: 'user',
          content: expr(
            PROMPT_B_HEAD +
            '{{ JSON.stringify($("Parse Format DNA").first().json.format_dna) }}' +
            '\n- my_topic: {{ $("Reference Intake").first().json.my_topic }}' +
            '\n- my_proof_asset: {{ $("Reference Intake").first().json.my_proof_asset }}' +
            PROMPT_B_TAIL
          )
        }]
      },
      simplify: true,
      options: { maxTokens: 8000, includeMergedResponse: true }
    },
    credentials: { anthropicApi: newCredential('Anthropic') }
  },
  output: [{ response: '{"hook": "...", "script_lines": []}' }]
});

const parseScript = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Script',
    position: [1540, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        PARSE_JSON_HELPER +
        'const script = parseModelJson(extractText($input.first().json));\n' +
        'if (!script.hook || !Array.isArray(script.script_lines) || !script.script_lines.length) throw new Error("script missing hook or script_lines");\n' +
        'return [{ json: { script } }];'
    }
  },
  output: [{ script: { hook: 'Your CRM is lying to you.', script_lines: [{ id: 1, text: 'Line one', duration_sec: 3 }], cta: 'Follow for the build.', caption: 'caption #ai', estimated_runtime_sec: 45 } }]
});

const approvalGate = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Approval Gate Email',
    position: [1760, 300],
    parameters: {
      resource: 'message',
      operation: 'sendAndWait',
      sendTo: 'ryandhana1515@gmail.com',
      subject: expr('Approve script: {{ $("Reference Intake").first().json.my_topic }}'),
      message: expr(
        'NEW SCRIPT READY FOR APPROVAL\n\n' +
        'HOOK: {{ $json.script.hook }}\n\n' +
        'SCRIPT:\n{{ $json.script.script_lines.map(l => l.text).join("\\n") }}\n\n' +
        'CTA: {{ $json.script.cta }}\n\n' +
        'CAPTION: {{ $json.script.caption }}\n\n' +
        'RUNTIME: ~{{ $json.script.estimated_runtime_sec }}s\n\n' +
        'Approve to render and schedule. Reject to stop this run.'
      ),
      responseType: 'approval',
      approvalOptions: { values: { approvalType: 'double', approveLabel: 'Approve', disapproveLabel: 'Reject' } },
      options: {
        appendAttribution: false,
        limitWaitTime: { values: { limitType: 'afterTimeInterval', resumeAmount: 24, resumeUnit: 'hours' } }
      }
    },
    credentials: { gmailOAuth2: { id: '1RO2TgsvJz0fwqQp', name: 'Gmail account' } }
  },
  output: [{ data: { approved: true } }]
});

const isApproved = ifElse({
  version: 2.3,
  config: {
    name: 'Approved',
    position: [1980, 300],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        combinator: 'and',
        conditions: [{ leftValue: expr('{{ $json.data.approved }}'), operator: { type: 'boolean', operation: 'equals' }, rightValue: true }]
      },
      looseTypeValidation: true
    }
  }
});

const logRejected = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Rejected',
    position: [2200, 520],
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: '2vKueBr6IhgMXeZf', cachedResultName: 'viral_engine_runs' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          created: expr('{{ $now.toISO() }}'),
          topic: expr('{{ $("Reference Intake").first().json.my_topic }}'),
          hook: expr('{{ $("Parse Script").first().json.script.hook }}'),
          hook_type: expr('{{ $("Parse Format DNA").first().json.format_dna.hook_type }}'),
          status: 'rejected',
          video_url: '',
          caption: expr('{{ $("Parse Script").first().json.script.caption }}')
        },
        schema: [
          { id: 'created', displayName: 'created', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'topic', displayName: 'topic', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'hook', displayName: 'hook', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'hook_type', displayName: 'hook_type', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'video_url', displayName: 'video_url', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'caption', displayName: 'caption', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    }
  },
  output: [{ id: 1, createdAt: '2026-08-06' }]
});

const agentC = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'Agent C Broll',
    position: [2200, 140],
    parameters: {
      resource: 'text',
      operation: 'message',
      modelId: { __rl: true, mode: 'id', value: 'claude-sonnet-4-6' },
      messages: {
        values: [{
          role: 'user',
          content: expr(PROMPT_C_HEAD + '{{ JSON.stringify($("Parse Script").first().json.script.script_lines) }}' + PROMPT_C_TAIL)
        }]
      },
      simplify: true,
      options: { maxTokens: 8000, includeMergedResponse: true }
    },
    credentials: { anthropicApi: newCredential('Anthropic') }
  },
  output: [{ response: '[{"line_id": 1, "primary_keyword": "office laptop typing", "source_class": "generic_business", "duration_sec": 3}]' }]
});

const splitBroll = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Split Broll Map',
    position: [2420, 140],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        PARSE_JSON_HELPER +
        'const map = parseModelJson(extractText($input.first().json));\n' +
        'if (!Array.isArray(map) || !map.length) throw new Error("broll map is not a non-empty array");\n' +
        'const script = $("Parse Script").first().json.script;\n' +
        'const lineText = {};\n' +
        'for (const l of script.script_lines) lineText[l.id] = l.text;\n' +
        'const seen = new Set();\n' +
        'const items = map.map((e, i) => {\n' +
        '  const first = !seen.has(e.line_id);\n' +
        '  seen.add(e.line_id);\n' +
        '  return { json: Object.assign({}, e, { idx: i, voice_text: first ? (lineText[e.line_id] || "") : "" }) };\n' +
        '});\n' +
        'if (script.cta) {\n' +
        '  const last = items[items.length - 1];\n' +
        '  last.json.voice_text = (last.json.voice_text ? last.json.voice_text + " " : "") + script.cta;\n' +
        '}\n' +
        'return items;'
    }
  },
  output: [{ idx: 0, line_id: 1, primary_keyword: 'office laptop typing', source_class: 'generic_business', duration_sec: 3, voice_text: 'Line one' }]
});

const routeSource = switchCase({
  version: 3.4,
  config: {
    name: 'Route Broll Source',
    position: [2640, 140],
    parameters: {
      mode: 'rules',
      rules: {
        values: [
          {
            renameOutput: true,
            outputKey: 'stock',
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              combinator: 'or',
              conditions: [
                { leftValue: expr('{{ $json.source_class }}'), operator: { type: 'string', operation: 'equals' }, rightValue: 'generic_business' },
                { leftValue: expr('{{ $json.source_class }}'), operator: { type: 'string', operation: 'equals' }, rightValue: 'tech_abstract' },
                { leftValue: expr('{{ $json.source_class }}'), operator: { type: 'string', operation: 'equals' }, rightValue: 'cinematic_hero' }
              ]
            }
          },
          {
            renameOutput: true,
            outputKey: 'manual_or_kling',
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              combinator: 'or',
              conditions: [
                { leftValue: expr('{{ $json.source_class }}'), operator: { type: 'string', operation: 'equals' }, rightValue: 'impossible' },
                { leftValue: expr('{{ $json.source_class }}'), operator: { type: 'string', operation: 'equals' }, rightValue: 'screen_recording' }
              ]
            }
          }
        ]
      },
      options: { fallbackOutput: 'none', looseTypeValidation: true }
    }
  }
});

const pexelsSearch = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Pexels Search',
    position: [2860, 40],
    onError: 'continueRegularOutput',
    parameters: {
      method: 'GET',
      url: 'https://api.pexels.com/videos/search',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendQuery: true,
      specifyQuery: 'keypair',
      queryParameters: {
        parameters: [
          { name: 'query', value: expr('{{ $json.primary_keyword }}') },
          { name: 'orientation', value: 'portrait' },
          { name: 'per_page', value: '3' }
        ]
      },
      options: { timeout: 60000 }
    },
    credentials: { httpHeaderAuth: newCredential('Pexels API Key (header name: Authorization)') }
  },
  output: [{ videos: [{ video_files: [{ height: 1920, link: 'https://player.pexels.com/clip.mp4' }] }] }]
});

const normalizeClips = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Normalize Stock Clips',
    position: [3080, 40],
    parameters: {
      mode: 'runOnceForEachItem',
      language: 'javaScript',
      jsCode:
        'const entry = $("Split Broll Map").item.json;\n' +
        'const r = $json;\n' +
        'let url = null;\n' +
        'for (const v of (r.videos || [])) {\n' +
        '  const files = (v.video_files || []).slice().sort((a, b) => (b.height || 0) - (a.height || 0));\n' +
        '  const pick = files.find(f => (f.height || 0) >= 1080 && (f.height || 0) <= 2560) || files[0];\n' +
        '  if (pick && pick.link) { url = pick.link; break; }\n' +
        '}\n' +
        'return { json: { idx: entry.idx, line_id: entry.line_id, duration_sec: entry.duration_sec, voice_text: entry.voice_text, keyword: entry.primary_keyword, url } };'
    }
  },
  output: [{ idx: 0, line_id: 1, duration_sec: 3, voice_text: 'Line one', keyword: 'office laptop typing', url: 'https://player.pexels.com/clip.mp4' }]
});

const queueManual = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Queue Kling And Manual Clips',
    position: [2860, 320],
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: 'j0ZHE50NyH2reQ16', cachedResultName: 'kling_queue' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          created: expr('{{ $now.toISO() }}'),
          line_id: expr('{{ $json.line_id }}'),
          source_class: expr('{{ $json.source_class }}'),
          keyword: expr('{{ $json.primary_keyword }}'),
          prompt: expr('{{ $json.kling_prompt || $json.primary_keyword }}'),
          status: 'pending'
        },
        schema: [
          { id: 'created', displayName: 'created', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'line_id', displayName: 'line_id', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: true },
          { id: 'source_class', displayName: 'source_class', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'keyword', displayName: 'keyword', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'prompt', displayName: 'prompt', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    }
  },
  output: [{ id: 1, createdAt: '2026-08-06' }]
});

const assembleMovie = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Assemble Movie',
    position: [3300, 40],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        'const entries = $("Split Broll Map").all().map(i => i.json);\n' +
        'const stock = {};\n' +
        'try { for (const i of $("Normalize Stock Clips").all()) stock[i.json.idx] = i.json; } catch (e) {}\n' +
        'const scenes = entries.map(e => {\n' +
        '  const s = stock[e.idx];\n' +
        '  const els = [];\n' +
        '  if (s && s.url) els.push({ type: "video", src: s.url, resize: "cover", muted: true, duration: -2 });\n' +
        '  const voiceText = (e.voice_text || "").trim();\n' +
        '  if (voiceText) els.push({ type: "voice", text: voiceText, voice: "en-US-AndrewNeural" });\n' +
        '  const scene = { comment: "line " + e.line_id + ": " + (e.primary_keyword || ""), elements: els };\n' +
        '  if (!s || !s.url) {\n' +
        '    scene["background-color"] = "#101418";\n' +
        '    els.push({ type: "text", text: "B-ROLL PENDING: " + (e.primary_keyword || ""), duration: -2 });\n' +
        '  }\n' +
        '  if (!voiceText) scene.duration = Math.max(1.5, Number(e.duration_sec) || 2);\n' +
        '  return scene;\n' +
        '});\n' +
        'if (!scenes.length) throw new Error("no scenes to render");\n' +
        'const movie = {\n' +
        '  resolution: "instagram-story",\n' +
        '  quality: "high",\n' +
        '  scenes,\n' +
        '  elements: [{ type: "subtitles", settings: { style: "boxed-word", "font-family": "Oswald Bold", "font-size": 100, position: "mid-bottom-center", "word-color": "#FFFF00", "line-color": "#FFFFFF" } }]\n' +
        '};\n' +
        'return [{ json: { movie } }];'
    }
  },
  output: [{ movie: { resolution: 'instagram-story', scenes: [] } }]
});

const submitRender = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Submit Render',
    position: [3520, 40],
    parameters: {
      method: 'POST',
      url: 'https://api.json2video.com/v2/movies',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.movie) }}'),
      options: { timeout: 60000 }
    },
    credentials: { httpHeaderAuth: newCredential('JSON2Video API Key (header name: x-api-key)') }
  },
  output: [{ success: true, project: 'abcd1234' }]
});

const waitRender = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: {
    name: 'Wait For Render',
    position: [3740, 40],
    parameters: { resume: 'timeInterval', amount: 120, unit: 'seconds' }
  },
  output: [{ success: true, project: 'abcd1234' }]
});

const pollRender = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Poll Render',
    position: [3960, 40],
    parameters: {
      method: 'GET',
      url: 'https://api.json2video.com/v2/movies',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendQuery: true,
      specifyQuery: 'keypair',
      queryParameters: { parameters: [{ name: 'project', value: expr('{{ $("Submit Render").first().json.project }}') }] },
      options: { timeout: 60000 }
    },
    credentials: { httpHeaderAuth: newCredential('JSON2Video API Key (header name: x-api-key)') }
  },
  output: [{ movie: { status: 'done', url: 'https://assets.json2video.com/final.mp4' } }]
});

const renderDone = ifElse({
  version: 2.3,
  config: {
    name: 'Render Done',
    position: [4180, 40],
    parameters: {
      conditions: {
        options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
        combinator: 'and',
        conditions: [{ leftValue: expr('{{ $json.movie.status }}'), operator: { type: 'string', operation: 'equals' }, rightValue: 'done' }]
      },
      looseTypeValidation: true
    }
  }
});

const waitRender2 = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: {
    name: 'Wait For Render 2',
    position: [4180, 260],
    parameters: { resume: 'timeInterval', amount: 180, unit: 'seconds' }
  },
  output: [{ movie: { status: 'running' } }]
});

const pollRender2 = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Poll Render 2',
    position: [4400, 260],
    parameters: {
      method: 'GET',
      url: 'https://api.json2video.com/v2/movies',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendQuery: true,
      specifyQuery: 'keypair',
      queryParameters: { parameters: [{ name: 'project', value: expr('{{ $("Submit Render").first().json.project }}') }] },
      options: { timeout: 60000 }
    },
    credentials: { httpHeaderAuth: newCredential('JSON2Video API Key (header name: x-api-key)') }
  },
  output: [{ movie: { status: 'done', url: 'https://assets.json2video.com/final.mp4' } }]
});

const renderDone2 = ifElse({
  version: 2.3,
  config: {
    name: 'Render Done 2',
    position: [4620, 260],
    parameters: {
      conditions: {
        options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
        combinator: 'and',
        conditions: [{ leftValue: expr('{{ $json.movie.status }}'), operator: { type: 'string', operation: 'equals' }, rightValue: 'done' }]
      },
      looseTypeValidation: true
    }
  }
});

const renderResult = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Render Result',
    position: [4400, 40],
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          { id: 'video-url', name: 'video_url', value: expr('{{ $json.movie.url }}'), type: 'string' },
          { id: 'render-status', name: 'render_status', value: 'done', type: 'string' }
        ]
      }
    }
  },
  output: [{ video_url: 'https://assets.json2video.com/final.mp4', render_status: 'done' }]
});

const scheduleMetricool = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Schedule On Metricool',
    position: [4620, 40],
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: 'https://app.metricool.com/api/v2/scheduler/posts',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendQuery: true,
      specifyQuery: 'keypair',
      queryParameters: {
        parameters: [
          { name: 'blogId', value: '6656122' },
          { name: 'userId', value: '5123090' }
        ]
      },
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr(
        '{{ JSON.stringify({ text: $("Parse Script").first().json.script.caption, ' +
        'providers: [{ network: "tiktok" }, { network: "instagram" }, { network: "youtube" }, { network: "facebook" }], ' +
        'media: [$json.video_url], draft: true, autoPublish: false, ' +
        'publicationDate: { dateTime: $now.plus({ hours: 12 }).toISO().split(".")[0], timezone: "Asia/Singapore" } }) }}'
      ),
      options: { timeout: 60000 }
    },
    credentials: { httpHeaderAuth: newCredential('Metricool User Token (header name: X-Mc-Auth)') }
  },
  output: [{ data: { id: 123 } }]
});

const resultEmail = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Send Result Email',
    position: [4840, 40],
    parameters: {
      resource: 'message',
      operation: 'send',
      sendTo: 'ryandhana1515@gmail.com',
      subject: expr('Video rendered: {{ $("Reference Intake").first().json.my_topic }}'),
      message: expr(
        'Your video is rendered.\n\n' +
        'MP4: {{ $("Render Result").first().json.video_url }}\n\n' +
        'HOOK: {{ $("Parse Script").first().json.script.hook }}\n' +
        'CAPTION: {{ $("Parse Script").first().json.script.caption }}\n\n' +
        'A DRAFT post for TikTok / Instagram / YouTube / Facebook was created in Metricool (brand: biogreenelixirs). ' +
        'Open Metricool planner to review and confirm the slot.\n\n' +
        'Kling / screen-recording shots (if any) are queued in the n8n data table kling_queue.'
      ),
      options: { appendAttribution: false }
    },
    credentials: { gmailOAuth2: { id: '1RO2TgsvJz0fwqQp', name: 'Gmail account' } }
  },
  output: [{ id: 'msg1' }]
});

const logRun = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Log Run',
    position: [5060, 40],
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: '2vKueBr6IhgMXeZf', cachedResultName: 'viral_engine_runs' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          created: expr('{{ $now.toISO() }}'),
          topic: expr('{{ $("Reference Intake").first().json.my_topic }}'),
          hook: expr('{{ $("Parse Script").first().json.script.hook }}'),
          hook_type: expr('{{ $("Parse Format DNA").first().json.format_dna.hook_type }}'),
          status: 'rendered_and_drafted',
          video_url: expr('{{ $("Render Result").first().json.video_url }}'),
          caption: expr('{{ $("Parse Script").first().json.script.caption }}')
        },
        schema: [
          { id: 'created', displayName: 'created', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'topic', displayName: 'topic', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'hook', displayName: 'hook', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'hook_type', displayName: 'hook_type', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'video_url', displayName: 'video_url', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'caption', displayName: 'caption', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }
        ]
      }
    }
  },
  output: [{ id: 2, createdAt: '2026-08-06' }]
});

const renderFailedEmail = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Render Failed Email',
    position: [4840, 380],
    parameters: {
      resource: 'message',
      operation: 'send',
      sendTo: 'ryandhana1515@gmail.com',
      subject: expr('Render did not finish: {{ $("Reference Intake").first().json.my_topic }}'),
      message: expr(
        'The JSON2Video render did not finish in time or errored.\n\n' +
        'Project: {{ $("Submit Render").first().json.project }}\n' +
        'Last status: {{ $json.movie?.status }}\n' +
        'Message: {{ $json.movie?.message }}\n\n' +
        'Check the JSON2Video dashboard, or re-run this workflow.'
      ),
      options: { appendAttribution: false }
    },
    credentials: { gmailOAuth2: { id: '1RO2TgsvJz0fwqQp', name: 'Gmail account' } }
  },
  output: [{ id: 'msg2' }]
});

const noteCreds = sticky(
  '## Credentials to fill in (one time)\n' +
  '1. Apify Token: query auth, param name `token`\n' +
  '2. Pexels API Key: header auth, header name `Authorization`\n' +
  '3. JSON2Video API Key: header auth, header name `x-api-key` (same credential on all 3 render nodes)\n' +
  '4. Metricool User Token: header auth, header name `X-Mc-Auth`\n' +
  '5. OpenAI + Anthropic: covered by n8n managed credentials\n' +
  '6. Gmail: already connected\n\n' +
  'Voice: scenes use the built-in JSON2Video voice `en-US-AndrewNeural` so renders work out of the box. ' +
  'To use your cloned ElevenLabs voice, add your ElevenLabs key in the JSON2Video dashboard and change the ' +
  'voice value in the Assemble Movie node.',
  [referenceIntake, apifyDownload],
  { color: 4 }
);

const noteFlow = sticky(
  '## Viral Content Engine\n' +
  'Form -> Apify -> Whisper -> Agent A (format DNA) -> Agent B (your script) -> EMAIL APPROVAL GATE -> ' +
  'Agent C (b-roll map) -> Pexels stock pull -> JSON2Video render (voice + captions) -> Metricool DRAFT post -> log.\n\n' +
  'Impossible / screen-recording shots go to the `kling_queue` data table instead of blocking the render; ' +
  'those scenes render as placeholder cards so the video still completes. Runs log to `viral_engine_runs`.',
  [agentC, splitBroll],
  { color: 5 }
);

export default workflow('viral-content-engine', 'Viral Content Engine')
  .add(referenceIntake)
  .to(apifyDownload)
  .to(fetchMp4)
  .to(whisperTranscribe)
  .to(agentA)
  .to(parseDna)
  .to(agentB)
  .to(parseScript)
  .to(approvalGate)
  .to(isApproved
    .onTrue(agentC
      .to(splitBroll)
      .to(routeSource
        .onCase(0, pexelsSearch
          .to(normalizeClips)
          .to(assembleMovie)
          .to(submitRender)
          .to(waitRender)
          .to(pollRender)
          .to(renderDone
            .onTrue(renderResult
              .to(scheduleMetricool)
              .to(resultEmail)
              .to(logRun))
            .onFalse(waitRender2
              .to(pollRender2)
              .to(renderDone2
                .onTrue(renderResult)
                .onFalse(renderFailedEmail)))))
        .onCase(1, queueManual)))
    .onFalse(logRejected))
  .add(noteCreds)
  .add(noteFlow);
