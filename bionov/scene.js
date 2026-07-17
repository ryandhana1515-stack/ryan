/* ============================================================
   BIO N:OV — WebGL scene (Three.js)
   Aurora shader background · nitric-oxide particle field ·
   a real 3D product box you can drag to spin.
   Self-contained; degrades to a static image if WebGL is absent.
   ============================================================ */
import * as THREE from 'three';

const PALETTE = [0x1fa2ff, 0x4b6bfb, 0x8b5cf6, 0xd6469b, 0xff6a5a];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initScene(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return { ok: false };
  }
  if (!renderer.getContext()) return { ok: false };

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06070d, 0.02);

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  /* ---------------- Aurora background ---------------- */
  const bgGeo = new THREE.PlaneGeometry(2, 2);
  const bgMat = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uScroll: { value: 0 },
      uAspect: { value: window.innerWidth / window.innerHeight },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }`,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime, uScroll, uAspect;
      uniform vec2 uMouse;
      // value-noise fbm
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
      }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5;} return v; }
      void main(){
        vec2 uv = vUv; vec2 p = (uv-0.5); p.x*=uAspect;
        float t = uTime*0.04;
        float n = fbm(p*1.6 + vec2(t, -t*0.7) + uScroll*0.6);
        float n2 = fbm(p*2.4 - vec2(t*0.8, t) + n);
        vec3 cyan=vec3(0.12,0.64,1.0), blue=vec3(0.29,0.42,0.98), violet=vec3(0.55,0.36,0.96), coral=vec3(1.0,0.42,0.35);
        vec3 col = mix(blue, violet, smoothstep(0.2,0.8,n));
        col = mix(col, cyan, smoothstep(0.3,0.9,n2)*0.6);
        col = mix(col, coral, smoothstep(0.6,1.0,n*n2)*0.5);
        // keep it dark & readable: base near-black, colored glow blooms softly
        float glow = pow(n*n2, 1.6);
        vec2 m = uMouse; m.x*=uAspect;
        glow += 0.25*smoothstep(0.6,0.0,length(p-m));
        vec3 base = vec3(0.023,0.027,0.055);
        vec3 outc = base + col*glow*0.5;
        // vignette
        outc *= 1.0 - 0.5*dot(p,p);
        gl_FragColor = vec4(outc, 1.0);
      }`,
  });
  const bg = new THREE.Mesh(bgGeo, bgMat);
  bg.frustumCulled = false;
  scene.add(bg);

  /* ---------------- Nitric-oxide particle field ---------------- */
  const COUNT = reduce ? 220 : (window.innerWidth < 720 ? 480 : 900);
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  const c = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    c.setHex(PALETTE[(Math.random() * PALETTE.length) | 0]);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    seed[i] = Math.random() * 100;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const sprite = makeGlowSprite();
  const pMat = new THREE.PointsMaterial({
    size: 0.14, map: sprite, vertexColors: true, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, opacity: 0.9,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  /* ---------------- 3D product box ---------------- */
  const boxGroup = new THREE.Group();
  const geo = new THREE.BoxGeometry(2.0, 3.0, 1.0, 1, 1, 1);
  const frontMap = makeFrontTexture(), sideMap = makeSideTexture(), topMap = makeTopTexture();
  // faint self-illumination so the box stays bright & crisp under the readability scrim
  const front = new THREE.MeshStandardMaterial({ map: frontMap, emissiveMap: frontMap, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.62, metalness: 0.06, transparent: true });
  const side = new THREE.MeshStandardMaterial({ map: sideMap, emissiveMap: sideMap, emissive: 0xffffff, emissiveIntensity: 0.28, roughness: 0.6, metalness: 0.08, transparent: true });
  const top = new THREE.MeshStandardMaterial({ map: topMap, emissiveMap: topMap, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.55, metalness: 0.08, transparent: true });
  const boxMats = [side, front, top];
  const mats = [side, side, top, top, front, front]; // px,nx,py,ny,pz,nz
  const box = new THREE.Mesh(geo, mats);
  boxGroup.add(box);
  boxGroup.position.set(2.4, -0.1, 0);
  boxGroup.rotation.set(0.1, -0.5, 0);
  scene.add(boxGroup);

  // lighting for a premium sheen
  scene.add(new THREE.AmbientLight(0xffffff, 1.15));
  const key = new THREE.PointLight(0xff6a5a, 40, 40); key.position.set(5, 4, 6); scene.add(key);
  const rim = new THREE.PointLight(0x1fa2ff, 30, 40); rim.position.set(-5, 2, 4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(0, 3, 5); scene.add(fill);

  /* ---------------- Interaction state ---------------- */
  const mouse = new THREE.Vector2(0, 0);      // -1..1
  const mouseSmooth = new THREE.Vector2(0, 0);
  let scrollN = 0;                             // 0..1 whole page
  let dragging = false, dragVel = 0, dragRotY = 0, lastX = 0;

  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    if (dragging) { dragVel += (e.clientX - lastX) * 0.005; lastX = e.clientX; }
  });
  // drag to spin the product (only when pointer starts over the box's right-side region)
  window.addEventListener('pointerdown', (e) => {
    if (e.clientX > window.innerWidth * 0.5) { dragging = true; lastX = e.clientX; }
  });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollN = h > 0 ? window.scrollY / h : 0;
  }, { passive: true });

  let baseX = 2.4, baseY = -0.1;
  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    bgMat.uniforms.uAspect.value = w / h;
    // move the product off-screen-right on narrow layouts so it doesn't sit under text
    baseX = w < 900 ? 0 : 2.4;
    baseY = w < 900 ? 1.6 : -0.1;
    boxGroup.position.x = baseX;
  }
  window.addEventListener('resize', onResize);
  onResize();

  /* ---------------- Render loop ---------------- */
  const clock = new THREE.Clock();
  let raf = 0, running = true;
  function frame() {
    const t = clock.getElapsedTime();
    mouseSmooth.lerp(mouse, 0.06);

    bgMat.uniforms.uTime.value = t;
    bgMat.uniforms.uScroll.value = scrollN;
    bgMat.uniforms.uMouse.value.set(mouseSmooth.x * 0.5, mouseSmooth.y * 0.5);

    // particles: gentle swirl + parallax + scroll drift
    const arr = pGeo.attributes.position.array;
    const spd = reduce ? 0.15 : 0.5;
    for (let i = 0; i < COUNT; i++) {
      const s = seed[i];
      arr[i * 3 + 1] += (Math.sin(t * 0.3 + s) * 0.0016 + 0.0009) * spd * 6;
      arr[i * 3] += Math.cos(t * 0.2 + s) * 0.0016 * spd * 6;
      if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = -7;
    }
    pGeo.attributes.position.needsUpdate = true;
    points.rotation.y = mouseSmooth.x * 0.12 + t * 0.01;
    points.position.y = -scrollN * 3;

    // product lives in the hero: spins as you scroll through it, then drifts
    // up and fades so the content sections read cleanly over the aurora.
    const hp = Math.min(1, window.scrollY / (window.innerHeight * 0.92)); // hero progress
    const smoothstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
    const boxOpacity = 1 - smoothstep(0.4, 0.92, hp);
    dragRotY += dragVel; dragVel *= 0.92;
    if (!reduce) box.rotation.y = -0.5 + t * 0.18 + hp * Math.PI * 1.4 + dragRotY;
    box.rotation.x = 0.08 + mouseSmooth.y * 0.12;
    boxGroup.position.x = baseX + hp * 1.2;                 // ease toward the edge
    boxGroup.position.y = baseY + hp * 3.2 + Math.sin(t * 0.8) * 0.06; // drift up & bob
    boxGroup.visible = boxOpacity > 0.01;
    for (let i = 0; i < boxMats.length; i++) boxMats[i].opacity = boxOpacity;

    // camera parallax
    camera.position.x += (mouseSmooth.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (mouseSmooth.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0.6, 0, 0);

    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { clock.start(); raf = requestAnimationFrame(frame); }
    else cancelAnimationFrame(raf);
  });

  return { ok: true };
}

/* ---------------- Texture builders ---------------- */
function makeGlowSprite() {
  const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const g = cv.getContext('2d');
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.8)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
  const tx = new THREE.CanvasTexture(cv); return tx;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

function makeFrontTexture() {
  const W = 512, H = 768, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
  // subtle top-left blue wash
  const wash = g.createLinearGradient(0, 0, W, H);
  wash.addColorStop(0, 'rgba(210,232,252,0.7)'); wash.addColorStop(0.4, 'rgba(255,255,255,0)');
  g.fillStyle = wash; g.fillRect(0, 0, W, H);

  // header: brand mark + company
  g.fillStyle = '#1c74c9';
  g.beginPath(); g.arc(70, 96, 14, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(70, 96, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2b6cb0'; g.font = '600 26px "Helvetica Neue", Arial, sans-serif';
  g.fillText('Bizworld Korea', 96, 106);
  g.fillStyle = '#8a97ad'; g.font = '500 20px "Helvetica Neue", Arial, sans-serif';
  g.textAlign = 'right'; g.fillText('건강기능식품', W - 40, 104); g.textAlign = 'left';

  // giant "V" swoosh — the brand hero mark
  const vg = g.createLinearGradient(0, 200, 0, 540);
  vg.addColorStop(0, '#2ea6f0'); vg.addColorStop(0.55, '#1e7fd6'); vg.addColorStop(1, '#0d4f9e');
  g.fillStyle = vg;
  g.beginPath();
  g.moveTo(150, 210); g.lineTo(232, 210); g.lineTo(262, 470); g.lineTo(292, 210);
  g.lineTo(372, 210); g.lineTo(300, 560); g.lineTo(224, 560); g.closePath(); g.fill();
  // lighter swoosh accent
  g.fillStyle = 'rgba(120,200,250,0.55)';
  g.beginPath(); g.moveTo(150, 210); g.quadraticCurveTo(120, 400, 240, 545);
  g.lineTo(224, 560); g.quadraticCurveTo(120, 410, 150, 250); g.closePath(); g.fill();

  // product name
  g.fillStyle = '#1a2a3a'; g.textAlign = 'center';
  g.font = '700 46px "Helvetica Neue", Arial, sans-serif'; g.fillText('바이오 엔:오브이', W / 2, 620);
  g.font = '600 30px "Helvetica Neue", Arial, sans-serif'; g.fillStyle = '#2b6cb0';
  g.fillText('BIO N:OV', W / 2, 656);
  g.strokeStyle = '#cfe0f0'; g.lineWidth = 2; g.beginPath(); g.moveTo(150, 676); g.lineTo(362, 676); g.stroke();
  g.fillStyle = '#5a6b7d'; g.font = '400 18px "Helvetica Neue", Arial, sans-serif';
  g.fillText('500 mg × 60 tablets (30 g)', W / 2, 704);

  // badges
  g.strokeStyle = '#1c74c9'; g.fillStyle = '#1c74c9'; g.lineWidth = 2;
  g.beginPath(); g.arc(210, 742, 20, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(300, 742, 20, 0, Math.PI * 2); g.stroke();
  g.font = '700 13px "Helvetica Neue", Arial, sans-serif';
  g.fillText('건강', 210, 747); g.fillText('GMP', 300, 747);
  g.textAlign = 'left';

  const tx = new THREE.CanvasTexture(cv); tx.anisotropy = 4; return tx;
}

function makeSideTexture() {
  const W = 256, H = 768, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#1e9bf0'); grd.addColorStop(0.5, '#1f6fd0'); grd.addColorStop(1, '#0e4fa0');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.rotate(-Math.PI / 2);
  g.fillStyle = 'rgba(255,255,255,0.92)'; g.textAlign = 'center';
  g.font = '700 40px "Helvetica Neue", Arial, sans-serif'; g.fillText('BIO N:OV', 0, -6);
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.font = '400 20px "Helvetica Neue", Arial, sans-serif';
  g.fillText('바이오 엔:오브이', 0, 30); g.restore();
  const tx = new THREE.CanvasTexture(cv); return tx;
}

function makeTopTexture() {
  const W = 512, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const grd = g.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, '#eaf4fd'); grd.addColorStop(1, '#cfe6fb');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  g.fillStyle = '#2b6cb0'; g.textAlign = 'center';
  g.font = '700 40px "Helvetica Neue", Arial, sans-serif'; g.fillText('BIO N:OV', W / 2, H / 2 + 14);
  const tx = new THREE.CanvasTexture(cv); return tx;
}
