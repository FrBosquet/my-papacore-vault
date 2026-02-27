import type { ComponentChildren } from 'preact'
import type { IconName } from '../../../icons'
import { classMerge } from '../../utils/classMerge'
import { getFile, getLeaf } from '../../utils/files'
import { cva } from './class-variance-authority'

type Props = {
  children: ComponentChildren
  className?: string
  wrapperClassName?: string
  icon?: IconName
  iconClassName?: string
  tooltip?: string
  variant?: Parameters<typeof getVariant>[0]
} & (
  | { path: string; onClick?: never }
  | { path?: never; onClick: (e: MouseEvent) => void }
)

const getVariant = cva({
  base: 'no-underline',
  variants: {
    default:
      'uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent hover:text-theme-contrast transition-all overflow-hidden w-full flex items-center gap-2',
    plain: 'text-primary-300 hover:text-theme-contrast',
  },
  sizes: {
    default: '',
  },
})

export const Link = ({
  path,
  children,
  onClick,
  variant,
  icon,
  className,
  iconClassName,
  tooltip,
}: Props) => {
  const variantValue = getVariant(variant)

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (onClick) {
      onClick(e)
      return
    }

    const file = getFile(path)

    if (!file) return

    const isCtrlPressed = e.ctrlKey || e.metaKey
    getLeaf(isCtrlPressed).openFile(file)
  }

  return (
    <a
      onClick={handleClick}
      className={classMerge(variantValue, className)}
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
