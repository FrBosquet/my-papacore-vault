import type { MarkdownPage } from '@blacksmithgu/datacore'
import { Card } from '../components/shared/card'

export const GamesWorkshop = () => {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
      <AllGamesCard />
      <CompletedGamesCard />
      <CompletedGamesCard />
    </div>
  )
}

const AllGamesCard = () => {
  const allGames = dc.useQuery<MarkdownPage>(`
    @page AND path("Gaming/Games")
  `)

  return (
    <Card>
      <main className="flex flex-col items-center justify-center">
        <p className="text-[4rem] text-gray-400"> {allGames.length}</p>
        <p className="text-sm text-gray-400">GAMES</p>
      </main>
    </Card>
  )
}

const CompletedGamesCard = () => {
  const completedGames = dc.useQuery<MarkdownPage>(`
    @page AND path("Gaming/Games") AND dateformat(end, "yyyy") = dateformat(now(), "yyyy")
  `)

  return (
    <Card>
      <main className="flex flex-col items-center justify-center">
        <p className="text-[4rem] text-green-400"> {completedGames.length}</p>
        <p className="text-sm text-gray-400">COMPLETED</p>
      </main>
    </Card>
  )
}
