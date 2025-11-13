import type { Literal } from '@blacksmithgu/datacore'
import { useEffect, useState } from 'preact/hooks'
import { getPage } from '../utils/files'
import { setPageFrontmatterValue } from '../utils/markdown'

export const useFrontmatterState = <T extends Literal>(key: string) => {
  const thisPage = dc.useCurrentFile()

  return useFileFrontmatterState<T>(thisPage.$path, key)
}

export const useFileFrontmatterState = <T extends Literal>(
  path: string,
  key: string
) => {
  const [isLoading, setIsLoading] = useState(false)
  const page = getPage(path)

  const frontmatter = page?.$frontmatter

  const currentValue = frontmatter?.[key.toLowerCase()]?.value as T

  const setValue = async (
    value: T | undefined | ((currentValue: T | undefined) => T | undefined)
  ) => {
    setIsLoading(true)

    if (!page) {
      return
    }

    setPageFrontmatterValue(page, key, value)
  }

  useEffect(() => {
    setIsLoading(false)
  }, [currentValue])

  return [currentValue, setValue, isLoading] as const
}
