import type { ComponentChildren } from 'preact'
import type { IconName } from '../../../icons'
import { classMerge } from '../../utils/classMerge'
import { getFile, getLeaf } from '../../utils/files'

type Props = {
  path: string
  children: ComponentChildren
  className?: string
  wrapperClassName?: string
  icon?: IconName
  iconClassName?: string
  tooltip?: string
}

export const Link = ({
  path,
  children,
  icon,
  className,
  iconClassName,
  tooltip,
}: Props) => {
  const handleClick = (e: MouseEvent) => {
    const file = getFile(path)
    if (!file) return

    const isCtrlPressed = e.ctrlKey || e.metaKey
    getLeaf(isCtrlPressed).openFile(file)
  }

  return (
    <a
      onClick={handleClick}
      className={classMerge(
        'uppercase p-0 m-0 no-underline text-sm tracking-wide font-semibold text-theme-accent hover:text-theme-contrast transition-all overflow-hidden w-full flex items-center gap-2',
        className
      )}
      href={path}
      rel="noopener"
      target="_blank"
      aria-label={tooltip}
    >
      {icon && <dc.Icon icon={icon} className={iconClassName} />}
      {children}
    </a>
  )
}
