import { useLongPress } from './use-long-press'

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
  const {
    handlePointerDown,
    handlePointerUp: handlePointerUpFromLongPress,
    handlePointerLeave,
    consumeLongPress,
  } = useLongPress<HTMLButtonElement>({ onLongPress })

  const handlePointerUp: preact.JSX.MouseEventHandler<
    HTMLButtonElement
  > = async (event) => {
    handlePointerUpFromLongPress(event)

    if (!consumeLongPress()) {
      await onClick()
    }
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
