import { getInstantGamingUrl } from '../../../utils/services'
import { EmbeddedPage, type EmbeddedWebview } from './embedded-page'
import { parseInstantGamingPrice, READ_PRICE } from './instant-gaming-price'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
  onValue: (price?: string) => void
}

export const InstantGamingTab = ({ name, onValue }: Props) => {
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
        const raw = await view.executeJavaScript(READ_PRICE)

        if (cancelled) return
        const price = parseInstantGamingPrice(
          typeof raw === 'string' ? raw : undefined
        )
        // An empty read means the page is still rendering. Keep the last value.
        if (price) onValueRef.current(price)
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
        title="Instant Gaming"
        src={getInstantGamingUrl(value)}
        viewRef={viewRef}
      />
    </div>
  )
}
