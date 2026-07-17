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

  /* ---- Parallax on hero product + ambient orbs ---- */
  if (!reduce) {
    const product = document.querySelector('.hero__product');
    const orbs = document.querySelectorAll('.orb');
    let ticking = false;
    function parallax() {
      const y = window.scrollY;
      if (product) product.style.transform = 'translateY(' + y * 0.06 + 'px)';
      orbs.forEach((o, i) => {
        o.style.transform = 'translateY(' + y * (0.03 + i * 0.015) + 'px)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });

    // Subtle pointer tilt on hero product
    const stage = document.querySelector('.hero__stage');
    if (stage && product && window.matchMedia('(pointer:fine)').matches) {
      stage.addEventListener('mousemove', (e) => {
        const r = stage.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        product.style.transform =
          'perspective(900px) rotateY(' + cx * 8 + 'deg) rotateX(' + -cy * 8 + 'deg)';
      });
      stage.addEventListener('mouseleave', () => { product.style.transform = ''; });
    }
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
