import { GameWidget } from '../components/games/widget'
import { HabitWidget } from '../components/habits/widget'
import { MusicWidget } from '../components/music/widget'
import { ProjectsWidget } from '../components/projects/widget'
import { TasksWidget } from '../components/tasks/widget'

export const Today = () => {
  return (
    <article className="flex flex-col gap-2 pb-2">
      <header className="grid xl:grid-cols-3 gap-2 w-full">
        <ProjectsWidget />
        <GameWidget />
        <MusicWidget />
      </header>
      <TasksWidget />
      <HabitWidget />
    </article>
  )
}
