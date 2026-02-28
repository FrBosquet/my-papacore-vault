import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { getFrontmatterValue, setPageFrontmatterValue } from './markdown'
import { getTodayDatetime } from './time'

export const STATUSES = ['backlog', 'this-week', 'ongoing', 'done', 'archive']
export const STATUS_ORDER: Array<(typeof STATUSES)[number]> = [
  'backlog',
  'archive',
  'done',
  'this-week',
  'ongoing',
]

export type WeekTag = `${number}-W${string}`

const weekRegex = /^\d{4}-W\d{2}$/

export const getWeekFromTags = (page: MarkdownPage): WeekTag | undefined => {
  // Week is a taf that looks like 2025-W03
  // We first want check if the page has tags
  const tags = getFrontmatterValue<string[]>(page, 'tags')
  if (!tags) return undefined

  // We need a regex that matches dddd-Wdd format
  const match = tags.find((tag) => tag.match(weekRegex))

  // If no match, return undefined
  if (!match) return undefined

  // If match, return an object {year: number, week: number }
  return match as WeekTag
}

export const getYearFromTag = (tag: WeekTag) => {
  return parseInt(tag.split('-W')[0], 10)
}

export const getWeekFromTag = (tag: WeekTag) => {
  return parseInt(tag.split('-W')[1], 10)
}

export const getFileNameFromTag = (tag: WeekTag) => {
  const year = getYearFromTag(tag)
  const week = getWeekFromTag(tag)
  return `${year} Week ${week}`
}

export const getTagFromFileName = (fileName: string): WeekTag => {
  // fileName is like 2025 Week 12.md
  // We need to extract the year and week
  const regex = /(\d{4}) Week (\d{1,2})/
  const match = fileName.match(regex)
  if (!match) {
    throw new Error(`Not a valid file name ${fileName}`)
  }
  const year = match[1]
  const week = match[2]
  return `${Number(year)}-W${week.padStart(2, '0')}`
}

export const getPathFromTag = (tag: WeekTag) => {
  const year = getYearFromTag(tag)
  return `Weeks/${year}/${getFileNameFromTag(tag)}.md`
}

export const isWeekTag = (tag: string) => {
  return weekRegex.test(tag)
}

export const getTaskWeekTagFromDate = (date: DateTime): WeekTag => {
  return `${date.year}-W${date.weekNumber.toString().padStart(2, '0')}`
}

export const getDateFromWeekTag = (tag: WeekTag): DateTime => {
  if (!isWeekTag(tag)) {
    throw new Error(`Not a week tag ${tag}`)
  }

  const year = parseInt(tag.split('-W')[0], 10)
  const week = parseInt(tag.split('-W')[1], 10)

  return getDateFromYearAndWeek(year, week)
}

export const getDateFromYearAndWeek = (
  weekYear: number,
  weekNumber: number
) => {
  let date = dc.luxon.DateTime.fromObject({
    weekYear,
    weekNumber,
  })

  if (date.year < weekYear) {
    date = date.set({ year: weekYear, month: 1, day: 1 })
  } else if (date.year > weekYear) {
    date = date.set({ year: weekYear, month: 12, day: 31 })
  }

  return date
}

export const getLastDayOfWeektag = (weekTag: WeekTag): DateTime => {
  const date = getDateFromWeekTag(weekTag)
  return date.endOf('week')
}

// Project management ops
export const removeFromWeek = (task: MarkdownPage) => {
  setPageFrontmatterValue(task, 'status', 'backlog')
  setPageFrontmatterValue(task, 'done', undefined)
  setPageFrontmatterValue(task, 'due', undefined)
  setPageFrontmatterValue(task, 'tags', (current) => {
    return (current as string[])?.filter((tag) => !isWeekTag(tag)) ?? []
  })
}

export const addToWeek = (task: MarkdownPage, weekTag: WeekTag) => {
  setPageFrontmatterValue(task, 'status', 'this-week')
  setPageFrontmatterValue(task, 'done', undefined)
  setPageFrontmatterValue(task, 'due', getLastDayOfWeektag(weekTag))
  setPageFrontmatterValue(task, 'tags', (current) => {
    const cleanTags =
      (current as string[])?.filter((tag) => !isWeekTag(tag)) ?? []
    return [...cleanTags, weekTag]
  })
}

export const moveToOngoing = (task: MarkdownPage) => {
  setPageFrontmatterValue(task, 'status', 'ongoing')
  setPageFrontmatterValue(task, 'done', undefined)
}

export const moveToDone = (task: MarkdownPage) => {
  setPageFrontmatterValue(task, 'status', 'done')
  setPageFrontmatterValue(task, 'done', getTodayDatetime())
}

export const moveToArchive = (task: MarkdownPage) => {
  setPageFrontmatterValue(task, 'status', 'archive')
}

export const taskSorter = (a: MarkdownPage, b: MarkdownPage) => {
  const aStatus = getFrontmatterValue<string>(a, 'status')
  const bStatus = getFrontmatterValue<string>(b, 'status')

  const aIndex = aStatus ? STATUS_ORDER.indexOf(aStatus) : -1
  const bIndex = bStatus ? STATUS_ORDER.indexOf(bStatus) : -1

  if (aIndex !== bIndex) {
    return bIndex - aIndex
  }

  return b.$mtime.toMillis() - a.$mtime.toMillis()
}

export const getTasksByMoment = (tasks: MarkdownPage[], reference: WeekTag) => {
  return tasks.reduce(
    (acc, task) => {
      const week = getWeekFromTags(task)
      const isDone = getFrontmatterValue(task, 'done')

      if (!week) {
        if (isDone) {
          acc.past.push(task)
        } else {
          acc.nonWeek.push(task)
        }

        return acc
      }

      if (week < reference) {
        if (isDone) {
          acc.past.push(task)
        } else {
          acc.carryOver.push(task)
        }
        return acc
      }

      if (week === reference) {
        acc.present.push(task)
        return acc
      }

      acc.future.push(task)
      return acc
    },
    {
      nonWeek: [] as MarkdownPage[],
      past: [] as MarkdownPage[],
      carryOver: [] as MarkdownPage[],
      present: [] as MarkdownPage[],
      future: [] as MarkdownPage[],
    }
  )
}
