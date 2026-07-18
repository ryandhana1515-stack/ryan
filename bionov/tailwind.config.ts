import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // BIO N:OV identity — sampled from the PDF
        'nov-cyan': '#29C4F0',
        'nov-blue': '#1B6FD8',
        'nov-deep': '#123FA8',
        'nov-navy': '#0E2A6E',
        'nov-purple': '#8B7BE8',
        'nov-pink': '#F272B6',
        'nov-orange': '#F5822A',
        'nov-ink': '#12275A',
        'nov-mist': '#EFF6FD',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'nov-gradient':
          'linear-gradient(120deg, #29C4F0 0%, #1B6FD8 30%, #8B7BE8 65%, #F272B6 100%)',
        'nov-gradient-soft':
          'linear-gradient(135deg, #EAF7FE 0%, #EDF0FE 45%, #FBEFF8 100%)',
      },
    },
  },
  plugins: [],
}
export default config
