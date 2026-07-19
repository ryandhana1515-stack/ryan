/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

// GitHub Pages serves under /ryan/. For Vercel (or any root-domain host),
// build with NEXT_PUBLIC_BASE_PATH="" to disable the prefix.
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : isProd
      ? '/ryan'
      : ''

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    // Static export cannot use the Next image optimizer
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
