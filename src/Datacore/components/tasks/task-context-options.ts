import type { Link as LinkType, MarkdownPage } from '@blacksmithgu/datacore'
import {
  createFromTemplate,
  fileExists,
  getFile,
  getLeaf,
} from '../../utils/files'
import { getFrontmatterValue } from '../../utils/markdown'
import {
  getPathFromTag,
  getTaskWeekTagFromDate,
  getWeekFromTags,
  type WeekTag,
} from '../../utils/tasks'
import { getTodayDatetime } from '../../utils/time'
import type { ContextOption } from '../shared/context'

export type TaskMenuAction =
  | 'backlog'
  | 'this-week'
  | 'ongoing'
  | 'in-review'
  | 'done'
  | 'push-forward'
  | 'discard'

export const getTaskContextOptions = ({
  task,
  weekTag,
  updater,
  openAnnotateDialog,
}: {
  task: MarkdownPage
  weekTag?: WeekTag
  updater: (action: TaskMenuAction) => void
  openAnnotateDialog: () => void
}): [ContextOption, ...ContextOption[]] => {
  const currentWeekTag = getWeekFromTags(task)
  const nextWeekTag = getTaskWeekTagFromDate(
    getTodayDatetime().plus({ weeks: 1 })
  )

  const options: [ContextOption, ...ContextOption[]] = [
    {
      icon: 'kanban',
      label: 'Panel Kanban',
      action: () => {
        const file = getFile('Kanban/Board.md')
        if (file) getLeaf(false).openFile(file)
      },
    },
    {
      icon: 'folder-kanban',
      label: 'Ver proyecto',
      action: () => {
        const project = getFrontmatterValue<LinkType>(task, 'parent')

        if (!project) return alert('No project found')
        const file = getFile(project.path)

        if (file) getLeaf('split').openFile(file)
      },
    },
    {
      icon: 'notebook-pen',
      label: 'Anotar',
      action: () => openAnnotateDialog(),
    },
  ]

  const weekOptions: ContextOption[] = []

  if (currentWeekTag) {
    const weekPath = getPathFromTag(currentWeekTag)
    weekOptions.push({
      icon: 'calendar',
      label: `Ver semana (${currentWeekTag})`,
      action: async () => {
        if (!fileExists(weekPath)) {
          await createFromTemplate(weekPath, 'week')
        }
        const file = getFile(weekPath)
        if (file) getLeaf(false).openFile(file)
      },
    })
  }

  if (weekTag && currentWeekTag !== weekTag) {
    weekOptions.push({
      icon: 'calendar-plus',
      label: `Añadir a esta semana (${weekTag})`,
      action: () => updater('this-week'),
    })
  }

  if (currentWeekTag !== nextWeekTag) {
    weekOptions.push({
      icon: 'calendar-plus',
      label: `Añadir a la siguiente semana (${nextWeekTag})`,
      action: () => updater('push-forward'),
    })
  }

  if (currentWeekTag) {
    weekOptions.push(
      { type: 'divider' },
      {
        icon: 'calendar-x',
        label: 'Desasignar',
        action: () => updater('backlog'),
      }
    )
  }

  if (weekOptions.length > 0) {
    options.push({ type: 'divider' }, ...weekOptions)
  }

  return options
}
