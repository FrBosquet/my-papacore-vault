import type { MarkdownPage } from "@blacksmithgu/datacore"

export const sortByLastModified = (a: MarkdownPage, b: MarkdownPage) => {
  return b.$mtime.millisecond - a.$mtime.millisecond
}
