import { GameStudioModal } from '../components/games/game-studio/game-studio-modal'

type Props = {
  apiKey: string
}

export const GamePane = ({ apiKey }: Props) => {
  const file = dc.useCurrentFile()

  return (
    <menu className="flex justify-start gap-1 py-2">
      <div className="flex">
        <GameStudioModal
          steamGridApiKey={apiKey}
          file={file}
          triggerProps={{
            label: 'Game studio',
            icon: 'pencil',
            size: 'sm',
          }}
        />
      </div>
    </menu>
  )
}
