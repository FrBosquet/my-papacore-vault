import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { getDailyNoteDatetime } from './files'

export type Streak = {
  days: number
  type: 'streak' | 'hiatus' | 'never'
}

export const calculateStreak = (
  notes: MarkdownPage[],
  referenceDate: DateTime
): Streak => {
  if (notes.length === 0) {
    return { days: 0, type: 'never' }
  }

  const isoReferenceDate = referenceDate.toISODate() as string
  // clone the notes array to avoid mutating the original array
  const dates = [...notes]
    // sort by date descending
    .sort((a, b) => b.$path.localeCompare(a.$path))
    // filter out notes that are after the reference date
    .filter(
      (note) =>
        note.$path
          .replace('.md', '')
          .replace('Journal/', '')
          .localeCompare(isoReferenceDate) <= 0
    )
    .map((note) => getDailyNoteDatetime(note.$path))

  const daysSinceFirstNote = referenceDate.diff(dates[0]).as('days')

  if (referenceDate.diff(dates[0]).as('days') > 0) {
    return {
      days: daysSinceFirstNote,
      type: 'hiatus',
    }
  }

  if (dates.length === 1) {
    return { days: 1, type: 'streak' }
  }

  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1]
    const current = dates[i]
    const diff = prev.diff(current).as('days')

    if (diff !== 1) {
      return { days: i, type: 'streak' }
    }
  }

  return { days: dates.length, type: 'streak' }
}
