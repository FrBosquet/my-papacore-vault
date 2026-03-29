import type { DateTime } from 'luxon'

export const getTodayString = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export const getTodayDatetime = () => {
  {
    const str = getTodayString()
    return dc.api.coerce.date(str) as DateTime
  }
}

export const fromStringToDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-')
  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10)
  )
}

export const getWeekTag = (datetime: DateTime): `${number}-W${string}` => {
  return `${datetime.year}-W${datetime.weekNumber.toString().padStart(2, '0')}`
}

export const getDailyNotePath = (targetDate: DateTime) => {
  const localYear = targetDate.year
  const monthNumber = targetDate.month
  const localDay = targetDate.day

  const path = `Journal/${localYear}-${monthNumber.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}.md`

  return path
}

export const getOffsetWithToday = (datetime: DateTime) => {
  const today = getTodayDatetime()

  return today.diff(datetime, 'days').days
}

export const getSemanticDateOffset = (datetime: DateTime, long = false) => {
  const offset = getOffsetWithToday(datetime)
  const isToday = offset === 0
  const isYesterday = offset === 1

  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'
  if (offset < 8) return `${offset} ${long ? 'days ago' : 'DA'}`
  return datetime.toFormat('MMM dd')
}
