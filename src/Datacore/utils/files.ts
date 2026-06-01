import type { PaneType } from 'obsidian'
import { ContentTransformer } from './ContentTransformer'
import { fromStringToDatetime } from './time'

export const getPage = (path: string) => {
  return dc.api.page(path)
}

export const cleanPath = (path: string) => {
  // if path ends with md, return path
  if (path.endsWith('.md')) return path

  // if path ends with .base, return path
  if (path.endsWith('.base')) return path

  // otherwise, return path + .base
  return `${path}.md`
}

export const trimExtension = (path: string) => {
  // if path ends with md, return path without md
  if (path.endsWith('.md')) return path.slice(0, -3)

  // if path ends with .base, return path without .base
  if (path.endsWith('.base')) return path.slice(0, -5)

  // otherwise, return path
  return path
}

/**
 * Receives a daily note path in the format `Journal/YYYY-MM-DD.md`
 * and returns a coerced datetime
 *
 * @param path
 */
export const getDailyNoteDatetime = (path: string) => {
  const dateStr = trimExtension(path).split('/').pop() as string

  // `Journal/YYYY-MM-DD.md` is already an ISO date; interpret it as midnight
  // in the user's local timezone (not UTC).
  const date = fromStringToDatetime(dateStr)

  return date
}

export const getResourcePath = (pathInVault: string) => {
  return dc.app.vault.adapter.getResourcePath(pathInVault)
}

export const getFileName = (path: string) => {
  const filename = path.split('/').pop()
  const extensionIndex = filename?.lastIndexOf('.')

  return extensionIndex !== -1 ? filename?.slice(0, extensionIndex) : filename
}

const getTemplateContent = async (templateName: string) => {
  try {
    const templateFile = dc.app.vault.getFileByPath(
      `Templates/${templateName}.md`
    )

    if (templateFile) {
      return await dc.app.vault.read(templateFile)
    }
  } catch (error) {
    alert(
      `Error getting template: ${error instanceof Error ? error.message : error}`
    )
  }
  return null
}

export const createFromTemplate = async (
  targetPath: string,
  templatePath: string,
  transformer?: (content: ContentTransformer) => ContentTransformer
) => {
  const templateContent = await getTemplateContent(templatePath)

  if (templateContent !== null) {
    await dc.app.vault.create(
      targetPath,
      transformer
        ? transformer(new ContentTransformer(templateContent)).toString()
        : templateContent
    )

    return getFile(targetPath)
  } else {
    alert(
      `El contenido de la plantilla es nulo. Comprueba la plantilla ${templatePath}.`
    )
    return null
  }
}

export const getLeaf = (newLeaf: PaneType | boolean) => {
  return dc.app.workspace.getLeaf(newLeaf)
}

export const getFile = (path: string) => {
  return dc.app.vault.getFileByPath(path)
}

export const fileExists = (path: string) => {
  return getFile(path) !== null
}

export const writeAtTheEndOfTheFile = async (path: string, content: string) => {
  const file = getFile(path)
  if (file) {
    const fileContent = await dc.app.vault.read(file)
    const newContent = `${fileContent}\n${content}`
    await dc.app.vault.modify(file, newContent)
  }
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Appends new content to a list-item that starts with the connector. If the list-item is not found, it creates a new one at the end of the file..
 * A connector is just a link in md format. An annotation looks like `- [[Hello]] World`. The ida is that `appendToLog('...', '[[Hello]]', 'from fran')` will find that annotation and append the new content to it. so it ends up like `- [[Hello]] World from fran`
 *
 * @param path - The path to the file to append to.
 * @param connector - The links  use to detect the annotation.
 * @param newContent - The new content to the annotation.
 */
export const appendToLog = async (
  path: string,
  connector: string,
  newContent: string
) => {
  const file = getFile(path)
  if (!file) return

  const fileContent = await dc.app.vault.read(file)
  const trimmedConnector = connector.trim()
  const trimmedNewContent = newContent.trim()

  const eol = fileContent.includes('\r\n') ? '\r\n' : '\n'
  const lines = fileContent.split(/\r?\n/)

  // Matches a list item line starting with the connector:
  // - [[Hello]] World
  // - [title](url) World
  const connectorRe = escapeRegExp(trimmedConnector)
  const listItemRe = new RegExp(`^\\s*[-*+]\\s*${connectorRe}(?:\\s|$)`)

  const index = lines.findIndex((line) => listItemRe.test(line))

  if (index !== -1) {
    const existingLine = lines[index].trimEnd()
    const suffix = trimmedNewContent ? `. ${trimmedNewContent}` : ''
    lines[index] = `${existingLine}${suffix}`
    await dc.app.vault.modify(file, lines.join(eol))
    return
  }

  // If we didn't find the list item, create it at the end of the file.
  const newLine = trimmedNewContent
    ? `- ${trimmedConnector} ${trimmedNewContent}`
    : `- ${trimmedConnector}`

  const updatedContent =
    fileContent.trimEnd().length === 0
      ? newLine
      : `${fileContent.trimEnd()}${eol}${newLine}`

  await dc.app.vault.modify(file, updatedContent)
}

/** Windows-forbidden, macOS `:` (legacy/cross-sync), control chars, Obsidian wikilink hazards. */
export const INVALID_FILENAME_CHARS = /[<>:"/\\|?*#^[\]{}]|\p{Cc}/u

/** Windows: names cannot end with a space or period. */
export const INVALID_FILENAME_TRAILING = /[.\s]$/

/** Windows reserved device names (case-insensitive, optional extension). */
export const INVALID_FILENAME_RESERVED =
  /^(con|prn|aux|nul|com[1-9]|lpt[1-9])($|\.)/i

export const isInvalidFilename = (name: string): boolean => {
  const trimmed = name.trim()
  if (trimmed === '') return false
  return (
    INVALID_FILENAME_CHARS.test(name) ||
    INVALID_FILENAME_TRAILING.test(name) ||
    INVALID_FILENAME_RESERVED.test(trimmed)
  )
}
