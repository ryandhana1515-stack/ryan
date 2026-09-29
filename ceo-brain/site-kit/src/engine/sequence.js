// Scene sequence: one pinned full-screen stage that plays several scene films back to back, so the page reads
// as one continuous film. There is no black, no gap and no sliding between scenes (Ryan, 2026-09-29: "there's
// suddenly black thing when you're scrolling … I want the suit to turn into a person, no black thing in the
// middle"). Markup:
//   <div class="film-sequence">
//     <section class="film" data-film="scene1" data-length="320"> <canvas></canvas> chapters… </section>
//     <section class="film" data-film="scene2" data-length="240"> … </section>
//   </div>
// Each scene's data-length is its share of the scroll (in vh). Scenes are stacked; the active one is shown and,
// over the last few percent of a scene, the next one dissolves in on top of it. Scenes are made so the next
// scene starts on this scene's last frame (Kling tail_image), so the dissolve is invisible and the product
// seems to transform straight into the next shot. Scrolling up plays it all backwards.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class SceneSequence {
  constructor(el, films) {
    this.el = el;
    this.films = films; // ScrollFilm instances, in page order, already initialised (managed)
    this.lengths = films.map(f => parseFloat(f.section.dataset.length || '240'));
    this.total = this.lengths.reduce((a, b) => a + b, 0);
    this.starts = [];
    let acc = 0;
    for (const l of this.lengths) { this.starts.push(acc / this.total); acc += l; }
    // Share of each scene's scroll over which the next scene dissolves in (data-dissolve on the sequence).
    this.dissolve = parseFloat(el.dataset.dissolve || '0.06');
    films.forEach((f, i) => { f.section.style.zIndex = String(i + 1); });
    this.active = -1;
  }

  init() {
    this.el.classList.add('film-sequence--live');
    this.films[0] && this.films[0].preload();
    this.films[1] && this.films[1].preload();
    this.show(0, 0);
    ScrollTrigger.create({
      trigger: this.el,
      start: 'top top',
      end: `+=${this.total}%`,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: self => this.update(self.progress),
    });
    return this;
  }

  update(p) {
    let i = this.starts.length - 1;
    while (i > 0 && p < this.starts[i]) i--;
    const local = Math.min(1, Math.max(0, (p - this.starts[i]) * this.total / this.lengths[i]));
    this.show(i, local);
  }

  show(i, local) {
    const next = this.films[i + 1];
    const d = this.dissolve;
    this.films.forEach((f, j) => {
      if (j === i) { f.section.style.opacity = '1'; f.section.style.visibility = 'visible'; f.setProgress(local); }
      else if (j === i + 1 && d > 0 && local > 1 - d) {
        f.section.style.visibility = 'visible';
        f.section.style.opacity = ((local - (1 - d)) / d).toFixed(3);
        f.setProgress(0);
      } else { f.section.style.opacity = '0'; f.section.style.visibility = 'hidden'; }
    });
    if (i !== this.active) {
      this.active = i;
      next && next.preload(); // the scene after the next one starts loading while this one plays
      this.films[i + 2] && this.films[i + 2].preload();
    }
  }
}
