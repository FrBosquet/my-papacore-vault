import { getMetacriticUrl } from '../../../utils/services'
import { EmbeddedPage } from './embedded-page'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
}

export const MetacriticTab = ({ name }: Props) => {
  const value = useDebouncedState(name)

  return <EmbeddedPage title="Metacritic" src={getMetacriticUrl(value)} />
}
