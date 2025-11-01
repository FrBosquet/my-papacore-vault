import type { DateTime } from "luxon"

export const cleanPath = (path: string) => {
  // if path ends with md, return path
  if (path.endsWith('.md')) return path

  // if path ends with .base, return path
  if (path.endsWith('.base')) return path

  // otherwise, return path + .base
  return path + '.md'
}

export const trimExtension = (path: string) => {
  // if path ends with md, return path without md
  if (path.endsWith('.md')) return path.slice(0, -3)

  // if path ends with .base, return path without .base
  if (path.endsWith('.base')) return path.slice(0, -5)

  // otherwise, return path
  return path
}

/**
 * Receives a daily note path in the format `Journal/YYYY-MM-DD.md`
 * and returns a coerced datetime
 * 
 * @param path 
 */
export const getDailyNoteDatetime = (path: string) => {
  const date = trimExtension(path).split('/').pop()

  return dc.coerce.date(date) as DateTime
}
