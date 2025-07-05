export interface OmikujiItem {
  id: string
  name: string
  description: string
  weight: number
  color?: string
}

export interface OmikujiConfig {
  title: string
  items: OmikujiItem[]
  buttonText: string
  resetText: string
}

export interface OmikujiResult {
  item: OmikujiItem
  timestamp: Date
}