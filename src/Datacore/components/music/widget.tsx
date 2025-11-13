import type { Link as LinkType, MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { getFileName } from '../../utils/files'
import { getFrontmatterValue } from '../../utils/markdown'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { Scroller } from '../shared/scroller'
import { WidgetItem } from '../shared/widget'

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
  const now = dc.coerce.date(new Date().toISOString()).setLocale('en')
  const previousMonth = now.minus({ months: 1 })
  const thisMonthAlbums = useMonthAlbums(now)
  const previousMonthAlbums = useMonthAlbums(previousMonth)

  return [
    ...thisMonthAlbums.sort((a, b) => b.$mtime.ts - a.$mtime.ts),
    ...previousMonthAlbums.sort((a, b) => b.$mtime.ts - a.$mtime.ts),
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

const AlbumItem = ({ album }: { album: MarkdownPage }) => {
  const rating = getFrontmatterValue<number>(album, 'my rating')
  const year = getFrontmatterValue<number>(album, 'year')
  const artist = getFrontmatterValue<LinkType[]>(album, 'artist')

  const hasRating = !!rating

  const albumName = album.$name.includes(' - ')
    ? album.$name.split(' - ')[1]
    : album.$name

  const artistName = artist
    ? artist.map((a) => getFileName(a.path)).join(', ')
    : '-'

  return (
    <WidgetItem key={album.$id} page={album} tooltip={album.$name}>
      <span className="normal-case text-primary-300 group-hover:text-primary-800 text-ellipsis overflow-hidden text-nowrap w-full block">
        {albumName}
      </span>
      <footer className="flex justify-between items-center w-full relative gap-1 tracking-normal">
        <span className="text-xs text-primary-600 normal-case flex gap-1 items-center text-nowrap overflow-hidden text-ellipsis max-w-full">
          <dc.Icon className="size-3" icon="calendar" />
          {year}
        </span>
        <span className="text-xs text-primary-600 normal-case flex gap-1 items-center text-nowrap overflow-hidden text-ellipsis max-w-full flex-1">
          <dc.Icon className="size-3" icon="user-round" />
          {artistName}
        </span>
        <span
          data-hasrating={hasRating}
          className="text-xs normal-case flex gap-1/2 items-center data-[hasrating=true]:text-yellow-300 text-primary-600"
        >
          {rating}
          <dc.Icon className="size-3" icon="star" />
        </span>
      </footer>
    </WidgetItem>
  )
}
