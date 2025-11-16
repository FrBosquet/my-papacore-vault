import type { MarkdownListItem, MarkdownPage } from "@blacksmithgu/datacore"
import { getFrontmatterValue } from "../../utils/markdown"
import { SongList } from "./song-list"
import { months, type Song, type YearString } from "./utils"

export const SongViz = ({
  time,
}: {
  time: 'month' | 'year'
}) => {
  const songs = dc.useQuery<MarkdownListItem>(`
    @list-item 
      AND path("Music/Albums")
      AND childof(@section AND $title="Featured songs")
    `)

  const songData = songs.reduce<{
    [year: YearString]: {
      [month: number]: Array<Song>
    }
  }>((acc, song) => {
    const page = song.$parent?.$parent?.$parent as MarkdownPage
    const listening = getFrontmatterValue<string>(page, 'listening')
    const albumUrl = getFrontmatterValue<string>(page, 'album')
    const albumImage = getFrontmatterValue<string>(page, 'image')
    const year = listening?.split(' ')[0] as YearString
    const month = listening?.split(' ')[1]
    const [artist, albumName] = page.$name.split(' - ')
    const [songTitle, songComment] = song.$cleantext.split(' - ')

    if (!year || !month) return acc

    const monthNumber = months.indexOf(month)

    if (!acc[year]) {
      acc[year] = {}
    }
    if (!acc[year][monthNumber]) {
      acc[year][monthNumber] = []
    }

    return {
      // biome-ignore lint/performance/noAccumulatingSpread: stupid rule
      ...acc,
      [year]: {
        ...acc[year],
        [monthNumber]: [
          ...acc[year][monthNumber],
          {
            page,
            artist,
            albumName,
            listening,
            songTitle,
            songComment,
            month,
            albumUrl,
            albumPath: page.$path,
            albumImage
          }
        ]
      }
    }
  }, {})

  const years = Object.keys(songData).sort()

  return <div>
    {
      years.map((year) => {
        return (
          <div key={year}>
            <h2>{year}</h2>
            {
              time === 'year'
                ? <SongList songs={Object.values(songData[year as YearString]).flat() as Song[]} />
                : Object.keys(songData[year as YearString])
                  .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
                  .map((month) => {
                    return (
                      <>
                        <h3>{months[parseInt(month, 10)]}</h3>
                        <SongList
                          key={month}
                          songs={songData[year as YearString][parseInt(month, 10)]}
                        />
                      </>
                    )
                  })
            }
          </div>
        )
      })
    }
  </div>
}