import type { MarkdownPage } from '@blacksmithgu/datacore'
import { classMerge } from '../../utils/classMerge'
import { getFrontmatterValue } from '../../utils/markdown'
import { STATUSES } from '../../utils/tasks'
import { KanbanTaskCard } from './kanban-task-card'

export type KanbanColumnKey = (typeof STATUSES)[number] | 'carryover'

const isTaskStatus = (
  status: string | undefined
): status is (typeof STATUSES)[number] => {
  return !!status && (STATUSES as readonly string[]).includes(status)
}

interface Props {
  label: string
  status: KanbanColumnKey
  tasks: MarkdownPage[]
  isDragOver: boolean
  onDragOver: (event: DragEvent, status: KanbanColumnKey) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent, status: KanbanColumnKey) => void
  onDragStartTask: (event: DragEvent, task: MarkdownPage) => void
  onDragEndTask: () => void
  draggingTaskId: string | null
}

export const KanbanColumn = ({
  label,
  status,
  tasks,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStartTask,
  onDragEndTask,
  draggingTaskId,
}: Props) => {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Column needs native drop handlers.
    <section
      onDragOver={(event) => onDragOver(event, status)}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(event, status)}
      className={classMerge(
        'rounded-md p-2 min-h-48 min-w-44 space-y-2 bg-primary-950/50 flex-1 overflow-hidden',
        isDragOver && 'bg-purple-900/50'
      )}
    >
      <header className="flex items-center justify-between px-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary-300">
          {label}
        </h4>
        <span className="text-[0.65rem] text-primary-500">{tasks.length}</span>
      </header>
      <div className="space-y-2">
        {tasks.map((task) => {
          const taskStatus = getFrontmatterValue<string>(task, 'status')
          const cardStatus =
            status === 'carryover'
              ? isTaskStatus(taskStatus)
                ? taskStatus
                : 'this-week'
              : status

          return (
            <KanbanTaskCard
              key={task.$id}
              task={task}
              status={cardStatus}
              onDragStart={onDragStartTask}
              onDragEnd={onDragEndTask}
              isDragging={draggingTaskId === task.$id}
            />
          )
        })}
      </div>
    </section>
  )
}
