import { useRef, useState } from "preact/hooks"

export const useDebouncedState = <T>(defaultValue: T, debounce = 175) => {
  const [state, setState] = useState(defaultValue)
  const timeout = useRef<NodeJS.Timeout | null>(null)

  const handleSet = (value: T) => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    timeout.current = setTimeout(() => {
      setState(value)
    }, debounce)
  }

  return [state, handleSet] as const
}