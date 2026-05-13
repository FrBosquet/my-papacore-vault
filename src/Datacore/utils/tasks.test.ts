import { DateTime } from 'luxon'
import {
  getDateFromWeekTag,
  getDateFromYearAndWeek,
  getFileNameFromTag,
  getLastDayOfWeektag,
  getPathFromTag,
  getTagFromFileName,
  getTaskWeekTagFromDate,
  isCarryoverTag,
  isWeekTag,
} from './tasks'

describe('tasks utils', () => {
  describe('Week tags', () => {
    it('should create a Datetime from week and year', () => {
      const date = getDateFromYearAndWeek(2025, 5)
      expect(date).toEqual(
        DateTime.fromObject({
          weekYear: 2025,
          weekNumber: 5,
        })
      )
    })

    it('should stay in the given year when creating a Datetime from week and year', () => {
      const date = getDateFromYearAndWeek(2025, 1)
      expect(date.year).toBe(2025)
    })

    it('should detect a week tag', () => {
      expect(isWeekTag('2025-W01')).toBe(true)
      expect(isWeekTag('2025-2026')).toBe(false)
    })

    it('should detect a carryover tag', () => {
      expect(isCarryoverTag('carryover-2025-W01')).toBe(true)
      expect(isCarryoverTag('2025-W01')).toBe(false)
    })

    it('should not detect a week tag in a carryover tag', () => {
      expect(isWeekTag('carryover-2025-W01')).toBe(false)
    })

    it('should transform a date to a week tag', () => {
      const date = DateTime.fromObject({
        weekYear: 2025,
        weekNumber: 5,
      })
      const tag = getTaskWeekTagFromDate(date)
      expect(tag).toBe('2025-W05')
    })

    it('should transform a week tag to a date', () => {
      const date = getDateFromWeekTag('2026-W08')
      expect(date).toEqual(
        DateTime.fromObject({
          weekYear: 2026,
          weekNumber: 8,
        })
      )
    })

    it('should allow to go forward or backward in weeks', () => {
      const date = getDateFromWeekTag('2026-W08').plus({ weeks: 1 })
      expect(getTaskWeekTagFromDate(date)).toBe('2026-W09')
    })

    it('should return the last day of a week tag', () => {
      const date = getLastDayOfWeektag('2026-W08')
      expect(date).toHaveProperty('weekYear', 2026)
      expect(date).toHaveProperty('weekNumber', 8)
      expect(date).toHaveProperty('weekday', 7)
    })

    it('should compose the filename from the tag', () => {
      const fileName = getFileNameFromTag('2026-W08')
      expect(fileName).toBe('2026 Week 8')
    })

    it('should compose the file path from the tag', () => {
      const path = getPathFromTag('2026-W08')
      expect(path).toBe('Weeks/2026/2026 Week 8.md')
    })

    it('should compose the tag from the file name', () => {
      const tag = getTagFromFileName('2026 Week 8.md')
      expect(tag).toBe('2026-W08')
    })
  })
})
