/* BIO N:OV — immersive interactions layer */
import Lenis from './vendor/lenis.mjs';
import { initScene } from './scene.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- WebGL scene (with graceful fallback) ---------- */
(function boot3D() {
  const canvas = document.getElementById('gl');
  const fallback = document.querySelector('.hero__stage');
  let res = { ok: false };
  try { res = initScene(canvas); } catch (e) { console.warn('WebGL init failed:', e); }
  if (res.ok) {
    document.body.classList.add('gl-on');
  } else {
    // reveal the static product image if WebGL is unavailable
    if (canvas) canvas.style.display = 'none';
    if (fallback) fallback.classList.add('fallback-visible');
  }
})();

/* ---------- Smooth scroll (Lenis) ---------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.1 });
  function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

/* ---------- Nav state + scroll progress ---------- */
const nav = document.getElementById('nav');
const progress = document.getElementById('scrollProgress');
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
}
(lenis ? lenis.on('scroll', onScroll) : window.addEventListener('scroll', onScroll, { passive: true }));
onScroll();

/* ---------- Mobile menu ---------- */
const burger = document.getElementById('burger');
const menu = document.getElementById('mobileMenu');
function toggleMenu(force) {
  const open = force !== undefined ? force : !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => toggleMenu());
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

/* ---------- Count-up ---------- */
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
  const dur = 1500; let start = null;
  function frame(t) {
    if (start === null) start = t;
    const p = Math.min((t - start) / dur, 1);
    const v = target * (1 - Math.pow(1 - p, 3));
    el.textContent = prefix + v.toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = prefix + target.toFixed(decimals) + suffix;
  }
  requestAnimationFrame(frame);
}

/* ---------- Reveal + counts + bars ---------- */
const counted = new WeakSet();
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach((c) => { if (!counted.has(c)) { counted.add(c); animateCount(c); } });
      io.unobserve(e.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  const barIO = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('in'), i * 110); barIO.unobserve(e.target); } });
  }, { threshold: 0.4 });
  document.querySelectorAll('.bar').forEach((b) => barIO.observe(b));
} else {
  document.querySelectorAll('[data-reveal],.bar').forEach((el) => el.classList.add('in'));
  document.querySelectorAll('[data-count]').forEach((c) => {
    const dec = parseInt(c.dataset.decimals || '0', 10);
    c.textContent = (c.dataset.prefix || '') + parseFloat(c.dataset.count).toFixed(dec) + (c.dataset.suffix || '');
  });
}

/* ---------- Smooth anchor scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: -20, duration: 1.2 });
    else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
});

/* ---------- Custom glow cursor ---------- */
const fine = window.matchMedia('(pointer:fine)').matches;
if (fine && !reduce) {
  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
  });
  (function follow() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(follow);
  })();
  const hoverables = 'a, button, .stat-card, .gen, .way, .ing__card, .member, .benefit, [data-tilt]';
  document.querySelectorAll(hoverables).forEach((el) => {
    el.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ---------- Magnetic buttons ---------- */
if (fine && !reduce) {
  document.querySelectorAll('.btn, .nav__cta').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.35;
      const y = (e.clientY - r.top - r.height / 2) * 0.4;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Hover-tilt cards ---------- */
if (fine && !reduce) {
  document.querySelectorAll('.statcard, .gen, .way, .ing__card, .member:not(.member--lead), [data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ---------- Section products bank on scroll (2D fallback flourish) ---------- */
if (!reduce) {
  const tiltEls = document.querySelectorAll('[data-tilt3d]');
  if (tiltEls.length) {
    function tick() {
      const vh = innerHeight;
      tiltEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        const d = ((r.top + r.height / 2) - vh / 2) / vh;
        el.style.transform = `perspective(1100px) rotateY(${d * -18}deg) rotateX(${d * 4}deg)`;
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
}
