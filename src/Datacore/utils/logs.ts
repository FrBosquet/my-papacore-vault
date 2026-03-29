import type { MarkdownListItem } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { getDailyNoteDatetime } from './files'
import { getTodayDatetime } from './time'

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

type StreakType = 'never' | 'hiatus' | 'streak'
type Streak = {
  days: number
  type: StreakType
  count: number
  logs: MarkdownListItem[]
  lastLog: MarkdownListItem | undefined
}

/**
 * Calculates the streak of logs for a given reference date.
 * Mostly used for challenges
 *
 * @param logs - The logs to calculate the streak for.
 * @param referenceDate - The reference date to calculate the streak for.
 */
export const calculateStreak = (
  logs: MarkdownListItem[],
  referenceDate: DateTime
): Streak => {
  const count = logs.length

  if (count === 0) {
    return { days: 0, type: 'never', count, logs, lastLog: undefined }
  }

  const isoReferenceDate = referenceDate.toISODate() as string

  const sortedLogs = [...logs].sort((a, b) => b.$file.localeCompare(a.$file))
  const dates = [...sortedLogs]
    .filter(
      (log) =>
        log.$file
          .replace('.md', '')
          .replace('Journal/', '')
          .localeCompare(isoReferenceDate) <= 0
    )
    .map((log) => getDailyNoteDatetime(log.$file))

  const lastLog = sortedLogs[0]
  const daysSinceFirstLog = referenceDate.diff(dates[0]).as('days')

  if (daysSinceFirstLog > 1) {
    return {
      count,
      type: 'hiatus',
      days: daysSinceFirstLog,
      logs: sortedLogs,
      lastLog,
    }
  }

  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1]
    const current = dates[i]
    const diff = prev.diff(current).as('days')

    if (diff !== 1) {
      return { days: i, type: 'streak', count, logs: sortedLogs, lastLog }
    }
  }

  return { count, days: count, type: 'streak', logs: sortedLogs, lastLog }
}

export type ProgressFn = 'days' | 'count' | 'value'

export const getProgress = ({
  logs,
  log = logs[0],
  target,
  progressFn,
}: {
  target: string
  progressFn: ProgressFn
  log?: MarkdownListItem
  logs: MarkdownListItem[]
}) => {
  const index = logs.indexOf(log)
  const [rawTargetValue, ...rawTargetUnits] = target.split(' ')
  const targetValue = rawTargetValue ? parseInt(rawTargetValue) : 0
  const targetUnits = rawTargetUnits.join(' ')

  const prevValue = getProgressValue(logs, index + 1, progressFn)
  const value = getProgressValue(logs, index, progressFn)
  const delta = value - prevValue
  const progressStr = `${value} / ${targetValue} ${targetUnits}`
  const progress = value / targetValue

  return {
    value,
    progressStr,
    progress,
    targetValue,
    targetUnits,
    delta,
    prevValue,
  }
}

const getProgressValue = (
  logs: MarkdownListItem[],
  index: number,
  progressFn: ProgressFn
) => {
  if (index < 0) return 0
  if (index >= logs.length)
    return getProgressValue(logs, logs.length - 1, progressFn)

  const log = logs[index]
  const text = log.$text ?? ''
  const cleanedText = cleanLogText(text ?? '')

  if (progressFn === 'days') {
    const today = getTodayDatetime()
    const firstLog = logs[0]
    const firstDayDatetime = getDailyNoteDatetime(firstLog.$file)
    const daysSinceStart = today.diff(firstDayDatetime).days
    return daysSinceStart
  }

  if (progressFn === 'count') {
    return logs.length - index
  }

  if (progressFn === 'value') {
    return getValueFromLogText(cleanedText) ?? 0
  }

  throw new Error(`Invalid progress function: ${progressFn}`)
}
