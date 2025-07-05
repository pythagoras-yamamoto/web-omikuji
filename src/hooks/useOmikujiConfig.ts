import { useState, useEffect } from 'react'
import { OmikujiConfig } from '@/types/omikuji'
import { DEFAULT_CONFIG } from '@/utils/omikuji'
import { decodeConfigFromUrl, updateUrlWithConfig } from '@/utils/urlParams'

export function useOmikujiConfig() {
  const [config, setConfig] = useState<OmikujiConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // URLパラメータから設定を読み込み
    const urlConfig = decodeConfigFromUrl()
    if (urlConfig) {
      setConfig(urlConfig)
    }
    setIsLoading(false)
  }, [])

  const updateConfig = (newConfig: OmikujiConfig) => {
    setConfig(newConfig)
    updateUrlWithConfig(newConfig)
  }

  return {
    config,
    updateConfig,
    isLoading
  }
}