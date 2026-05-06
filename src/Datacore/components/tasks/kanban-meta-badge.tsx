import type { ComponentChildren } from 'preact'
import { classMerge } from '../../utils/classMerge'

export const KanbanMetaBadge = ({
  children,
  className,
}: {
  children: ComponentChildren
  className?: string
}) => {
  return (
    <span
      className={classMerge(
        'flex items-center gap-1 text-[0.45rem] leading-none px-1 py-0.5 rounded-full font-semibold uppercase whitespace-nowrap',
        className
      )}
    >
      {children}
    </span>
  )
}
