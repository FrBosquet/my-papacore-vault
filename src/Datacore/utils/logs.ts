import type { MarkdownListItem } from '@blacksmithgu/datacore'

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Markdown link pattern: [text](url) - captures url in group 1 */
const MARKDOWN_LINK_RE = /^\[[^\]]*\]\(([^)]*)\)/
const BRACKET_LINK_RE = /^\[\[([^\]]+)\]\]/

/**
 * Strips leading Obsidian wiki-links `[[...]]` and Markdown links `[text](url)`
 * from the start of the string and returns the remaining text trimmed.
 */
export const cleanLogText = (text: string, targetPath?: string): string => {
  const result = text.trimStart()
  const isBracketLink = BRACKET_LINK_RE.test(result)
  const match = result.match(BRACKET_LINK_RE) ?? result.match(MARKDOWN_LINK_RE)

  if (match) {
    const trimmedText = result.slice(match[0].length).trimStart()
    const matchedPath = isBracketLink ? match[1].split('|')[0] : match[1]

    if (matchedPath === targetPath) {
      return capitalizeFirstLetter(trimmedText)
    }

    return cleanLogText(trimmedText, targetPath)
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
