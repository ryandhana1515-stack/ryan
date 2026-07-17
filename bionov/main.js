/* BIO N:OV — immersive interactions + cinematic scroll (GSAP ScrollTrigger) */
import Lenis from './vendor/lenis.mjs';
import { initScene } from './scene.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const hasGSAP = !!(gsap && ScrollTrigger) && !reduce;

/* ---------- WebGL scene (graceful fallback) ---------- */
(function boot3D() {
  const canvas = document.getElementById('gl');
  const fallback = document.querySelector('.hero__stage');
  let res = { ok: false };
  try { res = initScene(canvas); } catch (e) { console.warn('WebGL init failed:', e); }
  if (res.ok) document.body.classList.add('gl-on');
  else { if (canvas) canvas.style.display = 'none'; if (fallback) fallback.classList.add('fallback-visible'); }
})();

/* ---------- Smooth scroll (Lenis) driven by the GSAP ticker ---------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.1 });
  if (hasGSAP) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
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
  if (lenis) { open ? lenis.stop() : lenis.start(); }
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => toggleMenu());
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

/* ---------- Count-up ---------- */
function animateCount(el) {
  if (el.dataset.done) return; el.dataset.done = '1';
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
  const o = { v: 0 };
  if (hasGSAP) {
    gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out',
      onUpdate: () => { el.textContent = prefix + o.v.toFixed(decimals) + suffix; },
      onComplete: () => { el.textContent = prefix + target.toFixed(decimals) + suffix; } });
  } else {
    el.textContent = prefix + target.toFixed(decimals) + suffix;
  }
}
function countsWithin(root) { root.querySelectorAll('[data-count]').forEach(animateCount); }

/* ============================================================
   CINEMATIC SCROLL  (GSAP ScrollTrigger)
   ============================================================ */
if (hasGSAP) {
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('gsap-on');
  const handled = new WeakSet();
  const mark = (el) => handled.add(el);

  /* --- Hero load sequence (fromTo: CSS forces [data-reveal] opacity:0, so we
         must tween explicitly TO the visible state) --- */
  const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
  const q = (s) => document.querySelector(s);
  ['.hero__copy .eyebrow', '.hero__title', '.hero__lead', '.hero__actions', '.hero__meta', '.hero__stage']
    .forEach((s) => { const el = q(s); if (el) mark(el); });
  gsap.utils.toArray('.hero__meta > div').forEach(mark);
  heroTL
    .fromTo('.hero__copy .eyebrow', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
    .fromTo('.hero__title', { yPercent: 12, opacity: 0, filter: 'blur(14px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1 }, 0.15)
    .fromTo('.hero__lead', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.5)
    .fromTo('.hero__actions', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.65)
    .fromTo('.hero__meta > div', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.6 }, 0.75)
    .fromTo('.hero__stage', { opacity: 0 }, { opacity: 1, duration: 1.0 }, 0.2);

  /* --- Cinematic heading reveals (clip-path wipe up) --- */
  gsap.utils.toArray('.section__title').forEach((title) => {
    mark(title);
    gsap.set(title, { clipPath: 'inset(0 0 105% 0)', y: 24, opacity: 0 });
    gsap.to(title, {
      clipPath: 'inset(0 0 -10% 0)', y: 0, opacity: 1, duration: 1.15, ease: 'power4.out',
      scrollTrigger: { trigger: title, start: 'top 86%' },
    });
  });

  /* --- Staggered card grids --- */
  const gridSelectors = ['.statgrid', '.gens', '.ing', '.team', '.proofgrid', '.benefit-row', '.syslist', '.feat', '.hero__meta'];
  gridSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((grid) => {
      const items = gsap.utils.toArray(grid.children);
      items.forEach(mark); mark(grid);
      gsap.set(items, { opacity: 0, y: 46 });
      ScrollTrigger.create({
        trigger: grid, start: 'top 84%', once: true,
        onEnter: () => {
          gsap.to(items, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09 });
          countsWithin(grid);
        },
      });
    });
  });

  /* --- Media images: clip reveal + scrubbed parallax --- */
  gsap.utils.toArray('.split__media img, .split__media--product img, .usage__media img').forEach((img) => {
    const wrap = img.closest('[data-reveal]') || img.parentElement;
    if (wrap) mark(wrap); mark(img);
    gsap.fromTo(img, { clipPath: 'inset(12% 0 12% 0)', scale: 1.12, opacity: 0.2 },
      { clipPath: 'inset(0% 0 0% 0)', scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: img, start: 'top 88%' } });
    gsap.to(img, { yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* --- Decline chart: bars grow with scroll --- */
  const chart = document.querySelector('.decline__chart');
  if (chart) {
    mark(chart);
    const bars = gsap.utils.toArray('.bar');
    bars.forEach((b) => { b.classList.add('in'); gsap.set(b, { scaleY: 0, transformOrigin: 'bottom' }); });
    gsap.to(bars, {
      scaleY: 1, ease: 'power2.out', stagger: 0.12, duration: 0.6,
      scrollTrigger: { trigger: chart, start: 'top 80%' },
    });
    countsFromTrigger(chart);
  }
  function countsFromTrigger(el) {
    ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => countsWithin(el) });
  }

  /* --- Generic catch-all: any remaining [data-reveal] fades up --- */
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    if (handled.has(el)) return;
    gsap.set(el, { opacity: 0, y: 34 });
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  // count-ups not inside a handled grid
  document.querySelectorAll('[data-count]').forEach((c) => {
    if (c.dataset.done) return;
    ScrollTrigger.create({ trigger: c, start: 'top 90%', once: true, onEnter: () => animateCount(c) });
  });

  /* --- Hero copy parallax on scroll --- */
  gsap.to('.hero__copy', { yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* --- Signature move: pinned HORIZONTAL scroll for the 5 ways --- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const section = document.querySelector('#product');
    const track = document.querySelector('.ways');
    if (!section || !track) return;
    document.body.classList.add('hways');
    const getDistance = () => track.scrollWidth - (window.innerWidth - track.getBoundingClientRect().left) + 40;
    const tween = gsap.to(track, {
      x: () => -getDistance(), ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'center center', end: () => '+=' + getDistance(),
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    // reveal the ways cards as they arrive
    gsap.utils.toArray('.way').forEach((w) => {
      gsap.from(w, { opacity: 0, y: 40, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: w, containerAnimation: tween, start: 'left 85%' } });
    });
    return () => { document.body.classList.remove('hways'); gsap.set(track, { x: 0 }); };
  });

  // keep triggers honest as images/fonts settle
  window.addEventListener('load', () => ScrollTrigger.refresh());
  setTimeout(() => ScrollTrigger.refresh(), 800);

} else {
  /* ---------- Fallback: no GSAP / reduced motion ---------- */
  const revealAll = () => {
    document.querySelectorAll('[data-reveal], .bar').forEach((el) => el.classList.add('in'));
    document.querySelectorAll('[data-count]').forEach(animateCount);
  };
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        countsWithin(e.target);
        if (e.target.matches('[data-count]')) animateCount(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('[data-reveal], .bar').forEach((el) => io.observe(el));
  } else {
    revealAll();
  }
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
    mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`;
  });
  (function follow() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(follow);
  })();
  document.querySelectorAll('a, button, .statcard, .gen, .way, .ing__card, .member, .benefit').forEach((el) => {
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
  document.querySelectorAll('.statcard, .gen, .ing__card, .member:not(.member--lead)').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}
