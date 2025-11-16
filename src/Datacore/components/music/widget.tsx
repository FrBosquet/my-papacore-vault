import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { Scroller } from '../shared/scroller'
import { AlbumItem } from './album-item'
import { sortByLastModified } from './utils'

const useMonthAlbums = (datetime: DateTime) => {
  datetime.setLocale('en')
  const currentPeriod = `${datetime.year} ${datetime.monthLong}`

  return dc.useQuery<MarkdownPage>(
    `@page 
      AND path("Music/Albums")
      AND Listening = "${currentPeriod}"`
  )
}

const useRecentAlbums = () => {
  const now = dc.coerce.date(new Date().toISOString())?.setLocale('en')

  if (!now) {
    return []
  }

  const previousMonth = now.minus({ months: 1 })
  const thisMonthAlbums = useMonthAlbums(now)
  const previousMonthAlbums = useMonthAlbums(previousMonth)

  return [
    ...thisMonthAlbums.sort(sortByLastModified),
    ...previousMonthAlbums.sort(sortByLastModified),
  ]
}

export const MusicWidget = () => {
  const albums = useRecentAlbums()

  return (
    <Card>
      <Link path="Music/Hub" icon="disc-3" iconClassName="animate-spin">
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


