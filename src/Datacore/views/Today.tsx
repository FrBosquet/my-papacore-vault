import { GameWidget } from "../components/games/widget"
import { MusicWidget } from "../components/music/widget"
import { ProjectsWidget } from "../components/projects/widget"

export const Today = () => {
  return (
    <article>
      <header className="grid 3xl:grid-cols-3 gap-2">
        <ProjectsWidget />
        <GameWidget />
        <MusicWidget />
      </header>
    </article>
  )
}