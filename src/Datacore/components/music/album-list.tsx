import type { MarkdownPage } from "@blacksmithgu/datacore"
import { useMemo } from "preact/hooks"
import { getFrontmatterValue } from "../../utils/markdown"
import { Button } from "../shared/button"
import { AlbumItem } from "./album-item"
import { sortByLastModified } from "./utils"

export const AlbumList = ({ albums, onClick }: {
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

  return <div className="grid grid-cols-auto-fit gap-2">
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