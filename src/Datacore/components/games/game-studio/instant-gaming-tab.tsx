import { getInstantGamingUrl } from '../../../utils/services'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
}

export const InstantGamingTab = ({ name }: Props) => {
  const value = useDebouncedState(name)

  return (
    <iframe
      title="Instant Gaming"
      src={getInstantGamingUrl(value)}
      style={{ zoom: 0.75 }}
      className="w-full h-full"
    />
  )
}
