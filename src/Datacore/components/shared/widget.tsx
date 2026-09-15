import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { ComponentChildren } from 'preact'
import { classMerge } from '../../utils/classMerge'
import { getResourcePath } from '../../utils/files'
import { getFrontmatterValue } from '../../utils/markdown'
import { LogAnnotationModal } from '../logs/log-annotation-modal'
import { useDialog } from './dialog'
import { Image } from './image'
import { Link } from './link'

export type Props = {
  page: MarkdownPage
  children: ComponentChildren
  tooltip?: string
  className?: string
  actions?: ComponentChildren
  omitModalLogger?: boolean
  coverAction?: {
    onClick: (e: MouseEvent) => void
    tooltip?: string
  }
}

export const WidgetItem = ({
  page,
  children,
  tooltip,
  className,
  actions,
  omitModalLogger = false,
  coverAction,
}: Props) => {
  const image = getFrontmatterValue<string>(page, 'image')
  const { ref: dialogRef, close, open } = useDialog()

  const hasModalLogger = !omitModalLogger

  return (
    <div className="bg-primary-950 flex w-full gap-2 overflow-hidden">
      {hasModalLogger ? (
        <LogAnnotationModal page={page} dialogRef={dialogRef} close={close} />
      ) : null}
      <Link
        onLongPress={hasModalLogger ? open : undefined}
        path={page.$path}
        tooltip={tooltip}
        key={page.$path}
        className={classMerge(
          `flex items-center gap-2 group hover:bg-theme-contrast bg-primary-950 transition w-full overflow-hidden hover:text-primary-800 relative h-10 text-sm flex-1`,
          className
        )}
      >
        <div className="relative h-full aspect-square shrink-0 overflow-hidden group/cover">
          <Image
            src={image ?? getResourcePath('Images/empty.jpg')}
            alt={page.$name}
            className={classMerge(
              'h-full aspect-square object-cover transition-[filter]',
              coverAction && 'group-hover/cover:blur-sm'
            )}
          />
          {coverAction ? (
            <button
              type="button"
              aria-label={coverAction.tooltip ?? 'Play'}
              className="absolute inset-0 grid place-items-center opacity-0 pointer-events-none group-hover/cover:opacity-100 group-hover/cover:pointer-events-auto appearance-none bg-transparent border-none shadow-none outline-none cursor-pointer transition-opacity p-0 m-0 size-full"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                coverAction.onClick(e)
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
            >
              <dc.Icon
                icon="play"
                className="size-4 text-black translate-x-px"
              />
            </button>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          {children}
        </div>
      </Link>
      {actions ? (
        <menu className="flex items-center justify-center">{actions}</menu>
      ) : null}
    </div>
  )
}
