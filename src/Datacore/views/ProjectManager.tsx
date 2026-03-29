import type { MarkdownPage } from '@blacksmithgu/datacore'
import { Button } from '../components/shared/button'
import { Card } from '../components/shared/card'
import { Scroller } from '../components/shared/scroller'
import { TaskRow } from '../components/tasks/task-row'
import { createFromTemplate } from '../utils/files'
import {
  getTasksByMoment,
  getTaskWeekTagFromDate,
  moveToArchive,
  taskSorter,
} from '../utils/tasks'
import { getTodayDatetime } from '../utils/time'

export const ProjectManager = () => {
  const thisProject = dc.useCurrentFile()
  const handleAddTask = async (e: Event) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLFormElement
    const formData = new FormData(target)
    const task = formData.get('task') as string

    await createFromTemplate(`Kanban/Tasks/${task}.md`, 'task', (content) => {
      content.setFrontmatter('parent', `"${thisProject.$link.toString()}"`)
      content.setFrontmatter('status', 'backlog')
      return content
    })

    target.reset()
  }

  const subtasks = dc.useQuery<MarkdownPage>(`
    @file AND path("Kanban/Tasks") AND parent = [[${thisProject.$name}]]
  `)

  const { past, present, future, nonWeek, carryOver } = getTasksByMoment(
    subtasks,
    getTaskWeekTagFromDate(getTodayDatetime())
  )

  const handleArchiveAll = () => {
    past.forEach((task) => {
      if (task.value('status') === 'done') moveToArchive(task)
    })
  }

  return (
    <Card>
      {present.length > 0 && (
        <>
          <h3 className="uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent">
            This week tasks: ({present.length})
          </h3>
          {present.sort(taskSorter).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      <form className="flex gap-2 w-full" onSubmit={handleAddTask}>
        <input
          type="text"
          name="task"
          placeholder="Add a task"
          className="flex-1 rounded-none"
        />
        <Button type="submit" iconRight="plus">
          Add
        </Button>
      </form>
      {carryOver.length > 0 && (
        <>
          <h3 className="uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent">
            Carry over tasks: ({carryOver.length})
          </h3>
          {carryOver.sort(taskSorter).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {nonWeek.length > 0 && (
        <>
          <h3 className="uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent">
            Pending tasks: ({nonWeek.length})
          </h3>
          {nonWeek.sort(taskSorter).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {future.length > 0 && (
        <>
          <h3 className="uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent">
            Future tasks: ({future.length})
          </h3>
          {future.sort(taskSorter).map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} />
          ))}
        </>
      )}

      {past.length > 0 && (
        <>
          <header className="flex items-center justify-between">
            <h3 className="uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent">
              Past tasks: ({past.length})
            </h3>
            <Button
              iconRight="chevron-down"
              size="sm"
              onClick={handleArchiveAll}
            >
              Archive all
            </Button>
          </header>
          <Scroller className="max-h-56">
            {past.sort(taskSorter).map((subtask) => (
              <TaskRow key={subtask.$id} task={subtask} />
            ))}
          </Scroller>
        </>
      )}
    </Card>
  )
}
