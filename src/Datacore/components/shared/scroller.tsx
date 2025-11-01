import type { ComponentChildren } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"

type Props = {
  children: ComponentChildren
  className?: string
  wrapperClassName?: string
}

export const Scroller = ({ children, className, wrapperClassName }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState<'top' | 'middle' | 'bottom'>('top')

  useEffect(() => {
    const handleScroll = () => {
      const element = ref.current
      if (!element) return

      const scrollPosition = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight

      if (scrollPosition === 0) {
        setScrollState('top')
      } else if (scrollPosition + clientHeight === scrollHeight) {
        setScrollState('bottom')
      } else {
        setScrollState('middle')
      }
    }

    const element = ref.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <section className="relative">
      <div className="absolute h-10 z-10 bg-linear-to-b from-primary-950 to-transparent w-full top-0 transition duration-700 pointer-events-none opacity-100 data-[hidden=true]:opacity-0" data-hidden={scrollState === 'top'} />
      <div className={`overflow-y-scroll ${className}`} ref={ref}>
        <div className={`flex flex-col ${wrapperClassName}`}>
          {children}
        </div>
      </div>
      <div className="absolute h-10 z-10 bg-linear-to-t from-primary-950 to-transparent w-full bottom-0 transition duration-700 pointer-events-none opacity-100 data-[hidden=true]:opacity-0" data-hidden={scrollState === 'bottom'} />
    </section>
  )
}