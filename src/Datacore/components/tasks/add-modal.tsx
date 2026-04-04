import type { MarkdownPage } from '@blacksmithgu/datacore'
import { getLeaf } from '../../utils/files'
import { getLS, setLS } from '../../utils/local-storage'
import {
  getLastDayOfWeektag,
  getTaskWeekTagFromDate,
  type WeekTag,
} from '../../utils/tasks'
import { createNewTask } from '../../utils/templater'
import { getTodayDatetime } from '../../utils/time'
import { Button } from '../shared/button'
import { Dialog, useDialog } from '../shared/dialog'

export const AddTaskModal = () => {
  const { ref: dialogRef, close } = useDialog()

  const projects = dc
    .useQuery<MarkdownPage>(`
    @page
    AND path("Projects")
    AND status != "archive"
  `)
    .map((p) => {
      const status = p.value('status')

      const label = status === 'ongoing' ? p.$name : `(${status}) ${p.$name}`
      return {
        label,
        value: p.$path,
        isOngoing: status === 'ongoing',
      }
    })
    .sort((a, b) => {
      if (a.isOngoing && !b.isOngoing) return -1
      if (!a.isOngoing && b.isOngoing) return 1
      return a.label.localeCompare(b.label)
    })

  const weekOptions = dc.useMemo(() => {
    const today = getTodayDatetime()
    const nextWeek = today.plus({ weeks: 1 })
    const prevWeek = today.minus({ weeks: 1 })
    const thisWeekTag = getTaskWeekTagFromDate(today)
    const nextWeekTag = getTaskWeekTagFromDate(nextWeek)
    const prevWeekTag = getTaskWeekTagFromDate(prevWeek)

    const options = []

    options.push({
      label: `This week (${thisWeekTag})`,
      value: thisWeekTag,
    })
    options.push({
      label: `Next week (${nextWeekTag})`,
      value: nextWeekTag,
    })
    options.push({
      label: `Previous week (${prevWeekTag})`,
      value: prevWeekTag,
    })
    options.push({
      label: `Not assigned`,
      value: undefined,
    })

    return options
  }, [])

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const title = formData.get('title') as string
    const projectPath = formData.get('project') as string

    setLS('papacore:task:last-project-path', projectPath as string)

    const weekTag = formData.get('week') as string
    const pathForQuery = projectPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const projectPage = dc.query<MarkdownPage>(
      `@page AND $path = "${pathForQuery}"`
    )?.[0]

    const file = await createNewTask(title)

    if (file) {
      if (projectPage) {
        await dc.app.fileManager.processFrontMatter(file, (frontmatter) => {
          frontmatter.parent = projectPage.$link.markdown()
          frontmatter.tags = projectPage.value('tags') as string[]

          if (weekTag) {
            setLS('papacore:task:last-week-tag', weekTag as string)

            if (frontmatter.tags) {
              frontmatter.tags = [...(frontmatter.tags as string[]), weekTag]
            } else {
              frontmatter.tags = [weekTag]
            }

            frontmatter.status = 'this-week'
            frontmatter.due = getLastDayOfWeektag(weekTag as WeekTag)
          }
        })
      }

      getLeaf('split').openFile(file)
    }

    close()
  }

  return (
    <Dialog
      dialogRef={dialogRef}
      title="Add task"
      triggerProps={{
        icon: 'plus',
        size: 'icon-xs',
      }}
    >
      <form className="flex flex-col gap-2 items-end" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full"
        />
        <label htmlFor="status" className="flex gap-2 flex-col w-full">
          <p className="uppercase font-semibold text-xs text-primary-400">
            Project
          </p>
          <select
            name="project"
            id="project"
            defaultValue={getLS('papacore:task:last-project-path')}
          >
            {projects.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="week" className="flex gap-2 flex-col w-full">
          <p className="uppercase font-semibold text-xs text-primary-400">
            Week
          </p>
          <select
            name="week"
            id="week"
            defaultValue={getLS('papacore:task:last-week-tag')}
          >
            {weekOptions.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" icon="plus" className="w-auto">
          Create
        </Button>
      </form>
    </Dialog>
  )
}
