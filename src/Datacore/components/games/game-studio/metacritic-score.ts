/**
 * Reads the critic Metascore.
 * Search results and the game page both render it as a badge whose
 * accessible name is "Metascore N out of 100". The first badge is the top
 * search hit, or the game's own score once a game page is open.
 */
export const READ_METASCORE = `
(() => {
  const badges = document.querySelectorAll('[aria-label^="Metascore "]')
  for (const badge of badges) {
    const label = badge.getAttribute('aria-label') || ''
    const match = label.match(/^Metascore (\\d+) out of 100$/)
    if (!match) continue
    const text = (badge.querySelector('span')?.textContent || '').trim()
    if (text === match[1]) return text
  }
  return null
})()
`

export const parseMetacriticScore = (
  text?: string | null
): string | undefined => {
  if (!text) return undefined
  const match = text.trim().match(/^(\d{1,3})$/)
  if (!match?.[1]) return undefined
  const score = Number(match[1])
  if (!Number.isInteger(score) || score < 0 || score > 100) return undefined
  return String(score)
}
