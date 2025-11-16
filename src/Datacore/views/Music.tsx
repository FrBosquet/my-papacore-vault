import type { MarkdownPage } from '@blacksmithgu/datacore'
import { AddAlbumModal } from '../components/music/add-album-modal'
import { AlbumDialog } from '../components/music/albums-dialog'
import { AlbumsMonth } from '../components/music/albums-month'
import {
  buildAlbumHierarchy,
  type YearString,
  type YearsAndMonths
} from '../components/music/utils'
import { Button } from '../components/shared/button'
import { useFrontmatterState } from '../hooks/markdown'

type Props = {
  apiKey: string
}

export const Music = ({ apiKey }: Props) => {
  const [mode, setMode] = useFrontmatterState('mode', 'album')
  const [time, setTime] = useFrontmatterState('time', 'month')

  const albums = dc.useQuery<MarkdownPage>(`@page AND path("Music/Albums")`)

  const albumList = buildAlbumHierarchy(albums)

  const years = Object.keys(albumList).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)) as Array<YearString | 'unlisted'>

  return (
    <div>
      <menu className="flex justify-end gap-1">
        <div className="flex">
          <Button size="sm" disabled={mode === 'song'} onClick={() => setMode('song')}>Cancion</Button>
          <Button size="sm" disabled={mode === 'album'} onClick={() => setMode('album')}>Album</Button>
        </div>
        <div className="flex">
          <Button size="sm" disabled={time === 'month'} onClick={() => setTime('month')}>Mes</Button>
          <Button size="sm" disabled={time === 'year'} onClick={() => setTime('year')}>Año</Button>
        </div>
        <AlbumDialog albums={albumList.unlisted} />
        <AddAlbumModal apiKey={apiKey} />
      </menu>

      <main style={{
        "--column-width": time === 'month' ? "330px" : null,
      }}>
        {years.map((year) => {
          if (year === 'unlisted') return null
          return (
            <div key={year}>
              <h2>{year}</h2>
              {
                <AlbumMode
                  time={time?.toString() as 'month' | 'year'}
                  year={year}
                  yearAlbums={albumList[year]}
                  pendingAlbums={albumList.unlisted}
                />
              }
            </div>
          )
        })}
      </main>
    </div>
  )
}

const AlbumMode = ({
  time,
  year,
  yearAlbums,
  pendingAlbums
}: {
  time: 'month' | 'year'
  year: YearString,
  yearAlbums: YearsAndMonths[YearString],
  pendingAlbums: MarkdownPage[]
}) => {
  if (time === 'month') {
    return (
      Object.keys(yearAlbums).sort().map((month) => {
        return (
          <AlbumsMonth
            key={month}
            month={parseInt(month, 10)}
            year={year}
            pendingAlbums={pendingAlbums}
            albums={yearAlbums[parseInt(month, 10)]}
          />
        )
      })
    )
  } else {
    const aggregatedAlbums = Object.values(yearAlbums).flat()
    return (
      <AlbumsMonth
        year={year}
        pendingAlbums={pendingAlbums}
        albums={aggregatedAlbums}
      />
    )
  }
}
