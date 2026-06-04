import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
}

export const HLTBTab = ({ name }: Props) => {
  const value = useDebouncedState(name)

  const urlEncodedName = encodeURIComponent(value)

  return (
    <iframe
      title="HLTB"
      src={`https://howlongtobeat.com/?q=${urlEncodedName}`}
      style={{ zoom: 0.75 }}
      className="w-full h-full"
    />
  )
}
