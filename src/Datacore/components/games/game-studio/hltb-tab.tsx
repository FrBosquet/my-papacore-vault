import { getHLTBUrl } from '../../../utils/services'
import { EmbeddedPage, type EmbeddedWebview } from './embedded-page'
import { parseHltbHours, READ_MAIN_PLUS_SIDES } from './hltb-hours'
import {
  type HltbProfile,
  parseHltbProfileRead,
  profileFromGameHtml,
  READ_HLTB_PROFILE,
  readHltbGamePage,
} from './hltb-profile'
import { fetchSteamEsrb } from './steam-esrb'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
  onValue: (hours?: string) => void
  onProfile: (profile?: HltbProfile) => void
}

export const HLTBTab = ({ name, onValue, onProfile }: Props) => {
  const value = useDebouncedState(name)
  const viewRef = dc.useRef<EmbeddedWebview | null>(null)
  const onValueRef = dc.useRef(onValue)
  const onProfileRef = dc.useRef(onProfile)
  const queryRef = dc.useRef(value)
  const fetchedGameId = dc.useRef<string | undefined>(undefined)
  const profileRequest = dc.useRef(0)
  const steamRatingRef = dc.useRef<{
    appId?: string
    esrb?: string
    pending?: boolean
  }>({})

  onValueRef.current = onValue
  onProfileRef.current = onProfile

  dc.useEffect(() => {
    const queryChanged = queryRef.current !== value
    queryRef.current = value
    if (queryChanged) {
      onValueRef.current(undefined)
      onProfileRef.current(undefined)
      fetchedGameId.current = undefined
      steamRatingRef.current = {}
      profileRequest.current += 1
    }
    if (dc.app.isMobile || !value.trim()) return

    let cancelled = false

    const tick = async () => {
      const view = viewRef.current
      if (!view?.executeJavaScript) return

      try {
        const raw = await view.executeJavaScript(READ_MAIN_PLUS_SIDES)

        if (cancelled) return
        const hours = parseHltbHours(typeof raw === 'string' ? raw : undefined)
        // An empty read means the page is still rendering. Keep the last value.
        if (hours) onValueRef.current(hours)
      } catch {
        // The page is still navigating. Keep polling.
      }

      try {
        const raw = await view.executeJavaScript(READ_HLTB_PROFILE)
        if (cancelled) return
        const read = parseHltbProfileRead(
          typeof raw === 'string' ? raw : undefined
        )
        const publish = async (profile: HltbProfile) => {
          const generation = profileRequest.current
          let esrb = profile.esrb
          const appId = profile.steamAppId
          // HowLongToBeat often has no ESRB. Steam does, for the same game.
          if (!esrb && appId) {
            const cached = steamRatingRef.current
            if (cached.appId === appId && cached.pending) return
            if (cached.appId === appId) {
              esrb = cached.esrb
            } else {
              steamRatingRef.current = { appId, pending: true }
              try {
                const fetched = await fetchSteamEsrb(appId)
                if (cancelled || generation !== profileRequest.current) return
                steamRatingRef.current = { appId, esrb: fetched }
                esrb = fetched
              } catch {
                if (cancelled || generation !== profileRequest.current) return
                steamRatingRef.current = { appId }
              }
            }
          }
          if (cancelled || generation !== profileRequest.current) return
          onProfileRef.current(
            esrb === profile.esrb ? profile : { ...profile, esrb }
          )
        }

        if (read?.profile) {
          await publish(read.profile)
          return
        }

        const gameId = read?.gameId
        if (!gameId || gameId === fetchedGameId.current) return
        if (fetchedGameId.current) onProfileRef.current(undefined)

        const request = ++profileRequest.current
        const html = await view.executeJavaScript(readHltbGamePage(gameId))
        if (cancelled || request !== profileRequest.current) return
        const parsed = profileFromGameHtml(
          typeof html === 'string' ? html : undefined
        )
        if (!parsed.found) return
        fetchedGameId.current = gameId
        if (parsed.profile) await publish(parsed.profile)
      } catch {
        // The page is still navigating. Keep polling.
      }
    }

    tick()
    const timer = setInterval(tick, 1000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [value])

  return (
    <div className="h-full">
      <EmbeddedPage title="HLTB" src={getHLTBUrl(value)} viewRef={viewRef} />
    </div>
  )
}
