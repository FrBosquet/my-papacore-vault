import type { MarkdownPage } from "@blacksmithgu/datacore"
import { getFrontmatterValue } from "../../utils/markdown"

export const sortByLastModified = (a: MarkdownPage, b: MarkdownPage) => {
  return b.$mtime.millisecond - a.$mtime.millisecond
}

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export type YearString = `${number}`

export type YearsAndMonths = {
  [year: YearString]: {
    [month: number]: MarkdownPage[]
  },
  unlisted: MarkdownPage[]
}

export const buildAlbumHierarchy = (albums: MarkdownPage[]) => {
  return albums.reduce<YearsAndMonths>((acc, album) => {
    const listening = getFrontmatterValue<string>(album, 'listening')

    if (!listening) {
      acc.unlisted.push(album)
      return acc
    }

    const year = listening.split(' ')[0] as YearString
    const monthStr = listening.split(' ')[1]
    const month = months.indexOf(monthStr)

    if (!acc[year]) {
      acc[year] = {}
    }

    if (!acc[year][month]) {
      acc[year][month] = []
    }

    acc[year][month].push(album)

    return acc
  }, {
    unlisted: [],
  })
}