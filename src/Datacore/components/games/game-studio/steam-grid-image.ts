const WIDESCREEN_RATIO = 16 / 9

type SizedAsset = {
  width: number
  height: number
}

/** Picks the asset whose width/height is nearest to 16:9. */
export const closestWidescreenAsset = <T extends SizedAsset>(
  assets: T[]
): T | undefined => {
  const sized = assets.filter((asset) => asset.width > 0 && asset.height > 0)
  if (!sized.length) return assets[0]

  return sized.reduce((best, asset) => {
    const bestDistance = Math.abs(best.width / best.height - WIDESCREEN_RATIO)
    const distance = Math.abs(asset.width / asset.height - WIDESCREEN_RATIO)
    return distance < bestDistance ? asset : best
  })
}
