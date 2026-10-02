import { getMetacriticUrl } from '../../../utils/services'
import { EmbeddedPage, type EmbeddedWebview } from './embedded-page'
import { parseMetacriticScore, READ_METASCORE } from './metacritic-score'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
  onValue: (score?: string) => void
}

export const MetacriticTab = ({ name, onValue }: Props) => {
  const value = useDebouncedState(name)
  const viewRef = dc.useRef<EmbeddedWebview | null>(null)
  const onValueRef = dc.useRef(onValue)
  const queryRef = dc.useRef(value)

  onValueRef.current = onValue

  dc.useEffect(() => {
    const queryChanged = queryRef.current !== value
    queryRef.current = value
    if (queryChanged) onValueRef.current(undefined)
    if (dc.app.isMobile || !value.trim()) return

    let cancelled = false

    const tick = async () => {
      const view = viewRef.current
      if (!view?.executeJavaScript) return

      try {
        const raw = await view.executeJavaScript(READ_METASCORE)

        if (cancelled) return
        const score = parseMetacriticScore(
          typeof raw === 'string' ? raw : undefined
        )
        // An empty read means the page is still rendering. Keep the last value.
        if (score) onValueRef.current(score)
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
      <EmbeddedPage
        title="Metacritic"
        src={getMetacriticUrl(value)}
        viewRef={viewRef}
      />
    </div>
  )
}
