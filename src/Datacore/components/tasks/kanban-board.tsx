import type { MarkdownPage } from '@blacksmithgu/datacore'
import { getFrontmatterValue } from '../../utils/markdown'
import {
  addToWeek,
  getTaskWeekTagFromDate,
  moveToArchive,
  moveToDone,
  moveToOngoing,
  removeFromWeek,
  type STATUSES,
  taskSorter,
} from '../../utils/tasks'
import { getTodayDatetime } from '../../utils/time'
import { Card } from '../shared/card'
import { KanbanColumn } from './kanban-column'

const KANBAN_COLUMNS: Array<{ key: (typeof STATUSES)[number]; label: string }> =
  [
    { key: 'backlog', label: 'Backlog' },
    { key: 'this-week', label: 'This Week' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'done', label: 'Done' },
    { key: 'archive', label: 'Archive' },
  ]

export const KanbanBoard = ({ tasks }: { tasks: MarkdownPage[] }) => {
  const today = getTodayDatetime()
  const weekTag = getTaskWeekTagFromDate(today)
  const [draggingTaskId, setDraggingTaskId] = dc.useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = dc.useState<string | null>(null)

  const tasksByStatus = dc.useMemo(() => {
    const byStatus = {
      backlog: [] as MarkdownPage[],
      'this-week': [] as MarkdownPage[],
      ongoing: [] as MarkdownPage[],
      done: [] as MarkdownPage[],
      archive: [] as MarkdownPage[],
    }

    tasks.forEach((task) => {
      const status = getFrontmatterValue<(typeof STATUSES)[number]>(
        task,
        'status'
      )
      const key = status && status in byStatus ? status : 'backlog'
      byStatus[key].push(task)
    })

    for (const key of Object.keys(byStatus) as Array<keyof typeof byStatus>) {
      byStatus[key].sort(taskSorter)
    }

    return byStatus
  }, [tasks])

  const handleDragStart = (event: DragEvent, task: MarkdownPage) => {
    event.dataTransfer?.setData('text/plain', task.$id)
    event.dataTransfer?.setData('application/x-task-id', task.$id)
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }
    setDraggingTaskId(task.$id)
  }

  const handleDrop = (
    event: DragEvent,
    nextStatus: (typeof STATUSES)[number]
  ) => {
    event.preventDefault()
    const taskId =
      event.dataTransfer?.getData('application/x-task-id') ||
      event.dataTransfer?.getData('text/plain') ||
      draggingTaskId
    if (!taskId) return
    const task = tasks.find((candidate) => candidate.$id === taskId)
    if (!task) return

    switch (nextStatus) {
      case 'backlog':
        removeFromWeek(task)
        break
      case 'this-week':
        addToWeek(task, weekTag)
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
    }

    setDraggingTaskId(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggingTaskId(null)
    setDragOverColumn(null)
  }

  const handleColumnDragOver = (
    event: DragEvent,
    status: (typeof STATUSES)[number]
  ) => {
    event.preventDefault()
    setDragOverColumn(status)
  }

  return (
    <Card>
      <section className="flex overflow-hidden">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.key}
            label={column.label}
            status={column.key}
            tasks={tasksByStatus[column.key]}
            isDragOver={dragOverColumn === column.key}
            onDragOver={handleColumnDragOver}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={handleDrop}
            onDragStartTask={handleDragStart}
            onDragEndTask={handleDragEnd}
            draggingTaskId={draggingTaskId}
          />
        ))}
      </section>
    </Card>
  )
}
