type UseLongPressOptions = {
  onLongPress?: () => void | Promise<void>
  delay?: number
}

export const useLongPress = <TElement extends HTMLElement>({
  onLongPress,
  delay = 500,
}: UseLongPressOptions) => {
  const timerRef = dc.useRef<number | null>(null)
  const longPressFiredRef = dc.useRef(false)

  const clearTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handlePointerDown: preact.JSX.MouseEventHandler<TElement> = () => {
    if (!onLongPress) return

    longPressFiredRef.current = false
    timerRef.current = window.setTimeout(async () => {
      longPressFiredRef.current = true
      await onLongPress()
    }, delay)
  }

  const handlePointerUp: preact.JSX.MouseEventHandler<TElement> = () => {
    clearTimer()
  }

  const handlePointerLeave: preact.JSX.MouseEventHandler<TElement> = () => {
    clearTimer()
  }

  const consumeLongPress = () => {
    if (!longPressFiredRef.current) return false

    longPressFiredRef.current = false
    return true
  }

  return {
    handlePointerDown,
    handlePointerUp,
    handlePointerLeave,
    consumeLongPress,
  }
}
