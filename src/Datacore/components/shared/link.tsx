import type { Link as LinkType } from '@blacksmithgu/datacore'

type Props = {
  path: string
  children: string
}

export const Link = ({ path, children }: Props) => {
  // Create a link to the file
  const link: LinkType = dc
    .fileLink(`${path}.md`)
    .withDisplay(children)

  return <dc.Link link={link} />
}
