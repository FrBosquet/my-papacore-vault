import type { MarkdownPage } from "@blacksmithgu/datacore"

export const useEnvVar = (key: string) => {
  const [envs] = dc.useQuery<MarkdownPage>(`@page and $path = "envs.md"`)
 
  return envs.value(key) as string
}