type Props = {
  children: React.ReactNode
}

export const Card = ({ children }: Props) => {
  return <section className="bg-primary-950 p-2 flex flex-col gap-3">
    {children}
  </section>
}
