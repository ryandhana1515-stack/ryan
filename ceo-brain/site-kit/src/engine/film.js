// Scroll film: a pinned full-screen canvas that plays the Kling film frame by frame as the visitor
// scrolls, and plays it backwards when they scroll up. Works the same on phones (smaller frames) and
// desktop. Markup:
//   <section class="film" data-film="hero" data-length="500">   (data-length = scroll distance in vh)
//     <canvas></canvas>
//     <div class="film-chapter" data-from="0" data-to="0.25"> ...copy... </div>
//   </section>
// Chapters fade and rise in over their window of progress (0..1) and leave the same way.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const isPhone = () => window.matchMedia('(max-width: 760px)').matches;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function loadManifest(id) {
  const res = await fetch(`/film/${id}/manifest.json`);
  if (!res.ok) throw new Error(`film ${id} missing`);
  return res.json();
}

export class ScrollFilm {
  constructor(section, { onProgress } = {}) {
    this.section = section;
    this.id = section.dataset.film;
    this.canvas = section.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.frames = [];
    this.current = 0;
    this.target = 0;
    this.drawn = -1;
    this.onProgress = onProgress;
    this.chapters = [...section.querySelectorAll('.film-chapter')];
    this.zoom = parseFloat(section.dataset.zoom || '1.08');
  }

  async init() {
    try { this.m = await loadManifest(this.id); }
    catch (e) { // no film built: the chapters still read, over the brand background
      this.section.classList.add('film--still');
      this.chapters.forEach(c => { c.style.opacity = '1'; c.classList.add('is-on'); });
      throw e;
    }
    this.set = isPhone() ? 'm' : 'd';
    this.frames = new Array(this.m.count);
    this.resize();
    window.addEventListener('resize', () => { this.resize(); this.drawn = -1; });
    await this.load(0); // first frame before anything else
    this.draw(0);
    if (reduced()) { this.section.classList.add('film--still'); this.chapters.forEach(c => c.classList.add('is-on')); return this; }
    this.pin();
    this.preload();
    gsap.ticker.add(() => this.tick());
    return this;
  }

  url(i) { return `/film/${this.id}/${this.set}/${String(i + 1).padStart(4, '0')}.${this.m.ext}`; }

  load(i) {
    if (this.frames[i]) return Promise.resolve(this.frames[i]);
    return new Promise(resolve => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { this.frames[i] = img; resolve(img); };
      img.onerror = () => resolve(null);
      img.src = this.url(i);
    });
  }

  // Coarse to fine: every 16th frame, then 8th, 4th, 2nd, all. The film is scrubbable within a second.
  async preload() {
    const n = this.m.count;
    for (const step of [16, 8, 4, 2, 1]) {
      const batch = [];
      for (let i = 0; i < n; i += step) if (!this.frames[i]) batch.push(this.load(i));
      await Promise.all(batch);
    }
    this.section.classList.add('film--ready');
  }

  nearest(i) {
    for (let d = 0; d < this.m.count; d++) {
      if (this.frames[i - d]) return this.frames[i - d];
      if (this.frames[i + d]) return this.frames[i + d];
    }
    return null;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
  }

  draw(i) {
    const img = this.frames[i] || this.nearest(i);
    if (!img) return;
    const { width: cw, height: ch } = this.canvas;
    const p = this.progress || 0;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * (1 + (this.zoom - 1) * p);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    this.drawn = this.frames[i] ? i : -1; // keep redrawing until the exact frame has arrived
  }

  tick() {
    this.current += (this.target - this.current) * 0.18; // lerp: silky, never jumps
    const i = Math.round(this.current);
    if (i !== this.drawn) this.draw(i);
  }

  pin() {
    const length = parseFloat(this.section.dataset.length || '500');
    ScrollTrigger.create({
      trigger: this.section,
      start: 'top top',
      end: `+=${length}%`,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: self => {
        this.progress = self.progress;
        this.target = self.progress * (this.m.count - 1);
        this.chapters.forEach(c => {
          const from = parseFloat(c.dataset.from), to = parseFloat(c.dataset.to);
          const span = Math.max(0.0001, to - from), edge = Math.min(0.08, span / 3);
          let o = 0;
          if (self.progress >= from && self.progress <= to) {
            o = Math.min(1, (self.progress - from) / edge, (to - self.progress) / edge);
            if (from === 0 && self.progress < edge) o = 1; // the hero copy is visible at rest
          }
          c.style.opacity = o.toFixed(3);
          c.style.transform = `translate3d(0, ${((1 - o) * 40).toFixed(1)}px, 0)`;
          c.classList.toggle('is-on', o > 0.5);
        });
        this.onProgress && this.onProgress(self.progress);
      },
    });
  }
}
