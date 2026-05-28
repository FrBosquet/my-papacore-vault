export const useDebouncedState = <T,>(rawState: T) => {
  const [state, setState] = dc.useState<T>(rawState)
  const debouncer = dc.useRef<NodeJS.Timeout | null>(null)
  dc.useEffect(() => {
    if (debouncer.current) {
      clearTimeout(debouncer.current)
    }

    debouncer.current = setTimeout(() => {
      setState(rawState)
    }, 600)
  }, [rawState])
  return state
}