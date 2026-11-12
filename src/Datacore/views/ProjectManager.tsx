import type { MarkdownPage } from '@blacksmithgu/datacore'
import { Button } from '../components/shared/button'
import { Card } from '../components/shared/card'
import { Dialog, useDialog } from '../components/shared/dialog'
import { Scroller } from '../components/shared/scroller'
import { TaskRow } from '../components/tasks/task-row'
import { createFromTemplate } from '../utils/files'
import {
  type DoneTaskGroup,
  getTasksByMoment,
  getTaskWeekTagFromDate,
  groupTasksByDoneRecency,
  moveToDone,
  taskSorter,
} from '../utils/tasks'
import { getTodayDatetime } from '../utils/time'

const PastTaskGroups = ({ groups }: { groups: DoneTaskGroup[] }) => (
  <>
    {groups.map((group, index) => (
      <div key={group.key} className={index === 0 ? undefined : 'mt-3'}>
        <h4 className="uppercase p-1 m-0 mb-1 text-xs tracking-wide font-semibold text-theme-accent">
          {group.label}
        </h4>
        {group.tasks.map((subtask) => (
          <TaskRow key={subtask.$id} task={subtask} />
        ))}
      </div>
    ))}
  </>
)

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
  const pastGroups = groupTasksByDoneRecency(past)
  const { ref: pastDialogRef } = useDialog()

  const handleMarkAllDone = () => {
    past.forEach((task) => {
      if (task.value('status') === 'in-review') moveToDone(task)
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
            <div className="flex items-center gap-1">
              <Dialog
                title={`Past tasks (${past.length})`}
                icon="history"
                dialogRef={pastDialogRef}
                className="h-[calc(100vh-2rem)]"
                triggerProps={{
                  icon: 'expand',
                  size: 'icon',
                  variant: 'ghost',
                  label: null,
                  tooltip: 'Ver todas',
                }}
              >
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <PastTaskGroups groups={pastGroups} />
                </div>
              </Dialog>
              <Button
                iconRight="chevron-down"
                size="sm"
                onClick={handleMarkAllDone}
              >
                Mark all done
              </Button>
            </div>
          </header>
          <Scroller className="max-h-56">
            <PastTaskGroups groups={pastGroups} />
          </Scroller>
        </>
      )}
    </Card>
  )
}
