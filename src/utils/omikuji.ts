import { OmikujiItem, OmikujiConfig } from '@/types/omikuji'

export function drawOmikuji(items: OmikujiItem[]): OmikujiItem {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  const random = Math.random() * totalWeight
  
  let currentWeight = 0
  for (const item of items) {
    currentWeight += item.weight
    if (random <= currentWeight) {
      return item
    }
  }
  
  return items[items.length - 1]
}

export function encodeConfig(config: OmikujiConfig): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(config)))
  } catch {
    return ''
  }
}

export function decodeConfig(encoded: string): OmikujiConfig | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch {
    return null
  }
}

export const DEFAULT_CONFIG: OmikujiConfig = {
  title: 'おみくじ',
  buttonText: 'おみくじを引く',
  resetText: 'もう一度',
  items: [
    { id: '1', name: '大吉', description: '非常に良い運勢です', weight: 1, color: '#ef4444' },
    { id: '2', name: '中吉', description: '良い運勢です', weight: 2, color: '#f97316' },
    { id: '3', name: '小吉', description: 'まずまずの運勢です', weight: 3, color: '#eab308' },
    { id: '4', name: '吉', description: '普通の運勢です', weight: 4, color: '#22c55e' },
    { id: '5', name: '末吉', description: '少し良い運勢です', weight: 3, color: '#06b6d4' },
    { id: '6', name: '凶', description: '注意が必要です', weight: 2, color: '#8b5cf6' },
    { id: '7', name: '大凶', description: '慎重に行動しましょう', weight: 1, color: '#6b7280' },
  ],
}