/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1128',
          900: '#060B1B',
          800: '#0A1128',
          700: '#101A3A',
          600: '#16224B',
          500: '#1E2C5E',
        },
        cyan: {
          glow: '#00DCFF',
          soft: '#7FEDFF',
          deep: '#0090B5',
        },
        ember: {
          DEFAULT: '#FF7A3D',
          soft: '#FFA477',
          deep: '#D2531C',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        shell: '1200px',
      },
      boxShadow: {
        'glow-cyan': '0 0 40px -8px rgba(0, 220, 255, 0.55)',
        'glow-ember': '0 0 40px -8px rgba(255, 122, 61, 0.55)',
        card: '0 24px 60px -32px rgba(0, 0, 0, 0.9)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 122, 61, 0.45)' },
          '50%': { boxShadow: '0 0 34px 6px rgba(255, 122, 61, 0.30)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(3%, -4%, 0) scale(1.08)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 5.5s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
        drift: 'drift 18s ease-in-out infinite',
        'spin-slow': 'spin-slow 26s linear infinite',
      },
    },
  },
  plugins: [],
}
