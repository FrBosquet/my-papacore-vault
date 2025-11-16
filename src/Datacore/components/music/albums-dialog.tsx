
import type { MarkdownPage } from "@blacksmithgu/datacore"
import { useMemo } from "preact/hooks"
import { useDebouncedState } from "../../hooks/state"
import { Dialog, type Props as DialogProps, useDialog } from "../shared/dialog"
import { Scroller } from "../shared/scroller"
import { AlbumList } from "./album-list"

export const AlbumDialog = ({
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