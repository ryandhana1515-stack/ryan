/* BIOGREEN // AGENT OPERATIONS HQ — station edition
   Dark top-down sci-fi facility (assets/facility-bg.jpg, AI-generated).
   Agents walk the corridors between rooms, talk with speech bubbles,
   hold standups at the war table and all-hands around the reactor core —
   with live chat wired to the real n8n instance. */

"use strict";

const CFG = window.HQ_CONFIG;
const SNAP = window.N8N_SNAPSHOT;

// ---------------------------------------------------------------- artwork layout
// World units = background image pixels (1024 x 1024).

const ART_W = 1024, ART_H = 1024;

// 3x3 room grid measured on the art. Walls sit in the ~25px bands between.
const COLS = [[145, 372], [402, 630], [658, 882]];
const ROWSY = [[142, 372], [402, 630], [658, 872]];

const ROOMS = {
  content:   { name: "CONTENT STUDIO", col: 0, row: 0, sign: "#ff5cd6", desks: [{ x: 215, y: 215 }, { x: 320, y: 330 }] },
  inbox:     { name: "INBOX HUB",      col: 1, row: 0, sign: "#3cff9e", desks: [{ x: 455, y: 215 }, { x: 580, y: 215 }, { x: 515, y: 300 }] },
  ads:       { name: "ADS LAB",        col: 2, row: 0, sign: "#ff5c8a", desks: [{ x: 725, y: 215 }, { x: 815, y: 300 }] },
  support:   { name: "SUPPORT DESK",   col: 0, row: 1, sign: "#ffb84d", desks: [{ x: 245, y: 430 }, { x: 190, y: 515 }, { x: 260, y: 590 }] },
  core:      { name: "COMMAND CORE",   col: 1, row: 1, sign: "#00dcff", desks: [{ x: 590, y: 560 }] },
  research:  { name: "RESEARCH BAY",   col: 2, row: 1, sign: "#b18cff", desks: [{ x: 780, y: 430 }, { x: 845, y: 520 }, { x: 770, y: 590 }] },
  voice:     { name: "VOICE OPS",      col: 0, row: 2, sign: "#ff8c42", desks: [{ x: 210, y: 705 }, { x: 235, y: 810 }] },
  affiliate: { name: "AFFILIATE HUB",  col: 1, row: 2, sign: "#4dd2ff", desks: [{ x: 465, y: 745 }, { x: 555, y: 790 }] },
  web:       { name: "WEB FORGE",      col: 2, row: 2, sign: "#8c9eff", desks: [{ x: 740, y: 705 }, { x: 835, y: 760 }] },
};
Object.values(ROOMS).forEach((r) => {
  r.x0 = COLS[r.col][0]; r.x1 = COLS[r.col][1];
  r.y0 = ROWSY[r.row][0]; r.y1 = ROWSY[r.row][1];
  r.cx = (r.x0 + r.x1) / 2; r.cy = (r.y0 + r.y1) / 2;
});

// war table beside the reactor (standups) + reactor ring (all-hands)
const WAR = { x: 592, y: 548 };
const WAR_HEAD = { x: 592, y: 478 };
const WAR_SEATS = [{ x: 532, y: 548 }, { x: 652, y: 548 }, { x: 556, y: 612 }, { x: 628, y: 612 }];
const REACTOR = { x: 512, y: 512 };

// ---------------------------------------------------------------- agents

const AGENTS = [
  { id: "manager",  name: "MANAGER", room: "core",      color: "#00dcff", status: "ACTIVE",
    role: "AI Manager — Company Orchestrator",
    tasks: ["delegated brief to specialist sub-agents", "daily summary → Manager Reports", "weekly report compiled", "routed build to the AI CTO"] },
  { id: "content",  name: "NOVA",    room: "content",   color: "#3cff9e", status: "ACTIVE",
    role: "Content Agent — Daily Social Content",
    tasks: ["3 TikTok captions → Content Queue", "drafted 1 FB ad + 1 IG caption", "#BIONOV caption batch queued"] },
  { id: "ads",      name: "PULSE",   room: "ads",       color: "#ff5c8a", status: "ACTIVE",
    role: "Ads Agent — Weekly Ad Drafts",
    tasks: ["2 FB ads + 2 TikTok scripts drafted", "5 hook ideas → Ad Drafts", "health-ad compliance pass ✓"] },
  { id: "support",  name: "ECHO",    room: "support",   color: "#ffb84d", status: "ACTIVE",
    role: "Customer Service Agent — 24/7 Chat",
    tasks: ["answered dosage question: 3x daily", "shipping query resolved", "guardrailed affiliate answer"] },
  { id: "research", name: "LEDGER",  room: "research",  color: "#b18cff", status: "ACTIVE",
    role: "Research Agent — Weekly Market Scan",
    tasks: ["market scan → Research Reports", "'nitric oxide over 40' rising", "competitor gap logged"] },
  { id: "affiliate", name: "ORBIT",  room: "affiliate", color: "#4dd2ff", status: "ACTIVE",
    role: "Affiliate Agent — Welcome New Affiliates",
    tasks: ["/affiliate-signup: welcome sent", "new creator → Affiliate Outreach", "commission terms delivered"] },
  { id: "whatsapp", name: "WAVE",    room: "inbox",     color: "#25d366", status: "ACTIVE",
    role: "WhatsApp Agent — Cloud API",
    tasks: ["/whatsapp-in: reply via Graph API", "lead captured → Leads CRM", "webhook handshake verified"] },
  { id: "omni",     name: "RELAY",   room: "inbox",     color: "#2ee6c8", status: "ACTIVE",
    role: "Omnichannel AI Hub — Universal Inbox",
    tasks: ["/inbound-message answered", "cross-channel lead logged", "call request routed to VOX"] },
  { id: "voice",    name: "VOX",     room: "voice",     color: "#ff8c42", status: "ACTIVE",
    role: "Voice Agent — Calls + Call Logger",
    tasks: ["ElevenLabs outbound call placed", "transcript → Call Log", "standing by for callbacks"] },
  { id: "web",      name: "FORGE",   room: "web",       color: "#8c9eff", status: "2 ERR", statusColor: "#ffb84d",
    role: "Website Agent — Immersive 3D Site Designer",
    tasks: ["3D scene plan + Kling prompts packaged", "Lovable brief handed off", "retrying render pipeline"] },
];
const byId = (id) => AGENTS.find((a) => a.id === id);

// ---------------------------------------------------------------- dialogue

const LINES = {
  manager:  { open: ["Status check — how's your queue?", "Revenue review at 18:00. Be ready.", "Any blockers I should clear?"],
              reply: ["Good. Keep shipping.", "Log it in the report table.", "I'll route that to the AI CTO."] },
  content:  { open: ["Wrote 3 hooks that might go viral 👀", "Caption batch queued for 09:00.", "Need B-roll ideas for the next ad."],
              reply: ["I'll storyboard that today.", "Drafting now, give me 10 min.", "Adding it to the Content Queue."] },
  ads:      { open: ["CPA dropped 18% on variant B 📉", "Killing two weak adsets tonight.", "Smart+ is eating the budget well."],
              reply: ["Send me the winning hook.", "I'll scale it on TikTok Smart+.", "Compliance pass first, then ship."] },
  support:  { open: ["Customer asked about meds again.", "12 tickets closed, zero escalations.", "Someone wants wholesale pricing."],
              reply: ["I'll add it to the FAQ.", "Forwarding to your queue.", "Route that one to Ryan."] },
  research: { open: ["'Nitric oxide over 40' searches up 3x 📈", "Competitor dropped SG prices 12%.", "Green-screen ads trending again."],
              reply: ["Interesting — send the report.", "That matches my data.", "I'll flag it for the ads team."] },
  affiliate:{ open: ["Signed 3 wellness creators today 🤝", "Top affiliate just hit 22 sales.", "Free samples shipped to two creators."],
              reply: ["I'll prep the welcome kits.", "Commission run is scheduled.", "Loox reviews are syncing."] },
  whatsapp: { open: ["WhatsApp inbox is buzzing today.", "54 messages routed to the brain.", "New lead from KL just landed."],
              reply: ["Leads are logging clean.", "Webhook is verified ✓", "I'll tag it in the CRM."] },
  omni:     { open: ["New lead from the website chat.", "Routed a call request to VOX.", "Three channels active right now."],
              reply: ["Logged to Leads CRM.", "Channel's open, on it.", "Reply sent from the profile."] },
  voice:    { open: ["Placed 2 calls, both booked ☎", "Call transcripts are synced.", "ElevenLabs voice sounds sharp today."],
              reply: ["Patch them through anytime.", "Logs are in the Call table.", "I'll dial the next lead."] },
  web:      { open: ["Render pipeline is fixed... maybe 😅", "New landing page brief is in.", "Kling prompts are packaged."],
              reply: ["Ship it to Lovable.", "I'll generate the 3D scene.", "Deploying after the fix."] },
};
const ACKS = ["👍", "Nice.", "Let's go.", "Copy that.", "🔥"];

const SPEECHES = [
  () => `Team — ${runs} workflow runs and counting. 🔥`,
  () => `BIO N:OV is moving: ${sales} sales signals today.`,
  () => "FORGE — I need that render pipeline green this week.",
  () => "Next: Facebook, Instagram, TikTok, YouTube. Full auto.",
  () => "One command from Ryan — the whole station moves. Dismissed! 🚀",
];

const SALE_EVENTS = [
  "💰 SALE — BIO N:OV x1 → Singapore",
  "💰 SALE — BIO N:OV x2 → Kuala Lumpur",
  "💰 SALE — BIO N:OV x1 → Bangkok",
  "💰 SALE — BIO N:OV x3 → Sydney",
  "💰 SALE — BIO N:OV x1 → London",
];

// ---------------------------------------------------------------- nav grid + A*

const CELL = 8, GW = 128, GD = 128;
const blocked = new Uint8Array(GW * GD);
const w2c = (v) => Math.max(0, Math.min(127, Math.round(v / CELL)));
const c2w = (c) => c * CELL;

function blockRect(x0, y0, x1, y1) {
  for (let cx = w2c(x0); cx <= w2c(x1); cx++)
    for (let cy = w2c(y0); cy <= w2c(y1); cy++) blocked[cy * GW + cx] = 1;
}
function clearRect(x0, y0, x1, y1) {
  for (let cx = w2c(x0); cx <= w2c(x1); cx++)
    for (let cy = w2c(y0); cy <= w2c(y1); cy++) blocked[cy * GW + cx] = 0;
}

// hull: everything blocked, then carve rooms + door gaps
blockRect(0, 0, ART_W, ART_H);
Object.values(ROOMS).forEach((r) => clearRect(r.x0 + 8, r.y0 + 8, r.x1 - 8, r.y1 - 8));
// doors between horizontally adjacent rooms (gap at row center)
for (let row = 0; row < 3; row++) {
  const cy = (ROWSY[row][0] + ROWSY[row][1]) / 2;
  clearRect(COLS[0][1] - 10, cy - 26, COLS[1][0] + 10, cy + 26);
  clearRect(COLS[1][1] - 10, cy - 26, COLS[2][0] + 10, cy + 26);
}
// doors between vertically adjacent rooms (gap at column center)
for (let col = 0; col < 3; col++) {
  const cx = (COLS[col][0] + COLS[col][1]) / 2;
  clearRect(cx - 26, ROWSY[0][1] - 10, cx + 26, ROWSY[1][0] + 10);
  clearRect(cx - 26, ROWSY[1][1] - 10, cx + 26, ROWSY[2][0] + 10);
}
// keep the reactor itself un-walkable so nobody stands in the core
blockRect(REACTOR.x - 58, REACTOR.y - 58, REACTOR.x + 58, REACTOR.y + 58);

function nearestFree(cx, cy) {
  if (!blocked[cy * GW + cx]) return [cx, cy];
  for (let ring = 1; ring < 12; ring++)
    for (let dx = -ring; dx <= ring; dx++)
      for (let dy = -ring; dy <= ring; dy++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && nx < GW && ny >= 0 && ny < GD && !blocked[ny * GW + nx]) return [nx, ny];
      }
  return [cx, cy];
}

const NEIGH = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4], [1, -1, 1.4], [-1, 1, 1.4], [-1, -1, 1.4]];

function findPath(x0, y0, x1, y1) {
  const [sx, sy] = nearestFree(w2c(x0), w2c(y0));
  const [tx, ty] = nearestFree(w2c(x1), w2c(y1));
  const start = sy * GW + sx, goal = ty * GW + tx;
  if (start === goal) return [{ x: x1, y: y1 }];
  const open = [start];
  const came = new Int32Array(GW * GD).fill(-1);
  const g = new Float32Array(GW * GD).fill(Infinity);
  const f = new Float32Array(GW * GD).fill(Infinity);
  g[start] = 0;
  f[start] = Math.hypot(tx - sx, ty - sy);
  const inOpen = new Uint8Array(GW * GD);
  inOpen[start] = 1;
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (f[open[i]] < f[open[bi]]) bi = i;
    const cur = open.splice(bi, 1)[0];
    inOpen[cur] = 0;
    if (cur === goal) {
      const path = [];
      let n = cur;
      while (n !== start) { path.push({ x: c2w(n % GW), y: c2w(Math.floor(n / GW)) }); n = came[n]; }
      path.reverse();
      path.push({ x: x1, y: y1 });
      // light smoothing: drop every other waypoint
      return path.filter((_, i) => i % 2 === 0 || i === path.length - 1);
    }
    const cx = cur % GW, cy = Math.floor(cur / GW);
    for (const [dx, dy, cost] of NEIGH) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || nx >= GW || ny < 0 || ny >= GD) continue;
      const ni = ny * GW + nx;
      if (blocked[ni]) continue;
      const ng = g[cur] + cost;
      if (ng < g[ni]) {
        came[ni] = cur;
        g[ni] = ng;
        f[ni] = ng + Math.hypot(tx - nx, ty - ny);
        if (!inOpen[ni]) { open.push(ni); inOpen[ni] = 1; }
      }
    }
  }
  return [{ x: x1, y: y1 }];
}

// ---------------------------------------------------------------- canvas + camera

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

const bg = new Image();
bg.src = "assets/facility-bg.jpg";

const cam = { x: 512, y: 512, zoom: 1 };
const camGoal = { x: 512, y: 512, zoom: 1 };
let userCamUntil = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas._w = rect.width; canvas._h = rect.height; canvas._dpr = dpr;
  fitDefault();
}

// Cinematic close-up like the reference: ~2 rooms fill the screen.
function cineZoom() { return canvas._w / (canvas._w > canvas._h ? 620 : 420); }

function clampCam(goal) {
  const hw = canvas._w / (2 * goal.zoom), hh = canvas._h / (2 * goal.zoom);
  goal.x = Math.max(Math.min(goal.x, ART_W - hw + 80), hw - 80);
  goal.y = Math.max(Math.min(goal.y, ART_H - hh + 80), hh - 80);
}

function fitDefault() {
  camGoal.zoom = cineZoom();
  camGoal.x = REACTOR.x;
  camGoal.y = REACTOR.y;
  clampCam(camGoal);
}
window.addEventListener("resize", resize);

function screenToWorld(sx, sy) {
  return [(sx - canvas._w / 2) / cam.zoom + cam.x, (sy - canvas._h / 2) / cam.zoom + cam.y];
}

// idle auto-tour between rooms with agents
setInterval(() => {
  if (performance.now() < userCamUntil || meetingCtl.phase !== "idle" || chatAgent) return;
  const s = sprites[Math.floor(Math.random() * sprites.length)];
  if (!s) return;
  camGoal.x = s.x;
  camGoal.y = s.y;
  camGoal.zoom = cineZoom();
  clampCam(camGoal);
}, 9000);

// ---------------------------------------------------------------- pixel sprites

const FRAMES = {
  stand: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbba.", ".a.bb.a.", "..bbbb..", "..l..l..", "..l..l.."],
  walk1: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbba.", ".a.bb.a.", "..bbbb..", ".l....l.", "l......l"],
  walk2: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbba.", ".a.bb.a.", "..bbbb..", "...ll...", "..l.l..."],
  work1: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbba.", "aa.bb.aa", "..bbbb..", "..l..l..", "..l..l.."],
  talk1: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbbaa", ".a.bb...", "..bbbb..", "..l..l..", "..l..l.."],
  cheer: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "a.bbbb.a", "aabbbbaa", "...bb...", "..bbbb..", "..l..l..", "..l..l.."],
  sit:   ["........", "..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbba.", "..bbbb..", "..llll..", "..l..l.."],
};
const PXS = 4; // sprite ~32 x 40 world px

function mixHex(hex, other, t) {
  const h = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const a = h(hex), b = h(other);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function drawSprite(a, x, y, frame, flip, talking, tGlobal) {
  const colors = {
    h: mixHex(a.color, "#0a0818", 0.7),
    v: talking && Math.floor(tGlobal / 200) % 2 ? "#ffffff" : "#d5fcff",
    b: a.color,
    a: mixHex(a.color, "#ffffff", 0.4),
    l: "#181430",
  };
  const rows = frame.length, cols = frame[0].length;
  const w = cols * PXS, h = rows * PXS;
  // glow pool on the deck (reads well on the dark art)
  const grad = ctx.createRadialGradient(x, y, 2, x, y, 26);
  grad.addColorStop(0, a.color + "55");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // outline
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  for (let r = 0; r < rows; r++) {
    const row = frame[r];
    for (let c = 0; c < cols; c++) {
      const ch = row[flip ? cols - 1 - c : c];
      if (ch === ".") continue;
      ctx.fillRect(x - w / 2 + c * PXS - 1.2, y - h + r * PXS - 1.2, PXS + 2.4, PXS + 2.4);
    }
  }
  for (let r = 0; r < rows; r++) {
    const row = frame[r];
    for (let c = 0; c < cols; c++) {
      const ch = row[flip ? cols - 1 - c : c];
      if (ch === ".") continue;
      ctx.fillStyle = colors[ch];
      ctx.fillRect(x - w / 2 + c * PXS, y - h + r * PXS, PXS + 0.5, PXS + 0.5);
    }
  }
  // name tag
  ctx.font = "bold 12px 'Share Tech Mono', monospace";
  const tw = ctx.measureText(a.name).width + 10;
  ctx.fillStyle = "rgba(4,8,12,0.85)";
  ctx.fillRect(x - tw / 2, y - h - 20, tw, 15);
  ctx.strokeStyle = a.color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - tw / 2, y - h - 20, tw, 15);
  ctx.fillStyle = "#e8fbff";
  ctx.textAlign = "center";
  ctx.fillText(a.name, x, y - h - 8);
  ctx.textAlign = "left";
}

// ---------------------------------------------------------------- speech bubbles + floaters

const bubbles = [];
function say(sprite, text, secs = 2.8) {
  bubbles.push({ s: sprite, text, until: performance.now() + secs * 1000 });
}

function drawBubbles(now) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    if (now > b.until) { bubbles.splice(i, 1); continue; }
    const x = b.s.x, y = b.s.y - 60;
    ctx.font = "13px 'Share Tech Mono', monospace";
    const maxW = 200;
    const words = b.text.split(" ");
    const lines = [];
    let cur = "";
    words.forEach((w) => {
      if (ctx.measureText(cur + " " + w).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = cur ? cur + " " + w : w;
    });
    lines.push(cur);
    const bw = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width))) + 18;
    const bh = lines.length * 17 + 10;
    const bx = Math.max(10, Math.min(ART_W - 10 - bw, x - bw / 2));
    const by = y - bh;
    ctx.fillStyle = "rgba(235,250,252,0.95)";
    ctx.strokeStyle = b.s.agent.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 4);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 5, by + bh); ctx.lineTo(x + 5, by + bh); ctx.lineTo(x, by + bh + 8);
    ctx.closePath();
    ctx.fillStyle = "rgba(235,250,252,0.95)";
    ctx.fill();
    ctx.fillStyle = "#0c1418";
    lines.forEach((l, li) => ctx.fillText(l, bx + 9, by + 17 + li * 17));
  }
}

const floaters = [];
function drawFloaters(dt) {
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.y -= 26 * dt; f.life -= dt;
    if (f.life <= 0) { floaters.splice(i, 1); continue; }
    ctx.globalAlpha = Math.min(1, f.life);
    ctx.font = "18px sans-serif";
    ctx.fillText(f.emoji, f.x, f.y);
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- sprites

const sprites = AGENTS.map((a, i) => {
  const r = ROOMS[a.room];
  return {
    agent: a, room: a.room,
    x: r.cx + (i % 2 ? 30 : -30), y: r.cy + 20,
    path: [], speed: 55 + Math.random() * 20,
    state: "pause", pause: 1 + Math.random() * 3,
    walkPhase: Math.random() * 10, flip: false,
    workT: 0,
    convoCooldown: performance.now() + 8000 + Math.random() * 15000,
    chatting: false, mode: "free",
    afterArrive: null,
  };
});
const spriteOf = (id) => sprites.find((s) => s.agent.id === id);

function walkTo(s, x, y, after) {
  s.afterArrive = after || null;
  s.path = findPath(s.x, s.y, x, y);
  s.state = "walk";
}

function roomAnchor(r) {
  return {
    x: r.x0 + 30 + Math.random() * (r.x1 - r.x0 - 60),
    y: r.y0 + 40 + Math.random() * (r.y1 - r.y0 - 60),
  };
}

function updateSprite(s, dt, now) {
  if (s.state === "walk") {
    const wp = s.path[0];
    if (!wp) {
      const after = s.afterArrive; s.afterArrive = null;
      if (after === "work") { s.state = "work"; s.workT = 4 + Math.random() * 3; }
      else if (after === "seat") { s.state = "seated"; }
      else if (after === "crowd") { s.state = "crowd"; }
      else if (after === "podium") { s.state = "podium"; }
      else { s.state = "pause"; s.pause = 1.5 + Math.random() * 3.5; }
      return;
    }
    const dx = wp.x - s.x, dy = wp.y - s.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) { s.path.shift(); return; }
    if (Math.abs(dx) > 2) s.flip = dx < 0;
    s.x += (dx / d) * s.speed * dt;
    s.y += (dy / d) * s.speed * dt;
    s.walkPhase += dt * 10;
  } else if (s.state === "work") {
    s.workT -= dt;
    if (s.workT <= 0) { s.state = "pause"; s.pause = 1 + Math.random() * 2; }
  } else if (s.state === "pause") {
    if (s.mode !== "free" || s.chatting) return;
    s.pause -= dt;
    if (s.pause <= 0) {
      if (Math.random() < 0.2) {
        const keys = Object.keys(ROOMS);
        const dest = ROOMS[keys[Math.floor(Math.random() * keys.length)]];
        const p = roomAnchor(dest);
        walkTo(s, p.x, p.y);
      } else {
        const p = roomAnchor(ROOMS[s.room]);
        walkTo(s, p.x, p.y);
      }
    }
  }
}

function frameFor(s) {
  if (s.state === "walk") return Math.floor(s.walkPhase) % 2 ? FRAMES.walk1 : FRAMES.walk2;
  if (s.state === "work") return FRAMES.work1;
  if (s.state === "crowd" && meetingCtl.cheer) return FRAMES.cheer;
  if (s.state === "seated") return bubbles.some((b) => b.s === s) ? FRAMES.talk1 : FRAMES.sit;
  if (bubbles.some((b) => b.s === s)) return FRAMES.talk1;
  return FRAMES.stand;
}

// ---------------------------------------------------------------- conversations

function tryConversations(now) {
  for (let i = 0; i < sprites.length; i++) {
    const A = sprites[i];
    if (A.mode !== "free" || A.state !== "pause" || A.chatting || now < A.convoCooldown) continue;
    for (let j = i + 1; j < sprites.length; j++) {
      const B = sprites[j];
      if (B.mode !== "free" || B.state !== "pause" || B.chatting || now < B.convoCooldown) continue;
      if (Math.hypot(A.x - B.x, A.y - B.y) > 90) continue;
      A.flip = A.x > B.x; B.flip = B.x > A.x;
      const la = LINES[A.agent.id], lb = LINES[B.agent.id];
      const open = la.open[Math.floor(Math.random() * la.open.length)];
      const reply = lb.reply[Math.floor(Math.random() * lb.reply.length)];
      const ack = ACKS[Math.floor(Math.random() * ACKS.length)];
      say(A, open, 3);
      setTimeout(() => say(B, reply, 3), 3100);
      setTimeout(() => say(A, ack, 1.6), 6300);
      A.pause = B.pause = 8.5;
      A.convoCooldown = B.convoCooldown = now + 25000 + Math.random() * 30000;
      pushLog(A.agent, `💬 chatting with ${B.agent.name}: "${open}"`);
      return;
    }
  }
}

// ---------------------------------------------------------------- meetings + all-hands

const meetingCtl = { phase: "idle", attendees: [], step: 0, timer: 0, cheer: false, kind: null };

function startMeeting() {
  const mgr = spriteOf("manager");
  const pool = sprites.filter((s) => s.agent.id !== "manager" && !s.chatting);
  const attendees = pool.sort(() => Math.random() - 0.5).slice(0, 4);
  meetingCtl.kind = "standup";
  meetingCtl.phase = "gather";
  meetingCtl.attendees = [mgr, ...attendees];
  meetingCtl.timer = 26;
  meetingCtl.step = 0;
  say(mgr, "📢 Standup at the WAR TABLE — now!", 3);
  pushLog(byId("manager"), "📢 called a standup at the war table");
  meetingCtl.attendees.forEach((s, i) => {
    s.mode = "meeting";
    const p = i === 0 ? WAR_HEAD : WAR_SEATS[i - 1];
    walkTo(s, p.x, p.y, "seat");
  });
  focusCamera(WAR.x, WAR.y, cineZoom() * 1.15);
}

function startTownhall() {
  meetingCtl.kind = "townhall";
  meetingCtl.phase = "gather";
  meetingCtl.timer = 32;
  meetingCtl.step = 0;
  meetingCtl.attendees = [...sprites];
  const mgr = spriteOf("manager");
  pushLog(byId("manager"), "🎤 ALL HANDS — gather at the reactor core!");
  say(mgr, "🎤 ALL HANDS at the CORE. Everyone in!", 3);
  sprites.forEach((s, i) => {
    s.mode = "townhall";
    if (s.agent.id === "manager") {
      walkTo(s, REACTOR.x, REACTOR.y - 92, "podium");
    } else {
      const ang = Math.PI * 0.15 + (i / 10) * Math.PI * 1.1; // arc below the core
      walkTo(s, REACTOR.x + Math.cos(ang) * 120, REACTOR.y + 70 + Math.sin(ang) * 46, "crowd");
    }
  });
  focusCamera(REACTOR.x, REACTOR.y + 10, cineZoom() * 1.05);
}

function updateMeetings(dt, now) {
  const mgr = spriteOf("manager");
  if (meetingCtl.phase === "idle") return;

  if (meetingCtl.phase === "gather") {
    meetingCtl.timer -= dt;
    const settled = meetingCtl.attendees.every((s) =>
      ["seated", "crowd", "podium", "pause"].includes(s.state));
    if (settled || meetingCtl.timer <= 0) {
      meetingCtl.phase = "talk";
      meetingCtl.timer = 0;
      meetingCtl.step = 0;
    }
    return;
  }

  if (meetingCtl.phase === "talk") {
    meetingCtl.timer -= dt;
    if (meetingCtl.timer > 0) return;
    if (meetingCtl.kind === "standup") {
      const order = meetingCtl.attendees;
      if (meetingCtl.step === 0) {
        say(mgr, `Numbers: ${runs} runs, ${sales} sales signals. Reports — go.`, 3.4);
        pushLog(byId("manager"), `standup: "${runs} runs, ${sales} sales — reports, go"`);
      } else if (meetingCtl.step <= order.length - 1) {
        const s = order[meetingCtl.step];
        const line = LINES[s.agent.id].open[Math.floor(Math.random() * LINES[s.agent.id].open.length)];
        say(s, line, 3.2);
        pushLog(s.agent, `standup report: "${line}"`);
      } else if (meetingCtl.step === order.length) {
        say(mgr, "Good. Ship it. Back to stations 🚀", 3);
        meetingCtl.phase = "end";
        meetingCtl.timer = 3;
        return;
      }
      meetingCtl.step++;
      meetingCtl.timer = 3.6;
    } else {
      if (meetingCtl.step < SPEECHES.length) {
        const text = SPEECHES[meetingCtl.step]();
        say(mgr, text, 3.6);
        pushLog(byId("manager"), `🎤 "${text}"`);
        meetingCtl.cheer = true;
        setTimeout(() => (meetingCtl.cheer = false), 1800);
        sprites.forEach((s) => {
          if (s.agent.id !== "manager" && Math.random() < 0.6)
            floaters.push({ x: s.x + (Math.random() * 20 - 10), y: s.y - 48, emoji: ["👏", "🚀", "💯", "🔥"][Math.floor(Math.random() * 4)], life: 1.6 });
        });
        meetingCtl.step++;
        meetingCtl.timer = 4.2;
      } else {
        say(mgr, "Dismissed!", 1.8);
        meetingCtl.phase = "end";
        meetingCtl.timer = 2.2;
      }
      return;
    }
    return;
  }

  if (meetingCtl.phase === "end") {
    meetingCtl.timer -= dt;
    if (meetingCtl.timer <= 0) {
      meetingCtl.attendees.forEach((s) => {
        s.mode = "free";
        const p = roomAnchor(ROOMS[s.room]);
        walkTo(s, p.x, p.y);
      });
      meetingCtl.attendees = [];
      meetingCtl.phase = "idle";
      if (now > userCamUntil) fitDefault();
    }
  }
}

setTimeout(function meetLoop() {
  if (meetingCtl.phase === "idle") startMeeting();
  setTimeout(meetLoop, 100000 + Math.random() * 50000);
}, 35000);
setTimeout(function hallLoop() {
  if (meetingCtl.phase === "idle") startTownhall();
  setTimeout(hallLoop, 210000 + Math.random() * 60000);
}, 140000);

function focusCamera(x, y, zoom) {
  if (performance.now() < userCamUntil) return;
  camGoal.x = x; camGoal.y = y; camGoal.zoom = zoom;
  clampCam(camGoal);
}

// ---------------------------------------------------------------- DOM: roster + log

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
    </div>
    <div class="agent-status" style="color:${a.statusColor || ""}">● ${a.status}</div>`;
  card.addEventListener("click", () => openChat(a));
  rosterEl.appendChild(card);
});

const logEl = document.getElementById("ops-log");
const timestamp = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

function pushLog(agent, msg, cls) {
  const line = document.createElement("div");
  line.className = "log-line" + (cls ? " " + cls : "");
  line.dataset.id = agent ? agent.id : "sys";
  const who = agent ? agent.name : "SYSTEM";
  const color = agent ? agent.color : "#00dcff";
  line.innerHTML = `<span class="log-time">${timestamp()}</span>` +
    `<span class="log-agent" style="color:${color}">[${who}]</span>` +
    `<span class="log-msg">${msg}</span>`;
  logEl.appendChild(line);
  while (logEl.children.length > 90) logEl.removeChild(logEl.firstChild);
  logEl.scrollTop = logEl.scrollHeight;
}

pushLog(null, `STATION ONLINE — linked to ${SNAP.instance} (${SNAP.totals.workflows} workflows, ${SNAP.totals.executions} runs)`);
pushLog(null, "Agents patrol the corridors, meet at the war table and rally at the core. Click anyone to chat via n8n 💬");

let runs = SNAP.totals.executions, sales = 0, stock = 1240;
const startTime = performance.now();

function updateStats() {
  document.getElementById("stat-tasks").textContent = runs;
  document.getElementById("stat-sales").textContent = sales;
  document.getElementById("stat-stock").textContent = stock.toLocaleString();
}
updateStats();

setInterval(() => {
  const el = (performance.now() - startTime) / 1000;
  const p = (n) => String(Math.floor(n)).padStart(2, "0");
  document.getElementById("stat-uptime").textContent = `${p(el / 3600)}:${p((el / 60) % 60)}:${p(el % 60)}`;
  document.getElementById("clock").textContent = timestamp();
}, 1000);

function scheduleEvent() {
  setTimeout(() => {
    const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    pushLog(a, a.tasks[Math.floor(Math.random() * a.tasks.length)]);
    runs++;
    const s = spriteOf(a.id);
    const r = ROOMS[s.room];
    if (s.mode === "free" && !s.chatting && s.state === "pause" && r.desks.length) {
      const d = r.desks[Math.floor(Math.random() * r.desks.length)];
      walkTo(s, d.x, d.y, "work");
    }
    floaters.push({ x: s.x, y: s.y - 50, emoji: ["⚙️", "✉️", "📊", "✅"][Math.floor(Math.random() * 4)], life: 1.5 });
    if (Math.random() < 0.15) {
      sales++;
      stock = Math.max(0, stock - (1 + Math.floor(Math.random() * 3)));
      pushLog(null, SALE_EVENTS[Math.floor(Math.random() * SALE_EVENTS.length)], "sale");
    }
    updateStats();
    scheduleEvent();
  }, 1800 + Math.random() * 3200);
}
scheduleEvent();

// ---------------------------------------------------------------- chat dock (real n8n)

const dock = document.getElementById("chat-dock");
const chatMsgs = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const btnCall = document.getElementById("btn-call");
let chatAgent = null;

const sessions = {};
function sessionOf(id) {
  if (!sessions[id]) {
    const stored = localStorage.getItem("hq-session-" + id);
    sessions[id] = stored || ("hq-" + id + "-" + Math.random().toString(36).slice(2, 10));
    localStorage.setItem("hq-session-" + id, sessions[id]);
  }
  return sessions[id];
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function addChatMsg(kind, who, text, colorCss) {
  const el = document.createElement("div");
  el.className = "chat-msg " + kind;
  if (kind === "meta") el.textContent = text;
  else el.innerHTML = `<span class="msg-who" style="color:${colorCss || "var(--cyan)"}">${who}</span>${escapeHtml(text)}`;
  chatMsgs.appendChild(el);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return el;
}

function openChat(a) {
  chatAgent = a;
  const cfg = CFG.agents[a.id] || {};
  document.getElementById("chat-agent-name").textContent = a.name;
  document.getElementById("chat-agent-name").style.color = a.color;
  document.getElementById("chat-agent-role").textContent = a.role;
  document.getElementById("chat-hint").textContent = cfg.hint || "";
  document.getElementById("chat-n8n-link").href = cfg.workflowId
    ? `${CFG.n8nBase}/workflow/${cfg.workflowId}` : CFG.n8nEditor;
  btnCall.classList.toggle("hidden", !cfg.callPath);
  chatMsgs.innerHTML = "";
  addChatMsg("meta", "", `Channel open with ${a.name} — messages go to the live n8n workflow.`);
  dock.classList.remove("hidden");
  document.querySelectorAll(".agent-card").forEach((c) =>
    c.classList.toggle("selected", c.dataset.id === a.id));
  const s = spriteOf(a.id);
  sprites.forEach((sp) => (sp.chatting = false));
  s.chatting = true;
  say(s, "💬 On a call with Ryan", 2.4);
  focusCamera(s.x, s.y, cineZoom() * 1.2);
  chatInput.focus();
}

document.getElementById("chat-close").addEventListener("click", () => {
  dock.classList.add("hidden");
  sprites.forEach((sp) => (sp.chatting = false));
  document.querySelectorAll(".agent-card").forEach((c) => c.classList.remove("selected"));
  chatAgent = null;
  fitDefault();
});

document.getElementById("btn-reset-cam").addEventListener("click", () => {
  userCamUntil = 0;
  fitDefault();
});

document.getElementById("btn-fullscreen").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});

btnCall.addEventListener("click", async () => {
  const cfg = CFG.agents[chatAgent?.id];
  if (!cfg?.callPath) return;
  const num = prompt("Number to call (E.164 format, e.g. +6591234567):");
  if (!num) return;
  addChatMsg("meta", "", `☎ Requesting live call to ${num}...`);
  try {
    const res = await fetch(CFG.n8nBase + cfg.callPath, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_number: num }),
    });
    const j = await res.json();
    addChatMsg("agent", chatAgent.name, "Call requested: " + (j.status || JSON.stringify(j)), chatAgent.color);
    pushLog(chatAgent, "☎ outbound call requested via /call-me");
  } catch (e) {
    addChatMsg("meta", "", "Call request failed (" + e.message + ") — check the ElevenLabs credential in n8n.");
  }
});

async function parseChatResponse(res) {
  const text = await res.text();
  try {
    const j = JSON.parse(text);
    return j.output ?? j.text ?? j.reply ?? j.message ?? j.welcome_message ?? text;
  } catch {
    const parts = [];
    for (const line of text.split("\n")) {
      const l = line.replace(/^data:\s*/, "").trim();
      if (!l) continue;
      try {
        const c = JSON.parse(l);
        if (typeof c.content === "string") parts.push(c.content);
        else if (typeof c.chunk === "string") parts.push(c.chunk);
        else if (c.type === "item" && c.content) parts.push(String(c.content));
      } catch { /* non-JSON line */ }
    }
    return parts.length ? parts.join("") : text;
  }
}

function simReply(a, msg) {
  return `[offline sim] I couldn't reach the n8n instance from this page (network/CORS). ` +
    `Open ${CFG.n8nBase} to check the "${a.role}" workflow — your message was: "${msg}"`;
}

async function sendToAgent(a, text) {
  const cfg = CFG.agents[a.id];
  if (!cfg) return simReply(a, text);
  if (cfg.kind === "chat") {
    const res = await fetch(`${CFG.n8nBase}/webhook/${cfg.webhookId}/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sendMessage", sessionId: sessionOf(a.id), chatInput: (cfg.prefix || "") + text }),
    });
    return parseChatResponse(res);
  }
  if (cfg.kind === "inbound") {
    const res = await fetch(CFG.n8nBase + cfg.path, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: cfg.channel, name: "Ryan (HQ console)", contact: "hq@biogreenelixirs.com", message: text }),
    });
    return parseChatResponse(res);
  }
  if (cfg.kind === "affiliate") {
    const parts = text.split(",").map((s) => s.trim());
    if (parts.length >= 2 && parts[1].includes("@")) {
      const res = await fetch(CFG.n8nBase + cfg.path, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: parts[0], email: parts[1], followers: parts[2] || "unknown" }),
      });
      return parseChatResponse(res);
    }
    const res = await fetch(CFG.n8nBase + cfg.fallbackPath, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "affiliate-desk", name: "Ryan (HQ console)", contact: "hq@biogreenelixirs.com", message: text }),
    });
    return parseChatResponse(res);
  }
  return simReply(a, text);
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!chatAgent) return;
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  const a = chatAgent;
  addChatMsg("user", "YOU", text);
  pushLog(a, "💬 message received from Ryan");
  const thinking = addChatMsg("agent thinking", a.name, "processing via n8n...", a.color);
  try {
    const reply = await sendToAgent(a, text);
    thinking.remove();
    addChatMsg("agent", a.name, reply, a.color);
    const s = spriteOf(a.id);
    say(s, reply.length > 60 ? reply.slice(0, 57) + "..." : reply, 4);
    pushLog(a, "💬 replied via n8n workflow");
    runs++; updateStats();
  } catch (err) {
    thinking.remove();
    addChatMsg("agent", a.name, simReply(a, text), a.color);
  }
});

// ---------------------------------------------------------------- analytics modal

const modal = document.getElementById("analytics-modal");
document.getElementById("btn-analytics").addEventListener("click", () => {
  renderAnalytics();
  modal.classList.remove("hidden");
});
document.getElementById("analytics-close").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

function renderAnalytics() {
  document.getElementById("analytics-instance").textContent = SNAP.instance;
  document.getElementById("analytics-time").textContent = SNAP.generatedAt;
  document.getElementById("analytics-link").href = CFG.n8nEditor;
  const t = SNAP.totals;
  document.getElementById("analytics-totals").innerHTML = `
    <div class="tot"><span class="n">${t.workflows}</span><span class="l">WORKFLOWS</span></div>
    <div class="tot"><span class="n">${t.active}</span><span class="l">ACTIVE</span></div>
    <div class="tot"><span class="n">${t.executions}</span><span class="l">EXECUTIONS</span></div>
    <div class="tot"><span class="n">${Math.round(t.success / t.executions * 1000) / 10}%</span><span class="l">SUCCESS</span></div>
    <div class="tot"><span class="n">${t.error}</span><span class="l">ERRORS</span></div>`;
  const max = Math.max(...SNAP.workflows.map((w) => w.runs), 1);
  document.getElementById("analytics-table").innerHTML = SNAP.workflows.map((w) => `
    <div class="wf-row ${w.active ? "" : "wf-off"}">
      <div class="wf-name">${w.name}<div class="wf-sub">${w.active ? "active" : "inactive"} · last run ${w.lastRun}</div></div>
      <div class="wf-bar"><i class="${w.errors ? "err" : ""}" style="width:${Math.max(w.runs / max * 100, w.runs ? 4 : 0)}%"></i></div>
      <div class="wf-runs">${w.runs}${w.errors ? `<div class="err-note">${w.errors} err</div>` : ""}</div>
    </div>`).join("");
}

// ---------------------------------------------------------------- input

let dragging = false, moved = false, px = 0, py = 0;
canvas.addEventListener("pointerdown", (e) => {
  dragging = true; moved = false; px = e.clientX; py = e.clientY;
  canvas.classList.add("dragging");
  document.getElementById("sidebar").classList.remove("open");
});
window.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - px, dy = e.clientY - py;
  if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
  cam.x -= dx / cam.zoom; cam.y -= dy / cam.zoom;
  camGoal.x = cam.x; camGoal.y = cam.y;
  userCamUntil = performance.now() + 30000;
  px = e.clientX; py = e.clientY;
});
window.addEventListener("pointerup", (e) => {
  canvas.classList.remove("dragging");
  if (dragging && !moved) {
    const rect = canvas.getBoundingClientRect();
    const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const hit = sprites.find((s) =>
      Math.abs(wx - s.x) < 24 && wy < s.y + 8 && wy > s.y - 52);
    if (hit) openChat(hit.agent);
  }
  dragging = false;
});
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  const nz = Math.max(0.4, Math.min(4, cam.zoom * (e.deltaY < 0 ? 1.12 : 0.9)));
  cam.x = wx - (wx - cam.x) * (cam.zoom / nz);
  cam.y = wy - (wy - cam.y) * (cam.zoom / nz);
  cam.zoom = nz;
  camGoal.x = cam.x; camGoal.y = cam.y; camGoal.zoom = nz;
  userCamUntil = performance.now() + 30000;
}, { passive: false });

document.getElementById("btn-roster").addEventListener("click", () =>
  document.getElementById("sidebar").classList.toggle("open"));

let pinchDist = 0;
canvas.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    dragging = false;
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY);
    if (pinchDist) {
      const nz = Math.max(0.4, Math.min(4, cam.zoom * (d / pinchDist)));
      cam.zoom = nz;
      camGoal.zoom = nz; camGoal.x = cam.x; camGoal.y = cam.y;
      userCamUntil = performance.now() + 30000;
    }
    pinchDist = d;
  }
}, { passive: false });
canvas.addEventListener("touchend", () => (pinchDist = 0));

// ---------------------------------------------------------------- drawing

const stars = Array.from({ length: 140 }, () => ({
  x: Math.random() * 2200 - 600, y: Math.random() * 2200 - 600, r: Math.random() * 1.8 + 0.5,
}));

function drawRoomLabel(r, now) {
  ctx.font = "bold 12px 'Share Tech Mono', monospace";
  const tw = ctx.measureText(r.name).width + 12;
  const x = r.x0 + 8, y = r.y0 + 10;
  const flicker = Math.sin(now / 100 + r.x0) > -0.94 ? 1 : 0.4;
  ctx.globalAlpha = 0.9 * flicker;
  ctx.fillStyle = "rgba(4,8,12,0.8)";
  ctx.fillRect(x, y, tw, 16);
  ctx.strokeStyle = r.sign;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, tw, 16);
  ctx.fillStyle = r.sign;
  ctx.fillText(r.name, x + 6, y + 12);
  ctx.globalAlpha = 1;
}

function draw(now, dt) {
  const W = canvas._w, H = canvas._h, dpr = canvas._dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true; // painterly art, smooth scaling

  ctx.fillStyle = "#020308";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);

  ctx.fillStyle = "#9fb8d8";
  stars.forEach((s) => {
    ctx.globalAlpha = 0.25 + 0.3 * Math.sin(now / 900 + s.x);
    ctx.fillRect(s.x, s.y, s.r, s.r);
  });
  ctx.globalAlpha = 1;

  if (bg.complete && bg.naturalWidth) ctx.drawImage(bg, 0, 0, ART_W, ART_H);

  Object.values(ROOMS).forEach((r) => drawRoomLabel(r, now));

  ctx.imageSmoothingEnabled = false; // crisp pixel sprites
  sprites.slice().sort((a, b) => a.y - b.y).forEach((s) => {
    const seated = s.state === "seated";
    drawSprite(s.agent, s.x, s.y + (seated ? 3 : 0), frameFor(s), s.flip, bubbles.some((b) => b.s === s), now);
    if (s.chatting) {
      ctx.strokeStyle = s.agent.color;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -(now / 60);
      ctx.strokeRect(s.x - 22, s.y - 46, 44, 52);
      ctx.setLineDash([]);
    }
  });

  drawBubbles(now);
  drawFloaters(dt);

  ctx.restore();

  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,4,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main loop

let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  sprites.forEach((s) => updateSprite(s, dt, now));
  tryConversations(now);
  updateMeetings(dt, now);

  if (now > userCamUntil) {
    cam.x += (camGoal.x - cam.x) * 0.05;
    cam.y += (camGoal.y - cam.y) * 0.05;
    cam.zoom += (camGoal.zoom - cam.zoom) * 0.05;
  }

  draw(now, dt);
  requestAnimationFrame(tick);
}

resize();
cam.x = camGoal.x; cam.y = camGoal.y; cam.zoom = camGoal.zoom;
requestAnimationFrame(tick);
