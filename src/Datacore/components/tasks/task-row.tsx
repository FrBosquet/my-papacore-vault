import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import type { ComponentChildren } from 'preact'
import { classMerge } from '../../utils/classMerge'
import { trashPage } from '../../utils/files'
import {
  getFrontmatterValue,
  setPageFrontmatterValue,
} from '../../utils/markdown'
import {
  addToWeek,
  getDateFromWeekTag,
  getTaskWeekTagFromDate,
  getWeekFromTag,
  getWeekFromTags,
  isCarryoverTag,
  moveToDone,
  moveToInReview,
  moveToOngoing,
  removeFromWeek,
  STATUSES,
  type WeekTag,
} from '../../utils/tasks'
import { getContextualUpdateLabel, getTodayDatetime } from '../../utils/time'
import { LogAnnotationForm } from '../logs/log-annotation-form'
import { Button } from '../shared/button'
import { ContextMenu, type ContextOption } from '../shared/context'
import { Dialog, useDialog } from '../shared/dialog'
import { Link } from '../shared/link'
import { ongoingTaskClassName } from './ongoing-task'
import {
  getTaskContextOptions,
  type TaskMenuAction,
} from './task-context-options'

type Updater = (action: TaskMenuAction) => void

const WeekBadge = ({
  task,
  weekTag,
  updater,
  openAnnotateDialog,
}: {
  task: MarkdownPage
  weekTag?: WeekTag
  updater: Updater
  openAnnotateDialog: () => void
}) => {
  const currentWeekTag = getWeekFromTags(task)

  const hasWeek = !!currentWeekTag

  if (hasWeek) {
    const week = getWeekFromTag(currentWeekTag)
    const options = getTaskContextOptions({
      task,
      weekTag,
      updater,
      openAnnotateDialog,
    })

    return (
      <ContextMenu
        className="font-bold text-xs flex size-8 shrink-0 items-center justify-center p-1 bg-green-900 text-green-300"
        options={options}
      >
        W{week.toString().padStart(2, '0')}
      </ContextMenu>
    )
  }

  const nextWeekTag = weekTag
    ? getTaskWeekTagFromDate(getDateFromWeekTag(weekTag).plus({ weeks: 1 }))
    : undefined

  const options: [ContextOption, ...ContextOption[]] = [
    {
      icon: 'calendar-plus',
      label: weekTag ? `Esta semana (${weekTag})` : 'Esta semana',
      action: () => updater('this-week'),
    },
    {
      icon: 'calendar-arrow-up',
      label: nextWeekTag ? `La que viene (${nextWeekTag})` : 'La que viene',
      action: () => updater('push-forward'),
    },
    { type: 'divider' },
    {
      icon: 'trash',
      label: 'Descartar',
      action: () => updater('discard'),
    },
  ]

  return (
    <ContextMenu
      className="font-bold text-xs flex size-8 shrink-0 items-center justify-center p-1 bg-primary-900 text-primary-300"
      options={options}
    >
      <dc.Icon icon="plus" />
    </ContextMenu>
  )
}

const Badge = ({
  children,
  className,
  tooltip,
}: {
  children: ComponentChildren
  className?: string
  tooltip?: string
}) => {
  return (
    <span
      data-label={tooltip}
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
  const status = getFrontmatterValue<(typeof STATUSES)[number]>(task, 'status')

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

    if (action === 'in-review') {
      if (status === 'in-review') {
        setPageFrontmatterValue(task, 'status', 'done')
      } else {
        setPageFrontmatterValue(task, 'status', 'in-review')
        setPageFrontmatterValue(task, 'done', getTodayDatetime())
      }
    }
  }

  const progress = (status ? STATUSES.indexOf(status) : 0) - 1
  const bgColor = [
    'var(--color-purple-300)',
    'var(--color-blue-300)',
    'var(--color-green-300)',
    'var(--color-green-500)',
  ][progress]

  const progressWidth = Math.min(2, progress) / 2

  if (status === 'done') return null
  if (status === 'backlog') return null

  return (
    <section
      className="flex gap-2 items-center relative pr-2 shrink-0"
      style={{ '--bg-color': bgColor }}
    >
      <Button
        onClick={handleAction}
        dataAttributes={{ 'data-action': 'this-week' }}
        className={classMerge(
          'bg-(--bg-color) hover:bg-purple-500 size-4 rounded-full z-10'
        )}
        tooltip="Move to backlog"
      />
      <Button
        onClick={handleAction}
        dataAttributes={{ 'data-action': 'ongoing' }}
        className={classMerge(
          'bg-(--bg-color) hover:bg-blue-500 size-4 rounded-full z-10',
          progress < 1 && 'bg-primary-600'
        )}
        tooltip="Move to in progress"
      />
      <Button
        onClick={handleAction}
        dataAttributes={{ 'data-action': 'in-review' }}
        className={classMerge(
          'bg-(--bg-color) hover:bg-green-500 size-4 rounded-full z-10',
          progress < 2 && 'bg-primary-600'
        )}
        tooltip={status === 'in-review' ? 'Mark done' : 'In review'}
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
  showCarryButton,
}: {
  task: MarkdownPage
  targetWeek?: DateTime
  showCarryButton?: boolean
}) => {
  const { ref: dialogRef, open: openAnnotateDialog, close } = useDialog()

  const due = getFrontmatterValue<DateTime>(task, 'due')
  const done = getFrontmatterValue<DateTime>(task, 'done')
  const status = getFrontmatterValue<string>(task, 'status')
  const tags = getFrontmatterValue<string[]>(task, 'tags')
  const parent = task.value('parent')

  const project = dc.useMemo(() => {
    if (!parent || typeof parent !== 'object' || !('path' in parent))
      return undefined

    return dc.query<MarkdownPage>(`
      @page AND $path = "${parent.path}"
    `)?.[0]
  }, [parent])

  const isDone = status === 'done'
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
      case 'in-review':
        moveToInReview(task)
        break
      case 'done':
        moveToDone(task)
        break
      case 'push-forward': {
        const nextWeek = target.plus({ weeks: 1 })
        const nextWeekTag = getTaskWeekTagFromDate(nextWeek)
        addToWeek(task, nextWeekTag)
        break
      }
      case 'discard': {
        const confirmed = confirm(
          `¿Descartar "${task.$name}"? Se borrará la nota.`
        )
        if (!confirmed) return
        void trashPage(task.$file)
        break
      }
    }
  }

  const isOngoing = status === 'ongoing'
  const carryoverTags = tags?.filter((tag) => isCarryoverTag(tag))
  const carryoverCount = carryoverTags?.length ?? 0

  return (
    <Link
      variant="plain"
      path={task.$path}
      className={classMerge(
        'flex-col items-stretch gap-1',
        isOngoing ? ongoingTaskClassName : 'bg-primary-950'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
        <p
          className={classMerge(
            'text-primary-300 text-xs whitespace-nowrap',
            done && 'text-green-300'
          )}
        >
          {done
            ? `Completado ${done.toLocaleString()}`
            : getContextualUpdateLabel(task.$mtime)}
        </p>
        {(project || (!done && due)) && (
          <div className="flex items-center gap-2 ml-auto">
            {project && <ProjectBadge project={project} />}
            {!done && <DueBadge due={due} />}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <WeekBadge
          task={task}
          weekTag={targetWeekTag}
          updater={handleUpdateTask}
          openAnnotateDialog={openAnnotateDialog}
        />
        <p
          className={classMerge(
            'flex-1 min-w-0 break-words',
            isOngoing ? 'text-contrast-200 font-bold' : 'text-primary-300',
            done && 'text-green-600',
            isDone && 'line-through text-primary-600'
          )}
        >
          {task.$name}
          {carryoverCount > 0 && (
            <Badge
              className="bg-red-600 text-red-100 inline ml-2 align-middle"
              tooltip={`${carryoverCount} carryover${carryoverCount > 1 ? 's' : ''}`}
            >
              +{carryoverCount} semanas
            </Badge>
          )}
        </p>
        <TaskTimeline task={task} />
        {showCarryButton && (
          <Button
            icon="calendar-arrow-up"
            size="icon-xs"
            className="shrink-0"
            tooltip="Añadir a esta semana"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleUpdateTask('this-week')
            }}
          />
        )}
      </div>
      <Dialog dialogRef={dialogRef} hideTrigger>
        <LogAnnotationForm targetPage={task} onSubmit={() => close()} />
      </Dialog>
    </Link>
  )
}
