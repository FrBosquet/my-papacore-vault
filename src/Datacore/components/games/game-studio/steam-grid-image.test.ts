import { closestWidescreenAsset } from './steam-grid-image'

describe('closestWidescreenAsset', () => {
  it('prefers a 16:9 banner over a portrait poster', () => {
    const poster = { id: 'poster', width: 600, height: 900 }
    const banner = { id: 'banner', width: 1920, height: 1080 }

    expect(closestWidescreenAsset([poster, banner])).toBe(banner)
  })

  it('picks the Steam horizontal grid over a taller capsule', () => {
    const capsule = { id: 'capsule', width: 460, height: 215 }
    const poster = { id: 'poster', width: 600, height: 900 }

    expect(closestWidescreenAsset([poster, capsule])).toBe(capsule)
  })

  it('keeps the first asset when several are equally close', () => {
    const first = { id: 'first', width: 1600, height: 900 }
    const second = { id: 'second', width: 1920, height: 1080 }

    expect(closestWidescreenAsset([first, second])).toBe(first)
  })

  it('falls back to the first asset when sizes are missing', () => {
    const assets = [
      { id: 'unknown', width: 0, height: 0 },
      { id: 'also-unknown', width: 0, height: 0 },
    ]

    expect(closestWidescreenAsset(assets)).toBe(assets[0])
  })
})
