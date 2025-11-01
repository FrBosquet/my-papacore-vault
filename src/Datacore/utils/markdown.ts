import type { FrontmatterEntry, Literal, MarkdownPage } from "@blacksmithgu/datacore";

export const getFrontmatter = (page: MarkdownPage, key: string): FrontmatterEntry | undefined => {
  const frontmatter = page.$frontmatter

  if (!frontmatter) return undefined

  return frontmatter?.[key]
}

export const getFrontmatterValue = <T extends Literal>(page: MarkdownPage, key: string): T | undefined => {
  return getFrontmatter(page, key)?.value as T
}

export const cleanAnnotationFromLinks = (annotation: string) => {
  return annotation.replace(/\[\[.*?\]\]/g, '')
}