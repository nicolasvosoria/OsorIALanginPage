/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Deshabilitar source maps en producción
  productionBrowserSourceMaps: false,
  // Configuración para Turbopack (Next.js 16)
  // Nota: webpack config ya no es compatible con Turbopack
}

export default nextConfig
