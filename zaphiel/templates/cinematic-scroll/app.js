/* ============================================================
   Cinematic scroll template — scrub engine
   Frame-sequence scrubbing · smooth scroll · pinned reveals · parallax
   No dependencies. Degrades to a static poster without JS or with
   prefers-reduced-motion.
   ============================================================ */

export const CONFIG = {
  // Frame sequence for the hero ORBIT clip.
  // Extract with:  ffmpeg -i orbit.mp4 -vf "fps=15,scale=1600:-2" -q:v 6 frames/orbit_%03d.jpg
  frames: { path: i => `frames/orbit_${String(i).padStart(3, "0")}.jpg`, first: 1, count: 120 },
  // Second sequence, scrubbed in the MACRO section. Set count 0 to disable.
  frames2: { path: i => `frames/macro_${String(i).padStart(3, "0")}.jpg`, first: 1, count: 0 },
  smoothing: 0.09      // 0 = instant, 0.2 = very floaty
};

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- smooth scroll (lerped virtual scroll, Lenis-style) ---------- */
class Smooth {
  constructor(ease) { this.ease = ease; this.target = 0; this.current = 0; this.subs = []; }
  onFrame(fn) { this.subs.push(fn); }
  start() {
    const tick = () => {
      this.target = window.scrollY;
      this.current += (this.target - this.current) * (reduced ? 1 : this.ease);
      if (Math.abs(this.target - this.current) < 0.05) this.current = this.target;
      this.subs.forEach(fn => fn(this.current));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

/* ---------- frame sequence loader + canvas scrubber ---------- */
export class FrameScrubber {
  constructor(canvas, spec, section) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.spec = spec;
    this.section = section;
    this.images = [];
    this.loaded = 0;
    this.ready = false;
    this.index = -1;
  }
  load(onProgress) {
    const { first, count, path } = this.spec;
    if (!count) return Promise.resolve();
    return new Promise(resolve => {
      for (let i = 0; i < count; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = path(first + i);
        img.onload = img.onerror = () => {
          this.loaded++;
          onProgress && onProgress(this.loaded / count);
          if (this.loaded === 1) { this.ready = true; this.resize(); this.draw(0); }
          if (this.loaded === count) resolve();
        };
        this.images.push(img);
      }
    });
  }
  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.draw(this.lastP || 0);
  }
  /* progress 0..1 through the pinned section */
  draw(p) {
    if (!this.ready) return;
    this.lastP = p;
    const n = this.images.length;
    const i = Math.max(0, Math.min(n - 1, Math.round(p * (n - 1))));
    if (i === this.index) return;
    const img = this.images[i];
    if (!img || !img.naturalWidth) return;
    this.index = i;
    const cw = this.canvas.width, ch = this.canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);   // cover
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  /* how far we are through the pinned scroll range */
  progress(scrollY) {
    const s = this.section;
    const top = s.offsetTop;
    const span = s.offsetHeight - window.innerHeight;
    if (span <= 0) return 0;
    return Math.max(0, Math.min(1, (scrollY - top) / span));
  }
}

/* ---------- init ---------- */
export function init(config = CONFIG) {
  const smooth = new Smooth(config.smoothing);
  const scrubbers = [];

  document.querySelectorAll("[data-scrub]").forEach(section => {
    const canvas = section.querySelector("canvas");
    if (!canvas) return;
    const spec = section.dataset.scrub === "2" ? config.frames2 : config.frames;
    if (!spec.count) { section.classList.add("no-frames"); return; }
    const sc = new FrameScrubber(canvas, spec, section);
    scrubbers.push(sc);
    sc.load(p => {
      const bar = document.getElementById("loadbar");
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (p >= 1) document.body.classList.add("frames-ready");
    });
  });

  /* reveals: fire once, on entry */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));

  /* per-frame: scrub, parallax, progress bar */
  const parallax = [...document.querySelectorAll("[data-parallax]")];
  const progressEl = document.getElementById("progress");

  smooth.onFrame(y => {
    scrubbers.forEach(sc => sc.draw(sc.progress(y)));

    if (!reduced) parallax.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      const r = el.parentElement.getBoundingClientRect();
      const centre = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-centre * speed).toFixed(2)}px, 0)`;
    });

    if (progressEl) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressEl.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
  });

  addEventListener("resize", () => scrubbers.forEach(sc => sc.resize()), { passive: true });
  smooth.start();
  return { smooth, scrubbers };
}
