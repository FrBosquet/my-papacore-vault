import type { ComponentChildren } from 'preact'
import type { IconName } from '../../../icons'
import { classMerge } from '../../utils/classMerge'
import { createFromTemplate, getFile, getLeaf } from '../../utils/files'
import { cva } from './class-variance-authority'

type Props = {
  children: ComponentChildren
  className?: string
  wrapperClassName?: string
  icon?: IconName
  iconClassName?: string
  tooltip?: string
  variant?: Parameters<typeof getVariant>[0]
  size?: Parameters<typeof getVariant>[1]
} & (
  | { path: string; onClick?: never }
  | { path?: never; onClick: (e: MouseEvent) => void }
) &
  (
    | {
        createIfNotExists: true
        template?: string
      }
    | {
        createIfNotExists?: false
        template?: never
      }
  )

const getVariant = cva({
  base: 'no-underline flex items-center gap-2',
  variants: {
    default:
      'uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent hover:text-theme-contrast transition-all overflow-hidden w-full flex items-center gap-2',
    plain: 'text-primary-300 hover:text-contrast-300 hover:bg-contrast-950',
  },
  sizes: {
    default: '',
    lg: 'text-base',
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
  createIfNotExists,
  template,
  size,
}: Props) => {
  const variantValue = getVariant(variant, size)

  const handleClick = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (onClick) {
      onClick(e)
      return
    }

    let file = getFile(path)

    if (!file) {
      if (!createIfNotExists || !template) return

      await createFromTemplate(path, template)
      file = getFile(path)

      if (!file) throw new Error(`Failed to create file: ${path}`)
    }

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
