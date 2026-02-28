import type { MarkdownPage } from '@blacksmithgu/datacore'
import { TaskRow } from '../components/tasks/task-row'
import {
  getTasksByMoment,
  getTaskWeekTagFromDate,
  taskSorter,
} from '../utils/tasks'
import { getTodayDatetime } from '../utils/time'

export const ProjectManager = () => {
  const thisProject = dc.useCurrentFile()

  const subtasks = dc.useQuery<MarkdownPage>(`
    @file AND path("Kanban/Tasks") AND parent = [[${thisProject.$name}]]
  `)

  const { past, present, future, nonWeek, carryOver } = getTasksByMoment(
    subtasks,
    getTaskWeekTagFromDate(getTodayDatetime())
  )

  return (
    <div className="flex flex-col gap-2">
      <h2>Project Manager</h2>

      {present.length > 0 && (
        <>
          <h3>This week tasks: ({present.length})</h3>
          {present.sort(taskSorter).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {carryOver.length > 0 && (
        <>
          <h3>Carry over tasks: ({carryOver.length})</h3>
          {carryOver.sort(taskSorter).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {nonWeek.length > 0 && (
        <>
          <h3>Pending tasks: ({nonWeek.length})</h3>
          {nonWeek.sort(taskSorter).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {future.length > 0 && (
        <>
          <h3>Future tasks: ({future.length})</h3>
          {future.sort(taskSorter).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {past.length > 0 && (
        <>
          <h3>Past tasks: ({past.length})</h3>
          {past.sort(taskSorter).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}
    </div>
  )
}
