type LSKey = 'papacore:task:last-week-tag' | 'papacore:task:last-project-path'

export const getLS = (key: LSKey) => {
  return localStorage.getItem(key) ?? undefined
}

export const setLS = (key: LSKey, value: string) => {
  localStorage.setItem(key, value)
}
