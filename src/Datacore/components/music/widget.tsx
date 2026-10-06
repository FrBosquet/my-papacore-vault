import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { getTodayDatetime } from '../../utils/time'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { Scroller } from '../shared/scroller'
import { AlbumItem } from './album-item'
import { months, sortByLastModified } from './utils'

const listeningPeriod = (datetime: DateTime) =>
  `${datetime.year} ${months[datetime.month - 1]}`

const useMonthAlbums = (period: string) => {
  return dc.useQuery<MarkdownPage>(
    `@page 
      AND path("Music/Albums")
      AND Listening = "${period}"`
  )
}

const useRecentAlbums = () => {
  const now = getTodayDatetime()
  const previousMonth = now.minus({ months: 1 })
  const thisMonthAlbums = useMonthAlbums(listeningPeriod(now))
  const previousMonthAlbums = useMonthAlbums(listeningPeriod(previousMonth))

  return [...thisMonthAlbums, ...previousMonthAlbums].sort(sortByLastModified)
}

export const MusicWidget = () => {
  const albums = useRecentAlbums()

  return (
    <Card>
      <Link path="Music/Hub.md" icon="disc-3" iconClassName="animate-spin">
        Listening
      </Link>
      <Scroller className="max-h-30" wrapperClassName="gap-2">
        {albums.map((album) => (
          <AlbumItem key={album.$id} album={album} />
        ))}
      </Scroller>
    </Card>
  )
}
