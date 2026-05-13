import type { MarkdownPage } from '@blacksmithgu/datacore'
import { Button } from '../components/shared/button'
import { TaskRow } from '../components/tasks/task-row'
import {
  addToWeek,
  getDateFromWeekTag,
  getTagFromFileName,
  getTasksByMoment,
  taskSorter,
} from '../utils/tasks'

export const WeekManager = () => {
  const thisWeek = dc.useCurrentFile()

  const fileName = thisWeek.$name
  const tag = getTagFromFileName(fileName)
  const targetWeek = getDateFromWeekTag(tag)

  // I need the tasks that are tagged with the week tag
  const assignedTasks = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND #${tag}
  `)

  const tasksNotInThisWeek = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND !["backlog", "done", "archived"].contains(status)
    AND !#${tag}
  `)

  const backlogTasks = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND status = "backlog"
  `)

  const { carryOver, future } = getTasksByMoment(tasksNotInThisWeek, tag)

  const handleCarryAll = () => {
    carryOver.forEach((task) => {
      addToWeek(task, tag)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <p>
        Tagged as <strong>{tag}</strong>
      </p>
      <h3>This week ({assignedTasks.length}):</h3>
      {assignedTasks.length > 0 &&
        assignedTasks
          .sort(taskSorter)
          .map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} targetWeek={targetWeek} />
          ))}

      {carryOver.length > 0 && (
        <>
          <header className="flex items-center justify-between">
            <h3 className="uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent">
              Carryover ({carryOver.length})
            </h3>
            <Button
              iconRight="calendar-arrow-up"
              size="sm"
              onClick={handleCarryAll}
            >
              Carry all
            </Button>
          </header>
          {carryOver.length > 0 &&
            carryOver
              .sort(taskSorter)
              .map((subtask) => (
                <TaskRow
                  key={subtask.$id}
                  task={subtask}
                  targetWeek={targetWeek}
                />
              ))}
        </>
      )}

      {future.length > 0 && (
        <>
          <h3>Future ({future.length}):</h3>
          {future.length > 0 &&
            future
              .sort(taskSorter)
              .map((subtask) => (
                <TaskRow
                  key={subtask.$id}
                  task={subtask}
                  targetWeek={targetWeek}
                />
              ))}
        </>
      )}

      {backlogTasks.length > 0 && (
        <>
          <h3>Backlog ({backlogTasks.length}):</h3>
          {backlogTasks.length > 0 &&
            backlogTasks
              .sort(taskSorter)
              .map((subtask) => (
                <TaskRow
                  key={subtask.$id}
                  task={subtask}
                  targetWeek={targetWeek}
                />
              ))}
        </>
      )}
    </div>
  )
}
