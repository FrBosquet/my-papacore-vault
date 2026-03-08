import {
  capitalizeFirstLetter,
  cleanLogText,
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
})
