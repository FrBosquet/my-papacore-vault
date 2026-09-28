import { sanitizeFilename } from './files'

describe('sanitizeFilename', () => {
  it('replaces colons and collapses the extra space', () => {
    expect(sanitizeFilename('Drova: Forsaken Kin')).toBe('Drova Forsaken Kin')
  })

  it('keeps apostrophes and spaces', () => {
    expect(sanitizeFilename("No Man's Sky")).toBe("No Man's Sky")
  })

  it('strips characters that cannot go in a file name', () => {
    expect(sanitizeFilename('A<B>C"D/E\\F|G?H*I#J^K[L]M{N}')).toBe(
      'A B C D E F G H I J K L M N'
    )
  })

  it('drops a trailing period', () => {
    expect(sanitizeFilename('Game.')).toBe('Game')
  })

  it('returns an empty string when nothing usable remains', () => {
    expect(sanitizeFilename('::')).toBe('')
  })
})
