// next.config.ts
import type { NextConfig } from 'next'

const HOSTS = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const nextConfig: NextConfig = {
  // output: 'export',
  images: { unoptimized: true }, // export estático não tem Image Optimization
  // opcional:
  // trailingSlash: true, // gera /pagina/index.html ao invés de /pagina.html
}

export default {
  output: 'export',
  images: { unoptimized: true }, // sem Image Optimization no export
  trailingSlash: true
}

module.exports = nextConfig
