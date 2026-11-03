/**
 * SteamGridDB stores a release as a unix timestamp. The calendar day is the
 * UTC day of that timestamp (the samples sit in the morning UTC, so local
 * timezones would shift some of them to the previous day).
 */
export const releaseDateFromUnix = (seconds?: number | null): string => {
  if (!seconds || seconds <= 0) return ''
  const date = new Date(seconds * 1000)
  if (Number.isNaN(date.getTime())) return ''

  const year = String(date.getUTCFullYear())
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const yearFromReleaseDate = (released?: string): string => {
  return released?.match(/^(\d{4})-\d{2}-\d{2}/)?.[1] ?? ''
}

/** Value for `<input type="date">`. Datacore returns YAML dates as DateTime. */
export const asReleaseDateInput = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? ''
  }

  if (
    value &&
    typeof value === 'object' &&
    'toISODate' in value &&
    typeof value.toISODate === 'function'
  ) {
    const iso = value.toISODate()
    return typeof iso === 'string'
      ? (iso.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? '')
      : ''
  }

  return ''
}
