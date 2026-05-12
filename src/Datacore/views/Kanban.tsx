import type { MarkdownPage } from '@blacksmithgu/datacore'
import { KanbanBoard } from '../components/tasks/kanban-board'

export const Kanban = () => {
  const tasks = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
  `)

  return <KanbanBoard tasks={tasks} />
}
