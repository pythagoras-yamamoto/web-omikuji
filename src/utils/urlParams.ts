import { OmikujiConfig } from '@/types/omikuji'

const CONFIG_PARAM = 'config'

export function encodeConfigToUrl(config: OmikujiConfig): string {
  try {
    const encoded = btoa(encodeURIComponent(JSON.stringify(config)))
    const url = new URL(window.location.href)
    url.searchParams.set(CONFIG_PARAM, encoded)
    return url.toString()
  } catch (error) {
    console.error('Failed to encode config to URL:', error)
    return window.location.href
  }
}

export function decodeConfigFromUrl(url?: string): OmikujiConfig | null {
  try {
    const urlObj = new URL(url || window.location.href)
    const encoded = urlObj.searchParams.get(CONFIG_PARAM)
    
    if (!encoded) return null
    
    const decoded = JSON.parse(decodeURIComponent(atob(encoded)))
    
    // 基本的なバリデーション
    if (!decoded.title || !Array.isArray(decoded.items) || decoded.items.length === 0) {
      return null
    }
    
    return decoded as OmikujiConfig
  } catch (error) {
    console.error('Failed to decode config from URL:', error)
    return null
  }
}

export function updateUrlWithConfig(config: OmikujiConfig): void {
  try {
    const encoded = btoa(encodeURIComponent(JSON.stringify(config)))
    const url = new URL(window.location.href)
    url.searchParams.set(CONFIG_PARAM, encoded)
    
    // URLを更新（ページはリロードしない）
    window.history.replaceState({}, '', url.toString())
  } catch (error) {
    console.error('Failed to update URL with config:', error)
  }
}

export function clearConfigFromUrl(): void {
  try {
    const url = new URL(window.location.href)
    url.searchParams.delete(CONFIG_PARAM)
    window.history.replaceState({}, '', url.toString())
  } catch (error) {
    console.error('Failed to clear config from URL:', error)
  }
}

export function copyConfigUrl(config: OmikujiConfig): Promise<boolean> {
  try {
    const url = encodeConfigToUrl(config)
    return navigator.clipboard.writeText(url).then(() => true).catch(() => false)
  } catch (error) {
    console.error('Failed to copy config URL:', error)
    return Promise.resolve(false)
  }
}