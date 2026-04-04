import type { MarkdownPage } from '@blacksmithgu/datacore'
import { getTaskWeekTagFromDate, taskSorter } from '../../utils/tasks'
import { getTodayDatetime } from '../../utils/time'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { Scroller } from '../shared/scroller'
import { AddTaskModal } from './add-modal'
import { TaskRow } from './task-row'

export const TasksWidget = () => {
  const today = getTodayDatetime()
  const weekTag = getTaskWeekTagFromDate(today)

  const tasks = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND #${weekTag}
  `)

  return (
    <Card>
      <header className="flex justify-between items-center">
        <Link path="Kanban/Board.md" icon="kanban">
          Tasks (#{weekTag} | {tasks.length})
        </Link>
        <AddTaskModal />
      </header>
      <Scroller className="max-h-100" wrapperClassName="gap-2">
        {tasks.sort(taskSorter).map((task) => (
          <TaskRow key={task.$id} task={task} />
        ))}
      </Scroller>
    </Card>
  )
}
