import type { MarkdownListItem, MarkdownPage } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import type { IconName } from '../../../icons'
import { getDailyNoteDatetime } from '../../utils/files'
import { calculateStreak, getProgress, type ProgressFn } from '../../utils/logs'
import {
  getFrontmatterValue,
  setPageFrontmatterValue,
} from '../../utils/markdown'
import {
  getDailyNotePath,
  getOffsetWithToday,
  getSemanticDateOffset,
  getTodayDatetime,
} from '../../utils/time'
import { LogAnnotationForm } from '../logs/log-annotation-form'
import { ContextMenu } from '../shared/context'
import { Dialog, useDialog } from '../shared/dialog'
import { Link } from '../shared/link'
import { ProgressBar } from '../shared/progress-bar'

const IconMap: Record<string, IconName> = {
  reading: 'book-a',
  health: 'trophy',
  learning: 'glasses',
}

const getIcon = (category: string) => {
  if (category in IconMap) {
    return IconMap[category]
  }
  return 'trophy'
}

interface Props {
  challenge: MarkdownPage
}

export const ChallengeItem = ({ challenge }: Props) => {
  const { ref: dialogRef, open: openAnnotateDialog, close } = useDialog()

  const path = challenge.$path

  const handleComplete = () => {
    setPageFrontmatterValue(challenge, 'status', 'done')
    setPageFrontmatterValue(challenge, 'end', getTodayDatetime())
  }

  const rawLogs = dc.useQuery<MarkdownListItem>(
    `@list-item AND connected([[${path}]])`
  )
  const { logs, lastLog, type, days, count } = calculateStreak(
    rawLogs,
    getTodayDatetime()
  )

  const progressFn = challenge.value('progressFn') as ProgressFn
  const start = getFrontmatterValue<DateTime>(challenge, 'start')
  const category = challenge.value('category') as string
  const target = challenge.value('target') as string
  const icon = getIcon(category)

  const daysPassed = start ? Math.floor(-start.diffNow().as('days')) : 0
  const lastLogDatetime = lastLog && getDailyNoteDatetime(lastLog?.$file)
  const offsetWithToday = lastLogDatetime && getOffsetWithToday(lastLogDatetime)
  const semanticOffset = lastLogDatetime
    ? getSemanticDateOffset(lastLogDatetime, true).toLowerCase()
    : ''

  const isStreak = type === 'streak'

  const { progress, value, targetValue, targetUnits, delta } = getProgress({
    logs,
    target,
    progressFn,
  })

  return (
    <>
      <Dialog
        dialogRef={dialogRef}
        triggerProps={{ className: 'hidden' }}
        className="max-w-[2000px]"
      >
        <LogAnnotationForm targetPage={challenge} onSubmit={() => close()} />
      </Dialog>
      <article
        data-type={offsetWithToday === 0 ? 'today' : type}
        className={`
        grid grid-cols-[1fr_auto] shadow-2xl
        bg-radial from-primary-900/50 to-primary-900 bg-no-repeat bg-size-[200%_100%]
        data-[type='hiatus']:from-red-400/30
        data-[type='today']:from-green-400/30
      `}
        key={challenge.$id}
      >
        {/* main */}
        <section className="flex flex-col gap-2 p-2">
          <Link path={path} icon={icon} size="lg" className="min-w-0">
            <span className="min-w-0 flex-1 truncate">{challenge.$name}</span>
          </Link>
          <div className="flex text-primary-300 text-sm gap-1">
            <dc.Icon icon="notebook" />
            {lastLogDatetime ? (
              <p className="flex-1 flex gap-1">
                Last annotated
                <Link
                  path={getDailyNotePath(lastLogDatetime)}
                  variant="plain"
                  className="text-contrast-300"
                >
                  {semanticOffset}
                </Link>
              </p>
            ) : (
              <p className="flex-1">Never annotated</p>
            )}
          </div>
          <div className="flex text-primary-300 text-sm gap-1">
            <dc.Icon icon="circle-dashed" />(<strong>+{delta}</strong>)
            <p>
              {value}/{targetValue} {targetUnits}
            </p>
          </div>
        </section>

        {/* streak */}
        <article
          data-type={type}
          className={`
            flex flex-col items-center justify-center p-2 
            data-[type='today']:text-green-400
            data-[type='streak']:text-green-400
            data-[type='hiatus']:text-red-400
            `}
        >
          <strong className="text-5xl text-current">{days}</strong>
          <p className="text-2xs uppercase font-semibold">
            {isStreak ? 'streak days' : 'days missed'}
          </p>
        </article>

        <article className="col-span-2 p-2">
          <ProgressBar progress={progress} />
        </article>

        {/* footer */}
        <footer className="grid grid-cols-3 col-span-2 p-2 text-primary-300">
          <span className="flex items-center gap-1 text-xs">
            <dc.Icon icon="calendar-plus" /> {daysPassed} days
          </span>
          <span className="flex items-center gap-1 text-xs ">
            <dc.Icon icon="notebook-pen" /> {count} logs
          </span>
          <ContextMenu
            className="justify-self-end"
            variant="plain"
            options={[
              {
                label: 'Annotate',
                icon: 'notebook-pen',
                action: () => {
                  openAnnotateDialog()
                },
              },
              {
                type: 'divider',
              },
              {
                label: 'Complete',
                icon: 'trophy',
                action: handleComplete,
              },
            ]}
          >
            <dc.Icon icon="ellipsis-vertical" />
          </ContextMenu>
        </footer>
      </article>
    </>
  )
}
