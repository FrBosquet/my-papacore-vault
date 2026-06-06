import { getHLTBUrl } from '../../../utils/services'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
}

export const HLTBTab = ({ name }: Props) => {
  const value = useDebouncedState(name)

  return (
    <iframe
      title="HLTB"
      src={getHLTBUrl(value)}
      style={{ zoom: 0.75 }}
      className="w-full h-full"
    />
  )
}
