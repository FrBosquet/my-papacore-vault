/**
 * Reads the Main + Sides time from HowLongToBeat.
 * The game page labels that box "Main + Sides". The search results page
 * labels the same stat "Main + Extra" on each card; the first card is the
 * top hit for the query.
 */
export const READ_MAIN_PLUS_SIDES = `
(() => {
  const readLabel = (label) => {
    const nodes = document.querySelectorAll('h4, h5, div, span, p')
    for (const node of nodes) {
      const text = (node.textContent || '').trim()
      if (text !== label) continue
      const siblingText = (node.nextElementSibling?.textContent || '').trim()
      if (siblingText && /\\d/.test(siblingText)) return siblingText
    }
    return null
  }
  return readLabel('Main + Sides') || readLabel('Main + Extra')
})()
`

/**
 * Turns an HLTB time label into hours.
 * "14½ Hours" -> "14.5", "40 Mins" -> "0.7".
 */
export const parseHltbHours = (text?: string | null): string | undefined => {
  if (!text) return undefined

  const normalized = text
    .replace(/½/g, '.5')
    .replace(/¼/g, '.25')
    .replace(/¾/g, '.75')
    .trim()

  const match = normalized.match(/(\d+(?:\.\d+)?)/)
  if (!match?.[1]) return undefined

  const amount = Number(match[1])
  if (!Number.isFinite(amount)) return undefined

  const hours = /min/i.test(normalized) ? amount / 60 : amount
  const rounded = Math.round(hours * 10) / 10
  return String(rounded)
}
