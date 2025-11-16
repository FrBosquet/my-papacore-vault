import type { Link as LinkType, MarkdownPage } from '@blacksmithgu/datacore'
import type { ComponentChildren } from 'preact'
import { getFileName } from "../../utils/files"
import { getFrontmatterValue } from "../../utils/markdown"
import { WidgetItem } from "../shared/widget"

export type Props = {
  album: MarkdownPage
  actions?: ComponentChildren
}

export const AlbumItem = ({ album, actions }: Props) => {
  const rating = getFrontmatterValue<number>(album, 'my rating')
  const year = getFrontmatterValue<number>(album, 'year')
  const artist = getFrontmatterValue<LinkType[]>(album, 'artist')

  const hasRating = !!rating

  const albumName = album.$name.includes(' - ')
    ? album.$name.split(' - ')[1]
    : album.$name

  const artistName = (artist?.map)
    ? artist.map((a) => getFileName(a.path)).join(', ')
    : '-'

  return (
    <WidgetItem key={album.$id} page={album} tooltip={album.$name} actions={actions}>
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
          className="text-xs normal-case flex gap-1/2 items-center data-[hasrating=true]:text-yellow-200 text-primary-600"
        >
          {
            Array(Number(rating))
              .fill(null)
              .map((_, i) => (
                <dc.Icon key={i} className="size-2" icon="star" />
              ))
          }
        </span>
      </footer>
    </WidgetItem>
  )
}