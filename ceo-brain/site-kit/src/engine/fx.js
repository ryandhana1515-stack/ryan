// Cinematic finish: film grain, vignette, slow particles in the brand's light tone, a soft cursor,
// and the opening curtain that lifts once the first film chapter is ready. All quiet; reduced
// motion switches the moving parts off.
import { gsap } from 'gsap';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function grainAndVignette() {
  for (const cls of ['fx-grain', 'fx-vignette']) {
    if (document.querySelector(`.${cls}`)) continue;
    const d = document.createElement('div');
    d.className = cls;
    d.setAttribute('aria-hidden', 'true');
    document.body.appendChild(d);
  }
}

export function particles({ count = 38, colour } = {}) {
  if (reduced()) return;
  const c = document.createElement('canvas');
  c.className = 'fx-particles';
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  const tone = colour || getComputedStyle(document.documentElement).getPropertyValue('--particle').trim() || '255,236,200';
  let w, h, dots;
  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
    dots = Array.from({ length: innerWidth < 760 ? Math.round(count / 2) : count }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.6 + 0.4) * dpr,
      vy: -(Math.random() * 0.25 + 0.05) * dpr, vx: (Math.random() - 0.5) * 0.15 * dpr, a: Math.random() * 0.5 + 0.15,
    }));
  };
  size();
  addEventListener('resize', size);
  let scrollV = 0, lastY = scrollY;
  gsap.ticker.add(() => {
    scrollV += ((scrollY - lastY) - scrollV) * 0.1; lastY = scrollY;
    ctx.clearRect(0, 0, w, h);
    for (const p of dots) {
      p.y += p.vy - scrollV * 0.05; p.x += p.vx;
      if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${tone},${p.a})`; ctx.fill();
    }
  });
}

export function cursor() {
  if (reduced() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'fx-cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  const x = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('mousemove', e => { x(e.clientX); y(e.clientY); });
  document.addEventListener('mouseover', e => dot.classList.toggle('is-link', !!e.target.closest('a,button,[data-magnetic]')));
}

// Opening curtain: brand name and a loading count, lifted when `ready` resolves (max 4 seconds).
export async function curtain(ready) {
  const el = document.querySelector('.curtain');
  if (!el) return;
  const num = el.querySelector('.curtain-count');
  const obj = { v: 0 };
  const count = gsap.to(obj, { v: 90, duration: 2.4, ease: 'power1.out', onUpdate: () => { if (num) num.textContent = Math.round(obj.v); } });
  await Promise.race([ready, new Promise(r => setTimeout(r, 4000))]);
  count.kill();
  if (num) num.textContent = '100';
  document.documentElement.classList.add('is-loaded');
  await gsap.to(el, { yPercent: -100, duration: reduced() ? 0 : 1.1, ease: 'expo.inOut', delay: 0.15 });
  el.remove();
}

export function cinematic(opts = {}) {
  grainAndVignette();
  particles(opts.particles);
  cursor();
}
