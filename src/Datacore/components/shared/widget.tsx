import type { MarkdownPage } from "@blacksmithgu/datacore"
import type { ComponentChildren } from "preact"
import { getResourcePath } from "../../utils/files"
import { getFrontmatterValue } from "../../utils/markdown"
import { Image } from "./image"
import { Link } from "./link"

export type Props = {
  page: MarkdownPage
  children: ComponentChildren
  tooltip?: string
}

export const WidgetItem = ({
  page,
  children,
  tooltip,
}: Props) => {
  const image = getFrontmatterValue<string>(page, 'image')

  return (
    <Link
      tooltip={tooltip}
      key={page.$path}
      path={page.$path}
      className="flex items-center gap-2 w-full group hover:bg-theme-contrast bg-primary-950 transition hover:text-primary-800 relative h-10"
    >
      <Image
        src={image ?? getResourcePath('Images/empty.jpg')}
        alt={page.$name}
        className="h-full aspect-square object-cover"
      />
      <div className="flex flex-col gap-1 text-sm flex-1 overflow-hidden">
        {children}
      </div>
    </Link>
  )
}