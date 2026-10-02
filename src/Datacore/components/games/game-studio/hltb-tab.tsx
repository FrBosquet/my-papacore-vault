import { getHLTBUrl } from '../../../utils/services'
import { Button } from '../../shared/button'
import { EmbeddedPage, type EmbeddedWebview } from './embedded-page'
import { parseHltbHours, READ_MAIN_PLUS_SIDES } from './hltb-hours'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
  currentHours?: string
  onCopy: (hours: string) => void
}

export const HLTBTab = ({ name, currentHours, onCopy }: Props) => {
  const value = useDebouncedState(name)
  const viewRef = dc.useRef<EmbeddedWebview | null>(null)
  const [hours, setHours] = dc.useState<string | undefined>(undefined)

  dc.useEffect(() => {
    setHours(undefined)
    if (dc.app.isMobile || !value.trim()) return

    let cancelled = false

    const tick = async () => {
      const view = viewRef.current
      if (!view?.executeJavaScript) return

      try {
        const raw = await view.executeJavaScript(READ_MAIN_PLUS_SIDES)

        if (cancelled) return
        setHours(parseHltbHours(typeof raw === 'string' ? raw : undefined))
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
    <div className="flex h-full flex-col gap-2">
      {hours && (
        <Button
          icon="arrow-big-left"
          className="justify-start"
          disabled={currentHours === hours}
          onClick={() => onCopy(hours)}
        >
          {hours} hours - Copy to form
        </Button>
      )}
      <div className="min-h-0 flex-1">
        <EmbeddedPage title="HLTB" src={getHLTBUrl(value)} viewRef={viewRef} />
      </div>
    </div>
  )
}
