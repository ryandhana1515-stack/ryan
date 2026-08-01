/* BIOGREEN // AGENT OPERATIONS HQ — 3D immersive deck
   Voxel agents living on a spaceship deck, pathfinding through corridors,
   with live chat wired to the real n8n instance (see config.js). */

import * as THREE from "./vendor/three.module.min.js";

const CFG = window.HQ_CONFIG;
const SNAP = window.N8N_SNAPSHOT;

// ---------------------------------------------------------------- rooms

// World units: x → starboard, z → aft. Deck is ~170 x 100.
const ROOMS = {
  core:      { name: "AI MANAGER CORE", x: 0,   z: 0,   w: 34, d: 22, doors: ["N", "S", "E", "W"] },
  content:   { name: "CONTENT STUDIO",  x: -55, z: -33, w: 42, d: 24, doors: ["S", "E"] },
  inbox:     { name: "INBOX HUB",       x: 0,   z: -33, w: 42, d: 24, doors: ["S"] },
  ads:       { name: "ADS LAB",         x: 55,  z: -33, w: 42, d: 24, doors: ["S", "W"] },
  support:   { name: "SUPPORT DESK",    x: -55, z: 0,   w: 42, d: 24, doors: ["E", "N", "S"] },
  research:  { name: "RESEARCH BAY",    x: 55,  z: 0,   w: 42, d: 24, doors: ["W", "N", "S"] },
  affiliate: { name: "AFFILIATE HUB",   x: -55, z: 33,  w: 42, d: 24, doors: ["N", "E"] },
  voice:     { name: "VOICE OPS",       x: 0,   z: 33,  w: 42, d: 24, doors: ["N"] },
  web:       { name: "WEB FORGE",       x: 55,  z: 33,  w: 42, d: 24, doors: ["N", "W"] },
};
Object.values(ROOMS).forEach((r) => {
  r.desks = [
    { x: r.x - r.w * 0.24, z: r.z + r.d * 0.16 },
    { x: r.x + r.w * 0.24, z: r.z + r.d * 0.28 },
  ];
});

const AGENTS = [
  { id: "manager",  name: "MANAGER", room: "core",      color: 0x00dcff, status: "ACTIVE",
    role: "AI Manager — Company Orchestrator",
    tasks: ["delegated brief to specialist sub-agents", "18:00 daily summary → Manager Reports", "Mon 07:00 weekly report compiled", "routed build request to the AI CTO"] },
  { id: "content",  name: "NOVA",    room: "content",   color: 0x3cff9e, status: "ACTIVE",
    role: "Content Agent — Daily Social Content",
    tasks: ["09:00 run: 3 TikTok captions → Content Queue", "drafted 1 FB ad + 1 IG caption", "#BIONOV caption batch queued"] },
  { id: "ads",      name: "PULSE",   room: "ads",       color: 0xff5c8a, status: "ACTIVE",
    role: "Ads Agent — Weekly Ad Drafts",
    tasks: ["Mon 10:00: 2 FB ads + 2 TikTok scripts", "5 hook ideas → Ad Drafts", "health-ad compliance pass ✓"] },
  { id: "support",  name: "ECHO",    room: "support",   color: 0xffb84d, status: "ACTIVE",
    role: "Customer Service Agent — 24/7 Chat",
    tasks: ["answered dosage question: 3x daily", "shipping query resolved", "guardrailed affiliate answer sent"] },
  { id: "research", name: "LEDGER",  room: "research",  color: 0xb18cff, status: "ACTIVE",
    role: "Research Agent — Weekly Market Scan",
    tasks: ["Mon 08:00 market scan → report", "flagged: 'nitric oxide over 40' rising", "competitor gap logged"] },
  { id: "affiliate", name: "ORBIT",  room: "affiliate", color: 0x4dd2ff, status: "ACTIVE",
    role: "Affiliate Agent — Welcome New Affiliates",
    tasks: ["/affiliate-signup: welcome sent", "new creator → Affiliate Outreach", "commission terms delivered"] },
  { id: "whatsapp", name: "WAVE",    room: "inbox",     color: 0x25d366, status: "ACTIVE",
    role: "WhatsApp Agent — Cloud API",
    tasks: ["/whatsapp-in: reply sent via Graph API", "lead captured → Leads CRM", "webhook handshake verified"] },
  { id: "omni",     name: "RELAY",   room: "inbox",     color: 0x2ee6c8, status: "ACTIVE",
    role: "Omnichannel AI Hub — Universal Inbox",
    tasks: ["/inbound-message answered from profile", "cross-channel lead logged", "call request routed to VOX"] },
  { id: "voice",    name: "VOX",     room: "voice",     color: 0xff8c42, status: "ACTIVE",
    role: "Voice Agent — Calls + Call Logger",
    tasks: ["ElevenLabs outbound call placed", "transcript → Call Log", "standing by for callbacks"] },
  { id: "web",      name: "FORGE",   room: "web",       color: 0x8c9eff, status: "2 ERR", statusColor: "#ffb84d",
    role: "Website Agent — Immersive 3D Site Designer",
    tasks: ["3D scene plan + Kling prompts packaged", "Lovable build brief handed off", "retrying render pipeline"] },
];

const SALE_EVENTS = [
  "💰 SALE — BIO N:OV x1 → Singapore",
  "💰 SALE — BIO N:OV x2 → Kuala Lumpur",
  "💰 SALE — BIO N:OV x1 → Bangkok",
  "💰 SALE — BIO N:OV x3 → Sydney",
  "💰 SALE — BIO N:OV x1 → London",
];

// ---------------------------------------------------------------- nav grid + A*

const CELL = 2, GW = 88, GD = 56; // 176 x 112 world units
const OX = -GW * CELL / 2, OZ = -GD * CELL / 2;
const blocked = new Uint8Array(GW * GD);

const w2cx = (x) => Math.max(0, Math.min(GW - 1, Math.round((x - OX) / CELL)));
const w2cz = (z) => Math.max(0, Math.min(GD - 1, Math.round((z - OZ) / CELL)));
const c2wx = (cx) => OX + cx * CELL;
const c2wz = (cz) => OZ + cz * CELL;

function blockRect(x0, z0, x1, z1) {
  for (let cx = w2cx(x0); cx <= w2cx(x1); cx++)
    for (let cz = w2cz(z0); cz <= w2cz(z1); cz++) blocked[cz * GW + cx] = 1;
}
function clearRect(x0, z0, x1, z1) {
  for (let cx = w2cx(x0); cx <= w2cx(x1); cx++)
    for (let cz = w2cz(z0); cz <= w2cz(z1); cz++) blocked[cz * GW + cx] = 0;
}

// walls into nav grid: perimeter blocked, doors cleared
const DOOR_W = 8;
Object.values(ROOMS).forEach((r) => {
  const hw = r.w / 2, hd = r.d / 2;
  blockRect(r.x - hw, r.z - hd, r.x + hw, r.z - hd); // N
  blockRect(r.x - hw, r.z + hd, r.x + hw, r.z + hd); // S
  blockRect(r.x - hw, r.z - hd, r.x - hw, r.z + hd); // W
  blockRect(r.x + hw, r.z - hd, r.x + hw, r.z + hd); // E
  r.doors.forEach((side) => {
    if (side === "N") clearRect(r.x - DOOR_W / 2, r.z - hd - CELL, r.x + DOOR_W / 2, r.z - hd + CELL);
    if (side === "S") clearRect(r.x - DOOR_W / 2, r.z + hd - CELL, r.x + DOOR_W / 2, r.z + hd + CELL);
    if (side === "W") clearRect(r.x - hw - CELL, r.z - DOOR_W / 2, r.x - hw + CELL, r.z + DOOR_W / 2);
    if (side === "E") clearRect(r.x + hw - CELL, r.z - DOOR_W / 2, r.x + hw + CELL, r.z + DOOR_W / 2);
  });
  r.desks.forEach((d) => blockRect(d.x - 2, d.z - 1, d.x + 2, d.z + 1));
});
// deck boundary
blockRect(OX, OZ, OX + (GW - 1) * CELL, OZ);
blockRect(OX, OZ + (GD - 1) * CELL, OX + (GW - 1) * CELL, OZ + (GD - 1) * CELL);
blockRect(OX, OZ, OX, OZ + (GD - 1) * CELL);
blockRect(OX + (GW - 1) * CELL, OZ, OX + (GW - 1) * CELL, OZ + (GD - 1) * CELL);

function nearestFree(cx, cz) {
  if (!blocked[cz * GW + cx]) return [cx, cz];
  for (let ring = 1; ring < 8; ring++)
    for (let dx = -ring; dx <= ring; dx++)
      for (let dz = -ring; dz <= ring; dz++) {
        const nx = cx + dx, nz = cz + dz;
        if (nx >= 0 && nx < GW && nz >= 0 && nz < GD && !blocked[nz * GW + nx]) return [nx, nz];
      }
  return [cx, cz];
}

function findPath(x0, z0, x1, z1) {
  let [sx, sz] = nearestFree(w2cx(x0), w2cz(z0));
  let [tx, tz] = nearestFree(w2cx(x1), w2cz(z1));
  const start = sz * GW + sx, goal = tz * GW + tx;
  if (start === goal) return [{ x: x1, z: z1 }];
  const open = [start];
  const came = new Int32Array(GW * GD).fill(-1);
  const g = new Float32Array(GW * GD).fill(Infinity);
  const f = new Float32Array(GW * GD).fill(Infinity);
  g[start] = 0;
  f[start] = Math.abs(tx - sx) + Math.abs(tz - sz);
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
      while (n !== start) { path.push({ x: c2wx(n % GW), z: c2wz(Math.floor(n / GW)) }); n = came[n]; }
      path.reverse();
      path.push({ x: x1, z: z1 });
      return path;
    }
    const cx = cur % GW, cz = Math.floor(cur / GW);
    const neigh = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dx, dz] of neigh) {
      const nx = cx + dx, nz = cz + dz;
      if (nx < 0 || nx >= GW || nz < 0 || nz >= GD) continue;
      const ni = nz * GW + nx;
      if (blocked[ni]) continue;
      const ng = g[cur] + 1;
      if (ng < g[ni]) {
        came[ni] = cur;
        g[ni] = ng;
        f[ni] = ng + Math.abs(tx - nx) + Math.abs(tz - nz);
        if (!inOpen[ni]) { open.push(ni); inOpen[ni] = 1; }
      }
    }
  }
  return [{ x: x1, z: z1 }];
}

// ---------------------------------------------------------------- three setup

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020409);
scene.fog = new THREE.Fog(0x020409, 160, 420);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 800);

// orbit state
const cam = { target: new THREE.Vector3(0, 0, 0), yaw: 0, pitch: 0.86, radius: 118, autoSpin: true };
const camGoal = { target: new THREE.Vector3(0, 0, 0), radius: 118 };

scene.add(new THREE.AmbientLight(0x223344, 1.6));
const keyLight = new THREE.DirectionalLight(0x88bbff, 0.7);
keyLight.position.set(60, 120, 40);
scene.add(keyLight);
const coreLight = new THREE.PointLight(0x00dcff, 260, 120, 1.8);
coreLight.position.set(0, 10, 0);
scene.add(coreLight);

// starfield
{
  const N = 1600, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(380 + Math.random() * 60);
    pos.set([v.x, Math.abs(v.y) * 0.9 + 4, v.z], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x9fd8ff, size: 0.9, sizeAttenuation: true, transparent: true, opacity: 0.8 })));
}

// deck floor with grid texture
function makeFloorTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d");
  g.fillStyle = "#050b13";
  g.fillRect(0, 0, 1024, 1024);
  g.strokeStyle = "rgba(0,220,255,0.10)";
  g.lineWidth = 2;
  for (let i = 0; i <= 32; i++) {
    g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 1024); g.stroke();
    g.beginPath(); g.moveTo(0, i * 32); g.lineTo(1024, i * 32); g.stroke();
  }
  g.strokeStyle = "rgba(0,220,255,0.22)";
  g.lineWidth = 4;
  for (let i = 0; i <= 8; i++) {
    g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 1024); g.stroke();
    g.beginPath(); g.moveTo(0, i * 128); g.lineTo(1024, i * 128); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 3);
  return t;
}
{
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(GW * CELL, GD * CELL),
    new THREE.MeshStandardMaterial({ map: makeFloorTexture(), roughness: 0.85, metalness: 0.4 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
}

// outer hull walls with window strips
{
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x0a1522, roughness: 0.6, metalness: 0.7 });
  const winMat = new THREE.MeshBasicMaterial({ color: 0x2a6f8a });
  const mkHull = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 10, d), hullMat);
    m.position.set(x, 5, z);
    scene.add(m);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(w > d ? w * 0.9 : 0.4, 1.6, d > w ? d * 0.9 : 0.4), winMat);
    strip.position.set(x, 6.4, z);
    scene.add(strip);
  };
  const HX = GW * CELL / 2, HZ = GD * CELL / 2;
  mkHull(GW * CELL, 2, 0, -HZ);
  mkHull(GW * CELL, 2, 0, HZ);
  mkHull(2, GD * CELL, -HX, 0);
  mkHull(2, GD * CELL, HX, 0);
}

// text label sprite
function makeLabel(text, colorCss, scale = 1) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const g = c.getContext("2d");
  g.font = "bold 56px 'Share Tech Mono', monospace";
  g.textAlign = "center";
  g.shadowColor = colorCss; g.shadowBlur = 18;
  g.fillStyle = colorCss;
  g.fillText(text, 256, 78);
  const t = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(16 * scale, 4 * scale, 1);
  return s;
}

// rooms: walls with door gaps, trim, labels, desks
const wallMat = new THREE.MeshStandardMaterial({ color: 0x0c1c2c, roughness: 0.5, metalness: 0.6, transparent: true, opacity: 0.92 });
const deskGroupByRoom = {};

function buildWallRun(x0, z0, x1, z1, doors) {
  // doors: array of {c, half} along run (c = center coordinate along axis)
  const horiz = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  const lo = horiz ? Math.min(x0, x1) : Math.min(z0, z1);
  const hi = horiz ? Math.max(x0, x1) : Math.max(z0, z1);
  let segs = [[lo, hi]];
  doors.forEach((d) => {
    const out = [];
    segs.forEach(([a, b]) => {
      if (d.c - d.half > a) out.push([a, Math.min(b, d.c - d.half)]);
      if (d.c + d.half < b) out.push([Math.max(a, d.c + d.half), b]);
    });
    segs = out.filter(([a, b]) => b - a > 0.5);
  });
  segs.forEach(([a, b]) => {
    const len = b - a, mid = (a + b) / 2;
    const m = new THREE.Mesh(new THREE.BoxGeometry(horiz ? len : 1, 3.6, horiz ? 1 : len), wallMat);
    m.position.set(horiz ? mid : x0, 1.8, horiz ? z0 : mid);
    scene.add(m);
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(horiz ? len : 1.1, 0.22, horiz ? 1.1 : len),
      new THREE.MeshBasicMaterial({ color: 0x00dcff })
    );
    trim.position.set(horiz ? mid : x0, 3.7, horiz ? z0 : mid);
    scene.add(trim);
  });
}

Object.entries(ROOMS).forEach(([id, r]) => {
  const hw = r.w / 2, hd = r.d / 2;
  const dh = DOOR_W / 2;
  const doorOn = (s) => r.doors.includes(s) ? [{ c: s === "N" || s === "S" ? r.x : r.z, half: dh }] : [];
  buildWallRun(r.x - hw, r.z - hd, r.x + hw, r.z - hd, doorOn("N"));
  buildWallRun(r.x - hw, r.z + hd, r.x + hw, r.z + hd, doorOn("S"));
  buildWallRun(r.x - hw, r.z - hd, r.x - hw, r.z + hd, doorOn("W"));
  buildWallRun(r.x + hw, r.z - hd, r.x + hw, r.z + hd, doorOn("E"));

  const label = makeLabel(r.name, "#00dcff", 1.15);
  label.position.set(r.x, 7.6, r.z);
  scene.add(label);

  // desks + holo screens
  deskGroupByRoom[id] = [];
  r.desks.forEach((d) => {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.5, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x0a1826, roughness: 0.4, metalness: 0.7 }));
    desk.position.set(d.x, 0.75, d.z);
    scene.add(desk);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.9),
      new THREE.MeshBasicMaterial({ color: 0x00dcff, transparent: true, opacity: 0.16, side: THREE.DoubleSide }));
    screen.position.set(d.x, 2.7, d.z - 0.6);
    scene.add(screen);
    deskGroupByRoom[id].push({ pos: d, screen });
  });
});

// core reactor
{
  const col = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3, 9, 24),
    new THREE.MeshStandardMaterial({ color: 0x0c2433, emissive: 0x00dcff, emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.6 }));
  col.position.set(0, 4.5, 0);
  scene.add(col);
  window._coreRings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4 + i * 1.4, 0.14, 10, 60),
      new THREE.MeshBasicMaterial({ color: 0x00dcff, transparent: true, opacity: 0.7 - i * 0.16 }));
    ring.position.set(0, 4.5, 0);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    window._coreRings.push(ring);
  }
}

// ---------------------------------------------------------------- voxel agents

function buildAgentMesh(a) {
  const grp = new THREE.Group();
  const col = new THREE.Color(a.color);
  const dark = col.clone().multiplyScalar(0.35);
  const bodyMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, metalness: 0.3, emissive: col, emissiveIntensity: 0.16 });
  const darkMat = new THREE.MeshStandardMaterial({ color: dark, roughness: 0.7 });
  const visorMat = new THREE.MeshBasicMaterial({ color: 0xcffcff });

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.9, 0.34), darkMat);
  const legR = legL.clone();
  legL.position.set(-0.24, 0.45, 0);
  legR.position.set(0.24, 0.45, 0);

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.1, 0.6), bodyMat);
  body.position.y = 1.45;

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.95, 0.3), bodyMat);
  const armR = armL.clone();
  armL.position.set(-0.72, 1.45, 0);
  armR.position.set(0.72, 1.45, 0);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.72, 0.72), darkMat);
  head.position.y = 2.42;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.24, 0.1), visorMat);
  visor.position.set(0, 2.48, 0.38);

  const glow = new THREE.PointLight(a.color, 8, 9, 2);
  glow.position.y = 2;

  grp.add(legL, legR, body, armL, armR, head, visor, glow);

  const label = makeLabel(a.name, "#" + col.getHexString(), 0.55);
  label.position.y = 3.7;
  grp.add(label);

  grp.userData = { agent: a, legL, legR, armL, armR, visor, body };
  return grp;
}

const sprites = AGENTS.map((a, i) => {
  const r = ROOMS[a.room];
  const mesh = buildAgentMesh(a);
  const x = r.x + (i % 2 ? 5 : -5), z = r.z + 3;
  mesh.position.set(x, 0, z);
  scene.add(mesh);
  return {
    agent: a, mesh,
    x, z, path: [], speed: 6.5 + Math.random() * 2,
    state: "pause", pause: 1 + Math.random() * 3,
    workT: 0, walkPhase: Math.random() * 10,
    heading: 0, travelCooldown: 10 + Math.random() * 25,
    deskIdx: i % 2, chatting: false,
  };
});

function setPath(s, tx, tz, nextState) {
  s.path = findPath(s.x, s.z, tx, tz);
  s.state = "walk";
  s.afterWalk = nextState || "pause";
}

function wanderInRoom(s, roomId) {
  const r = ROOMS[roomId || s.agent.room];
  const tx = r.x + (Math.random() - 0.5) * (r.w - 8);
  const tz = r.z + (Math.random() - 0.5) * (r.d - 8);
  setPath(s, tx, tz, "pause");
}

function goWork(s, seconds) {
  const r = ROOMS[s.agent.room];
  s.deskIdx = (s.deskIdx + 1) % r.desks.length;
  const d = r.desks[s.deskIdx];
  s.workT = seconds;
  setPath(s, d.x, d.z + 2.4, "work");
}

// ---------------------------------------------------------------- packets

const packets = [];
function spawnPacket(a) {
  const r = ROOMS[a.room];
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10),
    new THREE.MeshBasicMaterial({ color: a.color }));
  m.position.set(r.x, 3, r.z);
  scene.add(m);
  packets.push({ mesh: m, t: 0, from: { x: r.x, z: r.z }, color: a.color });
}

// ---------------------------------------------------------------- DOM: roster + log

const rosterEl = document.getElementById("roster");
AGENTS.forEach((a) => {
  const colorCss = "#" + new THREE.Color(a.color).getHexString();
  const card = document.createElement("div");
  card.className = "agent-card";
  card.dataset.id = a.id;
  card.innerHTML = `
    <div class="agent-dot" style="color:${colorCss};background:${colorCss}"></div>
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
  const color = agent ? "#" + new THREE.Color(agent.color).getHexString() : "#00dcff";
  line.innerHTML = `<span class="log-time">${timestamp()}</span>` +
    `<span class="log-agent" style="color:${color}">[${who}]</span>` +
    `<span class="log-msg">${msg}</span>`;
  logEl.appendChild(line);
  while (logEl.children.length > 90) logEl.removeChild(logEl.firstChild);
  logEl.scrollTop = logEl.scrollHeight;
}

pushLog(null, `DECK ONLINE — linked to ${SNAP.instance} (${SNAP.totals.workflows} workflows, ${SNAP.totals.executions} runs)`);
pushLog(null, "Click any agent to open a REAL chat with its n8n workflow 💬");

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
    const s = sprites.find((sp) => sp.agent === a);
    if (!s.chatting && s.state !== "walk") goWork(s, 4 + Math.random() * 3);
    if (a.id !== "manager") spawnPacket(a);
    if (Math.random() < 0.15) {
      sales++;
      stock = Math.max(0, stock - (1 + Math.floor(Math.random() * 3)));
      pushLog(null, SALE_EVENTS[Math.floor(Math.random() * SALE_EVENTS.length)], "sale");
    }
    updateStats();
    scheduleEvent();
  }, 1600 + Math.random() * 3000);
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

function addChatMsg(kind, who, text, colorCss) {
  const el = document.createElement("div");
  el.className = "chat-msg " + kind;
  if (kind === "meta") el.textContent = text;
  else el.innerHTML = `<span class="msg-who" style="color:${colorCss || "var(--cyan)"}">${who}</span>${escapeHtml(text)}`;
  chatMsgs.appendChild(el);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return el;
}
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function openChat(a) {
  chatAgent = a;
  const cfg = CFG.agents[a.id] || {};
  const colorCss = "#" + new THREE.Color(a.color).getHexString();
  document.getElementById("chat-agent-name").textContent = a.name;
  document.getElementById("chat-agent-name").style.color = colorCss;
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
  // camera focus + agent attends
  const s = sprites.find((sp) => sp.agent === a);
  sprites.forEach((sp) => (sp.chatting = false));
  s.chatting = true;
  camGoal.target.set(s.x, 2, s.z);
  camGoal.radius = 34;
  cam.autoSpin = false;
  chatInput.focus();
}

document.getElementById("chat-close").addEventListener("click", () => {
  dock.classList.add("hidden");
  sprites.forEach((sp) => (sp.chatting = false));
  document.querySelectorAll(".agent-card").forEach((c) => c.classList.remove("selected"));
  chatAgent = null;
});

document.getElementById("btn-reset-cam").addEventListener("click", () => {
  camGoal.target.set(0, 0, 0);
  camGoal.radius = 118;
  cam.autoSpin = true;
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
    addChatMsg("agent", chatAgent.name, "Call requested: " + (j.status || JSON.stringify(j)));
    pushLog(chatAgent, "☎ outbound call requested via /call-me");
  } catch (e) {
    addChatMsg("meta", "", "Call request failed (" + e.message + ") — check the ElevenLabs credential in n8n.");
  }
});

async function parseChatResponse(res) {
  const text = await res.text();
  // n8n chat triggers stream line-delimited JSON chunks; plain webhooks return JSON
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
    // "name, email, followers" → real signup; anything else → universal inbox
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
  const colorCss = "#" + new THREE.Color(a.color).getHexString();
  addChatMsg("user", "YOU", text);
  pushLog(a, "💬 message received from Ryan");
  const thinking = addChatMsg("agent thinking", a.name, "processing via n8n...", colorCss);
  try {
    const reply = await sendToAgent(a, text);
    thinking.remove();
    addChatMsg("agent", a.name, reply, colorCss);
    pushLog(a, "💬 replied via n8n workflow");
    runs++; updateStats();
  } catch (err) {
    thinking.remove();
    addChatMsg("agent", a.name, simReply(a, text), colorCss);
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

document.getElementById("log-filter-clear")?.classList.add("hidden");

// ---------------------------------------------------------------- picking + camera

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let dragging = false, moved = false, px = 0, py = 0;

canvas.addEventListener("pointerdown", (e) => {
  dragging = true; moved = false; px = e.clientX; py = e.clientY;
  canvas.classList.add("dragging");
});
window.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - px, dy = e.clientY - py;
  if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
  cam.yaw -= dx * 0.005;
  cam.pitch = Math.max(0.25, Math.min(1.35, cam.pitch + dy * 0.004));
  cam.autoSpin = false;
  px = e.clientX; py = e.clientY;
});
window.addEventListener("pointerup", (e) => {
  canvas.classList.remove("dragging");
  if (dragging && !moved) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(sprites.map((s) => s.mesh), true);
    if (hits.length) {
      let obj = hits[0].object;
      while (obj && !obj.userData?.agent) obj = obj.parent;
      if (obj) openChat(obj.userData.agent);
    }
  }
  dragging = false;
});
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  camGoal.radius = Math.max(18, Math.min(200, camGoal.radius + e.deltaY * 0.12));
}, { passive: false });

// ---------------------------------------------------------------- main loop

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // agents
  sprites.forEach((s) => {
    const u = s.mesh.userData;
    if (s.chatting) {
      // stand still, face the camera, visor pulse
      s.state = "attend";
      const camDir = Math.atan2(camera.position.x - s.x, camera.position.z - s.z);
      s.heading += (camDir - s.heading) * 0.1;
      u.visor.material.color.setHSL(0.5, 1, 0.6 + 0.35 * Math.sin(t * 6));
      u.armL.rotation.x = u.armR.rotation.x = 0;
      u.legL.rotation.x = u.legR.rotation.x = 0;
    } else if (s.state === "pause" || s.state === "attend") {
      s.state = "pause";
      s.pause -= dt;
      s.travelCooldown -= dt;
      u.visor.material.color.set(0xcffcff);
      u.legL.rotation.x = u.legR.rotation.x = 0;
      u.armL.rotation.x = u.armR.rotation.x = Math.sin(t * 1.6 + s.walkPhase) * 0.05;
      if (s.pause <= 0) {
        if (s.travelCooldown <= 0) {
          // walk the corridors to another room, then come home
          const others = Object.keys(ROOMS).filter((id) => id !== s.agent.room);
          const dest = Math.random() < 0.5 ? "core" : others[Math.floor(Math.random() * others.length)];
          const r = ROOMS[dest];
          setPath(s, r.x + (Math.random() - 0.5) * (r.w - 10), r.z + (Math.random() - 0.5) * (r.d - 10), "visit");
          s.travelCooldown = 30 + Math.random() * 40;
        } else {
          wanderInRoom(s);
        }
      }
    } else if (s.state === "walk") {
      const wp = s.path[0];
      if (!wp) {
        if (s.afterWalk === "work") { s.state = "work"; }
        else if (s.afterWalk === "visit") { s.state = "pause"; s.pause = 2 + Math.random() * 3; }
        else { s.state = "pause"; s.pause = 1 + Math.random() * 3; }
      } else {
        const dx = wp.x - s.x, dz = wp.z - s.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.4) s.path.shift();
        else {
          s.x += (dx / d) * s.speed * dt;
          s.z += (dz / d) * s.speed * dt;
          const target = Math.atan2(dx, dz);
          let diff = target - s.heading;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          s.heading += diff * 0.18;
        }
        s.walkPhase += dt * 11;
        const sw = Math.sin(s.walkPhase);
        u.legL.rotation.x = sw * 0.7;
        u.legR.rotation.x = -sw * 0.7;
        u.armL.rotation.x = -sw * 0.5;
        u.armR.rotation.x = sw * 0.5;
        s.mesh.position.y = Math.abs(Math.sin(s.walkPhase)) * 0.09;
      }
    } else if (s.state === "work") {
      s.workT -= dt;
      const r = ROOMS[s.agent.room];
      const d = r.desks[s.deskIdx];
      const target = Math.atan2(d.x - s.x, d.z - s.z);
      s.heading += (target - s.heading) * 0.15;
      u.armL.rotation.x = -0.9 + Math.sin(t * 14) * 0.12;
      u.armR.rotation.x = -0.9 + Math.cos(t * 13) * 0.12;
      u.legL.rotation.x = u.legR.rotation.x = 0;
      u.visor.material.color.setHSL(0.5, 1, 0.6 + 0.3 * Math.sin(t * 9));
      const desk = deskGroupByRoom[s.agent.room]?.[s.deskIdx];
      if (desk) desk.screen.material.opacity = 0.35 + 0.25 * Math.sin(t * 10);
      if (s.workT <= 0) {
        if (desk) desk.screen.material.opacity = 0.16;
        s.state = "pause";
        s.pause = 1 + Math.random() * 2;
      }
    }
    s.mesh.position.x = s.x;
    s.mesh.position.z = s.z;
    if (s.state !== "walk") s.mesh.position.y = 0;
    s.mesh.rotation.y = s.heading;
  });

  // packets glide to the core
  for (let i = packets.length - 1; i >= 0; i--) {
    const p = packets[i];
    p.t += dt / 1.7;
    if (p.t >= 1) { scene.remove(p.mesh); packets.splice(i, 1); continue; }
    p.mesh.position.set(
      p.from.x + (0 - p.from.x) * p.t,
      3 + Math.sin(p.t * Math.PI) * 4,
      p.from.z + (0 - p.from.z) * p.t
    );
  }

  // core rings
  window._coreRings?.forEach((ring, i) => {
    ring.rotation.z = t * (0.5 + i * 0.3);
    ring.position.y = 4.5 + Math.sin(t * 1.4 + i) * 0.5;
  });
  coreLight.intensity = 230 + Math.sin(t * 2.2) * 50;

  // camera
  if (cam.autoSpin) cam.yaw += dt * 0.05;
  cam.target.lerp(camGoal.target, 0.06);
  cam.radius += (camGoal.radius - cam.radius) * 0.06;
  camera.position.set(
    cam.target.x + Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.radius,
    cam.target.y + Math.sin(cam.pitch) * cam.radius,
    cam.target.z + Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.radius
  );
  camera.lookAt(cam.target);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
