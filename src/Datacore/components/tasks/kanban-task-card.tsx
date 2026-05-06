import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { getFrontmatterValue } from '../../utils/markdown'
import {
  getWeekFromTag,
  getWeekFromTags,
  type WeekTag,
} from '../../utils/tasks'
import { LogAnnotationForm } from '../logs/log-annotation-form'
import { Dialog, useDialog } from '../shared/dialog'
import { Link } from '../shared/link'
import { ModalHeader } from '../shared/typography'
import { KanbanDueBadge } from './kanban-due-badge'
import { KanbanMetaBadge } from './kanban-meta-badge'

interface Props {
  task: MarkdownPage
  onDragStart: (event: DragEvent, task: MarkdownPage) => void
  onDragEnd: () => void
  isDragging: boolean
}

export const KanbanTaskCard = ({
  task,
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

  return (
    <>
      <Dialog dialogRef={dialogRef} hideTrigger>
        <ModalHeader>{task.$name}</ModalHeader>
        <LogAnnotationForm targetPage={task} onSubmit={close} />
      </Dialog>
      <button
        data-dragging={isDragging}
        type="button"
        draggable
        onDragStart={(event: DragEvent) => onDragStart(event, task)}
        onDragEnd={onDragEnd}
        className="block rounded-md p-2 space-y-2 border border-transparent hover:border-primary-700 cursor-grab shadow-none w-full h-[unset] bg-primary-800 overflow-hidden"
      >
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
          className="block w-full text-left whitespace-normal wrap-break-word"
        >
          {task.$name}
        </Link>
        <footer className="flex justify-between items-center gap-1">
          <KanbanMetaBadge>
            {done
              ? `Completado ${done.toLocaleString()}`
              : `Actualizado ${task.$mtime.toLocaleString()}`}
          </KanbanMetaBadge>
          {weekTag && (
            <KanbanMetaBadge className="bg-green-900 text-green-300 text-lg">
              W
              {getWeekFromTag(weekTag as WeekTag)
                .toString()
                .padStart(2, '0')}
            </KanbanMetaBadge>
          )}
        </footer>
      </button>
    </>
  )
}
