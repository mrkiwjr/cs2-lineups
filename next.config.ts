import type { NextConfig } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseUrl} https://raw.githubusercontent.com https://cdn.discordapp.com https://lh3.googleusercontent.com https://*.tile.openstreetmap.org https://assets.csnades.gg https://*.cloudflarestream.com`,
  `media-src 'self' ${supabaseUrl} https://*.cloudflarestream.com`,
  `connect-src 'self' ${supabaseUrl} https://*.upstash.io`,
  "frame-src https://www.youtube.com https://youtube.com https://*.cloudflarestream.com",
  "font-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { hostname: 'assets.csnades.gg' },
      { hostname: '**.cloudflarestream.com' },
      { hostname: 'cdn.discordapp.com' },
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'raw.githubusercontent.com' },
      { hostname: 'tlttqkclsbxjuwnfapav.supabase.co' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Content-Security-Policy', value: csp },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }]
  },
}

export default nextConfig
