import { getWeekColorClass } from './week-color'

describe('getWeekColorClass', () => {
  it('picks a color from the week number modulo 8', () => {
    expect(getWeekColorClass(1)).toBe('bg-orange-400 text-orange-950')
    expect(getWeekColorClass(8)).toBe('bg-rose-400 text-rose-950')
    expect(getWeekColorClass(9)).toBe('bg-orange-400 text-orange-950')
    expect(getWeekColorClass(46)).toBe('bg-violet-400 text-violet-950')
  })
})
