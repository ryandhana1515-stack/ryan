'use client'

// Canvas frame-sequence player: maps scroll progress → frame index.
// Progressive loading: poster + first frames immediately, the rest in
// the background; draws the nearest loaded frame so scrubbing never
// blocks. Frames are drawn cover-fit at device pixel ratio.

export interface SequenceOptions {
  canvas: HTMLCanvasElement
  urls: string[]
  /** how many frames to load eagerly before background-filling the rest */
  eager?: number
}

export class SequencePlayer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private urls: string[]
  private frames: (HTMLImageElement | null)[]
  private loaded: boolean[]
  private current = -1
  private destroyed = false
  private ro: ResizeObserver
  private pending = 0

  constructor(opts: SequenceOptions) {
    this.canvas = opts.canvas
    this.ctx = opts.canvas.getContext('2d')!
    this.urls = opts.urls
    this.frames = opts.urls.map(() => null)
    this.loaded = opts.urls.map(() => false)
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(this.canvas)
    this.resize()
    const eager = Math.min(opts.eager ?? 14, opts.urls.length)
    for (let i = 0; i < eager; i++) this.load(i)
    // background fill, low concurrency
    let next = eager
    const fill = () => {
      if (this.destroyed || next >= this.urls.length) return
      while (this.pending < 4 && next < this.urls.length) this.load(next++)
      setTimeout(fill, 120)
    }
    setTimeout(fill, 400)
  }

  private load(i: number): void {
    if (this.frames[i] || this.destroyed) return
    const img = new Image()
    img.decoding = 'async'
    this.pending++
    img.onload = () => {
      this.pending--
      this.loaded[i] = true
      // repaint if this frame is at/near the current position
      if (Math.abs(i - this.current) <= 1) this.draw(this.current)
    }
    img.onerror = () => {
      this.pending--
    }
    img.src = this.urls[i]
    this.frames[i] = img
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr))
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr))
    if (this.current >= 0) this.draw(this.current)
  }

  /** nearest loaded frame to i (so scrubbing never shows blank) */
  private nearest(i: number): number {
    if (this.loaded[i]) return i
    for (let d = 1; d < this.urls.length; d++) {
      if (this.loaded[i - d]) return i - d
      if (this.loaded[i + d]) return i + d
    }
    return -1
  }

  setProgress(p: number): void {
    const idx = Math.round(
      Math.min(1, Math.max(0, p)) * (this.urls.length - 1),
    )
    if (idx === this.current) return
    this.current = idx
    this.draw(idx)
  }

  private draw(i: number): void {
    const j = this.nearest(i)
    if (j < 0) return
    const img = this.frames[j]
    if (!img || !img.naturalWidth) return
    const cw = this.canvas.width
    const chh = this.canvas.height
    const scale = Math.max(cw / img.naturalWidth, chh / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    this.ctx.drawImage(img, (cw - w) / 2, (chh - h) / 2, w, h)
  }

  destroy(): void {
    this.destroyed = true
    this.ro.disconnect()
    this.frames = []
  }
}
