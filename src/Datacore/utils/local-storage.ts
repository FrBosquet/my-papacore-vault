import type { Dispatch, StateUpdater } from 'preact/hooks'
import { useState } from 'preact/hooks'

type LSKey =
  | 'papacore:task:last-week-tag'
  | 'papacore:task:last-project-path'
  | 'papacore:task:widget:is-kanban'

export const getLS = (key: LSKey) => {
  return localStorage.getItem(key) ?? undefined
}

export const setLS = (key: LSKey, value: string) => {
  localStorage.setItem(key, value)
}

const readLocalState = <T>(key: LSKey, defaultValue: T): T => {
  const raw = getLS(key)
  if (raw === undefined) return defaultValue

  try {
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

export const useLocalState = <T>(key: LSKey, defaultValue: T) => {
  const [state, setState] = useState<T>(() => readLocalState(key, defaultValue))

  const setLocalState: Dispatch<StateUpdater<T>> = (nextState) => {
    setState((prevState) => {
      const resolvedState =
        typeof nextState === 'function'
          ? (nextState as (prev: T) => T)(prevState)
          : nextState

      setLS(key, JSON.stringify(resolvedState))
      return resolvedState
    })
  }

  return [state, setLocalState] as const
}
