import type { DateTime } from 'luxon'

export const getPage = (path: string) => {
  return dc.api.page(path)
}

export const cleanPath = (path: string) => {
  // if path ends with md, return path
  if (path.endsWith('.md')) return path

  // if path ends with .base, return path
  if (path.endsWith('.base')) return path

  // otherwise, return path + .base
  return path + '.md'
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
  const date = trimExtension(path).split('/').pop() as string

  return dc.coerce.date(date) as DateTime
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
  templatePath: string
) => {
  const templateContent = await getTemplateContent(templatePath)

  if (templateContent !== null) {
    try {
      await dc.app.vault.create(targetPath, templateContent)

      return targetPath
    } catch (error) {
      throw error
    }
  }
}

export const writeAtTheEndOfTheFile = async (path: string, content: string) => {
  try {
    const file = dc.app.vault.getFileByPath(path)
    if (file) {
      const fileContent = await dc.app.vault.read(file)
      const newContent = fileContent + '\n' + content
      await dc.app.vault.modify(file, newContent)
    }
  } catch (error) {
    throw error
  }
}
