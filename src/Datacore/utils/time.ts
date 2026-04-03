import type { DateTime } from 'luxon'

export const getTodayString = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export const getTodayDatetime = () => {
  const str = getTodayString()
  return fromStringToDatetime(str)
}

export const fromStringToDatetime = (dateString: string) => {
  const parts = dateString.split('-')

  if (parts.length !== 3)
    throw new Error(`Not an ISO date string ${dateString}`)
  if (parts[0].length !== 4)
    throw new Error(`Not a valid year ${parts[0]} in ${dateString}`)
  if (parts[1].length !== 2)
    throw new Error(`Not a valid month ${parts[1]} in ${dateString}`)
  if (parts[2].length !== 2)
    throw new Error(`Not a valid day ${parts[2]} in ${dateString}`)

  const date = dc.luxon.DateTime.fromISO(dateString, { zone: 'local' })

  if (!date.isValid) throw new Error(`Invalid date ${dateString}`)

  return date
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
