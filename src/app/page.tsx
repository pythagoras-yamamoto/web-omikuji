'use client'

import { useOmikujiConfig } from '@/hooks/useOmikujiConfig'
import OmikujiWheel from '@/components/OmikujiWheel'
import ConfigPanel from '@/components/ConfigPanel'

export default function Home() {
  const { config, updateConfig, isLoading } = useOmikujiConfig()

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <OmikujiWheel config={config} />
        <ConfigPanel config={config} onConfigUpdate={updateConfig} />
      </div>
    </main>
  )
}