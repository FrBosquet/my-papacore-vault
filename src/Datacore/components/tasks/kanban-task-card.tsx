import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { classMerge } from '../../utils/classMerge'
import { getFrontmatterValue } from '../../utils/markdown'
import {
  addToWeek,
  getTaskWeekTagFromDate,
  getWeekFromTag,
  getWeekFromTags,
  removeFromWeek,
  type STATUSES,
} from '../../utils/tasks'
import { getTodayDatetime } from '../../utils/time'
import { LogAnnotationForm } from '../logs/log-annotation-form'
import { ContextMenu } from '../shared/context'
import { Dialog, useDialog } from '../shared/dialog'
import { Link } from '../shared/link'
import { ModalHeader } from '../shared/typography'
import { KanbanDueBadge } from './kanban-due-badge'
import { KanbanMetaBadge } from './kanban-meta-badge'
import {
  ongoingTaskShimmerBandClassName,
  ongoingTaskShimmerClassName,
} from './ongoing-task'
import {
  getTaskContextOptions,
  type TaskMenuAction,
} from './task-context-options'

interface Props {
  task: MarkdownPage
  status: (typeof STATUSES)[number]
  onDragStart: (event: DragEvent, task: MarkdownPage) => void
  onDragEnd: () => void
  isDragging: boolean
}

export const KanbanTaskCard = ({
  task,
  status,
  onDragStart,
  onDragEnd,
  isDragging,
}: Props) => {
  const due = getFrontmatterValue<DateTime>(task, 'due')
  const done = getFrontmatterValue<DateTime>(task, 'done')
  const parent = task.value('parent')
  const weekTag = getWeekFromTags(task)

  const project = dc.useMemo(() => {
    if (!parent || typeof parent !== 'object' || !('path' in parent))
      return undefined

    return dc.query<MarkdownPage>(`
      @page AND $path = "${parent.path}"
    `)?.[0]
  }, [parent])

  const { ref: dialogRef, open, close } = useDialog()
  const isDone = status === 'done'
  const isInReview = status === 'in-review'
  const isCompleted = isInReview || isDone
  const isOngoing = status === 'ongoing'

  const target = dc.useMemo(() => {
    const candidate = getTodayDatetime()

    if (candidate.weekday > 6) {
      return candidate.plus({ weeks: 1 })
    }

    return candidate
  }, [])
  const targetWeekTag = getTaskWeekTagFromDate(target)

  const handleUpdateTask = (action: TaskMenuAction) => {
    switch (action) {
      case 'backlog':
        removeFromWeek(task)
        break
      case 'this-week':
        addToWeek(task, targetWeekTag)
        break
      case 'push-forward':
        addToWeek(task, getTaskWeekTagFromDate(target.plus({ weeks: 1 })))
        break
    }
  }

  const options = getTaskContextOptions({
    task,
    weekTag: targetWeekTag,
    updater: handleUpdateTask,
    openAnnotateDialog: open,
  })

  return (
    <>
      <Dialog dialogRef={dialogRef} hideTrigger>
        <ModalHeader>{task.$name}</ModalHeader>
        <LogAnnotationForm targetPage={task} onSubmit={close} />
      </Dialog>
      <div className="relative">
        <button
          data-dragging={isDragging}
          type="button"
          draggable
          onDragStart={(event: DragEvent) => onDragStart(event, task)}
          onDragEnd={onDragEnd}
          className={classMerge(
            'relative block rounded-md p-2 border border-transparent hover:border-primary-700 cursor-grab shadow-none w-full h-[unset] overflow-clip',
            isOngoing ? 'isolate bg-contrast-900' : 'bg-primary-800',
            isCompleted && 'bg-green-300 text-primary-950',
            isDone && 'opacity-70'
          )}
        >
          {isOngoing && (
            <span aria-hidden className={ongoingTaskShimmerClassName}>
              <span className={ongoingTaskShimmerBandClassName} />
            </span>
          )}
          <span className="relative z-10 block space-y-2">
            <header className="flex justify-between items-center gap-1">
              {project && (
                <Link
                  path={project.$path}
                  className="bg-contrast-400 text-contrast-950 hover:bg-contrast-500 block text-[0.45rem] leading-none px-1 py-0.5 rounded-full font-semibold uppercase whitespace-nowrap overflow-hidden text-ellipsis w-auto max-w-full min-w-0 shrink"
                >
                  {project.$name}
                </Link>
              )}
              {!done && <KanbanDueBadge due={due} />}
            </header>
            <Link
              path={task.$path}
              variant="plain"
              onLongPress={open}
              className={classMerge(
                'block w-full text-left whitespace-normal wrap-break-word',
                isCompleted && 'text-primary-950 hover:text-primary-50'
              )}
            >
              {task.$name}
            </Link>
            <footer className="flex justify-between items-center gap-1">
              <KanbanMetaBadge>
                {done
                  ? `Completado ${done.toLocaleString()}`
                  : `Actualizado ${task.$mtime.toLocaleString()}`}
              </KanbanMetaBadge>
              <span className="flex items-center shrink-0 min-h-5 pr-6">
                {weekTag && (
                  <KanbanMetaBadge className="bg-green-900 text-green-300 text-lg">
                    W{getWeekFromTag(weekTag).toString().padStart(2, '0')}
                  </KanbanMetaBadge>
                )}
              </span>
            </footer>
          </span>
        </button>
        <ContextMenu
          variant="plain"
          className={classMerge(
            'absolute right-2 bottom-2 z-20 flex size-5 items-center justify-center',
            isCompleted && 'text-primary-950 hover:text-primary-800'
          )}
          options={options}
        >
          <dc.Icon icon="ellipsis-vertical" className="size-3" />
        </ContextMenu>
      </div>
    </>
  )
}
