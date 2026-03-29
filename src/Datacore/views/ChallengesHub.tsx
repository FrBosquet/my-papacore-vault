import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { ChallengeItem } from '../components/challenges/card'
import { Card } from '../components/shared/card'
import { Scroller } from '../components/shared/scroller'

export const ChallengesHub = () => {
  const ongoingChallenges = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Challenges")
    AND start AND !end
  `)

  const futureChallenges = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Challenges")
    AND !start AND !end
  `)

  const completedChallenges = dc
    .useQuery<MarkdownPage>(`
    @page
    AND path("Challenges")
    AND end
  `)
    .sort(
      (a, b) =>
        ((b.value('end') as DateTime)?.toMillis() ?? 0) -
        ((a.value('end') as DateTime)?.toMillis() ?? 0)
    )

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <header className="flex items-center gap-2 text-green-400">
          <dc.Icon icon="trophy" />
          <h3 className="font-semibold uppercase tracking-wide p-0 m-0">
            Ongoing Challenges ({ongoingChallenges.length})
          </h3>
        </header>
        <section className="grid xl:grid-cols-3 gap-2">
          {ongoingChallenges.map((challenge) => (
            <ChallengeItem key={challenge.$id} challenge={challenge} />
          ))}
        </section>
      </Card>
      <Card>
        <header className="flex items-center gap-2 text-green-400">
          <dc.Icon icon="trophy" />
          <h3 className="font-semibold uppercase tracking-wide p-0 m-0">
            Future Challenges ({futureChallenges.length})
          </h3>
        </header>
        <section className="grid xl:grid-cols-3 gap-2">
          {futureChallenges.map((challenge) => (
            <ChallengeItem key={challenge.$id} challenge={challenge} />
          ))}
        </section>
      </Card>
      <Card>
        <header className="flex items-center gap-2 text-green-400">
          <dc.Icon icon="trophy" />
          <h3 className="font-semibold uppercase tracking-wide p-0 m-0">
            Completed Challenges ({completedChallenges.length})
          </h3>
        </header>
        <Scroller
          className="h-[300px]"
          wrapperClassName="grid xl:grid-cols-3 gap-2"
        >
          {completedChallenges.map((challenge) => (
            <ChallengeItem key={challenge.$id} challenge={challenge} />
          ))}
        </Scroller>
      </Card>
    </div>
  )
}
