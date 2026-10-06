import type { MarkdownPage } from '@blacksmithgu/datacore'
import { useLocalState } from '../../utils/local-storage'
import {
  getPathFromTag,
  getTasksByMoment,
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

  const tasksNotInThisWeek = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND !["backlog", "in-review", "done"].contains(status)
    AND !#${weekTag}
  `)

  const carryOver = getTasksByMoment(tasksNotInThisWeek, weekTag).carryOver
  const carryOverCount = carryOver.length

  const currentWeekPath = getPathFromTag(weekTag)

  return (
    <Card>
      <header className="flex justify-between items-center gap-2">
        <Link
          path={currentWeekPath}
          icon="kanban"
          createIfNotExists
          template="week"
        >
          Tasks (#{weekTag} | {tasks.length})
        </Link>
        <div className="flex items-center gap-2">
          {carryOverCount > 0 && (
            <Link
              path={currentWeekPath}
              createIfNotExists
              template="week"
              variant="button"
              size="sm"
              className="bg-transparent text-red-400 hover:bg-transparent hover:text-red-300 active:bg-transparent active:text-red-200 shadow-none whitespace-nowrap shrink-0"
            >
              {carryOverCount} carryover{carryOverCount === 1 ? '' : 's'}
            </Link>
          )}
          <Button onClick={() => setIsKanban((current) => !current)} size="sm">
            {isKanban ? 'List' : 'Kanban'}
          </Button>
        </div>
        <AddTaskModal />
      </header>
      {isKanban ? (
        <KanbanBoard tasks={tasks} carryOvers={carryOver} />
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
