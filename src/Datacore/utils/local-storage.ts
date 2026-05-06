import type { Dispatch, StateUpdater } from 'preact/hooks'
import { useEffect, useState } from 'preact/hooks'

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

export const useLocalState = <T>(key: LSKey, defaultValue: T) => {
  const [state, setState] = useState<T>(defaultValue)

  useEffect(() => {
    const value = getLS(key)
    if (value) {
      setState(value as T)
    }
  }, [key])

  const setLocalState: Dispatch<StateUpdater<T>> = (nextState) => {
    setState((prevState) => {
      const resolvedState =
        typeof nextState === 'function'
          ? (nextState as (prev: T) => T)(prevState)
          : nextState

      setLS(key, String(resolvedState))
      return resolvedState
    })
  }

  return [state, setLocalState] as const
}
