import { DateTime } from 'luxon'
import {
  getDateFromWeekTag,
  getDateFromYearAndWeek,
  getLastDayOfWeektag,
  getTaskWeekTagFromDate,
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
  })
})
