import type { Ref, RefObject } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import type { IconName } from '../../../icons'
import { classMerge } from '../../utils/classMerge'
import { Button, type Props as ButtonProps } from './button'

export type Props = {
  children: React.ReactNode
  className?: string,
  wrapperClassName?: string
  title?: string
  icon?: IconName
  dialogRef: RefObject<HTMLDialogElement>
  triggerProps?: Partial<Omit<ButtonProps, 'onClick'>>
  onOpen?: () => void
  hideTrigger?: boolean
}

export const useDialog = (defaultOpen = false) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (defaultOpen && ref.current) {
      ref.current.showModal()
    }
  }, [defaultOpen, ref.current])

  return {
    ref,
    open: () => ref.current?.showModal(),
    close: () => ref.current?.close(),
  }
}

export const Dialog = (props: Props) => {
  const {
    children,
    className,
    wrapperClassName,
    icon,
    title,
    dialogRef,
    triggerProps,
    onOpen,
    hideTrigger = false,
  } = props
  const mouseDownOnOverlay = useRef(false)

  return (
    <div className="contents">
      <Button
        {...triggerProps}
        className={classMerge(
          'cursor-pointer',
          triggerProps?.className,
          hideTrigger && 'hidden'
        )}
        onClick={() => {
          if (dialogRef && 'current' in dialogRef) {
            dialogRef.current?.showModal()
            onOpen?.()
          }
        }}
      >
        {triggerProps?.label ??
          (triggerProps?.icon ? '' : (title ?? 'Open Dialog'))}
      </Button>
      <dialog
        className={wrapperClassName}
        ref={dialogRef}
        onMouseDown={(e) => {
          // Track if mousedown happened on the overlay (dialog element itself)
          mouseDownOnOverlay.current = e.target === e.currentTarget
        }}
        onClick={(e) => {
          // Only close if both mousedown and click happened on the overlay
          if (e.target === e.currentTarget && mouseDownOnOverlay.current) {
            e.currentTarget.close()
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.currentTarget.close()
          }
        }}
      >
        <div
          className={classMerge(
            'bg-primary-950 fixed flex flex-col p-4 left-1/2 top-1/2 transform -translate-x-[50%] -translate-y-1/2 shadow-2xl w-full pointer-events-auto max-w-[min(700px,calc(100vw-4rem))] max-h-[calc(100vh-2rem)]',
            className
          )}
        >
          {(title || icon) && (
            <header className="text-yellow-500 flex items-center gap-2 pb-4">
              {icon && <dc.Icon className="text-inherit" icon={icon} />}
              {title && (
                <h2
                  className={classMerge(
                    'text-xl font-bold my-0 tracking-[0.4ch] uppercase'
                  )}
                >
                  {title}
                </h2>
              )}
              <div className="flex-1" />
              <Button icon="x" size="icon-xs" onClick={() => dialogRef?.current?.close()} />
            </header>
          )}
          {children}
        </div>
      </dialog>
    </div>
  )
}
