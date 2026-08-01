/* BIOGREEN // AGENT OPERATIONS HQ
   Live cyberpunk facility map for the Bio Green Elixirs AI agent team.
   Vanilla canvas — no dependencies. */

// ---------------------------------------------------------------- config

// Virtual map space; scaled to fit the canvas.
const W = 1600, H = 1000;

const ROOMS = {
  core:      { name: "CLAUDE CORE",     x: 620, y: 380, w: 360, h: 240 },
  content:   { name: "CONTENT STUDIO",  x:  80, y:  70, w: 420, h: 250 },
  ads:       { name: "ADS LAB",         x: 1100, y:  70, w: 420, h: 250 },
  support:   { name: "SUPPORT DESK",    x:  80, y: 400, w: 420, h: 250 },
  research:  { name: "RESEARCH BAY",    x: 1100, y: 400, w: 420, h: 250 },
  affiliate: { name: "AFFILIATE HUB",   x:  80, y: 720, w: 420, h: 210 },
  logistics: { name: "LOGISTICS DOCK",  x: 1100, y: 720, w: 420, h: 210 },
};

const AGENTS = [
  {
    id: "core", name: "CLAUDE", role: "Orchestrator — routes every task", room: "core", color: "#00dcff",
    tasks: [
      "routed daily briefing to all 5 agents",
      "reprioritized queue: TikTok campaign first",
      "approved Content Agent's caption batch",
      "synced Shopify inventory with Logistics",
      "compiled evening KPI report for Ryan",
    ],
  },
  {
    id: "content", name: "NOVA", role: "Content Agent — captions, ad copy, emails", room: "content", color: "#3cff9e",
    tasks: [
      "wrote 5 TikTok hooks for BIO N:OV",
      "drafted Klaviyo welcome email #3",
      "generated 12 captions with #BIONOV tags",
      "localized product page copy for Malaysia",
      "storyboarded 24s ad: hook → science → CTA",
    ],
  },
  {
    id: "ads", name: "PULSE", role: "Ads Agent — Meta + TikTok Smart+ campaigns", room: "ads", color: "#ff5c8a",
    tasks: [
      "launched TikTok Smart+ variant B (SG 40-65)",
      "killed adset #14 — CPA above target",
      "scaled winner: +42% blood flow hook",
      "refreshed Meta Advantage+ creatives",
      "A/B test done: story hook beats stat hook",
    ],
  },
  {
    id: "support", name: "ECHO", role: "Support Agent — 24/7 chat + WhatsApp", room: "support", color: "#ffb84d",
    tasks: [
      "answered dosage question: 3x daily, 1 tab",
      "resolved shipping query for Thailand order",
      "escalated wholesale inquiry to Ryan",
      "sent tracking link to customer #2841",
      "logged FAQ candidate: 'safe with meds?'",
    ],
  },
  {
    id: "research", name: "LEDGER", role: "Research Agent — trends + competitor gaps", room: "research", color: "#b18cff",
    tasks: [
      "found trending hook: 'Nobel Prize molecule'",
      "scanned 200 competitor ads on Minea",
      "flagged rising keyword: 'nitric oxide over 40'",
      "mapped Shopee SG price gap: -12% vs rivals",
      "trend report: green-screen ads up 3x",
    ],
  },
  {
    id: "affiliate", name: "ORBIT", role: "Affiliate Agent — creators + commissions", room: "affiliate", color: "#4dd2ff",
    tasks: [
      "recruited 3 wellness creators (50k-120k)",
      "paid out commissions: 14 affiliates",
      "sent free sample to @healthyliving.sg",
      "new Loox review synced: 5 stars",
      "affiliate leaderboard updated — top: 22 sales",
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

// ---------------------------------------------------------------- state

const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

let scale = 1, offX = 0, offY = 0;
let selected = null;
let tasksDone = 0, sales = 0, stock = 1240;
const startTime = performance.now();

const packets = [];   // task pulses travelling room → core
const sparks = [];    // arrival burst particles

// Each agent gets a wandering sprite inside its room.
const sprites = AGENTS.map((a) => {
  const r = ROOMS[a.room];
  return {
    agent: a,
    x: r.x + r.w / 2, y: r.y + r.h / 2,
    tx: 0, ty: 0, speed: 26 + Math.random() * 18,
    pause: Math.random() * 2,
    trail: [],
  };
});
sprites.forEach(pickTarget);

function pickTarget(s) {
  const r = ROOMS[s.agent.room];
  s.tx = r.x + 40 + Math.random() * (r.w - 80);
  s.ty = r.y + 55 + Math.random() * (r.h - 90);
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
    </div>
    <div class="agent-status">● ACTIVE</div>`;
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

pushLog(null, "BIOGREEN AGENT NETWORK ONLINE — 6 agents reporting");
pushLog(null, "Mission: scale BIO N:OV worldwide 🌍");

// Simulated agent activity → log line + packet to core.
function scheduleEvent() {
  setTimeout(() => {
    const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    const msg = a.tasks[Math.floor(Math.random() * a.tasks.length)];
    pushLog(a, msg);
    tasksDone++;
    if (a.id !== "core") spawnPacket(a);
    // ~18% of events are a sale ping from the storefront.
    if (Math.random() < 0.18) {
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
  document.getElementById("stat-tasks").textContent = tasksDone;
  document.getElementById("stat-sales").textContent = sales;
  document.getElementById("stat-stock").textContent = stock.toLocaleString();
}

// Clocks
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

  // floor
  ctx.fillStyle = id === "core" ? "rgba(0,220,255,0.05)" : "rgba(10,30,45,0.55)";
  ctx.fillRect(r.x, r.y, r.w, r.h);

  // floor grid
  ctx.strokeStyle = "rgba(0,220,255,0.06)";
  ctx.lineWidth = 1;
  for (let gx = r.x + 40; gx < r.x + r.w; gx += 40) {
    ctx.beginPath(); ctx.moveTo(gx, r.y); ctx.lineTo(gx, r.y + r.h); ctx.stroke();
  }
  for (let gy = r.y + 40; gy < r.y + r.h; gy += 40) {
    ctx.beginPath(); ctx.moveTo(r.x, gy); ctx.lineTo(r.x + r.w, gy); ctx.stroke();
  }

  // walls
  ctx.strokeStyle = `rgba(0,220,255,${glow})`;
  ctx.lineWidth = isSel ? 3 : 2;
  ctx.shadowColor = "#00dcff";
  ctx.shadowBlur = isSel ? 18 : 8;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  ctx.shadowBlur = 0;

  // corner ticks
  ctx.strokeStyle = "rgba(0,220,255,0.9)";
  ctx.lineWidth = 3;
  const c = 14;
  [[r.x, r.y, 1, 1], [r.x + r.w, r.y, -1, 1], [r.x, r.y + r.h, 1, -1], [r.x + r.w, r.y + r.h, -1, -1]]
    .forEach(([px, py, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(px + sx * c, py); ctx.lineTo(px, py); ctx.lineTo(px, py + sy * c);
      ctx.stroke();
    });

  // label
  ctx.fillStyle = "rgba(0,220,255,0.9)";
  ctx.font = "13px 'Share Tech Mono', monospace";
  ctx.fillText(r.name, r.x + 12, r.y + 22);

  // server racks — blinking prop lights along the top wall
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
}

function drawCorridors(t) {
  ctx.strokeStyle = "rgba(0,220,255,0.14)";
  ctx.lineWidth = 10;
  const core = roomCenter(ROOMS.core);
  Object.entries(ROOMS).forEach(([id, r]) => {
    if (id === "core") return;
    const c = roomCenter(r);
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(core.x, core.y); ctx.stroke();
  });
  // animated flow dashes
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
  // trail
  s.trail.forEach((p, i) => {
    ctx.fillStyle = a.color + "22";
    const rad = 3 * (i / s.trail.length);
    ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.fill();
  });
  // glow body
  const pulse = 1 + 0.15 * Math.sin(t / 250 + s.x);
  ctx.shadowColor = a.color;
  ctx.shadowBlur = 16;
  ctx.fillStyle = a.color;
  ctx.beginPath(); ctx.arc(s.x, s.y, 7 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#04070d";
  ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, Math.PI * 2); ctx.fill();
  // name tag
  ctx.fillStyle = a.color;
  ctx.font = "11px 'Share Tech Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(a.name, s.x, s.y - 14);
  ctx.textAlign = "left";
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const rect = canvas.parentElement.getBoundingClientRect();

  // update sprites
  sprites.forEach((s) => {
    if (s.pause > 0) { s.pause -= dt; }
    else {
      const dx = s.tx - s.x, dy = s.ty - s.y;
      const d = Math.hypot(dx, dy);
      if (d < 4) { s.pause = 0.5 + Math.random() * 2.5; pickTarget(s); }
      else { s.x += (dx / d) * s.speed * dt; s.y += (dy / d) * s.speed * dt; }
    }
    s.trail.push({ x: s.x, y: s.y });
    if (s.trail.length > 14) s.trail.shift();
  });

  // update packets
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

  // backdrop grid
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
  ctx.arc(core.x, core.y, 46 + 5 * Math.sin(now / 500), 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(core.x, core.y, 28, now / 800, now / 800 + Math.PI * 1.4);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#00dcff";
  ctx.font = "bold 12px 'Share Tech Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("🌿", core.x, core.y + 4);
  ctx.textAlign = "left";

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

  sprites.forEach((s) => drawSprite(s, now));

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
  const agent = AGENTS.find((a) => a.room === hit[0]);
  select(agent && selected !== agent.id ? agent.id : null);
});
