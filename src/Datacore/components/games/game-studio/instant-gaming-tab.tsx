import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
}

export const InstantGamingTab = ({ name }: Props) => {
  const value = useDebouncedState(name)

  const query = encodeURIComponent(value)

  return (
    <iframe
      title="Instant Gaming"
      src={`https://www.instant-gaming.com/es/busquedas/?query=${query}`}
      style={{ zoom: 0.75 }}
      className="w-full h-full"
    />
  )
}
