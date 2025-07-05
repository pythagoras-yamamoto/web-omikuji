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