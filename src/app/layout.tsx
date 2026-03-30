import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/auth/AuthProvider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
  title: 'CS2 Lineups — Тактические гранаты',
  description: 'Интерактивная база лайнапов гранат для Counter-Strike 2. Дымы, флэшки, молотовы и HE для всех карт.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${jetbrainsMono.variable} h-full dark`}>
      <head>
        <link rel="preconnect" href="https://assets.csnades.gg" />
        <link rel="preconnect" href="https://customer-9h7e8ahl6hivmjb6.cloudflarestream.com" />
        <link rel="dns-prefetch" href="https://assets.csnades.gg" />
        <link rel="dns-prefetch" href="https://customer-9h7e8ahl6hivmjb6.cloudflarestream.com" />
      </head>
      <body className="min-h-full bg-[#0d0e14] font-sans text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
