import type { Metadata } from 'next'
import { Geist_Mono, JetBrains_Mono, Noto_Sans_JP } from 'next/font/google'
import './globals.css'

// chashitsu-lp と同じフォント構成: 本文 Noto Sans JP / 英語ラベル JetBrains Mono / 数値 Geist Mono
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-sans',
})
const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
  variable: '--font-display',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'KOMONO',
  description: 'チームでさっと使える小物集',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${jetBrainsMono.variable} ${geistMono.variable}`}>
      <body className={notoSansJP.className}>{children}</body>
    </html>
  )
}
