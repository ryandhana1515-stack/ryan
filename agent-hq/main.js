/* BIOGREEN // AGENT OPERATIONS HQ — pixel tower edition
   Side-view neon office tower. Agents walk floors, ride the elevator,
   talk to each other, hold standups in the Meeting Bay and gather for
   town-hall speeches — with live chat wired to the real n8n instance. */

"use strict";

const CFG = window.HQ_CONFIG;
const SNAP = window.N8N_SNAPSHOT;

// ---------------------------------------------------------------- palette

const PAL = {
  bgTop: "#1c0b33", bgBot: "#0a0518",
  slab: "#241f3d", slabEdge: "#2ee6c8",
  shaft: "#141126", cab: "#3a2f5e",
  neonPink: "#ff4fd8", neonTeal: "#2ee6c8", neonAmber: "#ffb84d",
  tag: "rgba(10,8,20,0.88)",
};

// ---------------------------------------------------------------- tower layout

const FLOOR_H = 150, SLAB = 12, GROUND_Y = 1140, TOWER_X0 = 90, TOWER_X1 = 1110;
const SHAFT_X0 = 565, SHAFT_X1 = 635, SHAFT_MID = 600;
const floorY = (f) => GROUND_Y - f * FLOOR_H;           // y of the floor's walking surface

// Rooms: [floor, side] — left room spans TOWER_X0+18..SHAFT_X0-8, right SHAFT_X1+8..TOWER_X1-18
const LX0 = TOWER_X0 + 18, LX1 = SHAFT_X0 - 8, RX0 = SHAFT_X1 + 8, RX1 = TOWER_X1 - 18;

const ROOMS = {
  townhall:  { name: "TOWN HALL",      floor: 0, x0: LX0, x1: LX1, wall: "#2a1440", sign: PAL.neonAmber, kit: "hall" },
  factory:   { name: "FACTORY",        floor: 0, x0: RX0, x1: RX1, wall: "#16283d", sign: PAL.neonTeal, kit: "factory" },
  voice:     { name: "VOICE OPS",      floor: 1, x0: LX0, x1: LX1, wall: "#3d1f2a", sign: "#ff8c42",    kit: "office" },
  affiliate: { name: "AFFILIATE HUB",  floor: 1, x0: RX0, x1: RX1, wall: "#162f4a", sign: "#4dd2ff",    kit: "lounge" },
  research:  { name: "RESEARCH BAY",   floor: 2, x0: LX0, x1: LX1, wall: "#2c1f4a", sign: "#b18cff",    kit: "lab" },
  web:       { name: "WEB FORGE",      floor: 2, x0: RX0, x1: RX1, wall: "#1f2647", sign: "#8c9eff",    kit: "lab" },
  inbox:     { name: "INBOX HUB",      floor: 3, x0: LX0, x1: LX1, wall: "#143d33", sign: "#25d366",    kit: "office" },
  support:   { name: "SUPPORT DESK",   floor: 3, x0: RX0, x1: RX1, wall: "#3d2f14", sign: PAL.neonAmber, kit: "office" },
  content:   { name: "CONTENT STUDIO", floor: 4, x0: LX0, x1: LX1, wall: "#14332a", sign: "#3cff9e",    kit: "studio" },
  ads:       { name: "ADS LAB",        floor: 4, x0: RX0, x1: RX1, wall: "#3d1430", sign: "#ff5c8a",    kit: "lab" },
  manager:   { name: "MANAGER OFFICE", floor: 5, x0: LX0, x1: LX1, wall: "#0f2d40", sign: "#00dcff",    kit: "exec" },
  meeting:   { name: "MEETING BAY",    floor: 5, x0: RX0, x1: RX1, wall: "#231b45", sign: PAL.neonPink, kit: "meeting" },
};
Object.values(ROOMS).forEach((r) => {
  r.cx = (r.x0 + r.x1) / 2;
  r.desks = [r.x0 + (r.x1 - r.x0) * 0.3, r.x0 + (r.x1 - r.x0) * 0.68];
});

// ---------------------------------------------------------------- agents

const AGENTS = [
  { id: "manager",  name: "MANAGER", room: "manager",  color: "#00dcff", status: "ACTIVE",
    role: "AI Manager — Company Orchestrator",
    tasks: ["delegated brief to specialist sub-agents", "daily summary → Manager Reports", "weekly report compiled", "routed build to the AI CTO"] },
  { id: "content",  name: "NOVA",    room: "content",  color: "#3cff9e", status: "ACTIVE",
    role: "Content Agent — Daily Social Content",
    tasks: ["3 TikTok captions → Content Queue", "drafted 1 FB ad + 1 IG caption", "#BIONOV caption batch queued"] },
  { id: "ads",      name: "PULSE",   room: "ads",      color: "#ff5c8a", status: "ACTIVE",
    role: "Ads Agent — Weekly Ad Drafts",
    tasks: ["2 FB ads + 2 TikTok scripts drafted", "5 hook ideas → Ad Drafts", "health-ad compliance pass ✓"] },
  { id: "support",  name: "ECHO",    room: "support",  color: "#ffb84d", status: "ACTIVE",
    role: "Customer Service Agent — 24/7 Chat",
    tasks: ["answered dosage question: 3x daily", "shipping query resolved", "guardrailed affiliate answer"] },
  { id: "research", name: "LEDGER",  room: "research", color: "#b18cff", status: "ACTIVE",
    role: "Research Agent — Weekly Market Scan",
    tasks: ["market scan → Research Reports", "'nitric oxide over 40' rising", "competitor gap logged"] },
  { id: "affiliate", name: "ORBIT",  room: "affiliate", color: "#4dd2ff", status: "ACTIVE",
    role: "Affiliate Agent — Welcome New Affiliates",
    tasks: ["/affiliate-signup: welcome sent", "new creator → Affiliate Outreach", "commission terms delivered"] },
  { id: "whatsapp", name: "WAVE",    room: "inbox",    color: "#25d366", status: "ACTIVE",
    role: "WhatsApp Agent — Cloud API",
    tasks: ["/whatsapp-in: reply via Graph API", "lead captured → Leads CRM", "webhook handshake verified"] },
  { id: "omni",     name: "RELAY",   room: "inbox",    color: "#2ee6c8", status: "ACTIVE",
    role: "Omnichannel AI Hub — Universal Inbox",
    tasks: ["/inbound-message answered", "cross-channel lead logged", "call request routed to VOX"] },
  { id: "voice",    name: "VOX",     room: "voice",    color: "#ff8c42", status: "ACTIVE",
    role: "Voice Agent — Calls + Call Logger",
    tasks: ["ElevenLabs outbound call placed", "transcript → Call Log", "standing by for callbacks"] },
  { id: "web",      name: "FORGE",   room: "web",      color: "#8c9eff", status: "2 ERR", statusColor: "#ffb84d",
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
  () => "One command from Ryan — the whole company moves. Dismissed! 🚀",
];

const SALE_EVENTS = [
  "💰 SALE — BIO N:OV x1 → Singapore",
  "💰 SALE — BIO N:OV x2 → Kuala Lumpur",
  "💰 SALE — BIO N:OV x1 → Bangkok",
  "💰 SALE — BIO N:OV x3 → Sydney",
  "💰 SALE — BIO N:OV x1 → London",
];

// ---------------------------------------------------------------- canvas + camera

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

const cam = { x: 600, y: 620, zoom: 0.8 };
const camGoal = { x: 600, y: 620, zoom: 0.8 };
let userCamUntil = 0; // timestamp until which auto-follow is suppressed

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas._w = rect.width; canvas._h = rect.height; canvas._dpr = dpr;
  fitDefault();
}
function fitDefault() {
  camGoal.zoom = Math.min(canvas._w / 1180, canvas._h / 1150) * 0.98;
  camGoal.x = 600; camGoal.y = 600;
}
window.addEventListener("resize", resize);

function worldToScreen(wx, wy) {
  return [(wx - cam.x) * cam.zoom + canvas._w / 2, (wy - cam.y) * cam.zoom + canvas._h / 2];
}
function screenToWorld(sx, sy) {
  return [(sx - canvas._w / 2) / cam.zoom + cam.x, (sy - canvas._h / 2) / cam.zoom + cam.y];
}

// ---------------------------------------------------------------- pixel sprites

const FRAMES = {
  stand: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbba.", ".a.bb.a.", "..bbbb..", "..l..l..", "..l..l.."],
  walk1: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbba.", ".a.bb.a.", "..bbbb..", ".l....l.", "l......l"],
  walk2: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbba.", ".a.bb.a.", "..bbbb..", "...ll...", "..l.l..."],
  work1: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbba.", "aa.bb.aa", "..bbbb..", "..l..l..", "..l..l.."],
  talk1: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "..bbbb..", ".abbbbaa", ".a.bb...", "..bbbb..", "..l..l..", "..l..l.."],
  cheer: ["..hhhh..", ".hhhhhh.", ".hvvvvh.", ".hhhhhh.", "a.bbbb.a", "aabbbbaa", "...bb...", "..bbbb..", "..l..l..", "..l..l.."],
};
const PXS = 3.4; // world px per sprite pixel; sprite ~27x34

function mixHex(hex, other, t) {
  const h = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const a = h(hex), b = h(other);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function drawSprite(a, x, y, frame, flip, talking, tGlobal) {
  // x = center, y = feet
  const colors = {
    h: mixHex(a.color, "#0a0818", 0.7),
    v: talking && Math.floor(tGlobal / 200) % 2 ? "#ffffff" : "#d5fcff",
    b: a.color,
    a: mixHex(a.color, "#ffffff", 0.4),
    l: "#181430",
  };
  const rows = frame.length, cols = frame[0].length;
  const w = cols * PXS, h = rows * PXS;
  // glow puddle
  ctx.fillStyle = a.color + "26";
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 15, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let r = 0; r < rows; r++) {
    const row = frame[r];
    for (let c = 0; c < cols; c++) {
      const ch = row[flip ? cols - 1 - c : c];
      if (ch === ".") continue;
      ctx.fillStyle = colors[ch];
      ctx.fillRect(x - w / 2 + c * PXS, y - h + r * PXS, PXS + 0.5, PXS + 0.5);
    }
  }
  // name tag (reference style: dark pill, white text)
  ctx.font = "bold 11px 'Share Tech Mono', monospace";
  const tw = ctx.measureText(a.name).width + 10;
  ctx.fillStyle = PAL.tag;
  ctx.fillRect(x - tw / 2, y - h - 18, tw, 14);
  ctx.strokeStyle = a.color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - tw / 2, y - h - 18, tw, 14);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(a.name, x, y - h - 7);
  ctx.textAlign = "left";
}

// ---------------------------------------------------------------- speech bubbles

const bubbles = []; // {agentId?, x,y follow, text, until, color}
function say(sprite, text, secs = 2.8) {
  bubbles.push({ s: sprite, text, until: performance.now() + secs * 1000 });
}

function drawBubbles(now) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    if (now > b.until) { bubbles.splice(i, 1); continue; }
    const x = b.s.x, y = b.s.y - 62;
    ctx.font = "12px 'Share Tech Mono', monospace";
    const maxW = 190;
    // wrap
    const words = b.text.split(" ");
    const lines = [];
    let cur = "";
    words.forEach((w) => {
      if (ctx.measureText(cur + " " + w).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = cur ? cur + " " + w : w;
    });
    lines.push(cur);
    const bw = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width))) + 16;
    const bh = lines.length * 15 + 10;
    const bx = Math.max(TOWER_X0, Math.min(TOWER_X1 - bw, x - bw / 2));
    const by = y - bh;
    ctx.fillStyle = "rgba(250,252,255,0.96)";
    ctx.strokeStyle = b.s.agent.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 4);
    ctx.fill(); ctx.stroke();
    // tail
    ctx.beginPath();
    ctx.moveTo(x - 5, by + bh); ctx.lineTo(x + 5, by + bh); ctx.lineTo(x, by + bh + 7);
    ctx.closePath();
    ctx.fillStyle = "rgba(250,252,255,0.96)";
    ctx.fill();
    ctx.fillStyle = "#141126";
    lines.forEach((l, li) => ctx.fillText(l, bx + 8, by + 16 + li * 15));
  }
}

// floaters (👏 🚀 during speeches)
const floaters = [];
function drawFloaters(dt, now) {
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.y -= 26 * dt; f.life -= dt;
    if (f.life <= 0) { floaters.splice(i, 1); continue; }
    ctx.globalAlpha = Math.min(1, f.life);
    ctx.font = "16px sans-serif";
    ctx.fillText(f.emoji, f.x, f.y);
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- elevator

const elevator = { f: 5, target: null, riders: [], waiting: [] };
function requestRide(sprite, toFloor) {
  sprite.state = "waitLift";
  sprite.liftTo = toFloor;
  elevator.waiting.push(sprite);
}
function updateElevator(dt) {
  const SPEED = 1.4; // floors per second
  if (elevator.target === null) {
    if (elevator.riders.length) elevator.target = elevator.riders[0].liftTo;
    else if (elevator.waiting.length) elevator.target = elevator.waiting[0].floor;
  }
  if (elevator.target !== null) {
    const d = elevator.target - elevator.f;
    if (Math.abs(d) < 0.03) {
      elevator.f = elevator.target;
      elevator.target = null;
      // unload
      for (let i = elevator.riders.length - 1; i >= 0; i--) {
        const r = elevator.riders[i];
        if (r.liftTo === elevator.f) {
          elevator.riders.splice(i, 1);
          r.floor = elevator.f;
          r.x = SHAFT_MID;
          r.hidden = false;
          r.state = "walk";
        }
      }
      // load anyone waiting here
      for (let i = elevator.waiting.length - 1; i >= 0; i--) {
        const w = elevator.waiting[i];
        if (w.floor === elevator.f && Math.abs(w.x - SHAFT_MID) < 30) {
          elevator.waiting.splice(i, 1);
          w.hidden = true;
          elevator.riders.push(w);
        }
      }
    } else {
      elevator.f += Math.sign(d) * Math.min(Math.abs(d), SPEED * dt);
    }
  }
}

// ---------------------------------------------------------------- sprites (state machines)

const sprites = AGENTS.map((a, i) => {
  const r = ROOMS[a.room];
  return {
    agent: a, room: a.room,
    floor: r.floor, x: r.cx + (i % 2 ? 30 : -30), y: floorY(r.floor),
    tx: null, speed: 55 + Math.random() * 20,
    state: "pause", pause: 1 + Math.random() * 3,
    walkPhase: Math.random() * 10, flip: false,
    workT: 0, deskX: 0, hidden: false,
    convoUntil: 0, convoCooldown: performance.now() + 8000 + Math.random() * 15000,
    chatting: false, meetingSeat: null, mode: "free", // free | meeting | townhall
    afterArrive: null, liftTo: 0,
  };
});
const spriteOf = (id) => sprites.find((s) => s.agent.id === id);

function walkTo(s, floor, x, after) {
  s.afterArrive = after || null;
  if (floor === s.floor) { s.tx = x; s.state = "walk"; }
  else {
    s.tx = SHAFT_MID;
    s.state = "walk";
    s.pendingLift = { floor, x };
  }
}

function updateSprite(s, dt, now) {
  s.y = floorY(s.floor);
  if (s.hidden) return; // riding elevator
  if (s.state === "walk") {
    const dx = s.tx - s.x;
    if (Math.abs(dx) < 3) {
      s.x = s.tx;
      if (s.pendingLift) {
        const p = s.pendingLift; s.pendingLift = null;
        requestRide(s, p.floor);
        s.tx = p.x;
        s.afterLiftX = p.x;
        return;
      }
      const after = s.afterArrive; s.afterArrive = null;
      if (after === "work") { s.state = "work"; s.workT = 4 + Math.random() * 3; }
      else if (after === "seat") { s.state = "seated"; }
      else if (after === "crowd") { s.state = "crowd"; }
      else if (after === "podium") { s.state = "podium"; }
      else { s.state = "pause"; s.pause = 1.5 + Math.random() * 3.5; }
    } else {
      s.flip = dx < 0;
      s.x += Math.sign(dx) * s.speed * dt;
      s.walkPhase += dt * 10;
    }
  } else if (s.state === "waitLift") {
    // handled by elevator; if it never comes (safety), teleport after 12s
    s.liftWait = (s.liftWait || 0) + dt;
    if (s.liftWait > 12) {
      s.liftWait = 0;
      s.floor = s.liftTo;
      s.state = "walk";
      s.tx = s.afterLiftX ?? ROOMS[s.room].cx;
    }
  } else if (s.state === "work") {
    s.workT -= dt;
    if (s.workT <= 0) { s.state = "pause"; s.pause = 1 + Math.random() * 2; }
  } else if (s.state === "pause") {
    if (s.mode !== "free" || s.chatting) return;
    s.pause -= dt;
    if (s.pause <= 0) {
      // wander within own room, occasionally visit a random other room
      if (Math.random() < 0.18) {
        const keys = Object.keys(ROOMS).filter((k) => k !== "townhall");
        const dest = ROOMS[keys[Math.floor(Math.random() * keys.length)]];
        walkTo(s, dest.floor, dest.x0 + 30 + Math.random() * (dest.x1 - dest.x0 - 60));
      } else {
        const r = ROOMS[s.room];
        walkTo(s, r.floor, r.x0 + 25 + Math.random() * (r.x1 - r.x0 - 50));
      }
    }
  }
}

function frameFor(s, now) {
  if (s.state === "walk") return Math.floor(s.walkPhase) % 2 ? FRAMES.walk1 : FRAMES.walk2;
  if (s.state === "work") return FRAMES.work1;
  if (s.state === "crowd" && meetingCtl.cheer) return FRAMES.cheer;
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
      if (A.floor !== B.floor || Math.abs(A.x - B.x) > 70 || A.hidden || B.hidden) continue;
      // start a conversation
      A.flip = A.x > B.x; B.flip = B.x > A.x;
      const la = LINES[A.agent.id], lb = LINES[B.agent.id];
      const open = la.open[Math.floor(Math.random() * la.open.length)];
      const reply = lb.reply[Math.floor(Math.random() * lb.reply.length)];
      const ack = ACKS[Math.floor(Math.random() * ACKS.length)];
      say(A, open, 3);
      setTimeout(() => say(B, reply, 3), 3100);
      setTimeout(() => say(A, ack, 1.6), 6300);
      const hold = 8500;
      A.pause = B.pause = hold / 1000;
      A.convoCooldown = B.convoCooldown = now + 25000 + Math.random() * 30000;
      pushLog(A.agent, `💬 chatting with ${B.agent.name}: "${open}"`);
      return; // one new convo per tick
    }
  }
}

// ---------------------------------------------------------------- meetings + town hall

const meetingCtl = { phase: "idle", attendees: [], step: 0, timer: 0, cheer: false, kind: null };

function startMeeting() {
  const mgr = spriteOf("manager");
  const pool = sprites.filter((s) => s.agent.id !== "manager" && !s.chatting);
  const attendees = pool.sort(() => Math.random() - 0.5).slice(0, 4);
  meetingCtl.kind = "standup";
  meetingCtl.phase = "gather";
  meetingCtl.attendees = [mgr, ...attendees];
  meetingCtl.timer = 22;
  meetingCtl.step = 0;
  say(mgr, "📢 Standup in the MEETING BAY — now!", 3);
  pushLog(byId("manager"), "📢 called a standup in MEETING BAY");
  const m = ROOMS.meeting;
  const seats = [m.x0 + 40, m.x0 + 105, m.x0 + 170, m.x0 + 235, m.x0 + 300];
  meetingCtl.attendees.forEach((s, i) => {
    s.mode = "meeting";
    walkTo(s, m.floor, seats[i] ?? m.cx, "seat");
  });
  focusCamera(m.cx, floorY(m.floor) - 60, 1.6);
}

function startTownhall() {
  meetingCtl.kind = "townhall";
  meetingCtl.phase = "gather";
  meetingCtl.timer = 26;
  meetingCtl.step = 0;
  meetingCtl.attendees = [...sprites];
  const t = ROOMS.townhall;
  const mgr = spriteOf("manager");
  pushLog(byId("manager"), "🎤 ALL HANDS — town hall on the ground floor!");
  say(mgr, "🎤 ALL HANDS in the TOWN HALL. Everyone down!", 3);
  sprites.forEach((s, i) => {
    s.mode = "townhall";
    if (s.agent.id === "manager") walkTo(s, t.floor, t.x0 + 55, "podium");
    else walkTo(s, t.floor, t.x0 + 140 + (i % 5) * 55 + Math.floor(i / 5) * 22, "crowd");
  });
  focusCamera(t.cx, floorY(t.floor) - 60, 1.5);
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
      // townhall speech
      if (meetingCtl.step < SPEECHES.length) {
        const text = SPEECHES[meetingCtl.step]();
        say(mgr, text, 3.6);
        pushLog(byId("manager"), `🎤 "${text}"`);
        meetingCtl.cheer = true;
        setTimeout(() => (meetingCtl.cheer = false), 1800);
        sprites.forEach((s) => {
          if (s.agent.id !== "manager" && Math.random() < 0.6)
            floaters.push({ x: s.x + (Math.random() * 20 - 10), y: s.y - 45, emoji: ["👏", "🚀", "💯", "🔥"][Math.floor(Math.random() * 4)], life: 1.6 });
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
        s.meetingSeat = null;
        const r = ROOMS[s.room];
        walkTo(s, r.floor, r.cx + (Math.random() * 60 - 30));
      });
      meetingCtl.attendees = [];
      meetingCtl.phase = "idle";
      if (now > userCamUntil) fitDefault();
    }
  }
}

// schedule meetings + townhalls
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
      <div class="agent-wf">💬 click to chat via n8n</div>
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

pushLog(null, `TOWER ONLINE — linked to ${SNAP.instance} (${SNAP.totals.workflows} workflows, ${SNAP.totals.executions} runs)`);
pushLog(null, "Agents talk, meet and hold town halls. Click anyone to chat via n8n 💬");

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
    if (s.mode === "free" && !s.chatting && s.state === "pause") {
      const r = ROOMS[s.room];
      s.deskX = r.desks[Math.floor(Math.random() * r.desks.length)];
      walkTo(s, r.floor, s.deskX, "work");
    }
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
  focusCamera(s.x, s.y - 60, 1.7);
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

// ---------------------------------------------------------------- input: pan/zoom/click

let dragging = false, moved = false, px = 0, py = 0;
canvas.addEventListener("pointerdown", (e) => {
  dragging = true; moved = false; px = e.clientX; py = e.clientY;
  canvas.classList.add("dragging");
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
    // hit test agents (bounding box ~34x40 above feet)
    const hit = sprites.find((s) => !s.hidden &&
      Math.abs(wx - s.x) < 20 && wy < s.y + 6 && wy > s.y - 44);
    if (hit) openChat(hit.agent);
  }
  dragging = false;
});
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  const nz = Math.max(0.35, Math.min(3.2, cam.zoom * (e.deltaY < 0 ? 1.12 : 0.9)));
  cam.x = wx - (wx - cam.x) * (cam.zoom / nz);
  cam.y = wy - (wy - cam.y) * (cam.zoom / nz);
  cam.zoom = nz;
  camGoal.x = cam.x; camGoal.y = cam.y; camGoal.zoom = nz;
  userCamUntil = performance.now() + 30000;
}, { passive: false });

// ---------------------------------------------------------------- drawing the tower

function px_(v) { return Math.round(v); } // crisper pixels

function drawNeonSign(x, y, text, color, now) {
  ctx.font = "bold 13px 'Share Tech Mono', monospace";
  const w = ctx.measureText(text).width + 14;
  const flicker = Math.sin(now / 90 + x) > -0.92 ? 1 : 0.35;
  ctx.fillStyle = "rgba(8,6,18,0.9)";
  ctx.fillRect(x - w / 2, y - 14, w, 18);
  ctx.strokeStyle = color;
  ctx.globalAlpha = flicker;
  ctx.strokeRect(x - w / 2, y - 14, w, 18);
  ctx.shadowColor = color; ctx.shadowBlur = 10 * flicker;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function drawDesk(x, y, accent, busy, now) {
  ctx.fillStyle = "#191536";
  ctx.fillRect(x - 22, y - 26, 44, 6);       // tabletop
  ctx.fillRect(x - 18, y - 20, 5, 20);       // legs
  ctx.fillRect(x + 13, y - 20, 5, 20);
  // monitor
  ctx.fillStyle = "#0c0a1e";
  ctx.fillRect(x - 10, y - 44, 22, 17);
  ctx.fillStyle = busy ? accent : mixHex(accent, "#0c0a1e", 0.7);
  if (busy && Math.floor(now / 160) % 2) ctx.fillStyle = mixHex(accent, "#ffffff", 0.3);
  ctx.fillRect(x - 8, y - 42, 18, 13);
  ctx.fillStyle = "#191536";
  ctx.fillRect(x - 2, y - 27, 6, 3);
}

function drawServer(x, y, now) {
  ctx.fillStyle = "#12102a";
  ctx.fillRect(x, y - 52, 26, 52);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = "#0a0820";
    ctx.fillRect(x + 3, y - 47 + i * 10, 20, 7);
    const on = Math.sin(now / 260 + x + i * 5) > 0;
    ctx.fillStyle = on ? (i % 2 ? "#3cff9e" : "#00dcff") : "#231f45";
    ctx.fillRect(x + 17, y - 45 + i * 10, 4, 3);
  }
}

function drawPlant(x, y) {
  ctx.fillStyle = "#5a2d1a";
  ctx.fillRect(x - 6, y - 10, 12, 10);
  ctx.fillStyle = "#2ea35c";
  ctx.fillRect(x - 9, y - 24, 6, 14);
  ctx.fillRect(x - 2, y - 30, 5, 20);
  ctx.fillRect(x + 5, y - 22, 6, 12);
}

function drawCouch(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 28, y - 18, 56, 12);
  ctx.fillRect(x - 28, y - 30, 8, 14);
  ctx.fillRect(x + 20, y - 30, 8, 14);
  ctx.fillStyle = mixHex(color, "#000000", 0.35);
  ctx.fillRect(x - 24, y - 6, 6, 6);
  ctx.fillRect(x + 18, y - 6, 6, 6);
}

function drawWhiteboard(x, y, accent) {
  ctx.fillStyle = "#e8ecf5";
  ctx.fillRect(x - 24, y - 58, 48, 30);
  ctx.strokeStyle = "#454a63";
  ctx.strokeRect(x - 24, y - 58, 48, 30);
  ctx.strokeStyle = accent;
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 40); ctx.lineTo(x - 6, y - 50); ctx.lineTo(x + 4, y - 44); ctx.lineTo(x + 16, y - 52);
  ctx.stroke();
  ctx.fillStyle = "#12102a";
  ctx.fillRect(x - 2, y - 28, 4, 28);
}

function drawMeetingTable(x, y) {
  ctx.fillStyle = "#241f45";
  ctx.fillRect(x - 110, y - 24, 220, 8);
  ctx.fillStyle = "#191536";
  ctx.fillRect(x - 100, y - 16, 6, 16);
  ctx.fillRect(x + 94, y - 16, 6, 16);
  // big screen on wall
  ctx.fillStyle = "#0c0a1e";
  ctx.fillRect(x + 118, y - 92, 52, 34);
  ctx.fillStyle = "rgba(255,79,216,0.5)";
  ctx.fillRect(x + 121, y - 89, 46, 28);
}

function drawPodium(x, y) {
  ctx.fillStyle = "#241f45";
  ctx.fillRect(x - 14, y - 30, 28, 30);
  ctx.fillStyle = PAL.neonAmber;
  ctx.fillRect(x - 16, y - 32, 32, 4);
  // mic
  ctx.strokeStyle = "#666";
  ctx.beginPath(); ctx.moveTo(x + 8, y - 32); ctx.lineTo(x + 12, y - 44); ctx.stroke();
  ctx.fillStyle = "#ddd";
  ctx.fillRect(x + 10, y - 48, 5, 5);
}

function drawCrates(x, y) {
  const crate = (cx, cy) => {
    ctx.fillStyle = "#0f2d40";
    ctx.fillRect(cx, cy - 20, 26, 20);
    ctx.strokeStyle = "#00dcff";
    ctx.strokeRect(cx, cy - 20, 26, 20);
    ctx.fillStyle = "#00dcff";
    ctx.font = "8px 'Share Tech Mono', monospace";
    ctx.fillText("N:OV", cx + 3, cy - 8);
  };
  crate(x, y); crate(x + 30, y); crate(x + 15, y - 22);
}

function drawRoomKit(r, y, now) {
  const accent = r.sign;
  if (r.kit === "office" || r.kit === "studio" || r.kit === "lab" || r.kit === "exec") {
    drawDesk(r.desks[0], y, accent, deskBusy(r, 0), now);
    drawDesk(r.desks[1], y, accent, deskBusy(r, 1), now);
    if (r.kit === "lab") drawServer(r.x1 - 42, y, now);
    if (r.kit === "studio") drawWhiteboard(r.x1 - 50, y, accent);
    if (r.kit === "exec") { drawWhiteboard(r.x1 - 50, y, accent); drawPlant(r.x0 + 18, y); }
    if (r.kit === "office") drawPlant(r.x1 - 24, y);
  } else if (r.kit === "lounge") {
    drawCouch(r.cx - 60, y, "#1d3a5e");
    drawDesk(r.desks[1], y, accent, deskBusy(r, 1), now);
    drawPlant(r.x0 + 18, y);
  } else if (r.kit === "meeting") {
    drawMeetingTable(r.cx - 20, y);
  } else if (r.kit === "hall") {
    drawPodium(r.x0 + 55, y);
    ctx.fillStyle = "rgba(255,184,77,0.12)";
    ctx.fillRect(r.x0 + 20, y - 90, 90, 90);   // podium spotlight
  } else if (r.kit === "factory") {
    drawCrates(r.x0 + 30, y);
    drawCrates(r.x1 - 100, y);
    drawServer(r.cx, y, now);
  }
}

function deskBusy(r, i) {
  return sprites.some((s) => s.state === "work" && ROOMS[s.room] === r && Math.abs(s.x - r.desks[i]) < 26);
}

// pre-generated background stars + skyline
const stars = Array.from({ length: 140 }, () => ({
  x: Math.random() * 2400 - 600, y: Math.random() * 900 - 500, r: Math.random() * 1.5 + 0.4,
}));

function draw(now, dt) {
  const W = canvas._w, H = canvas._h, dpr = canvas._dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // sky
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, PAL.bgTop);
  grad.addColorStop(1, PAL.bgBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // camera transform
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);

  // stars
  ctx.fillStyle = "#c9b8ff";
  stars.forEach((s) => {
    ctx.globalAlpha = 0.4 + 0.4 * Math.sin(now / 900 + s.x);
    ctx.fillRect(s.x, s.y, s.r, s.r);
  });
  ctx.globalAlpha = 1;

  // magenta horizon beam behind tower
  ctx.fillStyle = "rgba(255,79,216,0.14)";
  ctx.fillRect(-600, GROUND_Y + 8, 2400, 26);
  ctx.fillStyle = "rgba(255,79,216,0.5)";
  ctx.fillRect(-600, GROUND_Y + 14, 2400, 3);

  // tower body
  ctx.fillStyle = "#161227";
  ctx.fillRect(TOWER_X0 - 14, floorY(5) - FLOOR_H - 20, (TOWER_X1 - TOWER_X0) + 28, GROUND_Y - (floorY(5) - FLOOR_H) + 40);

  // rooms + floors
  Object.values(ROOMS).forEach((r) => {
    const yF = floorY(r.floor);
    const yTop = yF - FLOOR_H + SLAB;
    // wallpaper
    ctx.fillStyle = r.wall;
    ctx.fillRect(r.x0, yTop, r.x1 - r.x0, FLOOR_H - SLAB);
    // subtle wall panels
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let wx = r.x0 + 20; wx < r.x1 - 20; wx += 46) ctx.fillRect(wx, yTop + 12, 30, FLOOR_H - SLAB - 40);
    // window glow strip at ceiling
    ctx.fillStyle = "rgba(46,230,200,0.10)";
    ctx.fillRect(r.x0, yTop, r.x1 - r.x0, 8);
    // furniture
    drawRoomKit(r, yF, now);
    // neon sign
    drawNeonSign(r.cx, yTop + 26, r.name, r.sign, now);
  });

  // floor slabs
  for (let f = 0; f <= 5; f++) {
    const y = floorY(f);
    ctx.fillStyle = PAL.slab;
    ctx.fillRect(TOWER_X0 - 14, y, (TOWER_X1 - TOWER_X0) + 28, SLAB);
    ctx.fillStyle = "rgba(46,230,200,0.55)";
    ctx.fillRect(TOWER_X0 - 14, y, (TOWER_X1 - TOWER_X0) + 28, 2);
  }
  // roof + sign
  const roofY = floorY(5) - FLOOR_H;
  ctx.fillStyle = PAL.slab;
  ctx.fillRect(TOWER_X0 - 14, roofY - 8, (TOWER_X1 - TOWER_X0) + 28, 20);
  drawNeonSign(600, roofY - 24, "◈ BIOGREEN AGENT TOWER", PAL.neonPink, now);
  // antenna
  ctx.strokeStyle = "#454a63";
  ctx.beginPath(); ctx.moveTo(980, roofY - 8); ctx.lineTo(980, roofY - 70); ctx.stroke();
  ctx.fillStyle = Math.floor(now / 500) % 2 ? "#ff4f4f" : "#5a1020";
  ctx.fillRect(977, roofY - 76, 7, 7);

  // elevator shaft
  ctx.fillStyle = PAL.shaft;
  ctx.fillRect(SHAFT_X0, roofY + 12, SHAFT_X1 - SHAFT_X0, GROUND_Y - roofY - 12 + SLAB);
  ctx.strokeStyle = "rgba(46,230,200,0.35)";
  ctx.strokeRect(SHAFT_X0, roofY + 12, SHAFT_X1 - SHAFT_X0, GROUND_Y - roofY - 12 + SLAB);
  // rails
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(SHAFT_X0 + 6, roofY + 12, 2, GROUND_Y - roofY);
  ctx.fillRect(SHAFT_X1 - 8, roofY + 12, 2, GROUND_Y - roofY);
  // cab
  const cabY = floorY(elevator.f);
  ctx.fillStyle = PAL.cab;
  ctx.fillRect(SHAFT_X0 + 8, cabY - 54, SHAFT_X1 - SHAFT_X0 - 16, 54);
  ctx.strokeStyle = PAL.neonTeal;
  ctx.strokeRect(SHAFT_X0 + 8, cabY - 54, SHAFT_X1 - SHAFT_X0 - 16, 54);
  ctx.fillStyle = "rgba(46,230,200,0.25)";
  ctx.fillRect(SHAFT_X0 + 12, cabY - 48, SHAFT_X1 - SHAFT_X0 - 24, 20);
  if (elevator.riders.length) {
    ctx.fillStyle = "#fff";
    ctx.font = "11px 'Share Tech Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("👥" + elevator.riders.length, SHAFT_MID, cabY - 20);
    ctx.textAlign = "left";
  }

  // agents (sorted so lower floors draw later = in front? same plane; sort by y)
  sprites.slice().sort((a, b) => a.y - b.y).forEach((s) => {
    if (s.hidden) return;
    drawSprite(s.agent, s.x, s.y, frameFor(s, now), s.flip, bubbles.some((b) => b.s === s), now);
    if (s.chatting) {
      ctx.strokeStyle = s.agent.color;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -(now / 60);
      ctx.strokeRect(s.x - 22, s.y - 46, 44, 50);
      ctx.setLineDash([]);
    }
  });

  drawBubbles(now);
  drawFloaters(dt, now);

  ctx.restore();

  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(2,1,8,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main loop

let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  updateElevator(dt);
  sprites.forEach((s) => updateSprite(s, dt, now));
  tryConversations(now);
  updateMeetings(dt, now);

  // camera easing
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
