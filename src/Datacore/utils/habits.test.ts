import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { calculateStreak } from './habits'

describe('habits utils', () => {
  describe('calculateStreak', () => {
    const notes = [
      {
        $path: 'Journal/2026-01-01.md',
      },
      {
        $path: 'Journal/2026-01-03.md',
      },
      {
        $path: 'Journal/2026-01-02.md',
      },
    ] as MarkdownPage[]

    it('should exist', () => {
      expect(calculateStreak).toBeDefined()
    })

    it('should calculate a streak of 3 days', () => {
      const referenceDate = dc.coerce.date('2026-01-03') as DateTime

      const streak = calculateStreak(notes, referenceDate)
      expect(streak).toHaveProperty('type', 'streak')
      expect(streak).toHaveProperty('days', 3)
    })

    it('should calculate a streak of 2 day', () => {
      const referenceDate = dc.coerce.date('2026-01-02') as DateTime

      const streak = calculateStreak(notes, referenceDate)
      expect(streak).toHaveProperty('type', 'streak')
      expect(streak).toHaveProperty('days', 2)
    })

    it('should calculate a streak of 1 day', () => {
      const referenceDate = dc.coerce.date('2026-01-01') as DateTime

      const streak = calculateStreak(notes, referenceDate)
      expect(streak).toHaveProperty('type', 'streak')
      expect(streak).toHaveProperty('days', 1)
    })

    it('should calculate an hiatus', () => {
      const referenceDate = dc.coerce.date('2026-01-07') as DateTime

      const streak = calculateStreak(notes, referenceDate)
      expect(streak).toHaveProperty('type', 'hiatus')
      expect(streak).toHaveProperty('days', 4)
    })

    it('should calculate a never streak', () => {
      const referenceDate = dc.coerce.date('2026-01-05') as DateTime

      const streak = calculateStreak([], referenceDate)
      expect(streak).toHaveProperty('type', 'never')
      expect(streak).toHaveProperty('days', 0)
    })

    it('should calculate a streak of one with only one note', () => {
      const referenceDate = dc.coerce.date('2026-01-01') as DateTime

      const streak = calculateStreak([notes[0]], referenceDate)
      expect(streak).toHaveProperty('type', 'streak')
      expect(streak).toHaveProperty('days', 1)
    })

    it('should calculate a streak of one with mixed list of notes', () => {
      const referenceDate = dc.coerce.date('2026-01-03') as DateTime

      const streak = calculateStreak([notes[0], notes[1]], referenceDate)
      expect(streak).toHaveProperty('type', 'streak')
      expect(streak).toHaveProperty('days', 1)
    })
  })
})
