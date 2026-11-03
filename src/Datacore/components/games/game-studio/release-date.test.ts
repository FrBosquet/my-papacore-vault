import {
  asReleaseDateInput,
  releaseDateFromUnix,
  yearFromReleaseDate,
} from './release-date'

describe('releaseDateFromUnix', () => {
  it('uses the UTC calendar day', () => {
    expect(releaseDateFromUnix(1516867200)).toBe('2018-01-25')
    expect(releaseDateFromUnix(1207724400)).toBe('2008-04-09')
  })

  it('returns an empty string when the timestamp is missing', () => {
    expect(releaseDateFromUnix(undefined)).toBe('')
    expect(releaseDateFromUnix(0)).toBe('')
    expect(releaseDateFromUnix(null)).toBe('')
  })
})

describe('yearFromReleaseDate', () => {
  it('reads the year from a full date', () => {
    expect(yearFromReleaseDate('2015-05-19')).toBe('2015')
  })

  it('returns an empty string for a bare year', () => {
    expect(yearFromReleaseDate('2015')).toBe('')
    expect(yearFromReleaseDate(undefined)).toBe('')
  })
})

describe('asReleaseDateInput', () => {
  it('keeps a date string', () => {
    expect(asReleaseDateInput('2015-05-19')).toBe('2015-05-19')
  })

  it('reads a Datacore date', () => {
    expect(asReleaseDateInput({ toISODate: () => '2015-05-19' })).toBe(
      '2015-05-19'
    )
  })

  it('returns an empty string for anything else', () => {
    expect(asReleaseDateInput(undefined)).toBe('')
    expect(asReleaseDateInput(2015)).toBe('')
  })
})
