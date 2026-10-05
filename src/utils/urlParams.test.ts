import { encodeResultToUrl, decodeResultFromUrl, decodeNamesFromUrl } from './urlParams'

describe('result sharing', () => {
  it('round-trips names and result through the URL', () => {
    const timestamp = new Date('2026-10-05T09:30:00.000Z')
    const url = encodeResultToUrl(['田中', '鈴木'], { selectedName: '鈴木', timestamp })

    expect(decodeNamesFromUrl(url)).toEqual(['田中', '鈴木'])
    expect(decodeResultFromUrl(url)).toEqual({ selectedName: '鈴木', timestamp })
  })

  it('returns null when no result param is present', () => {
    expect(decodeResultFromUrl('http://localhost/omikuji')).toBeNull()
  })

  it('returns null for a broken result param', () => {
    expect(decodeResultFromUrl('http://localhost/omikuji?result=%%%')).toBeNull()
  })
})
