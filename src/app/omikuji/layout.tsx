import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'おみくじ | KOMONO',
  description: 'メンバーを登録してランダムに1人を選ぶおみくじツール',
}

export default function OmikujiLayout({ children }: { children: React.ReactNode }) {
  return children
}
