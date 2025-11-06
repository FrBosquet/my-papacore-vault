export const classMerge = (...classNames: Array<string | undefined>): string => {
  /**
   * This utility aims to be able to merge classNames to avoid type collisions
   * so if we have a first argument `h-4 w-auto` and a second argument `h-6`, we need to detect the common root and replace the h-4 with the h-6.
   * If more arguments are provided, we merge the first with the second, and recursively call this function with the result and the rest of arguments
   */

  // Base cases
  if (classNames.length === 0) return ''
  if (classNames.length === 1) return classNames[0] || ''

  // Recursive case: merge first two, then merge result with rest
  if (classNames.length > 2) {
    const [first, second, ...rest] = classNames
    const merged = classMerge(first, second)
    return classMerge(merged, ...rest)
  }

  // Merge two class strings
  const [first, second] = classNames

  const firstClasses = (first || '').split(' ').filter(Boolean)
  const secondClasses = (second || '').split(' ').filter(Boolean)

  /**
   * Extract a conflict key from a class name to detect which classes override others
   * Examples:
   * - h-4 -> 'h-'
   * - h-6 -> 'h-' (conflicts with h-4)
   * - w-auto -> 'w-'
   * - px-4 -> 'px-' (padding-x)
   * - p-4 -> 'p-' (all padding)
   * - text-lg -> 'text-size-'
   * - text-red-500 -> 'text-color-'
   */
  const getConflictKey = (className: string): string => {
    // Handle arbitrary values like h-[20px]
    const arbitraryMatch = className.match(/^([a-z-]+)\[/)
    if (arbitraryMatch) return arbitraryMatch[1]

    const parts = className.split('-')
    if (parts.length === 0) return className

    const prefix = parts[0]

    // Position utilities should all conflict with each other
    if (['absolute', 'relative', 'fixed', 'sticky', 'static'].includes(className)) {
      return 'position-'
    }

    // Pointer events utilities should all conflict with each other
    if (['pointer-events-none', 'pointer-events-auto'].includes(className)) {
      return 'pointer-events-'
    }

    // Special handling for text utilities to avoid false conflicts
    if (prefix === 'text' && parts.length >= 2) {
      const second = parts[1]

      // Size classes
      const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']
      if (sizes.includes(second)) return 'text-size-'

      // Alignment classes
      if (['left', 'center', 'right', 'justify', 'start', 'end'].includes(second)) {
        return 'text-align-'
      }

      // Transform classes
      if (['uppercase', 'lowercase', 'capitalize', 'normal'].includes(second)) {
        return 'text-transform-'
      }

      // Wrap/nowrap/truncate
      if (['wrap', 'nowrap', 'balance', 'pretty', 'ellipsis', 'clip'].includes(second)) {
        return 'text-wrap-'
      }

      // Otherwise assume it's a color
      return 'text-color-'
    }

    // Handle directional modifiers for padding/margin (p, m)
    if (['p', 'm'].includes(prefix) && parts.length >= 2) {
      const directions = ['x', 'y', 't', 'b', 'l', 'r', 's', 'e']
      if (directions.includes(parts[1])) {
        return `${prefix}${parts[1]}-`
      }
    }

    // Default: use prefix as conflict key
    return `${prefix}-`
  }

  // Build a map where later classes override earlier ones with the same conflict key
  const classMap = new Map<string, string>()

  // Add first classes to the map
  firstClasses.forEach(cls => {
    const key = getConflictKey(cls)
    classMap.set(key, cls)
  })

  // Override with second classes (later wins)
  secondClasses.forEach(cls => {
    const key = getConflictKey(cls)
    classMap.set(key, cls)
  })

  return Array.from(classMap.values()).join(' ')
}
