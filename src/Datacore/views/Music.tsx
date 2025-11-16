import type { MarkdownPage } from '@blacksmithgu/datacore'
import { useMemo } from 'preact/hooks'
import { AddAlbumModal } from '../components/music/add-album-modal'
import { AlbumItem } from '../components/music/album-item'
import { sortByLastModified } from '../components/music/utils'
import { Button } from '../components/shared/button'
import { Dialog, type Props as DialogProps, useDialog } from '../components/shared/dialog'
import { Scroller } from '../components/shared/scroller'
import { useDebouncedState } from '../hooks/state'
import { getFrontmatterValue, setPageFrontmatterValue } from '../utils/markdown'

type Props = {
  apiKey: string
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

type YearString = `${number}`

type YearsAndMonths = {
  [year: YearString]: {
    [month: number]: MarkdownPage[]
  },
  unlisted: MarkdownPage[]
}

const buildAlbumHierarchy = (albums: MarkdownPage[]) => {
  return albums.reduce<YearsAndMonths>((acc, album) => {
    const listening = getFrontmatterValue<string>(album, 'listening')

    if (!listening) {
      acc.unlisted.push(album)
      return acc
    }

    const year = listening.split(' ')[0] as YearString
    const monthStr = listening.split(' ')[1]
    const month = months.indexOf(monthStr)

    if (!acc[year]) {
      acc[year] = {}
    }

    if (!acc[year][month]) {
      acc[year][month] = []
    }

    acc[year][month].push(album)

    return acc
  }, {
    unlisted: [],
  })
}

export const Music = ({ apiKey }: Props) => {
  const albums = dc.useQuery<MarkdownPage>(`@page AND path("Music/Albums")`)

  const albumList = buildAlbumHierarchy(albums)

  const years = Object.keys(albumList).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)) as Array<YearString | 'unlisted'>

  return (
    <div>
      <menu className="flex justify-end gap-1">
        <AlbumDialog albums={albumList.unlisted} />
        <AddAlbumModal apiKey={apiKey} />
      </menu>

      <main>
        {years.map((year) => {
          if (year === 'unlisted') return null
          return (
            <div key={year}>
              <h2>{year}</h2>
              {
                Object
                  .keys(albumList[year])
                  .sort()
                  .map((month) => {
                    return (
                      <AlbumsMonth
                        key={month}
                        month={parseInt(month, 10)}
                        year={year}
                        pendingAlbums={albumList.unlisted}
                        albums={albumList[year][parseInt(month, 10)]}
                      />
                    )
                  })
              }
            </div>
          )
        })}
      </main>
    </div>
  )
}

const AlbumsMonth = ({
  month,
  year,
  albums,
  pendingAlbums,
}: {
  month?: number,
  year?: YearString,
  albums: MarkdownPage[],
  pendingAlbums: MarkdownPage[],
}) => {
  return (
    <div>
      {
        month
          ? (
            <header className="flex items-center gap-1 mb-2 mt-6">
              <h3 className="flex-1 my-0">{months[month]}</h3>
              <AlbumDialog
                albums={pendingAlbums}
                triggerProps={{ size: 'icon', label: null, icon: 'disc-3' }}
                onClick={(album) => {
                  const listening = `${year} ${months[month]}`

                  setPageFrontmatterValue(album, 'Listening', listening)
                }}
              />
            </header>
          )
          : null
      }
      <AlbumList albums={albums} />
    </div>
  )
}

const AlbumDialog = ({
  albums,
  triggerProps,
  onClick
}: {
  albums: MarkdownPage[],
  triggerProps?: DialogProps['triggerProps'],
  onClick?: (album: MarkdownPage) => void,
}) => {
  const [search, setSearch] = useDebouncedState('')
  const { ref } = useDialog()

  const filteredAlbums = useMemo(() => albums.filter((album) => {
    const title = album.$name.toLowerCase()
    const searchLower = search.toLowerCase()

    return title.includes(searchLower)
  }), [albums, search])

  return (
    <Dialog
      title={`Pendientes (${albums.length})`}
      dialogRef={ref}
      icon="disc-3"
      className='w-full'
      triggerProps={{
        size: 'sm',
        ...triggerProps
      }}
    >
      <input
        className="w-full mb-4"
        type="text"
        placeholder="Buscar"
        value={search}
        onChange={(e) => setSearch(e?.currentTarget.value)}
      />
      <Scroller className='max-h-60'>
        <AlbumList albums={filteredAlbums} onClick={onClick} />
      </Scroller>
    </Dialog>
  )
}

const AlbumList = ({ albums, onClick }: {
  albums: MarkdownPage[]
  onClick?: (album: MarkdownPage) => void
}) => {
  const sortedAlbums = useMemo(() => albums.sort((a, b) => {
    const aRating = getFrontmatterValue<number>(a, 'my rating')
    const bRating = getFrontmatterValue<number>(b, 'my rating')

    if (aRating && bRating && (aRating !== bRating)) {
      return bRating - aRating
    }
    if (!aRating) return -1
    if (!bRating) return 1

    return sortByLastModified(a, b)
  }), [albums])

  return <div className="grid grid-cols-auto-fit gap-2" style={{
    "--column-width": "330px",
  }}>
    {
      sortedAlbums.map((album) => (
        <AlbumItem
          key={album.$id}
          album={album}
          actions={
            onClick
              ? (
                <Button
                  size="icon-xs"
                  icon="plus"
                  onClick={() => onClick(album)}
                />
              )
              : null
          }
        />
      ))
    }
  </div>
}