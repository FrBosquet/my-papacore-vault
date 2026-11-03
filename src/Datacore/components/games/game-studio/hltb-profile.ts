import { normalizeEsrb } from './steam-esrb'

export type HltbProfile = {
  developer?: string
  editor?: string
  released?: string
  esrb?: string
  /** Steam app id from HowLongToBeat. Used to look up an ESRB when HLTB has none. */
  steamAppId?: string
}

export type HltbProfileRead = {
  profile?: HltbProfile
  gameId?: string
}

type HltbGameRecord = {
  profile_dev?: unknown
  profile_pub?: unknown
  profile_steam?: unknown
  release_world?: unknown
  release_na?: unknown
  release_eu?: unknown
  rating_esrb?: unknown
}

const text = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

const asDate = (value: unknown): string | undefined => {
  return text(value)?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
}

const steamAppId = (value: unknown): string | undefined => {
  const id = typeof value === 'number' ? value : Number(text(value))
  if (!Number.isInteger(id) || id <= 0) return undefined
  return String(id)
}

/**
 * HowLongToBeat's game record. `profile_pub` is the publisher, which the
 * studio stores as the editor. Search cards only carry the id, so the tab
 * loads `/game/{id}` and reads the same record from `__NEXT_DATA__`.
 */
export const profileFromGameRecord = (
  game: HltbGameRecord
): HltbProfile | undefined => {
  const appId = steamAppId(game.profile_steam)
  const profile: HltbProfile = {
    developer: text(game.profile_dev),
    editor: text(game.profile_pub),
    released:
      asDate(game.release_world) ||
      asDate(game.release_na) ||
      asDate(game.release_eu),
    esrb: normalizeEsrb(game.rating_esrb),
    ...(appId ? { steamAppId: appId } : {}),
  }

  if (
    !profile.developer &&
    !profile.editor &&
    !profile.released &&
    !profile.esrb
  ) {
    return undefined
  }

  return profile
}

export const profileFromGameHtml = (
  html?: string | null
): { found: boolean; profile?: HltbProfile } => {
  if (!html) return { found: false }

  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  )
  if (!match?.[1]) return { found: false }

  try {
    const data = JSON.parse(match[1])
    const game = data?.props?.pageProps?.game?.data?.game?.[0]
    if (!game || typeof game !== 'object') return { found: false }
    return { found: true, profile: profileFromGameRecord(game) }
  } catch {
    return { found: false }
  }
}

export const parseHltbProfileRead = (
  raw?: string | null
): HltbProfileRead | undefined => {
  if (!raw) return undefined

  let data: HltbGameRecord & { gameId?: unknown }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return undefined
    data = parsed
  } catch {
    return undefined
  }

  const gameId =
    typeof data.gameId === 'string' && /^\d+$/.test(data.gameId)
      ? data.gameId
      : undefined
  const profile = profileFromGameRecord(data)
  if (!profile && !gameId) return undefined
  return { profile, gameId }
}

/**
 * Reads the open HLTB page. A game page has the profile in `__NEXT_DATA__`.
 * A search page does not, so this returns the top hit's game id. The first
 * "Main + Extra" card is that hit, the same card the hours reader uses.
 */
export const READ_HLTB_PROFILE = `
(() => {
  const text = (node) => (node?.textContent || '').replace(/\\s+/g, ' ').trim()
  try {
    const raw = document.getElementById('__NEXT_DATA__')?.textContent
    if (raw) {
      const data = JSON.parse(raw)
      const game = data?.props?.pageProps?.game?.data?.game?.[0]
      if (game && (game.profile_dev || game.profile_pub || game.release_world || game.release_na || game.rating_esrb)) {
        return JSON.stringify({
          profile_dev: game.profile_dev || '',
          profile_pub: game.profile_pub || '',
          release_world: game.release_world || '',
          release_na: game.release_na || '',
          release_eu: game.release_eu || '',
          rating_esrb: game.rating_esrb || '',
          profile_steam: game.profile_steam || 0,
        })
      }
    }
  } catch (error) {}

  const nodes = document.querySelectorAll('div, span, h4, h5, p')
  for (const node of nodes) {
    const label = text(node)
    if (label !== 'Main + Extra' && label !== 'Main + Sides') continue
    let card = node
    for (let i = 0; i < 10 && card; i += 1) {
      if (card.tagName === 'LI') break
      card = card.parentElement
    }
    const href = card?.querySelector?.('a[href*="/game/"]')?.getAttribute('href') || ''
    const id = href.match(/\\/game\\/(\\d+)/)?.[1]
    if (id) return JSON.stringify({ gameId: id })
  }
  return null
})()
`

export const readHltbGamePage = (gameId: string) => {
  if (!/^\d+$/.test(gameId)) {
    throw new Error('Invalid HLTB game id')
  }
  return `fetch('/game/${gameId}').then((response) => response.text())`
}
