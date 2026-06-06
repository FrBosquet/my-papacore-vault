import { getMetacriticUrl } from '../../../utils/services'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
}

export const MetacriticTab = ({ name }: Props) => {
  const value = useDebouncedState(name)

  return (
    <iframe
      title="Metacritic"
      src={getMetacriticUrl(value)}
      style={{ zoom: 0.75 }}
      className="w-full h-full"
    />
  )
}
