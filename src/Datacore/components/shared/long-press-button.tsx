type LongPressButtonProps = {
  ariaLabel: string
  isDone: boolean | undefined
  faded?: boolean
  className?: string
  onClick: () => void | Promise<void>
  onLongPress: () => void | Promise<void>
  children: preact.ComponentChildren
}

export const LongPressButton = ({
  ariaLabel,
  isDone,
  faded,
  className,
  onClick,
  onLongPress,
  children,
}: LongPressButtonProps) => {
  const timerRef = dc.useRef<number | null>(null)
  const longPressFiredRef = dc.useRef(false)

  const clearTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handlePointerDown: preact.JSX.MouseEventHandler<
    HTMLButtonElement
  > = () => {
    longPressFiredRef.current = false
    timerRef.current = window.setTimeout(async () => {
      longPressFiredRef.current = true
      await onLongPress()
    }, 500)
  }

  const handlePointerUp: preact.JSX.MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    clearTimer()
    if (!longPressFiredRef.current) {
      await onClick()
    }
  }

  const handlePointerLeave: preact.JSX.MouseEventHandler<
    HTMLButtonElement
  > = () => {
    clearTimer()
  }

  return (
    <button
      aria-label={ariaLabel}
      type="button"
      data-is-done={isDone}
      data-faded={faded}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </button>
  )
}
