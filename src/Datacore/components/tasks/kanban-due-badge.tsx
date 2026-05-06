import type { DateTime } from 'luxon'
import { KanbanMetaBadge } from './kanban-meta-badge'

export const KanbanDueBadge = ({ due }: { due?: DateTime }) => {
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
    <KanbanMetaBadge className={colorClass}>
      <dc.Icon icon="clock" className="size-2" />
      {label}
    </KanbanMetaBadge>
  )
}
