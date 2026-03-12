import type { MarkdownListItem } from '@blacksmithgu/datacore'

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Markdown link pattern: [text](url) - link text and url cannot contain ] or ) respectively */
const MARKDOWN_LINK_RE = /^\[[^\]]*\]\([^)]*\)/

/**
 * Strips leading Obsidian wiki-links `[[...]]` and Markdown links `[text](url)`
 * from the start of the string and returns the remaining text trimmed.
 */
export const cleanLogText = (text: string): string => {
  let result = text.trimStart()
  while (result.length > 0) {
    if (result.startsWith('[[')) {
      const end = result.indexOf(']]')
      if (end === -1) break
      result = result.slice(end + 2).trimStart()
    } else if (result.startsWith('[') && MARKDOWN_LINK_RE.test(result)) {
      const match = result.match(MARKDOWN_LINK_RE)
      if (match) result = result.slice(match[0].length).trimStart()
      else break
    } else {
      break
    }
  }
  return capitalizeFirstLetter(result)
}

export const getValueFromLogText = (text?: string) => {
  if (!text) return undefined
  // value is a number that appears at the very beginning of the text
  const value = text.match(/^\d+/)?.[0]
  return value ? parseInt(value, 10) : undefined
}

export const getPrevValue = (logs: MarkdownListItem[], index: number) => {
  return index < logs.length
    ? getValueFromLogText(cleanLogText(logs[index + 1]?.$text ?? ''))
    : 0
}
