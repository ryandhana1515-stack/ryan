/* BIO N:OV — interactions: nav state, reveal, count-up, parallax, menu */
(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Nav scroll state + progress bar ---- */
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  function toggleMenu(force) {
    const open = force !== undefined ? force : !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => toggleMenu());
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

  /* ---- Count-up ---- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    let start = null;
    function frame(t) {
      if (start === null) start = t;
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---- Reveal + trigger counts/bars ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const counted = new WeakSet();

  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          e.target.querySelectorAll('[data-count]').forEach((c) => {
            if (!counted.has(c)) { counted.add(c); animateCount(c); }
          });
          if (e.target.matches('[data-count]') && !counted.has(e.target)) {
            counted.add(e.target); animateCount(e.target);
          }
          io.unobserve(e.target);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));

    // Bars in the decline chart
    const bars = document.querySelectorAll('.bar');
    const barIO = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 120);
          barIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach((b) => barIO.observe(b));
  } else {
    // Fallback: show everything
    revealEls.forEach((el) => el.classList.add('in'));
    document.querySelectorAll('.bar').forEach((b) => b.classList.add('in'));
    document.querySelectorAll('[data-count]').forEach((c) => {
      const prefix = c.dataset.prefix || '', suffix = c.dataset.suffix || '';
      const dec = parseInt(c.dataset.decimals || '0', 10);
      c.textContent = prefix + parseFloat(c.dataset.count).toFixed(dec) + suffix;
    });
  }

  /* ---- 3D scroll engine: rotates the hero product in space with inertia,
          floats it, drives depth parallax, and tilts section products ---- */
  if (!reduce) {
    const slab = document.getElementById('heroSlab');
    const hero = document.getElementById('hero');
    const stage = document.querySelector('.hero__stage');
    const orbs = document.querySelectorAll('.orb');
    const tiltEls = document.querySelectorAll('[data-tilt3d]');
    const fine = window.matchMedia('(pointer:fine)').matches;

    // pointer targets (-0.5..0.5) and their smoothed values
    let ptX = 0, ptY = 0, pX = 0, pY = 0;
    if (stage && fine) {
      stage.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        ptX = (e.clientX - r.left) / r.width - 0.5;
        ptY = (e.clientY - r.top) / r.height - 0.5;
      });
      stage.addEventListener('pointerleave', () => { ptX = 0; ptY = 0; });
    }

    const lerp = (a, b, t) => a + (b - a) * t;
    let rotY = -12, rotX = 6;   // smoothed rotation carrying inertia

    function heroProgress() {
      if (!hero) return 0;
      const r = hero.getBoundingClientRect();
      return Math.max(0, Math.min(1, -r.top / (r.height || 1)));
    }

    let raf = 0;
    function tick(ts) {
      const y = window.scrollY;
      const prog = heroProgress();

      // smooth the pointer so motion feels weighted, not twitchy
      pX = lerp(pX, ptX, 0.09);
      pY = lerp(pY, ptY, 0.09);

      // scroll spins the product; pointer nudges it; inertia via slow lerp
      const targetY = -14 + prog * 40 + pX * 18;
      const targetX = 6 + prog * -6 + pY * -12;
      rotY = lerp(rotY, targetY, 0.06);
      rotX = lerp(rotX, targetX, 0.06);
      const floatY = Math.sin(ts / 1300) * 9 - prog * 34;
      if (slab) {
        slab.style.transform =
          'translateY(' + floatY.toFixed(2) + 'px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
      }

      // ambient orbs drift at different depths → parallax through space
      for (let i = 0; i < orbs.length; i++) {
        orbs[i].style.transform = 'translate3d(0,' + (y * (0.03 + i * 0.022)).toFixed(1) + 'px,0)';
      }

      // section products bank toward the viewer as they cross center
      if (tiltEls.length) {
        const vh = window.innerHeight;
        tiltEls.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -80 || r.top > vh + 80) return; // skip offscreen
          const d = ((r.top + r.height / 2) - vh / 2) / vh; // -0.5..0.5
          el.style.transform =
            'perspective(1100px) rotateY(' + (d * -20).toFixed(2) + 'deg) rotateX(' + (d * 5).toFixed(2) + 'deg)';
        });
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    // pause the loop when the tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(tick); }
    });
  }

  /* ---- Smooth anchor scroll (respects reduced motion via CSS) ---- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    });
  });
})();
