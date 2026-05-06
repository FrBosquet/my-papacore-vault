import type { MarkdownPage } from '@blacksmithgu/datacore'
import { classMerge } from '../../utils/classMerge'
import type { STATUSES } from '../../utils/tasks'
import { KanbanTaskCard } from './kanban-task-card'

interface Props {
  label: string
  status: (typeof STATUSES)[number]
  tasks: MarkdownPage[]
  isDragOver: boolean
  onDragOver: (event: DragEvent, status: (typeof STATUSES)[number]) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent, status: (typeof STATUSES)[number]) => void
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
        'rounded-md p-2 min-h-48 space-y-2 bg-primary-950/50 flex-1 overflow-hidden',
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
        {tasks.map((task) => (
          <KanbanTaskCard
            key={task.$id}
            task={task}
            onDragStart={onDragStartTask}
            onDragEnd={onDragEndTask}
            isDragging={draggingTaskId === task.$id}
          />
        ))}
      </div>
    </section>
  )
}
