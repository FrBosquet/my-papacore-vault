import { GameStudioModal } from '../components/games/game-studio/game-studio-modal'
import { Link } from '../components/shared/link'
import {
  getHLTBUrl,
  getInstantGamingUrl,
  getMetacriticUrl,
} from '../utils/services'

export const GamePane = () => {
  const file = dc.useCurrentFile()

  return (
    <menu className="flex justify-start gap-3 py-2">
      <GameStudioModal
        file={file}
        triggerProps={{
          label: 'Game studio',
          icon: 'pencil',
          size: 'sm',
        }}
      />
      <div className="flex-1" />
      <Link href={getHLTBUrl(file.$name)} variant="button" size="sm">
        <dc.Icon icon="clock" /> How long to beat
      </Link>
      <Link href={getMetacriticUrl(file.$name)} variant="button" size="sm">
        <dc.Icon icon="star" /> Metacritic
      </Link>
      <Link href={getInstantGamingUrl(file.$name)} variant="button" size="sm">
        <dc.Icon icon="dollar-sign" /> Instant Gaming
      </Link>
    </menu>
  )
}
