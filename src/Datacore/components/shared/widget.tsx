import type { MarkdownPage } from "@blacksmithgu/datacore"
import type { ComponentChildren } from "preact"
import { classMerge } from "../../utils/classMerge"
import { getResourcePath } from "../../utils/files"
import { getFrontmatterValue } from "../../utils/markdown"
import { Image } from "./image"
import { Link } from "./link"

export type Props = {
  page: MarkdownPage
  children: ComponentChildren
  tooltip?: string
  className?: string
  actions?: ComponentChildren
}

export const WidgetItem = ({
  page,
  children,
  tooltip,
  className,
  actions,
}: Props) => {
  const image = getFrontmatterValue<string>(page, 'image')

  return (
    <div
      className="bg-primary-950 flex w-full gap-2"
    >
      <Link
        tooltip={tooltip}
        key={page.$path}
        path={page.$path}
        wrapperClassName="flex-1"
        className={classMerge(`flex items-center gap-2 group hover:bg-theme-contrast bg-primary-950 transition hover:text-primary-800 relative h-10 text-sm flex-1`, className)}
      >
        <Image
          src={image ?? getResourcePath('Images/empty.jpg')}
          alt={page.$name}
          className="h-full aspect-square object-cover"
        />
        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          {children}
        </div>
      </Link>
      {actions
        ? (
          <menu className="flex items-center justify-center">
            {actions}
          </menu>
        ) : null}
    </div>
  )
}