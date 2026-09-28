import type { MarkdownListItem } from '@blacksmithgu/datacore'
import {
  capitalizeFirstLetter,
  cleanLogText,
  getProgress,
  getValueFromLogText,
} from './logs'

describe('logs utils', () => {
  describe('cleanLogText', () => {
    it('should clean the log text', () => {
      const text = '[[Hello]] World'
      const cleanedText = cleanLogText(text)
      expect(cleanedText).toBe('World')
    })

    it('should clean the log text with multiple links in the start', () => {
      const text = '[[Hello]] [[World]] this is Fran'
      const cleanedText = cleanLogText(text)
      expect(cleanedText).toBe('This is Fran')
    })

    it('should be able to handle links with annotations', () => {
      const text = '[Hello](https://example.com/hello) World'
      const cleanedText = cleanLogText(text)
      expect(cleanedText).toBe('World')
    })

    it('should be able to handle links with annotations and multiple links in the start', () => {
      const text =
        '[[Hello]] [[World]] [this is Fran](https://example.com/hello) World'
      const cleanedText = cleanLogText(text)
      expect(cleanedText).toBe('World')
    })

    it('should capitalize the first letter of the remaining text', () => {
      const text = '[[Hello]] hello world'
      const cleanedText = cleanLogText(text)
      expect(cleanedText).toBe('Hello world')
    })

    it('should be able to target a file and stop removing text once found', () => {
      const text = '[[Hello]] [[World]] from Fran'
      const cleanedText = cleanLogText(text, 'Hello')
      expect(cleanedText).toBe('[[World]] from Fran')
    })

    it('should be able to target a file and stop removing text once found using a markdown link', () => {
      const text = '[Hello](https://example.com/hello) [[World]] from Fran'
      const cleanedText = cleanLogText(text, 'https://example.com/hello')
      expect(cleanedText).toBe('[[World]] from Fran')
    })

    it('should be able to target a file and stop removing text once found using a markdown link', () => {
      const text =
        '[[Projects/Obsidian Brain.md|Obsidian Brain]] [[World]] from Fran'
      const cleanedText = cleanLogText(text, 'Projects/Obsidian Brain.md')
      expect(cleanedText).toBe('[[World]] from Fran')
    })
  })

  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of the text', () => {
      const text = 'hello world'
      const capitalizedText = capitalizeFirstLetter(text)
      expect(capitalizedText).toBe('Hello world')
    })
  })

  describe('getValueFromLogText', () => {
    it('should get the value from the log text', () => {
      const text = '123 Hello world'
      const value = getValueFromLogText(text)
      expect(value).toBe(123)
    })
  })

  describe('getProgress', () => {
    const log = (text: string): MarkdownListItem =>
      ({ $text: text }) as MarkdownListItem

    it('should use the current log value when it is parseable', () => {
      const logs = [log('12 Kept going'), log('10 Started working on this')]

      expect(
        getProgress({ logs, target: '100 pages', progressFn: 'value' })
      ).toEqual(
        expect.objectContaining({
          value: 12,
          prevValue: 10,
          delta: 2,
        })
      )
    })

    it('should fall back to the last parseable value when today has none', () => {
      const logs = [
        log('I worked on this'),
        log('10 Started working on this'),
      ]

      expect(
        getProgress({ logs, target: '100 pages', progressFn: 'value' })
      ).toEqual(
        expect.objectContaining({
          value: 10,
          prevValue: 10,
          delta: 0,
        })
      )
    })

    it('should skip multiple unparseable logs until a value is found', () => {
      const logs = [
        log('Still thinking'),
        log('No number here either'),
        log('10 Started working on this'),
        log('5 Earlier'),
      ]

      expect(
        getProgress({ logs, target: '100 pages', progressFn: 'value' })
      ).toEqual(
        expect.objectContaining({
          value: 10,
          prevValue: 10,
          delta: 0,
        })
      )
    })

    it('should skip unparseable logs when resolving the previous value', () => {
      const logs = [
        log('12 Kept going'),
        log('Still thinking'),
        log('10 Started working on this'),
      ]

      expect(
        getProgress({ logs, target: '100 pages', progressFn: 'value' })
      ).toEqual(
        expect.objectContaining({
          value: 12,
          prevValue: 10,
          delta: 2,
        })
      )
    })

    it('should use the latest older value when a specific log has none', () => {
      const logs = [
        log('20 Latest'),
        log('No number today'),
        log('10 Started working on this'),
      ]

      expect(
        getProgress({
          logs,
          log: logs[1],
          target: '100 pages',
          progressFn: 'value',
        })
      ).toEqual(
        expect.objectContaining({
          value: 10,
          prevValue: 10,
          delta: 0,
        })
      )
    })

    it('should return 0 when no log has a parseable value', () => {
      const logs = [log('I worked on this'), log('Still thinking')]

      expect(
        getProgress({ logs, target: '100 pages', progressFn: 'value' })
      ).toEqual(
        expect.objectContaining({
          value: 0,
          prevValue: 0,
          delta: 0,
        })
      )
    })
  })
})
