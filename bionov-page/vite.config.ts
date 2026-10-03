import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base: './'` keeps every emitted asset URL relative, so the built bundle can be
// dropped into a Shopify section (or any sub-path) without rewriting paths.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2019',
    assetsInlineLimit: 2048,
  },
})
