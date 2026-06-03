import type { MarkdownPage } from '@blacksmithgu/datacore'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { Scroller } from '../shared/scroller'
import { GameItem } from './game-item'
import { GameStudioModal } from './game-studio/game-studio-modal'

export const GameWidget = ({ steamGridApiKey }: { steamGridApiKey: string }) => {
  const games = dc.useQuery<MarkdownPage>(
    `@page AND path("Gaming/Games") AND start AND !end`
  )

  return (
    <Card>
      <header className="flex justify-between items-center">
        <Link path="Gaming/2. Next.base" icon="gamepad-2">
          Playing
        </Link>
        <GameStudioModal steamGridApiKey={steamGridApiKey}/>
      </header>
      <Scroller className="h-30" wrapperClassName="gap-2">
        {games.map((game) => (
          <GameItem key={game.$path} game={game} />
        ))}
      </Scroller>
    </Card>
  )
}
