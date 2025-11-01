import { GameWidget } from "../components/games/widget"
import { MusicWidget } from "../components/music/widget"
import { ProjectsWidget } from "../components/projects/widget"

export const Today = () => {
  return (
    <article>
      <header className="grid grid-cols-3 gap-2">
        <GameWidget />
        <MusicWidget />
        <ProjectsWidget />
      </header>
    </article>
  )
}