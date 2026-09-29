// Boot: Lenis smooth scroll tied to GSAP's clock, every scroll film on the page, the motion
// vocabulary and the cinematic finish. A page's own script calls boot() once.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollFilm } from './film.js';
import { motion } from './motion.js';
import { cinematic, curtain } from './fx.js';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export async function boot(opts = {}) {
  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.6 }); }
    }));
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const films = [...document.querySelectorAll('[data-film]')].map(s => new ScrollFilm(s, opts.film));
  const first = films[0] ? films[0].init().catch(e => console.warn(e)) : Promise.resolve();
  const rest = Promise.all(films.slice(1).map(f => f.init().catch(e => console.warn(e))));
  curtain(first);
  await first; await rest;

  motion();
  cinematic(opts.fx);
  ScrollTrigger.refresh();
  return { lenis, films };
}
