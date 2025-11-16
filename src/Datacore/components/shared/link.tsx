import type { ComponentChildren } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import type { IconName } from '../../../icons'
import { classMerge } from '../../utils/classMerge'
import { cleanPath } from '../../utils/files'

type Props = {
  path: string
  children: ComponentChildren
  className?: string
  wrapperClassName?: string
  icon?: IconName
  iconClassName?: string
  tooltip?: string
}

export const Link = ({ path, children, icon, className, iconClassName, tooltip, wrapperClassName }: Props) => {
  const pRef = useRef<HTMLParagraphElement>(null)

  // Create a link to the file
  const link = dc.fileLink(cleanPath(path)).withDisplay(
    (
      <div className={`flex items-center gap-2 ${className}`}>
        {icon && <dc.Icon icon={icon} className={iconClassName} />}
        {children}
      </div>
    ) as unknown as string
  ) // Allows to pass a React element as a string

  useEffect(() => {
    const aRef = pRef.current?.querySelector('a')

    if (tooltip && aRef) {
      aRef.setAttribute('aria-label', tooltip)
    }
  }, [])

  return (
    <p
      ref={pRef}
      className={classMerge("uppercase p-0 m-0 no-underline text-sm pc-link tracking-wide font-semibold text-theme-accent hover:text-theme-contrast transition-all", wrapperClassName)}
    >
      <dc.Link
        link={link}
      />
    </p>
  )
}
