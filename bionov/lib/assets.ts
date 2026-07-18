// Asset URL helper — GitHub Pages serves the site under /ryan/.
const BASE = process.env.NODE_ENV === 'production' ? '/ryan' : ''

export function asset(path: string): string {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}
