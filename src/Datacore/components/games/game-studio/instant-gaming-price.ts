/**
 * Reads the selling price in euros.
 * A product page shows it in the buy box (`.amount .total`). The search page
 * shows the same price on each card; the first card is the top hit.
 */
export const READ_PRICE = `
(() => {
  const textOf = (node) =>
    (node?.textContent || '').replace(/\\u00a0/g, ' ').trim()
  const productPrice = textOf(document.querySelector('.amount .total'))
  if (/\\d/.test(productPrice)) return productPrice
  const cardPrice = textOf(
    document.querySelector('.search.listing-items .item .price'),
  )
  if (/\\d/.test(cardPrice)) return cardPrice
  return null
})()
`

export const parseInstantGamingPrice = (
  text?: string | null
): string | undefined => {
  if (!text) return undefined
  const cleaned = text.replace(/\u00a0/g, ' ').replace(/[€$£]/g, ' ')
  const match = cleaned.match(/(\d[\d.,]*)/)
  if (!match?.[1]) return undefined

  let numeric = match[1]
  const lastComma = numeric.lastIndexOf(',')
  const lastDot = numeric.lastIndexOf('.')

  if (lastComma !== -1 && lastDot !== -1) {
    numeric =
      lastComma > lastDot
        ? numeric.replace(/\./g, '').replace(',', '.')
        : numeric.replace(/,/g, '')
  } else if (lastComma !== -1) {
    numeric = numeric.replace(',', '.')
  }

  const amount = Number(numeric)
  if (!Number.isFinite(amount)) return undefined
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100
  return String(rounded)
}
