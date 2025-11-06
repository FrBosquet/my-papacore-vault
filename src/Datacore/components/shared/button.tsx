import type { ComponentChildren } from 'preact'
import type { IconName } from '../../../icons'
import { classMerge } from '../../utils/classMerge'
import { cva } from './class-variance-authority'

const getVariant = cva({
  base: 'relative rounded-none cursor-pointer h-auto uppercase font-semibold transition-colors py-1 flex gap-1 items-center',
  variants: {
    default:
      'bg-theme-accent text-primary-950 h-auto hover:bg-theme-accent-hover tracking-wide disabled:bg-theme-accent-disabled disabled:cursor-not-allowed active:bg-white active:text-theme-disabled',
    secondary:
      'bg-theme-contrast text-white h-auto hover:bg-theme-contrast-hover tracking-wide disabled:bg-theme-contrast-disabled disabled:cursor-not-allowed active:bg-white active:text-theme-contrast',
    warning:
      'bg-red-700 text-red-300 h-auto hover:bg-red-500 tracking-wide disabled:bg-red-700 disabled:cursor-not-allowed active:bg-white active:text-red-700',
  },
  sizes: {
    default: 'px-2 text-sm',
    sm: 'px-1 text-xs',
    lg: 'px-3 text-base',
    icon: 'px-1 py-1 rounded-full text-xs',
  },
})

type Props = {
  children?: ComponentChildren
  icon?: IconName
  iconRight?: IconName
  className?: string
  onClick?: () => void
  variant?: Parameters<typeof getVariant>[0]
  size?: Parameters<typeof getVariant>[1]
  disabled?: boolean
  tooltip?: string
  isLoading?: boolean
}

export const Button = ({
  children,
  icon,
  iconRight,
  className,
  onClick,
  size,
  variant,
  disabled,
  tooltip,
  isLoading,
}: Props) => {
  const variantValue = getVariant(variant, size)
  const calculatedClassName = classMerge(variantValue, className)

  const loaderClassname = classMerge(
    calculatedClassName,
    'absolute inset-0 flex justify-center items-center opacity-0 transition-opacity pointer-events-none duration-600',
    isLoading ? 'opacity-100' : 'opacity-0'
  )

  return (
    <button
      aria-label={tooltip}
      type="button"
      className={calculatedClassName}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {icon && <dc.Icon icon={icon} />}
      {children}
      {iconRight && <dc.Icon icon={iconRight} />}
      <div className={loaderClassname}>
        <dc.Icon icon="loader" className="animate-spin" />
      </div>
    </button>
  )
}
