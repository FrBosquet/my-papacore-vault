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

const sameIsoWeek = (a: DateTime, b: DateTime) =>
  a.weekYear === b.weekYear && a.weekNumber === b.weekNumber

const startOfIsoWeek = (datetime: DateTime) =>
  datetime.setZone('local').set({ weekday: 1 }).startOf('day')

const isoWeekKey = (datetime: DateTime) => {
  const week = startOfIsoWeek(datetime)
  return `${week.weekYear}-W${week.weekNumber.toString().padStart(2, '0')}`
}

const calendarMonthsBetween = (later: DateTime, earlier: DateTime) =>
  (later.year - earlier.year) * 12 + (later.month - earlier.month)

const monthKey = (datetime: DateTime) =>
  `${datetime.year}-${datetime.month.toString().padStart(2, '0')}`

export type DoneRecency = {
  key: string
  label: string
}

/**
 * Bucket a completion date for past-task headings.
 * Recent weeks stay separate. Older dates collapse into months, then years.
 */
export const getDoneRecency = (
  done: DateTime,
  now: DateTime = getTodayDatetime()
): DoneRecency => {
  const doneLocal = done.setZone('local')
  const today = now.setZone('local')
  const weeks = Math.round(
    startOfIsoWeek(today).diff(startOfIsoWeek(doneLocal), 'weeks').weeks
  )

  if (!Number.isFinite(weeks) || weeks <= 0) {
    return { key: `week:${isoWeekKey(today)}`, label: 'Esta semana' }
  }

  if (weeks === 1) {
    return {
      key: `week:${isoWeekKey(doneLocal)}`,
      label: 'La semana pasada',
    }
  }

  if (weeks <= 3) {
    return {
      key: `week:${isoWeekKey(doneLocal)}`,
      label: `Hace ${weeks} semanas`,
    }
  }

  const months = calendarMonthsBetween(today, doneLocal)

  if (months <= 0) {
    return {
      key: `week:${isoWeekKey(doneLocal)}`,
      label: `Hace ${weeks} semanas`,
    }
  }

  if (months === 1) {
    return { key: `month:${monthKey(doneLocal)}`, label: 'Hace un mes' }
  }

  if (months < 12) {
    return {
      key: `month:${monthKey(doneLocal)}`,
      label: `Hace ${months} meses`,
    }
  }

  const years = Math.floor(months / 12)
  return {
    key: `years:${years}`,
    label: years === 1 ? 'Hace un año' : `Hace ${years} años`,
  }
}

/**
 * Relative label for when a task was last updated.
 * Buckets get coarser as the date gets older: hoy, ayer, esta semana, este mes, and so on.
 */
export const getContextualUpdateLabel = (
  updated: DateTime,
  now: DateTime = getTodayDatetime()
) => {
  const updatedLocal = updated.setZone('local')
  const today = now.setZone('local').startOf('day')
  const updatedDay = updatedLocal.startOf('day')

  if (updatedDay >= today) return 'Actualizado hoy'

  if (updatedDay.hasSame(today.minus({ days: 1 }), 'day')) {
    return 'Actualizado ayer'
  }

  if (sameIsoWeek(updatedLocal, today)) return 'Actualizado esta semana'

  if (sameIsoWeek(updatedLocal, today.minus({ weeks: 1 }))) {
    return 'Actualizado la semana pasada'
  }

  if (updatedLocal.hasSame(today, 'month')) return 'Actualizado este mes'

  if (updatedLocal.hasSame(today.minus({ months: 1 }), 'month')) {
    return 'Actualizado el mes pasado'
  }

  const months = Math.floor(today.diff(updatedDay, 'months').months)
  if (months < 12) return `Actualizado hace ${months} meses`

  const years = Math.floor(today.diff(updatedDay, 'years').years)
  if (years <= 1) return 'Actualizado el año pasado'

  return `Actualizado hace ${years} años`
}
