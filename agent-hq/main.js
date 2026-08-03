/* BIOGREEN // AGENT OPERATIONS HQ — pixel tower edition
   AI-painted neon office tower (assets/tower-bg.jpg, generated with Kling).
   Agents walk the painted floors, ride the elevator shaft, talk with
   speech bubbles, hold standups in the Meeting Bay and town halls on the
   stage — with live chat wired to the real n8n instance. */

"use strict";

const CFG = window.HQ_CONFIG;
const SNAP = window.N8N_SNAPSHOT;

// ---------------------------------------------------------------- artwork layout
// World units = background image pixels (1400 x 1400).

const ART_W = 1400, ART_H = 1400;
// Walkable floor line per storey, ground (0) to top (5) — measured on the art.
const FEET_Y = [1385, 1178, 985, 788, 594, 398];
const SHAFT_MID = 697;
const LX0 = 70, LX1 = 595, RX0 = 790, RX1 = 1340;
const floorY = (f) => FEET_Y[f];

const ROOMS = {
  manager:   { name: "MANAGER OFFICE", floor: 5, x0: LX0, x1: LX1, sign: "#00dcff", desks: [255, 360] },
  meeting:   { name: "MEETING BAY",    floor: 5, x0: RX0, x1: RX1, sign: "#ff4fd8", desks: [1000, 1150] },
  content:   { name: "CONTENT STUDIO", floor: 4, x0: LX0, x1: LX1, sign: "#3cff9e", desks: [150, 300, 470] },
  ads:       { name: "ADS LAB",        floor: 4, x0: RX0, x1: RX1, sign: "#ff5c8a", desks: [900, 1040, 1200] },
  inbox:     { name: "INBOX HUB",      floor: 3, x0: LX0, x1: LX1, sign: "#25d366", desks: [150, 290, 480] },
  support:   { name: "SUPPORT DESK",   floor: 3, x0: RX0, x1: RX1, sign: "#ffb84d", desks: [880, 1010, 1150, 1270] },
  research:  { name: "RESEARCH BAY",   floor: 2, x0: LX0, x1: LX1, sign: "#b18cff", desks: [300, 430] },
  web:       { name: "WEB FORGE",      floor: 2, x0: RX0, x1: RX1, sign: "#8c9eff", desks: [890, 1040, 1250] },
  voice:     { name: "VOICE OPS",      floor: 1, x0: LX0, x1: LX1, sign: "#ff8c42", desks: [145, 255, 365, 475] },
  affiliate: { name: "AFFILIATE HUB",  floor: 1, x0: RX0, x1: RX1, sign: "#4dd2ff", desks: [880, 1010, 1230] },
  townhall:  { name: "TOWN HALL",      floor: 0, x0: LX0, x1: LX1, sign: "#ffb84d", desks: [] },
  factory:   { name: "FACTORY",        floor: 0, x0: RX0, x1: RX1, sign: "#2ee6c8", desks: [880, 1010, 1130] },
};
Object.values(ROOMS).forEach((r) => { r.cx = (r.x0 + r.x1) / 2; });

const PODIUM_X = 240;
const CROWD_X0 = 330, CROWD_STEP = 44;
const MEET_HEAD_X = 830, MEET_SEATS = [950, 1045, 1140, 1235, 1310];

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

const bg = new Image();
bg.src = "assets/tower-bg.jpg";

const cam = { x: 700, y: 700, zoom: 0.75 };
const camGoal = { x: 700, y: 700, zoom: 0.75 };
let userCamUntil = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas._w = rect.width; canvas._h = rect.height; canvas._dpr = dpr;
  fitDefault();
}
function fitDefault() {
  // Fill the full viewport height with the tower; pan sideways if it overflows.
  camGoal.zoom = canvas._h / ART_H;
  camGoal.x = ART_W / 2; camGoal.y = ART_H / 2;
}
window.addEventListener("resize", resize);

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
const PXS = 5; // sprite ~40 x 50 world px

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
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // dark outline for readability against the busy art
  ctx.fillStyle = "rgba(5,3,12,0.55)";
  for (let r = 0; r < rows; r++) {
    const row = frame[r];
    for (let c = 0; c < cols; c++) {
      const ch = row[flip ? cols - 1 - c : c];
      if (ch === ".") continue;
      ctx.fillRect(x - w / 2 + c * PXS - 1.5, y - h + r * PXS - 1.5, PXS + 3, PXS + 3);
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
  ctx.font = "bold 15px 'Share Tech Mono', monospace";
  const tw = ctx.measureText(a.name).width + 12;
  ctx.fillStyle = "rgba(10,8,20,0.9)";
  ctx.fillRect(x - tw / 2, y - h - 24, tw, 18);
  ctx.strokeStyle = a.color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - tw / 2, y - h - 24, tw, 18);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(a.name, x, y - h - 10);
  ctx.textAlign = "left";
}

// ---------------------------------------------------------------- speech bubbles

const bubbles = [];
function say(sprite, text, secs = 2.8) {
  bubbles.push({ s: sprite, text, until: performance.now() + secs * 1000 });
}

function drawBubbles(now) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    if (now > b.until) { bubbles.splice(i, 1); continue; }
    const x = b.s.x, y = b.s.y - 80;
    ctx.font = "15px 'Share Tech Mono', monospace";
    const maxW = 240;
    const words = b.text.split(" ");
    const lines = [];
    let cur = "";
    words.forEach((w) => {
      if (ctx.measureText(cur + " " + w).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = cur ? cur + " " + w : w;
    });
    lines.push(cur);
    const bw = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width))) + 20;
    const bh = lines.length * 19 + 12;
    const bx = Math.max(20, Math.min(ART_W - 20 - bw, x - bw / 2));
    const by = y - bh;
    ctx.fillStyle = "rgba(250,252,255,0.97)";
    ctx.strokeStyle = b.s.agent.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 5);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 6, by + bh); ctx.lineTo(x + 6, by + bh); ctx.lineTo(x, by + bh + 9);
    ctx.closePath();
    ctx.fillStyle = "rgba(250,252,255,0.97)";
    ctx.fill();
    ctx.fillStyle = "#141126";
    lines.forEach((l, li) => ctx.fillText(l, bx + 10, by + 20 + li * 19));
  }
}

const floaters = [];
function drawFloaters(dt) {
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.y -= 30 * dt; f.life -= dt;
    if (f.life <= 0) { floaters.splice(i, 1); continue; }
    ctx.globalAlpha = Math.min(1, f.life);
    ctx.font = "22px sans-serif";
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
  const SPEED = 1.4;
  if (elevator.target === null) {
    if (elevator.riders.length) elevator.target = elevator.riders[0].liftTo;
    else if (elevator.waiting.length) elevator.target = elevator.waiting[0].floor;
  }
  if (elevator.target !== null) {
    const d = elevator.target - elevator.f;
    if (Math.abs(d) < 0.03) {
      elevator.f = elevator.target;
      elevator.target = null;
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
      for (let i = elevator.waiting.length - 1; i >= 0; i--) {
        const w = elevator.waiting[i];
        if (w.floor === elevator.f && Math.abs(w.x - SHAFT_MID) < 40) {
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

// ---------------------------------------------------------------- sprites

const sprites = AGENTS.map((a, i) => {
  const r = ROOMS[a.room];
  return {
    agent: a, room: a.room,
    floor: r.floor, x: r.cx + (i % 2 ? 40 : -40), y: floorY(r.floor),
    tx: null, speed: 70 + Math.random() * 25,
    state: "pause", pause: 1 + Math.random() * 3,
    walkPhase: Math.random() * 10, flip: false,
    workT: 0, hidden: false,
    convoCooldown: performance.now() + 8000 + Math.random() * 15000,
    chatting: false, mode: "free",
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
  if (s.hidden) return;
  if (s.state === "walk") {
    const dx = s.tx - s.x;
    if (Math.abs(dx) < 4) {
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
      if (Math.random() < 0.18) {
        const keys = Object.keys(ROOMS).filter((k) => k !== "townhall");
        const dest = ROOMS[keys[Math.floor(Math.random() * keys.length)]];
        walkTo(s, dest.floor, dest.x0 + 40 + Math.random() * (dest.x1 - dest.x0 - 80));
      } else {
        const r = ROOMS[s.room];
        walkTo(s, r.floor, r.x0 + 35 + Math.random() * (r.x1 - r.x0 - 70));
      }
    }
  }
}

function frameFor(s) {
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
      if (A.floor !== B.floor || Math.abs(A.x - B.x) > 90 || A.hidden || B.hidden) continue;
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

// ---------------------------------------------------------------- meetings + town hall

const meetingCtl = { phase: "idle", attendees: [], step: 0, timer: 0, cheer: false, kind: null };

function startMeeting() {
  const mgr = spriteOf("manager");
  const pool = sprites.filter((s) => s.agent.id !== "manager" && !s.chatting);
  const attendees = pool.sort(() => Math.random() - 0.5).slice(0, 4);
  meetingCtl.kind = "standup";
  meetingCtl.phase = "gather";
  meetingCtl.attendees = [mgr, ...attendees];
  meetingCtl.timer = 24;
  meetingCtl.step = 0;
  say(mgr, "📢 Standup in the MEETING BAY — now!", 3);
  pushLog(byId("manager"), "📢 called a standup in MEETING BAY");
  const m = ROOMS.meeting;
  meetingCtl.attendees.forEach((s, i) => {
    s.mode = "meeting";
    walkTo(s, m.floor, i === 0 ? MEET_HEAD_X : MEET_SEATS[i - 1] ?? m.cx, "seat");
  });
  focusCamera(1060, floorY(5) - 90, Math.min(canvas._w / 640, 1.7));
}

function startTownhall() {
  meetingCtl.kind = "townhall";
  meetingCtl.phase = "gather";
  meetingCtl.timer = 30;
  meetingCtl.step = 0;
  meetingCtl.attendees = [...sprites];
  const t = ROOMS.townhall;
  const mgr = spriteOf("manager");
  pushLog(byId("manager"), "🎤 ALL HANDS — town hall on the ground floor!");
  say(mgr, "🎤 ALL HANDS in the TOWN HALL. Everyone down!", 3);
  sprites.forEach((s, i) => {
    s.mode = "townhall";
    if (s.agent.id === "manager") walkTo(s, t.floor, PODIUM_X, "podium");
    else walkTo(s, t.floor, CROWD_X0 + (i % 6) * CROWD_STEP + Math.floor(i / 6) * 20, "crowd");
  });
  focusCamera(t.cx + 60, floorY(0) - 90, Math.min(canvas._w / 700, 1.5));
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
            floaters.push({ x: s.x + (Math.random() * 24 - 12), y: s.y - 60, emoji: ["👏", "🚀", "💯", "🔥"][Math.floor(Math.random() * 4)], life: 1.6 });
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
        const r = ROOMS[s.room];
        walkTo(s, r.floor, r.cx + (Math.random() * 80 - 40));
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
    const r = ROOMS[s.room];
    if (s.mode === "free" && !s.chatting && s.state === "pause" && r.desks.length) {
      walkTo(s, r.floor, r.desks[Math.floor(Math.random() * r.desks.length)], "work");
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
  focusCamera(s.x, s.y - 70, Math.min(canvas._w / 620, 1.8));
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
    const hit = sprites.find((s) => !s.hidden &&
      Math.abs(wx - s.x) < 28 && wy < s.y + 8 && wy > s.y - 62);
    if (hit) openChat(hit.agent);
  }
  dragging = false;
});
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  const nz = Math.max(0.3, Math.min(3, cam.zoom * (e.deltaY < 0 ? 1.12 : 0.9)));
  cam.x = wx - (wx - cam.x) * (cam.zoom / nz);
  cam.y = wy - (wy - cam.y) * (cam.zoom / nz);
  cam.zoom = nz;
  camGoal.x = cam.x; camGoal.y = cam.y; camGoal.zoom = nz;
  userCamUntil = performance.now() + 30000;
}, { passive: false });

// ---------------------------------------------------------------- drawing

const stars = Array.from({ length: 160 }, () => ({
  x: Math.random() * 3000 - 800, y: Math.random() * 2200 - 400, r: Math.random() * 2 + 0.6,
}));

function drawRoomLabel(r, now) {
  const yTop = floorY(r.floor) - 172;
  ctx.font = "bold 13px 'Share Tech Mono', monospace";
  const tw = ctx.measureText(r.name).width + 12;
  const x = r.x0 + 8, y = yTop;
  const flicker = Math.sin(now / 100 + r.x0) > -0.94 ? 1 : 0.4;
  ctx.globalAlpha = 0.92 * flicker;
  ctx.fillStyle = "rgba(8,6,18,0.85)";
  ctx.fillRect(x, y, tw, 17);
  ctx.strokeStyle = r.sign;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, tw, 17);
  ctx.fillStyle = r.sign;
  ctx.fillText(r.name, x + 6, y + 13);
  ctx.globalAlpha = 1;
}

function draw(now, dt) {
  const W = canvas._w, H = canvas._h, dpr = canvas._dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#1c0b33");
  grad.addColorStop(1, "#0a0518");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);

  // stars beyond the artwork
  ctx.fillStyle = "#c9b8ff";
  stars.forEach((s) => {
    ctx.globalAlpha = 0.35 + 0.35 * Math.sin(now / 900 + s.x);
    ctx.fillRect(s.x, s.y, s.r, s.r);
  });
  ctx.globalAlpha = 1;

  // the AI-painted tower
  if (bg.complete && bg.naturalWidth) ctx.drawImage(bg, 0, 0, ART_W, ART_H);

  Object.values(ROOMS).forEach((r) => drawRoomLabel(r, now));

  sprites.slice().sort((a, b) => a.y - b.y).forEach((s) => {
    if (s.hidden) return;
    drawSprite(s.agent, s.x, s.y, frameFor(s), s.flip, bubbles.some((b) => b.s === s), now);
    if (s.chatting) {
      ctx.strokeStyle = s.agent.color;
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -(now / 60);
      ctx.strokeRect(s.x - 26, s.y - 56, 52, 62);
      ctx.setLineDash([]);
    }
  });

  drawBubbles(now);
  drawFloaters(dt);

  ctx.restore();

  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(2,1,8,0.5)");
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
