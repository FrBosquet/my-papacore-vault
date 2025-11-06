import { classMerge } from "../../utils/classMerge"

type BaseVariant = Record<string, string> & { default: string }
type BaseSize = {
  default: string
  sm?: string
  lg?: string
}

/**
 * Class Variance Authority
 */
export const cva =
  <V extends BaseVariant, S extends BaseSize>(config: {
    base: string
    variants: V
    sizes: S
  }) =>
    (variant?: keyof V, size?: keyof S) => {
      const base = config.base
      const variantClasses = config.variants[variant ?? 'default']
      const sizeClasses = config.sizes[size ?? 'default'] as string

      return classMerge(base, variantClasses, sizeClasses)
    }