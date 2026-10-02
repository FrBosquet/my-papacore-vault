import { parseHltbHours } from './hltb-hours'

describe('parseHltbHours', () => {
  it('parses whole hours', () => {
    expect(parseHltbHours('14 Hours')).toBe('14')
  })

  it('parses the half-hour glyph', () => {
    expect(parseHltbHours('14½ Hours')).toBe('14.5')
  })

  it('converts minutes into hours', () => {
    expect(parseHltbHours('40 Mins')).toBe('0.7')
  })

  it('returns undefined when there is no number', () => {
    expect(parseHltbHours('--')).toBeUndefined()
    expect(parseHltbHours(null)).toBeUndefined()
  })
})
