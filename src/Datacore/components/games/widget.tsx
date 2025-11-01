import type { MarkdownListItem, MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { getDailyNoteDatetime } from '../../utils/files'
import { cleanAnnotationFromLinks, getFrontmatterValue } from '../../utils/markdown'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { WidgetItem } from '../shared/widget'

export const GameWidget = () => {
  const games = dc.useQuery<MarkdownPage>(
    `@page AND path("Gaming log/Games") AND start AND !end`
  )

  return (
    <Card>
      <Link path="Gaming Log/Games.base" icon="gamepad-2">
        Playing
      </Link>
      {games.map((game) => (
        <GameItem key={game.$path} game={game} />
      ))}
    </Card>
  )
}

const GameItem = ({ game }: { game: MarkdownPage }) => {
  const path = game.$path

  const start = getFrontmatterValue<DateTime>(game, 'start')

  const days = start ? Math.floor(-start.diffNow().as('days')) : 0

  const annotations = dc.useQuery<MarkdownListItem>(
    `@list-item AND connected([[${path}]])`
  )
  const lastAnnotation = annotations[annotations.length - 1]

  const annotationDay = getDailyNoteDatetime(lastAnnotation.$file)
  const daysSinceLastAnnotation = Math.floor(
    -annotationDay.diffNow().as('days')
  )

  const lastAnnotationText = lastAnnotation.$text && cleanAnnotationFromLinks(lastAnnotation.$text)
  const lastAnnotationLabel =
    daysSinceLastAnnotation === 0
      ? 'hoy'
      : daysSinceLastAnnotation === 1
        ? 'ayer'
        : `hace ${daysSinceLastAnnotation} dias`

  return (
    <WidgetItem
      key={game.$id}
      page={game}
      tooltip={lastAnnotationText}
    >
      <span className="normal-case group-hover:text-primary-800 text-primary-300 transition">
        {game.$name}
      </span>
      <div className="flex justify-between items-center w-full tracking-normal">
        <span className="text-xs text-primary-600 normal-case flex gap-1 items-center">
          <dc.Icon className="size-3" icon="calendar-plus" /> {days} dias
        </span>
        <span className="text-xs text-primary-600 normal-case flex gap-1 items-center">
          anotado {lastAnnotationLabel}{' '}
          <dc.Icon className="size-3" icon="notebook-pen" />
        </span>
      </div>
    </WidgetItem>
  )
}

