// Math helpers + chapter timing for the scroll film.

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v))
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
export const smooth = (t: number): number => t * t * (3 - 2 * t)

/** Progress of `p` inside the window [a, b], clamped 0..1. */
export const seg = (p: number, a: number, b: number): number =>
  clamp01((p - a) / (b - a))

/** Eased segment. */
export const sseg = (p: number, a: number, b: number): number =>
  smooth(seg(p, a, b))

// Film chapter windows (fraction of the pinned film scroll).
export const CH = {
  arrival: [0.0, 0.1],
  rotation: [0.1, 0.24],
  levitation: [0.24, 0.34],
  opening: [0.34, 0.44],
  release: [0.44, 0.56],
  field: [0.56, 0.72],
  macro: [0.72, 0.86],
  dissolve: [0.86, 1.0],
} as const

// Deterministic pseudo-random (stable across renders/builds).
export function prand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
