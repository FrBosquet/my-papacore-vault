import { parseMetacriticScore } from './metacritic-score'

describe('parseMetacriticScore', () => {
  it('parses a metascore', () => {
    expect(parseMetacriticScore('92')).toBe('92')
    expect(parseMetacriticScore('100')).toBe('100')
    expect(parseMetacriticScore('0')).toBe('0')
  })

  it('returns undefined for placeholders and out-of-range values', () => {
    expect(parseMetacriticScore('tbd')).toBeUndefined()
    expect(parseMetacriticScore('101')).toBeUndefined()
    expect(parseMetacriticScore('8.7')).toBeUndefined()
    expect(parseMetacriticScore(null)).toBeUndefined()
  })
})
