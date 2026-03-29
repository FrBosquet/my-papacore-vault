import type { MarkdownPage } from '@blacksmithgu/datacore'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { ChallengeItem } from './card'

export const ChallengesWidget = () => {
  const ongoingChallenges = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Challenges")
    AND start AND !end
  `)

  return (
    <Card>
      <Link path="Challenges/Hub.md" icon="trophy">
        Challenges
      </Link>
      <section className="grid xl:grid-cols-3 gap-3">
        {ongoingChallenges.map((challenge) => (
          <ChallengeItem key={challenge.$id} challenge={challenge} />
        ))}
      </section>
    </Card>
  )
}
