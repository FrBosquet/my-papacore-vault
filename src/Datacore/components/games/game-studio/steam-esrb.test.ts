import { esrbFromAppDetails } from './steam-esrb'

const details = (rating: string) => ({
  '1174180': {
    success: true,
    data: { ratings: { esrb: { rating } } },
  },
})

describe('esrbFromAppDetails', () => {
  it('maps Steam rating codes onto ESRB labels', () => {
    expect(esrbFromAppDetails(details('m'), '1174180')).toBe('M')
    expect(esrbFromAppDetails(details('e10'), '1174180')).toBe('E10+')
    expect(esrbFromAppDetails(details('t'), '1174180')).toBe('T')
  })

  it('returns undefined when Steam has no ESRB block', () => {
    expect(
      esrbFromAppDetails({ '620': { success: true, data: {} } }, '620')
    ).toBeUndefined()
    expect(
      esrbFromAppDetails({ '1174180': { success: false } }, '1174180')
    ).toBeUndefined()
    expect(esrbFromAppDetails(null, '1174180')).toBeUndefined()
  })
})
