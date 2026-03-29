import type { Link as LinkType, MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import type { ComponentChildren } from 'preact'
import { classMerge } from '../../utils/classMerge'
import {
  createFromTemplate,
  fileExists,
  getFile,
  getLeaf,
} from '../../utils/files'
import {
  getFrontmatterValue,
  setPageFrontmatterValue,
} from '../../utils/markdown'
import {
  addToWeek,
  getPathFromTag,
  getTaskWeekTagFromDate,
  getWeekFromTag,
  getWeekFromTags,
  moveToArchive,
  moveToDone,
  moveToOngoing,
  removeFromWeek,
  STATUSES,
  type WeekTag,
} from '../../utils/tasks'
import { getTodayDatetime } from '../../utils/time'
import { Button } from '../shared/button'
import { ContextMenu, type ContextOption } from '../shared/context'
import { Link } from '../shared/link'

type Updater = (
  action:
    | 'backlog'
    | 'this-week'
    | 'ongoing'
    | 'done'
    | 'archive'
    | 'push-forward'
) => void

const WeekBadge = ({
  task,
  weekTag,
  updater,
}: {
  task: MarkdownPage
  weekTag?: WeekTag
  updater: Updater
}) => {
  const currentWeekTag = getWeekFromTags(task)

  const hasWeek = !!currentWeekTag

  if (hasWeek) {
    const nextWeekTag = getTaskWeekTagFromDate(
      getTodayDatetime().plus({ weeks: 1 })
    )
    const weekPath = getPathFromTag(currentWeekTag)
    const week = getWeekFromTag(currentWeekTag)

    const options: ContextOption[] = [
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
        type: 'divider',
      },
      {
        icon: 'calendar',
        label: `Ver semana (${currentWeekTag})`,
        action: async () => {
          if (!fileExists(weekPath)) {
            await createFromTemplate(weekPath, 'week')
          }
          const file = getFile(weekPath)
          if (file) getLeaf(false).openFile(file)
        },
      },
    ]

    if (currentWeekTag !== weekTag) {
      options.push({
        icon: 'calendar-plus',
        label: `Añadir a esta semana (${weekTag})`,
        action: () => updater('this-week'),
      })
    }

    if (currentWeekTag !== nextWeekTag) {
      options.push({
        icon: 'calendar-plus',
        label: `Añadir a la siguiente semana (${nextWeekTag})`,
        action: () => updater('push-forward'),
      })
    }

    options.push({
      type: 'divider',
    })

    options.push({
      icon: 'calendar-x',
      label: 'Desasignar',
      action: () => updater('backlog'),
    })

    return (
      <ContextMenu
        className="font-bold text-xs flex size-8 items-center justify-center p-1 bg-green-900 text-green-300"
        options={options}
      >
        W{week.toString().padStart(2, '0')}
      </ContextMenu>
    )
  }

  return (
    <Link
      onClick={() => updater('this-week')}
      className={classMerge(
        'font-bold text-xs flex size-8 items-center justify-center p-1 bg-primary-900 text-primary-300'
      )}
      tooltip="Agregar a la semana"
    >
      <dc.Icon icon="plus" />
    </Link>
  )
}

const Badge = ({
  children,
  className,
}: {
  children: ComponentChildren
  className?: string
}) => {
  return (
    <span
      className={classMerge(
        'flex items-center gap-1 text-[0.45rem] leading-none px-1 py-0.5 rounded-full font-semibold uppercase whitespace-nowrap bg-theme-contrast',
        className
      )}
    >
      {children}
    </span>
  )
}

const ProjectBadge = ({ project }: { project: MarkdownPage }) => {
  return (
    <Link
      path={project.$path}
      className="bg-contrast-400 text-contrast-950 hover:bg-contrast-500 flex items-center gap-1 text-[0.45rem] leading-none px-1 py-0.5 rounded-full font-semibold uppercase whitespace-nowrap w-auto grow-0"
    >
      {project.$name}
    </Link>
  )
}

const DueBadge = ({ due }: { due?: DateTime }) => {
  if (!due) return null

  const daysLeft = Math.ceil(due.diffNow('days').days)

  if (daysLeft < 0) return null

  const colorClass =
    daysLeft <= 2
      ? 'bg-red-900 text-red-300'
      : daysLeft <= 3
        ? 'bg-yellow-900 text-yellow-300'
        : 'bg-blue-900 text-blue-300'

  const label =
    daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `En ${daysLeft} dias`

  return (
    <Badge className={colorClass}>
      <dc.Icon icon="clock" className="size-2" />
      {label}
    </Badge>
  )
}

const TaskTimeline = ({ task }: { task: MarkdownPage }) => {
  const status = getFrontmatterValue<string>(task, 'status')

  const handleAction = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const action = (e.currentTarget as HTMLButtonElement)?.getAttribute(
      'data-action'
    )

    if (!action) return
    if (action === 'backlog') {
      removeFromWeek(task)
    }

    if (action === 'this-week' && status !== 'this-week') {
      setPageFrontmatterValue(task, 'done', undefined)
      setPageFrontmatterValue(task, 'status', 'this-week')
    }

    if (action === 'ongoing' && status !== 'ongoing') {
      setPageFrontmatterValue(task, 'done', undefined)
      setPageFrontmatterValue(task, 'status', 'ongoing')
    }

    if (action === 'done') {
      if (status === 'done') {
        setPageFrontmatterValue(task, 'status', 'archive')
      } else {
        setPageFrontmatterValue(task, 'status', 'done')
        setPageFrontmatterValue(task, 'done', getTodayDatetime())
      }
    }
  }

  const progress = status ? STATUSES.indexOf(status) : -1
  const bgColor = [
    'var(--color-red-300)',
    'var(--color-purple-300)',
    'var(--color-blue-300)',
    'var(--color-green-300)',
    'var(--color-green-500)',
  ][progress]

  const progressWidth = Math.min(3, progress) / 3

  if (status === 'archive') return null
  if (status === 'backlog') return null

  return (
    <section
      className="flex gap-2 items-center relative pr-2"
      style={{ '--bg-color': bgColor }}
    >
      <Button
        onClick={handleAction}
        dataAttributes={{ 'data-action': 'backlog' }}
        className="bg-(--bg-color) hover:bg-red-500 size-4 rounded-full z-10"
        tooltip="Remove from week"
      />
      <Button
        onClick={handleAction}
        dataAttributes={{ 'data-action': 'this-week' }}
        className={classMerge(
          'bg-(--bg-color) hover:bg-purple-500 size-4 rounded-full z-10',
          progress < 1 && 'bg-primary-600'
        )}
        tooltip="Move to backlog"
      />
      <Button
        onClick={handleAction}
        dataAttributes={{ 'data-action': 'ongoing' }}
        className={classMerge(
          'bg-(--bg-color) hover:bg-blue-500 size-4 rounded-full z-10',
          progress < 2 && 'bg-primary-600'
        )}
        tooltip="Move to in progress"
      />
      <Button
        onClick={handleAction}
        dataAttributes={{ 'data-action': 'done' }}
        className={classMerge(
          'bg-(--bg-color) hover:bg-green-500 size-4 rounded-full z-10',
          progress < 3 && 'bg-primary-600'
        )}
        tooltip={status === 'done' ? 'Archive' : 'Complete'}
      />
      <div
        className="absolute inset-0 bg-(--bg-color) mx-2 h-1 top-1/2 -translate-y-1/2 scale-x-(--progress-width) origin-left transition-transform duration-300"
        style={{ '--progress-width': progressWidth }}
      />
    </section>
  )
}

export const TaskRow = ({
  task,
  targetWeek,
}: {
  task: MarkdownPage
  targetWeek?: DateTime
}) => {
  const due = getFrontmatterValue<DateTime>(task, 'due')
  const done = getFrontmatterValue<DateTime>(task, 'done')
  const status = getFrontmatterValue<string>(task, 'status')
  const parent = task.value('parent')

  const project = dc.useMemo(() => {
    if (!parent || typeof parent !== 'object' || !('path' in parent))
      return undefined

    return dc.query<MarkdownPage>(`
      @page AND $path = "${parent.path}"
    `)?.[0]
  }, [parent])

  const archived = status === 'archive'
  const target = dc.useMemo(() => {
    const candidate = targetWeek ?? getTodayDatetime()

    if (candidate.weekday > 6) {
      return candidate.plus({ weeks: 1 })
    }

    return candidate
  }, [targetWeek])

  const targetWeekTag = getTaskWeekTagFromDate(target)

  const handleUpdateTask = (action: string) => {
    switch (action) {
      case 'backlog':
        removeFromWeek(task)
        break
      case 'this-week':
        addToWeek(task, targetWeekTag)
        break
      case 'ongoing':
        moveToOngoing(task)
        break
      case 'done':
        moveToDone(task)
        break
      case 'archive':
        moveToArchive(task)
        break
      case 'push-forward': {
        const nextWeek = target.plus({ weeks: 1 })
        const nextWeekTag = getTaskWeekTagFromDate(nextWeek)
        addToWeek(task, nextWeekTag)
        break
      }
    }
  }

  const isOngoing = status === 'ongoing'

  return (
    <Link
      variant="plain"
      path={task.$path}
      className={classMerge(
        'bg-primary-950 flex gap-2',
        isOngoing && 'ongoing-task'
      )}
    >
      <WeekBadge
        task={task}
        weekTag={targetWeekTag}
        updater={handleUpdateTask}
      />
      <section className="flex-1">
        <div className="flex items-center gap-2">
          <p
            className={classMerge(
              'text-primary-300 text-xs',
              done && 'text-green-300'
            )}
          >
            {done
              ? `Completado ${done.toLocaleString()}`
              : `Actualizado ${task.$mtime.toLocaleString()}`}
          </p>
          {project && <ProjectBadge project={project} />}
          {!done && <DueBadge due={due} />}
        </div>
        <p
          className={classMerge(
            isOngoing ? 'text-primary-100' : 'text-primary-300',
            done && 'text-green-600',
            archived && 'line-through text-primary-600'
          )}
        >
          {task.$name}
        </p>
      </section>
      <TaskTimeline task={task} />
    </Link>
  )
}
