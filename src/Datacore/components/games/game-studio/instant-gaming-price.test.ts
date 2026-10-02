import { parseInstantGamingPrice } from './instant-gaming-price'

describe('parseInstantGamingPrice', () => {
  it('parses a euro price with a dot decimal', () => {
    expect(parseInstantGamingPrice('56.99\u00a0€')).toBe('56.99')
  })

  it('parses a comma decimal', () => {
    expect(parseInstantGamingPrice('14,99 €')).toBe('14.99')
  })

  it('drops a trailing zero-cent price', () => {
    expect(parseInstantGamingPrice('70 €')).toBe('70')
  })

  it('uses the last separator as the decimal mark', () => {
    expect(parseInstantGamingPrice('1.234,56 €')).toBe('1234.56')
    expect(parseInstantGamingPrice('1,234.56 €')).toBe('1234.56')
  })

  it('returns undefined when there is no number', () => {
    expect(parseInstantGamingPrice('--')).toBeUndefined()
    expect(parseInstantGamingPrice(null)).toBeUndefined()
  })
})
