import type { ComponentChildren } from 'preact'

type Props = {
  children: ComponentChildren
}

export const Card = ({ children }: Props) => {
  return (
    <section className="bg-primary-950 p-2 flex flex-col gap-3 w-full overflow-hidden">
      {children}
    </section>
  )
}
