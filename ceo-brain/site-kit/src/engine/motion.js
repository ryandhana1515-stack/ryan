// Motion vocabulary. Every section moves; everything is readable at rest (styles only hide
// content once <html class="js"> is set, and a reduced-motion visitor sees it all, still).
//   data-reveal="lines"     headline words rise out of a mask, staggered
//   data-reveal="fade"      soft rise and fade
//   data-reveal="clip"      a panel or image wipes open (clip-path)
//   data-reveal="scale"     grows from 0.86 to 1 as it enters
//   data-parallax="0.3"     moves at a different depth while scrolling (negative = towards you)
//   data-count="1998"       number counts up when seen (data-suffix="+")
//   data-bg="#0d0d0f"       the page colour changes to this when the section takes the screen
//   class="hscroll"         pinned horizontal gallery: vertical scroll drives the track sideways
//   class="marquee"         endless text band that speeds up with scroll velocity
//   class="stack"           pinned cards that stack on each other as you scroll
//   data-magnetic           buttons lean towards the cursor
//   data-scrub-text         a paragraph that lights up word by word as you scroll through it
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function splitWords(el) {
  if (el.dataset.split) return el.querySelectorAll('.w > span');
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = words.map(w => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
  el.dataset.split = '1';
  return el.querySelectorAll('.w > span');
}

export function reveals(scope = document) {
  scope.querySelectorAll('[data-reveal="lines"]').forEach(el => {
    const words = splitWords(el);
    gsap.fromTo(words, { yPercent: 110 }, {
      yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.045,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
  scope.querySelectorAll('[data-reveal="fade"]').forEach(el => {
    gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
      autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
  scope.querySelectorAll('[data-reveal="clip"]').forEach(el => {
    gsap.fromTo(el, { clipPath: 'inset(18% 10% 18% 10% round 24px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 30%', scrub: true },
    });
  });
  scope.querySelectorAll('[data-reveal="scale"]').forEach(el => {
    gsap.fromTo(el, { scale: 0.86, autoAlpha: 0.4 }, {
      scale: 1, autoAlpha: 1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 40%', scrub: true },
    });
  });
  scope.querySelectorAll('[data-scrub-text]').forEach(el => {
    const words = splitWords(el);
    el.classList.add('scrub-text');
    gsap.fromTo(words, { opacity: 0.16 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
  });
}

export function parallax(scope = document) {
  scope.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.2;
    gsap.fromTo(el, { yPercent: -speed * 50 }, {
      yPercent: speed * 50, ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

export function counters(scope = document) {
  scope.querySelectorAll('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(obj, {
        v: end, duration: 2, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('en-SG') + suffix; },
      }),
    });
  });
}

export function pageColours(scope = document) {
  const body = document.body;
  scope.querySelectorAll('[data-bg]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: self => {
        if (!self.isActive) return;
        gsap.to(body, { backgroundColor: sec.dataset.bg, color: sec.dataset.ink || '', duration: 0.8, ease: 'power2.out' });
      },
    });
  });
}

export function horizontal(scope = document) {
  scope.querySelectorAll('.hscroll').forEach(sec => {
    const track = sec.querySelector('.hscroll-track');
    if (!track) return;
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: true, invalidateOnRefresh: true },
    });
  });
}

export function stack(scope = document) {
  scope.querySelectorAll('.stack').forEach(sec => {
    const cards = gsap.utils.toArray(sec.querySelectorAll('.stack-card'));
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      gsap.to(card, {
        scale: 0.9, autoAlpha: 0.35, ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true },
      });
    });
  });
}

export function marquee(scope = document) {
  scope.querySelectorAll('.marquee').forEach(m => {
    const inner = m.querySelector('.marquee-inner');
    if (!inner) return;
    inner.innerHTML += inner.innerHTML; // seamless loop
    const tween = gsap.to(inner, { xPercent: -50, duration: parseFloat(m.dataset.speed || '28'), ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      onUpdate: self => {
        const v = Math.min(4, 1 + Math.abs(self.getVelocity()) / 900);
        gsap.to(tween, { timeScale: self.direction * v, duration: 0.4, overwrite: true });
      },
    });
  });
}

export function magnetic(scope = document) {
  if (!window.matchMedia('(hover: hover)').matches) return;
  scope.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4 });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }));
  });
}

export function progressBar() {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { bar.style.transform = `scaleX(${s.progress})`; } });
}

export function motion(scope = document) {
  if (reduced()) { document.documentElement.classList.add('still'); return; }
  reveals(scope); parallax(scope); counters(scope); pageColours(scope);
  horizontal(scope); stack(scope); marquee(scope); magnetic(scope); progressBar();
}
