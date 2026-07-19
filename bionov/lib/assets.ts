// Asset URL helper. The base path is injected by next.config.mjs:
// '/ryan' for GitHub Pages builds, '' for Vercel/root-domain builds
// (set NEXT_PUBLIC_BASE_PATH="" at build time).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function asset(path: string): string {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}
