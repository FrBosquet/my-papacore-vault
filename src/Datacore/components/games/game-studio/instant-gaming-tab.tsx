import { getInstantGamingUrl } from '../../../utils/services'
import { EmbeddedPage } from './embedded-page'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
}

export const InstantGamingTab = ({ name }: Props) => {
  const value = useDebouncedState(name)

  return (
    <EmbeddedPage title="Instant Gaming" src={getInstantGamingUrl(value)} />
  )
}
