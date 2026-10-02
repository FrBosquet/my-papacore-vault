const PARTITION = 'persist:papacore-game-studio'

const PRELOAD_SOURCE = `
let accepted = false
const acceptBanner = () => {
  if (accepted) return
  const host = location.hostname

  if (host.endsWith('howlongtobeat.com') || host.endsWith('metacritic.com')) {
    if (host.endsWith('howlongtobeat.com')) {
      document.cookie = 'zdconsent=optin; path=/; max-age=33955200; Secure'
    }
    const button = document.querySelector('#onetrust-accept-btn-handler')
    if (!button) return
    accepted = true
    button.click()
  }

  if (host.endsWith('instant-gaming.com')) {
    const banner = document.querySelector('#cookies-banner')
    if (!banner) return
    const accept = [...banner.querySelectorAll('button')].find((button) => {
      const label = (button.textContent || '').trim().toLowerCase()
      return label === 'aceptar todo' || label === 'accept all' || label === 'tout accepter'
    })
    if (!accept) return
    accepted = true
    accept.click()
  }
}

const start = () => {
  acceptBanner()
  const observer = new MutationObserver(acceptBanner)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  setTimeout(() => observer.disconnect(), 15000)
}

if (document.documentElement) start()
else document.addEventListener('DOMContentLoaded', start)
`

type NodeRequire = (module: string) => unknown

const getNodeRequire = (): NodeRequire | undefined => {
  const maybeWindow = window as Window & { require?: NodeRequire }
  return maybeWindow.require
}

let preloadPath: string | undefined

const getWebviewPreloadPath = (): string | undefined => {
  if (preloadPath) return preloadPath

  try {
    const nodeRequire = getNodeRequire()
    if (!nodeRequire) return undefined

    const fs = nodeRequire('fs') as {
      writeFileSync: (path: string, data: string) => void
    }
    const path = nodeRequire('path') as {
      join: (...parts: string[]) => string
    }
    const basePath = (
      dc.app.vault.adapter as { getBasePath?: () => string }
    ).getBasePath?.()
    if (!basePath) return undefined
    const filePath = path.join(
      basePath,
      '.obsidian',
      'papacore-webview-preload.js'
    )
    fs.writeFileSync(filePath, PRELOAD_SOURCE)
    preloadPath = filePath
    return filePath
  } catch {
    return undefined
  }
}

const rememberHltbConsent = async () => {
  try {
    const nodeRequire = getNodeRequire()
    if (!nodeRequire) return

    const { session } = nodeRequire('electron') as {
      session: {
        fromPartition: (partition: string) => {
          cookies: {
            set: (cookie: Record<string, unknown>) => Promise<void>
          }
        }
      }
    }

    await session.fromPartition(PARTITION).cookies.set({
      url: 'https://howlongtobeat.com/',
      name: 'zdconsent',
      value: 'optin',
      path: '/',
      secure: true,
      expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    })
  } catch {
    // The page script still clicks the banner if the cookie cannot be seeded.
  }
}

export type EmbeddedWebview = HTMLElement & {
  setZoomFactor?: (factor: number) => void
  executeJavaScript?: (code: string) => Promise<unknown>
}

interface Props {
  title: string
  src: string
  viewRef?: { current: EmbeddedWebview | null }
}

export const EmbeddedPage = ({ title, src, viewRef }: Props) => {
  const hostRef = dc.useRef<HTMLDivElement | null>(null)

  dc.useEffect(() => {
    if (dc.app.isMobile) return

    const host = hostRef.current
    if (!host) return

    let cancelled = false

    const open = async () => {
      await rememberHltbConsent()
      if (cancelled || !host.isConnected) return

      let view = host.querySelector('webview') as EmbeddedWebview | null
      if (!view) {
        view = document.createElement('webview') as EmbeddedWebview
        view.setAttribute('partition', PARTITION)
        view.style.width = '100%'
        view.style.height = '100%'
        view.style.border = '0'
        const preload = getWebviewPreloadPath()
        if (preload) view.setAttribute('preload', preload)
        view.addEventListener('dom-ready', () => {
          view?.setZoomFactor?.(0.75)
        })
        host.appendChild(view)
      }

      if (viewRef) viewRef.current = view

      if (view.getAttribute('src') !== src) {
        view.setAttribute('src', src)
      }
    }

    open()

    return () => {
      cancelled = true
    }
  }, [src])

  if (dc.app.isMobile) {
    return (
      <iframe
        title={title}
        src={src}
        style={{ zoom: 0.75 }}
        className="w-full h-full"
      />
    )
  }

  return <div ref={hostRef} title={title} className="w-full h-full" />
}
