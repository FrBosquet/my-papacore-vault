import type { MarkdownPage } from "@blacksmithgu/datacore"
import { AlbumsMonth } from "./albums-month"
import type { YearString, YearsAndMonths } from "./utils"

export const AlbumViz = ({
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
      Object.keys(yearAlbums)
        .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
        .map((month) => {
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
