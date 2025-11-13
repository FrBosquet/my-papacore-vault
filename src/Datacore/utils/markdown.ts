import type {
  FrontmatterEntry,
  Literal,
  MarkdownPage,
} from '@blacksmithgu/datacore'

/**
 * Get a frontmatter entry from a page.
 *
 * @param page - Page to get the frontmatter from
 * @param key - Key of the frontmatter
 */
export const getFrontmatter = (
  page: MarkdownPage,
  key: string
): FrontmatterEntry | undefined => {
  const frontmatter = page.$frontmatter

  if (!frontmatter) return undefined

  return frontmatter?.[key]
}

/**
 * Set a frontmatter value in a page.
 *
 * @param page - Page to set the frontmatter value in
 * @param key - Key of the frontmatter
 * @param value - Value to set
 */
export const setPageFrontmatterValue = async <T extends Literal>(
  page: MarkdownPage,
  key: string,
  value: T | undefined | ((currentValue: T | undefined) => T | undefined)
) => {
  const file = dc.app.vault.getFileByPath(page.$file)

  if (!file) return

  await dc.app.fileManager.processFrontMatter(file, (frontmatter) => {
    const currentValue = frontmatter[key]

    const newValue = typeof value === 'function' ? value(currentValue) : value

    if (!newValue && newValue !== 0 && newValue !== false) {
      delete frontmatter[key]
    } else if (
      typeof newValue === 'object' &&
      'isLuxonDatetime' in newValue &&
      newValue.isLuxonDatetime
    ) {
      frontmatter[key] = newValue.toISODate()
    } else {
      frontmatter[key] = newValue
    }
  })
}

/**
 * Get a frontmatter value from a page.
 *
 * @param page - Page to get the frontmatter from
 * @param key - Key of the frontmatter
 */
export const getFrontmatterValue = <T extends Literal>(
  page: MarkdownPage,
  key: string
): T | undefined => {
  return getFrontmatter(page, key)?.value as T
}

/**
 * Clean annotations from links.
 *
 * @param annotation - Annotation to clean
 */
export const cleanAnnotationFromLinks = (annotation: string) => {
  return annotation.replace(/\[\[.*?\]\]/g, '')
}
