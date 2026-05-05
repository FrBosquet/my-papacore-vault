import type { TFile } from 'obsidian'
import { getPage } from './files'
import { setPageFrontmatterValue } from './markdown'

/** Public Templater core API used from outside template execution. */
type TemplaterCore = {
  create_new_note_from_template: (
    template: TFile | string,
    folder?: string,
    filename?: string,
    open_new_note?: boolean
  ) => Promise<TFile | undefined>
}

const getTemplaterCore = (): TemplaterCore => {
  // @ts-expect-error Obsidian plugin instance shape is not in Datacore types
  const plugins = dc.app.plugins as {
    getPlugin: (id: string) => { templater: TemplaterCore } | null
  }
  const instance = plugins.getPlugin('templater-obsidian')
  if (!instance) {
    throw new Error('Templater plugin not found')
  }
  return instance.templater
}

/**
 * Same resolution as Templater's tp.file.find_tfile (sync).
 * @see https://github.com/SilentVoid13/Templater/blob/master/src/core/functions/internal_functions/file/InternalModuleFile.ts
 */
const findTFile = (filename: string): TFile | null => {
  const path = filename.replace(/\\/g, '/')
  const dest = dc.app.metadataCache.getFirstLinkpathDest(path, '')
  if (!dest) {
    return null
  }
  return dest as TFile
}

export const createNewGame = async (title: string) => {
  const template = findTFile('game')
  if (!template) {
    throw new Error('Game template not found')
  }
  const templater = getTemplaterCore()
  const file = await templater.create_new_note_from_template(
    template,
    'Gaming/Games',
    title,
    false
  )
  return file
}

export const createNewTask = async (title: string) => {
  const template = findTFile('task')
  if (!template) {
    throw new Error('Task template not found')
  }
  const templater = getTemplaterCore()
  const file = await templater.create_new_note_from_template(
    template,
    'Kanban/Tasks',
    title,
    false
  )
  return file
}

export const createNewReadLater = async (
  title: string,
  url: string,
  why: string
) => {
  const template = findTFile('later')
  if (!template) {
    throw new Error('Read later template not found')
  }
  const templater = getTemplaterCore()
  const file = await templater.create_new_note_from_template(
    template,
    'Readlist',
    title,
    false
  )
  if (file) {
    const page = getPage(file.path)

    if (page) {
      await setPageFrontmatterValue(page, 'url', url)
      await setPageFrontmatterValue(page, 'why', why)
    }
  }
  return file
}
