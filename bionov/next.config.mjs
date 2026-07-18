/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  // GitHub Pages serves this site from /ryan/
  basePath: isProd ? '/ryan' : '',
  assetPrefix: isProd ? '/ryan/' : '',
  images: {
    // Static export cannot use the Next image optimizer
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
