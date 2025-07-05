export function drawRandomName(names: string[]): string {
  if (names.length === 0) {
    throw new Error('名前が登録されていません')
  }
  
  const randomIndex = Math.floor(Math.random() * names.length)
  return names[randomIndex]
}