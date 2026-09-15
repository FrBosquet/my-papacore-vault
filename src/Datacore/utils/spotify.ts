export type Album = {
  id: string
  name: string
  release_date: string
  artists: string[]
  images: Array<{
    url: string
    height: number
    width: number
  }>
  external_urls: { spotify: string }
  total_tracks: number
}

const SPOTIFY_OPEN_URL =
  /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(album|playlist)\/([a-zA-Z0-9]+)/i

type NodeRequire = (module: string) => unknown

const getNodeRequire = (): NodeRequire | undefined => {
  const maybeWindow = window as Window & { require?: NodeRequire }
  return maybeWindow.require
}

export const toSpotifyUri = (url: string) => {
  const trimmed = url.trim().replace(/^["']|["']$/g, '')
  const match = trimmed.match(SPOTIFY_OPEN_URL)

  if (!match?.[1] || !match[2]) {
    return undefined
  }

  return `spotify:${match[1]}:${match[2]}`
}

const playViaAppleScript = (uri: string) => {
  try {
    const nodeRequire = getNodeRequire()
    if (!nodeRequire) return false

    const { exec } = nodeRequire('child_process') as {
      exec: (command: string, callback?: (error: Error | null) => void) => void
    }

    exec(
      `osascript -e 'tell application "Spotify" to play track "${uri}"'`,
      (error) => {
        if (error) {
          openSpotifyUri(`${uri}:play`)
        }
      }
    )
    return true
  } catch {
    return false
  }
}

const openSpotifyUri = (uri: string) => {
  try {
    const nodeRequire = getNodeRequire()
    const electron = nodeRequire?.('electron') as
      | { shell?: { openExternal: (url: string) => void } }
      | undefined

    if (electron?.shell?.openExternal) {
      electron.shell.openExternal(uri)
      return
    }
  } catch {
    // Fall through to the browser-style opener.
  }

  window.location.href = uri
}

/**
 * Hand the album to the Spotify desktop app and start playback.
 * `?go=1` / window.open only opens a page; macOS needs the app URI (and
 * AppleScript `play track` to actually start audio).
 */
export const playSpotifyUrl = (url: string) => {
  const uri = toSpotifyUri(url)
  if (!uri) {
    return false
  }

  if (!dc.app.isMobile && playViaAppleScript(uri)) {
    return true
  }

  openSpotifyUri(`${uri}:play`)
  return true
}

export const searchAlbums = async (searchTerm: string, apiKey: string) => {
  const result = await fetch(
    `https://www.franbosquet.com/api/spotify?search=${encodeURIComponent(searchTerm)}&type=album`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  )

  if (result.status !== 200) {
    console.error(result)
    throw new Error(
      'Error leyendo la API. Comprueba la consola para más detalles.'
    )
  }

  const body: { albums: Array<Album> } = await result.json()

  return body.albums
}
