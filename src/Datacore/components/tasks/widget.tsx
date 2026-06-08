import type { MarkdownPage } from '@blacksmithgu/datacore'
import { useLocalState } from '../../utils/local-storage'
import {
  getPathFromTag,
  getTaskWeekTagFromDate,
  taskSorter,
} from '../../utils/tasks'
import { getTodayDatetime } from '../../utils/time'
import { Button } from '../shared/button'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { Scroller } from '../shared/scroller'
import { AddTaskModal } from './add-modal'
import { KanbanBoard } from './kanban-board'
import { TaskRow } from './task-row'

export const TasksWidget = () => {
  const today = getTodayDatetime()
  const weekTag = getTaskWeekTagFromDate(today)
  const [isKanban, setIsKanban] = useLocalState(
    'papacore:task:widget:is-kanban',
    false
  )

  const tasks = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND #${weekTag}
  `)

  const currentWeekPath = getPathFromTag(weekTag)

  return (
    <Card>
      <header className="flex justify-between items-center gap-2">
        <Link path={currentWeekPath} icon="kanban" createIfNotExists template="week">
          Tasks (#{weekTag} | {tasks.length})
        </Link>
        <Button onClick={() => setIsKanban(!isKanban)} size="sm">
          {isKanban ? 'List' : 'Kanban'}
        </Button>
        <AddTaskModal />
      </header>
      {isKanban ? (
        <KanbanBoard tasks={tasks} />
      ) : (
        <Scroller className="max-h-100" wrapperClassName="gap-2">
          {tasks.sort(taskSorter).map((task) => (
            <TaskRow key={task.$id} task={task} />
          ))}
        </Scroller>
      )}
    </Card>
  )
}
