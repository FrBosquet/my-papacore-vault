import type { Ref } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import type { IconName } from '../../../icons';
import { classMerge } from '../../utils/classMerge';
import { Button, type Props as ButtonProps } from './button';

export type Props = {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: IconName
  dialogRef?: Ref<HTMLDialogElement>
  triggerProps?: Partial<Omit<ButtonProps, 'onClick'>>
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
    close: () => ref.current?.close()
  }
}

export const Dialog = (props: Props) => {
  const { children, className, icon, title, dialogRef, triggerProps } = props

  return (
    <div className="contents">
      <Button
        {...triggerProps}
        className={classMerge("cursor-pointer", triggerProps?.className)}
        onClick={() => {
          if (dialogRef && 'current' in dialogRef) {
            dialogRef.current?.showModal()
          }
        }}
      >
        {triggerProps?.label ?? title ?? 'Open Dialog'}
      </Button>
      <dialog
        ref={dialogRef}
        className={classMerge(
          'bg-primary-950 fixed flex flex-col p-4 left-1/2 top-1/2 transform -translate-x-[50%] -translate-y-1/2 shadow-2xl pointer-events-auto',
          className
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.currentTarget.close()
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.currentTarget.close()
          }
        }}
      >
        {(title || icon) && (
          <header className="text-yellow-500 flex items-center gap-2 pb-4">
            {icon && <dc.Icon className="text-inherit" icon={icon} />}
            {title && (
              <h2 className={classMerge('text-xl font-bold my-0 tracking-[0.4ch] uppercase')}>{title}</h2>
            )}
          </header>
        )}
        {children}
      </dialog>
    </div>
  )
}
