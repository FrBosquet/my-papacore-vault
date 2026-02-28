import type { ComponentChildren } from 'preact'
import { useRef } from 'preact/hooks'
import type { IconName } from '../../../icons'
import { classMerge } from '../../utils/classMerge'
import { cva } from './class-variance-authority'

export type ContextOption =
  | {
      icon: IconName
      label: string
      action: () => void
    }
  | {
      type: 'divider'
    }

type Props = {
  children: ComponentChildren
  options: ContextOption[]
  className?: string
  variant?: Parameters<typeof getVariant>[0]
}

const getVariant = cva({
  base: 'appearance-none bg-transparent border-none rounded-none p-0 m-0 cursor-pointer backdrop:bg-primary-950',
  variants: {
    default:
      'uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent hover:text-theme-contrast transition-all overflow-hidden flex items-center gap-2',
    plain: 'text-primary-300 hover:text-theme-contrast',
  },
  sizes: {
    default: '',
  },
})

export const ContextMenu = ({
  children,
  options,
  className,
  variant,
}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const mouseDownOnOverlay = useRef(false)

  const handleTriggerClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect && panelRef.current) {
      panelRef.current.style.top = `${rect.bottom + 4}px`
      panelRef.current.style.left = `${rect.left}px`
    }

    dialogRef.current?.showModal()
  }

  const handleOptionClick = (action: () => void) => {
    action()
    dialogRef.current?.close()
  }

  return (
    <div className="contents">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        className={classMerge(getVariant(variant), className)}
      >
        {children}
      </button>
      <dialog
        className="backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        ref={dialogRef}
        onMouseDown={(e) => {
          mouseDownOnOverlay.current = e.target === e.currentTarget
        }}
        onClick={(e) => {
          e.stopPropagation()
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
          ref={panelRef}
          className="bg-primary-700 fixed flex flex-col shadow-2xl pointer-events-auto min-w-48 py-1  border border-primary-800 overflow-hidden"
        >
          {options.map((option) => {
            if ('type' in option && option.type === 'divider') {
              return (
                <div
                  key="divider"
                  className="h-px w-full bg-primary-900 shadow-2xl"
                />
              )
            }

            if ('icon' in option && 'label' in option && 'action' in option) {
              return (
                <button
                  key={option.label}
                  type="button"
                  className="appearance-none shadow-none bg-transparent border-none rounded-none flex justify-start items-center gap-3 px-3 py-2 text-sm text-primary-200 hover:bg-primary-800 hover:text-theme-accent cursor-pointer transition-colors w-full"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleOptionClick(option.action)
                  }}
                >
                  <dc.Icon icon={option.icon} className="size-4" />
                  <span>{option.label}</span>
                </button>
              )
            }
            return null
          })}
        </div>
      </dialog>
    </div>
  )
}
