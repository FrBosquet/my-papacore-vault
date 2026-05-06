import type { ComponentChildren } from 'preact'

export const ModalHeader = ({ children }: { children: ComponentChildren }) => {
  return (
    <h3 className="pb-4 text-sm font-bold uppercase text-green-400 tracking-wider m-0">
      {children}
    </h3>
  )
}
