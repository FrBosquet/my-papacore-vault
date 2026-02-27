import type { MarkdownPage } from '@blacksmithgu/datacore'
import { TaskRow } from '../components/tasks/task-row'
import { getFrontmatterValue } from '../utils/markdown'
import {
  getTaskWeekTagFromDate,
  getWeekFromTags,
  STATUSES,
} from '../utils/tasks'
import { getTodayDatetime } from '../utils/time'

const sortTasks = (a: MarkdownPage, b: MarkdownPage) => {
  const aStatus = getFrontmatterValue<string>(a, 'status')
  const bStatus = getFrontmatterValue<string>(b, 'status')

  const aIndex = aStatus ? STATUSES.indexOf(aStatus) : -1
  const bIndex = bStatus ? STATUSES.indexOf(bStatus) : -1

  if (aIndex !== bIndex) {
    return bIndex - aIndex
  }

  return b.$mtime.toMillis() - a.$mtime.toMillis()
}

const getTasksByMoment = (
  tasks: MarkdownPage[],
  reference: `${number}-W${string}`
) => {
  return tasks.reduce(
    (acc, task) => {
      const week = getWeekFromTags(task)
      const isDone = getFrontmatterValue(task, 'done')

      if (!week) {
        if (isDone) {
          acc.past.push(task)
        } else {
          acc.nonWeek.push(task)
        }

        return acc
      }

      if (week < reference) {
        if (isDone) {
          acc.past.push(task)
        } else {
          acc.carryOver.push(task)
        }
        return acc
      }

      if (week === reference) {
        acc.present.push(task)
        return acc
      }

      acc.future.push(task)
      return acc
    },
    {
      nonWeek: [] as MarkdownPage[],
      past: [] as MarkdownPage[],
      carryOver: [] as MarkdownPage[],
      present: [] as MarkdownPage[],
      future: [] as MarkdownPage[],
    }
  )
}

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
          {present.sort(sortTasks).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {carryOver.length > 0 && (
        <>
          <h3>Carry over tasks: ({carryOver.length})</h3>
          {carryOver.sort(sortTasks).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {nonWeek.length > 0 && (
        <>
          <h3>Pending tasks: ({nonWeek.length})</h3>
          {nonWeek.sort(sortTasks).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {future.length > 0 && (
        <>
          <h3>Future tasks: ({future.length})</h3>
          {future.sort(sortTasks).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {past.length > 0 && (
        <>
          <h3>Past tasks: ({past.length})</h3>
          {past.sort(sortTasks).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}
    </div>
  )
}
