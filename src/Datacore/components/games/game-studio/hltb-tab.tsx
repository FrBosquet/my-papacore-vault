import { getHLTBUrl } from '../../../utils/services'
import { EmbeddedPage, type EmbeddedWebview } from './embedded-page'
import { parseHltbHours, READ_MAIN_PLUS_SIDES } from './hltb-hours'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
  onValue: (hours?: string) => void
}

export const HLTBTab = ({ name, onValue }: Props) => {
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
        const raw = await view.executeJavaScript(READ_MAIN_PLUS_SIDES)

        if (cancelled) return
        const hours = parseHltbHours(typeof raw === 'string' ? raw : undefined)
        // An empty read means the page is still rendering. Keep the last value.
        if (hours) onValueRef.current(hours)
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
