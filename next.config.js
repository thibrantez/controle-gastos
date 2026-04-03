/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' é necessário para o build do Electron (scripts/build-electron.mjs).
  // No Vercel o output é gerenciado pela plataforma — não definir.
  output: process.env.VERCEL ? undefined : 'standalone',
}

module.exports = nextConfig
