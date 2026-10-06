import type { MarkdownPage } from '@blacksmithgu/datacore'
import { getFrontmatterValue } from '../../utils/markdown'
import {
  addToWeek,
  getTaskWeekTagFromDate,
  moveToDone,
  moveToInReview,
  moveToOngoing,
  removeFromWeek,
  type STATUSES,
  taskSorter,
} from '../../utils/tasks'
import { getTodayDatetime } from '../../utils/time'
import { Card } from '../shared/card'
import { KanbanColumn, type KanbanColumnKey } from './kanban-column'

const KANBAN_COLUMNS: Array<{ key: (typeof STATUSES)[number]; label: string }> =
  [
    { key: 'backlog', label: 'Backlog' },
    { key: 'this-week', label: 'This Week' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'in-review', label: 'In Review' },
    { key: 'done', label: 'Done' },
  ]

export const KanbanBoard = ({
  tasks,
  carryOvers,
}: {
  tasks: MarkdownPage[]
  carryOvers?: MarkdownPage[]
}) => {
  const today = getTodayDatetime()
  const weekTag = getTaskWeekTagFromDate(today)
  const [draggingTaskId, setDraggingTaskId] = dc.useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = dc.useState<string | null>(null)
  const showCarryOvers = carryOvers !== undefined

  const columns = dc.useMemo(() => {
    const statusColumns = showCarryOvers
      ? KANBAN_COLUMNS.filter((column) => column.key !== 'backlog')
      : KANBAN_COLUMNS

    if (!carryOvers?.length) return statusColumns

    return [{ key: 'carryover' as const, label: 'Carryover' }, ...statusColumns]
  }, [carryOvers, showCarryOvers])

  const tasksByStatus = dc.useMemo(() => {
    const byStatus = {
      backlog: [] as MarkdownPage[],
      'this-week': [] as MarkdownPage[],
      ongoing: [] as MarkdownPage[],
      'in-review': [] as MarkdownPage[],
      done: [] as MarkdownPage[],
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

  const handleDrop = (event: DragEvent, nextStatus: KanbanColumnKey) => {
    event.preventDefault()
    if (nextStatus === 'carryover') {
      setDraggingTaskId(null)
      setDragOverColumn(null)
      return
    }

    const taskId =
      event.dataTransfer?.getData('application/x-task-id') ||
      event.dataTransfer?.getData('text/plain') ||
      draggingTaskId
    if (!taskId) return
    const task = [...(carryOvers ?? []), ...tasks].find(
      (candidate) => candidate.$id === taskId
    )
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
      case 'in-review':
        moveToInReview(task)
        break
      case 'done':
        moveToDone(task)
        break
    }

    setDraggingTaskId(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggingTaskId(null)
    setDragOverColumn(null)
  }

  const handleColumnDragOver = (event: DragEvent, status: KanbanColumnKey) => {
    if (status === 'carryover') return
    event.preventDefault()
    setDragOverColumn(status)
  }

  return (
    <Card>
      <section className="flex gap-2 overflow-x-auto min-w-0">
        {columns.map((column) => (
          <KanbanColumn
            key={column.key}
            label={column.label}
            status={column.key}
            tasks={
              column.key === 'carryover'
                ? [...(carryOvers ?? [])].sort(taskSorter)
                : tasksByStatus[column.key]
            }
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
