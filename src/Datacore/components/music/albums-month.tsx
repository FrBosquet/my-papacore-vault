import type { MarkdownPage } from "@blacksmithgu/datacore"
import { setPageFrontmatterValue } from "../../utils/markdown"
import { AlbumList } from "./album-list"
import { AlbumDialog } from "./albums-dialog"
import { months, type YearString } from "./utils"

export const AlbumsMonth = ({
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