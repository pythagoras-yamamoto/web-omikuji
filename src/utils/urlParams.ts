const NAMES_PARAM = 'names'

export function encodeNamesToUrl(names: string[]): string {
  try {
    const namesString = names.join(',')
    const encoded = btoa(unescape(encodeURIComponent(namesString)))
    const url = new URL(window.location.href)
    url.searchParams.set(NAMES_PARAM, encoded)
    return url.toString()
  } catch (error) {
    console.error('Failed to encode names to URL:', error)
    return window.location.href
  }
}

export function decodeNamesFromUrl(url?: string): string[] {
  try {
    const urlObj = new URL(url || window.location.href)
    const encoded = urlObj.searchParams.get(NAMES_PARAM)
    
    if (!encoded) return []
    
    const namesString = decodeURIComponent(escape(atob(encoded)))
    return namesString ? namesString.split(',').filter(name => name.trim()) : []
  } catch (error) {
    console.error('Failed to decode names from URL:', error)
    return []
  }
}

export function updateUrlWithNames(names: string[]): void {
  try {
    if (names.length === 0) {
      clearNamesFromUrl()
      return
    }
    
    const namesString = names.join(',')
    const encoded = btoa(unescape(encodeURIComponent(namesString)))
    const url = new URL(window.location.href)
    url.searchParams.set(NAMES_PARAM, encoded)
    
    // URLを更新（ページはリロードしない）
    window.history.replaceState({}, '', url.toString())
  } catch (error) {
    console.error('Failed to update URL with names:', error)
  }
}

export function clearNamesFromUrl(): void {
  try {
    const url = new URL(window.location.href)
    url.searchParams.delete(NAMES_PARAM)
    window.history.replaceState({}, '', url.toString())
  } catch (error) {
    console.error('Failed to clear names from URL:', error)
  }
}

export function copyNamesUrl(names: string[]): Promise<boolean> {
  try {
    const url = encodeNamesToUrl(names)
    return navigator.clipboard.writeText(url).then(() => true).catch(() => false)
  } catch (error) {
    console.error('Failed to copy names URL:', error)
    return Promise.resolve(false)
  }
}
const RESULT_PARAM = 'result'

export interface SharedResult {
  selectedName: string
  timestamp: Date
}

function encodeBase64(value: string): string {
  return btoa(unescape(encodeURIComponent(value)))
}

function decodeBase64(value: string): string {
  return decodeURIComponent(escape(atob(value)))
}

export function encodeResultToUrl(names: string[], result: SharedResult): string {
  try {
    const url = new URL(encodeNamesToUrl(names))
    const payload = JSON.stringify({
      n: result.selectedName,
      t: result.timestamp.toISOString(),
    })
    url.searchParams.set(RESULT_PARAM, encodeBase64(payload))
    return url.toString()
  } catch (error) {
    console.error('Failed to encode result to URL:', error)
    return window.location.href
  }
}

export function decodeResultFromUrl(url?: string): SharedResult | null {
  try {
    const urlObj = new URL(url || window.location.href)
    const encoded = urlObj.searchParams.get(RESULT_PARAM)
    if (!encoded) return null

    const parsed = JSON.parse(decodeBase64(encoded))
    if (typeof parsed?.n !== 'string' || !parsed.n.trim()) return null
    const timestamp = new Date(parsed.t)
    return {
      selectedName: parsed.n,
      timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
    }
  } catch (error) {
    console.error('Failed to decode result from URL:', error)
    return null
  }
}

export function clearResultFromUrl(): void {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has(RESULT_PARAM)) return
    url.searchParams.delete(RESULT_PARAM)
    window.history.replaceState({}, '', url.toString())
  } catch (error) {
    console.error('Failed to clear result from URL:', error)
  }
}

export function copyResultUrl(names: string[], result: SharedResult): Promise<boolean> {
  try {
    const url = encodeResultToUrl(names, result)
    const text = `🎯 ${result.selectedName} さんが選ばれました！\n${url}`
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  } catch (error) {
    console.error('Failed to copy result URL:', error)
    return Promise.resolve(false)
  }
}
