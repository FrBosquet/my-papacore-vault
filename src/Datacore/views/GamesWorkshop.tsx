import type { MarkdownPage } from '@blacksmithgu/datacore'
import { Card } from '../components/shared/card'
import { Link } from '../components/shared/link'
import { GameItem } from '../components/games/game-item'
import { IconName } from '../../icons'

export const GamesWorkshop = () => {
  return (
    <article className="flex flex-col gap-4 pb-2">
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
        <AllGamesCard />
        <CompletedGamesCard />
        <PendingGamesCard />
      </div>
      <NowPlayingGamesCard />
      <MalformedGamesCard />
    </article>
  )
}

const AllGamesCard = () => {
  const allGames = dc.useQuery<MarkdownPage>(`
    @page AND path("Gaming/Games")
  `)

  return (
    <Card>
      <Link
        path="Gaming/3. All.base"
        className="flex flex-col items-center justify-center"
      >
        <p className="text-[4rem] text-gray-400"> {allGames.length}</p>
        <p className="text-sm text-gray-400">GAMES</p>
      </Link>
    </Card>
  )
}

const PendingGamesCard = () => {
  const allGames = dc.useQuery<MarkdownPage>(`
    @page AND path("Gaming/Games") AND !end AND !score
  `)

  return (
    <Card>
      <Link
        path="Gaming/2. Next.base"
        className="flex flex-col items-center justify-center"
      >
        <p className="text-[4rem] text-gray-400"> {allGames.length}</p>
        <p className="text-sm text-gray-400">BACKLOG</p>
      </Link>
    </Card>
  )
}

const CompletedGamesCard = () => {
  const completedGames = dc.useQuery<MarkdownPage>(`
    @page AND path("Gaming/Games") AND end AND score AND dateformat(end, "yyyy") = "2026"
  `)

  return (
    <Card>
      <Link
        path="Gaming/4. History.base"
        className="flex flex-col items-center justify-center"
      >
        <p className="text-[4rem] text-green-400"> {completedGames.length}</p>
        <p className="text-sm text-gray-400">THIS YEAR</p>
      </Link>
    </Card>
  )
}

const NowPlayingGamesCard = () => {
  const nowPlayingGames = dc.useQuery<MarkdownPage>(`
    @page AND path("Gaming/Games") AND start AND !end
  `)

  return (
    <Card>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
        <Link
          path="Gaming/2. Next.base"
          className="flex flex-col items-center justify-center"
        >
          <p className="text-[4rem] text-gray-400"> {nowPlayingGames.length}</p>
          <p className="text-sm text-gray-400">NOW PLAYING</p>
        </Link>
        <section className="md:col-span-2 flex flex-col gap-2">
          {
            nowPlayingGames.map((game) => (
              <GameItem key={game.$id} game={game} />
            ))
          }
        </section>
      </div>
    </Card>
  )
}

const MalformedGamesCard = () => {
  const malformedGames = dc.useQuery<MarkdownPage>(`
    @page AND path("Gaming/Games")
  `)

const filteredList = malformedGames.reduce<{ game: MarkdownPage, errors: string[] }[]>((acc, game) => {
  const errors = []
  if (!game.value('image')) errors.push('image')
  if (!game.value('year')) errors.push('year')
  if (!(game.value('price') !== undefined)) errors.push('price')
  if (!game.value('hltb')) errors.push('hltb')
  if (!game.value('metacritic')) errors.push('metacritic')

  if (errors.length > 0) {
    acc.push({
      game,
      errors,
    })
  }

  return acc
}, [])

  return (
    <Card>
      <h3>Games with errors</h3>
      <section className="flex flex-col gap-2 p-2">
          {
            filteredList.map(({game, errors}) => (
              <Link key={game.$id} path={game.$path} className="text-sm text-gray-400 flex gap-2 items-center">
                <p className="flex-1">{game.$name}</p>
                <div className="text-red-400 flex gap-1">{errors.map(error => <ErrorIcon key={error} error={error} />)}</div></Link>
            ))
          }
        </section>
    </Card>
  )
}

const IconWrapper = ({ icon, tooltip }: { icon: IconName, tooltip: string }) => {
  return (
    <button
      type="button"
      className="shadow-none p-0 cursor-pointer h-auto text-red-400"
      aria-label={tooltip}
    >
      <dc.Icon aria-label="Image" icon={icon} />
    </button>
  )
}

const ErrorIcon = ({ error }: { error: string }) => {
  switch (error) {
    case 'image': return <IconWrapper icon='image' tooltip="This game is missing an image" />
    case 'year': return <IconWrapper icon='calendar' tooltip="This game is missing a year" />
    case 'price': return <IconWrapper icon='dollar-sign' tooltip="This game is missing a price" />
    case 'hltb': return <IconWrapper icon='clock' tooltip="This game is missing a HLTB time" />
    case 'metacritic': return <IconWrapper icon='star' tooltip="This game is missing a Metacritic link" />
  }
}