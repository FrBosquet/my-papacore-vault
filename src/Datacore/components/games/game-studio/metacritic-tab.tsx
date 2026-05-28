import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
}

export const MetacriticTab = ({ name }: Props) => {
  const value = useDebouncedState(name)

  const query = encodeURIComponent(value)

  return (
    <iframe
      title="Metacritic"
      src={`https://www.metacritic.com/search/${query}`}
      style={{ zoom: 0.75 }}
      className="w-full h-full"
    />
  )
}
