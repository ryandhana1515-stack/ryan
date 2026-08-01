/* BIOGREEN // AGENT OPERATIONS HQ
   Live pixel-art facility map of the Bio Green Elixirs n8n agent grid.
   Agents, rooms, run counts and statuses mirror the real n8n instance.
   Vanilla canvas — no dependencies. */

// ---------------------------------------------------------------- config

// Virtual map space; scaled to fit the canvas.
const W = 1600, H = 1000;

const ROOMS = {
  core:      { name: "AI MANAGER CORE",  x: 610, y: 390, w: 380, h: 230 },
  content:   { name: "CONTENT STUDIO",   x:  70, y:  60, w: 430, h: 250 },
  inbox:     { name: "INBOX HUB",        x: 585, y:  60, w: 430, h: 250 },
  ads:       { name: "ADS LAB",          x: 1100, y:  60, w: 430, h: 250 },
  support:   { name: "SUPPORT DESK",     x:  70, y: 390, w: 430, h: 230 },
  research:  { name: "RESEARCH BAY",     x: 1100, y: 390, w: 430, h: 230 },
  affiliate: { name: "AFFILIATE HUB",    x:  70, y: 700, w: 430, h: 240 },
  voice:     { name: "VOICE OPS",        x: 585, y: 700, w: 430, h: 240 },
  web:       { name: "WEB FORGE",        x: 1100, y: 700, w: 430, h: 240 },
};

// Two desks per room; agents walk between them and "work".
Object.values(ROOMS).forEach((r) => {
  r.desks = [
    { x: r.x + r.w * 0.3, y: r.y + r.h * 0.62 },
    { x: r.x + r.w * 0.7, y: r.y + r.h * 0.78 },
  ];
});

// Real agents ← n8n workflows (ids from the live instance).
const AGENTS = [
  {
    id: "manager", name: "MANAGER", room: "core", color: "#00dcff", status: "ACTIVE",
    role: "AI Manager — Company Orchestrator",
    workflows: ["AI Manager — Company Orchestrator", "AI Manager — Daily Summary", "AI Manager — Weekly Report"],
    tasks: [
      "delegated brief to Content + Ads sub-agents",
      "read Business Profile → routed build request",
      "18:00 daily summary → Manager Reports table",
      "Mon 07:00 weekly report: wins + bottlenecks",
      "compiled sub-agent results for Ryan",
    ],
  },
  {
    id: "content", name: "NOVA", room: "content", color: "#3cff9e", status: "ACTIVE",
    role: "Content Agent — Daily Social Content",
    workflows: ["Content Agent — Daily Social Content"],
    tasks: [
      "09:00 run: 3 TikTok captions → Content Queue",
      "drafted 1 Facebook ad + 1 IG caption",
      "queued #BIONOV caption batch as drafts",
      "daily social drop saved to Content Queue",
    ],
  },
  {
    id: "ads", name: "PULSE", room: "ads", color: "#ff5c8a", status: "ACTIVE",
    role: "Ads Agent — Weekly Ad Drafts",
    workflows: ["Ads Agent — Weekly Ad Drafts"],
    tasks: [
      "Mon 10:00: 2 FB ads + 2 TikTok scripts drafted",
      "5 new hook ideas → Ad Drafts table",
      "compliance pass: Meta/TikTok health policy ✓",
      "refreshed BIO N:OV ad angle rotation",
    ],
  },
  {
    id: "support", name: "ECHO", room: "support", color: "#ffb84d", status: "ACTIVE",
    role: "Customer Service Agent — 24/7 Chat",
    workflows: ["Customer Service Agent — 24/7 Chat"],
    tasks: [
      "answered dosage question: 3x daily, 1 tablet",
      "shipping query resolved (memory context ok)",
      "affiliate question handled with guardrails",
      "health-compliance filter applied to reply",
    ],
  },
  {
    id: "research", name: "LEDGER", room: "research", color: "#b18cff", status: "ACTIVE",
    role: "Research Agent — Weekly Market Scan",
    workflows: ["Research Agent — Weekly Market Scan"],
    tasks: [
      "Mon 08:00 scan: NO supplement trends → report",
      "flagged rising query: 'nitric oxide over 40'",
      "weekly web+news sweep → Research Reports",
      "competitor gap logged for ads team",
    ],
  },
  {
    id: "affiliate", name: "ORBIT", room: "affiliate", color: "#4dd2ff", status: "ACTIVE",
    role: "Affiliate Agent — Welcome New Affiliates",
    workflows: ["Affiliate Agent — Welcome New Affiliates"],
    tasks: [
      "/affiliate-signup: personalized welcome sent",
      "new affiliate logged → Affiliate Outreach",
      "commission terms delivered to new creator",
      "outreach entry synced for weekly report",
    ],
  },
  {
    id: "whatsapp", name: "WAVE", room: "inbox", color: "#25d366", status: "ACTIVE",
    role: "WhatsApp Agent — Sandbox (Cloud API)",
    workflows: ["WhatsApp Agent — Sandbox", "Utility — Subscribe App to WABA"],
    tasks: [
      "/whatsapp-in: message → AI Brain → reply sent",
      "lead captured → Leads CRM table",
      "Graph API reply delivered to customer",
      "webhook handshake verified (biogreen-verify)",
    ],
  },
  {
    id: "omni", name: "RELAY", room: "inbox", color: "#2ee6c8", status: "ACTIVE",
    role: "Omnichannel AI Hub — Universal Inbox",
    workflows: ["Omnichannel AI Hub — Universal Inbox"],
    tasks: [
      "/inbound-message: Claude answered from profile",
      "cross-channel lead logged → Leads CRM",
      "customer asked for a call → routed to VOX",
      "channel payload normalized + answered",
    ],
  },
  {
    id: "voice", name: "VOX", room: "voice", color: "#ff8c42", status: "ACTIVE",
    role: "Voice Agent — Calls + Call Logger",
    workflows: ["Voice Agent — Call Me Now", "Voice Agent — Call Logger"],
    tasks: [
      "/call-me: ElevenLabs outbound call placed",
      "post-call webhook: transcript → Call Log",
      "call summary + duration stored",
      "voice agent standing by for callbacks",
    ],
  },
  {
    id: "web", name: "FORGE", room: "web", color: "#8c9eff", status: "2 ERR", statusColor: "#ffb84d",
    role: "Website Agent — Immersive 3D Site Designer",
    workflows: ["Website Agent — Immersive 3D Site Designer"],
    tasks: [
      "packaged 3D scene plan + section specs",
      "generated Kling asset prompts for hero",
      "Lovable build brief handed to AI CTO",
      "retrying render pipeline (2 errors logged)",
    ],
  },
];

const SALE_EVENTS = [
  "💰 SALE — BIO N:OV x1 → Singapore",
  "💰 SALE — BIO N:OV x2 → Kuala Lumpur",
  "💰 SALE — BIO N:OV x1 → Bangkok",
  "💰 SALE — BIO N:OV x3 → Sydney",
  "💰 SALE — BIO N:OV x1 → London",
];

// Seeded from the live n8n instance at build time.
const SEED = { runs: 83, successRate: "96.4%", workflows: 14 };

// ---------------------------------------------------------------- pixel sprites

// 8x10 pixel worker. h=helmet v=visor b=body a=arms l=legs
const FRAMES = {
  stand: [
    "..hhhh..",
    ".hhhhhh.",
    ".hvvvvh.",
    ".hhhhhh.",
    "..bbbb..",
    ".abbbba.",
    ".a.bb.a.",
    "..bbbb..",
    "..l..l..",
    "..l..l..",
  ],
  walk1: [
    "..hhhh..",
    ".hhhhhh.",
    ".hvvvvh.",
    ".hhhhhh.",
    "..bbbb..",
    ".abbbba.",
    ".a.bb.a.",
    "..bbbb..",
    ".l....l.",
    "l......l",
  ],
  walk2: [
    "..hhhh..",
    ".hhhhhh.",
    ".hvvvvh.",
    ".hhhhhh.",
    "..bbbb..",
    ".abbbba.",
    ".a.bb.a.",
    "..bbbb..",
    "...ll...",
    "..l.l...",
  ],
  work1: [
    "..hhhh..",
    ".hhhhhh.",
    ".hvvvvh.",
    ".hhhhhh.",
    "..bbbb..",
    ".abbbba.",
    "aa.bb.aa",
    "..bbbb..",
    "..l..l..",
    "..l..l..",
  ],
  work2: [
    "..hhhh..",
    ".hhhhhh.",
    ".hvvvvh.",
    ".hhhhhh.",
    "..bbbb..",
    ".abbbba.",
    ".aabbaa.",
    "..bbbb..",
    "..l..l..",
    "..l..l..",
  ],
};
const PX = 2.6; // world units per sprite pixel

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function mix(hex, other, t) {
  const a = hexToRgb(hex), b = hexToRgb(other);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// ---------------------------------------------------------------- state

const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

let scale = 1, offX = 0, offY = 0;
let selected = null;
let runs = SEED.runs, sales = 0, stock = 1240;
const startTime = performance.now();

const packets = [];
const sparks = [];

const sprites = AGENTS.map((a, i) => {
  const r = ROOMS[a.room];
  const s = {
    agent: a,
    x: r.x + r.w * (0.3 + 0.4 * (i % 2)), y: r.y + r.h * 0.6,
    tx: 0, ty: 0, speed: 34 + Math.random() * 16,
    state: "pause", pause: 0.5 + Math.random() * 2,
    workT: 0, deskIdx: i % 2,
    arms: mix(a.color, "#ffffff", 0.45),
    helmet: mix(a.color, "#04070d", 0.72),
  };
  return s;
});

function pickWander(s) {
  const r = ROOMS[s.agent.room];
  s.tx = r.x + 30 + Math.random() * (r.w - 60);
  s.ty = r.y + 70 + Math.random() * (r.h - 95);
  s.state = "walk";
}

function goWork(s, seconds) {
  const r = ROOMS[s.agent.room];
  s.deskIdx = (s.deskIdx + 1) % r.desks.length;
  const d = r.desks[s.deskIdx];
  s.tx = d.x; s.ty = d.y - 6;
  s.state = "toDesk";
  s.workT = seconds;
}

// ---------------------------------------------------------------- layout

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  scale = Math.min(rect.width / W, rect.height / H);
  offX = (rect.width - W * scale) / 2;
  offY = (rect.height - H * scale) / 2;
}
window.addEventListener("resize", resize);
resize();

// ---------------------------------------------------------------- sidebar

const rosterEl = document.getElementById("roster");
AGENTS.forEach((a) => {
  const card = document.createElement("div");
  card.className = "agent-card";
  card.dataset.id = a.id;
  card.innerHTML = `
    <div class="agent-dot" style="color:${a.color};background:${a.color}"></div>
    <div class="agent-info">
      <div class="agent-name">${a.name}</div>
      <div class="agent-role">${a.role}</div>
      <div class="agent-wf">n8n: ${a.workflows.length} workflow${a.workflows.length > 1 ? "s" : ""}</div>
    </div>
    <div class="agent-status" style="color:${a.statusColor || ""}">● ${a.status}</div>`;
  card.addEventListener("click", () => select(selected === a.id ? null : a.id));
  rosterEl.appendChild(card);
});

const clearBtn = document.getElementById("log-filter-clear");
clearBtn.addEventListener("click", () => select(null));

function select(id) {
  selected = id;
  document.querySelectorAll(".agent-card").forEach((c) =>
    c.classList.toggle("selected", c.dataset.id === id));
  clearBtn.classList.toggle("hidden", !id);
  document.querySelectorAll(".log-line").forEach((l) =>
    (l.style.display = !id || l.dataset.id === id || l.dataset.id === "sys" ? "" : "none"));
}

// ---------------------------------------------------------------- ops log

const logEl = document.getElementById("ops-log");

function timestamp() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function pushLog(agent, msg, cls) {
  const line = document.createElement("div");
  line.className = "log-line" + (cls ? " " + cls : "");
  line.dataset.id = agent ? agent.id : "sys";
  const who = agent ? agent.name : "SYSTEM";
  const color = agent ? agent.color : "#00dcff";
  line.innerHTML = `<span class="log-time">${timestamp()}</span>` +
    `<span class="log-agent" style="color:${color}">[${who}]</span>` +
    `<span class="log-msg">${msg}</span>`;
  if (selected && line.dataset.id !== selected && line.dataset.id !== "sys") line.style.display = "none";
  logEl.appendChild(line);
  while (logEl.children.length > 80) logEl.removeChild(logEl.firstChild);
  logEl.scrollTop = logEl.scrollHeight;
}

pushLog(null, `n8n GRID ONLINE — ${SEED.workflows} workflows, ${SEED.runs} runs, ${SEED.successRate} success`);
pushLog(null, "10 agents on the floor. Mission: scale BIO N:OV worldwide 🌍");

// Simulated activity: pick an agent, log a real-workflow task,
// send the sprite to a desk and fire a packet to the core.
function scheduleEvent() {
  setTimeout(() => {
    const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    const msg = a.tasks[Math.floor(Math.random() * a.tasks.length)];
    pushLog(a, msg);
    runs++;
    const s = sprites.find((sp) => sp.agent === a);
    goWork(s, 3.5 + Math.random() * 3);
    if (a.id !== "manager") spawnPacket(a);
    if (Math.random() < 0.16) {
      sales++;
      stock = Math.max(0, stock - (1 + Math.floor(Math.random() * 3)));
      pushLog(null, SALE_EVENTS[Math.floor(Math.random() * SALE_EVENTS.length)], "sale");
    }
    updateStats();
    scheduleEvent();
  }, 1400 + Math.random() * 2600);
}
scheduleEvent();

function updateStats() {
  document.getElementById("stat-tasks").textContent = runs;
  document.getElementById("stat-sales").textContent = sales;
  document.getElementById("stat-stock").textContent = stock.toLocaleString();
}
updateStats();

setInterval(() => {
  const el = (performance.now() - startTime) / 1000;
  const p = (n) => String(Math.floor(n)).padStart(2, "0");
  document.getElementById("stat-uptime").textContent =
    `${p(el / 3600)}:${p((el / 60) % 60)}:${p(el % 60)}`;
  document.getElementById("clock").textContent = timestamp();
}, 1000);

// ---------------------------------------------------------------- packets

function roomCenter(r) { return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }

function spawnPacket(agent) {
  const from = roomCenter(ROOMS[agent.room]);
  const to = roomCenter(ROOMS.core);
  packets.push({ x: from.x, y: from.y, from, to, t: 0, color: agent.color });
}

// ---------------------------------------------------------------- render

function drawRoom(id, r, t) {
  const isSel = selected && AGENTS.find((a) => a.id === selected)?.room === id;
  const glow = isSel ? 0.9 : 0.45 + 0.1 * Math.sin(t / 900 + r.x);

  ctx.fillStyle = id === "core" ? "rgba(0,220,255,0.05)" : "rgba(10,30,45,0.55)";
  ctx.fillRect(r.x, r.y, r.w, r.h);

  ctx.strokeStyle = "rgba(0,220,255,0.06)";
  ctx.lineWidth = 1;
  for (let gx = r.x + 40; gx < r.x + r.w; gx += 40) {
    ctx.beginPath(); ctx.moveTo(gx, r.y); ctx.lineTo(gx, r.y + r.h); ctx.stroke();
  }
  for (let gy = r.y + 40; gy < r.y + r.h; gy += 40) {
    ctx.beginPath(); ctx.moveTo(r.x, gy); ctx.lineTo(r.x + r.w, gy); ctx.stroke();
  }

  ctx.strokeStyle = `rgba(0,220,255,${glow})`;
  ctx.lineWidth = isSel ? 3 : 2;
  ctx.shadowColor = "#00dcff";
  ctx.shadowBlur = isSel ? 18 : 8;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(0,220,255,0.9)";
  ctx.lineWidth = 3;
  const c = 14;
  [[r.x, r.y, 1, 1], [r.x + r.w, r.y, -1, 1], [r.x, r.y + r.h, 1, -1], [r.x + r.w, r.y + r.h, -1, -1]]
    .forEach(([px, py, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(px + sx * c, py); ctx.lineTo(px, py); ctx.lineTo(px, py + sy * c);
      ctx.stroke();
    });

  ctx.fillStyle = "rgba(0,220,255,0.9)";
  ctx.font = "13px 'Share Tech Mono', monospace";
  ctx.fillText(r.name, r.x + 12, r.y + 22);

  // server racks along the top wall
  for (let i = 0; i < Math.floor(r.w / 90); i++) {
    const rx = r.x + 20 + i * 90, ry = r.y + 32;
    ctx.fillStyle = "rgba(6,18,28,0.9)";
    ctx.fillRect(rx, ry, 58, 14);
    for (let l = 0; l < 4; l++) {
      const on = Math.sin(t / 300 + i * 3 + l * 7 + r.y) > 0.2;
      ctx.fillStyle = on ? (l % 2 ? "#3cff9e" : "#00dcff") : "#0d2233";
      ctx.fillRect(rx + 6 + l * 13, ry + 5, 5, 4);
    }
  }

  // desks (workstations)
  r.desks.forEach((d) => {
    const busy = sprites.some((s) => s.agent.room === id && s.state === "work" &&
      Math.abs(s.x - d.x) < 14 && Math.abs(s.y - (d.y - 6)) < 14);
    // table
    ctx.fillStyle = "#0a1826";
    ctx.fillRect(d.x - 16, d.y, 32, 9);
    ctx.fillStyle = "rgba(0,220,255,0.5)";
    ctx.fillRect(d.x - 16, d.y, 32, 1.5);
    // monitor
    const flicker = busy ? 0.65 + 0.35 * Math.sin(t / 90 + d.x) : 0.18;
    ctx.fillStyle = "#071019";
    ctx.fillRect(d.x - 6, d.y - 9, 12, 8);
    ctx.fillStyle = `rgba(0,220,255,${flicker})`;
    ctx.fillRect(d.x - 5, d.y - 8, 10, 6);
  });
}

function drawCorridors(t) {
  const core = roomCenter(ROOMS.core);
  ctx.strokeStyle = "rgba(0,220,255,0.14)";
  ctx.lineWidth = 10;
  Object.entries(ROOMS).forEach(([id, r]) => {
    if (id === "core") return;
    const c = roomCenter(r);
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(core.x, core.y); ctx.stroke();
  });
  ctx.strokeStyle = "rgba(0,220,255,0.25)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 18]);
  ctx.lineDashOffset = -(t / 40);
  Object.entries(ROOMS).forEach(([id, r]) => {
    if (id === "core") return;
    const c = roomCenter(r);
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(core.x, core.y); ctx.stroke();
  });
  ctx.setLineDash([]);
}

function drawSprite(s, t) {
  const a = s.agent;
  const moving = s.state === "walk" || s.state === "toDesk";
  let frame;
  if (s.state === "work") frame = Math.floor(t / 200) % 2 ? FRAMES.work1 : FRAMES.work2;
  else if (moving) frame = Math.floor(t / 150) % 2 ? FRAMES.walk1 : FRAMES.walk2;
  else frame = FRAMES.stand;

  const w = frame[0].length * PX, h = frame.length * PX;
  const x0 = s.x - w / 2, y0 = s.y - h;

  // soft glow puddle under the agent
  ctx.fillStyle = a.color + "20";
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 1, 13, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const visor = s.state === "work" && Math.floor(t / 200) % 2 ? "#ffffff" : "#c8fbff";
  const colors = { h: s.helmet, v: visor, b: a.color, a: s.arms, l: "#16293b" };
  for (let ry = 0; ry < frame.length; ry++) {
    const row = frame[ry];
    for (let rx = 0; rx < row.length; rx++) {
      const ch = row[rx];
      if (ch === ".") continue;
      ctx.fillStyle = colors[ch];
      ctx.fillRect(x0 + rx * PX, y0 + ry * PX, PX + 0.4, PX + 0.4);
    }
  }

  // name tag
  ctx.fillStyle = a.color;
  ctx.font = "11px 'Share Tech Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(a.name, s.x, y0 - 5);
  ctx.textAlign = "left";

  // "working" indicator
  if (s.state === "work") {
    ctx.fillStyle = "#3cff9e";
    ctx.font = "10px 'Share Tech Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("···".slice(0, 1 + Math.floor(t / 300) % 3), s.x + 16, y0 + 2);
    ctx.textAlign = "left";
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const rect = canvas.parentElement.getBoundingClientRect();

  // sprite state machine: pause → wander → (event) toDesk → work → pause
  sprites.forEach((s) => {
    if (s.state === "pause") {
      s.pause -= dt;
      if (s.pause <= 0) pickWander(s);
    } else if (s.state === "work") {
      s.workT -= dt;
      if (s.workT <= 0) { s.state = "pause"; s.pause = 0.5 + Math.random() * 1.5; }
    } else {
      const dx = s.tx - s.x, dy = s.ty - s.y;
      const d = Math.hypot(dx, dy);
      if (d < 3) {
        if (s.state === "toDesk") s.state = "work";
        else { s.state = "pause"; s.pause = 0.8 + Math.random() * 2.5; }
      } else {
        s.x += (dx / d) * s.speed * dt;
        s.y += (dy / d) * s.speed * dt;
      }
    }
  });

  for (let i = packets.length - 1; i >= 0; i--) {
    const p = packets[i];
    p.t += dt / 1.6;
    if (p.t >= 1) {
      for (let k = 0; k < 10; k++) {
        const ang = Math.random() * Math.PI * 2;
        sparks.push({ x: p.to.x, y: p.to.y, vx: Math.cos(ang) * 60, vy: Math.sin(ang) * 60, life: 0.6, color: p.color });
      }
      packets.splice(i, 1);
    } else {
      p.x = p.from.x + (p.to.x - p.from.x) * p.t;
      p.y = p.from.y + (p.to.y - p.from.y) * p.t;
    }
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const sp = sparks[i];
    sp.life -= dt;
    if (sp.life <= 0) { sparks.splice(i, 1); continue; }
    sp.x += sp.vx * dt; sp.y += sp.vy * dt;
  }

  // ---- draw
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.save();
  ctx.translate(offX, offY);
  ctx.scale(scale, scale);

  ctx.strokeStyle = "rgba(0,220,255,0.03)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
  for (let gy = 0; gy < H; gy += 50) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

  drawCorridors(now);
  Object.entries(ROOMS).forEach(([id, r]) => drawRoom(id, r, now));

  // core reactor ring
  const core = roomCenter(ROOMS.core);
  ctx.strokeStyle = "rgba(0,220,255,0.7)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00dcff";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(core.x, core.y, 42 + 5 * Math.sin(now / 500), 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(core.x, core.y, 26, now / 800, now / 800 + Math.PI * 1.4);
  ctx.stroke();
  ctx.shadowBlur = 0;

  packets.forEach((p) => {
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  });
  sparks.forEach((sp) => {
    ctx.fillStyle = sp.color;
    ctx.globalAlpha = Math.max(sp.life / 0.6, 0);
    ctx.fillRect(sp.x - 1.5, sp.y - 1.5, 3, 3);
    ctx.globalAlpha = 1;
  });

  // draw lower agents in front
  sprites.slice().sort((a, b) => a.y - b.y).forEach((s) => drawSprite(s, now));

  ctx.restore();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------------------------------------------------------------- picking

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left - offX) / scale;
  const my = (e.clientY - rect.top - offY) / scale;
  const hit = Object.entries(ROOMS).find(([, r]) =>
    mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h);
  if (!hit) { select(null); return; }
  const inRoom = AGENTS.filter((a) => a.room === hit[0]);
  if (!inRoom.length) { select(null); return; }
  // cycle through agents that share a room
  const cur = inRoom.findIndex((a) => a.id === selected);
  const next = inRoom[(cur + 1) % inRoom.length];
  select(cur === inRoom.length - 1 ? null : next.id);
});
